# Cross-Profile Inference: A Worked Example

Status: Draft, pre-1.0

This document carries the worked attack-and-defense example referenced from `SPEC.md` Conformance Requirements, `THREAT_MODEL.md` §Cross-Profile Inference, and `docs/implementers/compatibility-risks.md` §Decisions Needed Before 1.0 §Cross-profile inference controls. It is illustrative, not normative. The canonical contract is JSON Schema; this doc shows how policy and minimization decisions outside the schema layer change the inference surface.

All identifiers, scenarios, omission codes, and freshness timestamps below are synthetic. Implementers MUST NOT copy real data into worked examples.

## Why This Matters

The visibility-precedence rules in `SPEC.md` (rules 6, 8, 10, 12) prevent many single-response leaks. They do not prevent a requester holding grants for more than one profile — or repeating calls within a single profile — from correlating omissions, partial responses, freshness timestamps, and summaries across calls to reconstruct restricted context that no single response would have disclosed.

A privacy-first protocol that documents this only in abstract terms invites implementers to dismiss it as theoretical. The example below shows a plausible synthetic attack and the specific defenses that defeat it. None of the defenses are inferable from schema validation; all are server-side policy choices the deployment owns.

## Setting

A synthetic adversary is an `agent_client` operating on behalf of a third-party meal-planner integration. The integration holds two grants for the same synthetic pet (`pet_xyz_synthetic`):

- A commerce grant authorizing `pet.profile.read`, `pet.diet_profile.read`, and `pet.commerce_context.read` for `product_recommendation`.
- A care-facility boarding-preparation grant authorizing `pet.feeding_instructions.read`, `pet.behavioral_handling_summary.read`, and `pet.service_window.read` for `boarding_preparation`, scoped to a single facility (`facility_alpha_synthetic`) and a single service window.

Neither grant authorizes diagnosis, treatment, wellness, billing, household, or staff-only records. The schemas reject any returned field carrying `staff_only` or `restricted_sensitive`. The pickup-verification, care-network-lookup, and facility-truth response schemas additionally filter omission `detail` strings through `SensitiveKeywordPattern`.

The adversary's goal is to determine whether the pet is being treated for an allergy-related condition, without ever requesting a diagnosis scope.

## The Attack

The adversary issues two correlated calls within minutes of each other.

### Call 1: Commerce Context Request

Request:

```
purpose: product_recommendation
requester_actor_type: agent_client
scopes: [pet.profile.read, pet.diet_profile.read, pet.commerce_context.read]
```

Response (synthetic, redacted):

```
status: partial
authorization_decision.decision: partial
commerce_context.diet_profile.special_needs.value: ["limited_ingredient_diet"]
commerce_context.diet_profile.notable_avoidances.value: ["chicken_protein", "beef_protein", "common_grain_blend"]
commerce_context.commerce_signals.preferred_categories.value: ["hypoallergenic_food", "joint_support_supplements"]
omissions:
  - field: commerce_context.diet_profile.veterinary_notes
    reason_code: scope_not_granted
```

Nothing in this response is illegitimate. Every field carries `commerce_safe` and provenance with a `verified_at` from the synthetic facility's source system. The adversary has learned only that the pet eats a limited-ingredient diet and avoids three common proteins — useful for a meal-planner integration.

### Call 2: Care Facility Boarding Preparation Request

A few minutes later, the same authenticated principal — under the boarding-preparation grant — calls:

```
purpose: boarding_preparation
requester_actor_type: agent_client
facility_id: facility_alpha_synthetic
scopes: [pet.feeding_instructions.read, pet.behavioral_handling_summary.read, pet.service_window.read]
```

Response (synthetic, redacted):

```
status: partial
authorization_decision.decision: partial
care_facility_context.feeding_instructions.feeding_schedule.value: ["07:00", "12:00", "17:00", "21:00"]
care_facility_context.feeding_instructions.feeding_notes.value: "Feed only the pre-portioned bags provided by the owner. Do not substitute."
care_facility_context.behavioral_handling_summary.handling_notes.value: "Use a slow-feeder bowl. Monitor for stomach upset within 30 minutes of feeding."
care_facility_context.service_window.start: "2026-05-12T08:00:00Z"
care_facility_context.service_window.end:   "2026-05-12T20:00:00Z"
omissions:
  - field: care_facility_context.medication_administration
    reason_code: scope_not_granted
  - field: care_facility_context.wellness_timeline
    reason_code: profile_excluded
```

