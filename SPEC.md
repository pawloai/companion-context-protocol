# Companion Context Protocol Specification

Status: Draft

Version: 0.1.0-draft

## Purpose

Companion Context Protocol (CCP) defines a vendor-neutral contract for permissioned companion-animal context exchange.

CCP lets authorized systems request only the pet context needed for a task, with consent, provenance, and safety boundaries.

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
- A customer portal.
- A product catalog.
- A recommendation engine.
- A medical diagnosis protocol.
- A replacement for payment, identity, or facility management systems.

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

Actor: A person, organization, system, agent, or service requesting or acting on context.

Pet: The companion animal that context describes.

Owner: An actor with primary consent authority for a pet, subject to future multi-owner rules.

Caregiver: An actor delegated by an owner or facility to perform specific care-related tasks.

Requester: The actor or client asking for context.

Grant: A permission record authorizing a requester to access specific context for a specific pet, purpose, and time window.

Purpose: The task or reason for the request, such as `product_recommendation`.

Visibility class: A safety label that constrains where a context item may be exposed.

Provenance: Metadata describing where a fact came from, when it was recorded, and how trustworthy or fresh it is.

Omission: A machine-readable explanation that context exists or was requested but was not returned.

## Current Profiles

The first profile is the Commerce Context Profile.

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

The draft also includes a first Care Facility Context schema slice for `boarding_preparation`. This slice lets an authorized care facility request boarding-preparation context for one pet, facility, and service window.

The first care-facility slice can include:

- Facility booking context.
- Care instructions.
- Feeding instructions.
- Vaccination status.
- Pickup authorization.
- Emergency contacts.

The first care-facility slice excludes by default:

- Medication administration.
- Facility observation writeback.
- Full wellness timelines.
- Diagnosis or treatment history.
- Billing data and payment authority.
- Identity document copies.

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
6. `commerce_safe` must not be combined with `staff_only` or `restricted_sensitive` on the same returned field.
7. `facility_shareable` may be returned for care-facility purposes only when the requested scope, purpose, grant, facility, and service window also allow it.
8. `facility_shareable` must not be combined with `staff_only` or `restricted_sensitive` on the same returned field.

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

Deferred medication scope recognized for omissions and denied-scope reporting:

- `pet.medications.administration.read`

Future profiles may define additional scopes for wellness, vet export, medication administration, facility writeback, and payment authority.

### Purpose Registry

Initial commerce purposes:

- `product_recommendation`
- `product_filtering`

Initial care-facility purpose:

- `boarding_preparation`

## Omission Reasons

CCP responses should omit restricted data by default and explain omissions with machine-readable reasons.

Initial omission reason codes:

- `not_requested`
- `scope_missing`
- `purpose_not_allowed`
- `visibility_restricted`
- `grant_expired`
- `grant_revoked`
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
