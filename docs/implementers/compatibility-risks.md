# Known Compatibility Risks

Status: Draft, pre-1.0

CCP is `0.1.0-draft`. Draft versions may change incompatibly while the current profile slices, schema contract, and conformance expectations are refined. This document lists the known surfaces where implementers should expect change before a stable `1.0` release, and how to insulate an implementation against those changes.

The canonical contract is JSON Schema. When in doubt, validate against the schemas shipped in `schemas/` rather than against any prose, adapter sketch, or package type.

## Versioning Signals

- The protocol version string `0.1.0-draft` appears in `SPEC.md`, `package.json`, `MAINTAINERS.md` references, OpenAPI `info.version` and `x-ccp-version`, MCP `ccp_version`, and Python `CCP_VERSION`. Treat all six as one signal — they move together.
- Draft tags use the `vX.Y.Z-draft` form (currently `v0.1.0-draft`). Tags without `-draft` will signal the first stable line.
- Breaking changes within the draft line are listed in `CHANGELOG.md`. Implementers should diff their pinned draft against the current draft when upgrading.

## Decisions Needed Before 1.0

Some surfaces in `0.1.0-draft` are not "likely to change additively" or "likely to tighten" — they are unresolved design questions where the protocol intentionally has not committed to a primitive. They are distinct from the additive enum and shape-evolution surfaces below: those describe directions a stable shape will move, while these describe holes the stable line cannot ship with. Implementers building against the draft will each invent their own answer, and that is where interoperability will silently break.

### PermissionGrant transport, proof, and revocation propagation

The canonical schema defines record shape only. An implementer reading `0.1.0-draft` end-to-end does not learn how grants move between systems. Four sub-decisions remain open:

- **Issuance** — who is entitled to issue a grant for which subject, with what authentication, and in what serialized format. `SPEC.md` Conformance Requirements require servers to verify `grantor_actor_type` against the authenticated identity of the issuer at issuance time, but the verification itself is unserialized; the grant carries no field recording how it was performed.
- **Storage** — whether the grant lives issuer-side, requester-side, both, or behind a third-party introspection endpoint, and how a consumer resolves a presented `grant_id` to current grant state.
- **Possession** — how a requester proves it is the intended grantee of a presented grant. Today the schema carries `grantee_actor_id` and `grantee_actor_type` but no proof-of-possession field; `grant_id` is treated as a lookup key, not a bearer secret.
- **Revocation propagation** — how revocation reaches consumers that may have observed or cached a prior `allowed` decision, and what freshness window a consumer must honor before re-checking grant state.

Candidate primitives are under evaluation. None are endorsed in `0.1.0-draft`:

- **Signed JWT with `cnf` (RFC 7800)** — minimal moving parts and established tooling; fits the existing "`grant_id` is a lookup key, not a bearer secret" stance; does not by itself answer revocation freshness.
- **OAuth 2.0 with token introspection (RFC 7662)** — provides revocation freshness and a third-party introspection endpoint shape, but drags in substantial OAuth surface area (authorization endpoint, client registration, token formats) that CCP does not otherwise need.
- **UCAN** — fits the multi-party delegation shape (caregiver delegating pickup, owner delegating to a merchant) but the ecosystem is small and the tooling story for non-Web3 deployments is thin.
- **Hybrid (JWT + `cnf` + introspection)** — JWT with `cnf` for transport and proof-of-possession, an OAuth-style introspection endpoint for revocation freshness. Covers both gaps but is the largest surface to specify and adopt.

Until a primitive is selected, compatible servers MUST treat `grant_id` as a lookup key into trusted authorization state, MUST fail closed when issuer authority, requester identity, subject pet, purpose, scopes, facility boundary, service window, expiration, or revocation state cannot be verified, and SHOULD assume that cross-organization grant portability depends on out-of-band trust between issuer and consumer. A future draft may add a `grantor_verification_method` (or equivalent) once proof-of-possession lands. Facility Truth v1 does not require a `PermissionGrant`, so this decision does not gate Facility Truth adoption, but it must resolve before Commerce Context, Care Facility Context (boarding-preparation and pickup-verification), or Care Network Lookup can interoperate across organizations.

