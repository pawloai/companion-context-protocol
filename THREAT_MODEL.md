# Threat Model

Status: Draft, pre-1.0

This document describes the security and privacy assumptions behind the current CCP draft. It is not a certification claim, complete risk assessment, or substitute for an implementer's own threat model.

## Assets

CCP is designed to protect:

- Pet-specific context such as profile facts, care instructions, allergies, sensitivities, pickup authorization, and care-network relationships.
- Restricted context that must not leak through profile responses, including staff-only notes, billing data, payment authority, identity-document copies, diagnosis history, treatment history, wellness timelines outside the active profile boundary, household exports, and unrelated contacts.
- Consent and authorization state, including grants, expiration, revocation, facility boundaries, service-window boundaries, and purpose restrictions.
- Provenance and freshness metadata used by clients to decide whether returned facts are trustworthy enough for the requested task.

## Trust Boundaries

The current draft assumes these boundaries:

- CCP payload validation is separate from transport authentication. HTTP bearer tokens, MCP client identity, session authentication, and service credentials are implementation-specific.
- A CCP server is responsible for evaluating requester identity, grant state, purpose, scopes, visibility classes, freshness, and profile boundaries before returning any context.
- A CCP client is responsible for honoring omissions and denial responses rather than treating missing context as permission to infer or ask another profile without authorization.
- Adapter sketches are illustrative. Compatibility depends on preserving canonical JSON Schema semantics and authorization behavior, not on using a specific HTTP path, header, or MCP tool shape.

## In Scope

The draft is intended to reduce these risks:

- Accidental over-disclosure by returning broad pet records when only a narrow task-specific bundle was requested.
- Cross-profile leakage caused by treating one profile's visibility class as valid for another profile.
- Silent denial or silent omission that leaves agent clients unable to decide whether to retry, request a new grant, or fall back.
- Stale or unprovenanced facts being presented as current operational truth.
- Free-text omission details or authorization reasons leaking restricted source content.
- Facility or service-window mismatch in care-facility workflows.

## Out Of Scope For This Draft

The current draft does not yet define:

- How grants are issued, stored, transmitted, signed, or revoked across systems.
- A standard authentication, token introspection, or client attestation mechanism.
- A complete OAuth, JWT, UCAN, GNAP, or Verifiable Credential profile.
- A universal identity model for owners, caregivers, facilities, merchants, agent clients, or automated delegates.
- Cryptographic proof that a requester is acting on behalf of an owner or facility.
- A complete inference-control system across multiple authorized profile calls.
- Audit-log retention, breach notification, or regulatory compliance requirements.

Implementers must address these items in their own deployment architecture until the draft defines them or explicitly adopts an existing primitive.

## Actor Risks

The term `Actor` currently covers people, organizations, systems, agents, and services. These have different trust postures:

- An owner acting directly can grant or revoke access for a pet, subject to future multi-owner and custody rules.
- A caregiver may have delegated task-specific authority but should not be treated as a full owner.
- A facility or merchant is an organization with its own staff, systems, and internal access controls.
- An agent client may act on behalf of a person or organization but can also amplify leakage by retrying, summarizing, or combining responses.
- A service integration may have machine credentials but still needs purpose, grant, and recipient-bound authorization.

Future drafts should add more explicit actor typing or delegation semantics if design partners need interoperable policy decisions across these roles.

## Grant Risks

`PermissionGrant` is a schema-backed authorization record, but grant transport and proof are intentionally not standardized yet. This creates interoperability risk:

- Two systems may both validate the same grant shape while disagreeing about who issued it, where it is stored, or whether it has been revoked.
- A requester may present a stale or copied grant unless the server checks current grant state.
- A client may assume possession of a `grant_id` is sufficient authority; it is not.
- Revocation propagation may be delayed if grant state is cached or distributed without a freshness rule.

Until this is specified, compatible servers should treat grant identifiers as lookup keys into trusted authorization state, not bearer secrets, and should fail closed when grant status, issuer authority, subject pet, requester, purpose, scope, facility boundary, or service window cannot be verified.

