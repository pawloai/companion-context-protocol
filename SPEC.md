# Companion Context Protocol Specification

Status: Draft

Version: 0.1.0-draft

## Purpose

Companion Context Protocol (CCP) defines a vendor-neutral contract for permissioned companion-animal context exchange.

CCP lets authorized systems request only the pet context needed for a task, with consent, provenance, and safety boundaries.

This document is a draft protocol proposal. It is not a consensus standard, certification program, or adopted industry baseline. Implementers should treat it as design-partner review material until independent systems have reviewed the model, attempted implementations, and resolved compatibility feedback in public artifacts.

The protocol defines:

- Context object shapes.
- Consent and permission grants.
- Purpose-bound access.
- Visibility classes.
- Provenance requirements.
- Scope naming.
- Omission and denial semantics.
- Compatibility requirements.

CCP is transport-neutral. JSON Schema is the canonical contract. MCP, OpenAPI/HTTP, SDKs, and other transports can implement CCP-compatible flows.

## Non-Goals

CCP is not:

- A database schema.
- A standards body.
- A customer portal.
- A product catalog.
- A recommendation engine.
- A medical diagnosis protocol.
- A replacement for payment, identity, or facility management systems.
- A claim that existing pet-data, care-facility, or veterinary software ecosystems have endorsed this draft.

## Transport Model

CCP separates the domain contract from integration transports.

The same CCP request should be expressible through multiple surfaces:

- JSON Schema for canonical object validation.
- OpenAPI/HTTP for ordinary service integrations.
- MCP tools for agents and assistant clients.
- TypeScript and Python packages for implementers.

A transport is CCP-compatible when it preserves the same authorization, minimization, provenance, visibility, and omission semantics.

MCP is one adapter for CCP. It is not the protocol itself.

## Terminology

Actor: A person, organization, system, agent, or service requesting or acting on context. This draft uses a broad actor term, but implementers should distinguish owner, caregiver, facility, merchant, agent client, and service-integration trust postures in policy decisions.

Pet: The companion animal that context describes.

Owner: An actor with primary consent authority for a pet, subject to future multi-owner rules.

Caregiver: An actor delegated by an owner or facility to perform specific care-related tasks.

Requester: The actor or client asking for context.

Grant: A permission record authorizing a requester to access specific context for a specific pet, purpose, and time window. Grant issuance, storage, presentation, signature format, revocation propagation, and proof-of-possession are not standardized in this draft.

Purpose: The task or reason for the request, such as `product_recommendation`.

Visibility class: A safety label that constrains where a context item may be exposed.

Provenance: Metadata describing where a fact came from, when it was recorded, and how trustworthy or fresh it is.

Omission: A machine-readable explanation that context exists or was requested but was not returned.

## Current Profiles

The first schema-backed profile is the Commerce Context Profile.

Profile order is a draft artifact, not a claim about market priority or ecosystem consensus. Commerce Context was selected as a narrow, lower-risk schema slice, but design-partner feedback may show that a Facility Truth or care-facility workflow should be validated first.

This profile lets authorized clients request commerce-safe pet context for product recommendations and filtering while excluding unrelated sensitive context.

The initial profile should support:

- Species.
- Breed or breed mix.
- Size.
- Weight band.
- Life stage.
- Diet.
- Allergies.
- Sensitivities.
- Product exclusions.
- Staff-curated or owner-entered preferences.
- Relevant purchase history summary when explicitly permitted.

The initial profile should exclude by default:

- Internal staff notes.
- Full wellness timelines.
- Diagnosis or treatment history.
- Billing data.
- Unrelated owner or household data.
- Sensitive facility operations data.

The draft also includes Care Facility Context schema slices for `boarding_preparation` and `pickup_verification`, plus a first Care Network lookup slice for `care_network_lookup`. The boarding-preparation slice lets an authorized care facility request boarding-preparation context for one pet, facility, and service window. The pickup-verification slice lets an authorized care facility verify whether one pickup actor may pick up one pet for one facility and service window. The Care Network lookup slice lets an authorized requester retrieve a minimized actor, relationship, contact-channel, action-authorization, or revocation subset for one pet and one subject actor.

The boarding-preparation care-facility slice can include:

- Facility booking context.
- Care instructions.
- Feeding instructions.
- Vaccination status.
- Pickup authorization.
- Emergency contacts.

The boarding-preparation care-facility slice excludes by default:

- Medication administration.
- Facility observation writeback.
- Full wellness timelines.
- Diagnosis or treatment history.
- Billing data and payment authority.
- Identity document copies.

Facility Truth is a design candidate, not a schema-backed profile in this version. It would cover public or operational facility facts such as hours, services, service areas, eligibility constraints, certifications, contact methods, booking links, accepted pet types, freshness, and provenance. It should be developed separately from pet-specific context because public facility facts have different consent, authorization, and provenance requirements.

## Core Objects

### `PetProfile`

Basic pet identity and physical context needed for safe compatibility filtering.

Identifiers such as `pet_id` remain plain strings. Returned context fields are field envelopes containing:

- `value`
- `visibility`
- `provenance`

Provenance is mandatory audit metadata for returned facts and summaries. It is not a separately grantable context scope in the Commerce Context Profile.

The Commerce Context Profile minimizes canonical `PetProfile` and `DietProfile` shapes through `CommercePetProfile` and `CommerceDietProfile`. These profile-specific objects allow partial context but require `commerce_safe` visibility on every returned field and object metadata.

Expected fields include:

- `pet_id`
- `display_name`
- `species`
- `breed`
- `breed_mix`
- `sex`
- `age_years`
- `life_stage`
- `weight`
- `size_class`
- `metadata`

### `DietProfile`

Diet, allergy, sensitivity, feeding, and product-exclusion context.

Expected fields include:

- `diet_profile_id`
- `pet_id`
- `food_brands`
- `proteins`
- `feeding_schedule`
- `allergies`
- `sensitivities`
- `treats_allowed`
- `product_exclusions`
- `owner_notes_summary`
- `metadata`

### `CommerceContext`

A minimized commerce-safe bundle derived from one or more pet context objects.

`CommerceContext` supports partial responses. A server may return only the granted portions of the context and must explain omitted fields in the response envelope. Nested profile objects may also be partial, but every returned field must still include visibility and provenance.

Expected fields include:

- `pet_id`
- `purpose`
- `pet_profile`
- `diet_profile`
- `preferences`
- `purchase_history_summary`
- `metadata`

### `PermissionGrant`

A scoped authorization record.

`PermissionGrant` defines the interoperable authorization record shape, not the full grant transport system. Possession of a `grant_id` is not sufficient authority. A compatible server must verify current grant state against trusted authorization data and fail closed when issuer authority, requester identity, subject pet, purpose, scopes, facility boundary, service window, expiration, or revocation state cannot be verified.

Expected fields include:

- `grant_id`
- `subject_pet_id`
- `grantor_actor_id`
- `grantee_actor_id`
- `scopes`
- `purposes`
- `expires_at`
- `status`
- `created_at`
- `revoked_at`

### `ContextProvenance`

Source and trust metadata attached to facts, observations, or generated summaries.

Expected fields include:

- `source_type`
- `source_actor_id`
- `source_system`
- `recorded_at`
- `verified_at`
- `confidence`
- `stale_after`
- `source_record_ref`
- `derived_from`

If `source_type` is `generated`, the provenance object must include `source_system` and `derived_from`.

## Purpose-Bound Access

Scopes are necessary but not sufficient.

A CCP server should evaluate access using:

- Requester identity.
- Pet identity.
- Requested scopes.
- Declared purpose.
- Active grant.
- Visibility class.
- Context sensitivity.
- Expiration and revocation state.
- Facility, merchant, or recipient boundary where relevant.

For example, `pet.commerce_context.read` with `purpose: product_recommendation` should not expose staff-only behavior notes, raw wellness timelines, diagnosis history, or billing records.

Responses should include an `authorization_decision` object recording:

- Decision: `allowed`, `partial`, or `denied`.
- Evaluation timestamp.
- Requester actor.
- Pet.
- Purpose.
- Grant applied, when available.
- Applied scopes.
- Denied scopes.
- Human-readable decision reasons.

The response `status`, `authorization_decision.decision`, and `commerce_context` value must be consistent:

- `ok` responses use decision `allowed`, include non-null context, and have no omissions.
- `partial` responses use decision `partial`, include non-null context, and include at least one omission.
- `denied` responses use decision `denied`, return `commerce_context: null`, and include at least one omission.