Tracked in GitHub issue #6.

### Cross-profile inference controls

The visibility-precedence rules in `SPEC.md` (rules 6, 8, 10, 12) prevent many single-response leaks. They do not prevent a requester who holds grants for more than one profile — or who can make repeated calls within a single profile — from correlating omissions, partial responses, freshness timestamps, and summaries across calls to reconstruct restricted context. The canonical schemas cannot detect cross-call correlation; only the authorization layer can. `THREAT_MODEL.md` §Cross-Profile Inference acknowledges the gap, and `SPEC.md` Conformance Requirements now state that servers MUST NOT rely on per-profile narrowness alone, but `0.1.0-draft` does not commit to a specific cross-profile correlation mechanism. Four sub-decisions remain open:

- **Correlation identifier** — whether requests carry a standard cross-profile correlation field (candidate names: `correlation_token`, `requester_session_id`, `abuse_review_id`) that lets independent profile servers operated by different teams join authorization records into a shared abuse-review pipeline without bilateral coordination, or whether each integrator invents its own join key.
- **Per-requester rate-limit envelope** — whether `0.2` defines a minimum rate-limit and back-off contract across authorized profiles for the same requester, or leaves the envelope to deployment policy. The trade-off is interop predictability versus deployment freedom on systems with very different traffic profiles.
- **Per-request minimization guidance** — whether `0.2` tightens "return only fields the purpose needs" from a `SHOULD` into machine-checkable behavior (e.g., per-purpose minimum-required-field tables, or a `minimization_profile` field), or leaves it as policy.
- **Profile-combination policy** — whether `0.2` adds explicit rules for what a single requester is allowed to hold grants for simultaneously (e.g., disallow holding a commerce grant and a care-facility grant for the same pet under the same requester identity without a higher-trust attestation), or treats profile combinations as wholly a deployment decision.

Candidate primitives are under evaluation. None are endorsed in `0.1.0-draft`:

- **Standard optional `correlation_token` request field** — a low-surface addition: each profile request schema gains one optional opaque-string field that profile servers MAY log alongside authorization decisions. Cheap to specify and adopt; does not by itself enforce rate limits or minimization, and creates a new privacy surface if the token is owner-derived rather than requester-derived.
- **Per-requester rate-limit headers** (e.g., `CCP-Requester-Quota-Remaining`, `CCP-Requester-Quota-Window`) — gives clients backpressure signals across profiles, but lives at the transport layer (HTTP/MCP) rather than in the canonical contract, and depends on the rate-limit envelope decision above.
- **Server-internal correlation join (no protocol change)** — each deployment correlates by its own infrastructure (authenticated principal, IP, fingerprint). Zero protocol surface, zero standardization, and cross-organization abuse review remains unsolved.
- **Hybrid** — optional `correlation_token` for cross-organization joins plus rate-limit headers for backpressure; leaves minimization and profile-combination policy to a later draft. Largest surface to specify and adopt, but covers two of the four gaps.

Until a primitive is selected, compatible servers SHOULD apply correlation-aware authorization logging using their own internal identifiers (authenticated principal, request ID, deployment-internal session ID), SHOULD apply per-requester rate limits across all profiles they authorize for the same principal, and SHOULD minimize returned fields to the declared purpose even when the granted scopes would allow more. Implementers serving multiple profiles SHOULD treat cross-profile access for the same requester as a higher-scrutiny authorization decision rather than the union of independent per-profile decisions. See `docs/implementers/cross-profile-inference.md` for a worked attack-and-defense example.

Tracked in GitHub issue #7.

## Schema Surfaces Likely To Change

The conformance runner enforces today's invariants. The following surfaces are the most likely to expand or tighten before `1.0`:

### Enum sets (additive)

These enums are expected to grow as new profiles land. Implementers should treat unknown values as forward-compatible signals rather than errors when reading, and should never hard-code the full set in production code:

