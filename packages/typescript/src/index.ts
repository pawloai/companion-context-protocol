import fs from "node:fs";
import { createRequire } from "node:module";
import type { Ajv2020 as Ajv2020Instance, AnySchemaObject, ValidateFunction } from "ajv/dist/2020.js";
import type { FormatsPlugin } from "ajv-formats";

const require = createRequire(import.meta.url);
const Ajv2020 = require("ajv/dist/2020.js").default as typeof import("ajv/dist/2020.js").default;
const addFormats = require("ajv-formats") as FormatsPlugin;

export const CCP_VERSION = "0.1.0-draft" as const;

export type VisibilityClass =
  | "owner_visible"
  | "caregiver_visible"
  | "staff_only"
  | "vet_shareable"
  | "commerce_safe"
  | "agent_summary_only"
  | "restricted_sensitive";

export type Scope =
  | "pet.profile.read"
  | "pet.diet.read"
  | "pet.commerce_context.read"
  | "pet.permission_grants.read"
  | "pet.product_exclusions.read"
  | "pet.preferences.read"
  | "pet.purchase_history.summary.read";

export type Purpose = "product_recommendation" | "product_filtering";

export type OmissionReasonCode =
  | "not_requested"
  | "scope_missing"
  | "purpose_not_allowed"
  | "visibility_restricted"
  | "grant_expired"
  | "grant_revoked"
  | "source_stale"
  | "not_available"
  | "summary_only";

export type SourceType =
  | "owner_entered"
  | "caregiver_entered"
  | "staff_observed"
  | "vet_verified"
  | "imported"
  | "inferred"
  | "generated";

export interface ContextProvenance {
  source_type: SourceType;
  source_actor_id?: string;
  source_system?: string;
  recorded_at: string;
  verified_at?: string;
  confidence?: number;
  stale_after?: string;
  source_record_ref?: string;
  derived_from?: string[];
}

export interface FieldEnvelope<T> {
  value: T;
  visibility: VisibilityClass[];
  provenance: ContextProvenance;
}

export interface ObjectMetadata {
  visibility: VisibilityClass[];
  provenance: ContextProvenance;
}

export interface Weight {
  value: number;
  unit: "lb" | "kg";
}

export type Species = "dog" | "cat" | "other";
export type Sex = "female" | "male" | "unknown";
export type LifeStage = "puppy" | "kitten" | "adult" | "senior" | "unknown";
export type SizeClass = "toy" | "small" | "medium" | "large" | "giant" | "unknown";

export interface PetProfile {
  pet_id: string;
  display_name: FieldEnvelope<string>;
  species: FieldEnvelope<Species>;
  breed?: FieldEnvelope<string>;
  breed_mix?: FieldEnvelope<boolean>;
  sex?: FieldEnvelope<Sex>;
  age_years?: FieldEnvelope<number>;
  life_stage: FieldEnvelope<LifeStage>;
  weight?: FieldEnvelope<Weight>;
  size_class: FieldEnvelope<SizeClass>;
  metadata: ObjectMetadata;
}

export interface DietProfile {
  diet_profile_id: string;
  pet_id: string;
  food_brands?: FieldEnvelope<string[]>;
  proteins?: FieldEnvelope<string[]>;
  feeding_schedule?: FieldEnvelope<string>;
  allergies: FieldEnvelope<string[]>;
  sensitivities: FieldEnvelope<string[]>;
  treats_allowed?: FieldEnvelope<boolean>;
  product_exclusions: FieldEnvelope<string[]>;
  owner_notes_summary?: FieldEnvelope<string>;
  metadata: ObjectMetadata;
}

export interface PurchaseHistorySummary {
  last_purchase_at?: FieldEnvelope<string>;
  preferred_categories?: FieldEnvelope<string[]>;
  metadata: ObjectMetadata;
}

export interface CommercePetProfile {
  pet_id: string;
  display_name?: FieldEnvelope<string>;
  species?: FieldEnvelope<Species>;
  breed?: FieldEnvelope<string>;
  breed_mix?: FieldEnvelope<boolean>;
  sex?: FieldEnvelope<Sex>;
  age_years?: FieldEnvelope<number>;
  life_stage?: FieldEnvelope<LifeStage>;
  weight?: FieldEnvelope<Weight>;
  size_class?: FieldEnvelope<SizeClass>;
  metadata: ObjectMetadata;
}

export interface CommerceDietProfile {
  diet_profile_id: string;
  pet_id: string;
  food_brands?: FieldEnvelope<string[]>;
  proteins?: FieldEnvelope<string[]>;
  feeding_schedule?: FieldEnvelope<string>;
  allergies?: FieldEnvelope<string[]>;
  sensitivities?: FieldEnvelope<string[]>;
  treats_allowed?: FieldEnvelope<boolean>;
  product_exclusions?: FieldEnvelope<string[]>;
  owner_notes_summary?: FieldEnvelope<string>;
  metadata: ObjectMetadata;
}

