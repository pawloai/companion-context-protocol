# Implementing A Facility Truth Server

Status: Draft, pre-1.0

This guide explains how to implement a server for the CCP Facility Truth profile.

The profile is intentionally narrow. It answers a focused question: for the requested facility, what public-fact context (profile summary, hours, services, contact methods, service area, acceptance criteria, booking methods, policy summaries) should an agent be allowed to ground itself in? It does not return staff schedules, internal capacity models, billing data, payment authority, household data, identity-document data, medical or wellness history, diagnosis history, treatment history, staff-only notes, or any pet-specific context. Higher-scrutiny facility scopes (certifications, insurance statements, capacity status, staff credentials) are deferred to a future partner-only Facility Truth slice with its own grant model.

The canonical contract is JSON Schema. OpenAPI and MCP are adapter surfaces that carry the same request and response objects.

## Canonical Inputs And Outputs

A Facility Truth server accepts:

- `FacilityTruthRequest`
- An authenticated requester identity from the transport or host environment.
- Source records that can resolve the requested facility's published facts and freshness metadata.

A Facility Truth server returns:

- `FacilityTruthResponse`
- An `authorization_decision` in every response.
- A minimized `facility_truth_context` for allowed or partial responses.
- `facility_truth_context: null` for denied responses.
- Machine-readable `omissions` explaining data that was not returned.

Canonical schemas:

- `schemas/facility-truth-request.schema.json`
- `schemas/facility-truth-response.schema.json`
- `schemas/ccp-core.schema.json`

Facility Truth v1 does not require `schemas/permission-grant.schema.json`. The v1 scope set covers public-fact context only and operates without a `PermissionGrant`.

## Evaluation Order

Implementations should evaluate requests in this order:

1. Parse the transport request.
2. Authenticate the requester through the transport or host environment. Reject the request when the transport provides no authenticated principal. Verify that the asserted `requester_actor_type` matches the principal's trust posture; reject `requester_actor_type: "vet"` until a vet-export profile is defined.
3. Validate the request body against `FacilityTruthRequest`.
4. Resolve the requested facility.
5. Evaluate each requested scope independently against what the facility has published and verified within the freshness window.
6. Apply visibility precedence and Facility Truth profile exclusions.
7. Build the `authorization_decision`.
8. Build the minimized `facility_truth_context`, if any sub-resource may be returned.
9. Add machine-readable omissions for requested or relevant data that was not returned.
10. Validate the response against `FacilityTruthResponse` before returning it.

A `grant_id` is optional on the request. v1 servers MUST silently accept and ignore a `grant_id` field when present — do NOT hard-reject requests that carry one. Partner-only Facility Truth scopes will make `grant_id` required for those scopes, and v1 servers that reject requests carrying a `grant_id` today will silently break compatibility when partner-only scopes land. Reserve room for a scope-conditional grant-evaluation rule rather than treating "no grant" as an invariant.

## Authorization Rules

Scopes are necessary but not sufficient. The v1 profile authorizes eight public-fact scopes that must be evaluated separately:

- `facility.profile.read` — facility name, description, primary address.
- `facility.hours.read` — regular and holiday hours, time zone, after-hours line.
- `facility.services.read` — services offered, accepted pet types, current availability.
- `facility.contact_methods.read` — published contact channels.
- `facility.service_area.read` — described or geo-bounded service area.
- `facility.acceptance_criteria.read` — public-facing acceptance criteria summary.
- `facility.booking_methods.read` — public booking methods and links.
- `facility.policies.summary.read` — short summaries of public-facing policies.

A request may carry any non-empty subset of these. Each granted scope is evaluated independently. Each must include the corresponding visibility class (`facility_public`) on every returned field, and each returned field's provenance must include `verified_at` within the facility's freshness window.

A server should authorize each returned field using:

- Authenticated requester actor.
- Asserted `requester_actor_type` bound to the authenticated principal.
- Requested facility.
- Declared purpose (`facility_truth_lookup`).
- Requested scope.
- Field visibility classes.
- Field freshness — every returned field's provenance MUST carry `verified_at`. Unverified or stale data is omitted with `not_verified` or `source_stale`.

