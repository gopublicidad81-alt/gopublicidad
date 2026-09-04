"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ESTADOS, EstadoLead } from "@/lib/types";
import { ESTADO_META } from "@/lib/ui";

export default function EstadoSelect({ leadId, estado }: { leadId: string; estado: EstadoLead }) {
  const router = useRouter();
  const [value, setValue] = useState<EstadoLead>(estado);
  const [saving, setSaving] = useState(false);

  async function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newVal = e.target.value as EstadoLead;
    setValue(newVal);
    setSaving(true);
    const res = await fetch(`/api/leads/${leadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: newVal }),
    });
    setSaving(false);
    if (!res.ok) { setValue(estado); return; }
    router.refresh();
  }

  const m = ESTADO_META[value];
  return (
    <div className="relative inline-block">
      <select
        value={value}
        onChange={onChange}
        disabled={saving}
        className={`appearance-none rounded-full py-1 pl-3 pr-8 text-xs font-medium ring-1 ring-inset cursor-pointer disabled:opacity-60 ${m.className}`}
      >
        {ESTADOS.map((e) => <option key={e} value={e}>{ESTADO_META[e].label}</option>)}
      </select>
      <svg className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 opacity-60" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.25 4.39a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
    </div>
  );
}
