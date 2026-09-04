"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Vendedor } from "@/lib/types";
import { Avatar } from "@/components/ui";
import { fmtDate } from "@/lib/ui";

export default function VendedoresManager({
  vendedores,
  leadsPorVendedor,
}: {
  vendedores: Vendedor[];
  leadsPorVendedor: Record<string, number>;
}) {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    const n = leadsPorVendedor[v.id] ?? 0;
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
        <div className="divide-y divide-slate-50">
          {vendedores.map((v) => (
            <div key={v.id} className="flex items-center gap-4 px-6 py-4">
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
              <div className="text-center">
                <div className="text-lg font-bold text-slate-800 tabular-nums">{leadsPorVendedor[v.id] ?? 0}</div>
                <div className="text-[10px] text-slate-400 uppercase">leads</div>
              </div>
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
          ))}
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
