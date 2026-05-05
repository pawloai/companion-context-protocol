# Known Compatibility Risks

Status: Draft, pre-1.0

CCP is `0.1.0-draft`. Draft versions may change incompatibly while the first profile, schema contract, and conformance expectations are refined. This document lists the known surfaces where implementers should expect change before a stable `1.0` release, and how to insulate an implementation against those changes.

The canonical contract is JSON Schema. When in doubt, validate against the schemas shipped in `schemas/` rather than against any prose, adapter sketch, or package type.

## Versioning Signals

- The protocol version string `0.1.0-draft` appears in `SPEC.md`, `package.json`, `MAINTAINERS.md` references, OpenAPI `info.version` and `x-ccp-version`, MCP `ccp_version`, and Python `CCP_VERSION`. Treat all six as one signal — they move together.
- Draft tags use the `vX.Y.Z-draft` form (currently `v0.1.0-draft`). Tags without `-draft` will signal the first stable line.
- Breaking changes within the draft line are listed in `CHANGELOG.md`. Implementers should diff their pinned draft against the current draft when upgrading.

## Schema Surfaces Likely To Change

The conformance runner enforces today's invariants. The following surfaces are the most likely to expand or tighten before `1.0`:

### Enum sets (additive)

These enums are expected to grow as new profiles land. Implementers should treat unknown values as forward-compatible signals rather than errors when reading, and should never hard-code the full set in production code:

- `VisibilityClass` — currently 11 classes (`owner_visible`, `caregiver_visible`, `staff_only`, `vet_shareable`, `facility_shareable`, `commerce_safe`, `care_network_visible`, `contact_shareable`, `action_authorization_visible`, `agent_summary_only`, `restricted_sensitive`). New profiles (vet export, medication administration, etc.) may add classes, and precedence rules may extend.
- `Scope` — currently includes commerce-safe scopes, the first care-facility boarding-preparation slice, the care-facility pickup-verification slice (single-scope `pet.pickup_authorization.read`), and the care-network lookup slice (`pet.care_network.actor_refs.read`, `pet.care_network.relationships.read`, `pet.care_network.contact_channels.read`, `pet.care_network.action_authorizations.read`, `pet.care_network.revocation_status.read`). Future profiles will add wellness, vet export, facility writeback, medication administration, and payment-authority scopes.
- `Purpose` — currently `product_recommendation`, `product_filtering`, `boarding_preparation`, `pickup_verification`, and `care_network_lookup`. Other profiles will add their own purposes.
- `OmissionReasonCode` — currently 11 reasons. Future profiles may add reason codes for profile-specific omissions.

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

### Response status / decision / context consistency

The current invariant set (`ok` / `partial` / `denied` consistency, denied requires null context plus omissions, partial requires non-null context plus omissions) is load-bearing and will not be relaxed. Future drafts may add new status values for asynchronous flows.

### Permission grant lifecycle

`status: active` is incompatible with `revoked_at`; expired grants must carry `expires_at`; revoked grants must carry `revoked_at`. These constraints will not be loosened. Future drafts may add states (e.g., `pending`, `suspended`) for multi-party consent.

### Commerce-safe rule

Every field in a returned `commerce_context` must include `commerce_safe` and must not include `staff_only` or `restricted_sensitive`. This is load-bearing for the Commerce Context Profile and will not be relaxed. Other profiles will define their own equivalent rules.

### Facility-shareable rule

Every field in a returned `care_facility_context` or `pickup_verification_context` must include `facility_shareable` and must not include `staff_only` or `restricted_sensitive`. The boarding-preparation slice and the pickup-verification slice each preserve their own facility, service-window, purpose, scope, provenance, and omission boundaries.

### Care-network visibility rule

Every field in a returned `care_network_context` must include at least one of `care_network_visible`, `contact_shareable`, or `action_authorization_visible`, and must not include `staff_only` or `restricted_sensitive`. Care-network and commerce-context endpoints must be independently access-controlled — care-network visibility classes do not imply commerce safety, and commerce visibility does not imply care-network access.

## Profile Boundary

The Commerce Context Profile's exclusions (staff notes, full wellness timelines, diagnosis or treatment history, billing data, household data, sensitive facility operations data, raw `agent_summary_only` observations) are intentional. Broadening them requires a new profile with its own scopes, purpose rules, visibility behavior, and conformance fixtures. Implementers should not expect these exclusions to soften within Commerce Context.

The boarding-preparation Care Facility Context slice's exclusions (medication administration, facility observation writeback, full wellness timelines, diagnosis or treatment history, billing data, payment authority, identity document copies, unrelated household data, and staff-only records) are intentional. Broadening them requires additional scopes, purpose rules, visibility behavior, and conformance fixtures.

The Care Facility Pickup Verification slice's exclusions (feeding instructions, medication administration, billing, payment authority, household context, identity-document copies and numbers, broader care history, wellness timeline, diagnosis history, treatment history, vaccination records unless separately requested, unrelated emergency contacts, unrelated Care Network contacts, staff-only notes, internal facility notes from other providers, raw behavioral incident records, and free-text denial details that reveal restricted source content) are intentional. The slice answers only whether release to the requested actor is allowed for the requested pickup context.

The Care Network Lookup slice's exclusions (household data, staff-only records, sensitive provenance references, unrelated contacts outside the requested subject actor, billing, payment authority, medical or treatment context, and free-text denial details that reveal restricted source content) are intentional. The slice answers only whether the requested subject actor's relationship, contact channels, action authorizations, or revocation status are visible for the declared purpose.

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

- The schema `$id` `https://companioncontext.org/schemas/ccp-core.schema.json` is reserved but does not currently serve the schema document. Do not fetch schemas by `$id`. Vendor the schemas instead (the TypeScript and Python packages do this).
- The example server URL (`https://example.com/ccp/v0`) and any `example://` provenance URIs in fixtures are illustrative only.
- The public source repository URL is not yet published (see `MAINTAINERS.md`). Do not embed a repository URL in package metadata until that URL resolves for unauthenticated users.

## Security And Privacy Surfaces

These are not "compatibility risks" in the schema sense, but they affect what an implementation can safely upgrade through:

- The "no real data" rule applies to every example, fixture, issue, PR, screenshot, and design note. Future drafts will not relax it.
- `authorization_decision.reasons` and omission `detail` strings must not contain restricted source content. This is load-bearing.
- Security-relevant clarifications may be made without preserving compatibility with earlier draft examples (`SECURITY.md`).

## How To Insulate An Implementation

- Validate request and response objects against the canonical JSON Schemas every time, not against package types or adapter docstrings.
- Treat unknown enum values as forward-compatible when reading, and reject them on write.
- Pin a draft version (`v0.1.0-draft` today) and upgrade deliberately by diffing `CHANGELOG.md`.
- Run `npm test` from a clean checkout against any draft you ship against — all six suites should pass.
- Do not hard-code adapter conventions (paths, headers, tool names) as compatibility checks. Validate the canonical request/response shapes instead.
- Watch the profile boundary: adding sensitive context to a Commerce Context response is a profile change, not a field change.
