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

Cross-profile inference is a residual risk CCP does not fully prevent and does not promise to eliminate by `1.0`. Visibility precedence rules prevent many single-response leaks, but they do not prevent a requester who holds grants for more than one profile — or who makes repeated calls within a single profile — from correlating omissions, partial responses, freshness timestamps, and summaries across calls to reconstruct restricted context that no single response would have disclosed. The canonical schemas cannot detect cross-call correlation; only the authorization layer can. The stable line is expected to ship with this risk surface acknowledged rather than closed; ongoing work narrows it, not closes it.

### Mitigations required today

`SPEC.md` Conformance Requirements state normatively that servers MUST NOT rely on per-profile narrowness alone, and that servers granting multi-profile (or repeat single-profile) access for the same requester SHOULD apply per-requester rate limits across all authorized profiles, correlation-aware authorization logging with enough metadata for retrospective abuse review, and per-request minimization (return only fields the declared purpose needs, even when granted scopes would allow more). In addition, compatible servers should:

- Keep each profile narrow and purpose-bound.
- Require machine-readable omissions without restricted source content.
- Avoid raw free-text details in denial reasons.
- Treat cross-profile access as a policy decision, not a schema-only decision.
- Treat cross-profile access for the same requester as a higher-scrutiny authorization decision rather than the union of independent per-profile decisions.

These mitigations are necessary but not sufficient. They reduce the inference surface; they do not eliminate it.

### Sub-decisions under ongoing research

Stronger guidance is under ongoing research and tracked in GitHub issue #7. The candidate sub-decisions and primitives below are documented so that implementers know what shape future-draft work could take; none are endorsed in `0.1.0-draft`, and adoption is not a precondition for the stable line. Four sub-decisions remain open:

- **Correlation identifier** — whether requests carry a standard cross-profile correlation field (candidate names: `correlation_token`, `requester_session_id`, `abuse_review_id`) that lets independent profile servers operated by different teams join authorization records into a shared abuse-review pipeline without bilateral coordination, or whether each integrator invents its own join key.
- **Per-requester rate-limit envelope** — whether a future draft defines a minimum rate-limit and back-off contract across authorized profiles for the same requester, or leaves the envelope to deployment policy. The trade-off is interop predictability versus deployment freedom on systems with very different traffic profiles.
- **Per-request minimization guidance** — whether a future draft tightens "return only fields the purpose needs" from a `SHOULD` into machine-checkable behavior (e.g., per-purpose minimum-required-field tables, or a `minimization_profile` field), or leaves it as policy.
- **Profile-combination policy** — whether a future draft adds explicit rules for what a single requester is allowed to hold grants for simultaneously (e.g., disallow holding a commerce grant and a care-facility grant for the same pet under the same requester identity without a higher-trust attestation), or treats profile combinations as wholly a deployment decision.

### Candidate primitives under evaluation

None of the following are endorsed in `0.1.0-draft`. They are listed so implementers can recognize the shape of future-draft work, not as a roadmap commitment:

- **Standard optional `correlation_token` request field** — a low-surface addition: each profile request schema gains one optional opaque-string field that profile servers MAY log alongside authorization decisions. Cheap to specify and adopt; does not by itself enforce rate limits or minimization, and creates a new privacy surface if the token is owner-derived rather than requester-derived. Binding properties differ sharply by who assigns the token. A *client-assigned* token carries no server-side binding: a malicious requester can omit, rotate, or forge it to defeat cross-call correlation in audit logs. A *server-assigned* token (server-generated identifier returned in the response that the client must echo on subsequent calls) avoids the forgery surface but still admits short-window correlation evasion if the client rotates tokens between calls. Any future-draft design that adopts `correlation_token` should treat the server's own authenticated-principal identity as the authoritative join key and treat the token as an optional additional signal, never as the primary identifier; the client-assigned warning above applies to the client-assigned shape specifically.
- **Per-requester rate-limit headers** (e.g., `CCP-Requester-Quota-Remaining`, `CCP-Requester-Quota-Window`) — gives clients backpressure signals across profiles, but lives at the transport layer (HTTP/MCP) rather than in the canonical contract, and depends on the rate-limit envelope decision above.
- **Server-internal correlation join (no protocol change)** — each deployment correlates by its own infrastructure (authenticated principal, IP, fingerprint). Zero protocol surface, zero standardization, and cross-organization abuse review remains unsolved.
- **Hybrid** — optional `correlation_token` for cross-organization joins plus rate-limit headers for backpressure; leaves minimization and profile-combination policy to a later draft. Largest surface to specify and adopt, but covers two of the four gaps.

A worked synthetic attack-and-defense example lives in `docs/implementers/cross-profile-inference.md`.

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