`facility_public` does not imply commerce safety, care-network access, contact-channel reuse, or facility-shareable status. Cross-profile reuse requires a separately authorized response in the other profile. `staff_only`, `restricted_sensitive`, `commerce_safe`, `facility_shareable`, `care_network_visible`, `contact_shareable`, `action_authorization_visible`, `owner_visible`, `caregiver_visible`, `vet_shareable`, and `agent_summary_only` must never appear on returned Facility Truth fields — Facility Truth fields are facility-subject, not pet- or owner-subject, so pet-centric or summary-only classes are semantically incoherent on them and are rejected by `FacilityTruthVisibilitySet`.

## Subject Boundary

The subject boundary is load-bearing. A Facility Truth response describes only the requested `facility_id`. The request carries no `pet_id`, and the response must not include `pet_id` anywhere — there is no pet subject in this profile. Do not return:

- Pets associated with the facility.
- Owners or households associated with the facility.
- Staff identities, schedules, or credentials.
- Other facilities operated by the same parent organization.

Use `not_available` when a facility is unknown to the system. Do not return partial fields to probe whether a facility exists.

## Per-Field Evaluation

Each top-level sub-resource in `FacilityTruthContext` (`profile_summary`, `hours`, `services`, `service_area`, `contact_methods`, `booking_methods`, `acceptance_criteria`, `policy_summaries`) is evaluated independently:

- A request may include `facility.hours.read` but not `facility.policies.summary.read`. Return hours; omit policy summaries with `scope_missing` (or `not_verified` if the scope is allowed but no current verification exists).
- A facility that has not verified a sub-resource within its freshness window MUST omit it with `not_verified` rather than return stale data.
- A facility that does not offer or apply a sub-resource (e.g., no service area) MUST omit it with `not_applicable` rather than return an empty placeholder.
- `omissions[].required_scope`, when present, must be one of the eight Facility Truth scopes. Reusing a scope from another profile (for example, `pet.profile.read`) will fail validation.

`FacilityTruthContext` allows a response to include any subset of the sub-resources, but at minimum must include `facility_id` and `metadata`. A response that resolves to no sub-resource at all should be `denied` rather than `partial` with an empty body.

## Response Status

Use `ok` when:

- The request is authorized.
- All requested and relevant sub-resources are returned with current verification.
- `authorization_decision.decision` is `allowed`.
- `facility_truth_context` is non-null and includes at least one sub-resource.
- `omissions` is empty.

Use `partial` when:

- Some sub-resources can be returned.
- Some requested or relevant data is omitted (for example, `not_verified` for a stale policy summary).
- `authorization_decision.decision` is `partial`.
- `facility_truth_context` is non-null and includes at least one sub-resource.
- `omissions` has at least one item.

Use `denied` when:

- No facility-truth context may be returned.
- `authorization_decision.decision` is `denied`.
- `facility_truth_context` is `null`.
- `omissions` has at least one item.

Protocol-level denials should return a CCP response envelope. Transport-level failures, such as malformed JSON or missing transport authentication, may use ordinary transport errors.

## Building The Authorization Decision

Every response must include `authorization_decision`.

Populate:

- `decision`: `allowed`, `partial`, or `denied`.
- `evaluated_at`: timestamp of evaluation.
- `requester_actor_id`: authenticated requester.
- `requester_actor_type`: echoed from the request, MUST equal the request value.
- `facility_id`: requested facility. (The Facility Truth response wrapper requires `facility_id` on `authorization_decision`. The base `AuthorizationDecision` no longer requires `pet_id`; pet-bound profiles re-add it via their own response wrappers.)
- `purpose`: `facility_truth_lookup`.
- `applied_scopes`: scopes that were allowed and used.
- `denied_scopes`: requested or relevant scopes that were not allowed.
- `reasons`: concise human-readable explanation.

