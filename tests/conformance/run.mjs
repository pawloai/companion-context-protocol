import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { isDeepStrictEqual } from "node:util";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const repoRoot = fileURLToPath(new URL("../..", import.meta.url));

const readJson = (relativePath) =>
  JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), "utf8"));

const ajv = new Ajv2020({
  allErrors: true,
  strict: false
});

addFormats(ajv);

const coreSchema = readJson("schemas/ccp-core.schema.json");
ajv.addSchema(coreSchema, "ccp-core.schema.json");

const cases = [
  {
    name: "core PetProfile fixture",
    schema: "ccp-core.schema.json#/$defs/PetProfile",
    data: "tests/conformance/fixtures/valid/core-pet-profile.json",
    valid: true
  },
  {
    name: "core DietProfile fixture",
    schema: "ccp-core.schema.json#/$defs/DietProfile",
    data: "tests/conformance/fixtures/valid/core-diet-profile.json",
    valid: true
  },
  {
    name: "core PurchaseHistorySummary fixture",
    schema: "ccp-core.schema.json#/$defs/PurchaseHistorySummary",
    data: "tests/conformance/fixtures/valid/core-purchase-history-summary.json",
    valid: true
  },
  {
    name: "permission grant example",
    schema: "schemas/permission-grant.schema.json",
    data: "examples/permission-grant-commerce-context.json",
    valid: true
  },
  {
    name: "commerce context request example",
    schema: "schemas/commerce-context-request.schema.json",
    data: "examples/commerce-context-request.json",
    valid: true
  },
  {
    name: "commerce context partial response example",
    schema: "schemas/commerce-context-response.schema.json",
    data: "examples/commerce-context-response.json",
    valid: true
  },
  {
    name: "commerce context denied response example",
    schema: "schemas/commerce-context-response.schema.json",
    data: "examples/commerce-context-denied-response.json",
    valid: true
  },
  {
    name: "commerce context denied request fixture",
    schema: "schemas/commerce-context-request.schema.json",
    data: "tests/conformance/fixtures/valid/commerce-context-denied-request.json",
    valid: true
  },
  {
    name: "commerce context purchase history request fixture",
    schema: "schemas/commerce-context-request.schema.json",
    data: "tests/conformance/fixtures/valid/commerce-context-purchase-history-request.json",
    valid: true
  },
  {
    name: "commerce context ok purchase history fixture",
    schema: "schemas/commerce-context-response.schema.json",
    data: "tests/conformance/fixtures/valid/commerce-context-ok-purchase-history-response.json",
    valid: true
  },
  {
    name: "commerce context omission coverage fixture",
    schema: "schemas/commerce-context-response.schema.json",
    data: "tests/conformance/fixtures/valid/commerce-context-omission-coverage-response.json",
    valid: true
  },
  {
    name: "care facility permission grant example",
    schema: "schemas/permission-grant.schema.json",
    data: "examples/permission-grant-care-facility-boarding-preparation.json",
    valid: true
  },
  {
    name: "care facility pickup verification permission grant example",
    schema: "schemas/permission-grant.schema.json",
    data: "examples/permission-grant-care-facility-pickup-verification.json",
    valid: true
  },
  {
    name: "care network lookup permission grant example",
    schema: "schemas/permission-grant.schema.json",
    data: "examples/permission-grant-care-network-lookup.json",
    valid: true
  },
  {
    name: "care facility context request example",
    schema: "schemas/care-facility-context-request.schema.json",
    data: "examples/care-facility-boarding-preparation-request.json",
    valid: true
  },
  {
    name: "care facility context partial response example",
    schema: "schemas/care-facility-context-response.schema.json",
    data: "examples/care-facility-boarding-preparation-response.json",
    valid: true
  },
  {
    name: "care facility mismatch denied response example",
    schema: "schemas/care-facility-context-response.schema.json",
    data: "examples/care-facility-facility-mismatch-denied-response.json",
    valid: true
  },
  {
    name: "care facility expired service window denied response example",
    schema: "schemas/care-facility-context-response.schema.json",
    data: "examples/care-facility-expired-service-window-denied-response.json",
    valid: true
  },
  {
    name: "expired permission grant fixture",
    schema: "schemas/permission-grant.schema.json",
    data: "tests/conformance/fixtures/valid/permission-grant-expired.json",
    valid: true
  },
  {
    name: "revoked permission grant fixture",
    schema: "schemas/permission-grant.schema.json",
    data: "tests/conformance/fixtures/valid/permission-grant-revoked.json",
    valid: true
  },
  {
    name: "reject duplicate requested scopes",
    schema: "schemas/commerce-context-request.schema.json",
    data: "tests/conformance/fixtures/invalid/duplicate-request-scopes.json",
    valid: false
  },
  {
    name: "reject active grant with revoked timestamp",
    schema: "schemas/permission-grant.schema.json",
    data: "tests/conformance/fixtures/invalid/active-grant-with-revoked-at.json",
    valid: false
  },
  {
    name: "reject revoked grant missing revoked timestamp",
    schema: "schemas/permission-grant.schema.json",
    data: "tests/conformance/fixtures/invalid/grant-revoked-missing-revoked-at.json",
    valid: false
  },
  {
    name: "reject expired grant missing expiration timestamp",
    schema: "schemas/permission-grant.schema.json",
    data: "tests/conformance/fixtures/invalid/grant-expired-missing-expires-at.json",
    valid: false
  },
  {
    name: "reject inconsistent response status",
    schema: "schemas/commerce-context-response.schema.json",
    data: "tests/conformance/fixtures/invalid/response-status-mismatch.json",
    valid: false
  },
  {
    name: "reject non-commerce-safe commerce field",
    schema: "schemas/commerce-context-response.schema.json",
    data: "tests/conformance/fixtures/invalid/commerce-field-missing-commerce-safe.json",
    valid: false
  },
  {
    name: "reject conflicting commerce field visibility",
    schema: "schemas/commerce-context-response.schema.json",
    data: "tests/conformance/fixtures/invalid/commerce-field-conflicting-visibility.json",
    valid: false
  },
  {
    name: "reject generated provenance without derived records",
    schema: "schemas/commerce-context-response.schema.json",
    data: "tests/conformance/fixtures/invalid/generated-provenance-missing-derived-from.json",
    valid: false
  },
  {
    name: "reject denied response with context",
    schema: "schemas/commerce-context-response.schema.json",
    data: "tests/conformance/fixtures/invalid/denied-response-with-context.json",
    valid: false
  },
  {
    name: "reject care facility denied response with context",
    schema: "schemas/care-facility-context-response.schema.json",
    data: "tests/conformance/fixtures/invalid/care-facility-denied-response-with-context.json",
    valid: false
  },
  {
    name: "reject care facility field missing provenance",
    schema: "schemas/care-facility-context-response.schema.json",
    data: "tests/conformance/fixtures/invalid/care-facility-field-missing-provenance.json",
    valid: false
  },
  {
    name: "reject care facility pickup identity document leak",
    schema: "schemas/care-facility-context-response.schema.json",
    data: "tests/conformance/fixtures/invalid/care-facility-pickup-authorization-identity-document-leak.json",
    valid: false
  },
  {
    name: "reject care facility wellness timeline leak",
    schema: "schemas/care-facility-context-response.schema.json",
    data: "tests/conformance/fixtures/invalid/care-facility-boarding-response-with-wellness-timeline.json",
    valid: false
  },
  {
    name: "reject care facility diagnosis history leak",
    schema: "schemas/care-facility-context-response.schema.json",
    data: "tests/conformance/fixtures/invalid/care-facility-boarding-response-with-diagnosis-history.json",
    valid: false
  },
  {
    name: "reject care facility array field sensitive keyword",
    schema: "schemas/care-facility-context-response.schema.json",
    data: "tests/conformance/fixtures/invalid/care-facility-boarding-array-sensitive-keyword.json",
    valid: false
  },
  {
    name: "reject care facility pickup payment authority leak",
    schema: "schemas/care-facility-context-response.schema.json",
    data: "tests/conformance/fixtures/invalid/care-facility-pickup-authorization-payment-authority-leak.json",
    valid: false
  },
  {
    name: "reject care facility response with commerce decision purpose",
    schema: "schemas/care-facility-context-response.schema.json",
    data: "tests/conformance/fixtures/invalid/care-facility-response-with-commerce-decision-purpose.json",
    valid: false
  },
  {
    name: "reject care facility response with commerce context purpose",
    schema: "schemas/care-facility-context-response.schema.json",
    data: "tests/conformance/fixtures/invalid/care-facility-response-with-commerce-context-purpose.json",
    valid: false
  },
  {
    name: "care facility pickup verification request example",
    schema: "schemas/care-facility-pickup-verification-request.schema.json",
    data: "examples/care-facility-pickup-verification-request.json",
    valid: true
  },
  {
    name: "care facility pickup verification allowed response example",
    schema: "schemas/care-facility-pickup-verification-response.schema.json",
    data: "examples/care-facility-pickup-verification-response.json",
    valid: true
  },
  {
    name: "care facility pickup verification owner confirmation response example",
    schema: "schemas/care-facility-pickup-verification-response.schema.json",
    data: "examples/care-facility-pickup-verification-owner-confirmation-response.json",
    valid: true
  },
  {
    name: "care facility pickup verification facility mismatch denied response example",
    schema: "schemas/care-facility-pickup-verification-response.schema.json",
    data: "examples/care-facility-pickup-verification-facility-mismatch-denied-response.json",
    valid: true
  },
  {
    name: "care facility pickup verification inactive service window denied response example",
    schema: "schemas/care-facility-pickup-verification-response.schema.json",
    data: "examples/care-facility-pickup-verification-inactive-service-window-denied-response.json",
    valid: true
  },
  {
    name: "reject care facility pickup verification denied response with context",
    schema: "schemas/care-facility-pickup-verification-response.schema.json",
    data: "tests/conformance/fixtures/invalid/care-facility-pickup-verification-denied-response-with-context.json",
    valid: false
  },
  {
    name: "reject care facility pickup verification ok response with release disallowed",
    schema: "schemas/care-facility-pickup-verification-response.schema.json",
    data: "tests/conformance/fixtures/invalid/care-facility-pickup-verification-ok-release-false.json",
    valid: false
  },
  {
    name: "reject care facility pickup verification ok response requiring owner confirmation",
    schema: "schemas/care-facility-pickup-verification-response.schema.json",
    data: "tests/conformance/fixtures/invalid/care-facility-pickup-verification-ok-owner-confirmation-required.json",
    valid: false
  },
  {
    name: "reject care facility pickup verification identity document leak",
    schema: "schemas/care-facility-pickup-verification-response.schema.json",
    data: "tests/conformance/fixtures/invalid/care-facility-pickup-verification-identity-document-leak.json",
    valid: false
  },
  {
    name: "reject care facility pickup verification payment authority leak",
    schema: "schemas/care-facility-pickup-verification-response.schema.json",
    data: "tests/conformance/fixtures/invalid/care-facility-pickup-verification-payment-authority-leak.json",
    valid: false
  },
  {
    name: "reject care facility pickup verification feeding or medication leak",
    schema: "schemas/care-facility-pickup-verification-response.schema.json",
    data: "tests/conformance/fixtures/invalid/care-facility-pickup-verification-feeding-medication-leak.json",
    valid: false
  },
  {
    name: "reject care facility pickup verification Care Network or unrelated contact leak",
    schema: "schemas/care-facility-pickup-verification-response.schema.json",
    data: "tests/conformance/fixtures/invalid/care-facility-pickup-verification-care-network-contact-leak.json",
    valid: false
  },
  {
    name: "reject care facility pickup verification purpose mismatch",
    schema: "schemas/care-facility-pickup-verification-response.schema.json",
    data: "tests/conformance/fixtures/invalid/care-facility-pickup-verification-purpose-mismatch.json",
    valid: false
  },
  {
    name: "reject care facility pickup verification partial response with authorized status",
    schema: "schemas/care-facility-pickup-verification-response.schema.json",
    data: "tests/conformance/fixtures/invalid/care-facility-pickup-verification-partial-with-authorized-status.json",
    valid: false
  },
  {
    name: "reject care facility pickup verification staff-only visibility",
    schema: "schemas/care-facility-pickup-verification-response.schema.json",
    data: "tests/conformance/fixtures/invalid/care-facility-pickup-verification-staff-only-visibility.json",
    valid: false
  },
  {
    name: "care network lookup request example",
    schema: "schemas/care-network-lookup-request.schema.json",
    data: "examples/care-network-lookup-request.json",
    valid: true
  },
  {
    name: "care network lookup allowed response example",
    schema: "schemas/care-network-lookup-response.schema.json",
    data: "examples/care-network-lookup-response.json",
    valid: true
  },
  {
    name: "care network lookup contact withheld response example",
    schema: "schemas/care-network-lookup-response.schema.json",
    data: "examples/care-network-lookup-contact-withheld-response.json",
    valid: true
  },
  {
    name: "care network lookup denied response example",
    schema: "schemas/care-network-lookup-response.schema.json",
    data: "examples/care-network-lookup-denied-response.json",
    valid: true
  },
  {
    name: "reject care network lookup broad scope request",
    schema: "schemas/care-network-lookup-request.schema.json",
    data: "tests/conformance/fixtures/invalid/care-network-lookup-broad-scope-request.json",
    valid: false
  },
  {
    name: "reject care network lookup denied response with context",
    schema: "schemas/care-network-lookup-response.schema.json",
    data: "tests/conformance/fixtures/invalid/care-network-lookup-denied-response-with-context.json",
    valid: false
  },
  {
    name: "reject care network lookup household keyword in reasons",
    schema: "schemas/care-network-lookup-response.schema.json",
    data: "tests/conformance/fixtures/invalid/care-network-lookup-household-keyword-in-reasons.json",
    valid: false
  },
  {
    name: "reject care network lookup staff-only visibility",
    schema: "schemas/care-network-lookup-response.schema.json",
    data: "tests/conformance/fixtures/invalid/care-network-lookup-staff-only-visibility.json",
    valid: false
  },
  {
    name: "reject care network lookup sensitive provenance ref",
    schema: "schemas/care-network-lookup-response.schema.json",
    data: "tests/conformance/fixtures/invalid/care-network-lookup-sensitive-provenance-ref.json",
    valid: false
  },
  {
    name: "reject care network lookup unrelated contact list",
    schema: "schemas/care-network-lookup-response.schema.json",
    data: "tests/conformance/fixtures/invalid/care-network-lookup-unrelated-contact-list.json",
    valid: false
  },
  {
    name: "reject care network lookup cross-profile visibility",
    schema: "schemas/care-network-lookup-response.schema.json",
    data: "tests/conformance/fixtures/invalid/care-network-lookup-cross-profile-visibility.json",
    valid: false
  }
];

