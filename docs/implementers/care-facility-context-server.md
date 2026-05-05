# Implementing A Care Facility Context Server

Status: Draft, pre-1.0

This guide explains how to implement a server for the first CCP Care Facility Context Profile slice.

The current schema-backed slice is intentionally narrow. It covers boarding preparation for one pet, one facility, one boarding service, and one service window. It does not cover medication administration, facility observation writeback, emergency override access, payment authority, full wellness timelines, diagnosis history, treatment history, billing records, identity document copies, or sitter and in-home care workflows.

The canonical contract is JSON Schema. OpenAPI and MCP are adapter surfaces that carry the same request and response objects.

## Canonical Inputs And Outputs

A Care Facility Context server accepts:

- `CareFacilityContextRequest`
- An authenticated requester identity from the transport or host environment.
- Access to active permission grants for the requested pet.
- Source context records from the implementation's own system.
- Booking or service records that can verify facility identity and service-window boundaries.

A Care Facility Context server returns:

- `CareFacilityContextResponse`
- An `authorization_decision` in every response.
- A minimized `care_facility_context` for allowed or partial responses.
- `care_facility_context: null` for denied responses.
- Machine-readable `omissions` explaining data that was not returned.

Canonical schemas:

- `schemas/care-facility-context-request.schema.json`
- `schemas/care-facility-context-response.schema.json`
- `schemas/permission-grant.schema.json`
- `schemas/ccp-core.schema.json`

## Evaluation Order

Implementations should evaluate requests in this order:

1. Parse the transport request.
2. Authenticate the requester through the transport or host environment.
3. Validate the request body against `CareFacilityContextRequest`.
4. Resolve the requested pet.
5. Resolve the active grant. The first boarding-preparation slice requires `grant_id`.
6. Verify that the grant applies to the requester, pet, facility, service, purpose, scopes, and current time.
7. Verify the requested `service_window` against the authorized service or booking window.
8. Load only source context needed for the requested scopes.
9. Apply visibility precedence and Care Facility Context Profile exclusions.
10. Apply freshness and provenance requirements.
11. Build the `authorization_decision`.
12. Build the minimized `care_facility_context`, if any data may be returned.
13. Add machine-readable omissions for requested or relevant data that was not returned.
14. Validate the response against `CareFacilityContextResponse` before returning it.

## Authorization Rules

Scopes are necessary but not sufficient.

A server should authorize each returned field using:

- Authenticated requester actor.
- Requested pet.
- Requested facility.
- Requested service id and service type.
- Requested service window.
- Declared purpose.
- Active grant status.
- Grant expiration and revocation.
- Requested scopes.
- Field visibility classes.
- Field sensitivity.
- Source freshness.

For the first Care Facility Context slice, the request purpose must be `boarding_preparation` and the service type must be `boarding`. The request facility must match the facility authorized by the active grant and service record. The requested service window must be within the authorized window for the boarding service.

Returned care-facility fields must include `facility_shareable`. `owner_visible`, `caregiver_visible`, and `vet_shareable` do not imply care-facility access. `facility_shareable` does not override `staff_only` or `restricted_sensitive`.

## Facility And Service-Window Boundaries

Facility identity and service-window checks are load-bearing authorization checks.

Use `facility_mismatch` when:

- The authenticated requester is not the facility authorized by the active grant.
- The request `facility_id` does not match the grant or service record.
- The request tries to use a valid grant for a different facility.

Use `service_window_inactive` when:

- The requested service window is outside the grant's authorized window.
- The service has ended and the request is not within an explicitly allowed post-service access period.
- The service id is valid but not active for boarding-preparation access at evaluation time.

For either denial, return a CCP response envelope with `status: denied`, `authorization_decision.decision: denied`, `care_facility_context: null`, and at least one omission. Do not return partial operational context in facility-mismatch or inactive-window denials.

## Response Status

Use `ok` when:

- The request is authorized.
- All requested and relevant facility-shareable context is returned.
- `authorization_decision.decision` is `allowed`.
- `care_facility_context` is non-null.
- `omissions` is empty.

Use `partial` when:

- Some facility-shareable context can be returned.
- Some requested or relevant context is omitted.
- `authorization_decision.decision` is `partial`.
- `care_facility_context` is non-null.
- `omissions` has at least one item.

Use `denied` when:

- No care-facility context may be returned.
- `authorization_decision.decision` is `denied`.
- `care_facility_context` is `null`.
- `omissions` has at least one item.

Protocol-level denials should return a CCP response envelope. Transport-level failures, such as malformed JSON or missing transport authentication, may use ordinary transport errors.

## Building The Authorization Decision

Every response must include `authorization_decision`.

Populate:

- `decision`: `allowed`, `partial`, or `denied`.
- `evaluated_at`: timestamp of evaluation.
- `requester_actor_id`: authenticated requester.
- `pet_id`: requested pet.
- `purpose`: requested purpose.
- `grant_id`: grant used.
- `applied_scopes`: scopes that were allowed and used.
- `denied_scopes`: requested or relevant scopes that were not allowed.
- `reasons`: concise human-readable explanation.

Do not put private source records, raw staff notes, raw wellness timelines, diagnosis history, billing data, identity document data, payment authority details, household data, or sensitive facility operations data in `reasons`.

## Building Returned Context

Returned context should be minimized to the current request, facility, service, and service window.

Every returned context field must use the field envelope shape:

