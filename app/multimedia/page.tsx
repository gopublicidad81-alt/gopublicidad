import Link from "next/link";
import { BUCKETS, contarPorCarpeta, getCarpetas } from "@/lib/multimedia";
import { PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function MultimediaPage() {
  const conteos = await Promise.all(
    BUCKETS.map(async (b) => {
      const carpetas = getCarpetas(b.bucket);
      if (carpetas.length === 0) {
        return { bucket: b.bucket, total: -1, porCarpeta: {} as Record<string, number> };
      }
      const porCarpeta = await contarPorCarpeta(b.bucket);
      const total = Object.values(porCarpeta).reduce((s, n) => s + n, 0);
      return { bucket: b.bucket, total, porCarpeta };
    }),
  );
  const conteoPorBucket = new Map(conteos.map((c) => [c.bucket, c]));

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <PageHeader
        title="Carga Multimedia"
        subtitle="Buckets de Supabase: revisa, sube, actualiza y borra archivos según corresponda"
      />

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Bucket</th>
              <th className="px-4 py-3 font-medium">Descripción</th>
              <th className="px-4 py-3 font-medium">Carpetas</th>
              <th className="px-4 py-3 font-medium">Archivos</th>
              <th className="px-4 py-3 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {BUCKETS.map((b) => {
              const c = conteoPorBucket.get(b.bucket);
              const carpetas = getCarpetas(b.bucket);
              return (
                <tr key={b.bucket} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900">{b.nombre}</div>
                    <div className="text-xs text-slate-400 font-mono">{b.bucket}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 max-w-sm">{b.descripcion}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {carpetas.length > 0 ? `${carpetas.length} subcarpetas` : "Raíz + catálogos"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {c && c.total >= 0 ? c.total.toLocaleString("es-CL") : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/multimedia/${b.bucket}`}
                      className="inline-flex rounded-lg border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100"
                    >
                      Ver y gestionar
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-slate-400">
        Al subir un archivo con el mismo nombre se <strong>actualiza</strong> (reemplaza) el anterior sin
        cambiar su URL. Si borras un archivo, los enlaces que lo usen dejarán de funcionar.
      </p>
    </div>
  );
}
