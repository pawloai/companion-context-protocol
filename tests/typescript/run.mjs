import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("../..", import.meta.url));

const readJson = (relativePath) =>
  JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), "utf8"));

execFileSync("npm", ["run", "build", "--workspace", "@companion-context-protocol/typescript"], {
  cwd: repoRoot,
  stdio: "inherit"
});

const {
  CCP_VERSION,
  createCcpValidators
} = await import(
  path.join(repoRoot, "packages/typescript/dist/index.js")
);

const validators = createCcpValidators();
const checks = [
  {
    name: "TypeScript package version export",
    valid: CCP_VERSION === "0.1.0-draft"
  },
  {
    name: "request validator accepts example",
    valid: validators.commerceContextRequest(
      readJson("examples/commerce-context-request.json")
    )
  },
  {
    name: "response validator accepts partial example",
    valid: validators.commerceContextResponse(
      readJson("examples/commerce-context-response.json")
    )
  },
  {
    name: "response validator accepts denied example",
    valid: validators.commerceContextResponse(
      readJson("examples/commerce-context-denied-response.json")
    )
  },
  {
    name: "permission grant validator accepts example",
    valid: validators.permissionGrant(
      readJson("examples/permission-grant-commerce-context.json")
    )
  },
  {
    name: "response validator accepts purchase history fixture",
    valid: validators.commerceContextResponse(
      readJson("tests/conformance/fixtures/valid/commerce-context-ok-purchase-history-response.json")
    )
  }
];

const invalidFixtures = [
  {
    name: "request validator rejects duplicate scopes",
    validator: validators.commerceContextRequest,
    data: "tests/conformance/fixtures/invalid/duplicate-request-scopes.json"
  },
  {
    name: "permission grant validator rejects active grant with revoked timestamp",
    validator: validators.permissionGrant,
    data: "tests/conformance/fixtures/invalid/active-grant-with-revoked-at.json"
  },
  {
    name: "permission grant validator rejects revoked grant missing revoked timestamp",
    validator: validators.permissionGrant,
    data: "tests/conformance/fixtures/invalid/grant-revoked-missing-revoked-at.json"
  },
  {
    name: "permission grant validator rejects expired grant missing expiration timestamp",
    validator: validators.permissionGrant,
    data: "tests/conformance/fixtures/invalid/grant-expired-missing-expires-at.json"
  },
  {
    name: "response validator rejects inconsistent response status",
    validator: validators.commerceContextResponse,
    data: "tests/conformance/fixtures/invalid/response-status-mismatch.json"
  },
  {
    name: "response validator rejects non-commerce-safe field",
    validator: validators.commerceContextResponse,
    data: "tests/conformance/fixtures/invalid/commerce-field-missing-commerce-safe.json"
  },
  {
    name: "response validator rejects conflicting commerce field visibility",
    validator: validators.commerceContextResponse,
    data: "tests/conformance/fixtures/invalid/commerce-field-conflicting-visibility.json"
  },
  {
    name: "response validator rejects generated provenance without derived records",
    validator: validators.commerceContextResponse,
    data: "tests/conformance/fixtures/invalid/generated-provenance-missing-derived-from.json"
  },
  {
    name: "response validator rejects denied response with context",
    validator: validators.commerceContextResponse,
    data: "tests/conformance/fixtures/invalid/denied-response-with-context.json"
  }
];

for (const fixture of invalidFixtures) {
  checks.push({
    name: fixture.name,
    valid: !fixture.validator(readJson(fixture.data))
  });
}

const schemaNames = [
  "ccp-core.schema.json",
  "commerce-context-request.schema.json",
  "commerce-context-response.schema.json",
  "permission-grant.schema.json"
];

for (const schemaName of schemaNames) {
  checks.push({
    name: `TypeScript build copied canonical schema ${schemaName}`,
    valid:
      fs.readFileSync(path.join(repoRoot, "schemas", schemaName), "utf8") ===
      fs.readFileSync(
        path.join(repoRoot, "packages/typescript/dist/schemas", schemaName),
        "utf8"
      )
  });
}

let failed = false;

for (const check of checks) {
  if (check.valid) {
    console.log(`ok - ${check.name}`);
    continue;
  }

  failed = true;
  console.error(`not ok - ${check.name}`);
}

if (failed) {
  process.exit(1);
}
