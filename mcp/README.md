# MCP Adapter

Draft MCP tool sketches live here.

MCP is one integration surface for CCP, not the protocol itself. The canonical CCP contract should remain transport-neutral.

The MCP adapter maps agent tool calls to the same Commerce Context Profile request and response objects defined by the canonical schemas:

- `schemas/commerce-context-request.schema.json`
- `schemas/commerce-context-response.schema.json`

## Current Adapter

- [`commerce-context.tools.json`](commerce-context.tools.json): illustrative MCP tool sketches for the Commerce Context Profile.

Current tool sketches:

- `ccp_commerce_context_request`: request commerce-safe context for one pet.
- `ccp_permission_grant_get`: optional lookup for a permission grant visible to the requester.

The MCP adapter preserves the same authorization decision, visibility, provenance, and omission semantics rather than defining a separate protocol.

Validate the adapter from the repository root:

```sh
npm test
```
