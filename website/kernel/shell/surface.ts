// Server half of the surface helpers. edge8-web serves Revenue on /admin and
// /team; mahjong-tarot has only /admin, so these answer admin. Kept under
// edge8's names so code copied from edge8-web ports unchanged.

import { revalidatePath } from "next/cache";
import type { Surface } from "./surface-shared";

export function currentSurface(): Surface {
  return "admin";
}

// "/admin", to prefix a link: `${surfaceBase()}/revenue/deals`.
export function surfaceBase(): "/admin" | "/team" {
  return "/admin";
}

// Refresh a page after a write. `path` starts after the surface, for instance
// "/revenue/marketing".
export function revalidateSurfaces(path: string, type?: "page" | "layout"): void {
  revalidatePath(`/admin${path}`, type);
}
