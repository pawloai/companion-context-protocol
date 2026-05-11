# Companion Context Protocol

Companion Context Protocol (CCP) is a draft open specification for permissioned companion-animal context exchange.

CCP defines how pet care, commerce, and agent systems can request only the companion context needed for a specific task, with consent, purpose limits, provenance, visibility classes, freshness, and machine-readable omissions.

## Status

Status: Draft, pre-1.0

This repository is ready to ask design partners for review, but it should not yet be treated as a stable standard, consensus specification, or adopted interoperability baseline. Draft versions may change incompatibly while the profile contracts, conformance tests, and partner requirements are refined.

CCP is currently a protocol proposal with canonical schemas and validation tests. It is not yet endorsed by practice-management vendors, care-facility software vendors, veterinary bodies, insurers, registries, shelters, or other pet-data holders. A compatible implementation claim means "matches this draft and test suite," not "participates in an adopted industry standard."

The first schema-backed profile is the Commerce Context Profile, focused on product recommendations and filtering without exposing unrelated staff notes, wellness timelines, diagnosis or treatment history, billing data, household data, or sensitive facility operations data. That schema order is not a claim that Commerce is the best public adoption wedge.

The draft also includes Care Facility Context schema slices for boarding preparation and pickup verification, plus a first Care Network lookup slice for one pet and one subject actor. They are intentionally narrower than the full care-facility and care-network designs and exclude medication administration, writeback, payment authority, emergency override access, full wellness timelines, diagnosis history, treatment history, billing records, household exports, and identity document copies.

Facility Truth remains a design candidate for a future profile covering provenance-backed facility hours, services, eligibility, certifications, service areas, booking links, and freshness for public operational facts that agents often answer incorrectly. It is still design material only and is not on the immediate roadmap; the active path is implementation feedback on the Care Facility and Care Network profiles.

## What CCP Defines

- Transport-neutral JSON object contracts.
- Permission grants scoped to pets, purposes, and time windows.
- Commerce-safe context bundles.
- Care-facility boarding-preparation context bundles.
- Care-facility pickup-verification context bundles.
- Care-network actor, relationship, contact, and action-authorization lookup bundles.
- Visibility classes for returned facts and summaries.
- Provenance metadata for returned context.
- Authorization decisions for allowed, partial, and denied responses.
- Machine-readable omissions for data that was not returned.
- Conformance expectations for compatible implementations.

CCP is not a database schema, product catalog, recommendation engine, payment protocol, medical diagnosis protocol, or identity system.

CCP is also not a standards body. The path from this repository to a real standard requires outside review, implementation attempts, incompatible-feedback resolution, and visible adoption by independent systems.

## Transport Model

JSON Schema is the canonical contract in this draft.

Other integration surfaces should preserve the same authorization, minimization, provenance, visibility, and omission semantics:

- OpenAPI/HTTP for service integrations.
- MCP tools for agents and assistant clients.
- TypeScript and Python packages for implementers.

MCP is one adapter for CCP. It is not the protocol itself.

## Repository Layout

```text
companion-context-protocol/
  SPEC.md
  schemas/
  examples/
  mcp/
  openapi/
  packages/
    typescript/
    python/
  tests/
    conformance/
    mcp/
    openapi/
    python/
    typescript/
    vendor-neutrality/
  docs/
    design/
    implementers/
    launch/
```

## Current Artifacts

