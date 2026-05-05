# Care Facility Feedback Triage Log

Status: Draft

Use this log after Care Facility design-partner reviews to convert raw feedback into concrete draft decisions.

Do not record real pet, customer, staff, facility, billing, or medical data in this file. Use synthetic partner identifiers such as `partner_a`, `partner_b`, and `partner_c`.

## Review Batch

Target review scope: first Care Facility boarding-preparation slice.

Current batch status: not started.

Target reviewers:

- `partner_a`: boarding or daycare operator using facility-management software.
- `partner_b`: facility-management software builder.
- `partner_c`: pet care CRM, booking, or customer-communication platform.
- `partner_d`: grooming or training operator comparing adjacent service-window workflows.
- `partner_e`: AI agent or developer tooling builder reviewing the MCP adapter.

## Decision Categories

Use exactly one category for each triaged item:

- `accept_first_slice`: needed for boarding preparation to be useful or safe.
- `defer_next_care_facility_slice`: useful care-facility feedback, but not required for boarding preparation.
- `keep_broader_design`: relevant to daycare, grooming, training, writeback, sitter, or in-home care.
- `new_profile`: belongs outside Care Facility Context.
- `non_goal`: conflicts with privacy, safety, transport neutrality, or protocol scope.

Use one severity for each item:

- `blocker`: likely prevents implementation of the first slice.
- `major`: important, but does not block first-slice review.
- `minor`: clarity, naming, or documentation issue.

## Open Decision Rollup

Update this table after each review.

| Decision | Current leaning | Evidence | Action |
| --- | --- | --- | --- |
| `facility_shareable` final name | Unknown | No reviews captured. | Ask every reviewer whether the name implies the right actor boundary. |
| `grant_id` requirement | Unknown | No reviews captured. | Ask whether facility systems can carry a grant id reliably. |
| `service_id` requirement | Unknown | No reviews captured. | Ask whether boarding preparation happens before a booking id exists. |
| Emergency contacts in first slice | Unknown | No reviews captured. | Ask whether contacts are operationally required before drop-off. |
| Vaccination status enum values | Unknown | No reviews captured. | Ask whether current candidate values match facility workflows. |

## Partner Review Records

Use one entry per review. Keep raw notes short and move decisions into the triage table below.

### `partner_a`

- Organization type:
- Reviewer role:
- Review date:
- Integration surface reviewed:
- Would implement: unknown
- Can run `npm test`: unknown
- Raw notes:

### `partner_b`

- Organization type:
- Reviewer role:
- Review date:
- Integration surface reviewed:
- Would implement: unknown
- Can run `npm test`: unknown
- Raw notes:

### `partner_c`

- Organization type:
- Reviewer role:
- Review date:
- Integration surface reviewed:
- Would implement: unknown
- Can run `npm test`: unknown
- Raw notes:

### `partner_d`

- Organization type:
- Reviewer role:
- Review date:
- Integration surface reviewed:
- Would implement: unknown
- Can run `npm test`: unknown
- Raw notes:

### `partner_e`

- Organization type:
- Reviewer role:
- Review date:
- Integration surface reviewed:
- Would implement: unknown
- Can run `npm test`: unknown
- Raw notes:

## Triage Items

Add one row per decision candidate.

| ID | Source | Category | Severity | Summary | Affected artifacts | Decision | Owner | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `cf-triage-001` | `partner_a` | TBD | TBD | TBD | TBD | TBD | TBD | `pending_review` |

Status values:

- `pending_review`
- `accepted`
- `deferred`
- `rejected`
- `implemented`

## First-Slice Acceptance Gate

Before changing schemas for partner feedback, confirm:

- At least two reviewers reported the same blocker, or one likely implementer found a blocker that is clearly required for boarding preparation.
- The change preserves facility identity, service-window, purpose, scope, visibility, provenance, and omission boundaries.
- The change does not add medication administration, writeback, payment authority, emergency override access, full medical history, identity document copies, staff-only notes, or sitter and in-home care workflows to the first slice.
- The change has a matching schema update, public example update, invalid fixture when relevant, implementer-guide update, and `npm test` coverage.

## Follow-Up Change List

After the review batch, summarize accepted work here.

| Change | Category | Files expected | Test expectation | Status |
| --- | --- | --- | --- | --- |
| TBD | TBD | TBD | TBD | `pending_review` |

## After Triage

When the batch is complete:

1. Open one focused issue or PR per accepted first-slice change.
2. Record deferred items in `docs/design/2026-05-05-care-facility-context-profile.md` or the roadmap.
3. Update `docs/launch/public-launch-checklist.md` if partner review changes the launch gate.
4. Run `npm test` after every accepted schema, example, adapter, or package change.
