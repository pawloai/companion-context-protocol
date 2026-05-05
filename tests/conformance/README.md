# Conformance Tests

Conformance fixtures and tests live here.

The current test suite verifies:

- Required fields are present.
- Restricted fields are omitted.
- Omission reasons are machine-readable.
- Provenance exists for returned facts.
- Visibility rules are respected.
- Purpose-bound requests do not receive unrelated context.
- Tracked files do not contain vendor-specific protocol or package metadata.
- Commerce context fields include `commerce_safe` visibility and do not include `staff_only` or `restricted_sensitive`.
- Care facility context fields include `facility_shareable` visibility and do not include `staff_only` or `restricted_sensitive`.
- Response `status`, `authorization_decision.decision`, `commerce_context`, and omissions are internally consistent.
- Grant lifecycle fields are internally consistent.
- Example request/response pairs preserve request id, requester, pet, purpose, and grant identity.
- A valid purchase-history summary response is accepted.
- The OpenAPI Commerce Context adapter parses as a valid API description.
- The OpenAPI adapter's external examples resolve to existing files.
- The MCP Commerce Context tool sketches resolve to canonical schema definitions and examples.
- The draft TypeScript package builds, ships schema snapshots, and its validators accept and reject the expected fixtures.
- The draft Python package compiles, ships schema snapshots, and its schema helpers resolve canonical schemas.

Run the conformance suite from the repository root:

```sh
npm install
npm test
```

The runner validates vendor neutrality, validates the public examples, confirms that invalid fixtures are rejected, validates `openapi/commerce-context.openapi.json`, checks `mcp/commerce-context.tools.json`, builds/tests `packages/typescript`, and compiles/tests `packages/python`.

Current invalid fixtures:

- `fixtures/invalid/duplicate-request-scopes.json`
- `fixtures/invalid/active-grant-with-revoked-at.json`
- `fixtures/invalid/grant-revoked-missing-revoked-at.json`
- `fixtures/invalid/grant-expired-missing-expires-at.json`
- `fixtures/invalid/response-status-mismatch.json`
- `fixtures/invalid/commerce-field-missing-commerce-safe.json`
- `fixtures/invalid/commerce-field-conflicting-visibility.json`
- `fixtures/invalid/generated-provenance-missing-derived-from.json`
- `fixtures/invalid/denied-response-with-context.json`
- `fixtures/invalid/care-facility-denied-response-with-context.json`
- `fixtures/invalid/care-facility-field-missing-provenance.json`
- `fixtures/invalid/care-facility-pickup-authorization-identity-document-leak.json`
- `fixtures/invalid/care-facility-boarding-response-with-wellness-timeline.json`
- `fixtures/invalid/care-facility-boarding-response-with-diagnosis-history.json`
- `fixtures/invalid/care-facility-pickup-authorization-payment-authority-leak.json`

Current valid fixtures:

- `fixtures/valid/commerce-context-denied-request.json`
- `fixtures/valid/commerce-context-purchase-history-request.json`
- `fixtures/valid/commerce-context-ok-purchase-history-response.json`

Equivalent manual validation:

```sh
npx --yes --package ajv-cli@5.0.0 --package ajv-formats@2.1.1 ajv validate \
  --spec=draft2020 --strict=false -c ajv-formats \
  -s schemas/permission-grant.schema.json \
  -r schemas/ccp-core.schema.json \
  -d examples/permission-grant-commerce-context.json

npx --yes --package ajv-cli@5.0.0 --package ajv-formats@2.1.1 ajv validate \
  --spec=draft2020 --strict=false -c ajv-formats \
  -s schemas/commerce-context-request.schema.json \
  -r schemas/ccp-core.schema.json \
  -d examples/commerce-context-request.json

npx --yes --package ajv-cli@5.0.0 --package ajv-formats@2.1.1 ajv validate \
  --spec=draft2020 --strict=false -c ajv-formats \
  -s schemas/commerce-context-response.schema.json \
  -r schemas/ccp-core.schema.json \
  -d examples/commerce-context-response.json

npx --yes --package ajv-cli@5.0.0 --package ajv-formats@2.1.1 ajv validate \
  --spec=draft2020 --strict=false -c ajv-formats \
  -s schemas/commerce-context-response.schema.json \
  -r schemas/ccp-core.schema.json \
  -d examples/commerce-context-denied-response.json

npx --yes --package ajv-cli@5.0.0 --package ajv-formats@2.1.1 ajv validate \
  --spec=draft2020 --strict=false -c ajv-formats \
  -s schemas/care-facility-context-response.schema.json \
  -r schemas/ccp-core.schema.json \
  -d examples/care-facility-boarding-preparation-response.json
```
