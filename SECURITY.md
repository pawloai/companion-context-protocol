# Security Policy

CCP deals with sensitive pet, owner, caregiver, facility, commerce, and potentially wellness-related context. Security and privacy issues should be handled carefully even while the specification is still a draft.

## Supported Versions

CCP is currently pre-1.0. The only supported line is the current draft on `main`.

Draft versions may change incompatibly. Security-relevant clarifications may be made without preserving compatibility with earlier draft examples.

## Reporting Security Issues

Do not report suspected vulnerabilities, privacy leaks, or consent-bypass issues in public issues.

Report concerns privately to the project maintainers.

Preferred reporting path:

1. Use GitHub private vulnerability reporting for this repository when it is enabled.
2. If private vulnerability reporting is not available, contact a maintainer through an existing private channel.
3. If no private channel is available, open a public issue requesting a private security contact, but do not include vulnerability details, private data, reproduction steps, or exploit information in that issue.

Include the following details only in the private report:

- A short description of the issue.
- Affected files, schema objects, examples, or protocol flows.
- Steps to reproduce or validate the issue.
- The privacy, consent, safety, or interoperability impact.
- Any suggested mitigation.

Maintainers should acknowledge credible reports within 7 days and provide an initial assessment within 30 days when practical.

## Security Design Priorities

- Consent enforcement.
- Least-privilege context access.
- Purpose-bound requests.
- Visibility-class enforcement.
- Revocable grants.
- Auditable access decisions.
- Provenance for returned facts and summaries.
- Omission of restricted data by default.
- Clear denial and partial-response semantics.

## Sensitive Data Guidance

Do not include real customer, owner, caregiver, staff, facility, pet, billing, medical, or household data in issues, pull requests, examples, tests, screenshots, or design discussions.

Use synthetic identifiers and synthetic pet context in all public artifacts.

## Out Of Scope For The Protocol

CCP defines interoperability semantics and conformance expectations. Implementations remain responsible for:

- Authentication.
- Authorization infrastructure.
- Storage security.
- Transport security.
- Secret management.
- Audit log retention.
- Payment security.
- Legal and regulatory compliance.

## Disclosure

The project may publish security advisories for issues that affect the specification, examples, schemas, conformance tests, or reference implementations. Reporters will be credited when appropriate and when they consent to attribution.
