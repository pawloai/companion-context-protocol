# Care Facility First Schema Slice Proposal

Date: 2026-05-05

Status: Schema-backed design draft

Related design: `docs/design/2026-05-05-care-facility-context-profile.md`

## Goal

Define the smallest Care Facility Context schema slice worth taking to design partners and conformance tests.

This proposal intentionally narrows the broader Care Facility Context design. It chooses one initial workflow, one response style, and a small object set so the next schema pass can stay reviewable.

## Recommended First Workflow

Start with boarding preparation.

Boarding preparation is the best first workflow because it exercises the most important care-facility semantics without requiring writeback, payment authority, or full medical history:

- Facility identity.
- Service window.
- Booking or stay context.
- Care instructions.
- Feeding instructions.
- Vaccination status.
- Pickup authorization.
- Emergency contact handoff.
- Purpose-specific omissions.

Daycare eligibility is simpler, but it may not prove enough of the profile boundary. Pickup authorization is important, but too narrow to validate care-facility context as a profile. Medication administration and staff observation writeback are operationally important but higher risk and should remain out of the first schema slice.

## First Slice Decision

Include in the first schema slice:

- Boarding preparation request and response.
- Facility identity and service window.
- Care instructions.
- Feeding instructions.
- Vaccination status.
- Pickup authorization.
- Emergency contacts.
- Profile-specific omissions.

Defer from the first schema slice:

- Medication administration.
- Medication administration writeback.
- Facility observation writeback.
- Incident writeback.
- Payment authority.
- Emergency override access.
- Full wellness timeline.
- Diagnosis history.
- Treatment history.
- Billing records.
- Sitter or in-home care workflows.

## Candidate Purpose

Use one purpose in the first slice:

- `boarding_preparation`

This purpose should allow only the context needed to prepare and safely conduct a boarding stay. It should not expose medication administration, full wellness timelines, diagnosis history, treatment history, billing data, payment authority, or unrelated household context.

## Candidate Scopes

Initial read scopes:

- `pet.facility_booking_context.read`
- `pet.care_instructions.read`
- `pet.feeding_instructions.read`
- `pet.vaccinations.status.read`
- `pet.pickup_authorization.read`
- `pet.emergency_contacts.read`

Scopes deferred from the first slice:

- `pet.medications.administration.read`
- `pet.facility_observation.write`
- `pet.medication_administration.record.write`
- `pet.incident_observation.write`
- `pet.payment_authority.read`

The first schema pass should prove minimization and facility-bound access before adding medication or writeback behavior.

## Candidate Request Shape

Candidate object: `CareFacilityContextRequest`

Fields:

- `request_id`
- `requester_actor_id`
- `pet_id`
- `facility_id`
- `service_id`
- `service_type`
- `service_window`
- `purpose`
- `scopes`
- `grant_id`

Draft constraints:

- `purpose` should be `boarding_preparation`.
- `service_type` should be `boarding`.
- `service_window` should include start and end timestamps.
- `facility_id` should be required.
- `grant_id` should be required for the first slice.
- Requested scopes should be unique.

Requiring `grant_id` keeps the first slice simpler. Booking-derived access without an explicit grant can be revisited after the grant-based path is proven.

## Candidate Response Shape

Candidate object: `CareFacilityContextResponse`

Fields:

- `request_id`
- `status`
- `authorization_decision`
- `care_facility_context`
- `omissions`

Status rules should mirror Commerce Context:

- `ok` uses decision `allowed`, includes non-null `care_facility_context`, and has no omissions.
- `partial` uses decision `partial`, includes non-null `care_facility_context`, and has at least one omission.
- `denied` uses decision `denied`, returns `care_facility_context: null`, and has at least one omission.

## Candidate Context Bundle

Candidate object: `CareFacilityContext`

Fields:

- `pet_id`
- `purpose`
- `facility_id`
- `service_id`
- `service_type`
- `service_window`
- `booking_context`
- `care_instructions`
- `feeding_instructions`
- `vaccination_status`
- `pickup_authorization`
- `emergency_contacts`
- `metadata`

The context bundle should contain returned context only. Omissions should remain in the response envelope.

## Candidate Nested Objects

The fields below are candidate schema fields, not all required response fields. The first schema pass should require object metadata and field envelopes for returned facts, while allowing omitted optional fields to be represented by top-level omissions when they were requested, relevant, unavailable, or restricted.

### `FacilityBookingContext`

Fields:

- `eligibility_status`
- `missing_required_context`
- `service_restrictions`
- `required_owner_approvals`

Do not include facility pricing, capacity, staffing, kennel assignment, internal scheduling notes, or operational rules unless later generalized and explicitly scoped.

### `CareInstructions`

Fields:

- `handling_summary`
- `comfort_routines`
- `rest_preferences`
- `playgroup_constraints`
- `stress_triggers`
- `activity_restrictions`

Prefer summarized owner-visible or facility-shareable instructions. Do not expose raw staff notes by default.

### `FeedingInstructions`

Fields:

- `food_description`
- `portion`
- `schedule`
- `treat_rules`
- `allergy_notes`
- `sensitivity_notes`
- `owner_supplied_food`
- `substitution_constraints`

Feeding instructions should not imply medication access or full diet history access.

### `VaccinationStatus`

Fields:

- `vaccine_name`
- `status`
- `expires_at`
- `proof_status`
- `verification_source`
- `verified_at`

Status values should start with:

- `verified_current`
- `owner_reported`
- `expired`
- `missing`
- `waived`
- `not_required`

Vaccination status should not expose raw veterinary records unless a later vet-export or medical-record scope allows it.

### `PickupAuthorization`

Fields:

- `authorized_actor_id`
- `display_name`
- `relationship`
- `contact_channel`
- `authorization_source`
- `expires_at`
- `identity_check_required`
- `constraints`
- `revocation_status`

Identity-check fields should describe whether a check is required. They should not include copies of identity documents.

### `EmergencyContact`

Fields:

- `contact_actor_id`
- `display_name`
- `role`
- `preferred_contact_channel`
- `contact_priority`
- `service_window_applicability`
- `restrictions`

Emergency contacts should be limited to the boarding service window and should not imply emergency override access.

## Visibility Approach

The draft examples use `facility_shareable` as the candidate allow-oriented visibility class for returned care-facility fields.

The schema slice uses `facility_shareable` with explicit precedence rules. It can still be renamed before a stable release if design-partner feedback shows a clearer term.

Existing visibility classes still matter:

- `owner_visible`
- `caregiver_visible`
- `staff_only`
- `vet_shareable`
- `agent_summary_only`
- `restricted_sensitive`

For the first slice, the conservative option is to require every returned field in `care_facility_context` to include the profile-specific allow class. `facility_shareable` should not override `restricted_sensitive` or `staff_only`.

## Positive Example To Draft Next

Draft one positive partial response:

1. Owner grants boarding-preparation scopes to a facility for one pet and one stay window.
2. Facility requests boarding preparation context.
3. Server returns care instructions, feeding instructions, vaccination status, pickup authorization, and emergency contacts.
4. Server omits medication administration because it is outside the first slice.
5. Server omits full wellness timeline and diagnosis history because they are restricted and purpose-inappropriate.

This example should become the anchor for schema and conformance work.

Draft artifacts:

- `docs/design/care-facility-draft-examples/boarding-preparation-permission-grant.json`
- `docs/design/care-facility-draft-examples/boarding-preparation-request.json`
- `docs/design/care-facility-draft-examples/boarding-preparation-partial-response.json`

These examples are intentionally outside `examples/` because they are schema-backed design examples, not final public canonical examples.

## Negative Fixtures To Draft Next

Initial negative fixtures:

- Facility mismatch returns denied: `docs/design/care-facility-draft-examples/invalid/facility-mismatch-denied-response.json`
- Expired service window returns denied: `docs/design/care-facility-draft-examples/invalid/expired-service-window-denied-response.json`
- Denied response includes non-null `care_facility_context`: `docs/design/care-facility-draft-examples/invalid/denied-response-with-context.json`
- Returned care-facility field is missing provenance: `docs/design/care-facility-draft-examples/invalid/care-field-missing-provenance.json`
- Returned pickup authorization includes identity document data: `docs/design/care-facility-draft-examples/invalid/pickup-authorization-identity-document-leak.json`
- Boarding preparation response includes full wellness timeline: `docs/design/care-facility-draft-examples/invalid/boarding-response-with-wellness-timeline.json`
- Boarding preparation response includes diagnosis history: `docs/design/care-facility-draft-examples/invalid/boarding-response-with-diagnosis-history.json`
- Pickup authorization implies billing or payment authority: `docs/design/care-facility-draft-examples/invalid/pickup-authorization-payment-authority-leak.json`

These fixtures are design drafts only. They should move into `tests/conformance/fixtures/invalid/` only after Care Facility schemas exist.

## Open Decisions Before Schema Work

- Should `facility_shareable` be the final name for the first care-facility allow class?
- Should later slices allow booking-derived access without `grant_id`?
- Should later slices allow pre-booking boarding preparation without `service_id`?
- Should `emergency_contacts` be in the first slice, or deferred with emergency handoff?
- Should vaccination status values be schema enums in the first pass?

## Recommended Next Step

Review the schema-backed examples with design partners, then decide whether to promote them into public canonical examples under `examples/` and add OpenAPI or MCP adapter sketches for the Care Facility Context Profile.