- `VisibilityClass` — currently 12 classes (`owner_visible`, `caregiver_visible`, `staff_only`, `vet_shareable`, `facility_shareable`, `commerce_safe`, `care_network_visible`, `contact_shareable`, `action_authorization_visible`, `facility_public`, `agent_summary_only`, `restricted_sensitive`). New profiles (vet export, medication administration, partner-only Facility Truth with `facility_partner_visible`, etc.) may add classes, and precedence rules may extend.
- `ActorType` — currently 7 values (`owner`, `caregiver`, `facility`, `merchant`, `agent_client`, `service_integration`, `vet`). Required on every request, grant, and authorization decision. Expected to evolve as new profiles add trust postures (e.g., `vet` may later split into `vet_staff` / `vet_organization`, or new postures may be added for shelters, insurers, or municipal systems). The `vet` value is presently a reserved placeholder with no scope, purpose, or flow defined; per `SPEC.md` Conformance Requirements servers MUST reject `requester_actor_type: "vet"` until a vet-export profile lands — this rule lives in implementer policy because the schema enum still admits the value. Implementers should treat unknown actor types as forward-compatible signals when reading and reject them on write; servers should also reject requests whose `requester_actor_type` does not match the grant's `grantee_actor_type`. For `0.1.0-draft` implementers MUST hard-fail mismatches; the `grantee_actor_type == requester_actor_type` equality may evolve in a future draft if class-of-actor grants are introduced, but any such relaxation MUST still bind each redemption to a verified specific principal — a class grant cannot be freely redeemable by any actor who asserts class membership.
- `CareNetworkActorType` — care-network/pickup relationship enum (9 values: `owner`, `caregiver`, `family_contact`, `friend_contact`, `pickup_contact`, `emergency_contact`, `facility_staff`, `organization`, `integration_client`). Separate namespace from `ActorType` because it describes a relationship to a pet, not a requester trust posture. Used by `PickupActor.actor_type`, `CareFacilityPickupVerificationRequest.pickup_actor_type`, and (via `CareNetworkActorTypeField`) `CareNetworkActorRef.actor_type`. Per `SPEC.md` a care-network relationship value MUST NOT be used to infer a global `ActorType`. Expected to grow as care-network coverage extends (e.g., `shelter_contact`, `vet_contact`).
- `Scope` — currently includes commerce-safe scopes, the first care-facility boarding-preparation slice, the care-facility pickup-verification slice (single-scope `pet.pickup_authorization.read`), the care-network lookup slice (`pet.care_network.actor_refs.read`, `pet.care_network.relationships.read`, `pet.care_network.contact_channels.read`, `pet.care_network.action_authorizations.read`, `pet.care_network.revocation_status.read`), and the eight Facility Truth public-fact scopes (`facility.profile.read`, `facility.hours.read`, `facility.services.read`, `facility.contact_methods.read`, `facility.service_area.read`, `facility.acceptance_criteria.read`, `facility.booking_methods.read`, `facility.policies.summary.read`). Future profiles will add wellness, vet export, facility writeback, medication administration, payment-authority, and partner-only Facility Truth scopes (certifications, insurance statements, capacity status, staff credentials).
- `Purpose` — currently `product_recommendation`, `product_filtering`, `boarding_preparation`, `pickup_verification`, `care_network_lookup`, and `facility_truth_lookup`. Other profiles will add their own purposes.
- `OmissionReasonCode` — currently 13 reasons (adds `not_verified` and `not_applicable` for Facility Truth). Future profiles may add reason codes for profile-specific omissions.

### Field envelope

The `{ value, visibility, provenance }` envelope shape is stable for the Commerce Context Profile. Identifiers like `pet_id` remain plain strings. Risks:

- Additional envelope-level metadata (e.g., freshness, confidence) may be promoted from `ContextProvenance` into the envelope.
- New field envelope shapes may be introduced for object-valued fields if existing primitive envelopes prove insufficient.

### Provenance

- `source_type: generated` requires `source_system` and `derived_from` today. Other source types may gain similar required fields.
- `derived_from` URI form is illustrative. Implementations should not parse those strings — they are opaque source-record references.
- `confidence`, `stale_after`, `verified_at`, and `source_record_ref` are optional today and may become required for specific source types.

### Authorization decision

`authorization_decision` shape may evolve. Likely additions:

- More structured `reasons` (currently free-text array) — implementers should not parse human-readable reasons.
- Per-scope decision granularity beyond `applied_scopes` / `denied_scopes`.
- Stronger evaluator metadata (policy version, evaluator id).

Subject identifier change in this draft: `pet_id` was moved out of the base `AuthorizationDecision` `required` array to accommodate Facility Truth, which uses `facility_id` as its subject identifier instead. Each pet-bound profile's response wrapper now re-requires `pet_id` via its own `allOf` overlay; the per-profile contract is unchanged. Implementers validating against the bare `AuthorizationDecision` `$def` (rather than against a profile response wrapper) will see this as a loosening — bare-base validators that previously rejected an `AuthorizationDecision` lacking `pet_id` now accept it. Validate against profile response wrappers, not the bare `$def`.

### Response status / decision / context consistency

The current invariant set (`ok` / `partial` / `denied` consistency, denied requires null context plus omissions, partial requires non-null context plus omissions) is load-bearing and will not be relaxed. Future drafts may add new status values for asynchronous flows.

### Permission grant lifecycle

`status: active` is incompatible with `revoked_at`; expired grants must carry `expires_at`; revoked grants must carry `revoked_at`. These constraints will not be loosened. Future drafts may add states (e.g., `pending`, `suspended`) for multi-party consent.

Grant transport, proof-of-possession, and revocation propagation are intentionally not standardized in `0.1.0-draft`. They are covered separately under `## Decisions Needed Before 1.0` above, because they are an unresolved design question rather than a forward-compatible shape evolution.

### Commerce-safe rule

Every field in a returned `commerce_context` must include `commerce_safe` and must not include `staff_only` or `restricted_sensitive`. This is load-bearing for the Commerce Context Profile and will not be relaxed. Other profiles will define their own equivalent rules.

### Facility-shareable rule

Every field in a returned `care_facility_context` or `pickup_verification_context` must include `facility_shareable` and must not include `staff_only` or `restricted_sensitive`. The boarding-preparation slice and the pickup-verification slice each preserve their own facility, service-window, purpose, scope, provenance, and omission boundaries. `FacilityStringField` and `FacilityStringArrayField` value content is filtered through `SensitiveKeywordPattern` so that array entries cannot smuggle banned keywords (billing, payment, household, medical, diagnosis, treatment, staff-only / staff-note, relationship-dispute, custody, identity-document) past the visibility check.

### Care-network visibility rule

Every field in a returned `care_network_context` must include at least one of `care_network_visible`, `contact_shareable`, or `action_authorization_visible`, and must not include `staff_only` or `restricted_sensitive`. Care-network and commerce-context endpoints must be independently access-controlled — care-network visibility classes do not imply commerce safety, and commerce visibility does not imply care-network access.

### Facility-public rule

Every field in a returned `facility_truth_context` MUST include `facility_public` and MUST NOT include `staff_only`, `restricted_sensitive`, `commerce_safe`, `facility_shareable`, `care_network_visible`, `contact_shareable`, `action_authorization_visible`, `owner_visible`, `caregiver_visible`, `vet_shareable`, or `agent_summary_only` (Facility Truth fields are facility-subject, not pet- or owner-subject, so pet-centric or summary-only classes are semantically incoherent and rejected by the canonical schema). Every Facility Truth field's provenance MUST carry `verified_at`, which MUST be a real past UTC timestamp recorded by the facility — not the request time or a future placeholder. The Facility Truth response must not include `pet_id` anywhere; the canonical schema rejects `pet_id` on `facility_truth_context` and on `authorization_decision`, and the conformance runner additionally scans the full response for any stray `pet_id` key. Facility Truth endpoints must be independently access-controlled — `facility_public` does not imply commerce safety, care-network access, or facility-shareable status. v1 covers public-fact scopes only and does not require a `PermissionGrant`; partner-only scopes are deferred and will need their own grant shape.

## Profile Boundary

The Commerce Context Profile's exclusions (staff notes, full wellness timelines, diagnosis or treatment history, billing data, household data, sensitive facility operations data, raw `agent_summary_only` observations) are intentional. Broadening them requires a new profile with its own scopes, purpose rules, visibility behavior, and conformance fixtures. Implementers should not expect these exclusions to soften within Commerce Context.

