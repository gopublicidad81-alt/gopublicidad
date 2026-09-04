import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import { getLead, getMensajes } from "@/lib/data";
import { Conversacion } from "@/lib/types";
import { Avatar } from "@/components/ui";
import { EstadoBadge } from "@/components/ui";
import ChatThread from "@/components/ChatThread";

export const dynamic = "force-dynamic";

export default async function ConversacionPage({ params }: { params: { id: string } }) {
  const { data } = await supabaseAdmin.from("conversaciones").select("*").eq("id", params.id).maybeSingle();
  const conv = data as Conversacion | null;
  if (!conv) notFound();

  const [lead, mensajes] = await Promise.all([getLead(conv.lead_id), getMensajes(conv.id)]);
  const nombre = lead?.cliente?.nombre || lead?.telefono || "Sin nombre";

  return (
    <div className="flex flex-col h-full">
      {/* Header del chat */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-5 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar name={nombre} size={40} />
          <div className="min-w-0">
            <div className="font-semibold text-slate-900 truncate">{nombre}</div>
            <div className="text-xs text-slate-400 truncate">{lead?.telefono} · {conv.canal}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {lead && <EstadoBadge estado={lead.estado} />}
          {lead && (
            <Link href={`/leads/${lead.id}`} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
              Ver lead →
            </Link>
          )}
        </div>
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.03) 1px, transparent 0)", backgroundSize: "18px 18px" }}>
        <ChatThread mensajes={mensajes} />
      </div>

      <div className="border-t border-slate-200 bg-white px-4 py-2.5 text-center text-xs text-slate-400">
        Vista de solo lectura · los mensajes los gestiona ZAVU
      </div>
    </div>
  );
}
