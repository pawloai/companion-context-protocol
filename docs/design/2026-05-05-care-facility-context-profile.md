# Care Facility Context Profile Design

Date: 2026-05-05

Status: Design draft, non-normative

Related profile: Commerce Context Profile

## Design Status

This document scopes a possible future CCP profile. It does not add normative scopes, purposes, visibility classes, schemas, examples, adapters, or conformance requirements.

The current normative draft still only defines the Commerce Context Profile. Any Care Facility Context Profile would need a separate schema proposal, positive and negative examples, conformance fixtures, and adapter sketches before implementers should depend on it.

## Purpose

The Care Facility Context Profile should let authorized care facilities request the pet context needed to plan, accept, manage, and complete a care visit.

This profile is intended for daycare, boarding, grooming, training, and similar operational care settings. It may also inform later sitter or in-home care profiles, but this design starts with organization-operated facilities because those workflows have clearer booking, staffing, pickup, vaccination, and incident-response requirements.

In this document, a facility means an organization or location that provides scheduled care services for a pet. A service window means the bounded time period for a booking, stay, appointment, pickup, or related handoff.

The profile should preserve CCP's core guarantees:

- Pet-level consent.
- Purpose-bound access.
- Least-privilege scopes.
- Provenance on returned facts and summaries.
- Visibility classes that prevent accidental cross-context disclosure.
- Machine-readable omissions for restricted or unavailable data.

## Relationship To Commerce Context

Care Facility Context should be a separate profile, not a broadening of Commerce Context.

Commerce Context is optimized for product recommendation and filtering. Care Facility Context needs operational context that commerce clients should not receive by default, such as pickup authorization, care instructions, facility eligibility, medication administration instructions, and vaccination status.

Some data may be safe in both profiles, such as species, size, allergies, and product exclusions. The profile boundary is still important because the purpose, requester, safety expectations, and omission behavior differ.

The profile should reuse CCP's shared authorization, provenance, visibility, and omission patterns where possible instead of creating a parallel policy model.

## Primary Use Cases

### Daycare booking eligibility

A facility or booking agent checks whether a pet has enough current context to request or confirm a daycare booking.

Returned context may include species, size band, temperament summary, vaccination status, missing required records, authorized requester role, and any relevant care restrictions.

### Boarding preparation

Before a boarding stay, a facility requests care context needed to prepare a stay plan.

Returned context may include feeding instructions, medication administration instructions, comfort routines, handling notes, emergency contacts, vaccination status, and pickup authorization.

### Grooming appointment preparation

A grooming provider requests context needed to prepare for a grooming appointment.

Returned context may include coat or handling notes, sensitivities, allergies, temperament summary, restraint or muzzle constraints if owner-visible and facility-shareable, and emergency contact information.

### Drop-off and pickup handoff

A facility verifies who may drop off, pick up, or receive updates for a pet.

Returned context may include authorized pickup contacts, relationship labels, contact channels, expiration, identity-check requirements, and restrictions.

### Medication and feeding execution

A facility requests only the instructions needed to administer food or medication during an active or upcoming stay.

Returned context may include medication name, dosage instructions, schedule, administration method, active dates, source, and omission records for withheld medical history.

Medication access should be treated as a high-risk operational subset. A facility may need administration instructions without receiving diagnosis, treatment rationale, full prescription history, or unrelated wellness notes.

### Facility observation writeback

Staff create a dated observation during care, such as an incident, appetite note, behavior note, or medication-administration record.

The written observation should carry provenance, visibility, source actor, source facility, timestamp, and any required follow-up flags. Writeback should not imply the staff can read unrelated wellness timelines.

## Candidate Purposes

Purpose names are draft candidates:

- `facility_booking`
- `boarding_preparation`
- `daycare_check_in`
- `grooming_preparation`
- `pickup_verification`
- `care_execution`
- `facility_observation_write`
- `emergency_handoff`

Purpose strings should stay specific enough for policy engines to enforce minimization. For example, `pickup_verification` should not expose feeding instructions, and `grooming_preparation` should not expose payment authority.

`emergency_handoff` should not create unbounded emergency access by itself. It should describe a narrow handoff purpose for returning pre-authorized emergency contacts or escalation instructions under explicit policy.

