# Facility Truth Profile Design

Date: 2026-05-05

Status: Superseded by v1 schema-backed profile — see the Facility Truth Profile section in `SPEC.md` and the implementer guide at `docs/implementers/facility-truth-server.md`. The v1 schema-backed profile in `schemas/facility-truth-request.schema.json` and `schemas/facility-truth-response.schema.json` is the normative source. The body of this draft is retained as historical design context.

## Design Status

Facility Truth is a candidate CCP profile for public or operational facts about a facility, not pet-specific private context. It has no schema, examples, adapter sketches, or conformance tests yet.

This profile should not be treated as implementable until design partners validate the field set and a later proposal adds canonical schemas and tests.

## Purpose

The Facility Truth Profile should let authorized or public clients retrieve fresh, provenance-backed facts about a pet-care facility so agents and partner applications do not invent or stale-cache operational details.

The target problem is facility accuracy, such as wrong hours, outdated services, unsupported pet types, stale contact methods, unavailable booking links, or unverified certifications.

This profile is separate from Care Facility Context:

- Facility Truth describes the facility.
- Care Facility Context describes one pet's context for a facility workflow.

## Candidate Use Cases

### Agent answer grounding

An agent asks for a facility's current hours, service offerings, accepted pet types, service areas, and booking method before answering an owner.

### Booking eligibility preflight

A booking or marketplace client checks whether a facility offers a requested service, accepts the pet type or size class, and has stated eligibility constraints before starting a booking flow.

### Certification or policy display

A client retrieves facility-provided certifications, insurance statements, vaccination policy summaries, cancellation rules, or intake requirements with provenance and freshness metadata.

### Listing freshness check

A directory or assistant client checks whether cached facility facts are stale and should be refreshed or omitted.

## Candidate Purposes

Purpose names are draft candidates:

- `facility_truth_lookup`
- `facility_hours_lookup`
- `facility_services_lookup`
- `facility_booking_preflight`
- `facility_policy_lookup`

Purpose strings should stay narrow enough for policy and caching rules to behave predictably.

## Candidate Scopes

Public or low-risk scopes:

- `facility.profile.read`
- `facility.hours.read`
- `facility.services.read`
- `facility.contact_methods.read`
- `facility.service_area.read`
- `facility.acceptance_criteria.read`
- `facility.booking_links.read`
- `facility.policies.summary.read`

Higher-scrutiny scopes:

- `facility.certifications.read`
- `facility.insurance_statements.read`
- `facility.capacity_status.read`
- `facility.staff_credentials.summary.read`

Deferred or separate concerns:

- Internal staffing schedules.
- Internal capacity forecasts.
- Private incident history.
- Customer lists.
- Pet-specific booking records.
- Payment terms beyond public policy summaries.
- Facility operations data marked staff-only or restricted.

## Candidate Context Object

Object names are design candidates, not schema commitments.

### `FacilityTruthContext`

Candidate fields:

- `facility_id`
- `display_name`
- `legal_name`
- `facility_type`
- `locations`
- `hours`
- `holiday_hours`
- `services`
- `accepted_pet_types`
- `size_or_breed_constraints`
- `service_area`
- `contact_methods`
- `booking_methods`
- `certifications`
- `insurance_statements`
- `policy_summaries`
- `last_verified_at`
- `metadata`

Every returned fact should carry provenance and freshness metadata. Public facts can still become harmful when stale, so freshness is part of safety.

### `FacilityHours`

Candidate fields:

- Regular weekly hours.
- Holiday or exception hours.
- Emergency or after-hours availability.
- Time zone.
- Last verified time.
- Source and confidence.

### `FacilityService`

Candidate fields:

- Service type.
- Public display name.
- Species or pet types accepted.
- Size, temperament, vaccination, age, or breed constraints where applicable.
- Booking availability statement.
- Required intake steps.
- Whether the service is currently offered.

### `FacilityPolicySummary`

Candidate fields:

- Vaccination requirements.
- Cancellation policy summary.
- Drop-off and pickup windows.
- Late pickup policy summary.
- Medication handling availability statement.
- Emergency escalation policy summary.
- Required forms or waivers.

Policy summaries should avoid private staff notes, internal procedures, and unsupported legal conclusions.

## Visibility And Authorization

Facility Truth may include public facts and partner-only facts. It should still use explicit visibility classes rather than assuming all facility data is public.

Candidate visibility classes:

- `facility_public`
- `facility_partner_visible`
- `facility_verified_public`
- `facility_restricted_operations`

Deny-oriented classes such as `staff_only` and `restricted_sensitive` should take precedence over any Facility Truth allow class.

## Omission Behavior

Facility Truth should use machine-readable omissions when a requested fact is unavailable, stale, restricted, unverified, or not applicable.

Likely omission reasons:

- `not_available`
- `source_stale`
- `not_verified`
- `visibility_restricted`
- `scope_missing`
- `purpose_not_allowed`
- `not_applicable`

An agent should prefer omission over invention when a facility fact is stale or unavailable.

## Safety Boundary

Facility Truth should not expose:

- Pet records.
- Customer records.
- Staff schedules.
- Internal facility notes.
- Internal capacity models.
- Private incident records.
- Billing records.
- Payment instruments.
- Identity documents.
- Medical or diagnostic records.
- Broad operational data that could create facility safety or security risk.

## Design Partner Questions

Ask facility operators, facility software builders, booking systems, listing providers, and agent builders:

- Which public facility facts are most often stale or hallucinated?
- Which facts must be fresh before an agent answers?
- Which facts can be public, partner-visible, or restricted?
- Which service constraints are needed for booking preflight?
- How should certifications, insurance statements, and policy summaries be represented without overclaiming?
- What provenance source is credible for each fact?
- How should stale facts be omitted or marked?
- Would this profile be more immediately implementable than pet-specific commerce context?

## Next Step

Run discovery review before schema work. If multiple likely implementers validate the use case, add a schema-backed first slice that covers facility profile, hours, services, contact methods, booking methods, acceptance criteria, freshness, provenance, and omissions.

