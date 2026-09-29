'use client';

// The Pages Router admin's shell (sidebar, portal switcher, sign-out) around the
// App Router Revenue pages, so /admin/revenue looks like the rest of /admin.
import type { ReactNode } from 'react';
import { AuthProvider } from '@/lib/auth';
import AdminShell from '@/components/AdminShell';

export type AdminProfile = { name: string | null; role: string };

export function AdminFrame({ profile, children }: { profile: AdminProfile; children: ReactNode }) {
  return (
    <AuthProvider>
      <AdminShell profile={profile}>
        <div className="admin-content">{children}</div>
      </AdminShell>
    </AuthProvider>
  );
}
