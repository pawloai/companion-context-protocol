import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { schemaFilenames } from "../../scripts/schema-names.mjs";

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
    name: "permission grant validator accepts expired fixture",
    valid: validators.permissionGrant(
      readJson("tests/conformance/fixtures/valid/permission-grant-expired.json")
    )
  },
  {
    name: "permission grant validator accepts revoked fixture",
    valid: validators.permissionGrant(
      readJson("tests/conformance/fixtures/valid/permission-grant-revoked.json")
    )
  },
  {
    name: "response validator accepts purchase history fixture",
    valid: validators.commerceContextResponse(
      readJson("tests/conformance/fixtures/valid/commerce-context-ok-purchase-history-response.json")
    )
  },
  {
    name: "response validator accepts omission coverage fixture",
    valid: validators.commerceContextResponse(
      readJson("tests/conformance/fixtures/valid/commerce-context-omission-coverage-response.json")
    )
  },
  {
    name: "care facility request validator accepts example",
    valid: validators.careFacilityContextRequest(
      readJson("examples/care-facility-boarding-preparation-request.json")
    )
  },
  {
    name: "care facility response validator accepts example",
    valid: validators.careFacilityContextResponse(
      readJson("examples/care-facility-boarding-preparation-response.json")
    )
  },
  {
    name: "pickup verification request validator accepts example",
    valid: validators.careFacilityPickupVerificationRequest(
      readJson("examples/care-facility-pickup-verification-request.json")
    )
  },
  {
    name: "pickup verification response validator accepts example",
    valid: validators.careFacilityPickupVerificationResponse(
      readJson("examples/care-facility-pickup-verification-response.json")
    )
  },
  {
    name: "pickup verification partial response validator accepts example",
    valid: validators.careFacilityPickupVerificationResponse(
      readJson("examples/care-facility-pickup-verification-owner-confirmation-response.json")
    )
  },
  {
    name: "care network lookup request validator accepts example",
    valid: validators.careNetworkLookupRequest(
      readJson("examples/care-network-lookup-request.json")
    )
  },
  {
    name: "care network lookup response validator accepts example",
    valid: validators.careNetworkLookupResponse(
      readJson("examples/care-network-lookup-response.json")
    )
  },
  {
    name: "care network lookup partial response validator accepts example",
    valid: validators.careNetworkLookupResponse(
      readJson("examples/care-network-lookup-contact-withheld-response.json")
    )
  },
  {
    name: "facility truth request validator accepts example",
    valid: validators.facilityTruthRequest(
      readJson("examples/facility-truth-request.json")
    )
  },
  {
    name: "facility truth response validator accepts example",
    valid: validators.facilityTruthResponse(
      readJson("examples/facility-truth-response.json")
    )
  },
  {
    name: "facility truth response validator accepts partial example",
    valid: validators.facilityTruthResponse(
      readJson("examples/facility-truth-partial-response.json")
    )
  },
  {
    name: "facility truth response validator accepts denied example",
    valid: validators.facilityTruthResponse(
      readJson("examples/facility-truth-denied-response.json")
    )
  },
  {
    name: "facility truth request validator accepts all-scopes fixture",
    valid: validators.facilityTruthRequest(
      readJson("tests/conformance/fixtures/valid/facility-truth-all-scopes-request.json")
    )
  },
  {
    name: "facility truth response validator accepts all-scopes fixture",
    valid: validators.facilityTruthResponse(
      readJson("tests/conformance/fixtures/valid/facility-truth-all-scopes-response.json")
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
  },
  {
    name: "care facility response validator rejects identity document leak",
    validator: validators.careFacilityContextResponse,
    data: "tests/conformance/fixtures/invalid/care-facility-pickup-authorization-identity-document-leak.json"
  },
  {
    name: "pickup verification response validator rejects denied response with context",
    validator: validators.careFacilityPickupVerificationResponse,
    data: "tests/conformance/fixtures/invalid/care-facility-pickup-verification-denied-response-with-context.json"
  },
  {
    name: "pickup verification response validator rejects identity document leak",
    validator: validators.careFacilityPickupVerificationResponse,
    data: "tests/conformance/fixtures/invalid/care-facility-pickup-verification-identity-document-leak.json"
  },
  {
    name: "care network lookup request validator rejects broad scope",
    validator: validators.careNetworkLookupRequest,
    data: "tests/conformance/fixtures/invalid/care-network-lookup-broad-scope-request.json"
  },
  {
    name: "care network lookup response validator rejects household keyword in reasons",
    validator: validators.careNetworkLookupResponse,
    data: "tests/conformance/fixtures/invalid/care-network-lookup-household-keyword-in-reasons.json"
  },
  {
    name: "care network lookup response validator rejects sensitive provenance ref",
    validator: validators.careNetworkLookupResponse,
    data: "tests/conformance/fixtures/invalid/care-network-lookup-sensitive-provenance-ref.json"
  },
  {
    name: "facility truth request validator rejects broad scope",
    validator: validators.facilityTruthRequest,
    data: "tests/conformance/fixtures/invalid/facility-truth-broad-scope-request.json"
  },
  {
    name: "facility truth response validator rejects missing facility_public",
    validator: validators.facilityTruthResponse,
    data: "tests/conformance/fixtures/invalid/facility-truth-missing-facility-public.json"
  },
  {
    name: "facility truth response validator rejects missing verified_at",
    validator: validators.facilityTruthResponse,
    data: "tests/conformance/fixtures/invalid/facility-truth-field-missing-verified-at.json"
  },
  {
    name: "facility truth response validator rejects pet_id in authorization_decision",
    validator: validators.facilityTruthResponse,
    data: "tests/conformance/fixtures/invalid/facility-truth-auth-decision-pet-id-leak.json"
  },
  {
    name: "facility truth response validator rejects ok response with empty context",
    validator: validators.facilityTruthResponse,
    data: "tests/conformance/fixtures/invalid/facility-truth-empty-ok-context.json"
  },
  {
    name: "facility truth response validator rejects partial response with empty context",
    validator: validators.facilityTruthResponse,
    data: "tests/conformance/fixtures/invalid/facility-truth-empty-partial-context.json"
  },
  {
    name: "facility truth response validator rejects agent_summary_only visibility",
    validator: validators.facilityTruthResponse,
    data: "tests/conformance/fixtures/invalid/facility-truth-agent-summary-only-visibility.json"
  },
  {
    name: "commerce context response validator rejects auth_decision missing pet_id",
    validator: validators.commerceContextResponse,
    data: "tests/conformance/fixtures/invalid/commerce-context-auth-decision-missing-pet-id.json"
  },
  {
    name: "care facility response validator rejects auth_decision missing pet_id",
    validator: validators.careFacilityContextResponse,
    data: "tests/conformance/fixtures/invalid/care-facility-context-auth-decision-missing-pet-id.json"
  },
  {
    name: "pickup verification response validator rejects auth_decision missing pet_id",
    validator: validators.careFacilityPickupVerificationResponse,
    data: "tests/conformance/fixtures/invalid/care-facility-pickup-verification-auth-decision-missing-pet-id.json"
  },
  {
    name: "care network lookup response validator rejects auth_decision missing pet_id",
    validator: validators.careNetworkLookupResponse,
    data: "tests/conformance/fixtures/invalid/care-network-lookup-auth-decision-missing-pet-id.json"
  }
];

for (const fixture of invalidFixtures) {
  checks.push({
    name: fixture.name,
    valid: !fixture.validator(readJson(fixture.data))
  });
}

const onDiskSchemas = fs
  .readdirSync(path.join(repoRoot, "schemas"))
  .filter((name) => name.endsWith(".schema.json"))
  .sort();
const registeredSchemas = [...schemaFilenames].sort();
checks.push({
  name: "scripts/schema-names.mjs lists every schema present in schemas/",
  valid: JSON.stringify(onDiskSchemas) === JSON.stringify(registeredSchemas)
});

for (const schemaName of schemaFilenames) {
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
