# Care Facility Draft Examples

Status: Design draft, non-normative

These JSON examples sketch a possible future Care Facility Context Profile. They are not canonical CCP examples yet and are not validated by the current schema or conformance suite.

The current normative draft only defines Commerce Context. These files intentionally use candidate care-facility scopes, purposes, fields, and the candidate `facility_shareable` visibility class so the next schema pass can be reviewed against concrete payloads.

Draft boarding preparation flow:

- `boarding-preparation-permission-grant.json`
- `boarding-preparation-request.json`
- `boarding-preparation-partial-response.json`

Draft invalid fixtures live in `invalid/`. They sketch future conformance cases but are not executed by the current test suite.
