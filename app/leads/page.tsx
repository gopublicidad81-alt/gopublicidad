import Link from "next/link";
import { getLeads, getVendedores } from "@/lib/data";
import { PageHeader } from "@/components/ui";
import LeadsTable from "@/components/LeadsTable";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const [leads, { data: vendedores }] = await Promise.all([getLeads(), getVendedores()]);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <PageHeader
        title="Leads"
        subtitle="Todos los leads generados por WhatsApp"
        action={
          <Link href="/vendedores" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
            Gestionar vendedores
          </Link>
        }
      />

      <LeadsTable leads={leads} vendedores={vendedores} />
    </div>
  );
}
