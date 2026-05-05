# Implementing A Care Facility Pickup Verification Server

Status: Draft, pre-1.0

This guide explains how to implement a server for the CCP Care Facility Pickup Verification slice.

The slice is intentionally narrow. It answers a single operational question: may the requested pickup actor pick up the requested pet from the requested facility within the requested service window? It does not return feeding instructions, medication details, billing data, payment authority, household context, identity-document copies or numbers, full Care Network data, wellness timelines, diagnosis history, treatment history, vaccination records, internal staff notes, or unrelated contacts. Broader release context belongs to other slices or future profiles.

The canonical contract is JSON Schema. OpenAPI and MCP are adapter surfaces that carry the same request and response objects.

## Canonical Inputs And Outputs

A Care Facility Pickup Verification server accepts:

- `CareFacilityPickupVerificationRequest`
- An authenticated requester identity from the transport or host environment.
- Access to active permission grants for the requested pet.
- Source records that can verify pickup-actor identity, facility identity, and service-window boundaries.

A Care Facility Pickup Verification server returns:

- `CareFacilityPickupVerificationResponse`
- An `authorization_decision` in every response.
- A minimized `pickup_verification_context` for allowed or partial responses.
- `pickup_verification_context: null` for denied responses.
- Machine-readable `omissions` explaining data that was not returned.

Canonical schemas:

- `schemas/care-facility-pickup-verification-request.schema.json`
- `schemas/care-facility-pickup-verification-response.schema.json`
- `schemas/permission-grant.schema.json`
- `schemas/ccp-core.schema.json`

## Evaluation Order

Implementations should evaluate requests in this order:

1. Parse the transport request.
2. Authenticate the requester through the transport or host environment.
3. Validate the request body against `CareFacilityPickupVerificationRequest`.
4. Resolve the requested pet.
5. Resolve the active grant. The pickup-verification slice requires `grant_id`.
6. Verify that the grant applies to the requester, pet, facility, service, service window, purpose, scopes, and current time.
7. Verify the requested `service_window` against the authorized service or booking window.
8. Resolve the requested `pickup_actor_id` and verify it against active pickup authorizations for the pet.
9. Apply visibility precedence and Pickup Verification slice exclusions.
10. Apply freshness and provenance requirements.
11. Build the `authorization_decision`.
12. Build the minimized `pickup_verification_context`, if any data may be returned.
13. Add machine-readable omissions for requested or relevant data that was not returned.
14. Validate the response against `CareFacilityPickupVerificationResponse` before returning it.

## Authorization Rules

Scopes are necessary but not sufficient.

A server should authorize each returned field using:

- Authenticated requester actor.
- Requested pet.
- Requested facility.
- Requested service id and service type.
- Requested service window.
- Requested pickup actor.
- Declared purpose.
- Active grant status.
- Grant expiration and revocation.
- Requested scope.
- Field visibility classes.
- Field sensitivity.
- Source freshness.

The pickup-verification slice authorizes a single scope: `pet.pickup_authorization.read`. The response schema constrains `authorization_decision.applied_scopes` and `authorization_decision.denied_scopes` to that one literal — surfacing any other scope string in the decision will fail validation. The request purpose must be `pickup_verification` and the service type must match the authorized service. The request facility must match the facility authorized by the active grant and service record. The requested service window must be within the authorized window for the service.

Returned pickup-verification fields must include `facility_shareable`. `owner_visible`, `caregiver_visible`, and `vet_shareable` do not imply pickup-verification access. `facility_shareable` does not override `staff_only` or `restricted_sensitive`. Care-network classes (`care_network_visible`, `contact_shareable`, `action_authorization_visible`) do not imply pickup-verification access either; cross-profile exposure requires a separate authorized care-network response.

## Facility, Service-Window, And Pickup-Actor Boundaries

Facility identity, service-window, and pickup-actor checks are load-bearing authorization checks.

Use `facility_mismatch` when:

- The authenticated requester is not the facility authorized by the active grant.
- The request `facility_id` does not match the grant or service record.
- The request tries to use a valid grant for a different facility.

Use `service_window_inactive` when:

- The requested service window is outside the grant's authorized window.
- The service has ended and the request is not within an explicitly allowed post-service access period.
- The service id is valid but not active for pickup-verification access at evaluation time.

Use `not_available` or `purpose_not_allowed` when the `pickup_actor_id` is unknown to the system or has no relationship to the requested pet. Do not return partial release context to probe whether a name is known.

