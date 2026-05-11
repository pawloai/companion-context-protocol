# Implementing A Care Network Lookup Server

Status: Draft, pre-1.0

This guide explains how to implement a server for the CCP Care Network Lookup slice.

The slice is intentionally narrow. It answers a focused question: for the requested pet and one named subject actor, what is the relationship, contact reachability, action authority, or revocation status that the requester is permitted to see? It does not return full household records, unrelated people, unrelated pets, billing data, payment authority, identity-document copies or numbers, medical or wellness history, diagnosis history, treatment history, staff-only notes, sensitive relationship narratives, or free-text dispute details. Broader care-network workflows belong to other slices or future profiles.

The canonical contract is JSON Schema. OpenAPI and MCP are adapter surfaces that carry the same request and response objects.

## Canonical Inputs And Outputs

A Care Network Lookup server accepts:

- `CareNetworkLookupRequest`
- An authenticated requester identity from the transport or host environment.
- Access to active permission grants for the requested pet.
- Source records that can resolve the requested subject actor and its relationship to the pet.

A Care Network Lookup server returns:

- `CareNetworkLookupResponse`
- An `authorization_decision` in every response.
- A minimized `care_network_context` for allowed or partial responses.
- `care_network_context: null` for denied responses.
- Machine-readable `omissions` explaining data that was not returned.

Canonical schemas:

- `schemas/care-network-lookup-request.schema.json`
- `schemas/care-network-lookup-response.schema.json`
- `schemas/permission-grant.schema.json`
- `schemas/ccp-core.schema.json`

## Evaluation Order

Implementations should evaluate requests in this order:

1. Parse the transport request.
2. Authenticate the requester through the transport or host environment. Reject the request when the transport provides no authenticated principal. Verify that the asserted `requester_actor_type` matches the principal's trust posture; reject mismatches and reject `requester_actor_type: "vet"` until a vet-export profile is defined.
3. Validate the request body against `CareNetworkLookupRequest`.
4. Resolve the requested pet.
5. Resolve the active grant. The care-network-lookup slice requires `grant_id`.
6. Verify that the grant applies to the requester, pet, purpose, scopes, optional service window, and current time.
7. Resolve the requested `subject_actor_id` and verify it is part of the pet's care network.
8. Evaluate each requested scope independently (actor refs, relationships, contact channels, action authorizations, revocation status). A grant may permit one without permitting the others.
9. Apply visibility precedence and Care Network Lookup slice exclusions.
10. Apply freshness, provenance, and revocation requirements per sub-resource.
11. Build the `authorization_decision`.
12. Build the minimized `care_network_context`, if any sub-resource may be returned.
13. Add machine-readable omissions for requested or relevant data that was not returned.
14. Validate the response against `CareNetworkLookupResponse` before returning it.

## Authorization Rules

Scopes are necessary but not sufficient. The slice authorizes five fine-grained scopes that must be evaluated separately:

- `pet.care_network.actor_refs.read` — minimal subject-actor reference (id, type, optional display name, optional role label).
- `pet.care_network.relationships.read` — relationship of the subject actor to the pet.
- `pet.care_network.contact_channels.read` — contact channel kind and value, with allowed purposes.
- `pet.care_network.action_authorizations.read` — what actions the subject actor is currently authorized to perform.
- `pet.care_network.revocation_status.read` — revocation records that affect the subject actor's authorizations.

A request may carry any non-empty subset of these. Each granted scope is evaluated independently — relationship visibility does not imply contact access, and contact access does not imply action authority. Each must include the corresponding visibility class on every returned field.

A server should authorize each returned field using:

- Authenticated requester actor.
- Asserted `requester_actor_type` bound to the authenticated principal.
- Requested pet.
- Requested subject actor.
- Declared purpose (`care_network_lookup`).
- Active grant status, expiration, and revocation.
- Requested scope.
- Field visibility classes.
- Field sensitivity.
- Source freshness.
- Per-channel `allowed_purposes` and per-authorization `service_window`/`expires_at` constraints.

Care-network visibility classes (`care_network_visible`, `contact_shareable`, `action_authorization_visible`) do not imply commerce safety, facility access, or pickup-verification access. Cross-profile reuse requires a separately authorized response in the other profile. `staff_only` and `restricted_sensitive` must never appear on returned care-network fields.

## Subject-Actor Boundary

The subject-actor boundary is load-bearing. A care-network response must describe only the requested `subject_actor_id`. Do not return:

- Other actors known to the pet's care network.
- Sibling pets or unrelated pets.
- Household members beyond the named subject actor.
- Lists of contacts beyond the requested subject actor's own contact channels.