## Visibility Classes

Every returned context item should have one or more visibility classes.

Returned context fields should use the field envelope shape:

```json
{
  "value": "large",
  "visibility": ["owner_visible", "commerce_safe"],
  "provenance": {
    "source_type": "generated",
    "source_system": "example-ccp-server",
    "recorded_at": "2026-05-04T16:30:00Z",
    "derived_from": ["example://pets/pet_luna_001/profile/weight"]
  }
}
```

Initial visibility classes:

- `owner_visible`
- `caregiver_visible`
- `staff_only`
- `vet_shareable`
- `facility_shareable`
- `commerce_safe`
- `care_network_visible`
- `contact_shareable`
- `action_authorization_visible`
- `agent_summary_only`
- `restricted_sensitive`

### Visibility Precedence

Visibility classes are not simple additive permissions.

Deny-oriented classes take precedence over allow-oriented classes.

Initial precedence rules:

1. `restricted_sensitive` must not be returned unless the request has an explicit matching grant and purpose.
2. `staff_only` must not be returned to commerce contexts.
3. `agent_summary_only` may be summarized but raw source observations should be omitted.
4. `commerce_safe` may be returned for commerce purposes only when the requested scope and grant also allow it.
5. `owner_visible`, `caregiver_visible`, and `vet_shareable` do not imply commerce access.
6. `commerce_safe` must not be combined with `staff_only`, `restricted_sensitive`, `facility_shareable`, `care_network_visible`, `contact_shareable`, or `action_authorization_visible` on the same returned field. Profile-bound classes are mutually exclusive on a given field; cross-profile reuse requires a separate authorized response in the other profile.
7. `facility_shareable` may be returned for care-facility purposes only when the requested scope, purpose, grant, facility, and service window also allow it.
8. `facility_shareable` must not be combined with `staff_only`, `restricted_sensitive`, `commerce_safe`, `care_network_visible`, `contact_shareable`, or `action_authorization_visible` on the same returned field.
9. `care_network_visible`, `contact_shareable`, and `action_authorization_visible` may be returned for Care Network lookup only when the requested actor, scope, purpose, grant, and freshness checks allow that field.
10. `care_network_visible`, `contact_shareable`, and `action_authorization_visible` must not be combined with `staff_only`, `restricted_sensitive`, `commerce_safe`, or `facility_shareable` on the same returned field.
11. `contact_shareable` does not imply action authority, and `action_authorization_visible` does not imply access to contact channels.

## Scope Registry

Initial commerce-safe scopes:

- `pet.profile.read`
- `pet.diet.read`
- `pet.commerce_context.read`
- `pet.permission_grants.read`
- `pet.product_exclusions.read`
- `pet.preferences.read`
- `pet.purchase_history.summary.read`

`pet.permission_grants.read` is used by optional grant lookup adapter operations such as `GET /permission-grants/{grant_id}` and `ccp_permission_grant_get`.

Initial care-facility scopes:

- `pet.facility_booking_context.read`
- `pet.care_instructions.read`
- `pet.feeding_instructions.read`
- `pet.vaccinations.status.read`
- `pet.pickup_authorization.read`
- `pet.emergency_contacts.read`

Initial care-network lookup scopes:

- `pet.care_network.actor_refs.read`
- `pet.care_network.relationships.read`
- `pet.care_network.contact_channels.read`
- `pet.care_network.action_authorizations.read`
- `pet.care_network.revocation_status.read`

Deferred medication scope recognized for omissions and denied-scope reporting:

- `pet.medications.administration.read`

Future profiles may define additional scopes for wellness, vet export, medication administration, facility writeback, and payment authority.

### Purpose Registry

Initial commerce purposes:

- `product_recommendation`
- `product_filtering`

Initial care-facility purposes:

- `boarding_preparation`
- `pickup_verification`

Initial care-network purposes:

- `care_network_lookup`

## Omission Reasons

CCP responses should omit restricted data by default and explain omissions with machine-readable reasons.

Initial omission reason codes:

- `not_requested`
- `scope_missing`
- `purpose_not_allowed`
- `visibility_restricted`
- `grant_expired`
- `grant_revoked`
- `facility_mismatch`
- `service_window_inactive`
- `source_stale`
- `not_available`
- `summary_only`

