import { getLeads, getVendedores } from "@/lib/data";
import { PageHeader } from "@/components/ui";
import VendedoresManager, { VendedorLead } from "@/components/VendedoresManager";

export const dynamic = "force-dynamic";

export default async function VendedoresPage() {
  const [{ data: vendedores }, leads] = await Promise.all([getVendedores(), getLeads()]);

  const leadsByVendedor: Record<string, VendedorLead[]> = {};
  for (const l of leads) {
    if (!l.vendedor_id) continue;
    (leadsByVendedor[l.vendedor_id] ??= []).push({
      id: l.id,
      nombre: l.cliente?.nombre || l.telefono || "Sin nombre",
      estado: l.estado,
      score: l.score,
      procesado: Boolean(l.procesado),
      urgente: Boolean(l.urgente),
    });
  }
  // Los no procesados primero (los que faltan por gestionar)
  for (const id in leadsByVendedor) {
    leadsByVendedor[id].sort((a, b) => Number(a.procesado) - Number(b.procesado) || b.score - a.score);
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <PageHeader title="Vendedores" subtitle="Administra tu equipo de ventas y su carga de leads" />
      <VendedoresManager vendedores={vendedores} leadsByVendedor={leadsByVendedor} />
    </div>
  );
}