For any of these denials, return a CCP response envelope with `status: denied`, `authorization_decision.decision: denied`, `pickup_verification_context: null`, and at least one omission. Do not return partial operational context in facility-mismatch, inactive-window, or unknown-actor denials.

## Response Status

Use `ok` when:

- The request is authorized.
- All requested and relevant facility-shareable context is returned.
- `authorization_decision.decision` is `allowed`.
- `pickup_verification_context` is non-null.
- `pickup_authorization.authorization_status.value` is `authorized`.
- `pickup_authorization.release_allowed.value` is `true`.
- `omissions` is empty.

Use `partial` when:

- Some pickup-verification context can be returned, but at least one check is unresolved or denies release.
- `authorization_decision.decision` is `partial`.
- `pickup_verification_context` is non-null.
- `pickup_authorization.authorization_status.value` is **not** `authorized`.
- `release_allowed` is omitted or set to `false`. A partial response must not claim that release is allowed.
- `omissions` has at least one item.

Use `denied` when:

- No pickup-verification context may be returned.
- `authorization_decision.decision` is `denied`.
- `pickup_verification_context` is `null`.
- `omissions` has at least one item.

The `ok`/`partial`/`denied` rules are enforced by `CareFacilityPickupVerificationResponse` and the conformance runner. A partial response that asserts `authorization_status: authorized` is a schema-invalid response, not just a policy slip.

Protocol-level denials should return a CCP response envelope. Transport-level failures, such as malformed JSON or missing transport authentication, may use ordinary transport errors.

## Building The Authorization Decision

Every response must include `authorization_decision`.

Populate:

- `decision`: `allowed`, `partial`, or `denied`.
- `evaluated_at`: timestamp of evaluation.
- `requester_actor_id`: authenticated requester.
- `pet_id`: requested pet.
- `purpose`: `pickup_verification`.
- `grant_id`: grant used.
- `applied_scopes`: scopes that were allowed and used.
- `denied_scopes`: requested or relevant scopes that were not allowed.
- `reasons`: concise human-readable explanation.

Do not put private source records, identity-document data, payment authority details, household data, raw staff notes, raw care-network notes, or any restricted source content in `reasons`. The pickup-verification response schema applies the `SensitiveKeywordPattern` overlay to both `reasons` strings and omission `detail` strings, so banned-keyword leaks reject at the schema layer.

## Building Returned Context

Returned context should be minimized to the current request, facility, service, service window, and pickup actor.

Every returned context field must use the field envelope shape:

```json
{
  "value": "authorized",
  "visibility": ["facility_shareable"],
  "provenance": {
    "source_type": "owner_entered",
    "source_actor_id": "actor_owner_001",
    "source_system": "example-ccp-server",
    "recorded_at": "2026-04-24T15:00:00Z",
    "source_record_ref": "example://pets/pet_luna_001/pickup_authorizations/pickup_auth_001"
  }
}
```

For generated fields or summaries, provenance must include:

- `source_system`
- `derived_from`

For source facts, provenance should include source actor or system, recorded timestamp, freshness metadata when available, and source record reference when safe to expose.

The returned bundle should not include object families that are outside this slice. Do not add boarding-preparation fields, care-network contact channels, action authorizations, payment authority, identity-document data, or wellness timelines to make an integration easier. Those are profile or slice changes and need separate scopes, purpose rules, visibility behavior, examples, and conformance fixtures.

## Pickup Actor Channel Constraints

`PickupActor.contact_channel.value` is constrained to a fixed enum (`app_message`, `in_app`, `sms`, `phone`, `email`, `secure_message`, `facility_counter`). Do not return free-form contact strings; expose only the channel kind that the facility may use to confirm pickup.

## Release Constraints

`release_constraints` is an array of structured `ReleaseConstraint` items with a `constraint_type` enum (`specific_window_only`, `specific_location_only`, `owner_confirmation_required`, `photo_or_id_check_required`, `code_required`, `do_not_release`, `staff_manager_review_required`). Use these to communicate the operational gate that an authorized release still depends on. A `summary` field may carry a human-readable note, but it must not embed restricted source content.

When `release_constraints` includes `owner_confirmation_required`, `photo_or_id_check_required`, `code_required`, `do_not_release`, or `staff_manager_review_required`, the response should usually be `partial` or `denied` with corresponding omissions, not `ok` — the constraint is the reason release is not yet allowed.

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

Use `purpose_not_allowed` for data that is outside `pickup_verification`, even if a facility might operationally want it (for example, broader care history, feeding instructions, or care-network contacts).

