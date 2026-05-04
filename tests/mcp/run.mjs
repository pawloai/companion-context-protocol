import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("../..", import.meta.url));
const adapterPath = "mcp/commerce-context.tools.json";
const adapterDir = path.dirname(adapterPath);
const coreSchemaPath = "schemas/ccp-core.schema.json";

const readJson = (relativePath) =>
  JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), "utf8"));

const existsFromAdapter = (relativePath) =>
  fs.existsSync(path.join(repoRoot, adapterDir, relativePath));

const adapter = readJson(adapterPath);
const coreSchema = readJson(coreSchemaPath);
const errors = [];

const addError = (message) => {
  errors.push(message);
};

if (adapter.adapter !== "mcp") {
  addError("adapter must be `mcp`");
}

if (adapter.ccp_version !== "0.1.0-draft") {
  addError("ccp_version must match the current draft");
}

if (adapter.canonical_contract !== "../schemas/ccp-core.schema.json") {
  addError("canonical_contract must point to the core schema");
}

if (!Array.isArray(adapter.tools) || adapter.tools.length === 0) {
  addError("tools must be a non-empty array");
}

const toolNames = new Set();
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

for (const tool of adapter.tools ?? []) {
  if (!/^[a-z][a-z0-9_]*$/.test(tool.name ?? "")) {
    addError(`invalid tool name: ${tool.name}`);
  }

  if (toolNames.has(tool.name)) {
    addError(`duplicate tool name: ${tool.name}`);
  }
  toolNames.add(tool.name);

  if (!tool.description) {
    addError(`${tool.name} is missing description`);
  }

  for (const [schemaName, schema] of [
    ["inputSchema", tool.inputSchema],
    ["outputSchema", tool.outputSchema]
  ]) {
    if (!schema || typeof schema !== "object") {
      addError(`${tool.name}.${schemaName} must be an object`);
      continue;
    }

    checkSchemaRefs(schema, `${tool.name}.${schemaName}`);
  }

  if (tool.name === "ccp_permission_grant_get") {
    if (tool["x-ccp-required-scope"] !== "pet.permission_grants.read") {
      addError("ccp_permission_grant_get must declare pet.permission_grants.read");
    }
  }

  for (const examplePath of Object.values(tool.examples ?? {})) {
    if (!existsFromAdapter(examplePath)) {
      addError(`${tool.name} example does not exist: ${examplePath}`);
    }
  }
}

for (const requiredTool of [
  "ccp_commerce_context_request",
  "ccp_permission_grant_get"
]) {
  if (!toolNames.has(requiredTool)) {
    addError(`missing required tool sketch: ${requiredTool}`);
  }
}

if (errors.length > 0) {
  for (const error of errors) {
    console.error(`not ok - ${error}`);
  }
  process.exit(1);
}

console.log("ok - MCP commerce context tool sketches");
