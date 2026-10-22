"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Archivo } from "@/lib/multimedia";

function fmtBytes(n: number): string {
  if (!n) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function fmtFecha(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" });
}

export default function MultimediaArchivos({
  bucket,
  carpeta,
  archivos,
}: {
  bucket: string;
  carpeta: string;
  archivos: Archivo[];
}) {
  const router = useRouter();
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [borrando, setBorrando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiado, setCopiado] = useState<string | null>(null);

  const prefijo = carpeta ? `${carpeta}/` : "";
  const fullPaths = Array.from(sel);

  function toggle(name: string) {
    setSel((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  async function borrarSeleccionados() {
    if (fullPaths.length === 0) return;
    const ok = window.confirm(
      `¿Borrar ${fullPaths.length} archivo(s)? Esta acción no se puede deshacer y los enlaces que los usen dejarán de funcionar.`,
    );
    if (!ok) return;
    setBorrando(true);
    setError(null);
    try {
      const res = await fetch("/api/multimedia/borrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bucket, paths: fullPaths.map((n) => prefijo + n) }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Error al borrar.");
      setSel(new Set());
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al borrar.");
    } finally {
      setBorrando(false);
    }
  }

  async function copiarUrl(a: Archivo) {
    try {
      await navigator.clipboard.writeText(a.url);
      setCopiado(a.name);
      setTimeout(() => setCopiado(null), 1500);
    } catch {
      setError("No se pudo copiar la URL.");
    }
  }

  if (archivos.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-sm text-slate-500">
        No hay archivos todavía. Usa &quot;Subir archivos&quot; para agregar el primero.
      </div>
    );
  }

  return (
    <div>
      {sel.size > 0 && (
        <div className="mb-3 flex items-center gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2">
          <span className="text-sm font-medium text-rose-700">{sel.size} seleccionado(s)</span>
          <button
            onClick={borrarSeleccionados}
            disabled={borrando}
            className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
          >
            {borrando ? "Borrando…" : "Borrar seleccionados"}
          </button>
          <button onClick={() => setSel(new Set())} className="text-xs font-medium text-slate-500 hover:text-slate-700">
            Cancelar
          </button>
        </div>
      )}
      {error && <p className="mb-3 text-xs font-medium text-rose-600">{error}</p>}

      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
        {archivos.map((a) => {
          const esImagen = /\.(png|jpe?g|webp|gif|avif)$/i.test(a.name);
          return (
            <div
              key={a.name}
              className={`group relative overflow-hidden rounded-xl border bg-white ${
                sel.has(a.name) ? "border-rose-400 ring-2 ring-rose-200" : "border-slate-200"
              }`}
            >
              <button
                onClick={() => toggle(a.name)}
                title="Seleccionar para borrar"
                className={`absolute left-2 top-2 z-10 grid h-6 w-6 place-items-center rounded-md border text-xs ${
                  sel.has(a.name)
                    ? "bg-rose-600 text-white border-rose-600"
                    : "bg-white/90 text-slate-400 border-slate-300 hover:border-rose-400"
                }`}
              >
                {sel.has(a.name) ? "✓" : ""}
              </button>

              <a href={a.url} target="_blank" rel="noreferrer" className="block">
                <div className="h-36 w-full overflow-hidden bg-slate-100">
                  {esImagen ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={a.url} alt={a.name} className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <div className="grid h-full place-items-center text-3xl text-slate-300">📄</div>
                  )}
                </div>
              </a>

              <div className="p-3">
                <div className="truncate text-sm font-medium text-slate-900" title={a.name}>
                  {a.name}
                </div>
                <div className="mt-0.5 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{fmtBytes(a.size)}</span>
                  <span>{fmtFecha(a.updated_at)}</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    onClick={() => copiarUrl(a)}
                    className="rounded-md border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
                  >
                    {copiado === a.name ? "¡Copiada!" : "Copiar URL"}
                  </button>
                  <a
                    href={a.url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-md border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Abrir
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