Do not put private source records, identity-document data, payment authority details, household data, dispute narratives, custody details, or raw staff notes in `reasons`. The Facility Truth response schema applies the `SensitiveKeywordPattern` overlay to both `reasons` strings and omission `detail` strings, so banned-keyword leaks reject at the schema layer.

## Building Returned Context

Returned context should be minimized to public, agent-grounding facts about the facility.

Every returned context field must use the field envelope shape:

```json
{
  "value": "Mon-Fri 07:00-19:00",
  "visibility": ["facility_public"],
  "provenance": {
    "source_type": "owner_entered",
    "source_actor_id": "actor_facility_admin_001",
    "source_system": "example-ccp-server",
    "recorded_at": "2026-05-01T09:00:00Z",
    "verified_at": "2026-05-10T09:00:00Z"
  }
}
```

Visibility expectations: every field uses `facility_public`. No other class may appear on returned Facility Truth fields. The "facility-public rule" is symmetric to the commerce-safe rule.

For generated fields or summaries, provenance must include:

- `source_system`
- `derived_from`

For all returned Facility Truth fields, provenance MUST include `verified_at`. The freshness window is a property of the facility's source record and the implementer's policy; if no verification exists within the window, the field MUST be omitted with `not_verified` rather than returned.

The returned bundle should not include object families that are outside this profile. Do not add commerce fields, boarding-preparation fields, pickup-verification fields, care-network fields, payment authority, identity-document data, medical history, household data, staff schedules, internal capacity models, or pet-specific context to make an integration easier. Those are profile or slice changes and need separate scopes, purpose rules, visibility behavior, examples, and conformance fixtures.

## Freshness

Freshness is part of safety. A facility that has not verified a fact recently is a liability for agent grounding.

- Every returned field's provenance MUST carry `verified_at`. The schema enforces this through `FacilityTruthContextProvenance`.
- `verified_at` MUST be a real verification timestamp recorded by the facility (or its delegate), in UTC with a `Z` suffix, and strictly in the past relative to the response. It MUST NOT be set to the request time, the current wall clock, or any future placeholder. Implementations SHOULD reject source records that carry a `verified_at` in the future or in the request window before serving them.
- Implementations SHOULD set a freshness window per sub-resource (e.g., 30 days for hours, 90 days for service area, 7 days for currently_offered).
- A field whose `verified_at` is outside the window MUST be omitted with `source_stale` rather than returned.
- A field whose source has never been verified by the facility MUST be omitted with `not_verified` rather than returned.

Stale or unverified data must not be returned with a guess. Agents grounding on Facility Truth depend on the contract that returned facts have been verified.

## Omissions

Use omissions to explain data that was requested or relevant but not returned.

Common omission reasons:

- `scope_missing`
- `purpose_not_allowed`
- `visibility_restricted`
- `source_stale`
- `not_verified`
- `not_applicable`
- `not_available`
- `summary_only`

Use `purpose_not_allowed` for data outside `facility_truth_lookup`, even if the requester might operationally want it (for example, pet-specific context, staff schedules, billing).

Use `visibility_restricted` for source fields marked `staff_only`, `restricted_sensitive`, or not explicitly carrying `facility_public`.

Use `scope_missing` when a sub-resource has a defined scope but the request did not include it.

Use `not_verified` when the scope is allowed but the facility has no current verification on file.

Use `not_applicable` when the sub-resource does not apply to this facility (e.g., a mobile facility with no fixed service area, or a daycare with no booking link).

Omissions belong in the response envelope. Nested context objects should not carry their own `omissions` array.

Omission `detail` strings should be useful but not revealing. The Facility Truth response applies the `SensitiveKeywordPattern` overlay — banned keywords (billing, payment, household, medical, diagnosis, treatment, staff-only, staff-note, relationship-dispute, custody, identity-document) are rejected by the schema. Implementers must also avoid embedding any restricted source content in detail strings.

## Profile Exclusions

Do not return these in the Facility Truth profile:

