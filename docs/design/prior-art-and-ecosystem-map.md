# Prior Art And Ecosystem Map

Status: Design note, non-normative

This document records adjacent standards, data holders, and implementation ecosystems CCP must understand before it can credibly move from draft proposal to adopted protocol.

Names in this document are review targets or prior-art references, not endorsements, dependencies, or compatibility claims. Normative schemas, examples, and conformance fixtures should remain vendor-neutral and synthetic.

## Why This Exists

Protocol credibility depends on more than a coherent schema. A draft becomes serious only when it shows that it understands existing systems, preserves their real constraints, and has been reviewed by independent implementers.

CCP should not imply that current pet-care, veterinary, facility, commerce, insurance, registry, or agent builders do not know what they are doing. The problem statement should be that useful companion-animal context is fragmented across systems and there is not yet a lightweight, vendor-neutral way to expose minimized, permissioned slices to agents and partner applications.

## Maturity Reality

Current state:

- Draft protocol proposal.
- Canonical JSON Schemas.
- Synthetic examples.
- Local conformance tests.
- OpenAPI and MCP adapter sketches.
- Draft TypeScript and Python helpers.

Not yet true:

- Adopted standard.
- Implementer consensus.
- Certification program.
- Independent conformance registry.
- Veterinary-body endorsement.
- Facility-software endorsement.
- Practice-management vendor endorsement.
- Insurance, registry, or DNA-platform endorsement.

## Standards And Technical Prior Art

CCP should explicitly compare or position itself against:

- JSON Schema for canonical object validation.
- OpenAPI for HTTP adapter description.
- MCP as one agent/tool adapter surface.
- OAuth 2.0 and OpenID Connect for authorization and identity patterns that CCP should not replace.
- HL7 FHIR for mature healthcare resource/profile patterns, especially the distinction between core resources, profiles, extensions, and implementation guides.
- RDF and RDF Schema for vocabulary and graph-model prior art where future semantic mapping is considered.
- SNOMED CT Veterinary Extension or comparable veterinary terminology systems for future clinical or diagnostic vocabularies.
- RxNorm or comparable medication vocabularies if CCP later defines medication-administration or veterinary export profiles.

CCP should avoid copying medical interoperability patterns into low-risk operational profiles without understanding the additional safety, privacy, liability, and terminology obligations.

## Ecosystem Holders To Review

The following categories hold or mediate companion-animal context that CCP may eventually need to interoperate with:

- Veterinary practice-management systems.
- Boarding, daycare, grooming, training, and pet-sitting software.
- Pet retail and ecommerce systems.
- Pet insurance and claims systems.
- Breed registries and pedigree databases.
- DNA and breed-identification platforms.
- Shelters, rescues, and adoption-management systems.
- Facility booking, CRM, messaging, and waiver systems.
- Agent platforms and assistant clients.
- Owner-facing pet profile and wellness applications.

Reviewer-raised examples to verify and account for include:

- Veterinary and practice-management systems: IDEXX, Cornerstone, Covetrus, ezyVet, and adjacent practice-management interoperability work.
- Facility-management systems: Gingr, PetExec, Time To Pet, and comparable boarding, daycare, grooming, training, and sitter tools.
- Insurance and claims systems: Trupanion and comparable pet-insurance claim workflows.
- Registry and DNA systems: breed registries, Wisdom Panel, Embark, and comparable walled-garden data sources.
- Pet-friendly hospitality standards: Roch Dog Friendly Standard (RDFS-02) and comparable certification or assessment frameworks.
- Terminology and semantic-model references: SNOMED CT Veterinary Extension, RxNorm or comparable medication vocabularies, RDF, RDF Schema, and related vocabulary-mapping work.

Each named item should be researched through canonical public sources before CCP claims compatibility, influence, or non-overlap. These names should not appear in normative examples or schema identifiers unless a future compatibility test explicitly requires them.

## Review Questions

For each ecosystem category, ask:

- What companion-animal facts does this system usually hold?
- Which facts are owner-entered, staff-observed, imported, verified, generated, or inferred?
- Which facts are operationally useful but unsafe to expose broadly?
- What existing consent or service-window model already exists?
- What identifiers can be mapped without leaking private system internals?
- Which facts need freshness, provenance, or verification metadata?
- Which omissions must be machine-readable for the receiver to behave safely?
- What would make this draft impossible to implement?

## Positioning Requirements

Until partner review is complete, CCP public materials should say:

- "Draft protocol proposal."
- "Ready to ask design partners for review."
- "Canonical schemas and conformance tests are available."
- "Not yet an adopted standard."
- "No endorsement is implied by named prior-art or ecosystem references."

CCP public materials should avoid:

- "Industry standard."
- "Consensus protocol."
- "Certified compatible."
- "Production stable."
- "Design-partner reviewed" before review has happened.
- Claims that existing ecosystem builders are careless, confused, or waiting for CCP to fix them.

## Adoption Gates

Before CCP is positioned as more than a draft proposal, at least these gates should be met:

- 3-5 design-partner reviews across different ecosystem categories.
- At least one independent implementation attempt for a schema-backed profile.
- Public triage of partner feedback into accepted changes, deferred work, and non-goals.
- Clear comparison to adjacent standards and data holders.
- A conformance story that distinguishes draft-test compatibility from ecosystem adoption.
- A stable-governance path for future profile changes.
