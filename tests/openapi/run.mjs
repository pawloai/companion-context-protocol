import SwaggerParser from "@apidevtools/swagger-parser";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("../..", import.meta.url));
const openApiDir = path.join(repoRoot, "openapi");

const errors = [];
const adapterFiles = [
  {
    file: "commerce-context.openapi.json",
    profile: "commerce-context",
    requestPath: "/commerce-context",
    requestSchema: "../schemas/commerce-context-request.schema.json",
    responseSchema: "../schemas/commerce-context-response.schema.json"
  },
  {
    file: "care-facility-context.openapi.json",
    profile: "care-facility-context",
    requestPath: "/care-facility-context",
    requestSchema: "../schemas/care-facility-context-request.schema.json",
    responseSchema: "../schemas/care-facility-context-response.schema.json"
  },
  {
    file: "care-facility-pickup-verification.openapi.json",
    profile: "care-facility-pickup-verification",
    requestPath: "/care-facility-pickup-verification",
    requestSchema: "../schemas/care-facility-pickup-verification-request.schema.json",
    responseSchema: "../schemas/care-facility-pickup-verification-response.schema.json",
    grantLookup: false
  },
  {
    file: "care-network-lookup.openapi.json",
    profile: "care-network-lookup",
    requestPath: "/care-network-lookup",
    requestSchema: "../schemas/care-network-lookup-request.schema.json",
    responseSchema: "../schemas/care-network-lookup-response.schema.json",
    grantLookup: false
  }
];

const visit = (node, pointer = "$") => {
  if (!node || typeof node !== "object") {
    return;
  }

  if (typeof node.externalValue === "string") {
    const externalPath = path.resolve(openApiDir, node.externalValue);
    if (!fs.existsSync(externalPath)) {
      errors.push(`${pointer}.externalValue does not exist: ${node.externalValue}`);
    }
  }

  for (const [key, value] of Object.entries(node)) {
    visit(value, `${pointer}.${key}`);
  }
};

for (const adapterFile of adapterFiles) {
  const openApiPath = path.join(openApiDir, adapterFile.file);
  const openApi = JSON.parse(fs.readFileSync(openApiPath, "utf8"));

  await SwaggerParser.validate(openApiPath);

  visit(openApi, adapterFile.file);

  const requestOperation = openApi.paths?.[adapterFile.requestPath]?.post;

  if (!requestOperation) {
    errors.push(`${adapterFile.file} must define POST ${adapterFile.requestPath}`);
  }

  if (requestOperation?.["x-ccp-profile"] !== adapterFile.profile) {
    errors.push(`${adapterFile.file} POST ${adapterFile.requestPath} must declare ${adapterFile.profile}`);
  }

  if (requestOperation?.["x-ccp-canonical-request-schema"] !== adapterFile.requestSchema) {
    errors.push(`${adapterFile.file} POST ${adapterFile.requestPath} has wrong canonical request schema`);
  }

  if (requestOperation?.["x-ccp-canonical-response-schema"] !== adapterFile.responseSchema) {
    errors.push(`${adapterFile.file} POST ${adapterFile.requestPath} has wrong canonical response schema`);
  }

  if (adapterFile.grantLookup !== false) {
    if (
      openApi.paths?.["/permission-grants/{grant_id}"]?.get?.["x-ccp-required-scope"] !==
      "pet.permission_grants.read"
    ) {
      errors.push(`${adapterFile.file} GET /permission-grants/{grant_id} must declare pet.permission_grants.read`);
    }
  } else if (openApi.paths?.["/permission-grants/{grant_id}"]) {
    errors.push(`${adapterFile.file} must not expose grant lookup for minimized pickup verification`);
  }
}

if (errors.length > 0) {
  for (const error of errors) {
    console.error(`not ok - ${error}`);
  }
  process.exit(1);
}

console.log("ok - OpenAPI adapter sketches");
