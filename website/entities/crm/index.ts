// The slice of edge8-web's crm entity the campaigns entity reads, answered from
// mahjong-tarot's own CRM. Deals are public.deals through the company_os.deals
// view; mahjong has no pipeline stages or meetings table, so those reads return
// an empty set from views of the same shape.
import { companyOs } from "@/kernel/data/supabase";
import { supabase } from "@/kernel/data/supabase";

type Row = Record<string, unknown>;
type SelectOptions = { head?: boolean; count?: "exact" | "planned" | "estimated" };

export const selectDeals = (columns: string, options?: SelectOptions) =>
  companyOs.from("deals").select<string, Row>(columns, options);

export const selectPipelineStages = (columns: string, options?: SelectOptions) =>
  companyOs.from("pipeline_stages").select<string, Row>(columns, options);

export const selectMeetings = (columns: string, options?: SelectOptions) =>
  companyOs.from("meetings").select<string, Row>(columns, options);

// The overview's funnel row. At Edge8 it counts sales meetings; here it counts
// paid readings booked (public.bookings) against a weekly goal.
export const WEEKLY_MEETINGS_GOAL = 5;

// Monday 00:00 local, the start of the goal week.
function startOfWeekIso(): string {
  const d = new Date();
  const day = (d.getDay() + 6) % 7;
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - day);
  return d.toISOString();
}

export async function getMeetingsBookedThisWeek(): Promise<number> {
  const { count, error } = await supabase
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .gte("created_at", startOfWeekIso());
  if (error) console.error("[crm] bookings", error.message);
  return count ?? 0;
}

// New inquiries (every form and newsletter signup) since the window start.
export async function getNewLeadsCount(sinceIso: string | null): Promise<number> {
  let query = supabase.from("inquiries").select("id", { count: "exact", head: true });
  if (sinceIso) query = query.gte("created_at", sinceIso);
  const { count, error } = await query;
  if (error) console.error("[crm] inquiries", error.message);
  return count ?? 0;
}