## Candidate Scopes

Read scopes:

- `pet.facility_booking_context.read`
- `pet.care_instructions.read`
- `pet.feeding_instructions.read`
- `pet.medications.administration.read`
- `pet.vaccinations.status.read`
- `pet.temperament.summary.read`
- `pet.pickup_authorization.read`
- `pet.emergency_contacts.read`
- `pet.care_network.read`

Write scopes:

- `pet.facility_observation.write`
- `pet.medication_administration.record.write`
- `pet.incident_observation.write`

Deferred or separate-profile scopes:

- `pet.wellness.timeline.read`
- `pet.diagnosis_history.read`
- `pet.treatment_history.read`
- `pet.billing.read`
- `pet.payment_authority.read`
- `pet.owner_household.read`
- `facility.operations.read`

The initial profile should prefer summarized operational context over broad medical or wellness history. Full wellness timelines, diagnosis history, treatment history, billing data, and payment authority should require separate profiles or explicit future scopes.

Scope names should be evaluated by actual returned fields, not by broad labels. For example, a medication administration scope should allow administration instructions for the service window, not the pet's complete medication or treatment record.

## Candidate Context Objects

These object names are design candidates, not schema commitments.

### `CareFacilityContext`

A minimized bundle returned for a care-facility purpose.

Candidate fields:

- `pet_id`
- `purpose`
- `facility_id`
- `service_type`
- `service_window`
- `booking_context`
- `care_instructions`
- `feeding_instructions`
- `medication_administration`
- `vaccination_status`
- `temperament_summary`
- `pickup_authorization`
- `emergency_contacts`
- `metadata`

The object should not expose raw source records unless the scope and purpose explicitly allow that source record class.

Omissions should remain in the response envelope, matching the current CCP response pattern. The context bundle should contain returned context only.

### Request and response envelopes

The eventual request and response objects should mirror the Commerce Context shape where possible.

Candidate request fields:

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

Candidate response fields:

- `request_id`
- `status`
- `authorization_decision`
- `care_facility_context`
- `omissions`

`service_id` may be absent for pre-booking eligibility checks, but `facility_id`, purpose, requested scopes, and pet identity should still be explicit.

### `FacilityBookingContext`

Operational context for booking or eligibility decisions.

Candidate fields:

- Species.
- Size or weight band.
- Life stage.
- Service type.
- Requested start and end time.
- Eligibility status.
- Missing required context.
- Service restrictions.
- Required vaccination statuses.
- Required owner approvals.

Candidate service types include `daycare`, `boarding`, `grooming`, `training`, and `transport_handoff`. Final service-type values should be validated with design partners before they become schema enums.

### `CareInstructions`

Instructions needed to safely care for the pet during the service window.

Candidate fields:

- Handling summary.
- Comfort routines.
- Rest or crate preferences.
- Playgroup constraints.
- Separation or stress triggers.
- Activity restrictions.
- Staff-visible action instructions.
- Owner-provided care notes allowed for facility use.

Care instructions should exclude staff-only notes from other providers unless explicitly authorized and marked facility-shareable.

### `FeedingInstructions`

Food and treat instructions for a stay or visit.

Candidate fields:

- Food name or description.
- Portion.
- Schedule.
- Treat rules.
- Allergy and sensitivity notes relevant to feeding.
- Owner-supplied food flag.
- Facility-provided food allowance.
- Substitution constraints.

### `MedicationAdministration`

Instructions for medication handling during care.

Candidate fields:

- Medication label or name.
- Dosage instructions.
- Schedule.
- Administration route or method.
- Active dates.
- Prescribing or verifying source when available.
- Storage requirements.
- Missed-dose instructions.
- Emergency escalation instructions.

This object should support administration without exposing full diagnosis or treatment history.

### `VaccinationStatus`

Facility-relevant vaccination compliance.

Candidate fields:

- Vaccine name.
- Status.
- Expiration date.
- Proof status.
- Verification source.
- Verified date.
- Missing or stale proof reason.

Status values should distinguish verified, owner-reported, expired, missing, waived, and not required.

### `TemperamentSummary`

A summarized behavior and handling view for facility operations.

