import Link from "next/link";
import { notFound } from "next/navigation";
import { getConversacionesByLead, getLead, getMensajes, getVendedores } from "@/lib/data";
import { fmtDate, fmtDateTime } from "@/lib/ui";
import { Avatar } from "@/components/ui";
import ChatThread from "@/components/ChatThread";
import EstadoSelect from "@/components/EstadoSelect";
import VendedorSelect from "@/components/VendedorSelect";
import ProcesadoSwitch from "@/components/ProcesadoSwitch";

export const dynamic = "force-dynamic";

export default async function LeadDetailPage({ params }: { params: { id: string } }) {
  const lead = await getLead(params.id);
  if (!lead) notFound();

  const [{ data: vendedores }, conversaciones] = await Promise.all([
    getVendedores(),
    getConversacionesByLead(lead.id),
  ]);

  // Junta todos los mensajes de todas las conversaciones del lead
  const mensajesPorConv = await Promise.all(conversaciones.map((c) => getMensajes(c.id)));
  const mensajes = mensajesPorConv.flat().sort((a, b) => a.created_at.localeCompare(b.created_at));

  const nombre = lead.cliente?.nombre || lead.telefono || "Sin nombre";

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <Link href="/leads" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 mb-4">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
        Volver a leads
      </Link>

      <div className="grid lg:grid-cols-[380px_1fr] gap-6 items-start">
        {/* Panel info */}
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <Avatar name={nombre} size={52} />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-slate-900 truncate">{nombre}</h1>
                  {lead.urgente && <span className="text-[10px] font-bold text-rose-600 bg-rose-50 rounded px-1.5 py-0.5">URGENTE</span>}
                </div>
                <div className="text-sm text-slate-500">{lead.cliente?.empresa || "—"}</div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <EstadoSelect leadId={lead.id} estado={lead.estado} />
              <span className="text-xs text-slate-400">Score <b className="text-slate-700">{lead.score}</b>/100</span>
            </div>

            {lead.resumen && (
              <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-600 leading-relaxed">{lead.resumen}</p>
            )}

            <div className="mt-4">
              <label className="text-xs font-medium text-slate-500 mb-1 block">Vendedor asignado</label>
              <VendedorSelect leadId={lead.id} vendedorId={lead.vendedor_id} vendedores={vendedores} />
            </div>

            <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
              <span className="text-xs font-medium text-slate-500">Gestión del vendedor</span>
              <ProcesadoSwitch leadId={lead.id} procesado={Boolean(lead.procesado)} />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900 mb-3">Detalles</h2>
            <dl className="space-y-2.5 text-sm">
              <Row label="Teléfono" value={lead.telefono} />
              <Row label="Sector" value={lead.sector} capitalize />
              <Row label="Tipo de stand" value={lead.tipo_stand?.replace("_", " ")} capitalize />
              <Row label="Metros²" value={lead.m2 != null ? `${lead.m2} m²` : null} />
              <Row label="Feria" value={lead.feria} />
              <Row label="Ciudad" value={lead.ciudad} />
              <Row label="Ubicación" value={lead.ubicacion} />
              <Row label="Fecha evento" value={lead.fecha_evento ? fmtDate(lead.fecha_evento) : null} />
              <Row label="Presupuesto" value={lead.presupuesto_estimado} />
              <Row label="Email" value={lead.cliente?.email} />
              <Row label="Creado" value={fmtDateTime(lead.created_at)} />
            </dl>
          </div>
        </div>

        {/* Conversación */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-160px)] sticky top-6">
          <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-3">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-100 text-brand-700">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2a10 10 0 00-8.94 14.47L2 22l5.65-1.05A10 10 0 1012 2z"/></svg>
              </span>
              <div>
                <div className="text-sm font-semibold text-slate-900">Conversación WhatsApp</div>
                <div className="text-xs text-slate-400">{mensajes.length} mensajes · {conversaciones.length} hilo(s)</div>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.03) 1px, transparent 0)", backgroundSize: "18px 18px" }}>
            <ChatThread mensajes={mensajes} />
          </div>
          <div className="border-t border-slate-200 bg-white px-4 py-2.5 text-center text-xs text-slate-400">
            Vista de solo lectura · los mensajes los gestiona ZAVU
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, capitalize }: { label: string; value?: string | null; capitalize?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-slate-400 shrink-0">{label}</dt>
      <dd className={`text-slate-800 text-right ${capitalize ? "capitalize" : ""}`}>{value || "—"}</dd>
    </div>
  );
}
