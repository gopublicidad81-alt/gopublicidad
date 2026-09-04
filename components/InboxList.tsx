"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useMemo } from "react";
import { ConversacionResumen } from "@/lib/data";
import { Avatar } from "@/components/ui";
import { timeAgo } from "@/lib/ui";

export default function InboxList({ items }: { items: ConversacionResumen[] }) {
  const pathname = usePathname();
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return items;
    return items.filter((c) => {
      const hay = [c.lead?.cliente?.nombre, c.lead?.telefono, c.ultimo_mensaje?.contenido]
        .filter(Boolean).join(" ").toLowerCase();
      return hay.includes(query);
    });
  }, [items, q]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-slate-100">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar conversación…"
          className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:bg-white"
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        {filtered.map((c) => {
          const active = pathname === `/conversaciones/${c.id}`;
          const nombre = c.lead?.cliente?.nombre || c.lead?.telefono || "Sin nombre";
          const preview = c.ultimo_mensaje?.contenido || "Sin mensajes";
          const esCliente = ["usuario", "user", "cliente"].includes(c.ultimo_mensaje?.rol ?? "");
          return (
            <Link
              key={c.id}
              href={`/conversaciones/${c.id}`}
              className={`flex gap-3 px-4 py-3 border-b border-slate-50 transition ${active ? "bg-brand-50" : "hover:bg-slate-50"}`}
            >
              <Avatar name={nombre} size={40} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-slate-900 truncate text-sm">{nombre}</span>
                  <span className="text-[10px] text-slate-400 shrink-0">{timeAgo(c.ultimo_mensaje?.created_at ?? c.updated_at)}</span>
                </div>
                <div className="text-xs text-slate-500 truncate">
                  {!esCliente && preview !== "Sin mensajes" && <span className="text-slate-400">Tú: </span>}
                  {preview}
                </div>
              </div>
            </Link>
          );
        })}
        {filtered.length === 0 && (
          <div className="p-6 text-center text-sm text-slate-400">Sin conversaciones.</div>
        )}
      </div>
    </div>
  );
}
