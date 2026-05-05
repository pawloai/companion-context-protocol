import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { schemaFilenames } from "../../../scripts/schema-names.mjs";

const packageRoot = fileURLToPath(new URL("..", import.meta.url));
const repoRoot = path.resolve(packageRoot, "../..");
const distSchemaDir = path.join(packageRoot, "dist", "schemas");

fs.mkdirSync(distSchemaDir, { recursive: true });

for (const schemaName of schemaFilenames) {
  fs.copyFileSync(
    path.join(repoRoot, "schemas", schemaName),
    path.join(distSchemaDir, schemaName)
  );
}
