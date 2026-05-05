export const schemaFilenames = [
  "ccp-core.schema.json",
  "commerce-context-request.schema.json",
  "commerce-context-response.schema.json",
  "care-facility-context-request.schema.json",
  "care-facility-context-response.schema.json",
  "care-facility-pickup-verification-request.schema.json",
  "care-facility-pickup-verification-response.schema.json",
  "care-network-lookup-request.schema.json",
  "care-network-lookup-response.schema.json",
  "permission-grant.schema.json"
];

// The "core" alias mirrors `SchemaName` in
// packages/python/src/ccp_types/schemas.py — keep these in sync.
export function pythonSchemaKey(filename) {
  if (filename === "ccp-core.schema.json") return "core";
  return filename.replace(/\.schema\.json$/, "");
}
