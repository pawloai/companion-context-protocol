# Design-Partner Outreach Notes

Status: Draft

The goal of design-partner outreach is to test whether the Commerce Context Profile is useful, understandable, and implementable. Do not pitch CCP as a finished standard. Ask for concrete review of one narrow workflow.

## Target Review Question

Primary question:

> Would you implement this Commerce Context Profile for product recommendation or product filtering if it existed?

Secondary questions:

- Are the request and response objects understandable?
- Are the scope and purpose boundaries clear?
- Is the returned context useful enough for product filtering?
- Are the privacy and safety exclusions credible?
- What field is missing that would block implementation?
- What field feels too sensitive for commerce use?
- Can your team validate compatibility with the provided tests?

## Target Partner Profiles

Recruit 3-5 design partners across different implementation perspectives:

- Pet retailer or ecommerce operator.
- Daycare, boarding, or grooming operator.
- Vet-adjacent software contact.
- AI agent or developer tooling builder.
- Pet data platform or CRM operator.

Later, after the Commerce Context Profile is less fluid:

- Shelter or rescue operator.
- Insurance or wellness-plan operator.
- Veterinary records vendor.

## Outreach Message

Short version:

```text
I am working on Companion Context Protocol, a draft open specification for permissioned pet context exchange.

The first profile is intentionally narrow: commerce-safe pet context for product recommendation and filtering, without exposing staff notes, wellness timelines, diagnosis history, billing data, or unrelated owner data.

Would you be willing to review the draft Commerce Context Profile and tell me whether your team would implement it, what is missing, and what feels unsafe or unclear?

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

## Review Session Agenda

Suggested 30-minute structure:

- 5 min: Frame CCP as draft, narrow, transport-neutral, and design-partner-review ready.
- 10 min: Walk through request, grant, partial response, and omissions.
- 5 min: Discuss adapter fit for HTTP, MCP, or package-based integration.
- 10 min: Capture blockers, missing fields, unsafe fields, and adoption conditions.

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

## Blocking Issues

- Issue:
- Severity:
- Suggested change:

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
- Non-goal: conflicts with privacy, safety, transport neutrality, or protocol scope.

Avoid expanding the first profile unless multiple partners identify the same blocker.

## Success Criteria

Design-partner review is successful when:

- 2-3 partners can explain the Commerce Context flow back accurately.
- At least one likely implementer says the profile is implementable.
- Major privacy or safety objections have clear mitigations.
- Partner feedback produces a short, concrete v0.1 change list.
- No partner interprets CCP as a vendor export format.

## After Review

After 3-5 reviews:

- Update `SPEC.md` and schemas for accepted changes.
- Add or update conformance fixtures for accepted behavior changes.
- Record deferred items in the roadmap.
- Draft the first public announcement only after unresolved safety concerns are triaged.