```json
{
  "value": "Use calm greetings and allow a short decompression period after drop-off.",
  "visibility": ["owner_visible", "facility_shareable"],
  "provenance": {
    "source_type": "owner_entered",
    "source_actor_id": "actor_owner_001",
    "source_system": "example-ccp-server",
    "recorded_at": "2026-04-24T15:00:00Z",
    "source_record_ref": "example://pets/pet_luna_001/care/handling_summary"
  }
}
```

For generated fields or summaries, provenance must include:

- `source_system`
- `derived_from`

For source facts, provenance should include source actor or system, recorded timestamp, freshness metadata when available, and source record reference when safe to expose.

The returned bundle should not include object families that are outside the first slice. For example, do not add `wellness_timeline`, `diagnosis_history`, `payment_authority`, or identity-document fields to make an integration easier. Those are profile changes and need separate scopes, purpose rules, visibility behavior, examples, and conformance fixtures.

## Omissions

Use omissions to explain data that was requested or relevant but not returned.

Common omission reasons:

- `scope_missing`
- `purpose_not_allowed`
- `visibility_restricted`
- `grant_expired`
- `grant_revoked`
- `source_stale`
- `not_available`
- `summary_only`
- `facility_mismatch`
- `service_window_inactive`

Use `purpose_not_allowed` for data that is outside `boarding_preparation`, even if a facility might operationally want it.

Use `visibility_restricted` for source fields marked `staff_only`, `restricted_sensitive`, or not explicitly `facility_shareable`.

Use `scope_missing` when the requested or relevant field has a defined scope but the active grant does not include it.

Omissions belong in the response envelope. Nested context objects should not carry their own `omissions` array.

Omission details should be useful but not revealing. Do not disclose restricted source content in omission text. The Care Facility (boarding-preparation) response schema does not apply the `SensitiveKeywordPattern` overlay to `reasons` or omission `detail` strings, because legitimate boarding-preparation omission text references excluded categories by name (for example, "Diagnosis history is not needed for boarding preparation." or "Identity-check requirements may be returned, but identity document copies are not returned."). This is a known schema-enforcement gap: the implementer is the load-bearing control. A category label that explains *why* a field was withheld is fine; an actual record value smuggled alongside the label is not. Concretely:

- Acceptable: `"Diagnosis history is not needed for boarding preparation."`
- Acceptable: `"Identity-check requirements may be returned, but identity document copies are not returned."`
- Not acceptable: `"Diagnosis: 2025-08-04 stage-2 mast cell tumor; treatment ongoing."` — this embeds restricted source content under cover of a category label.

## First-Slice Exclusions

Do not return these in the first Care Facility Context slice:

- Medication administration instructions or medication history.
- Facility observation writeback records.
- Incident writeback records.
- Emergency override access.
- Payment authority or billing records.
- Full wellness timelines.
- Diagnosis history.
- Treatment history.
- Identity document copies or document numbers.
- Unrelated owner or household data.
- Internal staff notes.
- Sensitive facility operations data.
- Raw source observations marked `agent_summary_only`.

If a future slice explicitly allows more sensitive data, it should define separate scopes, purpose rules, visibility behavior, examples, and conformance fixtures.

## Public Examples

Positive boarding-preparation flow:

- `examples/permission-grant-care-facility-boarding-preparation.json`
- `examples/care-facility-boarding-preparation-request.json`
- `examples/care-facility-boarding-preparation-response.json`

Valid denied responses:

- `examples/care-facility-facility-mismatch-denied-response.json`
- `examples/care-facility-expired-service-window-denied-response.json`

Schema-invalid fixtures:

- `tests/conformance/fixtures/invalid/care-facility-denied-response-with-context.json`
- `tests/conformance/fixtures/invalid/care-facility-field-missing-provenance.json`
- `tests/conformance/fixtures/invalid/care-facility-pickup-authorization-identity-document-leak.json`
- `tests/conformance/fixtures/invalid/care-facility-boarding-response-with-wellness-timeline.json`
- `tests/conformance/fixtures/invalid/care-facility-boarding-response-with-diagnosis-history.json`
- `tests/conformance/fixtures/invalid/care-facility-pickup-authorization-payment-authority-leak.json`

## Transport Adapters

OpenAPI adapter:

- `openapi/care-facility-context.openapi.json`
- `POST /care-facility-context`
- Optional `GET /permission-grants/{grant_id}`, requiring `pet.permission_grants.read`

MCP adapter:

- `mcp/care-facility-context.tools.json`
- `ccp_care_facility_context_request`
- `ccp_permission_grant_get`, requiring `pet.permission_grants.read`

Both adapters must preserve the canonical request, response, authorization decision, visibility, provenance, facility boundary, service-window boundary, and omission semantics.

## Implementation Checklist

- Validate incoming request bodies against canonical schemas.
- Authenticate requester identity outside the CCP payload.
- Check requester, pet, facility, service, service window, purpose, grant, scopes, expiry, revocation, visibility, and freshness.
- Return only facility-shareable context allowed by the grant, purpose, facility, and service window.
- Attach provenance and visibility to every returned field.
- Include an authorization decision in every response.
- Include omissions for omitted requested or relevant fields.
- Return `care_facility_context: null` for denied responses.
- Validate outgoing responses against canonical schemas.
- Run `npm test` before claiming compatibility.

## Conformance

Install dependencies and run:

```sh
npm install
npm test
```

The test suite validates positive examples, valid denied examples, invalid fixtures, the OpenAPI adapter, and the MCP tool sketches.