let failed = false;
const validators = new Map();

const compileValidator = (schemaPathOrRef) => {
  if (schemaPathOrRef.startsWith("ccp-core.schema.json#")) {
    return ajv.compile({
      $ref: schemaPathOrRef
    });
  }

  return ajv.compile(readJson(schemaPathOrRef));
};

for (const testCase of cases) {
  if (!validators.has(testCase.schema)) {
    validators.set(testCase.schema, compileValidator(testCase.schema));
  }

  const validate = validators.get(testCase.schema);
  const actual = validate(readJson(testCase.data));

  if (actual === testCase.valid) {
    console.log(`ok - ${testCase.name}`);
    continue;
  }

  failed = true;
  console.error(`not ok - ${testCase.name}`);
  console.error(`  expected valid=${testCase.valid}, got valid=${actual}`);
  console.error(`  schema: ${testCase.schema}`);
  console.error(`  data: ${testCase.data}`);
  console.error(`  errors: ${JSON.stringify(validate.errors, null, 2)}`);
}

if (failed) {
  process.exit(1);
}

const roundTripPairs = [
  {
    name: "partial example",
    request: "examples/commerce-context-request.json",
    response: "examples/commerce-context-response.json"
  },
  {
    name: "denied example",
    request: "tests/conformance/fixtures/valid/commerce-context-denied-request.json",
    response: "examples/commerce-context-denied-response.json"
  },
  {
    name: "purchase history fixture",
    request: "tests/conformance/fixtures/valid/commerce-context-purchase-history-request.json",
    response: "tests/conformance/fixtures/valid/commerce-context-ok-purchase-history-response.json"
  },
  {
    name: "care facility boarding preparation example",
    request: "examples/care-facility-boarding-preparation-request.json",
    response: "examples/care-facility-boarding-preparation-response.json",
    contextKey: "care_facility_context"
  },
  {
    name: "care facility pickup verification example",
    request: "examples/care-facility-pickup-verification-request.json",
    response: "examples/care-facility-pickup-verification-response.json",
    contextKey: "pickup_verification_context"
  },
  {
    name: "care network lookup example",
    request: "examples/care-network-lookup-request.json",
    response: "examples/care-network-lookup-response.json",
    contextKey: "care_network_context"
  }
];

