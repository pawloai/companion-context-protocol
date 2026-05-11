# Cross-Profile Inference: A Worked Example

Status: Draft, pre-1.0

This document carries the worked attack-and-defense example referenced from `SPEC.md` Conformance Requirements, `THREAT_MODEL.md` §Cross-Profile Inference, and `docs/implementers/compatibility-risks.md` §Decisions Needed Before 1.0 §Cross-profile inference controls. It is illustrative, not normative. The canonical contract is JSON Schema; this doc shows how policy and minimization decisions outside the schema layer change the inference surface.

All identifiers, scenarios, omission codes, and freshness timestamps below are synthetic. Implementers MUST NOT copy real data into worked examples.

## Why This Matters

The visibility-precedence rules in `SPEC.md` §Visibility Precedence (rules 6, 8, 10, 12) prevent many single-response leaks. They do not prevent a requester holding grants for more than one profile — or repeating calls within a single profile — from correlating omissions, partial responses, freshness timestamps, and summaries across calls to reconstruct restricted context that no single response would have disclosed.

A privacy-first protocol that documents this only in abstract terms invites implementers to dismiss it as theoretical. The example below shows a plausible synthetic attack and the specific defenses that defeat it. None of the defenses are inferable from schema validation; all are server-side policy choices the deployment owns.

## Setting

A synthetic adversary is an `agent_client` operating on behalf of a third-party meal-planner integration. The integration holds two grants for the same synthetic pet (`pet_xyz_synthetic`):

- A commerce grant authorizing `pet.profile.read`, `pet.diet.read`, `pet.commerce_context.read`, and `pet.purchase_history.summary.read` for `product_recommendation`.
- A care-facility boarding-preparation grant authorizing `pet.feeding_instructions.read`, `pet.care_instructions.read`, and `pet.facility_booking_context.read` for `boarding_preparation`, scoped to a single facility (`facility_alpha_synthetic`) and a single service window.

Neither grant authorizes diagnosis, treatment, wellness, billing, household, or staff-only records. The schemas reject any returned field carrying `staff_only` or `restricted_sensitive`. The pickup-verification, care-network-lookup, and facility-truth response schemas additionally filter omission `detail` strings through `SensitiveKeywordPattern`.

The adversary's goal is to determine whether the pet is being treated for an allergy-related condition, without ever requesting a diagnosis scope.

## The Attack

The adversary issues two correlated calls within minutes of each other.

### Call 1: Commerce Context Request

Request:

```
purpose: product_recommendation
requester_actor_type: agent_client
scopes: [pet.profile.read, pet.diet.read, pet.commerce_context.read, pet.purchase_history.summary.read]
```

Response (synthetic, redacted):

```
status: partial
authorization_decision.decision: partial
commerce_context.diet_profile.allergies.value: ["chicken_protein"]
commerce_context.diet_profile.sensitivities.value: ["beef_protein", "common_grain_blend"]
commerce_context.diet_profile.product_exclusions.value: ["standard_kibble_lines"]
commerce_context.purchase_history_summary.preferred_categories.value: ["hypoallergenic_food", "joint_support_supplements"]
omissions:
  - field: commerce_context.diet_profile.owner_notes_summary
    reason: scope_missing
```

Nothing in this response is illegitimate. Every field carries `commerce_safe` and provenance with a `verified_at` from the synthetic facility's source system. The adversary has learned only that the pet has named allergies and sensitivities, has standard kibble excluded, and shows commerce preferences for hypoallergenic food and joint-support supplements — each of which is independently useful for a meal-planner integration.

### Call 2: Care Facility Boarding Preparation Request

A few minutes later, the same authenticated principal — under the boarding-preparation grant — calls:

```
purpose: boarding_preparation
requester_actor_type: agent_client
facility_id: facility_alpha_synthetic
scopes: [pet.feeding_instructions.read, pet.care_instructions.read, pet.facility_booking_context.read]
```

Response (synthetic, redacted):

