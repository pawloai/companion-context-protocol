# CCP Conformance Self-Attestation Checklist

Status: Draft, pre-1.0

`npm test` is the canonical machine-checked surface for CCP conformance, but the spec also carries normative `MUST`s that no schema or test runner can verify because they describe transport-layer or runtime behavior. This checklist separates the two so an implementer can self-attest against the parts the runner cannot reach.

The canonical source for every requirement here is `SPEC.md`. If this checklist and `SPEC.md` disagree, `SPEC.md` wins.

## What `npm test` Verifies (Machine-Checked)

The conformance runner exercises every requirement in this list. If `npm test` passes against the canonical schemas, you have inherited these guarantees:

- Request, response, grant, and authorization-decision shapes match the canonical JSON Schemas.
- Field envelope shape (`{ value, visibility, provenance }`) is preserved on every returned context fact and summary.
- `source_type: generated` provenance carries `source_system` and `derived_from`.
- Response status / decision / context / omissions consistency:
  - `ok` → `decision: allowed`, non-null context, empty omissions.
  - `partial` → `decision: partial`, non-null context, ≥1 omission.
  - `denied` → `decision: denied`, null context, ≥1 omission.
- Commerce-safe rule: every returned `commerce_context` field includes `commerce_safe` and excludes `staff_only` / `restricted_sensitive`.
- Facility-shareable rule for care-facility profiles; care-network visibility rule for the care-network lookup profile.
- Facility-public rule: every returned `facility_truth_context` field includes `facility_public` and excludes `staff_only`, `restricted_sensitive`, `commerce_safe`, `facility_shareable`, `care_network_visible`, `contact_shareable`, `action_authorization_visible`, `owner_visible`, `caregiver_visible`, `vet_shareable`, and `agent_summary_only`. The schema additionally requires that `ok` and `partial` Facility Truth responses include at least one content sub-resource in `facility_truth_context`.
- Facility Truth freshness rule: every Facility Truth field's provenance carries `verified_at`.
- Facility Truth subject-boundary rule: responses do not contain `pet_id` anywhere. The schema rejects `pet_id` on `facility_truth_context` and on `authorization_decision`; the conformance runner also performs a recursive scan over Facility Truth response examples (ok/partial/denied) that fails if any `pet_id` key or `pet_id`-bearing string value appears anywhere in the tree.
- Permission grant lifecycle: `status: active` is incompatible with `revoked_at`; `expired` requires `expires_at`; `revoked` requires `revoked_at`.
- Requested scopes in a request are unique.
- Omissions appear only on the response envelope, not on nested context objects.
- `requester_actor_type` echoes correctly from request to response `authorization_decision`.
- `grantee_actor_type` equals `requester_actor_type` for paired example fixtures across all four profiles.
- `pickup_actor.actor_type.value` equals the request's `pickup_actor_type`.
- Negative fixtures for missing/invalid `requester_actor_type`, missing `grantor_actor_type`, missing `grantee_actor_type`, and invalid `pickup_actor_type` all reject as expected.
- OpenAPI and MCP adapter sketches reference canonical `$defs` rather than redefining shapes.
- TypeScript and Python packaged schema snapshots stay byte-identical to `schemas/`.
- No vendor-neutrality regressions in tracked files.

## What Implementers MUST Self-Attest (Honor-System)

The following requirements live in `SPEC.md` Conformance Requirements but operate on transport state, runtime identity, or grant-issuance behavior that the runner cannot reach. An implementation that passes `npm test` can still ship in violation of any of these. Self-attest by exercising them in your own integration tests or production telemetry.

### Authentication binding

- [ ] Server rejects every request when the transport provides no authenticated principal. There is no defined unauthenticated fallback.
- [ ] Server verifies the asserted `requester_actor_type` against the trust posture of the authenticated transport principal. A client whose authenticated identity does not entitle it to claim a given actor type is rejected as an authorization failure.
- [ ] Server does not silently coerce or substitute `requester_actor_type`; the value echoed on the response `authorization_decision` is byte-equal to the value asserted on the request.
- [ ] Server rejects every request carrying `requester_actor_type: "vet"` until a vet-export profile is defined. The schema admits the value as a reserved placeholder; rejection is a runtime requirement.