An omission should include:

- `field`
- `reason`
- `visibility_class`
- `required_scope`
- `detail`

Omissions belong in the response envelope. Nested context objects should not carry their own `omissions` array unless a future profile explicitly defines object-local omissions and non-overlap rules.

## Commerce Context Request Flow

Example flow:

1. Owner grants `pet.commerce_context.read` for `purpose: product_recommendation`.
2. Client requests commerce-safe context for one pet.
3. Server evaluates requester, grant, purpose, scopes, visibility, and freshness.
4. Server returns an `authorization_decision`.
5. Server returns a minimized `CommerceContext`.
6. Returned context fields include visibility and provenance.
7. Restricted or unrelated fields are omitted with machine-readable reasons.

See `examples/permission-grant-commerce-context.json`, `examples/commerce-context-request.json`, `examples/commerce-context-response.json`, and `examples/commerce-context-denied-response.json`.

The illustrative HTTP adapter for this flow is `openapi/commerce-context.openapi.json`.

The illustrative MCP adapter for this flow is `mcp/commerce-context.tools.json`.

Implementation guidance for this flow is `docs/implementers/commerce-context-server.md`.

## Care Facility Context Request Flow

Example flow:

1. Owner grants boarding-preparation scopes to a facility for one pet and service window.
2. Facility requests care-facility context for `purpose: boarding_preparation`.
3. Server evaluates requester, grant, pet, facility, service window, purpose, scopes, visibility, and freshness.
4. Server returns an `authorization_decision`.
5. Server returns a minimized `CareFacilityContext`.
6. Returned context fields include `facility_shareable` visibility and provenance.
7. Restricted or unrelated fields are omitted with machine-readable reasons.

See `examples/permission-grant-care-facility-boarding-preparation.json`, `examples/care-facility-boarding-preparation-request.json`, `examples/care-facility-boarding-preparation-response.json`, `examples/care-facility-facility-mismatch-denied-response.json`, and `examples/care-facility-expired-service-window-denied-response.json`.

The illustrative HTTP adapter for this flow is `openapi/care-facility-context.openapi.json`.

The illustrative MCP adapter for this flow is `mcp/care-facility-context.tools.json`.

Implementation guidance for this flow is `docs/implementers/care-facility-context-server.md`.

## Care Facility Pickup Verification Flow

Example flow:

1. Owner grants `pet.pickup_authorization.read` to a facility for one pet and service window.
2. Facility requests pickup verification for `purpose: pickup_verification`.
3. Server evaluates requester, grant, pet, facility, service window, pickup actor, purpose, scopes, visibility, and freshness.
4. Server returns an `authorization_decision`.
5. Server returns a minimized `PickupVerificationContext` only when pickup verification context may be returned.
6. `ok` responses require `authorization_status: authorized` and `release_allowed: true`.
7. Denied responses return `pickup_verification_context: null`.
8. Restricted, unrelated, or unresolved fields are omitted with machine-readable reasons.

The pickup-verification slice must not return feeding instructions, medication details, billing data, payment authority, household context, identity document copies or numbers, full Care Network data, wellness timelines, diagnosis history, treatment history, staff-only notes, or unrelated contacts.

See `examples/permission-grant-care-facility-pickup-verification.json`, `examples/care-facility-pickup-verification-request.json`, `examples/care-facility-pickup-verification-response.json`, `examples/care-facility-pickup-verification-owner-confirmation-response.json`, `examples/care-facility-pickup-verification-facility-mismatch-denied-response.json`, and `examples/care-facility-pickup-verification-inactive-service-window-denied-response.json`.

The illustrative HTTP adapter for this flow is `openapi/care-facility-pickup-verification.openapi.json`.

The illustrative MCP adapter for this flow is `mcp/care-facility-pickup-verification.tools.json`.

Implementation guidance for this flow is `docs/implementers/care-facility-pickup-verification-server.md`.

## Care Network Lookup Flow

Example flow:

