# Care Facility Pickup Verification Slice Proposal

Date: 2026-05-05

Status: Design draft, non-normative

Related design: `docs/design/2026-05-05-care-facility-context-profile.md`

Related first-slice proposal: `docs/design/2026-05-05-care-facility-first-schema-slice.md`

Related parallel design: `docs/design/2026-05-05-care-network-profile.md`

## Purpose

Define a narrow Care Facility Context schema slice for verifying whether a specific actor can pick up a specific pet for a specific facility and service window.

This proposal is intentionally smaller than boarding preparation. It should return only pickup-relevant authorization, contact, constraint, and check requirements. It should not expose the pet's broader care plan, owner household context, billing authority, medical context, or unrelated contacts.

The slice is designed to run in parallel with a Care Network profile or shared object model. It should consume a minimized Care Network subset, but it should not require the entire Care Network model to be stable before pickup verification can be tested.

## Relationship To Care Facility Context

Pickup verification is a Care Facility Context workflow, not a new broad profile.

The broader Care Facility Context Profile includes booking, boarding preparation, daycare, grooming, medication execution, emergency handoff, and writeback concepts. This slice uses the same care-facility authorization model, including facility identity, service window, purpose-bound access, scope checks, provenance, visibility, and machine-readable omissions.

The key difference is minimization. A pickup verification response should answer only:

- Is this actor authorized to pick up this pet?
- Which facility and service window does that authorization apply to?
- What relationship or role label may the facility display?
- Which contact channel may be used for pickup coordination?
- What check or constraint must staff apply before release?
- Was the answer allowed, partially available, or denied?

It should not return boarding preparation context such as feeding instructions, medication details, vaccination status, care instructions, emergency contacts, or facility booking preparation data unless a later workflow separately requests those fields under a different purpose.

## Relationship To Care Network

Care Network should define reusable actor, relationship, contact, delegation, revocation, and permission primitives across owners, caregivers, pickup contacts, emergency contacts, and other trusted actors.

This pickup slice should consume only a small subset:

- Actor identity reference.
- Display name or facility-safe label.
- Relationship or role label.
- Pickup authorization status.
- Applicable pet.
- Applicable facility or service.
- Applicable service window.
- Contact channel allowed for pickup coordination.
- Revocation or expiration state.
- Identity-check requirement descriptor.

The slice should not require Care Network to settle every role taxonomy, household model, emergency delegation rule, or long-term sharing policy before pickup verification can move forward. The pickup response can reference candidate Care Network fields while keeping its own response semantics purpose-bound.

## Workflow Choice

Start with pickup verification at active or imminent pickup.

This workflow is narrow enough to validate purpose-specific minimization and high-value enough for facilities:

1. A facility staff member or facility integration requests pickup verification.
2. The request identifies the pet, facility, service, service window, and pickup actor being verified.
3. The server checks facility identity, service-window applicability, grant or booking-derived access, actor authorization, revocation, expiration, visibility, and provenance.
4. The server returns a decision and a minimized pickup authorization bundle, or denies the request without returning pickup context.

This slice should not attempt to model check-in, drop-off, daycare eligibility, emergency handoff, or full care-network administration. Those workflows may reuse the same Care Network primitives later.

## Scope, Purpose, And Service Window Model

Candidate purpose:

- `pickup_verification`

Candidate read scope:

- `pet.pickup_authorization.read`

Candidate deferred or out-of-scope scopes:

- `pet.care_network.actor_refs.read`
- `pet.care_network.relationships.read`
- `pet.care_network.contact_channels.read`
- `pet.care_network.action_authorizations.read`
- `pet.emergency_contacts.read`
- `pet.care_instructions.read`
- `pet.feeding_instructions.read`
- `pet.medications.administration.read`
- `pet.vaccinations.status.read`
- `pet.billing.read`
- `pet.payment_authority.read`
- `pet.owner_household.read`
- `pet.wellness.timeline.read`
- `pet.diagnosis_history.read`
- `pet.treatment_history.read`

The first schema slice should require a facility identity and a bounded service window. A service window means the time period during which pickup verification is relevant for a specific booking, stay, appointment, transport handoff, or similar service.

Draft constraints:

- `purpose` should be `pickup_verification`.
- `facility_id` should be required.
- `pet_id` should be required.
- `pickup_actor_id` should be required for direct actor verification.
- `service_window` should be required and include start and end timestamps.
- `service_id` should be required unless design partners prove that some pickup checks happen before service creation.
- Requested scopes should be unique.
- The response should be valid only for the requested facility and service window.

