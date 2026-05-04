# CCP Open-Source Adoption Roadmap

Date: 2026-05-04

Working name: Companion Context Protocol

Acronym: CCP

Status note: This roadmap has partially been implemented. The repository now includes the draft spec, canonical schemas, vendor-neutral Commerce Context examples, conformance runner, positive and negative fixtures, public-facing README/security/conduct/governance docs, an OpenAPI Commerce Context adapter, draft MCP Commerce Context tool sketches, a Commerce Context server implementer guide, a draft TypeScript helper package with exported types and AJV validators, a draft Python helper package with schema-loading helpers, launch materials, and the first `v0.1.0-draft` tag. Generated model work and design-partner feedback remain future work.

## Goal

Open-source CCP and build enough industry trust for it to become an adopted standard for permissioned companion-animal context exchange.

The practical path is to ship a narrow, useful, vendor-neutral specification with a working reference implementation before positioning CCP as a broad standard.

## Core Strategy

Do not start by pitching "a standard." Start by proving one valuable workflow.

CCP should be framed as:

> An open protocol for permissioned companion-animal context exchange.

An early implementation should be framed as:

> The first real implementation of CCP.

Avoid making CCP look like a single-vendor export format. The public project should use vendor-neutral naming, examples, governance, and compatibility language.

## Recommended v0.1 Wedge

Start with the Commerce Context Profile.

This profile should support permissioned, commerce-safe pet context for product recommendations and product filtering.

The initial context should include only the minimum useful fields, such as:

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
- Relevant purchase history if explicitly permitted.

The initial profile should exclude:

- Internal staff notes.
- Full wellness timelines.
- Diagnosis or treatment history.
- Billing data.
- Unrelated owner or household data.
- Sensitive facility operations data.

This is the best first wedge because it is commercially useful, easier to explain to partners, and less risky than starting with full medical, wellness, booking, or payment authority.

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

The first release should include one excellent end-to-end example rather than many partial abstractions.

Example flow:

1. Owner grants `pet.commerce_context.read`.
2. Client requests context for `purpose: product_recommendation`.
3. Server evaluates actor, grant, purpose, visibility class, and scope.
4. Server returns a minimized `CommerceContext`.
5. Returned fields include provenance and visibility metadata.
6. Restricted fields are omitted with machine-readable omission reasons.
7. Conformance tests validate the response shape and privacy behavior.

The example should demonstrate that commerce systems can get useful recommendation context without receiving raw medical records, staff-only notes, or unrelated owner data.

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
- Facility booking context.
- Pickup authorization.
- Payment authority.
- Medication administration.
- Multi-facility consent.
- Emergency access.

## Design Partners

Before broad announcement, recruit 3-5 design partners and ask them to review one narrow flow.

Target partner types:

- Daycare or boarding operator.
- Pet retailer or ecommerce vendor.
- Vet-adjacent software contact.
- AI agent or tooling developer.
- Shelter or rescue operator later, after the first profile is stable.

The partner question should be concrete:

> Would you implement this Commerce Context Profile if it existed?

Avoid asking partners to react to the whole long-term protocol vision at first.

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
- Negative conformance fixtures.
- Conformance runner wired into `npm test`.
- OpenAPI Commerce Context adapter.
- MCP Commerce Context tool sketches.
- Commerce Context server implementer guide.
- Draft TypeScript helper package with exported types and AJV validators.
- Draft Python helper package with schema-loading helpers.
- Public-facing README, governance, security, and code of conduct.
- Public launch checklist, announcement copy, design-partner outreach notes, issue templates, and pull request template.
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

The repo can be shared privately with design partners now. Broad public launch should wait until the public launch checklist is materially complete and 2-3 design partners have reviewed the Commerce Context Profile.

## Near-Term Execution Plan

Current status:

- Done: draft `CommerceContext`, `PetProfile`, `DietProfile`, `PermissionGrant`, and `ContextProvenance` schema coverage.
- Done: Commerce Context Profile examples for grant, request, partial response, and denied response.
- Done: omission reasons, visibility precedence, commerce-safe scopes, and provenance requirements.
- Done: conformance runner with positive examples, request/response consistency checks, purchase-history coverage, and negative fixtures.
- Done: OpenAPI sketch for the Commerce Context flow, including external example validation and grant lookup scope metadata.
- Done: MCP tool sketch for requesting commerce context, including strict schema ref validation and grant lookup scope metadata.
- Done: implementer guide for a Commerce Context server.
- Done: draft TypeScript package with exported types and AJV validators.
- Done: draft Python package with schema-loading helpers and generated-model guidance.
- Done: public launch checklist and design-partner outreach notes.
- Done: public issue and pull request templates.
- Done: draft `v0.1.0-draft` changelog entry.
- Done: maintainer contact path, launch announcement copy, and initial issue labels.
- Done: first tagged `v0.1.0-draft` feedback preview.
- Next: identify 3-5 design partners for review.
- Next: complete remaining public launch checklist items after partner review.
- Next: generated Python model plan or Pydantic model generation spike, if partner feedback shows demand for runtime models.
