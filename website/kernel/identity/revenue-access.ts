// Server-only gate for the Revenue section (/admin/revenue: marketing and the
// Revenue board). edge8-web also serves it to team members holding the
// `revenue` permission; mahjong-tarot has no team surface, so Revenue is
// admin-only and these are the admin gate under edge8's names, so code copied
// from edge8-web ports unchanged.

import { getAdminUser, requireAdmin, type AdminUser } from "./admin-auth";

export const getRevenueUser = getAdminUser;

export async function requireRevenueAccess(): Promise<AdminUser> {
  return requireAdmin();
}