Grant-based access is the simplest first pass. Booking-derived access can be evaluated later if partners need facility systems to verify pickup authorization without an explicit grant id.

## Request Envelope

Candidate object: `CareFacilityPickupVerificationRequest`

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
- `pickup_actor_id`
- `pickup_actor_claim`

Draft constraints:

- `purpose` should be `pickup_verification`.
- `scopes` should include `pet.pickup_authorization.read`.
- `pickup_actor_id` should be the preferred identifier when the actor is already known in the Care Network.
- `pickup_actor_claim` may be used for design discussion when the facility has only a name, phone, code, QR reference, or other claim. It should not include copies of identity documents.
- `grant_id` should be required in the first slice unless booking-derived access is explicitly included.
- `service_window` should match the requested service or pickup handoff.

`pickup_actor_claim` needs careful design. It may be useful for facilities that need to resolve a person at the counter, but it can also invite over-collection. The first schema slice may omit it and require `pickup_actor_id`.

## Response Envelope

Candidate object: `CareFacilityPickupVerificationResponse`

Fields:

- `request_id`
- `status`
- `authorization_decision`
- `pickup_verification_context`
- `omissions`

Status rules should mirror the existing CCP response pattern:

- `ok` uses decision `allowed`, includes non-null `pickup_verification_context`, and has no omissions.
- `partial` uses decision `partial`, includes non-null `pickup_verification_context`, and has at least one omission.
- `denied` uses decision `denied`, returns `pickup_verification_context: null`, and has at least one omission.

The response should not include the full Care Facility Context bundle. A dedicated pickup context object makes the minimization boundary easier to test.

## Candidate Context Objects

These object names are design candidates, not schema commitments.

### `PickupVerificationContext`

Candidate fields:

- `pet_id`
- `purpose`
- `facility_id`
- `service_id`
- `service_type`
- `service_window`
- `pickup_actor`
- `pickup_authorization`
- `release_constraints`
- `metadata`

The context bundle should contain returned pickup context only. Omissions should remain in the response envelope.

### `PickupActor`

Candidate fields:

- `actor_id`
- `display_name`
- `relationship`
- `role`
- `contact_channel`
- `care_network_source`
- `metadata`

The returned actor fields should be facility-safe and pickup-relevant. The response should not return household membership, unrelated relationship graph data, unrelated contacts, address history, identity document numbers, or identity document copies.

### `PickupAuthorizationVerification`

Candidate fields:

- `authorization_status`
- `authorization_source`
- `authorized_by_actor_id`
- `effective_at`
- `expires_at`
- `revocation_status`
- `applies_to_pet_id`
- `applies_to_facility_id`
- `applies_to_service_id`
- `applies_to_service_window`
- `constraints`
- `identity_check_required`
- `identity_check_method`
- `release_allowed`
- `metadata`

Candidate authorization statuses:

- `authorized`
- `not_authorized`
- `expired`
- `revoked`
- `unknown`
- `owner_confirmation_required`

`identity_check_method` should describe the required staff action, such as visual ID check or owner code confirmation. It should not include raw identity document copies, document numbers, scans, images, or unrelated personal records.

### `ReleaseConstraint`

Candidate fields:

- `constraint_type`
- `summary`
- `applies_until`
- `source`
- `metadata`

Candidate constraint types:

- `specific_window_only`
- `specific_location_only`
- `owner_confirmation_required`
- `photo_or_id_check_required`
- `code_required`
- `do_not_release`
- `staff_manager_review_required`

Release constraints should be short, operational, and facility-shareable. They should not include free-text history that reveals sensitive medical, behavioral, billing, family, or household details.

## Authorization Rules

A pickup verification request should evaluate at least:

- Requester actor identity.
- Facility identity.
- Pet identity.
- Requested purpose.
- Requested scope.
- Grant status and grant scope.
- Service id and service-window applicability.
- Whether the facility is associated with the relevant booking or handoff.
- Whether the pickup actor is authorized for the pet and service window.
- Whether the pickup authorization is active, expired, revoked, or requires owner confirmation.
- Whether returned fields are allowed by visibility and provenance rules.

Authorization should fail closed. If the server cannot verify the facility, service window, grant, pickup actor, or visibility of the relevant authorization fact, it should deny or return a partial response with a machine-readable omission.

## Visibility And Provenance Rules

Returned fields should be visible for pickup verification and carry provenance.

Candidate visibility classes:

- `facility_shareable`
- `pickup_verification_only`

The first schema slice can use existing `facility_shareable` behavior and discuss `pickup_verification_only` as a possible narrower future class. A field marked `staff_only`, `restricted_sensitive`, `vet_shareable`, or unrelated `caregiver_visible` should not become visible merely because the facility requested pickup verification.

Every returned field or object should identify:

- Source system or source actor.
- Source timestamp or last verified timestamp.
- Visibility class.
- Confidence or verification status when relevant.
- Any service-window limit when relevant.

Provenance should explain why the pickup answer is trustworthy enough for the facility to act on, without exposing restricted source content.

## Denial And Omission Semantics

Valid denied or fail-closed cases should include:

- Facility mismatch.
- Service window inactive.
- Grant expired.
- Grant revoked.
- Purpose mismatch.
- Scope missing.
- Pickup actor unknown.
- Pickup actor not authorized.
- Pickup authorization expired.
- Pickup authorization revoked.
- Owner confirmation required.

Denied responses should return `pickup_verification_context: null`.

Partial responses may be useful when the server can confirm some pickup-relevant context but not enough for final release. For example, the server might return the actor display name and relationship but omit `release_allowed` because owner confirmation is required.

The current canonical omission registry does not include a dedicated owner-confirmation reason. A schema proposal for this slice should either add a narrowly named omission reason, such as `owner_confirmation_required`, or use the existing `not_available` reason with safe detail text until that registry change is accepted.

Omissions should identify the omitted field, reason, visibility class when relevant, and required scope when relevant. Omission detail text must not reveal restricted source content. For example, an omission can say that owner confirmation is required, but it should not expose unrelated household conflict, billing dispute, medical detail, or staff-only note content.

## Safety Boundary And Non-Goals

Pickup verification must not become a shortcut into broader facility, household, billing, or medical context.

Exclude from this slice:

- Feeding instructions.
- Medication names, schedules, dosage, storage, or administration details.
- Billing records.
- Payment authority.
- Owner household context.
- Identity document copies.
- Identity document numbers.
- Broader care history.
- Wellness timeline.
- Diagnosis history.
- Treatment history.
- Vaccination records or vaccination status unless separately requested for another purpose.
- Emergency contacts unrelated to pickup.
- Unrelated contacts from the Care Network.
- Staff-only notes.
- Internal facility notes from other providers.
- Raw behavioral incident records.
- Free-text denial details that reveal restricted source content.

The slice should answer whether release to the requested actor is allowed for the requested pickup context. It should not explain every reason behind the authorization model when those reasons would disclose sensitive data.

## Example Flow Candidates

### Authorized pickup

1. Owner grants pickup authorization to a named caregiver for one pet and one boarding stay.
2. Facility requests `purpose: pickup_verification` with `pickup_actor_id`, `facility_id`, `service_id`, and `service_window`.
3. Server verifies the facility, active service window, grant, pickup actor, authorization status, visibility, and provenance.
4. Server returns `release_allowed: true`, the actor display name, relationship label, allowed contact channel, expiration, and required identity-check method.

### Owner confirmation required

1. Facility requests pickup verification for an actor whose authorization is present but conditional.
2. Server returns `status: partial`.
3. Server includes the pickup actor label and relationship if allowed.
4. Server omits final release permission with a safe omission reason. If the omission registry is extended for this slice, use a dedicated reason such as `owner_confirmation_required`; otherwise use `not_available` with safe detail text.
5. Facility must obtain owner confirmation outside the response before release.

### Denied for facility mismatch

1. Facility requests pickup verification for a service window belonging to another facility.
2. Server returns `status: denied`.
3. Server returns `pickup_verification_context: null`.
4. Server includes an omission with reason `facility_mismatch` and does not reveal pickup actor or authorization details.

### Denied for inactive service window

1. Facility requests pickup verification after the pickup authorization expired.
2. Server returns `status: denied`.
3. Server returns `pickup_verification_context: null`.
4. Server includes an omission with an existing reason such as `service_window_inactive` or `grant_expired`, depending on the failing policy. A future schema proposal may add a more specific pickup-authorization expiration reason if partner review shows that implementers need it.

## Minimal First Schema Slice

Recommended first schema objects:

- `CareFacilityPickupVerificationRequest`
- `CareFacilityPickupVerificationResponse`
- `PickupVerificationContext`
- `PickupActor`
- `PickupAuthorizationVerification`
- `ReleaseConstraint`

Recommended first purpose:

- `pickup_verification`

