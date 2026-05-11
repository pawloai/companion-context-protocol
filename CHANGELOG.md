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

### Changed

- `CareNetworkActorTypeField` and `pickup_actor_type` now reference the shared `CareNetworkActorType` `$def` instead of re-inlining the 9-value enum at each use site.
- The conformance runner refactored its four near-identical grant/request consistency blocks into a single `grantRequestPairs` table.

### Compatibility

- Adding required actor-type fields is a breaking change against any implementation pinned to the pre-`Unreleased` `v0.1.0-draft` schemas. Implementers must add the new fields to outgoing requests, grants, and authorization decisions before upgrading.
- Pre-existing schema invariants (envelope shape, status/decision/context/omissions consistency, commerce-safe rule, grant lifecycle) are unchanged.

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