Again, nothing in this response is illegitimate. Every field carries `facility_shareable` and `verified_at`. The omission `detail` strings do not contain restricted source content.

### Inference

By correlating the two responses, the adversary now knows:

- The pet eats a limited-ingredient diet, avoids three common protein and grain categories, and has commerce-side preference signals for `hypoallergenic_food` and `joint_support_supplements`.
- The pet is fed **four** times per day on a fixed schedule (unusually frequent), with **pre-portioned bags provided by the owner** (not the facility's stock), under instructions to **monitor for stomach upset within 30 minutes of feeding**, with a **noticeably short** 12-hour boarding service window.

None of these facts is restricted. Combined, they are a plausible behavioral signature for an allergy- or sensitivity-related condition under active dietary management. A separate request for `diagnosis` would have been denied; the adversary did not need it.

This is a single-pet, single-adversary, two-call attack. The real risk surface is larger:

- The same adversary across many pets (`pet_a`, `pet_b`, ...) builds a population model that can later classify a new pet from its commerce-side signature alone.
- The same adversary across many calls per pet (probing freshness timestamps to detect change events) learns when a pet's condition changes without ever calling a wellness scope.
- Two adversaries colluding (one with a commerce grant, one with a care-facility grant) defeat per-profile rate limits unless the deployment correlates by authenticated principal across both grant issuers.

## Defenses

No single mitigation defeats this. The defenses below are layered — each one closes part of the surface, and each one is a server-side policy choice that the canonical schemas cannot enforce.

### Per-request minimization

Return only the fields the declared purpose needs, even when the granted scopes would allow more.

- The commerce response in Call 1 does not need `notable_avoidances` to make a product recommendation if the catalog already supports filtering by `special_needs`. A minimization-aware server would omit `notable_avoidances` with `reason_code: not_applicable` and a generic `detail` string that does not reveal which proteins were on the avoidance list.
- The boarding-preparation response in Call 2 does not need the `feeding_notes` free-text string to fulfill the purpose. A minimization-aware server might return only the schedule and a coarse-grained `feeding_method` enum (`pre_portioned_owner_supplied` vs. `facility_supplied`), and omit the free-text note entirely with `reason_code: minimized`.

Schema validation cannot detect over-disclosure of granted but unneeded fields. The visibility check only knows the field's class; it does not know whether the declared purpose actually requires that field today.

### Correlation-aware authorization logging

Emit logs that join across profiles for the same authenticated principal. Recommended log fields:

- Authenticated transport principal (not the asserted `requester_actor_type`).
- Request ID and deployment-internal session or correlation identifier.
- Declared `purpose` and `requester_actor_type`.
- Granted scopes and `applied_scopes` / `denied_scopes`.
- Omission `reason_code` set returned to the requester.
- A coarse-grained sketch of which envelopes were returned (field names, not values).

Logs that contain only the request and response are not enough. A retrospective abuse-review pipeline needs to see, for a given authenticated principal, the *sequence* of authorized calls across profiles within a configurable window. Most cross-profile attacks are correlation attacks; the defense is correlation-aware audit.

`0.1.0-draft` does not standardize a correlation identifier on the request envelope. The unresolved decision (candidate names: `correlation_token`, `requester_session_id`) is tracked in GitHub issue #7. Until a primitive is selected, servers SHOULD correlate using their own internal identifiers and SHOULD NOT rely on the requester to provide a join key.

### Per-requester rate limits across profiles

Per-profile rate limits do not bound cross-profile correlation. An adversary holding two grants under the same authenticated principal can stay well below each profile's limit and still build a behavioral signature.

A defensible rate-limit envelope is per *authenticated principal* across *all* authorized profiles, with a deployment-configurable window. Combine with:

- Decaying allowance for repeat single-profile reads of the same `pet_id` (the second read inside a short window carries less marginal product value than the first; charge it a higher rate-limit cost).
- Hard back-off when the same principal has issued more than N requests across more than M distinct pets inside a short window. This is the population-modeling attack, and it does not look anomalous in any single profile's log.

`0.2` may define a standard rate-limit envelope; until then, this is deployment policy.

### Higher-scrutiny review of profile combinations

Treat a single principal holding grants for multiple profiles for the same pet as a higher-scrutiny authorization decision than the union of independent per-profile decisions. Options:

- Require explicit owner attestation when an `agent_client` requests its first cross-profile grant for a given pet.
- Surface the cross-profile grant set in owner-facing consent UIs (`This integration can see commerce-safe profile context AND boarding feeding instructions`) rather than presenting each grant in isolation.
- Decline to issue overlapping grants for the same pet to the same requester without a documented justification on the issuer side.

This is a policy decision the protocol does not currently require. It is the single most effective defense against the worked attack above, because it removes the adversary's ability to hold both grants without owner review in the first place.

### Omission hygiene

The pickup-verification, care-network-lookup, and facility-truth response schemas filter omission `detail` strings through `SensitiveKeywordPattern`. The commerce-context and care-facility-boarding-preparation slices currently leave this constraint to the implementer. In both unfiltered slices, omission `detail` text MUST NOT name the specific restricted content that was omitted — `"Diagnosis history is not needed for boarding preparation"` is acceptable; `"Withholding bacterial dermatitis treatment notes from 2026-04-12"` is not. Restricted source content in omission `detail` text would defeat every other defense on this list.

### Freshness rounding

`verified_at` and `provenance.verified_at` timestamps can themselves be a correlation signal. A change in `verified_at` between two calls implies a write event in the source system, and over many polls the adversary can infer the timing of underlying events (a wellness check, a dietary change, a behavioral incident) without ever reading those records.

Servers serving repeated reads of the same pet to the same authenticated principal SHOULD consider rounding `verified_at` to a coarser granularity (e.g., hour or day) for that principal, or returning the same `verified_at` across consecutive reads inside a short window. This is a trade-off against freshness accuracy; deployments must weigh it.

## What Schema Validation Does Not Cover

None of the defenses above are detectable by the canonical conformance runner:

- Minimization is a comparison between the response and the declared purpose, not between the response and the schema.
- Correlation logging is a property of the deployment's audit pipeline, not of the protocol payload.
- Rate limits are a property of the transport and authorization layer.
- Profile-combination policy is a property of the grant-issuance flow, which `0.1.0-draft` does not standardize.
- Freshness rounding is a property of how the server constructs provenance, not of the provenance shape.

`SPEC.md` Conformance Requirements now state normatively that servers MUST NOT rely on per-profile narrowness alone, and that servers granting multi-profile (or repeat single-profile) access for the same requester SHOULD apply correlation-aware logging, per-requester rate limits, and per-request minimization. The `SHOULD` rather than `MUST` reflects that `0.1.0-draft` has not yet committed to a specific correlation primitive, rate-limit envelope, or minimization model.

## How To Use This Document

- During design review, walk the attack above against your deployment's authorization, audit, and minimization layers. Any defense you cannot positively confirm is a gap.
- When adding a new profile or scope, repeat the exercise: write down what a synthetic adversary could infer by combining the new surface with each existing profile.
- When `0.2` lands a correlation identifier, rate-limit envelope, or minimization contract, this document MUST be updated to reflect the new schema-layer guarantees and to mark previously self-attested defenses as machine-checked.

## Related

- `SPEC.md` Conformance Requirements — normative cross-profile correlation `MUST` / `SHOULD`.
- `THREAT_MODEL.md` §Cross-Profile Inference — current assumptions and `0.2` agenda pointer.
- `docs/implementers/compatibility-risks.md` §Decisions Needed Before 1.0 §Cross-profile inference controls — unresolved sub-decisions and candidate primitives.
- `docs/implementers/conformance-checklist.md` §Cross-enum and cross-profile boundaries — self-attestation entries.
- GitHub issue #7 — tracking the `0.2` resolution.