Recommended first scope:

- `pet.pickup_authorization.read`

Recommended first constraints:

- Require `facility_id`.
- Require `pet_id`.
- Require `pickup_actor_id`.
- Require `service_id`.
- Require `service_window`.
- Require `grant_id`.
- Require provenance and visibility on returned facts.
- Require denied responses to have null pickup context.
- Forbid unrelated care, medical, billing, household, and identity-document fields.

Defer from the first pickup slice:

- Actor claim matching without `pickup_actor_id`.
- Booking-derived access without `grant_id`.
- Care Network administration.
- Emergency contact handoff.
- Drop-off authorization.
- Transport handoff.
- Payment authority.
- Facility observation writeback.
- Full Care Network graph export.

This keeps the first pass small enough to validate in examples, conformance fixtures, OpenAPI, MCP, and helper packages without blocking on the broader Care Network design.

## Schema Patch Plan

Patch this slice in small, reviewable steps only after the design questions above have an initial answer:

1. Add canonical registry value `pickup_verification`, reuse the existing `pet.pickup_authorization.read` scope, and add any accepted omission reason such as `owner_confirmation_required`.
2. Add `CareFacilityPickupVerificationRequest`, `CareFacilityPickupVerificationResponse`, `PickupVerificationContext`, `PickupActor`, `PickupAuthorization`, and `ReleaseConstraint` to the canonical schema.
3. Reuse existing `ServiceWindow`, `AuthorizationDecision`, `Omission`, field-envelope, visibility, provenance, facility, and pet identity patterns instead of creating pickup-specific policy machinery.
4. Add one allowed example, one owner-confirmation partial example, and denied examples for facility mismatch and inactive service window.
5. Add negative fixtures for denied response with context, identity-document leakage, payment-authority leakage, unrelated contact leakage, feeding or medication leakage, full Care Network leakage, and purpose mismatch.
6. Wire conformance, OpenAPI, MCP, TypeScript helper, Python schema-helper, README, roadmap, and implementer guidance only after the canonical JSON Schema shape is stable enough for review.

Do not schema-back actor-claim matching, booking-derived access without `grant_id`, emergency contact handoff, drop-off authorization, transport handoff, care-network administration, or payment authority in the first pickup patch.

## Conformance Expectations

A later conformance suite should verify:

- `purpose` is limited to `pickup_verification`.
- Returned context is pickup-relevant only.
- Facility identity and service-window constraints are enforced.
- Denied responses return null pickup context.
- Facility mismatch does not leak pickup actor or authorization details.
- Expired or revoked authorization fails closed.
- Pickup authorization does not expose feeding, medication, billing, household, wellness, diagnosis, treatment, or unrelated contact data.
- Identity-check fields do not include identity document copies or document numbers.
- Returned fields include provenance and visibility.
- Partial responses include machine-readable omissions.
- A request cannot use pickup verification to obtain full Care Network data.

Positive examples should cover an authorized pickup and an owner-confirmation-required partial response. Negative fixtures should cover identity document leakage, payment authority leakage, unrelated contact leakage, feeding or medication leakage, denied response with non-null context, and purpose mismatch.

## Design Partner Questions

Ask boarding, daycare, grooming, and facility software partners:

- At pickup time, do staff usually know the pickup actor before requesting verification?
- Is `pickup_actor_id` enough for the first slice, or do facilities need claim-based lookup?
- Which identity-check methods need structured values?
- Which release constraints need structured values?
- How long before or after a service window should pickup verification be allowed?
- Should release authorization ever be partial, or should uncertain cases always deny?
- What actor display fields are necessary at the front desk?
- Should a contact channel be returned, or should the facility contact only the owner through its own system?
- Which pickup authorization sources are trusted operationally?
- What denial reason details can be shown to staff without creating privacy or safety issues?

## Open Questions

- Should pickup verification use a dedicated `PickupVerificationContext` object or a narrowed `CareFacilityContext` object?
- Should `pickup_verification_only` become a visibility class, or is `facility_shareable` plus purpose sufficient?
- Should the first schema support conditional release, or should owner-confirmation cases always deny?
- Should `pickup_actor_claim` be deferred to avoid over-collection?
- Should `service_id` be mandatory for all pickup verification requests?
- How should revocation timing be represented when an actor was authorized at booking time but revoked before pickup?
- Should this slice define `ReleaseConstraint` now, or keep constraints as summarized field envelopes until partner review?
- Which parts of Care Network should become shared core objects instead of pickup-specific objects?
