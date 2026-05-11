# Plan: Promote Facility Truth from design draft to v1 schema-backed profile (gh #5)

## Context

The Companion Context Protocol currently ships four schema-backed profiles (Commerce Context, Care Facility Context, Care Facility Pickup Verification, Care Network Lookup). Facility Truth — public/operational facility facts (hours, services, contact methods, etc.) — is documented only as a non-normative design draft (`docs/design/2026-05-05-facility-truth-profile.md`) and is flagged in `SPEC.md:149-151` and `docs/implementers/compatibility-risks.md:83` as a design candidate.

Issue #5 argues — and the user has confirmed via three clarifying answers — that Facility Truth is the strongest v1 candidate because:
- Its v1 scope (public-fact subset only) needs no `PermissionGrant`, so it sidesteps the unresolved grant-transport question that gates pet-specific profiles.
- It has a standalone value proposition (a single facility can publish accurate provenance-backed facts without waiting on a counterparty).
- The agent-grounding pain (hallucinated hours, services, eligibility, certifications) is present and measurable today.

This plan promotes the design draft to a full v1 profile on the same footing as the existing four.

### User-confirmed v1 design choices

1. **Grant model:** `grant_id` is **optional** on `FacilityTruthRequest`. v1 ships only public-fact scopes, so grants are not required for any v1 scope. The schema makes `grant_id` optional and reserves room for a scope-conditional rule when partner-only scopes are added later.
2. **Scope set:** the 8 "public or low-risk" scopes from the design doc — `facility.profile.read`, `facility.hours.read`, `facility.services.read`, `facility.contact_methods.read`, `facility.service_area.read`, `facility.acceptance_criteria.read`, `facility.booking_links.read`, `facility.policies.summary.read`. All higher-scrutiny scopes (certifications, insurance, capacity, staff credentials) are deferred.
3. **Purposes:** single umbrella purpose `facility_truth_lookup`. Matches existing CCP one-purpose-per-profile convention.

### Derived design choices (not asked, called out for review)

4. **Visibility class:** introduce one new class, `facility_public`, with a "facility-public rule" mirroring the commerce-safe rule — every Facility Truth context field MUST include `facility_public` in `visibility` and MUST NOT include `staff_only` or `restricted_sensitive`. Defer `facility_partner_visible` until partner-only scopes ship.
5. **Omission reasons:** add `not_verified` and `not_applicable` to the existing `OmissionReasonCode` enum. Reuse `not_requested`, `scope_missing`, `purpose_not_allowed`, `visibility_restricted`, `source_stale`, `not_available`.
6. **Subject identifier:** `facility_id` (plain string, same shape as `pet_id` elsewhere). The request carries **no `pet_id`** — this is the structural break from existing profiles and a load-bearing conformance rule.
7. **Freshness teeth:** define `FacilityTruthContextProvenance` as `ContextProvenance` + required `verified_at`. Every Facility Truth field's provenance MUST carry `verified_at` so that "freshness is part of safety" (from the design doc) is enforced by AJV, not only by prose.
8. **PermissionGrant shape untouched in v1.** Adding `subject_facility_id` to `PermissionGrant` is deferred until partner-only Facility Truth scopes ship; flagged in `compatibility-risks.md`.

## Files to create

### Canonical schemas

- `schemas/facility-truth-request.schema.json` — wrapper, `$ref` into `ccp-core.schema.json#/$defs/FacilityTruthRequest` (mirror of `schemas/care-network-lookup-request.schema.json`)
- `schemas/facility-truth-response.schema.json` — wrapper, `$ref` into `#/$defs/FacilityTruthResponse`

### Examples (positive)

- `examples/facility-truth-request.json` — single-facility lookup, 4–6 scopes requested
- `examples/facility-truth-response.json` — `status: ok`, all requested scopes returned, empty omissions
- `examples/facility-truth-partial-response.json` — `status: partial`, one field omitted (e.g., `source_stale`)
- `examples/facility-truth-denied-response.json` — `status: denied`, `facility_truth_context: null`, omissions explain denial (`purpose_not_allowed` or `scope_missing`)

No grant example in v1.

### Invalid fixtures (`tests/conformance/fixtures/invalid/`)

1. `facility-truth-cross-profile-visibility.json` — field's `visibility` includes `commerce_safe` (cross-profile leak)
2. `facility-truth-missing-facility-public.json` — field's `visibility` omits `facility_public` (facility-public rule)
3. `facility-truth-staff-only-visibility.json` — field's `visibility` includes `staff_only` (deny-class precedence)
4. `facility-truth-denied-response-with-context.json` — `status: denied` but `facility_truth_context` non-null
5. `facility-truth-field-missing-verified-at.json` — field provenance missing `verified_at` (freshness rule)
6. `facility-truth-broad-scope-request.json` — request includes a non-facility scope (e.g., `pet.profile.read`)
7. `facility-truth-pet-id-leak.json` — response includes a `pet_id` reference (subject-boundary rule)
8. `facility-truth-sensitive-provenance-ref.json` — provenance `source_record_ref` exposes a sensitive path (mirror of existing care-network fixture)

