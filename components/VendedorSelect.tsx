"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Vendedor } from "@/lib/types";

export default function VendedorSelect({
  leadId,
  vendedorId,
  vendedores,
  compact = false,
}: {
  leadId: string;
  vendedorId: string | null;
  vendedores: Vendedor[];
  compact?: boolean;
}) {
  const router = useRouter();
  const [value, setValue] = useState(vendedorId ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newVal = e.target.value;
    setValue(newVal);
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/leads/${leadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vendedor_id: newVal || null }),
    });
    setSaving(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error || "Error al guardar");
      setValue(vendedorId ?? "");
      return;
    }
    router.refresh();
  }

  return (
    <div className="relative" title={error ?? undefined}>
      <select
        value={value}
        onChange={onChange}
        disabled={saving}
        onClick={(e) => e.stopPropagation()}
        className={`w-full appearance-none rounded-lg border bg-white pr-7 text-slate-700 transition focus:border-brand-500 focus:ring-1 focus:ring-brand-500 disabled:opacity-60 ${
          compact ? "py-1 pl-2 text-xs" : "py-1.5 pl-3 text-sm"
        } ${error ? "border-rose-400" : value ? "border-slate-200" : "border-dashed border-slate-300 text-slate-400"}`}
      >
        <option value="">Sin asignar</option>
        {vendedores.map((v) => (
          <option key={v.id} value={v.id}>{v.nombre}</option>
        ))}
      </select>
      <svg className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
    </div>
  );
}
