# Announcement Copy

Status: Draft

Use this copy for a public feedback preview. Do not describe CCP as a finished standard, adopted protocol, or design-partner-reviewed artifact.

## One-Paragraph Positioning

Companion Context Protocol is a draft protocol proposal for permissioned companion-animal context exchange. It currently includes canonical JSON Schemas, synthetic examples, conformance tests, and adapter sketches for narrow care-facility, pickup-verification, care-network lookup, and commerce flows. The operationally-grounded review targets are the care-facility flows; commerce is included as a parallel valid profile but is not the lead adoption wedge. The repository is ready to ask design partners for review, but it is not yet an adopted standard or endorsed interoperability baseline.

## Short Announcement

```text
I am opening a draft of Companion Context Protocol for feedback.

CCP is an open, transport-neutral protocol proposal for permissioned companion-animal context exchange. It is not a standard yet. The current draft is a set of schemas, examples, tests, and adapter sketches that need outside review before anyone should treat it as an interoperability baseline.

The operationally-grounded review targets are the Care Facility boarding-preparation slice, the pickup-verification slice, and the first Care Network lookup slice. They sit closest to a clear custodian (the facility's practice-management or facility-management system) and a concrete pain point (intake-form re-keying, pickup-desk verification, ambiguous caregiver authority) that an interop standard can directly address. The draft also includes a Commerce Context Profile for commerce-safe pet context, but merchants already capture pet profiles at signup and the consent path runs through the merchant — so Commerce is a parallel slice, not the lead wedge. A Facility Truth Profile for hours, services, eligibility, certifications, and booking links is the strongest design candidate ahead of expanding Commerce; its public-facts subset does not require a permission grant at all.

The repo includes a draft spec, canonical JSON Schemas, examples, conformance tests, OpenAPI and MCP adapter sketches, and draft TypeScript/Python helper packages.

I am looking for design-partner feedback from care operators, facility software builders, practice-management software builders, facility-directory and local-business agent tooling builders, vet-adjacent software teams, insurers, registries, pet retailers, and pet data platforms:

- Would you implement the first Care Facility boarding-preparation slice?
- Would you implement the pickup-verification slice for facility release workflows?
- Would you implement the first Care Network lookup slice without it becoming a household export?
- Would a Facility Truth Profile solve a more urgent agent-accuracy problem (hours, services, eligibility, certifications, contact and booking methods) than pet-specific context for your product?
- Would you implement the Commerce Context Profile, given that merchants already capture pet profiles at signup?
- Are the scope and purpose boundaries clear?
- What context is missing or too sensitive?
- What prior art or existing ecosystem constraint is missing?
- Can you validate compatibility with the current tests?

This is a draft for review, not a stable standard or endorsed protocol.
```

## Short Link Text

```text
Draft CCP feedback preview: permissioned companion context, before standard claims.
```

## Feedback Request

```text
If you work on pet care operations, facility software, practice-management software, facility-directory or local-business agent tooling, vet-adjacent software, insurance, registries, pet commerce, or pet data infrastructure, I would value focused feedback on this draft. The most useful first review target is one of the Care Facility flows or the Facility Truth design draft.

The most useful feedback is concrete:

- What would block implementation?
- What field is missing?
- What field feels unsafe?
- Which adapter would you use?
- Which existing standards, platforms, or operational workflows does the draft fail to account for?
- Should Facility Truth be promoted from design draft to a schema-backed profile ahead of expanding Commerce?
- Do the conformance tests make compatibility clear?
```

## Claims To Avoid

- Industry standard.
- Consensus protocol.
- Production stable.
- Certification.
- Design-partner reviewed.
- Endorsed by ecosystem holders.
- Medical interoperability.
- Full consent management.
- Broad pet health record exchange.