- Pet-specific context of any kind.
- Owner, household, or care-network records.
- Staff identities, schedules, credentials, or notes.
- Internal capacity models or live availability counts.
- Billing data or payment authority.
- Identity document copies and identity document numbers.
- Medical, wellness, diagnosis, or treatment history.
- Sensitive relationship narratives, custody narratives, or raw conflict logs.
- Free-text denial details that reveal restricted source content.

Higher-scrutiny facility scopes — certifications, insurance statements, capacity status, staff credentials — are deferred to a future partner-only Facility Truth slice. That slice will define its own scopes, purpose rules, visibility class (`facility_partner_visible`), grant shape (likely an additive `subject_facility_id` on `PermissionGrant`), examples, and conformance fixtures. v1 implementers should not assume the no-grant semantics generalize to those future scopes.

## Public Examples

Positive Facility Truth flow:

- `examples/facility-truth-request.json`
- `examples/facility-truth-response.json`

Partial flow (one scope unverified):

- `examples/facility-truth-partial-response.json`

Valid denied response:

- `examples/facility-truth-denied-response.json`

Schema-invalid fixtures:

- `tests/conformance/fixtures/invalid/facility-truth-agent-summary-only-visibility.json`
- `tests/conformance/fixtures/invalid/facility-truth-auth-decision-pet-id-leak.json`
- `tests/conformance/fixtures/invalid/facility-truth-broad-scope-request.json`
- `tests/conformance/fixtures/invalid/facility-truth-cross-profile-visibility.json`
- `tests/conformance/fixtures/invalid/facility-truth-denied-response-with-context.json`
- `tests/conformance/fixtures/invalid/facility-truth-empty-ok-context.json`
- `tests/conformance/fixtures/invalid/facility-truth-empty-partial-context.json`
- `tests/conformance/fixtures/invalid/facility-truth-field-missing-verified-at.json`
- `tests/conformance/fixtures/invalid/facility-truth-missing-facility-public.json`
- `tests/conformance/fixtures/invalid/facility-truth-pet-id-leak.json`
- `tests/conformance/fixtures/invalid/facility-truth-sensitive-provenance-ref.json`
- `tests/conformance/fixtures/invalid/facility-truth-staff-only-visibility.json`

## Transport Adapters

OpenAPI adapter:

- `openapi/facility-truth.openapi.json`
- `POST /facility-truth`

MCP adapter:

- `mcp/facility-truth.tools.json`
- `ccp_facility_truth_request`

Both adapters preserve the canonical request, response, authorization decision, visibility, freshness, subject boundary, per-field evaluation, and omission semantics. The Facility Truth adapter sketches do not include a permission-grant lookup tool; v1 has no grant.

## Implementation Checklist

- Validate incoming request bodies against canonical schemas.
- Authenticate requester identity outside the CCP payload.
- Bind the asserted `requester_actor_type` to the authenticated principal; reject mismatches, unauthenticated requests, and `requester_actor_type: "vet"` until a vet-export profile lands.
- Treat `grant_id` as advisory in v1 — it is not required and not evaluated. v1 servers MUST silently accept and ignore a `grant_id` when present; do not hard-reject requests that carry one (partner-only scopes will make `grant_id` required, and a v1 hard-reject would break forward compatibility).
- Check requester, facility, purpose, scopes, visibility, and freshness.
- Evaluate each requested scope independently; do not collapse the eight facility scopes into a single yes/no decision.
- Honor a per-sub-resource freshness window; omit stale or unverified facts.
- Return only Facility Truth context for the named facility. Never include `pet_id` anywhere in the response.
- Attach `verified_at` provenance and `facility_public` visibility to every returned field.
- Include an authorization decision in every response.
- Include omissions for omitted requested or relevant fields.
- Return `facility_truth_context: null` for denied responses.
- Validate outgoing responses against canonical schemas.
- Run `npm test` before claiming compatibility.

## Conformance

Install dependencies and run:

```sh
npm install
npm test
```

The test suite validates positive examples, valid denied examples, invalid fixtures, the OpenAPI adapter, and the MCP tool sketches.
