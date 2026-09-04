"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProcesadoSwitch({
  leadId,
  procesado,
  size = "md",
}: {
  leadId: string;
  procesado: boolean;
  size?: "sm" | "md";
}) {
  const router = useRouter();
  const [on, setOn] = useState(procesado);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    const next = !on;
    setOn(next);
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/leads/${leadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ procesado: next }),
    });
    setSaving(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error || "Error");
      setOn(!next); // revertir
      return;
    }
    router.refresh();
  }

  const track = size === "sm" ? "h-5 w-9" : "h-6 w-11";
  const knob = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const shift = size === "sm" ? (on ? "translate-x-4" : "translate-x-0.5") : on ? "translate-x-5" : "translate-x-0.5";

  return (
    <div className="flex items-center gap-2" title={error ?? undefined}>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={(e) => { e.stopPropagation(); toggle(); }}
        disabled={saving}
        className={`relative inline-flex ${track} shrink-0 items-center rounded-full transition-colors disabled:opacity-60 ${
          on ? "bg-emerald-500" : "bg-slate-300"
        } ${error ? "ring-2 ring-rose-400" : ""}`}
      >
        <span className={`inline-block ${knob} transform rounded-full bg-white shadow transition-transform ${shift}`} />
      </button>
      <span className={`text-xs font-medium ${on ? "text-emerald-600" : "text-slate-500"}`}>
        {on ? "Listo" : "En proceso"}
      </span>
    </div>
  );
}
