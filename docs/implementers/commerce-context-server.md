# Implementing A Commerce Context Server

Status: Draft, pre-1.0

This guide explains how to implement a server for the CCP Commerce Context Profile.

The canonical contract is JSON Schema. OpenAPI and MCP are adapter surfaces that carry the same request and response objects.

## Canonical Inputs And Outputs

A Commerce Context server accepts:

- `CommerceContextRequest`
- An authenticated requester identity from the transport or host environment.
- Access to active permission grants for the requested pet.
- Source context records from the implementation's own system.

A Commerce Context server returns:

- `CommerceContextResponse`
- An `authorization_decision` in every response.
- A minimized `commerce_context` for allowed or partial responses.
- `commerce_context: null` for denied responses.
- Machine-readable `omissions` explaining data that was not returned.

Canonical schemas:

- `schemas/commerce-context-request.schema.json`
- `schemas/commerce-context-response.schema.json`
- `schemas/permission-grant.schema.json`
- `schemas/ccp-core.schema.json`

## Evaluation Order

Implementations should evaluate requests in this order:

1. Parse the transport request.
2. Authenticate the requester through the transport or host environment.
3. Validate the request body against `CommerceContextRequest`.
4. Resolve the requested pet.
5. Resolve the active grant, if a `grant_id` is supplied.
6. Verify that the grant applies to the requester, pet, purpose, scopes, and current time.
7. Load only source context needed for the requested scopes.
8. Apply visibility precedence and Commerce Context Profile exclusions.
9. Apply freshness and provenance requirements.
10. Build the `authorization_decision`.
11. Build the minimized `commerce_context`, if any data may be returned.
12. Add machine-readable omissions for requested or relevant data that was not returned.
13. Validate the response against `CommerceContextResponse` before returning it.

## Authorization Rules

Scopes are necessary but not sufficient.

A server should authorize each returned field using:

- Authenticated requester actor.
- Requested pet.
- Declared purpose.
- Active grant status.
- Grant expiration and revocation.
- Requested scopes.
- Field visibility classes.
- Field sensitivity.
- Source freshness.
- Facility, merchant, or recipient boundary when relevant.

For the Commerce Context Profile, `owner_visible`, `caregiver_visible`, and `vet_shareable` do not imply commerce access. Returned commerce fields must be commerce-safe and must not include `staff_only` or `restricted_sensitive`.

## Response Status

Use `ok` when:

- The request is authorized.
- All requested and relevant commerce-safe context is returned.
- `authorization_decision.decision` is `allowed`.
- `commerce_context` is non-null.
- `omissions` is empty.

Use `partial` when:

- Some commerce-safe context can be returned.
- Some requested or relevant context is omitted.
- `authorization_decision.decision` is `partial`.
- `commerce_context` is non-null.
- `omissions` has at least one item.

Use `denied` when:

- No commerce context may be returned.
- `authorization_decision.decision` is `denied`.
- `commerce_context` is `null`.
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
- `grant_id`: grant used, when available.
- `applied_scopes`: scopes that were allowed and used.
- `denied_scopes`: requested or relevant scopes that were not allowed.
- `reasons`: concise human-readable explanation.

Do not put private source records, raw staff notes, raw wellness timelines, diagnosis history, billing data, household data, or sensitive facility operations data in `reasons`.

## Building Returned Context

Returned context should be minimized to the current request.

Every returned context field must use the field envelope shape:

```json
{
  "value": "large",
  "visibility": ["owner_visible", "commerce_safe"],
  "provenance": {
    "source_type": "generated",
    "source_system": "example-ccp-server",
    "recorded_at": "2026-05-04T16:30:00Z",
    "derived_from": ["example://pets/pet_luna_001/profile/weight"]
  }
}
```

For generated fields or summaries, provenance must include:

- `source_system`
- `derived_from`

For source facts, provenance should include source actor or system, recorded timestamp, freshness metadata when available, and source record reference when safe to expose.

## Omissions

Use omissions to explain data that was requested or relevant but not returned.

Common omission reasons:

- `not_requested`
- `scope_missing`
- `purpose_not_allowed`
- `visibility_restricted`
- `grant_expired`
- `grant_revoked`
- `source_stale`
- `not_available`
- `summary_only`

Omissions belong in the response envelope. Nested context objects should not carry their own `omissions` array.

Omission details should be useful but not revealing. Do not disclose restricted source content in omission text. The Commerce Context response schema does not apply the `SensitiveKeywordPattern` overlay to `reasons` or omission `detail` strings, because legitimate Commerce Context omission text references excluded categories by name (for example, "Staff-only notes are not commerce-safe."). This is a known schema-enforcement gap: the implementer is the load-bearing control. A category label that explains *why* a field was withheld is fine; an actual record value smuggled alongside the label is not. Concretely:

- Acceptable: `"Staff-only notes are not commerce-safe."`
- Acceptable: `"Wellness timelines are outside the Commerce Context Profile."`
- Not acceptable: `"Wellness: 2025-09-12 limp on left rear leg, suspected sprain."` — this embeds restricted source content under cover of a category label.

## Commerce Profile Exclusions

Do not return these by default in Commerce Context responses:

- Internal staff notes.
- Raw wellness timelines.
- Diagnosis or treatment history.
- Billing data.
- Unrelated owner or household data.
- Sensitive facility operations data.
- Raw source observations marked `agent_summary_only`.

If a future profile explicitly allows more sensitive data, it should define separate scopes, purpose rules, visibility behavior, and conformance fixtures.

## Transport Adapters

OpenAPI adapter:

- `openapi/commerce-context.openapi.json`
- `POST /commerce-context`
- Optional `GET /permission-grants/{grant_id}`, requiring `pet.permission_grants.read`

MCP adapter:

- `mcp/commerce-context.tools.json`
- `ccp_commerce_context_request`
- `ccp_permission_grant_get`, requiring `pet.permission_grants.read`

Both adapters must preserve the canonical request, response, authorization decision, visibility, provenance, and omission semantics.

## Implementation Checklist

- Validate incoming request bodies against canonical schemas.
- Authenticate requester identity outside the CCP payload.
- Check requester, pet, purpose, grant, scopes, expiry, revocation, visibility, and freshness.
- Return only commerce-safe context allowed by the grant and purpose.
- Attach provenance and visibility to every returned field.
- Include an authorization decision in every response.
- Include omissions for omitted requested or relevant fields.
- Validate outgoing responses against canonical schemas.
- Run `npm test` before claiming compatibility.

## Conformance

Install dependencies and run:

```sh
npm install
npm test
```

The test suite validates positive examples, rejects negative fixtures, validates the OpenAPI adapter, and checks the MCP tool sketches.
