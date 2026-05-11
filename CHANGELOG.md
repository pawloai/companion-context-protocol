# Changelog

All notable changes to CCP draft artifacts will be documented here.

This project is pre-1.0. Draft versions may change incompatibly while schemas, profiles, adapters, and conformance expectations are refined.

## Unreleased

### Added

- Required `requester_actor_type` on every request, echoed on the response `authorization_decision` (MUST equal the request value).
- Required `grantor_actor_type` and `grantee_actor_type` on every `PermissionGrant`.
- Required `pickup_actor_type` on every `CareFacilityPickupVerificationRequest`; required `actor_type` on the response `PickupActor`.
- New `ActorType` enum (`owner`, `caregiver`, `facility`, `merchant`, `agent_client`, `service_integration`, `vet`) and shared `CareNetworkActorType` `$def` for the 9-value care-network relationship enum.
- Conformance requirement: servers MUST verify `requester_actor_type` against the authenticated transport principal; reject mismatches and reject requests when no authenticated principal is present.
- Conformance requirement: servers MUST reject `requester_actor_type: "vet"` until a vet-export profile is defined.
- Conformance requirement: servers MUST verify `grantor_actor_type` against the authenticated grant issuer at issuance time.
- Conformance runner enforces grantee/requester actor-type consistency for all four profiles (commerce, care-facility boarding, pickup verification, care-network lookup) and that responses echo the request's `requester_actor_type` and pickup actor type.
- Negative fixtures for missing `requester_actor_type`, invalid `requester_actor_type`, missing `grantor_actor_type`, missing `grantee_actor_type`, and invalid `pickup_actor_type`.
- Hand-written TypeScript types updated to expose `ActorType` and the new required fields on requests, grants, decisions, and `PickupActor`.
- Implementer guides (commerce, care facility, pickup verification, care network lookup) updated with the new actor-type binding rules and authorization-decision echo field.
- New `docs/implementers/conformance-checklist.md` separating the machine-checked surface (`npm test`) from the transport-layer and runtime requirements implementers MUST self-attest.
- Facility Truth Profile promoted from design draft to schema-backed profile (`facility_truth_lookup`). v1 ships public-fact scopes only and does not require a `PermissionGrant`.
- `FacilityTruthRequest`, `FacilityTruthResponse`, `FacilityTruthContext`, and the supporting `FacilityHours`, `FacilityService`, `FacilityContactMethod`, `FacilityBookingMethod`, `FacilityServiceArea`, `FacilityAcceptanceCriteria`, `FacilityPolicySummary`, `FacilityProfileSummary`, and `FacilityTruth*` field-envelope `$defs` in `ccp-core.schema.json`, plus wrapper schemas `schemas/facility-truth-request.schema.json` and `schemas/facility-truth-response.schema.json`.
- Eight new `Scope` enum entries (`facility.profile.read`, `facility.hours.read`, `facility.services.read`, `facility.contact_methods.read`, `facility.service_area.read`, `facility.acceptance_criteria.read`, `facility.booking_methods.read`, `facility.policies.summary.read`).
- New `Purpose` enum entry (`facility_truth_lookup`).
- New `VisibilityClass` enum entry (`facility_public`) with the "facility-public rule" (every Facility Truth field MUST include `facility_public` and MUST NOT be combined with `staff_only`, `restricted_sensitive`, `commerce_safe`, `facility_shareable`, `care_network_visible`, `contact_shareable`, `action_authorization_visible`, `owner_visible`, `caregiver_visible`, `vet_shareable`, or `agent_summary_only`).
- New `OmissionReasonCode` enum entries (`not_verified`, `not_applicable`).
- New `FacilityTruthContextProvenance` `$def` requiring `verified_at` on every Facility Truth field's provenance.
- Four positive Facility Truth examples (`examples/facility-truth-request.json`, `examples/facility-truth-response.json`, `examples/facility-truth-partial-response.json`, `examples/facility-truth-denied-response.json`) and eleven invalid fixtures (cross-profile visibility, missing `facility_public`, staff-only visibility, denied response with context, missing `verified_at`, broad-scope request, `pet_id` leak in context, sensitive provenance ref, `pet_id` leak in `authorization_decision`, empty `ok` context, `agent_summary_only` visibility), plus four `authorization_decision`-missing-`pet_id` fixtures across the pet-bound profiles (commerce, care facility, pickup verification, care network lookup) that guard against future overlay omissions.
- New OpenAPI adapter `openapi/facility-truth.openapi.json` (POST `/facility-truth`, no grant lookup) and MCP adapter `mcp/facility-truth.tools.json` (single `ccp_facility_truth_request` tool, no grant lookup).
- New `docs/implementers/facility-truth-server.md` implementer guide.
- Conformance runner extended with Facility Truth cases, a `subjectKey: "facility_id"` round-trip pair, and a subject-boundary scan that rejects any `pet_id` anywhere in a Facility Truth response.
- TypeScript package: hand-written Facility Truth types and AJV validator factories (`createFacilityTruthRequestValidator`, `createFacilityTruthResponseValidator`, and corresponding entries on `createCcpValidators()`).
- Python package: `facility-truth-request` and `facility-truth-response` keys added to `SchemaName` and `_SCHEMA_FILENAMES`.
- Positive `facility-truth-all-scopes-request` and `facility-truth-all-scopes-response` fixtures in `tests/conformance/fixtures/valid/` that exercise every Facility Truth scope and every content sub-resource (`profile_summary`, `hours`, `services`, `service_area`, `contact_methods`, `booking_methods`, `acceptance_criteria`, `policy_summaries`) in a single response.
- Conformance runner `containsPetId` subject-boundary scan now also matches the substring `pet_id` (case-insensitive) inside string values — not only the JSON key — so the scan rejects `pet_id` embedded in free-text `reasons`, omission `detail`, or provenance fields on Facility Truth responses.
- Implementer guide guidance: v1 Facility Truth servers MUST silently accept and ignore a `grant_id` on the request (do NOT hard-reject) so future partner-only scope rollouts that mandate `grant_id` remain forward-compatible.

