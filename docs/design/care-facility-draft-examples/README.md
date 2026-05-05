# Care Facility Schema-Backed Draft Examples

Status: Schema-backed design draft

These JSON examples sketch the first Care Facility Context Profile schema slice. They are validated by the current schema and conformance suite, but they remain in `docs/design/` until the profile is ready to be promoted into public canonical examples under `examples/`.

These files use care-facility scopes, `purpose: boarding_preparation`, and the `facility_shareable` visibility class so the schema slice can be reviewed against concrete payloads.

Draft boarding preparation flow:

- `boarding-preparation-permission-grant.json`
- `boarding-preparation-request.json`
- `boarding-preparation-partial-response.json`

Draft invalid fixtures live in `invalid/`. They are executed by the current conformance suite where they represent schema-level invalid responses. Facility-mismatch and expired-service-window denied responses are valid denied response examples because they preserve the `denied` envelope rules.