1. Owner grants Care Network lookup scopes to a requester for one pet, purpose, and optional service window.
2. Requester asks for `purpose: care_network_lookup` with one `subject_actor_id`.
3. Server evaluates requester, grant, pet, subject actor, purpose, scopes, visibility classes, contact permission, action authority, revocation, freshness, and provenance.
4. Server returns an `authorization_decision`.
5. Server returns a minimized `CareNetworkContext` only for that subject actor.
6. Denied responses return `care_network_context: null`.
7. Restricted, unrelated, or unresolved fields are omitted with machine-readable reasons.

The Care Network lookup slice must not return full household records, unrelated people, unrelated pets, billing data, payment authority, identity document copies or numbers, medical or wellness history, diagnosis history, treatment history, staff-only notes, sensitive relationship narratives, or free-text dispute details. A relationship may be visible without contact access, and a contact channel may be visible without action authority.

See `examples/permission-grant-care-network-lookup.json`, `examples/care-network-lookup-request.json`, `examples/care-network-lookup-response.json`, `examples/care-network-lookup-contact-withheld-response.json`, and `examples/care-network-lookup-denied-response.json`.

The illustrative HTTP adapter for this flow is `openapi/care-network-lookup.openapi.json`.

The illustrative MCP adapter for this flow is `mcp/care-network-lookup.tools.json`.

Implementation guidance for this flow is `docs/implementers/care-network-lookup-server.md`.

## Conformance Requirements

A CCP Commerce Context Profile implementation should:

- Validate request and response objects against the canonical schema.
- Enforce purpose-bound access.
- Enforce visibility precedence.
- Return only granted scopes.
- Attach provenance to returned facts or summaries.
- Attach visibility metadata to returned facts or summaries.
- Include an authorization decision in each response.
- Omit restricted data by default.
- Provide machine-readable omission reasons.
- Avoid exposing raw medical, wellness, billing, staff-only, or household data to commerce clients unless explicitly allowed by a future profile.

A CCP Care Facility Context Profile implementation should:

- Validate request and response objects against the canonical schema.
- Enforce purpose-bound access.
- Enforce facility and service-window boundaries.
- Enforce visibility precedence.
- Return only granted scopes.
- Attach provenance to returned facts or summaries.
- Attach visibility metadata to returned facts or summaries.
- Include an authorization decision in each response.
- Omit restricted data by default.
- Provide machine-readable omission reasons.
- Avoid exposing medication administration, raw wellness timelines, diagnosis history, billing data, payment authority, identity document copies, or staff-only records unless explicitly allowed by a future profile or scope.

A CCP Care Facility Pickup Verification implementation should:

- Validate request and response objects against the canonical schema.
- Enforce purpose-bound access (`pickup_verification`).
- Enforce facility, service-window, and pickup-actor boundaries.
- Enforce visibility precedence; require `facility_shareable` and reject `staff_only` or `restricted_sensitive` on returned context fields.
- Return only the granted `pet.pickup_authorization.read` scope.
- Attach provenance and visibility metadata to returned facts or summaries.
- Include an authorization decision in each response.
- In `ok` responses, require `authorization_status: authorized` and `release_allowed: true`.
- In `partial` responses, omit `release_allowed` or report it as `false`, and do not claim `authorization_status: authorized`.
- In `denied` responses, return `pickup_verification_context: null` with at least one omission.
- Provide machine-readable omission reasons.
- Avoid exposing feeding instructions, medication administration, billing data, payment authority, household context, identity-document copies or numbers, broader care history, wellness timelines, diagnosis or treatment history, vaccination records (unless separately requested for another purpose), unrelated emergency contacts, unrelated Care Network contacts, staff-only notes, internal facility notes from other providers, raw behavioral incident records, or free-text denial details that reveal restricted source content.

A CCP Care Network Lookup implementation should:

- Validate request and response objects against the canonical schema.
- Enforce purpose-bound access.
- Enforce the one-pet and one-subject-actor boundary.
- Enforce visibility precedence.
- Evaluate actor knowledge, contact access, action authority, expiration, and revocation separately.
- Return only granted scopes.
- Attach provenance and visibility metadata to returned facts or summaries.
- Include an authorization decision in each response.
- Omit restricted data by default.
- Provide machine-readable omission reasons.
- Avoid exposing full household records, unrelated contacts, billing data, payment authority, identity documents, medical or wellness history, diagnosis history, treatment history, staff-only records, or sensitive relationship narratives.
