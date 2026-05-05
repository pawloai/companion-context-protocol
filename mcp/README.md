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
- `schemas/care-facility-pickup-verification-request.schema.json`
- `schemas/care-facility-pickup-verification-response.schema.json`

Care Network Lookup schemas:

- `schemas/care-network-lookup-request.schema.json`
- `schemas/care-network-lookup-response.schema.json`

## Current Adapters

- [`commerce-context.tools.json`](commerce-context.tools.json): illustrative MCP tool sketches for the Commerce Context Profile.
- [`care-facility-context.tools.json`](care-facility-context.tools.json): illustrative MCP tool sketches for the first Care Facility Context boarding-preparation slice.
- [`care-facility-pickup-verification.tools.json`](care-facility-pickup-verification.tools.json): illustrative MCP tool sketches for the Care Facility Pickup Verification slice.
- [`care-network-lookup.tools.json`](care-network-lookup.tools.json): illustrative MCP tool sketch for the first Care Network lookup slice.

Current tool sketches:

- `ccp_commerce_context_request`: request commerce-safe context for one pet.
- `ccp_care_facility_context_request`: request boarding-preparation context for one pet, facility, and service window.
- `ccp_care_facility_pickup_verification_request`: verify pickup authorization for one pet, facility, service window, and pickup actor.
- `ccp_care_network_lookup_request`: look up one subject actor's relationship, contact channels, action authorizations, or revocation status for one pet.
- `ccp_permission_grant_get`: optional lookup for a permission grant visible to the requester on adapters that expose grant lookup. The pickup-verification and care-network lookup adapters intentionally omit this tool to keep those surfaces minimized.

The MCP adapter preserves the same authorization decision, visibility, provenance, and omission semantics rather than defining a separate protocol.

Validate the adapters from the repository root:

```sh
npm test
```