The unresolved sub-decisions (issuance, storage, possession, revocation propagation) and the candidate primitives under evaluation are catalogued in `docs/implementers/compatibility-risks.md` §Decisions Needed Before 1.0. The decision is tracked in GitHub issue #6. Facility Truth v1 does not require a `PermissionGrant`, so this decision does not gate Facility Truth adoption, but it must resolve before Commerce Context, Care Facility Context, or Care Network Lookup can interoperate across organizations.

## Cross-Profile Inference

Visibility precedence rules prevent many single-response leaks, but they do not fully prevent inference across multiple authorized calls. For example, a requester with separate commerce and care-facility grants could compare omissions, partial responses, timestamps, or summaries to infer restricted context.

Current mitigations are:

- Keep each profile narrow and purpose-bound.
- Require machine-readable omissions without restricted source content.
- Avoid raw free-text details in denial reasons.
- Treat cross-profile access as a policy decision, not a schema-only decision.
- Log authorization decisions with enough metadata for abuse review.

These mitigations are necessary but not sufficient. `SPEC.md` Conformance Requirements now state normatively that servers MUST NOT rely on per-profile narrowness alone, and that servers granting multi-profile (or repeat single-profile) access for the same requester SHOULD apply per-requester rate limits across profiles, correlation-aware authorization logging, and per-request minimization. The canonical schemas cannot detect cross-call correlation; only the authorization layer can.

Stronger guidance — a standard correlation identifier, a rate-limit envelope, machine-checkable minimization, and profile-combination policy — is a future-draft agenda item tracked in GitHub issue #7. The unresolved sub-decisions and the candidate primitives under evaluation (standard optional `correlation_token`, per-requester rate-limit headers, server-internal join, hybrid) are catalogued in `docs/implementers/compatibility-risks.md` §Decisions Needed Before 1.0 §Cross-profile inference controls. A worked synthetic attack-and-defense example lives in `docs/implementers/cross-profile-inference.md`. None of the candidate primitives are endorsed in `0.1.0-draft`.

## Facility Truth Risks

Facility Truth covers mostly public operational facts, but public-by-nature does not mean risk-free. Incorrect hours, stale service eligibility, invented certifications, or outdated booking methods can still harm facilities and clients.

The v1 Facility Truth profile ships only public-fact scopes (`facility.profile.read`, `facility.hours.read`, `facility.services.read`, `facility.contact_methods.read`, `facility.service_area.read`, `facility.acceptance_criteria.read`, `facility.booking_methods.read`, `facility.policies.summary.read`) and does not require a `PermissionGrant`. Removing the grant requirement removes the issuer-binding control surface for these scopes; the freshness contract carries its safety load instead. Every returned Facility Truth field's provenance MUST carry `verified_at`, and stale facts MUST be omitted with `source_stale` rather than returned. Unverified facts MUST be omitted with `not_verified` rather than guessed. The "facility-public" rule and the no-`pet_id` subject-boundary rule are enforced by the canonical schemas and conformance runner.

Higher-scrutiny facility scopes — certifications, insurance statements, capacity status, staff credentials — are deferred to a future partner-only Facility Truth slice with its own scopes, purpose rules, `facility_partner_visible` visibility class, and grant shape (likely an additive `subject_facility_id` on `PermissionGrant`). v1 implementers MUST NOT assume the v1 no-grant semantics generalize to those future scopes.

Cross-facility inference is a residual risk: a requester enumerating many `facility_id` values in succession can build behavioural signals (which facilities exist, which scopes are denied, when a facility last verified) even when each individual response is correctly minimized. Implementations should rate-limit, log, and review enumeration patterns outside the canonical schema layer.

## Security Review Questions

Design partners should review:

- Who is authorized to issue, revoke, and inspect grants?
- How does the server prove the requester is the intended grantee?
- How quickly must revocation take effect?
- Which actor types are present in the deployment?
- Can a client combine multiple profile responses to infer restricted context?
- Are omission details and authorization reasons safe to show to the requester?
- What audit records are needed to investigate misuse?
