// The writes an entity may make to the kernel's identity tables. In
// mahjong-tarot `company_os.people` is a view over public.people, so an update
// here writes the plain columns (consent, archived_at, …) through to the table.
import { companyOs } from "@/kernel/data/supabase";
import type { Database } from "@/kernel/data/supabase/database.types";

type PeopleUpdate = Database["company_os"]["Views"]["people"]["Update"];

export const updatePeople = (patch: PeopleUpdate) => companyOs.from("people").update(patch);
