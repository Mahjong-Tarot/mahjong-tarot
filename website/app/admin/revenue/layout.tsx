// The Revenue section (marketing platform, later the Revenue board), copied from
// edge8-web. Guards the section server-side, then renders it inside mahjong's
// admin shell with edge8's admin stylesheet for the page content.
import type { Metadata } from 'next';
import { requireAdmin } from '@/kernel/identity/admin-auth';
import { supabase } from '@/kernel/data/supabase';
import { AdminFrame } from './AdminFrame';
import './tokens.css';
import './admin.css';
import './utilities.css';

export const metadata: Metadata = {
  title: { template: '%s · Mahjong Tarot admin', default: 'Mahjong Tarot admin' },
};

export default async function RevenueLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  const { data, error } = await supabase
    .from('profiles')
    .select('name, role')
    .eq('user_id', user.id)
    .maybeSingle();
  if (error) console.error('[revenue] profile read failed:', error.message);
  const profile = { name: (data?.name as string | null) ?? null, role: 'admin' };
  return <AdminFrame profile={profile}>{children}</AdminFrame>;
}
