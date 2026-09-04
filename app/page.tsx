import Link from "next/link";
import { getLeads, getVendedores } from "@/lib/data";
import { supabaseAdmin } from "@/lib/supabase";
import { ESTADOS, EstadoLead } from "@/lib/types";
import { ESTADO_META, fmtDate, timeAgo } from "@/lib/ui";
import { PageHeader, KpiCard, EstadoBadge, ScoreBadge, Avatar } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const leads = await getLeads();
  const { data: vendedores } = await getVendedores();
  const { count: totalConversaciones } = await supabaseAdmin
    .from("conversaciones")
    .select("*", { count: "exact", head: true });

  const total = leads.length;
  const ganados = leads.filter((l) => l.estado === "ganado").length;
  const urgentes = leads.filter((l) => l.urgente).length;
  const sinAsignar = leads.filter((l) => !l.vendedor_id).length;
  const scorePromedio = total ? Math.round(leads.reduce((a, l) => a + (l.score || 0), 0) / total) : 0;
  const activos = leads.filter((l) => !["ganado", "perdido"].includes(l.estado)).length;
  const conversionRate = total ? Math.round((ganados / total) * 100) : 0;

  const porEstado = ESTADOS.map((e) => ({
    estado: e as EstadoLead,
    count: leads.filter((l) => l.estado === e).length,
  }));
  const maxEstado = Math.max(1, ...porEstado.map((x) => x.count));

  const recientes = leads.slice(0, 6);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <PageHeader
        title="Dashboard"
        subtitle="Resumen de leads generados por WhatsApp (ZAVU)"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Leads totales" value={total} sub={`${activos} activos en pipeline`} accent="brand" />
        <KpiCard label="Conversaciones" value={totalConversaciones ?? 0} sub="canal WhatsApp" accent="blue" />
        <KpiCard label="Score promedio" value={scorePromedio} sub="de 0 a 100" accent="amber" />
        <KpiCard label="Sin vendedor" value={sinAsignar} sub={`${vendedores.length} vendedores`} accent={sinAsignar ? "rose" : "slate"} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Embudo por estado */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Pipeline por estado</h2>
            <div className="text-xs text-slate-400">
              Conversión a ganado: <span className="font-semibold text-emerald-600">{conversionRate}%</span>
            </div>
          </div>
          <div className="space-y-3">
            {porEstado.map(({ estado, count }) => {
              const m = ESTADO_META[estado];
              return (
                <div key={estado} className="flex items-center gap-3">
                  <div className="w-28 shrink-0">
                    <EstadoBadge estado={estado} />
                  </div>
                  <div className="flex-1 h-6 rounded-md bg-slate-50 overflow-hidden">
                    <div
                      className={`h-full ${m.dot} opacity-80 rounded-md transition-all`}
                      style={{ width: `${(count / maxEstado) * 100}%`, minWidth: count ? 8 : 0 }}
                    />
                  </div>
                  <div className="w-8 text-right text-sm font-semibold tabular-nums text-slate-700">{count}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Destacados */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900 mb-4">Atención requerida</h2>
          <div className="space-y-4">
            <Stat label="Leads urgentes" value={urgentes} tone="rose" />
            <Stat label="Sin vendedor asignado" value={sinAsignar} tone="amber" />
            <Stat label="Ganados" value={ganados} tone="emerald" />
          </div>
          <Link
            href="/leads"
            className="mt-6 block text-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition"
          >
            Ver todos los leads
          </Link>
        </div>
      </div>

      {/* Recientes */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">Leads recientes</h2>
          <Link href="/leads" className="text-sm text-brand-600 hover:text-brand-700 font-medium">Ver todos →</Link>
        </div>
        <div className="divide-y divide-slate-50">
          {recientes.map((l) => (
            <Link key={l.id} href={`/leads/${l.id}`} className="flex items-center gap-4 px-6 py-3 hover:bg-slate-50 transition">
              <Avatar name={l.cliente?.nombre || l.telefono} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-900 truncate">{l.cliente?.nombre || l.telefono || "Sin nombre"}</span>
                  {l.urgente && <span className="text-[10px] font-bold text-rose-600 bg-rose-50 rounded px-1.5 py-0.5">URGENTE</span>}
                </div>
                <div className="text-xs text-slate-500 truncate">{l.resumen || l.sector || "—"}</div>
              </div>
              <div className="hidden sm:block"><ScoreBadge score={l.score} /></div>
              <EstadoBadge estado={l.estado} />
              <div className="hidden md:block w-24 text-right text-xs text-slate-400">{timeAgo(l.created_at)}</div>
            </Link>
          ))}
          {recientes.length === 0 && (
            <div className="px-6 py-10 text-center text-sm text-slate-400">Aún no hay leads.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: "rose" | "amber" | "emerald" }) {
  const map = {
    rose: "text-rose-600 bg-rose-50",
    amber: "text-amber-600 bg-amber-50",
    emerald: "text-emerald-600 bg-emerald-50",
  };
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-600">{label}</span>
      <span className={`grid place-items-center min-w-[2.5rem] rounded-lg px-2 py-1 text-sm font-bold tabular-nums ${map[tone]}`}>{value}</span>
    </div>
  );
}
