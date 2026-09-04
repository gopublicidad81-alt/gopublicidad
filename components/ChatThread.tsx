import { Mensaje } from "@/lib/types";
import { fmtDateTime } from "@/lib/ui";

function isCliente(rol: string) {
  return rol === "usuario" || rol === "user" || rol === "cliente";
}

function rolLabel(rol: string) {
  if (isCliente(rol)) return "Cliente";
  if (rol === "asistente" || rol === "assistant" || rol === "bot") return "Asistente";
  if (rol === "vendedor" || rol === "agente") return "Vendedor";
  return rol;
}

export default function ChatThread({ mensajes }: { mensajes: Mensaje[] }) {
  if (mensajes.length === 0) {
    return <div className="grid place-items-center py-16 text-sm text-slate-400">No hay mensajes en esta conversación.</div>;
  }
  return (
    <div className="space-y-3 p-4">
      {mensajes.map((m) => {
        const cliente = isCliente(m.rol);
        return (
          <div key={m.id} className={`flex ${cliente ? "justify-start" : "justify-end"}`}>
            <div className={`max-w-[78%] rounded-2xl px-3.5 py-2 shadow-sm ${
              cliente
                ? "bg-white border border-slate-200 rounded-tl-sm"
                : "bg-brand-600 text-white rounded-tr-sm"
            }`}>
              <div className={`text-[10px] font-semibold mb-0.5 ${cliente ? "text-slate-400" : "text-brand-100"}`}>
                {rolLabel(m.rol)}
              </div>
              {m.contenido && <div className="text-sm whitespace-pre-wrap leading-relaxed">{m.contenido}</div>}
              {m.media && (
                <a href={m.media} target="_blank" rel="noreferrer" className={`mt-1 block text-xs underline ${cliente ? "text-blue-600" : "text-brand-100"}`}>
                  📎 Ver adjunto
                </a>
              )}
              <div className={`text-[10px] mt-1 text-right ${cliente ? "text-slate-300" : "text-brand-200"}`}>
                {fmtDateTime(m.created_at)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
