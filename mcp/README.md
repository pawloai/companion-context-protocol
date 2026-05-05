# MCP Adapter

Draft MCP tool sketches live here.

MCP is one integration surface for CCP, not the protocol itself. The canonical CCP contract should remain transport-neutral.

The MCP adapter maps agent tool calls to the same profile request and response objects defined by the canonical schemas.

Commerce Context schemas:

- `schemas/commerce-context-request.schema.json`
- `schemas/commerce-context-response.schema.json`

Care Facility Context schemas:

- `schemas/care-facility-context-request.schema.json`
- `schemas/care-facility-context-response.schema.json`

## Current Adapters

- [`commerce-context.tools.json`](commerce-context.tools.json): illustrative MCP tool sketches for the Commerce Context Profile.
- [`care-facility-context.tools.json`](care-facility-context.tools.json): illustrative MCP tool sketches for the first Care Facility Context boarding-preparation slice.

Current tool sketches:

- `ccp_commerce_context_request`: request commerce-safe context for one pet.
- `ccp_care_facility_context_request`: request boarding-preparation context for one pet, facility, and service window.
- `ccp_permission_grant_get`: optional lookup for a permission grant visible to the requester.

The MCP adapter preserves the same authorization decision, visibility, provenance, and omission semantics rather than defining a separate protocol.

Validate the adapters from the repository root:

```sh
npm test
```
