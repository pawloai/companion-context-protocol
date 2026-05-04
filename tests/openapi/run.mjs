import SwaggerParser from "@apidevtools/swagger-parser";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const openApiPath = fileURLToPath(
  new URL("../../openapi/commerce-context.openapi.json", import.meta.url)
);
const openApiDir = path.dirname(openApiPath);
const openApi = JSON.parse(fs.readFileSync(openApiPath, "utf8"));

const errors = [];

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

await SwaggerParser.validate(openApiPath);

visit(openApi);

if (
  openApi.paths?.["/permission-grants/{grant_id}"]?.get?.["x-ccp-required-scope"] !==
  "pet.permission_grants.read"
) {
  errors.push("GET /permission-grants/{grant_id} must declare pet.permission_grants.read");
}

if (errors.length > 0) {
  for (const error of errors) {
    console.error(`not ok - ${error}`);
  }
  process.exit(1);
}

console.log("ok - OpenAPI commerce context adapter");
