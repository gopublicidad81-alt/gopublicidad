"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Lead, Vendedor, ESTADOS, SECTORES } from "@/lib/types";
import { fmtDate, timeAgo } from "@/lib/ui";
import { EstadoBadge, ScoreBadge, Avatar } from "@/components/ui";
import VendedorSelect from "@/components/VendedorSelect";

export default function LeadsTable({ leads, vendedores }: { leads: Lead[]; vendedores: Vendedor[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [estado, setEstado] = useState("");
  const [sector, setSector] = useState("");
  const [vendedor, setVendedor] = useState("");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return leads.filter((l) => {
      if (estado && l.estado !== estado) return false;
      if (sector && l.sector !== sector) return false;
      if (vendedor === "__none__" && l.vendedor_id) return false;
      if (vendedor && vendedor !== "__none__" && l.vendedor_id !== vendedor) return false;
      if (query) {
        const hay = [l.cliente?.nombre, l.cliente?.empresa, l.telefono, l.resumen, l.ciudad, l.feria]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(query)) return false;
      }
      return true;
    });
  }, [leads, q, estado, sector, vendedor]);

  return (
    <div>
      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-[220px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.2-5.2m0 0A7.5 7.5 0 105.2 5.2a7.5 7.5 0 0010.6 10.6z" /></svg>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nombre, empresa, teléfono, resumen…"
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <Select value={estado} onChange={setEstado} label="Estado">
          {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
        </Select>
        <Select value={sector} onChange={setSector} label="Sector">
          {SECTORES.map((s) => <option key={s} value={s}>{s}</option>)}
        </Select>
        <Select value={vendedor} onChange={setVendedor} label="Vendedor">
          <option value="__none__">Sin asignar</option>
          {vendedores.map((v) => <option key={v.id} value={v.id}>{v.nombre}</option>)}
        </Select>
      </div>

      <div className="text-xs text-slate-400 mb-2">{filtered.length} de {leads.length} leads</div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Score</th>
                <th className="px-4 py-3 hidden lg:table-cell">Sector / Stand</th>
                <th className="px-4 py-3 hidden xl:table-cell">m²</th>
                <th className="px-4 py-3 min-w-[160px]">Vendedor</th>
                <th className="px-4 py-3 hidden md:table-cell text-right">Creado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((l) => (
                <tr
                  key={l.id}
                  onClick={() => router.push(`/leads/${l.id}`)}
                  className="cursor-pointer hover:bg-slate-50/70 transition"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={l.cliente?.nombre || l.telefono} size={34} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-slate-900 truncate max-w-[180px]">{l.cliente?.nombre || l.telefono || "Sin nombre"}</span>
                          {l.urgente && <span className="text-[9px] font-bold text-rose-600 bg-rose-50 rounded px-1 py-0.5">URG</span>}
                        </div>
                        <div className="text-xs text-slate-400 truncate max-w-[220px]">{l.cliente?.empresa || l.telefono || "—"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><EstadoBadge estado={l.estado} /></td>
                  <td className="px-4 py-3"><ScoreBadge score={l.score} /></td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <div className="text-slate-700 capitalize">{l.sector || "—"}</div>
                    <div className="text-xs text-slate-400 capitalize">{l.tipo_stand?.replace("_", " ") || ""}</div>
                  </td>
                  <td className="px-4 py-3 hidden xl:table-cell tabular-nums text-slate-600">{l.m2 ?? "—"}</td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <VendedorSelect leadId={l.id} vendedorId={l.vendedor_id} vendedores={vendedores} compact />
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-right text-xs text-slate-400" title={fmtDate(l.created_at)}>{timeAgo(l.created_at)}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-400">No hay leads que coincidan con los filtros.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Select({ value, onChange, label, children }: { value: string; onChange: (v: string) => void; label: string; children: React.ReactNode }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-8 text-sm capitalize focus:border-brand-500 focus:ring-1 focus:ring-brand-500 ${value ? "text-slate-700" : "text-slate-400"}`}
      >
        <option value="">{label}: todos</option>
        {children}
      </select>
      <svg className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
    </div>
  );
}