Candidate fields:

- Dog-social, cat-social, or pet-social suitability where applicable.
- Human handling summary.
- Known triggers.
- Playgroup suitability.
- Grooming or restraint tolerance.
- Bite, scratch, escape, or conflict risk summary where facility-shareable.
- Last observed date.
- Provenance and confidence.

The profile should avoid exposing raw staff notes by default. A generated or staff-curated summary with provenance is safer and easier to minimize.

Temperament summaries should be written as operational handling guidance, not as diagnosis-like labels. They should summarize current, relevant facility-safety considerations and avoid raw incident narratives unless a later scope explicitly allows them.

### `PickupAuthorization`

People or actors authorized to pick up or receive a pet.

Candidate fields:

- Authorized actor id.
- Display name.
- Relationship or role.
- Contact channel.
- Authorization source.
- Expiration.
- Identity-check requirement.
- Constraints, such as specific dates, services, or locations.
- Revocation status.

Pickup authorization should not imply access to care instructions, medical details, billing data, or owner household data. Identity-check fields should describe the required check, not expose copies of identity documents or unrelated personal records.

### `EmergencyContact`

Contact details needed for urgent care-facility communication.

Candidate fields:

- Contact actor id.
- Display name.
- Role.
- Preferred contact channel.
- Contact priority.
- Service-window applicability.
- Restrictions.

Emergency contacts should be minimized to what the facility needs to act during the relevant service window.

### `FacilityObservation`

A writeback object created by care staff during or after service.

Candidate fields:

- Observation id.
- Pet id.
- Facility id.
- Service id.
- Category.
- Severity.
- Summary.
- Occurred at.
- Recorded at.
- Source actor.
- Source role.
- Visibility.
- Follow-up recommendation.
- Linked media references, if allowed.

Observation categories may include appetite, medication administration, behavior, incident, elimination, grooming, rest, health concern, and general care note.

## Visibility Classes

The existing visibility model is a starting point, but care-facility profiles may need additional classes or tighter precedence rules.

Candidate additions:

- `facility_shareable`
- `facility_staff_visible`
- `pickup_verification_only`
- `emergency_facility_access`

Rules to preserve:

- `restricted_sensitive` must not be returned unless the profile and grant explicitly allow the specific sensitive class.
- `staff_only` from one facility should not automatically become visible to another facility.
- `owner_visible` does not imply facility access.
- `caregiver_visible` does not imply facility access.
- `vet_shareable` does not imply facility access.
- Facility access should be tied to service window, facility identity, purpose, and scope.

Candidate allow-oriented classes such as `facility_shareable` should not override deny-oriented classes. A field marked both facility-shareable and restricted should still require the stricter restricted-data rule.

## Authorization Model

A care-facility request should evaluate at least:

- Requester identity.
- Facility identity.
- Pet identity.
- Requested purpose.
- Requested scopes.
- Grant status.
- Grant expiration or service-window limits.
- Actor role, such as owner, caregiver, facility staff, or integration client.
- Whether the facility is associated with the relevant booking or service.
- Whether requested fields are allowed by visibility and provenance rules.

Care Facility Context should support both owner-granted access and booking-derived access. Booking-derived access must be time-limited and purpose-limited.

## Response Semantics

Responses should keep the same CCP decision pattern:

- `ok`: all allowed and relevant requested context was returned.
- `partial`: some allowed context was returned and some requested or relevant context was omitted.
- `denied`: no care facility context may be returned.

Omissions should identify the field, reason, visibility class when relevant, and required scope when relevant.

Omission `detail` text and authorization reason strings must not reveal restricted source content. For example, an omission can say a diagnosis-linked field was withheld, but it should not include the diagnosis value.

Likely omission reasons:

- Scope missing.
- Purpose mismatch.
- Grant expired.
- Grant revoked.
- Facility mismatch.
- Service window inactive.
- Visibility restricted.
- Source stale.
- Data unavailable.
- Owner approval required.
- Explicit sensitive-data grant required.

## Safety Boundary

Care Facility Context should not become a back door for full medical, household, billing, or staff-note access.

Exclude by default:

- Full diagnosis history.
- Full treatment history.
- Full wellness timeline.
- Billing records.
- Owner payment instruments.
- Unrelated household data.
- Internal staff-only notes from other facilities.
- Sensitive facility operations data.
- Raw behavioral incident records unless explicitly authorized.
- Unrelated pet records from the same household.
- Copies of identity documents.
- Free-text omission details that reveal restricted source content.

Include only when purpose, scope, grant, visibility, and provenance all allow it.

## Example Flow Candidates

### Boarding preparation partial response

1. Owner grants `pet.facility_booking_context.read`, `pet.feeding_instructions.read`, `pet.medications.administration.read`, `pet.vaccinations.status.read`, and `pet.pickup_authorization.read` to a boarding facility for a stay window.
2. Facility requests `purpose: boarding_preparation`.
3. Server evaluates facility, grant, pet, purpose, scopes, service window, freshness, visibility, and provenance.
4. Server returns care instructions, feeding instructions, vaccination statuses, pickup contacts, and medication administration instructions.
5. Server omits full wellness timeline and diagnosis history with machine-readable reasons.

### Pickup verification response

1. Facility requests `purpose: pickup_verification`.
2. Server confirms the active booking and requester facility.
3. Server returns only pickup authorization context.
4. Server omits feeding, medication, emergency contact, and billing details because they are unrelated to the purpose.

### Facility observation writeback

1. Facility staff submit `pet.facility_observation.write` for an appetite or incident observation.
2. Server validates the active service relationship and staff actor.
3. Server records provenance, timestamp, source facility, visibility, and source role.
4. Server returns an acknowledgement with the recorded observation reference.

## Minimal First Schema Slice

The first schema slice should be narrower than the design space.

Recommended first objects:

- `CareFacilityContext`
- `FacilityBookingContext`
- `CareInstructions`
- `FeedingInstructions`
- `VaccinationStatus`
- `PickupAuthorization`
- `EmergencyContact`

Defer from the first schema slice unless design partners identify it as a blocker:

- Medication administration.
- Facility observation writeback.
- Incident writeback.
- Payment authority.
- Emergency access.
- Full sitter or in-home care workflows.

Medication is operationally important, but it raises stronger safety and liability questions. It should be designed carefully rather than squeezed into the first pass.

## Conformance Expectations

A later profile-specific conformance suite should verify:

- Purpose-specific minimization.
- Facility identity and service-window constraints.
- Pickup authorization does not expose unrelated care or billing context.
- Facility booking context does not expose full medical history.
- Vaccination status can be returned without raw veterinary records.
- Staff-only notes from unrelated facilities are omitted.
- Partial responses include machine-readable omissions.
- Writeback observations include provenance and visibility.

## Design Partner Questions

Ask daycare, boarding, grooming, and adjacent software partners:

- What is the smallest context bundle needed to decide whether a booking can proceed?
- Which fields are required at booking time versus drop-off time?
- Which vaccination statuses are needed as structured fields?
- How should facility access expire after a service window?
- Which pickup authorization details are operationally necessary?
- Which medication fields are required for safe administration?
- Which staff observations should be writable by facilities?
- Which data would be unsafe or unnecessary for facilities to receive?

## Open Questions

- Should `facility_shareable` be a new visibility class, or can existing classes plus scopes express the boundary?
- Should care facilities receive generated temperament summaries before raw behavior observations are considered?
- Should medication administration be part of the first Care Facility Context Profile or a separate Medication Administration Profile?
- How should emergency access work without weakening normal consent boundaries?
- Should pet sitters reuse Care Facility Context or receive a distinct In-Home Care Profile?
- Should pickup authorization be its own profile because many systems need it without broader care context?
- What is the smallest viable adapter surface: context request only, or context request plus observation writeback?

## Recommended Next Steps

1. Review this design with 3-5 daycare, boarding, grooming, or care-management software partners.
2. Reduce the first schema slice to the fields multiple partners agree are required.
3. Add candidate purposes and scopes to a profile proposal.
4. Draft JSON Schemas and positive/negative examples for one boarding or daycare flow.
5. Add conformance fixtures for minimization, service-window limits, pickup authorization, and restricted omissions.
6. Only then add OpenAPI or MCP adapter sketches for the profile.