### Adapters

- `openapi/facility-truth.openapi.json` — POST `/facility-truth`, no grant-lookup operation. Mirror `openapi/care-network-lookup.openapi.json`.
- `mcp/facility-truth.tools.json` — single tool `ccp_facility_truth_request`, no grant-lookup tool. Mirror `mcp/care-network-lookup.tools.json`.

### Implementer guide

- `docs/implementers/facility-truth-server.md` — mirror `docs/implementers/care-network-lookup-server.md` structure (Status & Scope, Canonical Inputs/Outputs, Evaluation Order, Authorization Rules, Subject Boundary, Per-Field Evaluation, Response Status, Building Authorization Decision, Building Returned Context, Freshness, Omissions, Slice Exclusions, Public Examples, Transport Adapters, Implementation Checklist, Conformance). Critical sections: **no PermissionGrant required in v1**, **no pet context**, **`verified_at` mandatory**, **`facility_public` rule**.

## Files to modify

### `schemas/ccp-core.schema.json`

Add the following `$defs` (referencing existing patterns):

- **`FacilityTruthVisibilitySet`** — `allOf` over `VisibilitySet`, must contain `facility_public`, must not contain `staff_only`, `restricted_sensitive`, `commerce_safe`, `facility_shareable`, `care_network_visible`, `contact_shareable`, `action_authorization_visible`. Mirrors the `FacilityVisibilitySet` pattern at `ccp-core.schema.json:159-183`.
- **`FacilityTruthContextProvenance`** — `allOf` over `ContextProvenance`, additionally requires `verified_at`. Single point of freshness enforcement.
- **`FacilityTruthStringField` / `FacilityTruthStringArrayField` / `FacilityTruthBooleanField` / `FacilityTruthObjectMetadata`** — `allOf` over the generic base types, override `visibility` to `FacilityTruthVisibilitySet`, override `provenance` to `FacilityTruthContextProvenance`. Mirrors `FacilityStringField` etc. at `ccp-core.schema.json:343-358`.
- **`FacilityHours`** — object with `regular`, `holiday`, `time_zone`, `emergency_after_hours` (each a `FacilityTruthStringField` or `FacilityTruthStringArrayField`) and an `ObjectMetadata`-equivalent for the whole hours block.
- **`FacilityService`** — object: `service_type`, `display_name`, `accepted_pet_types`, `size_or_breed_constraints` (optional), `currently_offered` (boolean field), `metadata`.
- **`FacilityContactMethod`** — object: `channel_type` (enum: `phone`, `email`, `web_form`, `sms`, `chat`, `address`), `channel_value`, `purpose_label`, `metadata`.
- **`FacilityBookingMethod`** — object: `method_type` (enum: `web_url`, `phone`, `email`, `partner_integration`), `value`, `accepted_services`, `metadata`.
- **`FacilityServiceArea`** — object: `description`, `regions` (string array), `radius_km` (number field), `metadata`.
- **`FacilityPolicySummary`** — object: `policy_type` (enum: `vaccination`, `cancellation`, `intake`, `late_pickup`, `medication_handling`, `emergency_escalation`, `forms_and_waivers`), `summary` (string field), `metadata`.
- **`FacilityTruthContext`** — wrapper object: plain `facility_id` string + optional `profile_summary`, `hours`, `services` (array), `accepted_pet_types`, `service_area`, `contact_methods` (array), `booking_methods` (array), `acceptance_criteria`, `policy_summaries` (array), `metadata`.
- **`FacilityTruthRequest`** — required: `request_id`, `requester_actor_id`, `requester_actor_type`, `facility_id`, `purpose` (`const: "facility_truth_lookup"`), `scopes` (array, minItems 1, uniqueItems, items enum of 8 facility scopes). Optional: `grant_id`. **No `pet_id`.** Mirror of `CareNetworkLookupRequest` at `ccp-core.schema.json:3166`.
- **`FacilityTruthResponse`** — required: `request_id`, `status`, `authorization_decision` (overriding `purpose` to `const: "facility_truth_lookup"` and `applied_scopes`/`denied_scopes` items to the 8-scope enum), `facility_truth_context` (`anyOf` object | null), `omissions` (array with overridden `required_scope` enum). Three `if/then` branches enforcing the `ok→allowed→non-null→empty omissions`, `partial→partial→non-null→≥1`, `denied→denied→null→≥1` invariants. Mirror of `CareNetworkLookupResponse` at `ccp-core.schema.json:3234`.

Extend enums in place:

- `VisibilityClass` (line 7) — add `"facility_public"`
- `Scope` (line 23) — add the 8 `facility.*` scopes listed above
- `Purpose` (line 47) — add `"facility_truth_lookup"`
- `OmissionReasonCode` (line 57) — add `"not_verified"` and `"not_applicable"`

### `scripts/schema-names.mjs`

Add `facility-truth-request` and `facility-truth-response` so the schema-copy step (used by both TypeScript and Python packages) and the conformance/openapi/mcp runners can pick them up uniformly.

### `tests/conformance/run.mjs`

- Add four positive `cases` entries (request, ok response, partial response, denied response) and seven–eight invalid `cases` entries (`valid: false`).
- Add a `roundTripPairs` entry for the request ↔ ok response, with `contextKey: "facility_truth_context"` and `subjectKey: "facility_id"` (rather than the existing `pet_id` pairing). The existing helper at `tests/conformance/run.mjs:479-589` will need a small extension to handle the facility_id-based subject check — likely add an optional `subjectField` override per pair.
- Do **not** add to `grantRequestPairs` (Facility Truth v1 has no grant).
- Add a profile-specific subject-boundary check: response must not contain a top-level `pet_id` anywhere in the parsed JSON (analog to the keyword/sensitive-ref scans already in the runner).

### `tests/openapi/run.mjs`

Add a new entry to `adapterFiles` for `openapi/facility-truth.openapi.json` with `grantLookup: false`, profile `facility-truth`, canonical request schema `schemas/facility-truth-request.schema.json`, canonical response schema `schemas/facility-truth-response.schema.json`.

### `tests/mcp/run.mjs`

Add a new entry to `adapterFiles` for `mcp/facility-truth.tools.json` with `grantLookup: false`, profile `facility-truth`, required tools `["ccp_facility_truth_request"]`.

### `packages/typescript/src/index.ts`

Add hand-written types for `FacilityTruthRequest`, `FacilityTruthResponse`, `FacilityTruthContext`, plus AJV validator factory helpers `validators.facilityTruthRequest()` and `validators.facilityTruthResponse()`. Mirror the existing care-network entries.

### `packages/typescript/scripts/copy-schemas.mjs` and `packages/python/...`

No code changes needed beyond `scripts/schema-names.mjs` — both packages copy whatever is in the central list.

### `tests/typescript/run.mjs`

Add validator assertions for the two new functions (positive example accepted, one invalid fixture rejected).

### `tests/python/run.mjs`

Add `load_schema("facility-truth-request")` / `load_schema("facility-truth-response")` assertions parallel to the existing care-network entries.

### `SPEC.md`

- **Lines 94–98 (Current Profiles overview):** change "four narrow schema-backed slices" to "five", insert Facility Truth in the list. Adjust the editorial note about priority order: Facility Truth is the standalone/no-grant slice; keep Care Facility / Care Network as the practice-management custodian slices; keep Commerce last per the existing framing.
- **Lines 149–151 (Facility Truth (Design Candidate)):** replace entirely with a normative profile section comparable in length and shape to the Care Facility section at lines 100–121. Cover: purpose, subject identifier, v1 scope set, what is and isn't returned, no-grant semantics for v1, freshness requirement.
- **Lines 294–326 (Visibility Classes):** add `facility_public` to the list and a one-line definition.
- **Lines 327–346 (Visibility Precedence):** add rule(s) for `facility_public` — "facility_public" does not override `staff_only` or `restricted_sensitive`; the "facility-public rule" (every Facility Truth field MUST include `facility_public`); cross-profile exclusion.
- **Lines 347–382 (Scope Registry):** add an "Initial facility-truth scopes" subsection listing the 8 scopes.
- **Lines 384–398 (Purpose Registry):** add `facility_truth_lookup`.
- **Lines 400–426 (Omission Reasons):** add `not_verified` and `not_applicable` with one-line definitions.
- **After line 473 (Care Network Lookup Flow):** add a "Facility Truth Lookup Flow" section.
- **Lines 515–579 (Conformance Requirements):** add a Facility Truth conformance block.

### `docs/implementers/compatibility-risks.md`

- **Lines 19–28 (Enum growth):** update the bullet for `Scope` (now includes 8 facility scopes), `Purpose` (now includes `facility_truth_lookup`), `VisibilityClass` (now includes `facility_public`), `OmissionReasonCode` (now includes `not_verified` and `not_applicable`).
- **Lines 73–87 (Profile Boundary):** add a new entry for the Facility Truth slice exclusions (no pet context, no household, no staff schedules, no internal capacity models, no billing, no payment instruments, no medical records, no identity documents — same load-bearing exclusion-stays-exclusion pattern as the existing four).
- **Lines 83–84:** the "Facility Truth remains a design candidate" sentence is replaced by a forward-looking entry: "Facility Truth v1 covers public-fact scopes only. Adding higher-scrutiny scopes (e.g., `facility.certifications.read`) will require introducing a `facility_partner_visible` class and a partner-only grant shape — most likely an additive `subject_facility_id` on `PermissionGrant`. Implementers should not assume the v1 no-grant semantics generalize to those future scopes."