### Changed

- `CareNetworkActorTypeField` and `pickup_actor_type` now reference the shared `CareNetworkActorType` `$def` instead of re-inlining the 9-value enum at each use site.
- The conformance runner refactored its four near-identical grant/request consistency blocks into a single `grantRequestPairs` table.

### Compatibility

- Adding required actor-type fields is a breaking change against any implementation pinned to the pre-`Unreleased` `v0.1.0-draft` schemas. Implementers must add the new fields to outgoing requests, grants, and authorization decisions before upgrading.
- Pre-existing schema invariants (envelope shape, status/decision/context/omissions consistency, commerce-safe rule, grant lifecycle) are unchanged.
- New Facility Truth `Scope`, `Purpose`, `VisibilityClass`, and `OmissionReasonCode` enum members are additive. Pre-existing implementations that hard-coded the closed enum sets will not recognize the new values; implementers should treat unknown enum values as forward-compatible signals when reading.
- Facility Truth v1 does NOT require a `PermissionGrant`. Implementers should not assume the v1 no-grant semantics generalize to deferred partner-only Facility Truth scopes (certifications, insurance statements, capacity status, staff credentials), which will introduce a `facility_partner_visible` class and a partner-only grant shape (likely an additive `subject_facility_id` on `PermissionGrant`).
- `pet_id` was removed from the base `AuthorizationDecision` `required` array to accommodate Facility Truth (which uses `facility_id` instead). Each pet-bound profile's response wrapper now re-requires `pet_id` via its own `allOf` overlay; the per-profile contract is unchanged. Implementers validating against the bare `AuthorizationDecision` `$def` (rather than against a profile response wrapper) will see this as a loosening — validate against profile response wrappers, not the bare `$def`. `FacilityTruthResponse.authorization_decision` additionally forbids `pet_id` outright (`properties: { pet_id: false }`), so the canonical schema rejects any `pet_id` on a Facility Truth response without relying on the conformance runner.
- `ok` and `partial` Facility Truth responses now require at least one content sub-resource (`profile_summary`, `hours`, `services`, `service_area`, `contact_methods`, `booking_methods`, `acceptance_criteria`, or `policy_summaries`) inside `facility_truth_context`. A `facility_truth_context` containing only `facility_id` and `metadata` is rejected.
- `facility.booking_links.read` was renamed to `facility.booking_methods.read` to match the canonical field name (`booking_methods` / `FacilityBookingMethod`). Pre-1.0 rename; implementers consuming the prior name must update their scope strings.
- `not_verified` and `not_applicable` are cross-profile additions to `OmissionReasonCode`. They were introduced for Facility Truth but are available to any profile that surfaces freshness-bound or subject-conditional data.

## v0.1.0-draft - 2026-05-04

Initial design-partner review draft.

### Added

- Draft Companion Context Protocol specification.
- Commerce Context Profile for product recommendation and filtering.
- First Care Facility boarding-preparation schema slice.
- Canonical JSON Schemas for core CCP objects, Commerce Context requests and responses, Care Facility Context requests and responses, and permission grants.
- Vendor-neutral grant, request, partial response, and denied response examples for Commerce Context and the first Care Facility slice.
- Positive and negative conformance fixtures.
- Conformance runner wired into `npm test`.
- OpenAPI Commerce Context and Care Facility Context adapter sketches.
- MCP Commerce Context and Care Facility Context tool sketches.
- Commerce Context and Care Facility Context server implementer guides.
- Draft TypeScript package with exported types and AJV validator helpers.
- Draft Python package with schema-loading helpers and packaged schema snapshots.
- Public-facing governance, security, code of conduct, and Apache-2.0 license.
- Public launch checklist, design-partner outreach notes, Care Facility review packet, and Care Facility feedback triage log.
- GitHub issue templates and pull request template.

### Current Gate

- Ready for private design-partner review.
- Not yet stable-standard ready.
- Not yet broad-announcement ready.

### Before Broad Launch

- Review the Commerce Context Profile with 2-3 design partners.
- Review the first Care Facility boarding-preparation slice with 2-3 design partners.
- Triage accepted, deferred, and rejected feedback.
- Complete remaining public launch checklist items after partner review.