Use `not_available` or `purpose_not_allowed` when the `subject_actor_id` is unknown to the system or has no relationship to the requested pet. Do not return partial fields to probe whether a name exists.

## Per-Sub-Resource Evaluation

Each of `relationship`, `contact_channels`, `action_authorizations`, and `revocation_records` is evaluated independently:

- A grant may include `relationships.read` but not `contact_channels.read`. Return the relationship; omit contact channels with `scope_missing`.
- A contact channel's `allowed_purposes` field constrains which purposes may receive that channel. The schema closes `allowed_purposes.value` items to the enum `["care_network_lookup", "pickup_verification"]`. Omit channels whose `allowed_purposes` does not include `care_network_lookup` for the current request.
- An action authorization may have an `expires_at` or matching revocation record. Reflect those in `status` and `revocation_records`; do not silently drop the authorization.
- Revocation records must reference an `authorization_id` and `actor_id` that match the subject actor and authorization in this response. `revocation_records[].reason_code.value` is closed to `owner_revoked`, `grant_expired`, `service_window_ended`, `source_replaced`, or `not_available`.
- `omissions[].required_scope`, when present, must be one of the five care-network scopes. Reusing a scope from another profile (for example, `pet.profile.read`) will fail validation.

`CareNetworkContext` requires at least one of `relationship`, `contact_channels`, `action_authorizations`, or `revocation_records` to be present (anyOf). A response that resolves to no sub-resource at all should be `denied` rather than `partial` with an empty body.

## Response Status

Use `ok` when:

- The request is authorized.
- All requested and relevant care-network sub-resources are returned.
- `authorization_decision.decision` is `allowed`.
- `care_network_context` is non-null and includes at least one sub-resource.
- `omissions` is empty.

Use `partial` when:

- Some care-network sub-resources can be returned.
- Some requested or relevant data is omitted (for example, contact channels withheld but relationship returned).
- `authorization_decision.decision` is `partial`.
- `care_network_context` is non-null.
- `omissions` has at least one item.

Use `denied` when:

- No care-network context may be returned.
- `authorization_decision.decision` is `denied`.
- `care_network_context` is `null`.
- `omissions` has at least one item.

Protocol-level denials should return a CCP response envelope. Transport-level failures, such as malformed JSON or missing transport authentication, may use ordinary transport errors.

## Building The Authorization Decision

Every response must include `authorization_decision`.

Populate:

- `decision`: `allowed`, `partial`, or `denied`.
- `evaluated_at`: timestamp of evaluation.
- `requester_actor_id`: authenticated requester.
- `requester_actor_type`: echoed from the request, MUST equal the request value.
- `pet_id`: requested pet.
- `purpose`: `care_network_lookup`.
- `grant_id`: grant used.
- `applied_scopes`: scopes that were allowed and used.
- `denied_scopes`: requested or relevant scopes that were not allowed.
- `reasons`: concise human-readable explanation.

Do not put private source records, identity-document data, payment authority details, household data, dispute narratives, custody details, or raw staff notes in `reasons`. The care-network-lookup response schema applies the `SensitiveKeywordPattern` overlay to both `reasons` strings and omission `detail` strings, so banned-keyword leaks reject at the schema layer.

## Building Returned Context

Returned context should be minimized to the current request and the named subject actor.

Every returned context field must use the field envelope shape:

```json
{
  "value": "owner",
  "visibility": ["care_network_visible"],
  "provenance": {
    "source_type": "owner_entered",
    "source_actor_id": "actor_owner_001",
    "source_system": "example-ccp-server",
    "recorded_at": "2026-04-20T10:00:00Z",
    "verified_at": "2026-04-20T10:05:00Z"
  }
}
```

Visibility expectations per sub-resource:

- `subject_actor` and `relationship` fields use `care_network_visible`.
- `contact_channels` fields use `contact_shareable`.
- `action_authorizations` fields use `action_authorization_visible`.
- `revocation_records` fields may use any of the care-network classes appropriate to the underlying record.

For generated fields or summaries, provenance must include:

- `source_system`
- `derived_from`

For source facts, provenance should include source actor or system, recorded timestamp, freshness metadata when available, and source record reference when safe to expose. Do not embed restricted source content (medical, billing, household, dispute, custody) in provenance URIs.

The returned bundle should not include object families that are outside this slice. Do not add commerce fields, boarding-preparation fields, pickup-verification fields, payment authority, identity-document data, or medical history to make an integration easier. Those are profile or slice changes and need separate scopes, purpose rules, visibility behavior, examples, and conformance fixtures.

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