export interface CommercePurchaseHistorySummary {
  last_purchase_at?: FieldEnvelope<string>;
  preferred_categories?: FieldEnvelope<string[]>;
  metadata: ObjectMetadata;
}

export interface CommerceContext {
  pet_id: string;
  purpose: Purpose;
  pet_profile?: CommercePetProfile;
  diet_profile?: CommerceDietProfile;
  preferences?: FieldEnvelope<string[]>;
  purchase_history_summary?: CommercePurchaseHistorySummary;
  metadata: ObjectMetadata;
}

export interface PermissionGrant {
  grant_id: string;
  subject_pet_id: string;
  grantor_actor_id: string;
  grantee_actor_id: string;
  scopes: Scope[];
  purposes: Purpose[];
  expires_at?: string;
  status: "active" | "expired" | "revoked";
  created_at: string;
  revoked_at?: string;
}

export interface AuthorizationDecision {
  decision: "allowed" | "partial" | "denied";
  evaluated_at: string;
  requester_actor_id: string;
  pet_id: string;
  purpose: Purpose;
  grant_id?: string;
  applied_scopes: Scope[];
  denied_scopes: Scope[];
  reasons: string[];
}

export interface Omission {
  field: string;
  reason: OmissionReasonCode;
  visibility_class?: VisibilityClass;
  required_scope?: Scope;
  detail?: string;
}

export interface CommerceContextRequest {
  request_id: string;
  requester_actor_id: string;
  pet_id: string;
  purpose: Purpose;
  scopes: Scope[];
  grant_id?: string;
}

export interface CommerceContextResponse {
  request_id: string;
  status: "ok" | "partial" | "denied";
  authorization_decision: AuthorizationDecision;
  commerce_context: CommerceContext | null;
  omissions: Omission[];
}

const schemaRoot = new URL("./schemas/", import.meta.url);

const readJson = (relativePath: string): AnySchemaObject => {
  const filename = relativePath.split("/").at(-1);
  if (!filename) {
    throw new Error(`Invalid schema path: ${relativePath}`);
  }

  return JSON.parse(fs.readFileSync(new URL(filename, schemaRoot), "utf8")) as AnySchemaObject;
};

const CORE_SCHEMA_KEY = "ccp-core.schema.json";

export const schemaPaths = {
  core: "schemas/ccp-core.schema.json",
  commerceContextRequest: "schemas/commerce-context-request.schema.json",
  commerceContextResponse: "schemas/commerce-context-response.schema.json",
  permissionGrant: "schemas/permission-grant.schema.json"
} as const;

export function createCcpAjv(): Ajv2020Instance {
  const ajv = new Ajv2020({
    allErrors: true,
    strict: false
  });

  addFormats(ajv);
  addCoreSchema(ajv);
  return ajv;
}

export function createCommerceContextRequestValidator(
  ajv = createCcpAjv()
): ValidateFunction<CommerceContextRequest> {
  return compileSchema<CommerceContextRequest>(ajv, schemaPaths.commerceContextRequest);
}

export function createCommerceContextResponseValidator(
  ajv = createCcpAjv()
): ValidateFunction<CommerceContextResponse> {
  return compileSchema<CommerceContextResponse>(ajv, schemaPaths.commerceContextResponse);
}

export function createPermissionGrantValidator(
  ajv = createCcpAjv()
): ValidateFunction<PermissionGrant> {
  return compileSchema<PermissionGrant>(ajv, schemaPaths.permissionGrant);
}

export function createCcpValidators(ajv = createCcpAjv()) {
  return {
    commerceContextRequest: createCommerceContextRequestValidator(ajv),
    commerceContextResponse: createCommerceContextResponseValidator(ajv),
    permissionGrant: createPermissionGrantValidator(ajv)
  };
}

function addCoreSchema(ajv: Ajv2020Instance): void {
  if (!ajv.getSchema(CORE_SCHEMA_KEY)) {
    ajv.addSchema(readJson(schemaPaths.core), CORE_SCHEMA_KEY);
  }
}

function compileSchema<T>(ajv: Ajv2020Instance, relativePath: string): ValidateFunction<T> {
  addCoreSchema(ajv);
  const schema = readJson(relativePath);
  const schemaId = typeof schema.$id === "string" ? schema.$id : relativePath;
  const existing = ajv.getSchema<T>(schemaId);

  if (existing) {
    return existing;
  }

  return ajv.compile<T>(schema);
}
