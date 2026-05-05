# Care Network Profile Design

Date: 2026-05-05

Status: Design draft with first schema-backed lookup slice, non-normative

Related profile: Care Facility Context Profile

Related parallel slice: `docs/design/2026-05-05-care-facility-pickup-verification-slice.md`

## Design Status

This document scopes a possible Care Network profile or shared object model for CCP. It remains design material and does not define a stable standard. The repository now includes a first schema-backed `care_network_lookup` slice that exercises a narrow subset of this design for one pet and one subject actor.

Care Network is intentionally scoped as reusable permission and contact primitives, not as a broad household export. It should define how actors, relationships, contact methods, action authority, revocation, and expiration can be represented across CCP profiles.

The immediate reason to scope Care Network was Pickup Verification. Pickup Verification consumes a minimized Care Network subset, and the first standalone lookup slice now tests whether reusable actor, relationship, contact-channel, action-authorization, and revocation primitives can be exposed safely without becoming a full household export.

## Purpose

Care Network should let authorized systems answer narrow questions about who is connected to a pet and what that actor is allowed to know, receive, or do for a specific purpose.

The model should preserve CCP's core guarantees:

- Pet-level consent.
- Purpose-bound access.
- Least-privilege scopes.
- Provenance on returned facts and summaries.
- Visibility classes that prevent accidental cross-context disclosure.
- Machine-readable omissions for restricted or unavailable data.
- Expiration and revocation semantics for actor permissions.

Care Network should distinguish three separate capabilities:

- Knowing that an actor exists in relation to a pet.
- Contacting that actor through an allowed contact channel.
- Treating that actor as authorized to perform an action.

These capabilities must not collapse into one broad "caregiver" or "household member" grant.

## Relationship To CCP

Care Network should reuse CCP authorization, provenance, visibility, omission, request, and response patterns where possible. It should not create a separate consent model.

The likely long-term shape is either:

- A standalone profile for care-network requests and responses.
- A shared object family reused by profiles such as Care Facility, Pet Sitter, In-Home Care, Veterinary Export, and Emergency Handoff.

The shared-object approach may be preferable if Care Network primitives are mostly embedded into other purpose-specific profiles. A standalone profile may be useful for management flows, such as listing active caregiver authorizations or revoking a pickup contact.

Either approach should keep purpose-specific minimization at the request profile boundary. For example, a facility pickup workflow may receive one pickup-relevant actor authorization without receiving the pet's full care network.

## Relationship To Care Facility Pickup Verification

Pickup Verification should be a narrow care-facility workflow that asks:

> May this actor pick up this pet from this facility for this service window?

That workflow should consume only a minimized Care Network subset:

- Pet id.
- Facility id.
- Service id or service window.
- Candidate pickup actor id or presented contact attributes.
- Pickup authorization status.
- Display name or operational label.
- Relationship or role label when allowed.
- Allowed contact channel when needed.
- Identity-check requirement.
- Constraints, expiration, and revocation status.
- Provenance for the authorization decision.

Pickup Verification should not depend on the full Care Network model being stable. It should not require a complete actor graph, full household membership, unrelated caregivers, billing authority, emergency contacts unrelated to pickup, or care instructions.

Care Network should provide reusable language and candidate objects. Pickup Verification should define the purpose-specific request, response, and field minimization rules.

## Primary Use Cases

### Pickup authorization

A care facility verifies that a specific actor may pick up a pet during an active or upcoming service window.

Returned context should be limited to the authorization decision and pickup-relevant actor details. It should not include feeding, medication, emergency, household, billing, or broader care history.

### Emergency contact handoff

A facility, sitter, or other authorized care actor receives the minimum contact details needed to reach an emergency contact during a service window.

This use case should not create unrestricted emergency access. It should return contact details only when the purpose, service window, grant, visibility, and provenance allow it.

### Delegated caregiver coordination

An owner or primary caregiver grants another actor permission to receive limited pet context or perform a specific action, such as drop-off, pickup, medication handoff confirmation, or care updates.

Delegated authority should be explicit about what the actor may do. A delegated caregiver may be contactable without being allowed to pick up the pet or approve care decisions.

### Care network management

An owner or authorized administrator lists, adds, updates, revokes, or expires actor relationships and permissions for a pet.

This may become a standalone profile later. It is broader than Pickup Verification and should not be required for the pickup slice.