Use `purpose_not_allowed` for data outside `care_network_lookup`, even if the requester might operationally want it (for example, full household records, pickup-verification context, or billing).

Use `visibility_restricted` for source fields marked `staff_only`, `restricted_sensitive`, or not explicitly carrying a care-network class.

Use `scope_missing` when a sub-resource has a defined scope but the active grant does not include it (for example, contact channels withheld because `pet.care_network.contact_channels.read` is not granted).

Omissions belong in the response envelope. Nested context objects should not carry their own `omissions` array.

Omission `detail` strings should be useful but not revealing. The care-network-lookup response applies the `SensitiveKeywordPattern` overlay — banned keywords (billing, payment, household, medical, diagnosis, treatment, staff-only, staff-note, relationship-dispute, custody, identity-document) are rejected by the schema. Implementers must also avoid embedding any restricted source content in detail strings.

## Slice Exclusions

Do not return these in the Care Network Lookup slice:

- Full household records or unrelated household members.
- Unrelated people in the pet's care network beyond the requested subject actor.
- Unrelated pets.
- Billing data or payment authority.
- Identity document copies and identity document numbers.
- Medical, wellness, diagnosis, or treatment history.
- Staff-only records, internal staff notes, or sensitive relationship narratives.
- Free-text dispute details, custody narratives, or raw conflict logs.
- Free-text denial details that reveal restricted source content.

A relationship may be visible without contact access. A contact channel may be visible without action authority. Implementations must support those partial outcomes rather than collapsing to all-or-nothing.

If a future slice explicitly allows more sensitive data, it should define separate scopes, purpose rules, visibility behavior, examples, and conformance fixtures.

## Public Examples

Positive care-network-lookup flow:

- `examples/permission-grant-care-network-lookup.json`
- `examples/care-network-lookup-request.json`
- `examples/care-network-lookup-response.json`

Partial flow (contact channels withheld):

- `examples/care-network-lookup-contact-withheld-response.json`

Valid denied response:

- `examples/care-network-lookup-denied-response.json`

Schema-invalid fixtures:

- `tests/conformance/fixtures/invalid/care-network-lookup-broad-scope-request.json`
- `tests/conformance/fixtures/invalid/care-network-lookup-cross-profile-visibility.json`
- `tests/conformance/fixtures/invalid/care-network-lookup-denied-response-with-context.json`
- `tests/conformance/fixtures/invalid/care-network-lookup-household-keyword-in-reasons.json`
- `tests/conformance/fixtures/invalid/care-network-lookup-sensitive-provenance-ref.json`
- `tests/conformance/fixtures/invalid/care-network-lookup-staff-only-visibility.json`
- `tests/conformance/fixtures/invalid/care-network-lookup-unrelated-contact-list.json`

## Transport Adapters

OpenAPI adapter:

- `openapi/care-network-lookup.openapi.json`
- `POST /care-network-lookup`

MCP adapter:

- `mcp/care-network-lookup.tools.json`
- `ccp_care_network_lookup_request`

Both adapters preserve the canonical request, response, authorization decision, visibility, provenance, subject-actor boundary, per-sub-resource evaluation, and omission semantics. The care-network-lookup adapter sketches do not include a permission-grant lookup tool; grant lookup is delegated to the care-facility-context or commerce adapters.

## Implementation Checklist

- Validate incoming request bodies against canonical schemas.
- Authenticate requester identity outside the CCP payload.
- Bind the asserted `requester_actor_type` to the authenticated principal; reject mismatches, unauthenticated requests, and `requester_actor_type: "vet"` until a vet-export profile lands.
- For systems that issue grants, verify `grantor_actor_type` against the authenticated grant issuer at issuance time.
- Check requester, pet, subject actor, purpose, grant, scopes, expiry, revocation, visibility, and freshness.
- Evaluate each requested scope independently; do not collapse `actor_refs.read`, `relationships.read`, `contact_channels.read`, `action_authorizations.read`, and `revocation_status.read` into a single yes/no decision.
- Honor `allowed_purposes` on contact channels and `service_window`/`expires_at` on action authorizations.
- Return only care-network context for the named subject actor.
- Attach provenance and the appropriate care-network visibility class to every returned field.
- Include an authorization decision in every response.
- Include omissions for omitted requested or relevant fields.
- Return `care_network_context: null` for denied responses.
- Validate outgoing responses against canonical schemas.
- Run `npm test` before claiming compatibility.

## Conformance

Install dependencies and run:

```sh
npm install
npm test
```

The test suite validates positive examples, valid denied examples, invalid fixtures, the OpenAPI adapter, and the MCP tool sketches.
