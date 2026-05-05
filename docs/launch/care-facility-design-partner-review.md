# Care Facility Design-Partner Review Packet

Status: Draft

This packet is for focused design-partner review of the first Care Facility Context slice.

The review target is intentionally narrow: `boarding_preparation` context for one pet, one facility, one boarding service, and one service window. The goal is to learn whether the current schema, examples, adapters, and implementer guide are understandable and implementable before expanding the profile.

Do not present this slice as a complete care-facility protocol. Daycare, grooming, training, medication administration, facility observation writeback, emergency override access, payment authority, in-home care, and sitter workflows are still design material or deferred work.

## Review Goal

Primary question:

> Would your team implement this boarding-preparation slice for a facility system if it existed?

Secondary questions:

- Is the grant/request/response flow understandable?
- Are `facility_id`, `service_id`, `service_type`, and `service_window` enough to bind access to one stay?
- Is `facility_shareable` clear as the allow-oriented visibility class?
- Are the included objects useful for boarding preparation?
- Are the omitted objects clearly outside the first slice?
- Are the valid denied responses useful for facility mismatch and inactive service windows?
- Can your team validate compatibility with the provided tests?

## Link Package

Send reviewers this packet plus the smallest useful artifact set:

- `README.md`
- `SPEC.md`
- `docs/design/2026-05-05-care-facility-first-schema-slice.md`
- `docs/implementers/care-facility-context-server.md`
- `schemas/care-facility-context-request.schema.json`
- `schemas/care-facility-context-response.schema.json`
- `examples/permission-grant-care-facility-boarding-preparation.json`
- `examples/care-facility-boarding-preparation-request.json`
- `examples/care-facility-boarding-preparation-response.json`
- `examples/care-facility-facility-mismatch-denied-response.json`
- `examples/care-facility-expired-service-window-denied-response.json`
- `openapi/care-facility-context.openapi.json`
- `mcp/care-facility-context.tools.json`
- `tests/conformance/README.md`

Optional background:

- `docs/design/2026-05-05-care-facility-context-profile.md`
- `docs/implementers/compatibility-risks.md`

## Target Partner Profiles

Recruit reviewers who can speak to operational boarding workflows and integration constraints:

- Boarding or daycare operator using facility-management software.
- Grooming or training operator who can compare adjacent service-window workflows.
- Facility-management software builder.
- Pet care CRM, booking, or customer-communication platform.
- AI agent or developer tooling builder that might call the MCP adapter.

For this review, a veterinary records vendor is useful only if they can comment on vaccination-status handoff without expanding the slice into medical-record exchange.

## Review Session Agenda

Suggested 45-minute structure:

- 5 min: Frame CCP as draft, transport-neutral, consented, and purpose-bound.
- 10 min: Walk through the public grant and request.
- 10 min: Walk through the partial response and omissions.
- 5 min: Walk through the two denied responses.
- 5 min: Discuss HTTP, MCP, or package-based integration fit.
- 10 min: Capture blockers, missing fields, unsafe fields, and open-decision feedback.

## Specific Review Tasks

Ask reviewers to inspect the artifacts in this order:

1. Read the flow summary in `docs/design/2026-05-05-care-facility-first-schema-slice.md`.
2. Compare the grant, request, partial response, and denied response examples.
3. Confirm whether the returned context is enough to prepare a boarding stay.
4. Confirm whether the omitted context should remain out of the first slice.
5. Review `docs/implementers/care-facility-context-server.md` for implementation clarity.
6. Pick an integration surface: canonical JSON Schema, OpenAPI, MCP, TypeScript helper, or Python helper.
7. Run `npm test` or explain what would prevent running it.

## Open Decisions For Feedback

Use these as the explicit review prompts.

### Visibility name

Question: Should `facility_shareable` be the final name for the care-facility allow class?

Listen for:

- Whether "facility" implies organization, location, staff, or software account.
- Whether "shareable" sounds too broad.
- Whether reviewers expect separate classes for boarding, daycare, grooming, or training.

### Grant requirement

