---
title: Companion Context Protocol
---

# Companion Context Protocol

Companion Context Protocol (CCP) is a draft open specification for permissioned companion-animal context exchange. The current draft is `0.1.0-draft` and is pre-1.0; expect compatibility-affecting changes before a stable release.

## Documents

- [Specification](./SPEC.md)
- [Threat model](./THREAT_MODEL.md)
- [README](./README.md)
- [Server implementer guide](./docs/implementers/commerce-context-server.md)
- [Facility Truth server implementer guide](./docs/implementers/facility-truth-server.md)
- [Compatibility risks](./docs/implementers/compatibility-risks.md)

## Canonical schemas

- [`ccp-core.schema.json`](./schemas/ccp-core.schema.json)
- [`commerce-context-request.schema.json`](./schemas/commerce-context-request.schema.json)
- [`commerce-context-response.schema.json`](./schemas/commerce-context-response.schema.json)
- [`care-facility-context-request.schema.json`](./schemas/care-facility-context-request.schema.json)
- [`care-facility-context-response.schema.json`](./schemas/care-facility-context-response.schema.json)
- [`care-facility-pickup-verification-request.schema.json`](./schemas/care-facility-pickup-verification-request.schema.json)
- [`care-facility-pickup-verification-response.schema.json`](./schemas/care-facility-pickup-verification-response.schema.json)
- [`care-network-lookup-request.schema.json`](./schemas/care-network-lookup-request.schema.json)
- [`care-network-lookup-response.schema.json`](./schemas/care-network-lookup-response.schema.json)
- [`facility-truth-request.schema.json`](./schemas/facility-truth-request.schema.json)
- [`facility-truth-response.schema.json`](./schemas/facility-truth-response.schema.json)
- [`permission-grant.schema.json`](./schemas/permission-grant.schema.json)

Schema `$id` values resolve to these URLs, but implementers are still encouraged to vendor schemas for build-time validation and offline determinism. See [Compatibility risks](./docs/implementers/compatibility-risks.md) for the current list of surfaces likely to change before `1.0`.
