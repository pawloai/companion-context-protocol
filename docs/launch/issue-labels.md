# Initial Issue Labels

Status: Draft

Use these labels for public feedback triage.

| Label | Color | Description |
| --- | --- | --- |
| `needs-triage` | `ededed` | New issue that has not been classified yet. |
| `spec` | `1d76db` | Normative spec, schema, scope, purpose, visibility, or profile behavior. |
| `schema` | `0e8a16` | JSON Schema definitions or validation behavior. |
| `conformance` | `5319e7` | Conformance runner, fixtures, examples, or compatibility checks. |
| `partner-feedback` | `fbca04` | Feedback from a design partner or likely implementer. |
| `documentation` | `0075ca` | README, guides, launch docs, or explanatory text. |
| `adapter` | `c2e0c6` | OpenAPI, MCP, or future transport adapter surfaces. |
| `package` | `bfdadc` | TypeScript, Python, or future package helper surfaces. |
| `privacy-safety` | `d93f0b` | Privacy, consent, minimization, sensitive data, or safety boundary. |
| `good-first-review` | `7057ff` | Small review task suitable for a new contributor. |
| `deferred` | `ffffff` | Valid feedback deferred to a later draft or profile. |
| `non-goal` | `eeeeee` | Request conflicts with current scope or explicit non-goals. |

Suggested setup command:

```sh
gh label create needs-triage --color ededed --description "New issue that has not been classified yet."
gh label create spec --color 1d76db --description "Normative spec, schema, scope, purpose, visibility, or profile behavior."
gh label create schema --color 0e8a16 --description "JSON Schema definitions or validation behavior."
gh label create conformance --color 5319e7 --description "Conformance runner, fixtures, examples, or compatibility checks."
gh label create partner-feedback --color fbca04 --description "Feedback from a design partner or likely implementer."
gh label create documentation --color 0075ca --description "README, guides, launch docs, or explanatory text."
gh label create adapter --color c2e0c6 --description "OpenAPI, MCP, or future transport adapter surfaces."
gh label create package --color bfdadc --description "TypeScript, Python, or future package helper surfaces."
gh label create privacy-safety --color d93f0b --description "Privacy, consent, minimization, sensitive data, or safety boundary."
gh label create good-first-review --color 7057ff --description "Small review task suitable for a new contributor."
gh label create deferred --color ffffff --description "Valid feedback deferred to a later draft or profile."
gh label create non-goal --color eeeeee --description "Request conflicts with current scope or explicit non-goals."
```