The boarding-preparation Care Facility Context slice's exclusions (medication administration, facility observation writeback, full wellness timelines, diagnosis or treatment history, billing data, payment authority, identity document copies, unrelated household data, and staff-only records) are intentional. Broadening them requires additional scopes, purpose rules, visibility behavior, and conformance fixtures.

The Care Facility Pickup Verification slice's exclusions (feeding instructions, medication administration, billing, payment authority, household context, identity-document copies and numbers, broader care history, wellness timeline, diagnosis history, treatment history, vaccination records unless separately requested, unrelated emergency contacts, unrelated Care Network contacts, staff-only notes, internal facility notes from other providers, raw behavioral incident records, and free-text denial details that reveal restricted source content) are intentional. The slice answers only whether release to the requested actor is allowed for the requested pickup context.

The Care Network Lookup slice's exclusions (household data, staff-only records, sensitive provenance references, unrelated contacts outside the requested subject actor, billing, payment authority, medical or treatment context, and free-text denial details that reveal restricted source content) are intentional. The slice answers only whether the requested subject actor's relationship, contact channels, action authorizations, or revocation status are visible for the declared purpose.

The Facility Truth profile's exclusions (pet-specific context of any kind, owner or household records, care-network records, staff identities or schedules or credentials, internal capacity models or live availability counts, billing data, payment authority, identity-document data, medical or wellness history, diagnosis history, treatment history, sensitive relationship narratives, and free-text denial details that reveal restricted source content) are intentional. The profile answers only whether the requested facility's public-fact context (profile, hours, services, contacts, service area, acceptance criteria, booking methods, policy summaries) is current and visible for the declared `facility_truth_lookup` purpose.

Facility Truth v1 covers public-fact scopes only. Adding higher-scrutiny scopes (e.g., `facility.certifications.read`) will require introducing a `facility_partner_visible` class and a partner-only grant shape — most likely an additive `subject_facility_id` on `PermissionGrant`. Implementers should not assume the v1 no-grant semantics generalize to those future scopes.

### Cross-profile inference

Cross-profile inference is an unresolved design question rather than a profile-boundary tightening, and it is covered under `## Decisions Needed Before 1.0` §Cross-profile inference controls above. The short version: the canonical schemas cannot detect cross-call correlation, so combined profile access is a server-side policy decision. `SPEC.md` Conformance Requirements now state that servers MUST NOT rely on per-profile narrowness alone; the open sub-decisions (correlation identifier, rate-limit envelope, minimization guidance, profile-combination policy) and candidate primitives are catalogued in the Decisions section, and `docs/implementers/cross-profile-inference.md` carries a worked attack-and-defense example.

## Adapter Compatibility

Adapter sketches are illustrative. They preserve canonical CCP semantics but their surface shapes are not normative.

### OpenAPI

- `POST /commerce-context`, `POST /care-facility-context`, and the optional `GET /permission-grants/{grant_id}` are recommended path conventions, not required. Implementers may host CCP behind any HTTP path.
- `x-ccp-*` extensions (`x-ccp-version`, `x-ccp-profile`, `x-ccp-required-scope`, `x-ccp-canonical-request-schema`, `x-ccp-canonical-response-schema`) are illustrative metadata. They are not required for compatibility.
- `CCP-Version`, `CCP-Profile`, and `X-Request-Id` headers are optional today. They may become required in a stable line if version negotiation matures.
- The `bearerAuth` scheme is illustrative. CCP does not define authentication.
- Error responses (4xx / 5xx) follow ordinary HTTP semantics; they do not replace CCP `denied` envelopes for protocol-level denials.

### MCP

- Tool names `ccp_commerce_context_request`, `ccp_care_facility_context_request`, `ccp_care_facility_pickup_verification_request`, `ccp_care_network_lookup_request`, and `ccp_permission_grant_get` are recommended snake_case names. The conformance runner enforces the relevant request tool plus grant lookup tool in each adapter sketch today, except for the pickup-verification and care-network-lookup adapter sketches which intentionally omit the grant lookup tool.
- Tool input/output schemas reference canonical `$defs` via `../schemas/ccp-core.schema.json#/$defs/...`. The path prefix is enforced today.
- `annotations.readOnlyHint`, `idempotentHint`, and similar are illustrative MCP metadata, not normative.

