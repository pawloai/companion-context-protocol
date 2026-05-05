import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("../..", import.meta.url));
const pythonSource = path.join(repoRoot, "packages/python/src");
const pythonEnv = {
  ...process.env,
  PYTHONPATH: pythonSource
};

const python = process.env.PYTHON ?? "python3";
const schemaNames = [
  "ccp-core.schema.json",
  "commerce-context-request.schema.json",
  "commerce-context-response.schema.json",
  "care-facility-context-request.schema.json",
  "care-facility-context-response.schema.json",
  "permission-grant.schema.json"
];

execFileSync(python, ["-m", "compileall", "-q", pythonSource], {
  cwd: repoRoot,
  env: pythonEnv,
  stdio: "inherit"
});

const checkScript = `
from pathlib import Path
import ccp_types.schemas as schema_module
from ccp_types import CCP_VERSION, load_schema, load_schemas, schema_path, schema_paths

expected_names = {
    "core",
    "commerce-context-request",
    "commerce-context-response",
    "care-facility-context-request",
    "care-facility-context-response",
    "permission-grant",
}

assert CCP_VERSION == "0.1.0-draft"
paths = schema_paths()
assert set(paths) == expected_names
for name, path in paths.items():
    assert isinstance(path, Path)
    assert path.exists(), f"missing schema path: {name} -> {path}"

core_schema = load_schema("core")
assert core_schema["title"] == "Companion Context Protocol Core"
assert core_schema["$defs"]["CommerceContextRequest"]
assert load_schema("commerce-context-request")["$ref"] == "ccp-core.schema.json#/$defs/CommerceContextRequest"
assert load_schema("care-facility-context-request")["$ref"] == "ccp-core.schema.json#/$defs/CareFacilityContextRequest"
assert set(load_schemas()) == expected_names

schema_module._repo_root = lambda: Path("/ccp-source-tree-not-present")
assert schema_module.schema_path("core").exists()
assert schema_module.load_schema("core")["$defs"]["CommerceContextResponse"]
`;

execFileSync(python, ["-c", checkScript], {
  cwd: repoRoot,
  env: pythonEnv,
  stdio: "inherit"
});

for (const schemaName of schemaNames) {
  const canonicalSchema = fs.readFileSync(path.join(repoRoot, "schemas", schemaName), "utf8");
  const packagedSchema = fs.readFileSync(
    path.join(pythonSource, "ccp_types/json_schemas", schemaName),
    "utf8"
  );

  if (canonicalSchema !== packagedSchema) {
    console.error(`not ok - packaged Python schema is out of sync: ${schemaName}`);
    process.exit(1);
  }
}

console.log("ok - Python package schema helpers");
