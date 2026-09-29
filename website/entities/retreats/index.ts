// edge8-web's retreats entity (events) feeds the weekly letter's sources. Mahjong
// Tarot has no events table yet; company_os.events is an empty table of the same
// shape so the letter's reads succeed with nothing to say.
import { companyOs } from "@/kernel/data/supabase";

type Row = Record<string, unknown>;

export const selectEvents = (
  columns: string,
  options?: { head?: boolean; count?: "exact" | "planned" | "estimated" },
) => companyOs.from("events").select<string, Row>(columns, options);
