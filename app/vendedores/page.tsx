import { getLeads, getVendedores } from "@/lib/data";
import { PageHeader } from "@/components/ui";
import VendedoresManager from "@/components/VendedoresManager";

export const dynamic = "force-dynamic";

export default async function VendedoresPage() {
  const [{ data: vendedores }, leads] = await Promise.all([getVendedores(), getLeads()]);

  const leadsPorVendedor: Record<string, number> = {};
  for (const l of leads) {
    if (l.vendedor_id) leadsPorVendedor[l.vendedor_id] = (leadsPorVendedor[l.vendedor_id] ?? 0) + 1;
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <PageHeader title="Vendedores" subtitle="Administra tu equipo de ventas y su carga de leads" />
      <VendedoresManager vendedores={vendedores} leadsPorVendedor={leadsPorVendedor} />
    </div>
  );
}
