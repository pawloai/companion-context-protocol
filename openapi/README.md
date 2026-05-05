# OpenAPI Adapter

OpenAPI examples for HTTP-based CCP implementations live here.

JSON Schema remains the canonical CCP contract. OpenAPI documents in this directory are adapter sketches that map HTTP requests and responses to the same protocol objects, authorization decisions, visibility rules, provenance requirements, and omission semantics defined by [SPEC.md](../SPEC.md).

## Current Adapters

- [`commerce-context.openapi.json`](commerce-context.openapi.json): illustrative HTTP surface for the Commerce Context Profile.
- [`care-facility-context.openapi.json`](care-facility-context.openapi.json): illustrative HTTP surface for the first Care Facility Context boarding-preparation slice.
- [`care-facility-pickup-verification.openapi.json`](care-facility-pickup-verification.openapi.json): illustrative HTTP surface for the Care Facility Pickup Verification slice.
- [`care-network-lookup.openapi.json`](care-network-lookup.openapi.json): illustrative HTTP surface for the first Care Network lookup slice.

The Commerce Context adapter defines:

- `POST /commerce-context` for requesting commerce-safe context for one pet.
- `GET /permission-grants/{grant_id}` as an optional grant lookup surface.
- Bearer authentication as an illustrative transport mechanism only.
- Headers for draft version, profile, and request correlation.
- Request and response bodies that reference the canonical JSON Schemas.

The Care Facility Context adapter defines:

- `POST /care-facility-context` for requesting boarding-preparation context for one pet, facility, and service window.
- `GET /permission-grants/{grant_id}` as an optional grant lookup surface.
- Bearer authentication as an illustrative transport mechanism only.
- Headers for draft version, profile, and request correlation.
- Request and response bodies that reference the canonical JSON Schemas.

The Care Facility Pickup Verification adapter defines:

- `POST /care-facility-pickup-verification` for verifying pickup authorization for one pet, facility, service window, and pickup actor.
- No grant lookup endpoint. The pickup adapter intentionally keeps the HTTP surface limited to pickup verification.
- Bearer authentication as an illustrative transport mechanism only.
- Headers for draft version, profile, and request correlation.
- Request and response bodies that reference the canonical JSON Schemas.

The Care Network Lookup adapter defines:

- `POST /care-network-lookup` for looking up one subject actor's relationship, contact channels, action authorizations, or revocation status for one pet.
- No grant lookup endpoint. The lookup adapter intentionally keeps the HTTP surface limited to one-subject lookup.
- Bearer authentication as an illustrative transport mechanism only.
- Headers for draft version, profile, and request correlation.
- Request and response bodies that reference the canonical JSON Schemas.

Protocol-level denials return a CCP response envelope with `status: denied`. Ordinary HTTP errors are reserved for malformed requests, transport authentication failures, unsupported media types, rate limiting, and HTTP-surface authorization failures.

Validate the adapters from the repository root:

```sh
npm test
```