### Contact preference lookup

An authorized requester asks for the preferred contact channel for a specific actor and purpose.

The response should include only channels allowed for that purpose. For example, a facility may receive a phone number for pickup coordination without receiving home address, billing address, or unrelated household contacts.

## Candidate Purposes

Purpose names are draft candidates:

- `care_network_lookup`
- `care_network_management`
- `caregiver_invitation`
- `contact_lookup`
- `pickup_verification`
- `emergency_contact_handoff`
- `delegated_care_coordination`
- `authorization_revocation`

Purpose strings should stay specific enough for policy engines to enforce minimization.

Examples:

- `pickup_verification` should not expose the full care network.
- `contact_lookup` should not imply action authority.
- `emergency_contact_handoff` should not expose full household records.
- `care_network_management` should be restricted to owners, primary caregivers, or explicitly authorized administrators.

## Candidate Scopes

Read scopes:

- `pet.care_network.actor_refs.read`
- `pet.care_network.relationships.read`
- `pet.care_network.contact_channels.read`
- `pet.care_network.action_authorizations.read`
- `pet.care_network.revocation_status.read`
- `pet.pickup_authorization.read`
- `pet.emergency_contacts.read`

Write or management scopes:

- `pet.care_network.actor_ref.write`
- `pet.care_network.relationship.write`
- `pet.care_network.contact_channel.write`
- `pet.care_network.action_authorization.write`
- `pet.care_network.authorization.revoke`

Deferred or separate-profile scopes:

- `pet.owner_household.read`
- `pet.billing.read`
- `pet.payment_authority.read`
- `pet.identity_documents.read`
- `pet.wellness.timeline.read`
- `pet.diagnosis_history.read`
- `pet.treatment_history.read`
- `pet.staff_notes.read`

Scope names should be evaluated by actual returned fields, not broad labels. A contact-channel scope should allow an authorized contact channel for the requested purpose; it should not allow all contact methods or household details.

## Candidate Context Objects

These object names are design candidates, not schema commitments.

### `CareNetworkContext`

A minimized bundle returned for a Care Network purpose.

Candidate fields:

- `pet_id`
- `purpose`
- `actor_refs`
- `relationships`
- `contact_channels`
- `action_authorizations`
- `revocation_statuses`
- `metadata`

The object should contain returned context only. Omissions should remain in the response envelope.

For purpose-specific profiles, the complete `CareNetworkContext` may never be returned. A profile such as Pickup Verification should embed or reference only the fields it needs.

### `ActorRef`

A minimal representation of a person, organization, staff actor, or integration client.

Candidate fields:

- `actor_id`
- `actor_type`
- `display_name`
- `organization_id`
- `role_label`
- `source`
- `provenance`

Candidate actor types:

- `owner`
- `caregiver`
- `emergency_contact`
- `pickup_contact`
- `facility_staff`
- `organization`
- `integration_client`

`ActorRef` should not include full household membership, government identity data, payment identity, or unrelated account records.

### `PetRelationship`

The relationship between an actor and a pet.

Candidate fields:

- `actor_id`
- `pet_id`
- `relationship_type`
- `relationship_label`
- `relationship_source`
- `starts_at`
- `ends_at`
- `status`
- `provenance`

Candidate relationship types:

- `owner`
- `primary_caregiver`
- `family_contact`
- `friend_contact`
- `pickup_contact`
- `emergency_contact`
- `facility_staff`
- `temporary_caregiver`

A relationship should not imply action authority by itself. A friend contact may be known and contactable while having no pickup, medical, billing, or approval authority.

### `ContactChannel`

A purpose-limited way to contact an actor.

Candidate fields:

- `actor_id`
- `channel_type`
- `channel_value`
- `preferred`
- `allowed_purposes`
- `valid_from`
- `valid_until`
- `verification_status`
- `provenance`

Candidate channel types:

- `phone`
- `sms`
- `email`
- `in_app`

Contact channels should be minimized by purpose. A care facility may need a mobile number during a pickup window, but that does not imply access to home address, billing address, or all account contact details.

### `ActionAuthorization`

An explicit permission for an actor to do something related to a pet.

Candidate fields:

- `authorization_id`
- `actor_id`
- `pet_id`
- `action`
- `status`
- `source_actor_id`
- `authorized_by_actor_id`
- `facility_id`
- `service_id`
- `service_window`
- `constraints`
- `expires_at`
- `revoked_at`
- `revoked_by_actor_id`
- `provenance`

Candidate actions:

- `pickup_pet`
- `drop_off_pet`
- `receive_care_updates`
- `receive_emergency_contact`
- `approve_minor_service_change`
- `manage_care_network`

Action authority should be narrow. `pickup_pet` should not imply billing authority, medical decision authority, emergency override access, or permission to read care instructions.

### `RevocationRecord`

A record that an authorization or contact permission has been revoked.

Candidate fields:

- `revocation_id`
- `target_authorization_id`
- `target_actor_id`
- `pet_id`
- `revoked_at`
- `revoked_by_actor_id`
- `reason_code`
- `effective_at`
- `provenance`

Revocation records should not expose sensitive free-text disputes or staff-only notes. Machine-readable reason codes are preferable for protocol exchange.

### `CareNetworkRequest` and `CareNetworkResponse`

If Care Network becomes a standalone profile, request and response envelopes should mirror existing CCP profile patterns.

Candidate request fields:

- `request_id`
- `requester_actor_id`
- `pet_id`
- `purpose`
- `scopes`
- `grant_id`
- `subject_actor_id`
- `service_id`
- `service_window`

Candidate response fields:

- `request_id`
- `status`
- `authorization_decision`
- `care_network_context`
- `omissions`

Purpose-specific profiles may define their own request and response envelopes instead of exposing these standalone objects.

## Authorization Rules

A Care Network request should evaluate at least:

- Requester identity.
- Pet identity.
- Requested purpose.
- Requested scopes.
- Grant status.
- Grant expiration.
- Grant revocation.
- Subject actor identity when the request targets a specific actor.
- Facility or organization identity when relevant.
- Service id and service window when relevant.
- Whether returned fields are allowed by visibility and provenance rules.
- Whether the requester may know the actor, contact the actor, or rely on the actor's action authority.

Policy engines should treat actor knowledge, contact access, and action authority as separate checks.

Examples:

- A facility may know that the presented actor is an authorized pickup contact without receiving the owner's full contact list.
- A sitter may receive the owner's phone number for care updates without receiving pickup authority.
- A friend may be listed as an emergency contact without receiving care instructions or medical history.

## Visibility Rules

Care Network may need visibility classes or field-level tags that express relationship and action boundaries.

Candidate visibility classes:

- `care_network_visible`
- `contact_shareable`
- `pickup_verification_only`
- `emergency_contact_shareable`
- `caregiver_manageable`

Existing visibility classes still matter:

- `owner_visible`
- `caregiver_visible`
- `staff_only`
- `facility_shareable`
- `vet_shareable`
- `agent_summary_only`
- `restricted_sensitive`

Rules to preserve:

- `restricted_sensitive` must not be returned unless the profile and grant explicitly allow the specific sensitive class.
- `staff_only` should not become Care Network visible by default.
- `owner_visible` does not imply facility access.
- `caregiver_visible` does not imply pickup authority.
- `contact_shareable` does not imply action authority.
- `pickup_verification_only` should not imply full care-network lookup.
- Allow-oriented visibility classes should not override deny-oriented classes.

Visibility should be evaluated per field. A display name may be shareable for pickup verification while a phone number is withheld or returned only in partial responses when needed.

## Provenance Rules

Returned Care Network fields should carry provenance sufficient for audit and trust.

Candidate provenance requirements:

- Who supplied the relationship or authorization.
- When it was created or last updated.
- Whether it was owner-entered, caregiver-entered, facility-entered, system-derived, or imported.
- Whether the value has been verified.
- When the authorization expires.
- Whether the authorization has been revoked.

For action authority, provenance should identify the source of authority. A server should be able to distinguish owner-granted pickup authority from an inferred contact relationship or stale booking record.

Omission details and authorization reason strings must not reveal restricted source content. For example, a response can say a contact channel was withheld because of missing scope, but it should not reveal the channel value in the omission detail.

## Safety Boundary

Care Network must not become a broad household export.

Exclude by default:

- Billing records.
- Payment instruments.
- Payment authority.
- Full household records.
- Household addresses unless a specific future purpose permits them.
- Identity document copies.
- Government identity numbers.
- Full medical or wellness history.
- Diagnosis history.
- Treatment history.
- Staff-only notes.
- Sensitive facility operations data.
- Unrelated pets.
- Unrelated people from the same household.
- Free-text disputes, custody notes, or sensitive relationship narratives.
- Free-text omission details that reveal restricted source content.

Include only when purpose, scope, grant, visibility, and provenance all allow it.

## Non-Goals

This design does not attempt to define:

- A complete social graph for pet owners.
- A household export format.
- A custody or legal authority system.
- Payment authority or billing delegation.
- Identity verification document exchange.
- Full emergency override access.
- Full veterinary medical-record access.
- Staff-note synchronization across organizations.
- Sitter or in-home care profiles beyond reusable primitives.

These areas may need future profiles or separate policy treatment.

## Example Flow Candidates

### Pickup verification with allowed actor

1. Owner grants pickup authority for one actor, one pet, one facility, and one service window.
2. Facility requests `purpose: pickup_verification` with the candidate pickup actor.
3. Server evaluates facility, pet, service window, grant, revocation status, purpose, scopes, visibility, and provenance.
4. Server returns an allowed pickup decision, actor display name, relationship label if allowed, identity-check requirement, expiration, constraints, and provenance.
5. Server does not return feeding instructions, medication details, emergency contacts, billing data, or the full care network.

### Pickup verification with revoked actor

1. Facility requests pickup verification for an actor who was previously authorized.
2. Server finds a revocation record effective before the pickup time.
3. Server returns a denied or partial response with machine-readable omission or denial reason.
4. Server does not reveal sensitive revocation notes or relationship disputes.

### Emergency contact handoff

1. Facility requests emergency contact handoff during an active service window.
2. Server confirms the facility and service relationship.
3. Server returns the highest-priority allowed emergency contact and contact channel.
4. Server omits unrelated household contacts and any contact channels not allowed for the emergency purpose.

### Caregiver contact lookup

1. Authorized sitter requests the owner's preferred contact channel for care updates.
2. Server verifies the sitter's grant, purpose, and service window.
3. Server returns one allowed contact channel.
4. Server does not return pickup authority, payment data, household records, or unrelated contacts.

### Care network management

1. Owner lists active action authorizations for a pet.
2. Server returns actor refs, relationship labels, action authorizations, expiration, and revocation status.
3. Owner revokes one pickup authorization.
4. Later pickup verification requests see the revoked status without receiving sensitive revocation detail.

## Minimal First Schema Slice Recommendation

The first schema slice should be narrower than the design space and should directly support Care Facility Pickup Verification.

Recommended first objects:

- `ActorRef`
- `PetRelationship`
- `ContactChannel`
- `ActionAuthorization`
- `RevocationRecord`

Recommended first action:

- `pickup_pet`

Recommended first purpose:

- `pickup_verification`

Recommended first returned subset:

- Authorized actor id.
- Display name.
- Relationship label.
- Pickup authorization status.
- Facility id.
- Service id or service window.
- Identity-check requirement.
- Constraints.
- Expiration.
- Revocation status.
- Provenance.

Defer from the first slice:

- Full `CareNetworkContext` listing.
- Care network management writes.
- Emergency contact handoff.
- Sitter or in-home care workflows.
- Payment authority.
- Identity document exchange.
- Household export.
- Full medical or wellness context.

This keeps Pickup Verification useful and reviewable while allowing Care Network to evolve as a shared object model.

## First Standalone Lookup Slice

The first schema-backed Care Network slice is `care_network_lookup`.

It includes:

- `CareNetworkLookupRequest`
- `CareNetworkLookupResponse`
- `CareNetworkContext`
- `CareNetworkActorRef`
- `CareNetworkPetRelationship`
- `CareNetworkContactChannel`
- `CareNetworkActionAuthorization`
- `CareNetworkRevocationRecord`

The request requires `subject_actor_id`, so the response can answer questions about one actor without returning the full network. Contact channels and action authorizations are separate arrays with separate scopes. A server can return actor and relationship context while omitting contact channels, or return contact information without implying pickup, payment, medical, or care-decision authority.

The first lookup slice is intentionally read-only. Care-network writes, invitations, revocation mutations, broad management views, emergency contact handoff, and sitter/in-home profiles remain separate future work.

## Schema Patch Plan