Use `visibility_restricted` for source fields marked `staff_only`, `restricted_sensitive`, or not explicitly `facility_shareable`.

Use `scope_missing` when the requested or relevant field has a defined scope but the active grant does not include it.

Omissions belong in the response envelope. Nested context objects should not carry their own `omissions` array.

Omission `detail` strings should be useful but not revealing. The pickup-verification response applies the `SensitiveKeywordPattern` overlay — banned keywords (billing, payment, household, medical, diagnosis, treatment, staff-only, staff-note, relationship-dispute, custody, identity-document) are rejected by the schema. Implementers must also avoid embedding any restricted source content in detail strings.

## Slice Exclusions

Do not return these in the Care Facility Pickup Verification slice:

- Feeding instructions or feeding history.
- Medication administration instructions or medication history.
- Billing or payment data, including payment authority.
- Identity document copies and identity document numbers.
- Household context.
- Broader care history, wellness timelines, diagnosis history, or treatment history.
- Vaccination records (request these separately for another purpose if needed).
- Unrelated emergency contacts.
- Unrelated Care Network contacts, action authorizations, or revocation records.
- Internal staff notes or internal facility notes from other providers.
- Raw behavioral incident records.
- Free-text denial details that reveal restricted source content.

If a future slice explicitly allows more sensitive data, it should define separate scopes, purpose rules, visibility behavior, examples, and conformance fixtures.

## Public Examples

Positive pickup-verification flow:

- `examples/permission-grant-care-facility-pickup-verification.json`
- `examples/care-facility-pickup-verification-request.json`
- `examples/care-facility-pickup-verification-response.json`

Partial flow (owner confirmation required):

- `examples/care-facility-pickup-verification-owner-confirmation-response.json`

Valid denied responses:

- `examples/care-facility-pickup-verification-facility-mismatch-denied-response.json`
- `examples/care-facility-pickup-verification-inactive-service-window-denied-response.json`

Schema-invalid fixtures:

- `tests/conformance/fixtures/invalid/care-facility-pickup-verification-care-network-contact-leak.json`
- `tests/conformance/fixtures/invalid/care-facility-pickup-verification-denied-response-with-context.json`
- `tests/conformance/fixtures/invalid/care-facility-pickup-verification-feeding-medication-leak.json`
- `tests/conformance/fixtures/invalid/care-facility-pickup-verification-identity-document-leak.json`
- `tests/conformance/fixtures/invalid/care-facility-pickup-verification-ok-owner-confirmation-required.json`
- `tests/conformance/fixtures/invalid/care-facility-pickup-verification-ok-release-false.json`
- `tests/conformance/fixtures/invalid/care-facility-pickup-verification-partial-with-authorized-status.json`
- `tests/conformance/fixtures/invalid/care-facility-pickup-verification-payment-authority-leak.json`
- `tests/conformance/fixtures/invalid/care-facility-pickup-verification-purpose-mismatch.json`

## Transport Adapters

OpenAPI adapter:

- `openapi/care-facility-pickup-verification.openapi.json`
- `POST /care-facility-pickup-verification`

MCP adapter:

- `mcp/care-facility-pickup-verification.tools.json`
- `ccp_care_facility_pickup_verification_request`

Both adapters preserve the canonical request, response, authorization decision, visibility, provenance, facility boundary, service-window boundary, pickup-actor boundary, and omission semantics. The pickup-verification adapter sketches do not include a permission-grant lookup tool; grant lookup is delegated to the care-facility-context or commerce adapters.

## Implementation Checklist

- Validate incoming request bodies against canonical schemas.
- Authenticate requester identity outside the CCP payload.
- Check requester, pet, facility, service, service window, pickup actor, purpose, grant, scope, expiry, revocation, visibility, and freshness.
- Return only facility-shareable context allowed by the grant, purpose, facility, service window, and pickup actor.
- Attach provenance and visibility to every returned field.
- Include an authorization decision in every response.
- In `ok` responses, require `authorization_status: authorized` and `release_allowed: true`.
- In `partial` responses, omit `release_allowed` or report it as `false`, and never claim `authorization_status: authorized`.
- Include omissions for omitted requested or relevant fields.
- Return `pickup_verification_context: null` for denied responses.
- Validate outgoing responses against canonical schemas.
- Run `npm test` before claiming compatibility.

## Conformance

Install dependencies and run:

```sh
npm install
npm test
```

The test suite validates positive examples, valid denied examples, invalid fixtures, the OpenAPI adapter, and the MCP tool sketches.