for (const pair of roundTripPairs) {
  const request = readJson(pair.request);
  const response = readJson(pair.response);
  const roundTripChecks = [
    ["response.request_id", response.request_id, request.request_id],
    [
      "authorization_decision.requester_actor_id",
      response.authorization_decision.requester_actor_id,
      request.requester_actor_id
    ],
    ["authorization_decision.pet_id", response.authorization_decision.pet_id, request.pet_id],
    ["authorization_decision.purpose", response.authorization_decision.purpose, request.purpose],
    ["authorization_decision.grant_id", response.authorization_decision.grant_id, request.grant_id]
  ];

  const contextKey = pair.contextKey ?? "commerce_context";
  const context = response[contextKey];

  if (context !== null) {
    roundTripChecks.push(
      [`${contextKey}.pet_id`, context?.pet_id, request.pet_id],
      [`${contextKey}.purpose`, context?.purpose, request.purpose]
    );

    if (
      contextKey === "care_facility_context" ||
      contextKey === "pickup_verification_context"
    ) {
      roundTripChecks.push(
        [`${contextKey}.facility_id`, context?.facility_id, request.facility_id],
        [`${contextKey}.service_id`, context?.service_id, request.service_id],
        [`${contextKey}.service_type`, context?.service_type, request.service_type],
        [`${contextKey}.service_window`, context?.service_window, request.service_window]
      );
    }

    if (contextKey === "pickup_verification_context") {
      roundTripChecks.push([
        `${contextKey}.pickup_actor.actor_id`,
        context?.pickup_actor?.actor_id,
        request.pickup_actor_id
      ]);
    }

    if (contextKey === "care_network_context") {
      roundTripChecks.push([
        `${contextKey}.subject_actor.actor_id`,
        context?.subject_actor?.actor_id,
        request.subject_actor_id
      ]);
    }
  }

  for (const [name, actual, expected] of roundTripChecks) {
    if (actual === expected || isDeepStrictEqual(actual, expected)) {
      continue;
    }

    failed = true;
    console.error(`not ok - ${pair.name} request/response mismatch: ${name}`);
    console.error(`  expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

if (failed) {
  process.exit(1);
}

console.log("ok - request/response round trip consistency");

// Integration-level check: catches drift between paired example
// request/grant fixtures. The mismatch branches fire only when the
// fixtures are schema-valid but inconsistent with each other.
const reportGrantRequestMismatches = ({ label, request, grant, fieldChecks }) => {
  let blockFailed = false;

  for (const [name, actual, expected] of fieldChecks) {
    if (actual === expected || isDeepStrictEqual(actual, expected)) {
      continue;
    }

    blockFailed = true;
    console.error(`not ok - ${label} grant/request mismatch: ${name}`);
    console.error(`  expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }

  if (!grant.purposes.includes(request.purpose)) {
    blockFailed = true;
    console.error(`not ok - ${label} grant/request mismatch: purpose`);
    console.error(`  expected grant purposes to include ${request.purpose}`);
  }

  for (const scope of request.scopes) {
    if (grant.scopes.includes(scope)) {
      continue;
    }

    blockFailed = true;
    console.error(`not ok - ${label} grant/request mismatch: scope`);
    console.error(`  expected grant scopes to include ${scope}`);
  }

  if (!blockFailed) {
    console.log(`ok - ${label} grant/request consistency`);
  }

  return blockFailed;
};

const careFacilityRequest = readJson("examples/care-facility-boarding-preparation-request.json");
const careFacilityGrant = readJson("examples/permission-grant-care-facility-boarding-preparation.json");
failed ||= reportGrantRequestMismatches({
  label: "care facility",
  request: careFacilityRequest,
  grant: careFacilityGrant,
  fieldChecks: [
    ["grant_id", careFacilityGrant.grant_id, careFacilityRequest.grant_id],
    ["subject_pet_id", careFacilityGrant.subject_pet_id, careFacilityRequest.pet_id],
    ["grantee_actor_id", careFacilityGrant.grantee_actor_id, careFacilityRequest.requester_actor_id],
    ["facility_id", careFacilityGrant.facility_id, careFacilityRequest.facility_id],
    ["service_id", careFacilityGrant.service_id, careFacilityRequest.service_id],
    ["service_type", careFacilityGrant.service_type, careFacilityRequest.service_type],
    ["service_window", careFacilityGrant.service_window, careFacilityRequest.service_window]
  ]
});

if (failed) {
  process.exit(1);
}

const pickupVerificationRequest = readJson("examples/care-facility-pickup-verification-request.json");
const pickupVerificationGrant = readJson("examples/permission-grant-care-facility-pickup-verification.json");
failed ||= reportGrantRequestMismatches({
  label: "pickup verification",
  request: pickupVerificationRequest,
  grant: pickupVerificationGrant,
  fieldChecks: [
    ["grant_id", pickupVerificationGrant.grant_id, pickupVerificationRequest.grant_id],
    ["subject_pet_id", pickupVerificationGrant.subject_pet_id, pickupVerificationRequest.pet_id],
    ["grantee_actor_id", pickupVerificationGrant.grantee_actor_id, pickupVerificationRequest.requester_actor_id],
    ["facility_id", pickupVerificationGrant.facility_id, pickupVerificationRequest.facility_id],
    ["service_id", pickupVerificationGrant.service_id, pickupVerificationRequest.service_id],
    ["service_type", pickupVerificationGrant.service_type, pickupVerificationRequest.service_type],
    ["service_window", pickupVerificationGrant.service_window, pickupVerificationRequest.service_window]
  ]
});

if (failed) {
  process.exit(1);
}

const careNetworkLookupRequest = readJson("examples/care-network-lookup-request.json");
const careNetworkLookupGrant = readJson("examples/permission-grant-care-network-lookup.json");
failed ||= reportGrantRequestMismatches({
  label: "care network lookup",
  request: careNetworkLookupRequest,
  grant: careNetworkLookupGrant,
  fieldChecks: [
    ["grant_id", careNetworkLookupGrant.grant_id, careNetworkLookupRequest.grant_id],
    ["subject_pet_id", careNetworkLookupGrant.subject_pet_id, careNetworkLookupRequest.pet_id],
    ["grantee_actor_id", careNetworkLookupGrant.grantee_actor_id, careNetworkLookupRequest.requester_actor_id],
    ["service_id", careNetworkLookupGrant.service_id, careNetworkLookupRequest.service_id],
    ["service_window", careNetworkLookupGrant.service_window, careNetworkLookupRequest.service_window]
  ]
});

if (failed) {
  process.exit(1);
}
