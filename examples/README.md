# Examples

End-to-end request and response examples live here.

The current examples demonstrate the Commerce Context Profile, the Care Facility boarding-preparation and pickup-verification slices, and the first Care Network lookup slice.

Commerce Context flow:

1. Owner grants commerce-safe access.
2. Client requests pet context for product recommendation.
3. Server returns an authorization decision.
4. Server returns minimized context with visibility and provenance.
5. Restricted, ungranted, or non-commerce-safe fields are omitted with machine-readable reasons.

Care Facility Context flow:

1. Owner grants boarding-preparation access to a facility for one pet and service window.
2. Facility requests care context for boarding preparation.
3. Server returns an authorization decision.
4. Server returns minimized care context with `facility_shareable` visibility and provenance.
5. Facility-mismatch or expired service-window requests are denied without returning context.

Care Network Lookup flow:

1. Owner grants care-network lookup access for one pet and optional service window.
2. Requester asks about one `subject_actor_id`.
3. Server returns only the actor, relationship, allowed contact channel, action authorization, or revocation subset allowed by the grant.
4. Contact channels and action authority are evaluated separately.
5. Denied responses return no care-network context.

Current examples:

- `permission-grant-commerce-context.json`
- `commerce-context-request.json`
- `commerce-context-response.json`: partial response with returned context and omissions.
- `commerce-context-denied-response.json`
- `permission-grant-care-facility-boarding-preparation.json`
- `care-facility-boarding-preparation-request.json`
- `care-facility-boarding-preparation-response.json`: partial response with returned context and omissions.
- `care-facility-facility-mismatch-denied-response.json`
- `care-facility-expired-service-window-denied-response.json`
- `permission-grant-care-facility-pickup-verification.json`
- `care-facility-pickup-verification-request.json`
- `care-facility-pickup-verification-response.json`
- `care-facility-pickup-verification-owner-confirmation-response.json`
- `care-facility-pickup-verification-facility-mismatch-denied-response.json`
- `care-facility-pickup-verification-inactive-service-window-denied-response.json`
- `permission-grant-care-network-lookup.json`
- `care-network-lookup-request.json`
- `care-network-lookup-response.json`
- `care-network-lookup-contact-withheld-response.json`
- `care-network-lookup-denied-response.json`

These examples are validated by the conformance runner:

```sh
npm test
```
