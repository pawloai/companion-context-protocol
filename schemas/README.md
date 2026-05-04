# Schemas

Canonical JSON Schema definitions for CCP objects live here.

JSON Schema is the normative contract for the current draft. Transport adapters, including OpenAPI and MCP, should preserve these shapes and the related authorization, visibility, provenance, and omission semantics.

Current draft schemas:

- `ccp-core.schema.json`: shared definitions for core CCP objects.
- `commerce-context-request.schema.json`: request wrapper for Commerce Context Profile requests.
- `commerce-context-response.schema.json`: response wrapper for Commerce Context Profile responses.
- `permission-grant.schema.json`: wrapper for permission grant examples.

Schema `$id` values are stable identifiers for the draft schema documents. They are not required to be dereferenceable URLs for local validation.

Initial core objects:

- `PetProfile`
- `DietProfile`
- `CommerceContext`
- `PermissionGrant`
- `ContextProvenance`

The OpenAPI adapter and MCP tool sketches reference core definitions directly from `ccp-core.schema.json` while the wrapper schemas remain the validation entry points for examples and conformance tests.

Validate the schemas and examples from the repository root:

```sh
npm test
```
