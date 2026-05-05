# Python Package

Draft Python helpers for CCP implementers live here.

Status: Draft helper package, pre-1.0

This package is intentionally small. It does not define hand-written runtime models yet. It provides package metadata and schema-loading helpers for the canonical JSON Schemas in this repository. Packaged schema snapshots are included for installed users and checked against the canonical repository schemas in `npm run test:python`.

## Current Exports

- `CCP_VERSION`
- `SchemaName`
- `schema_path`
- `schema_paths`
- `load_schema`
- `load_schemas`

## Build And Check

From the repository root:

```sh
npm install
npm run test:python
```

The Python test compiles the package, verifies that exported schema helpers resolve schemas in both repository and installed-package modes, and confirms packaged schemas match the canonical repository schemas.

## Compatibility

The canonical JSON Schemas remain the source of truth. Python implementers should validate request, response, pickup verification, Care Network lookup, and permission grant objects against `../../schemas/` until generated models are introduced.

Future work may add Pydantic models generated from the canonical schemas. Generated models should preserve the schema contract rather than replacing it.
