# Design-Partner Outreach Notes

Status: Draft

The goal of design-partner outreach is to test whether the current CCP profiles are useful, understandable, and implementable. Do not pitch CCP as a finished standard, adopted protocol, or ecosystem consensus. Ask for concrete review of one narrow workflow and for missing prior art.

This document is the **Commerce Context outreach packet**. Commerce is a parallel valid profile but is not the lead adoption wedge — for most ecosystem outreach, prefer one of:

- `docs/launch/care-facility-design-partner-review.md` — first Care Facility boarding-preparation review (recommended default starting point for facility, practice-management, and care-operator reviewers).
- `docs/design/2026-05-05-facility-truth-profile.md` — when the reviewer is focused on facility hours, services, policies, booking, listing accuracy, or agent answer grounding. The design proposes that a public-facts subset could be served without a `PermissionGrant`, which is what makes Facility Truth the strongest design candidate ahead of expanding Commerce.

Use this packet only when the reviewer is specifically a commerce or product-recommendation operator and the conversation is bounded to that profile; or when a Care Facility / Facility Truth reviewer has explicitly asked to also see the Commerce slice. The structural reasons Commerce is not the lead — incumbent merchant signup flows already capture pet profiles, the consent path runs through the merchant, and the merchant is typically the system of record so there is no neutral grant custodian — are worth flagging up front in any Commerce conversation.

## Credibility Posture

Open with humility:

- CCP is a draft protocol proposal.
- The repository has schemas, examples, tests, and adapter sketches.
- It has not yet earned standard status.
- Named prior-art or ecosystem references are review targets, not endorsements.
- The ask is to find what is wrong, missing, unsafe, or impossible to implement.

Avoid implying that existing pet-care, veterinary, facility, insurance, registry, or agent builders do not understand their own workflows.

## Target Review Question

Primary question:

> Would you implement this Commerce Context Profile for product recommendation or product filtering if it existed — and if so, what does it offer beyond merchant account signup and order-history inference, which already capture pet profiles today?

Secondary questions:

- Are the request and response objects understandable?
- Are the scope and purpose boundaries clear?
- Is the returned context useful enough for product filtering?
- Are the privacy and safety exclusions credible?
- What field is missing that would block implementation?
- What field feels too sensitive for commerce use?
- Would a Facility Truth Profile (hours, services, eligibility, certifications, booking links, freshness) be a more urgent first review target for your work? Most reviewers should expect the answer to be yes.
- Which prior art, system class, data holder, or workflow does the draft fail to account for?
- Can your team validate compatibility with the provided tests?

## Target Partner Profiles

For Commerce-specific outreach using this packet, target partners whose product is specifically a commerce surface or recommendation engine:

- Pet retailer or ecommerce operator.
- Pet data platform or CRM operator whose primary customer is a retailer.
- AI agent or developer tooling builder targeting commerce/shopping flows.

For broader ecosystem outreach, prefer `docs/launch/care-facility-design-partner-review.md` and recruit instead:

- Daycare, boarding, or grooming operator.
- Facility-management software builder.
- Practice-management software builder.
- Vet-adjacent software contact.
- Insurance, registry, or claims-workflow reviewer.
- Facility-directory, listing-accuracy, or local-business agent tooling builder (also a strong fit for the Facility Truth design draft).

Later, after the Commerce Context Profile is less fluid:

- Shelter or rescue operator.
- Insurance or wellness-plan operator.
- Veterinary records vendor.

## Outreach Message

Short version:

```text
I am working on Companion Context Protocol, a draft protocol proposal for permissioned pet context exchange.

The Commerce Context Profile is one of several narrow schema-backed slices in the draft: commerce-safe pet context for product recommendation and filtering, without exposing staff notes, wellness timelines, diagnosis history, billing data, or unrelated owner data. I want to be straightforward that this isn't the lead adoption wedge for CCP — merchants already capture pet profiles at signup and the consent path runs through the merchant — so a "yes, we'd implement this" answer is genuinely useful signal rather than the expected outcome.

Would you be willing to review the draft Commerce Context Profile and tell me whether your team would implement it, what is missing, what feels unsafe or unclear, and which existing systems or standards the draft fails to account for?

The ask is a focused 30-minute review, not a commitment to adopt.
```

Follow-up link package:

- `README.md`
- `SPEC.md`
- `docs/implementers/commerce-context-server.md`
- `examples/commerce-context-request.json`
- `examples/commerce-context-response.json`
- `openapi/commerce-context.openapi.json`
- `mcp/commerce-context.tools.json`
- `examples/care-facility-boarding-preparation-request.json`
- `examples/care-facility-boarding-preparation-response.json`
- `openapi/care-facility-context.openapi.json`
- `mcp/care-facility-context.tools.json`
- `docs/launch/care-facility-design-partner-review.md`
- `docs/design/prior-art-and-ecosystem-map.md`
- `docs/design/2026-05-05-facility-truth-profile.md`

## Review Session Agenda

Suggested 30-minute structure:

- 5 min: Frame CCP as draft, narrow, transport-neutral, and ready to ask design partners for critique.
- 10 min: Walk through request, grant, partial response, and omissions.
- 5 min: Discuss adapter fit for HTTP, MCP, or package-based integration.
- 10 min: Capture blockers, missing fields, unsafe fields, missing prior art, and adoption conditions.

## Feedback Capture Template

Use one record per partner:

```md
## Partner

- Organization type:
- Reviewer role:
- Review date:
- Integration surface reviewed:

## Fit

- Would implement: yes/no/maybe
- Likely use case:
- Preferred adapter: JSON Schema/OpenAPI/MCP/package
- Better first review target: Commerce Context/Care Facility Context/Facility Truth/other

## Blocking Issues

- Issue:
- Severity:
- Suggested change:

## Missing Prior Art Or Ecosystem Constraints

- System, standard, or workflow:
- Why it matters:
- Suggested research or reviewer:

## Missing Context

- Field or object:
- Why needed:
- Required for v0.1: yes/no

## Safety Concerns

- Concern:
- Data sensitivity:
- Suggested mitigation:

## Follow-Up

- Owner:
- Decision:
- Target milestone:
```

## Triage Rules

Classify feedback into:

- Accept for current draft: needed for the Commerce Context Profile to be useful or safe.
- Defer: useful, but not required for the first profile.
- New profile: belongs outside commerce context.
- Prior-art gap: needs research or ecosystem review before schema changes.
- Non-goal: conflicts with privacy, safety, transport neutrality, or protocol scope.

Avoid expanding the first profile unless multiple partners identify the same blocker.

## Success Criteria

Commerce-specific design-partner review is successful when:

- 2-3 partners can explain the Commerce Context flow back accurately.
- Partners give a clear yes/no on whether they would implement it given the incumbent merchant-signup path. "No, the merchant account already covers this" is a useful answer.
- Major privacy or safety objections have clear mitigations.
- Reviewers identify the highest-priority next profile or workflow — Facility Truth or one of the Care Facility flows is the expected pointer.
- Missing prior art is captured in `docs/design/prior-art-and-ecosystem-map.md` or an issue.
- Partner feedback produces a short, concrete v0.1 change list, or an explicit decision to defer Commerce expansion until a stronger profile lands.
- No partner interprets CCP as a vendor export format.

## After Review

After 3-5 reviews:

- Update `SPEC.md` and schemas for accepted changes.
- Add or update conformance fixtures for accepted behavior changes.
- Record deferred items in the roadmap.
- Draft the first public announcement only after unresolved safety concerns are triaged.
