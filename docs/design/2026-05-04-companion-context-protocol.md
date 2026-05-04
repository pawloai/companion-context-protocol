# Companion Context Protocol Discovery

Date: 2026-05-04

Working name: Companion Context Protocol

Acronym: CCP

Status note: This document is an early discovery note. The current repository now contains a draft `SPEC.md`, canonical JSON Schemas, Commerce Context examples, conformance tests, an OpenAPI adapter, draft MCP tool sketches, a Commerce Context server implementer guide, and a draft TypeScript package. Treat this file as historical design context rather than the normative specification.

## Premise

An implementation can become a trusted context system for pets, owners, facilities, caregivers, and commerce. A commerce client can provide enriched pet product intelligence: supplier catalog, inventory, pricing, product details, compatibility metadata, and product constraints.

The larger opportunity is to define an open protocol for permissioned pet context exchange. CCP would let authorized apps, agents, vets, daycares, retailers, caregivers, and commerce systems request structured pet context with consent, scope, provenance, and safety boundaries.

This is not a product feature spec. It is an initial brainstorm for an open-source protocol that an early implementer could adopt first.

## Positioning

CCP is not a database schema, customer portal, product catalog, or recommendation engine.

CCP should define:

- How pet context is represented.
- How context is requested.
- How owner consent and caregiver permissions are scoped.
- How provenance is attached to each fact or observation.
- Which context is safe for which purpose.
- How apps and agents can request only the data needed for a task.

The protocol should make pet context agent-readable without forcing every app to expose raw internal records.

## Core Thesis

Generic shopping agents and marketplaces can know products. They usually do not know the pet.

CCP's value is a permissioned, structured context layer that lets software reason about:

- Which pet is involved.
- What is known about that pet.
- Who said it and when.
- Which parts are owner-entered, staff-observed, vet-verified, imported, or inferred.
- Which people are authorized to act for the pet.
- Which tasks and payment permissions are allowed.
- Which context is safe for commerce, wellness, veterinary export, or facility operations.

## Example Use Cases

### Daycare caregiver access

An owner invites a caregiver. The caregiver can book care, pick up a pet, add wellness observations, use their own payment method, or use the owner's payment method only when explicitly allowed.

### Grandparent pass purchase

An authorized caregiver buys daycare passes for a pet using their own payment method. The benefit attaches to the pet or owner ledger, while purchaser attribution remains available for receipts, refunds, and audit history.

### Wellness export for vet visit

An owner exports a dated wellness summary for a vet. The export includes symptoms, timestamps, photos, diet, medications, vaccination status, and staff observations that are marked vet-shareable.

### Contextual product recommendation

A commerce agent requests recommendation-safe pet context: breed, size, life stage, diet, allergies, product exclusions, staff-curated preferences, and purchase history. It does not receive internal staff notes or the full wellness timeline unless separately authorized.

### Boarding preparation

Before a boarding reservation, an agent asks for pet-specific care context and returns a checklist or product shortlist based on diet, medication, temperament, and stay duration.

## Candidate Context Objects

These are initial object names, not final schema names.

- `PetProfile`: species, breed, age, sex, weight, life stage, temperament summary.
- `CareNetwork`: owner, authorized caregivers, pickup contacts, emergency contacts, and role/capability metadata.
- `PermissionGrant`: actor, pet, scope, purpose, expiration, payment authority, revocation status.
- `DietProfile`: food brand, protein, feeding schedule, allergies, sensitivities, treats allowed, owner notes.
- `MedicationProfile`: current medications, dosage instructions, administration schedule, source, active dates.
- `VaccinationProfile`: required vaccinations, status, expiry, proof status, verification source.
- `WellnessObservation`: dated symptoms or observations, category, severity, source, photos, action taken, visibility.
- `WellnessSummary`: aggregated, lower-risk summary generated from observations for vet, owner, or commerce use.
- `CommerceContext`: product exclusions, preferences, prior purchases, price sensitivity, pickup/ship preference.
- `PaymentAuthority`: whether an actor may pay with their own method, use an owner-approved method, buy passes, or transact under limits.
- `ContextProvenance`: owner-entered, caregiver-entered, staff-observed, vet-verified, imported, inferred, generated.

## Scope Model

CCP should be purpose-bound. A requester should ask for the least context needed for a task.

Candidate scopes:

- `pet.profile.read`
- `pet.diet.read`
- `pet.medications.read`
- `pet.vaccinations.read`
- `pet.wellness.summary.read`
- `pet.wellness.timeline.read`
- `pet.wellness.observation.write`
- `pet.commerce_context.read`
- `pet.care_network.read`
- `pet.permission_grants.read`
- `pet.payment_authority.read`
- `pet.vet_export.create`
- `pet.booking_context.read`
- `pet.pickup_authorization.read`

Commerce should usually use summary and compatibility scopes, not full medical or wellness history.

## Visibility Classes

Every context item should carry a visibility class.

- Owner-visible.
- Caregiver-visible.
- Staff-only.
- Vet-shareable.
- Commerce-safe.
- Agent-summary-only.
- Restricted/sensitive.

These classes should be additive only when safe. For example, a staff note can be staff-only and excluded from commerce; a diet allergy can be owner-visible, vet-shareable, and commerce-safe.

## Provenance

Context without provenance is weak. CCP should attach provenance to facts and observations so agents can reason about trust.

Examples:

- Owner-entered: useful but may be stale.
- Staff-observed: strong for daycare behavior and incidents.
- Vet-verified: strong for vaccinations, diagnoses, and prescriptions.
- Imported: depends on source quality.
- Inferred: useful but should be labeled clearly.
- Generated: AI-created summary that must link back to source observations.

## Payment And Action Authority

CCP should separate context access from action authority.

Important distinctions:

- A person may view a pet schedule but not book.
- A person may book but not cancel.
- A person may pay with their own method but not the owner's.
- A person may use owner payment only under a scoped grant.
- A person may buy passes/packages for a pet without owning the pet.
- A person may be authorized for pickup without seeing wellness or billing data.

Payment authority should be scoped by actor, pet, task, amount, merchant/facility, time window, and approval requirement.

## Open-Source Surface

Good candidates for open source:

- Protocol specification.
- JSON Schema definitions.
- OpenAPI examples.
- TypeScript types.
- Python Pydantic models.
- Reference MCP server exposing CCP tools.
- Conformance tests.
- Fake data fixtures.
- Example integrations for daycare, vet export, and commerce filtering.

Keep closed:

- Customer data from any implementation.
- Private wholesaler catalog data.
- Supplier pricing, margins, and availability feeds.
- Recommendation algorithms that are a business advantage.
- Facility-specific operational rules unless generalized.

## Reference Implementation Direction

An existing pet care platform can become the first real CCP server if it already has pet, owner, facility, scheduling, vaccination, medication, payment, and staff-observation context.

A commerce MCP client can become a first CCP client/consumer by requesting commerce-safe context and resolving products against enriched inventory.

A later open-source repo could be structured like:

```text
companion-context-protocol/
  spec/
  schemas/
  examples/
  packages/
    typescript/
    python/
  servers/
    mcp-reference/
  tests/
    conformance/
  fixtures/
```

## Design Rules

- Consent first: the owner or authorized actor must control sharing.
- Least privilege: request only the context needed for a task.
- Pet-level scope: permissions are per pet, not just per household.
- Provenance required: facts need source and timestamp.
- Medical caution: CCP should support wellness context, not diagnosis.
- Explainability: generated summaries and recommendations should cite the context they used.
- Revocation: grants must be revocable and auditable.
- Data minimization: commerce agents do not need raw staff notes or full wellness timelines by default.

## Open Questions

- Resolved: CCP is framed as a transport-neutral protocol first.
- Resolved: JSON Schema is the canonical public contract, with OpenAPI and MCP as adapters.
- How should CCP represent stale context and source confidence?
- Should vet-verified records have a stronger trust class than staff-observed records?
- How should owner consent be represented across multiple facilities?
- Can one pet have multiple owners with separate consent rights?
- Should emergency access exist for vets or facilities?
- How should pass/package purchases attach to pet, owner, payer, or facility ledger?
- Should payment authority be part of CCP itself or referenced through another payments protocol?
- What is the minimal viable context profile for commerce-safe recommendations?
- What should be explicitly forbidden from commerce contexts?

## Near-Term Next Steps

Status note: This historical checklist is superseded by `docs/design/2026-05-04-ccp-open-source-adoption-roadmap.md`. Several of these initial steps are now complete in the repository. Current next work is tracked through the roadmap and active commits rather than this discovery checklist.

1. Draft a minimal JSON example for `PetProfile`, `DietProfile`, `PermissionGrant`, and `CommerceContext`.
2. Define the first five scopes needed for commerce product filtering.
3. Define what an early implementation should expose internally as a permissioned pet context profile.
4. Decide whether CCP should live in this repo initially or a separate public repo.
5. Defer tracker CSV and GitHub issues until the initial spec shape is clearer.
