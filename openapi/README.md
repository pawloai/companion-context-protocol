# OpenAPI Adapter

OpenAPI examples for HTTP-based CCP implementations live here.

JSON Schema remains the canonical CCP contract. OpenAPI documents in this directory are adapter sketches that map HTTP requests and responses to the same protocol objects, authorization decisions, visibility rules, provenance requirements, and omission semantics defined by [SPEC.md](../SPEC.md).

## Current Adapter

- [`commerce-context.openapi.json`](commerce-context.openapi.json): illustrative HTTP surface for the Commerce Context Profile.

The adapter defines:

- `POST /commerce-context` for requesting commerce-safe context for one pet.
- `GET /permission-grants/{grant_id}` as an optional grant lookup surface.
- Bearer authentication as an illustrative transport mechanism only.
- Headers for draft version, profile, and request correlation.
- Request and response bodies that reference the canonical JSON Schemas.

Protocol-level denials return a CCP response envelope with `status: denied`. Ordinary HTTP errors are reserved for malformed requests, transport authentication failures, unsupported media types, rate limiting, and HTTP-surface authorization failures.

Validate the adapter from the repository root:

```sh
npm test
```
