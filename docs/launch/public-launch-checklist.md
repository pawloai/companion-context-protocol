# Public Launch Checklist

Status: Draft

This checklist defines what should be true before broad public promotion of CCP. It is intentionally separate from design-partner review; the repository can be shared privately before every public-launch item is complete.

## Current Gate

Current recommendation: public feedback preview.

The repository can be made public to gather feedback now, but broad positioning as a standard should wait until:

- Prior-art and ecosystem gaps have been acknowledged in public docs.
- 2-3 design partners have reviewed the Commerce Context Profile.
- 2-3 design partners have reviewed the first Care Facility boarding-preparation slice.
- 2-3 design partners have reviewed whether Facility Truth should be the first agent-accuracy profile.
- At least one partner has confirmed that the request and response shape is implementable.
- Open questions from partner review are triaged into accepted changes, deferred work, or explicit non-goals.
- The announcement copy is reviewed for vendor-neutral positioning.

## Repository Readiness

- [x] Draft status is clear in `README.md` and `SPEC.md`.
- [x] README distinguishes draft-test compatibility from adopted-standard status.
- [x] JSON Schema is the canonical contract.
- [x] OpenAPI and MCP are documented as adapters, not the protocol itself.
- [x] Positive examples are vendor-neutral.
- [x] Negative conformance fixtures cover critical fail-closed behavior.
- [x] `npm install && npm test` passes from the repository root.
- [x] Security reporting guidance exists.
- [x] Code of conduct exists.
- [x] Governance model exists.
- [x] Apache-2.0 license exists.
- [x] Draft TypeScript helper package exists.
- [x] Draft Python schema helper package exists.
- [x] Public issue templates exist.
- [x] Public pull request template exists.
- [x] Public changelog or release notes file exists.
- [x] First tagged draft release exists.

## Spec Readiness

- [x] Commerce Context Profile has a narrow first use case.
- [x] Care Facility Context has a narrow first boarding-preparation slice.
- [x] Scope registry is documented.
- [x] Purpose registry is documented.
- [x] Visibility precedence is documented.
- [x] Provenance requirements are documented.
- [x] Authorization decision consistency is enforced by schema.
- [x] Response status consistency is enforced by schema.
- [x] Permission grant lifecycle constraints are enforced by schema.
- [ ] Design partners have reviewed the Commerce Context Profile.
- [ ] Design partners have reviewed the first Care Facility boarding-preparation slice.
- [ ] Feedback has been triaged into v0.1.0-draft updates or later milestones.
- [x] Known compatibility risks are documented.
- [x] Prior-art and ecosystem gaps are documented.
- [ ] Facility Truth has completed discovery review or is explicitly deferred.

## Example And Data Safety

- [x] Examples use synthetic pet, owner, actor, and grant identifiers.
- [x] Examples avoid real customer, facility, staff, billing, or medical data.
- [x] Normative examples avoid vendor-specific system names.
- [x] Denied and partial examples show machine-readable omissions.
- [x] Final pre-launch scan for proprietary names, secrets, and real data is complete.

Suggested scan:

```sh
npm run test:vendor-neutrality
rg -n "customer|billing|diagnosis|secret|token|api[_-]?key" .
```

## Validation Gate

Run before any public announcement:

```sh
npm install
npm test
npm audit --audit-level=moderate
git diff --check
```

Expected result:

- Tests pass.
- Audit reports no moderate or higher vulnerabilities.
- Diff check reports no whitespace errors.
- Working tree is clean after the release commit.

## Launch Assets

- [x] One-paragraph positioning statement.
- [x] Short announcement post.
- [x] Design-partner call for feedback.
- [x] Care Facility design-partner review packet and triage log.
- [x] Prior-art and ecosystem map.
- [x] Facility Truth design draft.
- [x] Maintainer contact path.
- [x] Initial issue labels.
- [x] First 3-5 target partner categories.

Recommended positioning:

> CCP is a draft open specification for permissioned companion-animal context exchange. It lets pet care, commerce, and agent systems request only the pet context needed for a task, with consent, provenance, visibility classes, and machine-readable omissions.

## Do Not Claim Yet

Avoid these claims until adoption and conformance are real:

- Industry standard.
- Consensus standard.
- Design-partner reviewed.
- Ecosystem endorsed.
- Production stable.
- Certified compatible.
- Broad pet health record interoperability.
- Medical or diagnostic suitability.
- Full consent management framework.

## Launch Decision

Launch when the checklist is materially complete and maintainers can answer:

- What exact profile or slice is ready for review?
- What is intentionally out of scope?
- How does an implementer validate compatibility?
- How should external feedback be proposed?
- What will change before a stable release?
