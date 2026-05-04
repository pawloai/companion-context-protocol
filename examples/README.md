# Examples

End-to-end request and response examples live here.

The current examples demonstrate the Commerce Context Profile:

1. Owner grants commerce-safe access.
2. Client requests pet context for product recommendation.
3. Server returns an authorization decision.
4. Server returns minimized context with visibility and provenance.
5. Restricted, ungranted, or non-commerce-safe fields are omitted with machine-readable reasons.

Current examples:

- `permission-grant-commerce-context.json`
- `commerce-context-request.json`
- `commerce-context-response.json`: partial response with returned context and omissions.
- `commerce-context-denied-response.json`

These examples are validated by the conformance runner:

```sh
npm test
```
