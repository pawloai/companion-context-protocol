# Examples

End-to-end request and response examples live here.

The current examples demonstrate the Commerce Context Profile and the first Care Facility Context boarding-preparation slice.

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

These examples are validated by the conformance runner:

```sh
npm test
```
