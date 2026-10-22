"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { CarpetaInfo } from "@/lib/multimedia";

export default function MultimediaUploader({
  bucket,
  carpeta,
  carpetas,
}: {
  bucket: string;
  carpeta: string;
  carpetas: CarpetaInfo[];
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [destino, setDestino] = useState(carpeta);
  const [subiendo, setSubiendo] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function subir() {
    const files = inputRef.current?.files;
    if (!files || files.length === 0) {
      setError("Selecciona al menos un archivo.");
      return;
    }
    setSubiendo(true);
    setError(null);
    setMensaje(null);
    try {
      const fd = new FormData();
      fd.set("bucket", bucket);
      fd.set("carpeta", destino);
      Array.from(files).forEach((f) => fd.append("files", f));
      const res = await fetch("/api/multimedia/subir", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error al subir.");
      const ok = json.subidos?.length || 0;
      const fallidos = json.errores?.length || 0;
      setError(fallidos > 0 ? `${fallidos} archivo(s) con error: ${json.errores.map((e: any) => e.nombre).join(", ")}` : null);
      setMensaje(`${ok} archivo(s) subido(s) correctamente a ${destino || "la raíz"}.`);
      if (inputRef.current) inputRef.current.value = "";
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al subir.");
    } finally {
      setSubiendo(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {carpetas.length > 1 && (
          <select
            value={destino}
            onChange={(e) => setDestino(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
          >
            {carpetas.map((c) => (
              <option key={c.carpeta} value={c.carpeta}>
                {c.nombre}
              </option>
            ))}
          </select>
        )}
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,application/pdf"
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-brand-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-brand-700"
        />
        <button
          onClick={subir}
          disabled={subiendo}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {subiendo ? "Subiendo…" : "Subir archivos"}
        </button>
      </div>
      {mensaje && <p className="text-xs font-medium text-emerald-600">{mensaje}</p>}
      {error && <p className="text-xs font-medium text-rose-600 max-w-md text-right">{error}</p>}
    </div>
  );
}