## Package Compatibility

The packages in `packages/typescript/` and `packages/python/` are draft helpers, not normative artifacts.

### TypeScript

- The hand-written types (`CommerceContextRequest`, `PetProfile`, etc.) may be replaced by generated types in a future draft. If hand-written types drift from the JSON Schemas, the schemas win.
- Exported AJV factory helpers (`createCcpAjv`, `createCommerceContextRequestValidator`, etc.) are conveniences over packaged schema snapshots. The packaged snapshots are kept in sync with `schemas/` by `npm run test:typescript`, but implementers who pin a package version pin a schema snapshot — upgrade together.
- The `@companion-context-protocol/typescript` workspace name and `0.1.0-draft` version may change before the package publishes to npm. Do not depend on the unpublished package metadata yet.

### Python

- The Python package exposes only schema-loading helpers today — no runtime models. Implementers must validate request, response, and grant objects against JSON Schema, not against Python types.
- Future drafts are likely to add Pydantic models generated from the canonical schemas. Generated models will preserve the schema contract but may break manual model code that anticipated a different shape.
- Packaged schema snapshots in `packages/python/src/ccp_types/json_schemas/` are checked against the canonical repository schemas in `npm run test:python`. As with TypeScript, pinning a package version pins a snapshot.

## URL And Identifier Surfaces

- The canonical schemas are published at their `$id` URLs under `https://companioncontext.org/schemas/`. The published URLs are stable identifiers for the current draft; implementers may fetch them, but vendoring is strongly recommended for build-time validation, offline determinism, and reproducible releases (the TypeScript and Python packages do this). The published copy may move ahead of any vendored snapshot before `1.0`, so treat snapshot drift as expected and gate upgrades on a re-run of the conformance suite.
- The example server URL (`https://example.com/ccp/v0`) and any `example://` provenance URIs in fixtures are illustrative only.
- The public source repository is the repository containing this file. Do not move package metadata, release tags, or public references to personal forks.

## Security And Privacy Surfaces

These are not "compatibility risks" in the schema sense, but they affect what an implementation can safely upgrade through:

- The "no real data" rule applies to every example, fixture, issue, PR, screenshot, and design note. Future drafts will not relax it.
- `authorization_decision.reasons` and omission `detail` strings must not contain restricted source content. This is load-bearing. The pickup-verification, care-network-lookup, and facility-truth response schemas enforce this with a `SensitiveKeywordPattern` overlay (the facility-truth schema additionally constrains every returned-field `value` and the provenance `source_system`, `source_record_ref`, and `derived_from` strings); the commerce-context and care-facility-boarding-preparation response schemas leave the constraint to the implementer because their omission detail strings legitimately reference excluded categories by name (for example, "Diagnosis history is not needed for boarding preparation"). Implementers of either older slice MUST still avoid embedding restricted source content in those strings even though the schema does not currently reject it.
- See `THREAT_MODEL.md` for current assumptions about actor trust, grant transport gaps, and cross-profile inference risks.
- Security-relevant clarifications may be made without preserving compatibility with earlier draft examples (`SECURITY.md`).

## How To Insulate An Implementation

- Validate request and response objects against the canonical JSON Schemas every time, not against package types or adapter docstrings.
- Treat unknown enum values as forward-compatible when reading, and reject them on write.
- Pin a draft version (`v0.1.0-draft` today) and upgrade deliberately by diffing `CHANGELOG.md`.
- Run `npm test` from a clean checkout against any draft you ship against — all six suites should pass.
- Walk `docs/implementers/conformance-checklist.md` for the requirements the runner cannot reach (principal binding, grantor-binding-at-issuance, vet rejection, restricted-content hygiene). Treat those as integration-test or runtime-authorization gates on your side.
- Do not hard-code adapter conventions (paths, headers, tool names) as compatibility checks. Validate the canonical request/response shapes instead.
- Watch the profile boundary: adding sensitive context to a Commerce Context response is a profile change, not a field change.