- [Draft specification](SPEC.md)
- [Core JSON Schema](schemas/ccp-core.schema.json)
- [Care Facility Context request schema](schemas/care-facility-context-request.schema.json)
- [Care Facility Context response schema](schemas/care-facility-context-response.schema.json)
- [Care Facility Pickup Verification request schema](schemas/care-facility-pickup-verification-request.schema.json)
- [Care Facility Pickup Verification response schema](schemas/care-facility-pickup-verification-response.schema.json)
- [Care Network Lookup request schema](schemas/care-network-lookup-request.schema.json)
- [Care Network Lookup response schema](schemas/care-network-lookup-response.schema.json)
- [Commerce permission grant example](examples/permission-grant-commerce-context.json)
- [Commerce context request example](examples/commerce-context-request.json)
- [Commerce context partial response example](examples/commerce-context-response.json)
- [Commerce context denied response example](examples/commerce-context-denied-response.json)
- [Care Facility permission grant example](examples/permission-grant-care-facility-boarding-preparation.json)
- [Care Facility context request example](examples/care-facility-boarding-preparation-request.json)
- [Care Facility context partial response example](examples/care-facility-boarding-preparation-response.json)
- [Care Facility facility-mismatch denied response example](examples/care-facility-facility-mismatch-denied-response.json)
- [Care Facility expired service-window denied response example](examples/care-facility-expired-service-window-denied-response.json)
- [Care Facility Pickup Verification permission grant example](examples/permission-grant-care-facility-pickup-verification.json)
- [Care Facility Pickup Verification request example](examples/care-facility-pickup-verification-request.json)
- [Care Facility Pickup Verification allowed response example](examples/care-facility-pickup-verification-response.json)
- [Care Facility Pickup Verification owner-confirmation partial response example](examples/care-facility-pickup-verification-owner-confirmation-response.json)
- [Care Facility Pickup Verification facility-mismatch denied response example](examples/care-facility-pickup-verification-facility-mismatch-denied-response.json)
- [Care Facility Pickup Verification inactive service-window denied response example](examples/care-facility-pickup-verification-inactive-service-window-denied-response.json)
- [Care Network Lookup permission grant example](examples/permission-grant-care-network-lookup.json)
- [Care Network Lookup request example](examples/care-network-lookup-request.json)
- [Care Network Lookup allowed response example](examples/care-network-lookup-response.json)
- [Care Network Lookup contact-withheld partial response example](examples/care-network-lookup-contact-withheld-response.json)
- [Care Network Lookup denied response example](examples/care-network-lookup-denied-response.json)
- [Draft changelog](CHANGELOG.md)
- [Maintainer and contact path](MAINTAINERS.md)
- [Commerce Context OpenAPI adapter](openapi/commerce-context.openapi.json)
- [Commerce Context MCP tool sketches](mcp/commerce-context.tools.json)
- [Care Facility Context OpenAPI adapter](openapi/care-facility-context.openapi.json)
- [Care Facility Context MCP tool sketches](mcp/care-facility-context.tools.json)
- [Care Facility Pickup Verification OpenAPI adapter](openapi/care-facility-pickup-verification.openapi.json)
- [Care Facility Pickup Verification MCP tool sketches](mcp/care-facility-pickup-verification.tools.json)
- [Care Network Lookup OpenAPI adapter](openapi/care-network-lookup.openapi.json)
- [Care Network Lookup MCP tool sketch](mcp/care-network-lookup.tools.json)
- [Commerce Context server implementer guide](docs/implementers/commerce-context-server.md)
- [Care Facility Context server implementer guide](docs/implementers/care-facility-context-server.md)
- [Known compatibility risks](docs/implementers/compatibility-risks.md)
- [Draft threat model](THREAT_MODEL.md)
- [Public launch checklist](docs/launch/public-launch-checklist.md)
- [Announcement copy](docs/launch/announcement.md)
- [Design-partner outreach notes](docs/launch/design-partner-outreach.md)
- [Care Facility design-partner review packet](docs/launch/care-facility-design-partner-review.md)
- [Care Facility feedback triage log](docs/launch/care-facility-feedback-triage.md)
- [Initial issue labels](docs/launch/issue-labels.md)
- [Draft TypeScript package](packages/typescript)
- [Draft Python package](packages/python)
- [Open-source adoption roadmap](docs/design/2026-05-04-ccp-open-source-adoption-roadmap.md)
- [Care Facility Context Profile design draft](docs/design/2026-05-05-care-facility-context-profile.md)
- [Care Facility first schema slice proposal](docs/design/2026-05-05-care-facility-first-schema-slice.md)
- [Care Network Profile design draft](docs/design/2026-05-05-care-network-profile.md)
- [Care Facility Pickup Verification slice proposal](docs/design/2026-05-05-care-facility-pickup-verification-slice.md)
- [Prior art and ecosystem map](docs/design/prior-art-and-ecosystem-map.md)
- [Facility Truth Profile design draft](docs/design/2026-05-05-facility-truth-profile.md)

## Getting Started

Start with the draft specification, then validate the current contract before building against it:

1. Read [SPEC.md](SPEC.md) for the normative protocol concepts, including grants, scopes, purposes, visibility classes, provenance, authorization decisions, and omissions.
2. Review the canonical schemas in [schemas/](schemas/). JSON Schema is the source of truth for this draft.
3. Compare the example flows in [examples/](examples/): permission grants, context requests, partial responses, and denied responses.
4. Run the validation suite from a clean checkout:

   ```sh
   npm install
   npm test
   ```