Do not schema-back the full Care Network design before proving narrow consumer workflows. Pickup Verification provided the first consumer workflow. The first standalone schema work now supports `care_network_lookup` for one pet and one subject actor, with separate scopes for actor references, relationships, contact channels, action authorizations, and revocation status.

Recommended patch order:

1. Decide whether the first pickup slice needs shared `ActorRef`, `ActionAuthorization`, and `RevocationRecord` definitions, or whether pickup-specific objects should carry those fields until a second workflow reuses them.
2. If shared definitions are needed, add only the minimal fields required by `pickup_verification`: actor id, display label, relationship or role label, action, authorization status, expiration, revocation status, service-window applicability, constraints, visibility, and provenance.
3. Keep `ContactChannel` optional in the first schema patch unless partner review confirms front-desk pickup workflows need a channel in the response.
4. The first standalone lookup workflow may return `CareNetworkContext`, but only as a minimized one-subject-actor bundle. It must not list the full network.
5. Do not add care-network write scopes, contact-channel write scopes, or revocation mutation scopes until management workflows are separately scoped.
6. Add negative fixtures anywhere shared Care Network definitions are used to ensure contact access does not imply action authority, relationship existence does not imply pickup authority, and revocation or expiration fails closed.

This plan keeps Care Network as reusable design material while Pickup Verification supplies the concrete schema pressure.

## Conformance Expectations

A later Care Network or Pickup Verification conformance suite should verify:

- Pickup verification returns only pickup-relevant actor authorization.
- Contact access does not imply action authority.
- Relationship existence does not imply contact access.
- Action authority includes expiration and revocation handling.
- Revoked authorizations fail closed.
- Expired authorizations fail closed.
- Returned actor and authorization fields include provenance.
- Purpose mismatch prevents unrelated Care Network data from being returned.
- Full household records are not returned.
- Billing and payment data are not returned.
- Identity document copies are not returned.
- Medical, wellness, diagnosis, and treatment history are not returned.
- Unrelated pets and unrelated household actors are not returned.
- Partial and denied responses include machine-readable omissions or reasons without leaking restricted source content.

Negative fixtures should include at least:

- Pickup verification response with full household contacts.
- Pickup verification response with billing or payment authority.
- Pickup verification response with identity document data.
- Contact lookup response that implies pickup authority.
- Relationship lookup response that includes unrelated pets.
- Revoked pickup actor returned as allowed.
- Expired pickup actor returned as allowed.

## Design Partner Questions

Ask facility, sitter, commerce, and care-management partners:

- What actor details are needed to verify pickup at the front desk?
- Does pickup verification need a contact channel, or only an allowed or denied decision?
- What identity-check language is operationally useful without exchanging identity document copies?
- How should temporary pickup authority be represented for a single service window?
- How quickly must revocation take effect across facility systems?
- Which actor relationships are useful labels, and which create privacy risk?
- Should emergency contacts use the same object model as pickup contacts?
- What contact-channel preferences are needed for care updates?
- Which care-network management flows are needed before implementers can adopt the pickup slice?
- What data would be unsafe or unnecessary for partners to receive?

## Open Questions

- Should Care Network become a standalone profile or a shared object family embedded by other profiles?
- Should `pickup_verification` live under Care Facility only, or also be a reusable Care Network purpose?
- What is the final boundary between `PetRelationship` and `ActionAuthorization`?
- Should a requester be allowed to verify an actor by presented phone or email, or only by stable actor id?
- Should contact channels be returned during pickup verification, or only when a follow-up contact is needed?
- Should `care_network_visible` be a new visibility class, or can existing classes plus purpose-specific scopes express the boundary?
- How should custody disputes, blocked contacts, and sensitive relationship notes be represented without leaking unsafe detail?
- Should revocation records expose reason codes to requesters, or only effective status?
- How should booking-derived pickup authority work when no explicit grant id exists?
- How much broader should this model become before design-partner review beyond the first lookup slice?

## Recommended Next Step

Run design-partner review against the first lookup slice before adding management writes, broad list views, emergency handoff, or sitter-specific behavior.

Compare this draft against the Care Facility Pickup Verification slice before any schema work. The pickup slice should define the concrete request, response, examples, and negative fixtures for `pickup_verification`, while this document stays focused on reusable Care Network primitives and boundaries.