Question: Should the first slice require `grant_id`, or should later drafts support booking-derived access without an explicit grant id?

Listen for:

- Whether facility systems can reliably carry a grant id.
- Whether booking systems already have consent records that should map into CCP grants.
- Whether missing grant ids would block implementation.

### Service identity

Question: Should `service_id` remain required for boarding preparation, or should pre-booking flows be able to request context without it?

Listen for:

- Whether facilities need context before a booking exists.
- Whether facility identity plus service window is enough for authorization.
- Whether pre-booking belongs in a separate `facility_booking` purpose.

### Emergency contacts

Question: Should emergency contacts remain in the first slice?

Listen for:

- Whether emergency contacts are operationally required before drop-off.
- Whether reviewers confuse emergency contact handoff with emergency override access.
- Whether contact restrictions and service-window applicability are sufficient.

### Vaccination status values

Question: Should vaccination status values become schema enums in the first stable pass?

Listen for:

- Whether the current candidate values map to facility workflows.
- Whether "waived" and "not_required" need more structure.
- Whether proof status and verification source are enough without raw veterinary records.

## Scope Boundaries To Defend

Do not accept feedback that broadens the first slice without a separate follow-up design decision.

Out of scope for the first slice:

- Medication administration.
- Medication administration writeback.
- Facility observation writeback.
- Incident writeback.
- Payment authority.
- Emergency override access.
- Full wellness timeline.
- Diagnosis history.
- Treatment history.
- Billing records.
- Identity document copies or document numbers.
- Staff-only notes.
- Sitter or in-home care workflows.

If reviewers say one of these is required, capture it as a blocker or next-slice candidate rather than silently adding it to boarding preparation.

## Feedback Capture Template

Use one record per partner:

```md
## Partner

- Organization type:
- Reviewer role:
- Review date:
- Integration surface reviewed:
- Workflow reviewed: boarding preparation

## Fit

- Would implement: yes/no/maybe
- Likely use case:
- Preferred adapter: JSON Schema/OpenAPI/MCP/package
- Can run `npm test`: yes/no

## Blocking Issues

- Issue:
- Severity:
- Suggested change:
- Blocks first slice: yes/no

## Missing Context

- Field or object:
- Why needed:
- Required for boarding preparation: yes/no
- Belongs in later slice: yes/no

## Safety Concerns

- Concern:
- Data sensitivity:
- Suggested mitigation:

## Open Decisions

- `facility_shareable` name:
- `grant_id` requirement:
- `service_id` requirement:
- Emergency contacts:
- Vaccination status values:

## Follow-Up

- Owner:
- Decision:
- Target milestone:
```

## Triage Rules

Classify feedback into:

- Accept for first slice: needed for boarding preparation to be useful or safe.
- Defer to next care-facility slice: useful, but not required for boarding preparation.
- Keep as broader design: relevant to daycare, grooming, training, writeback, sitter, or in-home care.
- New profile: belongs outside Care Facility Context.
- Non-goal: conflicts with privacy, safety, transport neutrality, or protocol scope.

Accept a first-slice expansion only when multiple partners identify the same blocker and the change preserves facility identity, service-window, purpose, scope, visibility, provenance, and omission boundaries.

## Success Criteria

Design-partner review is successful when:

- 2-3 reviewers can explain the boarding-preparation flow back accurately.
- At least one likely implementer says the slice is implementable.
- Reviewers understand that denied responses return no care-facility context.
- Major privacy or safety objections have clear mitigations.
- Feedback produces a short, concrete change list.
- No reviewer interprets the first slice as medical-record exchange, payment authority, emergency override access, or facility writeback.

## After Review

After 3-5 reviews:

- Record synthetic review summaries and decision candidates in `docs/launch/care-facility-feedback-triage.md`.
- Update `SPEC.md` and schemas for accepted first-slice changes.
- Add or update examples and conformance fixtures for accepted behavior changes.
- Record deferred items in the care-facility design notes or roadmap.
- Decide whether the next slice should be daycare eligibility, medication administration, pickup verification, grooming preparation, or facility observation writeback.