### `README.md`

- **Lines 13–19 (status note):** retire the "design candidate" framing for Facility Truth. New copy describes v1 = public-fact scopes only, no grant required, freshness via `verified_at`.
- **Lines 76–135 (Artifact catalog):** add entries for the new schemas, examples (request, response, partial, denied), OpenAPI adapter, MCP adapter, implementer guide. Slot Facility Truth ahead of Commerce, behind Care Facility / Care Network, matching the editorial priority order already in SPEC.md and the README.

### `index.md`

- Add `docs/implementers/facility-truth-server.md` link in the Documents section.
- Add `facility-truth-request.schema.json` and `facility-truth-response.schema.json` to the Canonical schemas list.

### `CHANGELOG.md`

Under `## Unreleased > ### Added`, add bullets enumerating: Facility Truth schemas, examples, OpenAPI adapter, MCP tool, implementer guide, new scopes, new purpose, new visibility class, new omission reasons, conformance cases, TS/Python package wiring. Under `### Compatibility`, note that the new enum members are additive but pre-existing implementations may not recognize them; note that Facility Truth v1 does not require a `PermissionGrant`.

### `THREAT_MODEL.md`

- **Lines 87–91 (Facility Truth Risks):** rewrite to reflect v1: public-fact scopes only, no `PermissionGrant` required in v1, freshness via mandatory `verified_at` (with `source_stale` omissions when `stale_after` has elapsed), partner-only path explicitly deferred. Surface the cross-facility inference risk briefly (an attacker enumerating many facilities for behavioural signals).

### `docs/design/2026-05-04-ccp-open-source-adoption-roadmap.md`

- Update the "Recommended next action" sentence at line 75 to reflect graduation. Move Facility Truth out of the "forward wedge" framing and add a brief follow-on item ("next: partner-only Facility Truth scopes + PermissionGrant facility-subject shape").

### `docs/design/2026-05-05-facility-truth-profile.md`

- Update the `Status:` header from "Design draft, non-normative" to "Superseded by v1 schema-backed profile — see `SPEC.md` Facility Truth section and `docs/implementers/facility-truth-server.md`". Leave the body intact as historical design context.

## Verification

After all edits, from the repo root:

```sh
npm install
npm test
```

This runs in order:
1. `tests/vendor-neutrality/run.mjs` — must continue to pass (use synthetic facility IDs only)
2. `tests/conformance/run.mjs` — all new positive cases validate, all new invalid fixtures rejected with expected error keywords, round-trip pair passes, subject-boundary scan finds no `pet_id` leaks in the positive response
3. `tests/openapi/run.mjs` — parses the new `openapi/facility-truth.openapi.json`, resolves all external example refs, validates `x-ccp-*` extensions and no grant-lookup operation
4. `tests/mcp/run.mjs` — validates the new `mcp/facility-truth.tools.json` (snake_case tool name, schema refs to existing `$defs`, no grant-lookup tool, valid example paths)
5. `tests/typescript/run.mjs` — builds the TS package, exercises the two new validators
6. `tests/python/run.mjs` — compiles the Python package, verifies both new schema names load

Manual sanity:
- Read `npm test` output line by line; expected to see new `ok` lines for each Facility Truth case.
- `git diff --stat` should show the new files plus targeted modifications to the seven existing files (SPEC.md, compatibility-risks.md, README.md, index.md, CHANGELOG.md, THREAT_MODEL.md, adoption-roadmap.md) and the runner/schema-name files.
- Grep the new examples for `pet_id`, `commerce_safe`, `staff_only`, `restricted_sensitive`, `household`, `medical`, `diagnosis`, `billing` — none should appear.
- Confirm no real-world facility names, phone numbers, addresses, or staff names landed in any fixture.

## Scope and sequencing notes

- This is a single PR. The artifacts are tightly coupled (`ccp-core.schema.json` changes are tested by everything else), so splitting would create a green-test gap.
- Commit shape suggestion: one logical commit per AGENTS.md convention. Likely 4–6 commits: (1) core schema additions + wrappers + schema-names list; (2) examples + invalid fixtures + conformance runner wiring; (3) OpenAPI + MCP adapters + their test wiring; (4) implementer guide + SPEC.md + compatibility-risks + threat model; (5) README + index + CHANGELOG + roadmap + design-draft status; (6) TS/Python package wiring.
- All git operations use the repo-local `origin` (which is `pawloai/companion-context-protocol`); `gh pr create` will use `--repo pawloai/companion-context-protocol`.
