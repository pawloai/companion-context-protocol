# Companion Context Protocol

Companion Context Protocol (CCP) is a draft open specification for permissioned companion-animal context exchange.

CCP defines how pet care, commerce, and agent systems can request only the pet context needed for a specific task, with consent, purpose limits, provenance, visibility classes, and machine-readable omissions.

## Status

Status: Draft, pre-1.0

This repository is ready for design-partner review, but it should not yet be treated as a stable standard. Draft versions may change incompatibly while the first profile, schema contract, and conformance tests are refined.

The first profile is the Commerce Context Profile, focused on product recommendations and filtering without exposing unrelated staff notes, wellness timelines, diagnosis or treatment history, billing data, household data, or sensitive facility operations data.

## What CCP Defines

- Transport-neutral JSON object contracts.
- Permission grants scoped to pets, purposes, and time windows.
- Commerce-safe context bundles.
- Visibility classes for returned facts and summaries.
- Provenance metadata for returned context.
- Authorization decisions for allowed, partial, and denied responses.
- Machine-readable omissions for data that was not returned.
- Conformance expectations for compatible implementations.

CCP is not a database schema, product catalog, recommendation engine, payment protocol, medical diagnosis protocol, or identity system.

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
- [Commerce permission grant example](examples/permission-grant-commerce-context.json)
- [Commerce context request example](examples/commerce-context-request.json)
- [Commerce context partial response example](examples/commerce-context-response.json)
- [Commerce context denied response example](examples/commerce-context-denied-response.json)
- [Draft changelog](CHANGELOG.md)
- [Maintainer and contact path](MAINTAINERS.md)
- [Commerce Context OpenAPI adapter](openapi/commerce-context.openapi.json)
- [Commerce Context MCP tool sketches](mcp/commerce-context.tools.json)
- [Commerce Context server implementer guide](docs/implementers/commerce-context-server.md)
- [Known compatibility risks](docs/implementers/compatibility-risks.md)
- [Public launch checklist](docs/launch/public-launch-checklist.md)
- [Announcement copy](docs/launch/announcement.md)
- [Design-partner outreach notes](docs/launch/design-partner-outreach.md)
- [Initial issue labels](docs/launch/issue-labels.md)
- [Draft TypeScript package](packages/typescript)
- [Draft Python package](packages/python)
- [Open-source adoption roadmap](docs/design/2026-05-04-ccp-open-source-adoption-roadmap.md)
- [Care Facility Context Profile design draft](docs/design/2026-05-05-care-facility-context-profile.md)
- [Care Facility first schema slice proposal](docs/design/2026-05-05-care-facility-first-schema-slice.md)

## Getting Started

Start with the draft specification, then validate the current contract before building against it:

1. Read [SPEC.md](SPEC.md) for the normative protocol concepts, including grants, scopes, purposes, visibility classes, provenance, authorization decisions, and omissions.
2. Review the canonical schemas in [schemas/](schemas/). JSON Schema is the source of truth for this draft.
3. Compare the example flow in [examples/](examples/): permission grant, commerce context request, partial response, and denied response.
4. Run the validation suite from a clean checkout:

   ```sh
   npm install
   npm test
   ```

If you are implementing a Commerce Context server, use [docs/implementers/commerce-context-server.md](docs/implementers/commerce-context-server.md) as the implementation guide. Validate incoming `CommerceContextRequest` objects, authenticate the requester outside the CCP payload, evaluate grants, scopes, purposes, visibility, freshness, and provenance, then validate outgoing `CommerceContextResponse` objects before returning them.

If you are integrating over HTTP, start with [openapi/commerce-context.openapi.json](openapi/commerce-context.openapi.json). If you are integrating with agents or assistant clients, start with [mcp/commerce-context.tools.json](mcp/commerce-context.tools.json). These are adapter sketches; compatibility is based on preserving the canonical CCP semantics, not on copying a specific transport shape.

If you are using helper packages, see [packages/typescript](packages/typescript) for TypeScript types and AJV validator helpers, and [packages/python](packages/python) for Python schema-loading helpers. The canonical schemas still win if package helpers and schemas disagree.

Before depending on this draft, read [docs/implementers/compatibility-risks.md](docs/implementers/compatibility-risks.md). CCP is pre-1.0, and draft versions may change incompatibly as the profile and conformance tests are refined.

## Validate The Draft

Install dependencies and run the conformance checks:

```sh
npm install
npm test
```

The test suite validates the current positive examples and core `$defs` fixtures, rejects negative fixtures for duplicate scopes, invalid grant lifecycle state, inconsistent response status, provenance gaps, and non-commerce-safe commerce context fields, checks example request/response consistency, verifies OpenAPI external examples, checks MCP tool sketches, scans tracked files for vendor-neutrality regressions, builds/tests the draft TypeScript package, and compiles/tests the draft Python package.

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

This project is early. The most useful contributions are concrete reviews of the Commerce Context Profile:

- Is the context bundle useful for product filtering or recommendations?
- Are the scope and purpose boundaries clear?
- Are privacy and safety expectations enforceable?
- Can an implementer build against the schemas without private context?

Substantial changes to schemas, scopes, visibility classes, profile boundaries, or conformance behavior should be proposed before implementation. See [GOVERNANCE.md](GOVERNANCE.md), [SECURITY.md](SECURITY.md), and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
