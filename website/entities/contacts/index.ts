// The slice of edge8-web's contacts entity that the campaigns entity reads:
// brands, brand profiles, brand contacts, tags and person-company links, all in
// company_os. Same names and shapes as edge8's door.
import { companyOs, companyOsUntyped } from "@/kernel/data/supabase";
import type { TablesInsert } from "@/kernel/data/supabase/database.types";

type Row = Record<string, unknown>;
type SelectOptions = { head?: boolean; count?: "exact" | "planned" | "estimated" };

export const selectBrands = (columns: string, options?: SelectOptions) =>
  companyOs.from("brands").select<string, Row>(columns, options);

export const selectPersonCompanies = (columns: string, options?: SelectOptions) =>
  companyOs.from("person_companies").select<string, Row>(columns, options);

export const selectTags = (columns: string, options?: SelectOptions) =>
  companyOs.from("tags").select<string, Row>(columns, options);

export const selectTaggables = (columns: string, options?: SelectOptions) =>
  companyOs.from("taggables").select<string, Row>(columns, options);

export const selectBrandContacts = (columns: string, options?: SelectOptions) =>
  companyOsUntyped.from("brand_contacts").select(columns, options);

export const upsertBrandProfiles = (
  row: TablesInsert<{ schema: "company_os" }, "brand_profiles"> | TablesInsert<{ schema: "company_os" }, "brand_profiles">[],
  options?: { onConflict?: string; ignoreDuplicates?: boolean },
) => companyOs.from("brand_profiles").upsert(row, options);
