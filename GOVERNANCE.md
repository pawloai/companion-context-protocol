# Governance

Status: Draft, pre-1.0

CCP is intended to become a vendor-neutral open specification. Governance is intentionally lightweight while the project is early, but compatibility, consent behavior, profile boundaries, and conformance requirements should be explicit before any stable release.

## Maintainers

Maintainers are responsible for:

- Reviewing specification changes.
- Reviewing schema, example, OpenAPI, MCP, and SDK changes.
- Maintaining conformance tests.
- Managing draft and stable releases.
- Keeping the project vendor-neutral.
- Protecting the privacy, safety, and consent model.

## Decision Process

Early decisions may be made by maintainer consensus in pull requests and issues.

Substantial changes should use a written proposal before implementation, especially when they affect:

- Context object compatibility.
- Scope naming.
- Visibility or consent behavior.
- Authorization decision semantics.
- Omission reason semantics.
- Conformance requirements.
- Profile boundaries.
- Transport adapter compatibility.

Small editorial changes, examples that do not change behavior, and documentation clarifications may be handled directly in pull requests.

## Versioning

The specification uses explicit draft versions for protocol compatibility.

Current version: `0.1.0-draft`

Draft versions may change incompatibly until a stable `1.0` specification is published. Stable releases should identify:

- Supported profiles.
- Canonical schemas.
- Required conformance fixtures.
- Compatible transport adapters.
- Known experimental areas.

SDK packages should use semantic versioning once they contain implementation artifacts.

## Compatibility

Compatibility is validated by conformance tests rather than informal claims.

Current validated surfaces:

- Canonical JSON Schema examples.
- Negative conformance fixtures.
- OpenAPI Commerce Context adapter shape.
- MCP Commerce Context tool sketch shape.
- TypeScript package build and validator smoke tests.

Future compatibility labels may include:

- CCP Commerce Context Profile compatible.
- CCP Vet Export Profile compatible.
- CCP Care Facility Profile compatible.
- CCP OpenAPI Adapter compatible.
- CCP MCP Adapter compatible.

Projects should not claim CCP certification until this repository defines a certification or compatibility badge process.

## Vendor Neutrality

CCP examples and schemas should use synthetic data and vendor-neutral naming. References to first implementations or design partners should not turn the protocol into a private product export format.

Implementation-specific behavior belongs in adapter docs, SDK docs, or implementation docs unless it changes the protocol contract.