```
status: partial
authorization_decision.decision: partial
care_facility_context.feeding_instructions.schedule.value: ["07:00", "12:00", "17:00", "21:00"]
care_facility_context.feeding_instructions.owner_supplied_food.value: true
care_facility_context.feeding_instructions.substitution_constraints.value: ["no_substitution_permitted"]
care_facility_context.feeding_instructions.sensitivity_notes.value: ["monitor_for_stomach_upset_within_30_minutes_of_feeding"]
care_facility_context.care_instructions.handling_summary.value: "Use a slow-feeder bowl. Keep portion changes minimal."
care_facility_context.service_window.start: "2026-05-12T08:00:00Z"
care_facility_context.service_window.end:   "2026-05-12T20:00:00Z"
omissions:
  - field: care_facility_context.vaccination_status
    reason: scope_missing
  - field: care_facility_context.emergency_contacts
    reason: scope_missing
```

Again, nothing in this response is illegitimate. Every field carries `facility_shareable` and `verified_at`. The omission `detail` strings do not contain restricted source content.

### Inference

By correlating the two responses, the adversary now knows:

- The pet has a named protein allergy, two named sensitivities, standard kibble lines excluded, and commerce-side preference signals for `hypoallergenic_food` and `joint_support_supplements`.
- The pet is fed **four** times per day on a fixed schedule (unusually frequent), with **owner-supplied food and no substitution permitted** (not the facility's stock), under sensitivity notes that **monitor for stomach upset within 30 minutes of feeding**, with a **noticeably short** 12-hour boarding service window.

None of these facts is restricted. Combined, they are a plausible behavioral signature for an allergy- or sensitivity-related condition under active dietary management. A separate request for a wellness, diagnosis, or treatment scope would have been denied (no such scope exists in `0.1.0-draft` for these profiles); the adversary did not need it.

This is a single-pet, single-adversary, two-call attack. The real risk surface is larger:

- The same adversary across many pets (`pet_a`, `pet_b`, ...) builds a population model that can later classify a new pet from its commerce-side signature alone.
- The same adversary across many calls per pet (probing freshness timestamps to detect change events) learns when a pet's condition changes without ever calling a wellness scope.
- Two adversaries colluding (one with a commerce grant, one with a care-facility grant) defeat per-profile rate limits unless the deployment correlates by authenticated principal across both grant issuers.

## Defenses

No single mitigation defeats this. The defenses below are layered — each one closes part of the surface, and each one is a server-side policy choice that the canonical schemas cannot enforce.

### Per-request minimization

Return only the fields the declared purpose needs, even when the granted scopes would allow more.

- The commerce response in Call 1 does not need to enumerate specific allergens by name to make a product recommendation if the catalog already supports filtering on a coarse `hypoallergenic` flag. A minimization-aware server would return `commerce_context.diet_profile.product_exclusions` alone and omit `commerce_context.diet_profile.allergies` and `commerce_context.diet_profile.sensitivities` with `reason: not_applicable` and a generic `detail` string that does not reveal which proteins were on the avoidance list.
- The boarding-preparation response in Call 2 does not need both the per-day schedule timestamps and the free-text `sensitivity_notes` entries to fulfill the purpose. A minimization-aware server might return the schedule and `owner_supplied_food: true` alone, and omit the free-text `sensitivity_notes` entirely with `reason: not_applicable`.

Schema validation cannot detect over-disclosure of granted but unneeded fields. The visibility check only knows the field's class; it does not know whether the declared purpose actually requires that field today.

### Correlation-aware authorization logging

Emit logs that join across profiles for the same authenticated principal. Recommended log fields:

- Authenticated transport principal (not the asserted `requester_actor_type`).
- Request ID and deployment-internal session or correlation identifier.
- Declared `purpose` and `requester_actor_type`.
- Granted scopes and `applied_scopes` / `denied_scopes`.
- Omission `reason` set returned to the requester.
- A coarse-grained sketch of which envelopes were returned (field names, not values).

Logs that contain only the request and response are not enough. A retrospective abuse-review pipeline needs to see, for a given authenticated principal, the *sequence* of authorized calls across profiles within a configurable window. Most cross-profile attacks are correlation attacks; the defense is correlation-aware audit.

`0.1.0-draft` does not standardize a correlation identifier on the request envelope. The unresolved decision (candidate names: `correlation_token`, `requester_session_id`) is tracked in GitHub issue #7. Until a primitive is selected, servers SHOULD correlate using their own internal identifiers and SHOULD NOT rely on the requester to provide a join key — a client-supplied token has no server-side binding, so a malicious requester can omit, rotate, or forge it to fragment its audit trail. The server's authenticated transport principal is the only identifier the server controls end-to-end.

### Per-requester rate limits across profiles

Per-profile rate limits do not bound cross-profile correlation. An adversary holding two grants under the same authenticated principal can stay well below each profile's limit and still build a behavioral signature.

A defensible rate-limit envelope is per *authenticated principal* across *all* authorized profiles, with a deployment-configurable window. Combine with:

- Decaying allowance for repeat single-profile reads of the same `pet_id` (the second read inside a short window carries less marginal product value than the first; charge it a higher rate-limit cost).
- Hard back-off when the same principal has issued more than N requests across more than M distinct pets inside a short window. This is the population-modeling attack, and it does not look anomalous in any single profile's log.

A future draft may define a standard rate-limit envelope; until then, this is deployment policy.

### Higher-scrutiny review of profile combinations

Treat a single principal holding grants for multiple profiles for the same pet as a higher-scrutiny authorization decision than the union of independent per-profile decisions. Options:

- Require explicit owner attestation when an `agent_client` requests its first cross-profile grant for a given pet.
- Surface the cross-profile grant set in owner-facing consent UIs (`This integration can see commerce-safe profile context AND boarding feeding instructions`) rather than presenting each grant in isolation.
- Decline to issue overlapping grants for the same pet to the same requester without a documented justification on the issuer side.

This is a policy decision the protocol does not currently require. It is the single most effective defense against the worked attack above, because it removes the adversary's ability to hold both grants without owner review in the first place.

### Omission hygiene

The pickup-verification, care-network-lookup, and facility-truth response schemas filter omission `detail` strings through `SensitiveKeywordPattern`. The commerce-context and care-facility-boarding-preparation slices currently leave this constraint to the implementer. In both unfiltered slices, omission `detail` text must not name the specific restricted content that was omitted — `"Diagnosis history is not needed for boarding preparation"` is acceptable; `"Withholding bacterial dermatitis treatment notes from 2026-04-12"` is not. The underlying normative obligation lives in `SPEC.md` Conformance Requirements and `docs/implementers/conformance-checklist.md` §Restricted source content; this paragraph illustrates it but does not assert independent normative weight. Restricted source content in omission `detail` text would defeat every other defense on this list.

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

`SPEC.md` Conformance Requirements now state normatively that servers MUST NOT rely on per-profile narrowness alone, and that servers granting multi-profile (or repeat single-profile) access for the same requester SHOULD apply correlation-aware logging, per-requester rate limits, and per-request minimization. The `SHOULD` rather than `MUST` reflects that `0.1.0-draft` has not yet committed to a specific correlation primitive, rate-limit envelope, or minimization model; a future draft is expected to tighten these into machine-checkable obligations.

## How To Use This Document

- During design review, walk the attack above against your deployment's authorization, audit, and minimization layers. Any defense you cannot positively confirm is a gap.
- When adding a new profile or scope, repeat the exercise: write down what a synthetic adversary could infer by combining the new surface with each existing profile.
- When a future draft lands a correlation identifier, rate-limit envelope, or minimization contract, this document should be updated to reflect the new schema-layer guarantees and to mark previously self-attested defenses as machine-checked.

## Related

- `SPEC.md` Conformance Requirements — normative cross-profile correlation `MUST` / `SHOULD`.
- `THREAT_MODEL.md` §Cross-Profile Inference — current assumptions and future-draft agenda pointer.
- `docs/implementers/compatibility-risks.md` §Decisions Needed Before 1.0 §Cross-profile inference controls — unresolved sub-decisions and candidate primitives.
- `docs/implementers/conformance-checklist.md` §Cross-enum and cross-profile boundaries — self-attestation entries.
- GitHub issue #7 — tracking the future-draft resolution.
