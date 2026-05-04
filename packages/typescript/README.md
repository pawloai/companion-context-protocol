# TypeScript Package

Draft TypeScript helpers for CCP implementers live here.

Status: Draft helper package, pre-1.0

This package is intentionally small. It provides hand-written TypeScript types for the Commerce Context Profile plus AJV validator helpers that load packaged copies of the canonical JSON Schemas.

## Current Exports

- `CommerceContextRequest`
- `CommerceContextResponse`
- `PermissionGrant`
- `AuthorizationDecision`
- `Omission`
- `ContextProvenance`
- `PetProfile`
- `DietProfile`
- `PurchaseHistorySummary`
- `CommercePetProfile`
- `CommerceDietProfile`
- `CommercePurchaseHistorySummary`
- `VisibilityClass`
- `Scope`
- `Purpose`
- `createCcpAjv`
- `createCommerceContextRequestValidator`
- `createCommerceContextResponseValidator`
- `createPermissionGrantValidator`
- `createCcpValidators`

## Build

From the repository root:

```sh
npm install
npm run test:typescript
```

The TypeScript test builds this package, confirms the packaged schemas match the canonical repository schemas, and validates the repository's current positive and negative fixtures through the exported validator helpers.

## Compatibility

The canonical JSON Schemas remain the source of truth. If these hand-written types drift from `../../schemas/ccp-core.schema.json`, the schemas win.

Future work may replace these hand-written types with generated types.
