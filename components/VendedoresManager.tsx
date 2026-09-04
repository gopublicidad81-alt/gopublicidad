"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EstadoLead, Vendedor } from "@/lib/types";
import { Avatar, EstadoBadge, ScoreBadge } from "@/components/ui";
import ProcesadoSwitch from "@/components/ProcesadoSwitch";

export interface VendedorLead {
  id: string;
  nombre: string;
  estado: EstadoLead;
  score: number;
  procesado: boolean;
  urgente: boolean;
}

export default function VendedoresManager({
  vendedores,
  leadsByVendedor,
}: {
  vendedores: Vendedor[];
  leadsByVendedor: Record<string, VendedorLead[]>;
}) {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandido, setExpandido] = useState<string | null>(null);

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim()) return;
    setSaving(true);
    setError(null);
    const res = await fetch("/api/vendedores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, email, telefono }),
    });
    setSaving(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error || "Error al crear vendedor");
      return;
    }
    setNombre(""); setEmail(""); setTelefono("");
    router.refresh();
  }

  async function toggleActivo(v: Vendedor) {
    await fetch("/api/vendedores", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: v.id, activo: !v.activo }),
    });
    router.refresh();
  }

  async function eliminar(v: Vendedor) {
    const n = (leadsByVendedor[v.id] ?? []).length;
    const msg = n > 0
      ? `${v.nombre} tiene ${n} lead(s) asignados. Al eliminarlo esos leads quedarán sin vendedor. ¿Continuar?`
      : `¿Eliminar a ${v.nombre}?`;
    if (!confirm(msg)) return;
    await fetch(`/api/vendedores?id=${v.id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="grid lg:grid-cols-[340px_1fr] gap-6 items-start">
      {/* Formulario alta */}
      <form onSubmit={crear} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
        <h2 className="font-semibold text-slate-900">Agregar vendedor</h2>
        <Field label="Nombre *" value={nombre} onChange={setNombre} placeholder="Ej: María Pérez" />
        <Field label="Email" value={email} onChange={setEmail} placeholder="maria@ecostand.cl" type="email" />
        <Field label="Teléfono" value={telefono} onChange={setTelefono} placeholder="+56 9 1234 5678" />
        {error && <div className="text-xs text-rose-600">{error}</div>}
        <button
          type="submit"
          disabled={saving || !nombre.trim()}
          className="w-full rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50 transition"
        >
          {saving ? "Guardando…" : "Agregar vendedor"}
        </button>
      </form>

      {/* Lista */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Equipo de ventas</h2>
          <span className="text-xs text-slate-400">{vendedores.length} vendedores</span>
        </div>
        <div className="divide-y divide-slate-100">
          {vendedores.map((v) => {
            const leads = leadsByVendedor[v.id] ?? [];
            const listos = leads.filter((l) => l.procesado).length;
            const enProceso = leads.length - listos;
            const abierto = expandido === v.id;
            return (
              <div key={v.id}>
                <div className="flex items-center gap-4 px-6 py-4">
                  <Avatar name={v.nombre} size={42} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900 truncate">{v.nombre}</span>
                      {!v.activo && <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 rounded px-1.5 py-0.5">Inactivo</span>}
                    </div>
                    <div className="text-xs text-slate-400 truncate">
                      {[v.email, v.telefono].filter(Boolean).join(" · ") || "Sin datos de contacto"}
                    </div>
                  </div>

                  {/* Carga */}
                  <div className="hidden sm:flex items-center gap-3">
                    <Chip tone="amber" value={enProceso} label="en proceso" />
                    <Chip tone="emerald" value={listos} label="listos" />
                  </div>

                  <button
                    onClick={() => setExpandido(abierto ? null : v.id)}
                    disabled={leads.length === 0}
                    className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                  >
                    {leads.length} leads
                    <svg className={`h-3.5 w-3.5 transition-transform ${abierto ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleActivo(v)}
                      className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                    >
                      {v.activo ? "Desactivar" : "Activar"}
                    </button>
                    <button
                      onClick={() => eliminar(v)}
                      className="rounded-lg border border-rose-200 px-2.5 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>

                {/* Detalle de leads del vendedor */}
                {abierto && leads.length > 0 && (
                  <div className="bg-slate-50/70 px-6 pb-4">
                    <div className="rounded-lg border border-slate-200 bg-white divide-y divide-slate-50">
                      {leads.map((l) => (
                        <div
                          key={l.id}
                          onClick={() => router.push(`/leads/${l.id}`)}
                          className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-slate-50 transition"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-medium text-slate-800 truncate">{l.nombre}</span>
                              {l.urgente && <span className="text-[9px] font-bold text-rose-600 bg-rose-50 rounded px-1 py-0.5">URG</span>}
                            </div>
                          </div>
                          <EstadoBadge estado={l.estado} />
                          <div className="hidden md:block"><ScoreBadge score={l.score} /></div>
                          <div onClick={(e) => e.stopPropagation()}>
                            <ProcesadoSwitch leadId={l.id} procesado={l.procesado} size="sm" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {vendedores.length === 0 && (
            <div className="px-6 py-12 text-center text-sm text-slate-400">
              Aún no hay vendedores. Agrega el primero desde el formulario.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Chip({ value, label, tone }: { value: number; label: string; tone: "amber" | "emerald" }) {
  const map = { amber: "bg-amber-50 text-amber-700", emerald: "bg-emerald-50 text-emerald-700" };
  return (
    <div className={`flex flex-col items-center rounded-lg px-2.5 py-1 ${map[tone]}`}>
      <span className="text-sm font-bold tabular-nums leading-none">{value}</span>
      <span className="text-[9px] uppercase tracking-wide mt-0.5">{label}</span>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
      />
    </label>
  );
}
