import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("../..", import.meta.url));
const coreSchemaPath = "schemas/ccp-core.schema.json";
const adapterFiles = [
  {
    path: "mcp/commerce-context.tools.json",
    profile: "commerce-context",
    requiredTool: "ccp_commerce_context_request",
    requestSchema: "../schemas/commerce-context-request.schema.json",
    responseSchema: "../schemas/commerce-context-response.schema.json"
  },
  {
    path: "mcp/care-facility-context.tools.json",
    profile: "care-facility-context",
    requiredTool: "ccp_care_facility_context_request",
    requestSchema: "../schemas/care-facility-context-request.schema.json",
    responseSchema: "../schemas/care-facility-context-response.schema.json"
  }
];

const readJson = (relativePath) =>
  JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), "utf8"));

const coreSchema = readJson(coreSchemaPath);
const errors = [];

const addError = (message) => {
  errors.push(message);
};

const schemaRefPrefix = "../schemas/ccp-core.schema.json#/$defs/";

const checkSchemaRefs = (schema, label) => {
  if (!schema || typeof schema !== "object") {
    return;
  }

  if (schema.$ref && !schema.$ref.startsWith(schemaRefPrefix)) {
    addError(`${label} has unsupported schema ref ${schema.$ref}`);
  }

  if (schema.$ref?.startsWith(schemaRefPrefix)) {
    const defName = schema.$ref.slice(schemaRefPrefix.length);
    if (!coreSchema.$defs?.[defName]) {
      addError(`${label} references missing core definition ${defName}`);
    }
  }

  for (const [key, value] of Object.entries(schema)) {
    checkSchemaRefs(value, `${label}.${key}`);
  }
};

for (const adapterFile of adapterFiles) {
  const adapter = readJson(adapterFile.path);
  const adapterDir = path.dirname(adapterFile.path);
  const toolNames = new Set();
  const existsFromAdapter = (relativePath) =>
    fs.existsSync(path.join(repoRoot, adapterDir, relativePath));

  if (adapter.adapter !== "mcp") {
    addError(`${adapterFile.path} adapter must be \`mcp\``);
  }

  if (adapter.ccp_version !== "0.1.0-draft") {
    addError(`${adapterFile.path} ccp_version must match the current draft`);
  }

  if (adapter.profile !== adapterFile.profile) {
    addError(`${adapterFile.path} profile must be ${adapterFile.profile}`);
  }

  if (adapter.canonical_contract !== "../schemas/ccp-core.schema.json") {
    addError(`${adapterFile.path} canonical_contract must point to the core schema`);
  }

  if (!Array.isArray(adapter.tools) || adapter.tools.length === 0) {
    addError(`${adapterFile.path} tools must be a non-empty array`);
  }

  for (const tool of adapter.tools ?? []) {
    if (!/^[a-z][a-z0-9_]*$/.test(tool.name ?? "")) {
      addError(`${adapterFile.path} invalid tool name: ${tool.name}`);
    }

    if (toolNames.has(tool.name)) {
      addError(`${adapterFile.path} duplicate tool name: ${tool.name}`);
    }
    toolNames.add(tool.name);

    if (!tool.description) {
      addError(`${adapterFile.path} ${tool.name} is missing description`);
    }

    for (const [schemaName, schema] of [
      ["inputSchema", tool.inputSchema],
      ["outputSchema", tool.outputSchema]
    ]) {
      if (!schema || typeof schema !== "object") {
        addError(`${adapterFile.path} ${tool.name}.${schemaName} must be an object`);
        continue;
      }

      checkSchemaRefs(schema, `${adapterFile.path}.${tool.name}.${schemaName}`);
    }

    if (tool.name === adapterFile.requiredTool) {
      if (tool["x-ccp-canonical-request-schema"] !== adapterFile.requestSchema) {
        addError(`${tool.name} has wrong canonical request schema`);
      }

      if (tool["x-ccp-canonical-response-schema"] !== adapterFile.responseSchema) {
        addError(`${tool.name} has wrong canonical response schema`);
      }
    }

    if (tool.name === "ccp_permission_grant_get") {
      if (tool["x-ccp-required-scope"] !== "pet.permission_grants.read") {
        addError(`${adapterFile.path} ccp_permission_grant_get must declare pet.permission_grants.read`);
      }
    }

    for (const examplePath of Object.values(tool.examples ?? {})) {
      if (!existsFromAdapter(examplePath)) {
        addError(`${adapterFile.path} ${tool.name} example does not exist: ${examplePath}`);
      }
    }
  }

  for (const requiredTool of [
    adapterFile.requiredTool,
    "ccp_permission_grant_get"
  ]) {
    if (!toolNames.has(requiredTool)) {
      addError(`${adapterFile.path} missing required tool sketch: ${requiredTool}`);
    }
  }
}

if (errors.length > 0) {
  for (const error of errors) {
    console.error(`not ok - ${error}`);
  }
  process.exit(1);
}

console.log("ok - MCP tool sketches");
