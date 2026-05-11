# CCP Open-Source Adoption Roadmap

Date: 2026-05-04

Working name: Companion Context Protocol

Acronym: CCP

Status note: This roadmap has partially been implemented. The repository now includes the draft spec, canonical schemas, schema-backed Care Facility boarding-preparation and pickup-verification slices, a schema-backed first Care Network lookup slice, a v1 schema-backed Facility Truth Profile (public-fact scopes, no `PermissionGrant` required), a Commerce Context Profile with vendor-neutral examples, positive and negative conformance fixtures, public-facing README/security/conduct/governance docs, OpenAPI adapter sketches for Care Facility Context, Care Facility Pickup Verification, Care Network Lookup, Facility Truth, and Commerce Context, draft MCP tool sketches for the same surfaces, Care Facility, Facility Truth, and Commerce server implementer guides, a draft TypeScript helper package with exported types and AJV validators, a draft Python helper package with schema-loading helpers, launch materials, Care Facility design-partner review and triage docs, Care Network design material, a prior-art and ecosystem map, the original Facility Truth design draft (now superseded by the v1 schema-backed profile), and the first `v0.1.0-draft` tag. Generated model work, design-partner feedback, partner-only Facility Truth scopes (certifications, insurance statements, capacity status, staff credentials), and broader Care Network management work remain future work.

## Goal

Open-source CCP and build enough industry trust for it to potentially become an adopted standard for permissioned companion-animal context exchange.

The practical path is to ship a narrow, useful, vendor-neutral specification with a working reference implementation before positioning CCP as a broad standard.

Do not treat a polished repository as proof of protocol legitimacy. Legitimacy requires outside review, implementation attempts, visible tradeoff resolution, and adoption by independent systems.

## Core Strategy

Do not start by pitching "a standard." Start by proving one valuable workflow.

CCP should be framed as:

> An open protocol for permissioned companion-animal context exchange.

An early implementation should be framed as:

> The first real implementation of CCP.

Avoid making CCP look like a single-vendor export format or a one-author standard. The public project should use vendor-neutral naming, examples, governance, and compatibility language while also acknowledging adjacent standards, prior art, and ecosystem holders.

## Existing Schema-Backed Wedges

The draft ships five narrow schema-backed slices. They are not equally well-positioned as adoption wedges.

### Care Facility flows — operationally-grounded wedge

