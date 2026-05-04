import fs from "node:fs";
import path from "node:path";
import process from "node:process";
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
  }
];

let failed = false;
const validators = new Map();

for (const testCase of cases) {
  if (!validators.has(testCase.schema)) {
    validators.set(testCase.schema, ajv.compile(readJson(testCase.schema)));
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

  if (response.commerce_context !== null) {
    roundTripChecks.push(
      ["commerce_context.pet_id", response.commerce_context?.pet_id, request.pet_id],
      ["commerce_context.purpose", response.commerce_context?.purpose, request.purpose]
    );
  }

  for (const [name, actual, expected] of roundTripChecks) {
    if (actual === expected) {
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
