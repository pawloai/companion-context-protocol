import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = fileURLToPath(new URL("..", import.meta.url));
const repoRoot = path.resolve(packageRoot, "../..");
const distSchemaDir = path.join(packageRoot, "dist", "schemas");
const schemaNames = [
  "ccp-core.schema.json",
  "commerce-context-request.schema.json",
  "commerce-context-response.schema.json",
  "permission-grant.schema.json"
];

fs.mkdirSync(distSchemaDir, { recursive: true });

for (const schemaName of schemaNames) {
  fs.copyFileSync(
    path.join(repoRoot, "schemas", schemaName),
    path.join(distSchemaDir, schemaName)
  );
}