The Care Facility boarding-preparation slice, the pickup-verification slice, and the first Care Network lookup slice are the strongest currently-shipping wedge. They sit closest to a clear custodian (the facility's practice-management or facility-management system) and a concrete operational pain point (intake-form re-keying, pickup-desk verification, ambiguous caregiver contact and authority) that an interop standard can directly address. The boarding-preparation slice should support facility booking context, care instructions, feeding instructions, vaccination status, pickup authorization, and emergency contacts; it should exclude medication administration, facility observation writeback, full wellness timelines, diagnosis or treatment history, billing data, payment authority, and identity document copies.

### Commerce Context — parallel slice, not the lead

The Commerce Context Profile supports permissioned, commerce-safe pet context for product recommendations and product filtering — species, breed or breed mix, size, weight band, life stage, diet, allergies, sensitivities, product exclusions, owner or staff-curated preferences, and permitted purchase-history summaries; it excludes internal staff notes, full wellness timelines, diagnosis or treatment history, billing data, unrelated owner or household data, and sensitive facility operations data.

Commerce was selected as a narrow, lower-risk schema slice early in the draft. It remains a valid profile, but it is structurally weak as an adoption wedge:

- Merchants already collect pet profiles via account signup and infer purchase preferences from order history. The consent path runs through the merchant, not a third-party protocol.
- The merchant is typically the system of record. CCP's `PermissionGrant` model assumes a custodian distinct from the requester; that assumption is least true here.
- The pain isn't acute enough to drive adoption. Merchant account profiles plus checkout-time preference capture are deployed at scale and aren't visibly broken in a way that buyers will pay to fix with a new protocol.

Do not describe Commerce as the lead wedge in public materials. Treat it as a parallel narrow slice that design partners may review, with the explicit framing that "no, the merchant account already covers this" is a useful answer.

## Facility Truth — Shipped In v1

Facility Truth has been promoted from design draft to a schema-backed profile in this draft. Its v1 scope, structural fit, and adoption rationale are recorded retroactively here for context. The forward direction now lives under "Next: Partner-Only Facility Truth" below.

The motivating problem — agents giving wrong facility hours, outdated services, unsupported pet types, stale booking links, or invented certifications — is addressed by the v1 public-fact scope set: `facility.profile.read`, `facility.hours.read`, `facility.services.read`, `facility.contact_methods.read`, `facility.service_area.read`, `facility.acceptance_criteria.read`, `facility.booking_methods.read`, `facility.policies.summary.read`. v1 does not require a `PermissionGrant`. Every returned field's provenance MUST carry `verified_at`, and stale or unverified facts are omitted with `source_stale` or `not_verified` rather than guessed.

Facility Truth ships with its own schemas (`schemas/facility-truth-request.schema.json`, `schemas/facility-truth-response.schema.json`), positive and invalid fixtures, OpenAPI adapter (`openapi/facility-truth.openapi.json`), MCP adapter (`mcp/facility-truth.tools.json`), implementer guide (`docs/implementers/facility-truth-server.md`), and conformance coverage including a subject-boundary scan that rejects any `pet_id` anywhere in a Facility Truth response. The design rationale was:

- The data is public-by-nature. Public-fact scopes are served without a `PermissionGrant`, which removes the grant transport, possession, and revocation prerequisites that gate the pet-specific profiles. Partner-only facts will use explicit visibility classes in a future slice.
- The agent-facing pain is present and measurable.
- Facility Truth has a standalone value proposition. A single facility can publish accurate operational facts with provenance unilaterally — no counterparty needs to implement CCP first.
- The visibility model already fits. `facility_public` joins the existing precedence rules; the deny-class rules (`staff_only`, `restricted_sensitive`) are unchanged.

Facility Truth remains separate from Care Facility Context. The former describes a facility; the latter describes one pet's context for a facility workflow.

Recommended next action: gather design-partner review of the v1 profile, then scope partner-only Facility Truth scopes (`facility.certifications.read`, `facility.insurance_statements.read`, `facility.capacity_status.read`, `facility.staff_credentials.summary.read`) for v2. The partner-only slice will introduce `facility_partner_visible`, a partner-only grant shape (likely an additive `subject_facility_id` on `PermissionGrant`), and its own conformance fixtures.

## Transport-Neutral Design

CCP should define the domain contract, not bind itself to one integration mechanism.

The protocol should define:

- Context objects.
- Consent grants.
- Scopes.
- Purpose binding.
- Visibility classes.
- Provenance.
- Safety boundaries.
- Omission and denial semantics.
- Compatibility requirements.

CCP should provide multiple implementation surfaces:

- JSON Schema as the canonical object contract.
- OpenAPI examples for ordinary HTTP systems.
- MCP tools for AI agents and assistant integrations.
- TypeScript types for web and Node implementers.
- Python Pydantic models for backend and data tooling implementers.
- Conformance tests for compatibility.

MCP should be one adapter, not the protocol itself.

## Public Repository Shape

The public repository now uses this structure:

```text
companion-context-protocol/
  README.md
  SPEC.md
  GOVERNANCE.md
  SECURITY.md
  CODE_OF_CONDUCT.md
  LICENSE
  schemas/
  examples/
  mcp/
  openapi/
  packages/
    typescript/
    python/
  tests/
    conformance/
```

## First Public Artifact

The first release should include one excellent end-to-end example rather than many partial abstractions. The canonical worked example should be a Care Facility flow, not a Commerce flow — facility operations are where CCP has the clearest custodian and the most concrete pain point.

Example flow:

1. Owner grants boarding-preparation scopes to a facility for one pet and service window.
2. Facility requests care-facility context for `purpose: boarding_preparation`.
3. Server evaluates actor, grant, pet, facility, service window, purpose, visibility class, and scope.
4. Server returns a minimized `CareFacilityContext`.
5. Returned fields include `facility_shareable` visibility and provenance.
6. Restricted fields are omitted with machine-readable omission reasons.
7. Conformance tests validate the response shape and privacy behavior.

The example should demonstrate that a facility can get usable intake context for a specific stay without receiving medication administration records, raw wellness timelines, diagnosis history, billing data, payment authority, or identity-document copies.

## Minimal v0.1 Scope

Keep v0.1 intentionally small.

Candidate v0.1 objects:

- `PetProfile`
- `DietProfile`
- `CommerceContext`
- `PermissionGrant`
- `ContextProvenance`

Candidate v0.1 policy concepts:

- Visibility classes.
- Purpose-bound access.
- Source/provenance metadata.
- Stale or expiry metadata.
- Machine-readable omission reasons.

For the Commerce Context Profile, provenance should be mandatory audit metadata on returned facts and summaries, not a separately grantable context scope.

Candidate v0.1 scopes:

- `pet.profile.read`
- `pet.diet.read`
- `pet.commerce_context.read`
- `pet.permission_grants.read`
- `pet.product_exclusions.read`
- `pet.preferences.read`
- `pet.purchase_history.summary.read`

Defer broader areas until the base model is proven:

- Wellness timelines.
- Vet exports.
- Facility booking context beyond the first boarding-preparation slice.
- Pickup authorization beyond the pickup-verification slice.
- Care Network and delegated caregiver semantics beyond the pickup-verification and first lookup subsets.
- Payment authority.
- Medication administration.
- Multi-facility consent.
- Emergency access.

## Design Partners

Before broad announcement, recruit 3-5 design partners and ask them to review one narrow flow.

Target partner types, in priority order:

- Daycare, boarding, or grooming operator.
- Facility-management software builder.
- Practice-management software builder.
- Facility-directory, listing-accuracy, or local-business agent tooling builder (also a strong Facility Truth fit).
- Vet-adjacent software contact.
- Insurance, registry, or claims-workflow reviewer.
- Pet retailer or ecommerce vendor (Commerce-specific; not the lead).
- AI agent or tooling developer.
- Shelter or rescue operator later, after the first profile is stable.

For Care Facility design partners, use `docs/launch/care-facility-design-partner-review.md` and ask:

> Would your team implement this boarding-preparation slice for a facility system if it existed?

For Facility Truth v1 partner review, use `docs/implementers/facility-truth-server.md` and ask:

> Does the v1 Facility Truth schema fit your facility's data? Are the eight public-fact scopes (profile, hours, services, contact methods, service area, acceptance criteria, booking links, policy summaries) the right cut for an agent grounding on your facility? Is the `verified_at` freshness contract realistic against your source-of-truth update cadence? Should certifications, insurance statements, capacity status, or staff credentials land in a partner-only Facility Truth slice with a grant shape, or via a different mechanism?

For Commerce-specific reviewers, use `docs/launch/design-partner-outreach.md` and ask:

> Would you implement this Commerce Context Profile if it existed — and what does it offer beyond merchant account signup and order-history inference?

Avoid asking partners to react to the whole long-term protocol vision at first. Avoid pitching Commerce as the lead profile.

## Next Scope Candidates

After Commerce Context, Care Facility boarding preparation, Care Facility pickup verification, and the first Care Network lookup slice, the strongest next design candidates are:

- Broader Care Network management and delegated caregiver semantics beyond the one-subject lookup slice.
- Care Facility Daycare Booking Eligibility slice.
- Veterinary Export profile.
- Pet Sitter or In-Home Care profile.

Pickup Verification has now been schema-backed as a narrow care-facility workflow. Its boundary should remain clear:

- Care Network should define reusable actor, relationship, contact, authorization, revocation, and expiration primitives without becoming a broad household export.
- Pickup Verification consumes only a minimized Care Network subset to answer whether a specific actor may pick up a specific pet for a specific facility and service window.

Pickup Verification does not expose feeding instructions, medication details, billing data, household context, identity document copies or numbers, full Care Network data, wellness timelines, diagnosis history, treatment history, staff-only notes, or unrelated contacts. It is useful because it tests purpose-specific minimization against an operational workflow that facilities already understand.

The first Care Network lookup slice is now schema-backed as a read-only one-subject-actor lookup. Its boundary should remain clear:

- It may return only actor reference, relationship, allowed contact channel, action authorization, and revocation status for the requested subject actor.
- Actor knowledge, contact access, action authority, expiration, and revocation remain separate checks.
- It must not return full household records, unrelated contacts, unrelated pets, billing data, payment authority, identity documents, medical or wellness history, diagnosis history, treatment history, staff-only notes, or sensitive relationship narratives.

The Care Network lookup slice is ready for design-partner review as a read-only lookup workflow. Do not expand it into writes, invitation flows, revocation mutations, broad care-network listings, emergency handoff, or sitter-specific context until partners validate the one-subject lookup boundary.

Daycare Booking Eligibility is also a strong care-facility follow-on, but it should come after or alongside partner feedback on boarding preparation because it may reuse facility booking context, vaccination status, temperament summaries, and missing-record omissions.

Veterinary Export, Pet Sitter, In-Home Care, Medication Administration, Facility Writeback, Payment Authority, and Emergency Access should remain separate follow-on proposals. They need stronger privacy, safety, provenance, and liability treatment than a narrow pickup or booking-eligibility slice.

## Governance

Establish light governance early so the project looks credible and vendor-neutral.

The repository should define:

- Maintainers.
- Decision process.
- Versioning policy.
- Proposal process.
- Compatibility rules.
- Security disclosure process.
- Contribution guidelines.
- Code of conduct.

The governance model can stay lightweight at first, but it should make clear that CCP is not controlled solely by one product implementation.

## Compatibility And Conformance

Standards are easier to adopt when implementers can test compatibility.

Publish conformance tests early, even if they only validate JSON examples at first.

Possible future compatibility badges:

- CCP Commerce Profile compatible.
- CCP Vet Export Profile compatible.
- CCP Care Facility Profile compatible.
- CCP MCP Adapter compatible.

The initial conformance suite should verify:

- Required fields are present.
- Restricted fields are omitted.
- Omission reasons are machine-readable.
- Provenance exists for returned facts.
- Visibility rules are respected.
- Purpose-bound requests do not receive unrelated context.

## Adoption Language

The adoption story should focus on interoperability and trust, not AI hype.

Suggested language:

> CCP lets pet care, commerce, and agent systems exchange only the pet context needed for a task, with consent, provenance, and safety boundaries.

Short positioning:

> Permissioned pet context for trusted interoperability.

## Current Readiness

Current repo status:

- Design-partner review ready.
- Not yet stable-standard ready.
- Not yet broad-announcement ready.

Completed surfaces:

- Draft normative spec.
- Canonical JSON Schemas.
- Positive Commerce Context examples.
- First Care Facility boarding-preparation schema slice and public examples.
- Care Facility pickup-verification schema slice and public examples.
- Care Network lookup schema slice and public examples.
- Care Facility denied response examples for facility mismatch and expired service windows.
- Negative conformance fixtures.
- Care Facility and Care Network fail-closed conformance fixtures for denied responses, provenance gaps, unsafe purpose mixing, identity-document leakage, payment-authority leakage, wellness timeline leakage, diagnosis-history leakage, non-authorized pickup `ok` responses, broad care-network scopes, staff-only visibility, unrelated contacts, and full Care Network leakage.
- Conformance runner wired into `npm test`.
- OpenAPI Commerce, Care Facility Context, Care Facility Pickup Verification, and Care Network Lookup adapters.
- MCP Commerce, Care Facility Context, Care Facility Pickup Verification, and Care Network Lookup tool sketches.
- Commerce Context and Care Facility Context server implementer guides.
- Draft TypeScript helper package with exported types and AJV validators.
- Draft Python helper package with schema-loading helpers.
- Care Network design draft and first lookup schema slice for shared actor, relationship, contact, authorization, revocation, and expiration primitives.
- Care Network lookup review gate with two full-review-suite rounds, including `npm test`, `git diff --check`, `npm audit --audit-level=moderate`, and targeted sensitive-term schema checks.
- Public-facing README, governance, security, and code of conduct.
- Public launch checklist, announcement copy, design-partner outreach notes, Care Facility review packet, Care Facility feedback triage log, issue templates, and pull request template.
- First tagged draft release for feedback preview.

Remaining implementation surfaces:

- Optional generated TypeScript and Python models for package consumers, if design partners need model-first runtime integration.
- Design-partner feedback loop.

Local-only repo guidance:

- `AGENTS.md` and `CLAUDE.md` are treated as local agent instructions and ignored by git.
- Durable contributor-facing guidance belongs in tracked docs such as `README.md`, `GOVERNANCE.md`, `SECURITY.md`, `SPEC.md`, and `docs/`.

## Publicization Readiness

Before broad public announcement, the repo should have:

- One command that passes from a clean checkout: `npm install && npm test`.
- A clear draft status and compatibility boundary.
- A concise implementer path from README to spec, schemas, adapters, and guide.
- At least one practical implementation surface beyond schemas.
- Clear security reporting guidance.
- No real customer, pet, owner, staff, facility, billing, or medical data in examples or docs.
- A design-partner outreach target list.
- A short announcement message focused on interoperability and trust.

See:

- `docs/launch/public-launch-checklist.md`
- `docs/launch/design-partner-outreach.md`

The repo can be shared privately with design partners now. Broad public launch should wait until the public launch checklist is materially complete, 2-3 design partners have reviewed the first Care Facility boarding-preparation slice, and 2-3 design partners have reviewed the v1 schema-backed Facility Truth profile. Commerce Context partner review is welcome but is not a gating condition for broad launch.

## Near-Term Execution Plan

Current status:

- Done: draft `CommerceContext`, `PetProfile`, `DietProfile`, `PermissionGrant`, and `ContextProvenance` schema coverage.
- Done: Commerce Context Profile examples for grant, request, partial response, and denied response.
- Done: omission reasons, visibility precedence, commerce-safe scopes, and provenance requirements.
- Done: conformance runner with positive examples, request/response consistency checks, purchase-history coverage, and negative fixtures.
- Done: OpenAPI sketch for the Commerce Context flow, including external example validation and grant lookup scope metadata.
- Done: MCP tool sketch for requesting commerce context, including strict schema ref validation and grant lookup scope metadata.
- Done: implementer guide for a Commerce Context server.
- Done: first Care Facility boarding-preparation schema slice with request, response, grant, partial response, and denied-response examples.
- Done: Care Facility authorization, facility identity, service-window, scope, purpose, visibility, provenance, and omission boundaries in `SPEC.md`, schemas, examples, adapters, helper packages, and conformance tests.
- Done: Care Facility pickup-verification schema slice with request, response, grant, allowed response, owner-confirmation partial response, denied-response examples, OpenAPI and MCP adapters, helper package validators, and fail-closed conformance fixtures.
- Done: Care Network design draft as shared context for actor, relationship, contact, authorization, revocation, and expiration primitives.
- Done: Care Network lookup schema slice with request, response, grant, allowed response, contact-withheld partial response, denied-response examples, OpenAPI and MCP adapters, helper package validators, and fail-closed conformance fixtures.
- Done: implementer guide for the first Care Facility boarding-preparation slice.
- Done: draft TypeScript package with exported types and AJV validators.
- Done: draft Python package with schema-loading helpers and generated-model guidance.
- Done: public launch checklist and design-partner outreach notes.
- Done: public issue and pull request templates.
- Done: draft `v0.1.0-draft` changelog entry.
- Done: maintainer contact path, launch announcement copy, and initial issue labels.
- Done: first tagged `v0.1.0-draft` feedback preview.
- Done: Care Facility design-partner review packet and feedback triage log.
- Next: identify 3-5 Care Facility design partners for boarding-preparation review.
- Next: identify 2-3 Care Facility design partners for pickup-verification review.
- Next: identify 2-3 Care Network design partners for one-subject lookup review.
- Next: run Facility Truth v1 partner review against `docs/implementers/facility-truth-server.md` and `examples/facility-truth-*.json`, then scope partner-only Facility Truth scopes (`facility.certifications.read`, `facility.insurance_statements.read`, `facility.capacity_status.read`, `facility.staff_credentials.summary.read`) for v2.
- Next: review whether the first Care Network lookup slice should expand into management writes, remain read-only, or stay as shared primitives embedded in purpose-specific profiles.
- Next: identify 2-3 commerce-specific design partners for Commerce Context review, recognizing that "no, merchant signup already covers this" is a useful answer and that Commerce is no longer positioned as the lead.
- Next: complete remaining public launch checklist items after partner review.
- Next: generated Python model plan or Pydantic model generation spike, if partner feedback shows demand for runtime models.
