// Placeholder until the campaigns entity lands (Phase 2 onward). Proves the
// App Router, the admin gate, the shell and the company_os connection.
import { companyOs } from '@/kernel/data/supabase';
import { PageHead } from '@/kernel/ui/PageHead';

export const dynamic = 'force-dynamic';

export default async function MarketingPage() {
  const { data: brands, error } = await companyOs.from('brands').select('slug, name, primary_domain');
  return (
    <>
      <PageHead title="Marketing" sub="The marketing platform, copied from edge8-web. Screens arrive phase by phase." />
      {error ? (
        <p className="admin-alert admin-alert--err">company_os unreachable: {error.message}</p>
      ) : (
        <ul>
          {(brands ?? []).map((b) => (
            <li key={b.slug}>
              {b.name} ({b.primary_domain})
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