If you are implementing a Commerce Context server, use [docs/implementers/commerce-context-server.md](docs/implementers/commerce-context-server.md) as the implementation guide. Validate incoming `CommerceContextRequest` objects, authenticate the requester outside the CCP payload, evaluate grants, scopes, purposes, visibility, freshness, and provenance, then validate outgoing `CommerceContextResponse` objects before returning them.

If you are implementing the first Care Facility Context slice, use [docs/implementers/care-facility-context-server.md](docs/implementers/care-facility-context-server.md) as the implementation guide. Validate incoming `CareFacilityContextRequest` objects, authenticate the requester outside the CCP payload, evaluate grants, facility identity, service-window boundaries, scopes, purpose, `facility_shareable` visibility, freshness, and provenance, then validate outgoing `CareFacilityContextResponse` objects before returning them.

If you are implementing the first Care Network lookup slice, validate incoming `CareNetworkLookupRequest` objects, authenticate the requester outside the CCP payload, evaluate grants, subject actor identity, scopes, purpose, `care_network_visible`, `contact_shareable`, and `action_authorization_visible` boundaries, freshness, revocation, and provenance, then validate outgoing `CareNetworkLookupResponse` objects before returning them. The first slice is a lookup for one subject actor, not a full care-network export.

If you are integrating over HTTP, start with [openapi/](openapi/) for Commerce Context, Care Facility Context, Pickup Verification, and Care Network Lookup adapter sketches. If you are integrating with agents or assistant clients, start with [mcp/](mcp/) for the matching tool sketches. Compatibility is based on preserving the canonical CCP semantics, not on copying a specific transport shape.

If you are using helper packages, see [packages/typescript](packages/typescript) for draft TypeScript types and Node-focused AJV validator helpers, and [packages/python](packages/python) for Python schema-loading helpers. These are convenience packages, not production SDKs or normative artifacts. The canonical schemas still win if package helpers and schemas disagree.

Before depending on this draft, read [docs/implementers/compatibility-risks.md](docs/implementers/compatibility-risks.md). CCP is pre-1.0, and draft versions may change incompatibly as the profile and conformance tests are refined.

If you are evaluating whether CCP is credible as a protocol, also read [docs/design/prior-art-and-ecosystem-map.md](docs/design/prior-art-and-ecosystem-map.md) and [THREAT_MODEL.md](THREAT_MODEL.md). They record adjacent standards, ecosystem holders, review gaps, and privacy/security assumptions that must be addressed before CCP should be positioned as more than a draft proposal.

## Validate The Draft

Install dependencies and run the conformance checks:

```sh
npm install
npm test
```

The test suite validates the current positive examples and core `$defs` fixtures, rejects negative fixtures for duplicate scopes, invalid grant lifecycle state, inconsistent response status, provenance gaps, unsafe commerce context fields, unsafe care-facility context fields, and unsafe care-network lookup fields, checks example request/response consistency, verifies OpenAPI external examples, checks MCP tool sketches, scans tracked files for vendor-neutrality regressions, builds/tests the draft TypeScript package, and compiles/tests the draft Python package.

## Design Principles

- Consent first.
- Least privilege.
- Pet-level scope.
- Purpose-bound access.
- Provenance required.
- Transport-neutral contracts.
- Medical caution.
- Machine-readable omissions.

## Contributing

This project is early. The most useful contributions are concrete reviews of the Care Facility boarding-preparation slice, pickup verification, the first Care Network lookup slice, and the Commerce Context Profile, particularly from teams operating or building pet-care facility software:

- Is the boarding-preparation bundle useful for facility intake and stay planning?
- Is the pickup-verification slice safe and complete for facility release workflows?
- Is the Care Network lookup useful without becoming a broad household or contact export?
- Is the commerce-context bundle useful for product filtering or recommendations?
- Are the scope and purpose boundaries clear?
- Are facility identity and service-window boundaries clear enough for implementation?
- Are privacy and safety expectations enforceable?
- Can an implementer build against the schemas without private context?
- Would a future Facility Truth Profile for hours, services, certifications, accepted pets, booking links, freshness, and provenance be valuable for your AI agent or directory product?

Substantial changes to schemas, scopes, visibility classes, profile boundaries, or conformance behavior should be proposed before implementation. See [GOVERNANCE.md](GOVERNANCE.md), [SECURITY.md](SECURITY.md), and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