### Grant issuance binding

- [ ] Grant-issuing systems verify `grantor_actor_type` against the authenticated identity of the issuer at issuance time. A grant MUST NOT carry a `grantor_actor_type` the issuer is not entitled to claim.
- [ ] Grant-issuing systems verify the issuer's authority to bind the asserted `grantee_actor_type` for the named pet, scopes, purposes, and (where applicable) facility, service, and service window.
- [ ] Grant lookup (`GET /permission-grants/{grant_id}` or equivalent) is independently access-controlled and does not leak grant content to a requester who lacks `pet.permission_grants.read`.

### Restricted source content

- [ ] `authorization_decision.reasons` and omission `detail` strings do not contain restricted source content (raw staff notes, raw wellness timelines, diagnosis or treatment text, billing data, household data, sensitive facility operations data, identity-document content). The pickup-verification, care-network-lookup, and facility-truth response schemas enforce this with a `SensitiveKeywordPattern` overlay (the facility-truth schema additionally constrains every returned-field `value` plus the provenance `source_system`, `source_record_ref`, and `derived_from` strings); the commerce-context and care-facility-boarding-preparation response schemas leave the constraint to the implementer.
- [ ] Server logs and observability tooling do not capture restricted source content from CCP payloads.

### Cross-enum and cross-profile boundaries

- [ ] `CareNetworkActorType` values (e.g., `"owner"`, `"caregiver"` as relationship types) are never used to infer a global `ActorType` trust posture.
- [ ] Server does not rely on per-profile narrowness alone to prevent cross-profile inference. A requester holding grants for more than one profile, or making repeated calls within a single profile, can correlate omissions, partial responses, freshness timestamps, and summaries across calls to reconstruct restricted context that no single response would have disclosed. The "do not rely on per-profile narrowness alone" obligation is a `MUST NOT` in `SPEC.md` Conformance Requirements; the specific mitigations (rate limits, correlation logging, minimization) are `SHOULD`. The canonical schemas cannot detect cross-call correlation.
- [ ] Server applies per-requester rate limits across all authorized profiles for the same authenticated principal (not just per-profile rate limits).
- [ ] Server emits correlation-aware authorization logs carrying enough metadata (authenticated principal, request ID, deployment-internal session, declared purpose, granted scopes, omission codes) for retrospective abuse review across profile boundaries.
- [ ] Server applies per-request minimization: returns only the fields the declared purpose needs, even when the granted scopes would allow more.
- [ ] Server treats cross-profile access for the same requester as a higher-scrutiny authorization decision rather than the union of independent per-profile decisions. See `compatibility-risks.md` §Decisions Needed Before 1.0 §Cross-profile inference controls and the worked example in `cross-profile-inference.md`.

### Vendor neutrality

- [ ] Production examples, fixtures, screenshots, and design notes avoid vendor-specific shorthand. The `npm run test:vendor-neutrality` suite scans the tracked tree, but implementer-side artifacts (internal docs, support tickets, monitoring labels) are out of its reach.

### Privacy and synthetic-data hygiene

- [ ] No real customer, pet, owner, staff, facility, billing, medical, or credential data appears in any artifact attached to the spec or its conformance suite. This applies to issues, PRs, screenshots, examples, and fixtures. The runner does not check the contents of identifiers — only their shape.

## How To Use This Checklist

1. Run `npm test` from a clean checkout against the draft you ship against.
2. Walk the self-attestation list above against your integration tests, runtime authorization layer, and observability stack. Any item you cannot positively confirm is a gap.
3. Re-run on every CCP draft upgrade. Items may move between machine-checked and self-attested as the conformance runner grows; CHANGELOG and `compatibility-risks.md` will note the moves.

## Reporting Gaps

If you discover a normative `MUST` that this checklist does not cover, please open an issue on the canonical repository so the next draft can either tighten the runner or add an explicit attestation entry.
