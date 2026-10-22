import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Archivo,
  esBucketValido,
  getBucketInfo,
  getCarpetas,
  listarArchivos,
} from "@/lib/multimedia";
import { PageHeader } from "@/components/ui";
import MultimediaUploader from "@/components/MultimediaUploader";
import MultimediaArchivos from "@/components/MultimediaArchivos";

export const dynamic = "force-dynamic";

export default async function BucketPage({
  params,
  searchParams,
}: {
  params: { bucket: string };
  searchParams: { carpeta?: string };
}) {
  const bucket = decodeURIComponent(params.bucket);
  const info = getBucketInfo(bucket);
  if (!info || !esBucketValido(bucket)) notFound();

  const carpetas = getCarpetas(bucket);
  const carpeta = searchParams.carpeta || "";

  // Raíz: lista archivos + carpetas detectadas. Carpeta: solo archivos.
  const raiz = carpeta === "" ? await listarArchivos(bucket, "") : [];
  const archivos: Archivo[] =
    carpeta !== "" ? (await listarArchivos(bucket, carpeta)).filter((a) => !a.es_carpeta) : [];

  // Carpetas detectadas en la raíz que no están en la configuración (p. ej. productos/catalogo).
  const configuradas = new Set(carpetas.map((c) => c.carpeta));
  const extra = raiz.filter((f) => f.es_carpeta && !configuradas.has(f.name));

  // Conteo de archivos por carpeta configurada.
  const conteos = new Map<string, number>();
  if (carpeta === "") {
    await Promise.all(
      carpetas.map(async (c) => {
        try {
          const lista = await listarArchivos(bucket, c.carpeta);
          conteos.set(c.carpeta, lista.filter((a) => !a.es_carpeta).length);
        } catch {
          conteos.set(c.carpeta, 0);
        }
      }),
    );
  }

  const nombreCarpeta = carpeta
    ? getCarpetas(bucket).find((c) => c.carpeta === carpeta)?.nombre || carpeta
    : "";
  const archivosRaiz = raiz.filter((a) => !a.es_carpeta);
  const pathActual = carpeta; // para el uploader
  const carpetasValidas = carpeta === "" ? carpetas : [{ carpeta, nombre: nombreCarpeta }, ...carpetas];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-1.5 text-sm text-slate-500">
        <Link href="/multimedia" className="hover:text-brand-700 font-medium">
          Carga Multimedia
        </Link>
        <span>/</span>
        {carpeta === "" ? (
          <span className="font-semibold text-slate-900">{info.nombre}</span>
        ) : (
          <>
            <Link href={`/multimedia/${bucket}`} className="hover:text-brand-700 font-medium">
              {info.nombre}
            </Link>
            <span>/</span>
            <span className="font-semibold text-slate-900">{nombreCarpeta}</span>
          </>
        )}
      </nav>

      <PageHeader
        title={carpeta === "" ? info.nombre : nombreCarpeta}
        subtitle={
          carpeta === ""
            ? info.descripcion
            : `${archivos.length} archivo(s) en ${carpeta}`
        }
        action={<MultimediaUploader bucket={bucket} carpeta={pathActual} carpetas={carpetasValidas} />}
      />

      {/* Subcarpetas (solo en la raíz) */}
      {carpeta === "" && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
            {carpetas.map((c) => (
              <Link
                key={c.carpeta}
                href={`/multimedia/${bucket}?carpeta=${encodeURIComponent(c.carpeta)}`}
                className="group rounded-xl border border-slate-200 bg-white p-5 hover:border-brand-300 hover:shadow-sm transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-brand-50 grid place-items-center text-brand-600">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 group-hover:text-brand-700">{c.nombre}</div>
                      <div className="text-xs text-slate-400 font-mono">{c.carpeta}</div>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-slate-500 bg-slate-100 rounded-full px-2.5 py-1">
                    {conteos.get(c.carpeta) ?? 0}
                  </span>
                </div>
              </Link>
            ))}
            {extra.map((f) => (
              <Link
                key={f.name}
                href={`/multimedia/${bucket}?carpeta=${encodeURIComponent(f.name)}`}
                className="group rounded-xl border border-slate-200 bg-white p-5 hover:border-brand-300 hover:shadow-sm transition"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-slate-100 grid place-items-center text-slate-500">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 group-hover:text-brand-700">{f.name}</div>
                    <div className="text-xs text-slate-400">Carpeta</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {archivosRaiz.length > 0 && (
            <>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-3">
                Archivos en la raíz
              </h2>
              <MultimediaArchivos bucket={bucket} carpeta="" archivos={archivosRaiz} />
            </>
          )}
        </>
      )}

      {/* Archivos dentro de una carpeta */}
      {carpeta !== "" && <MultimediaArchivos bucket={bucket} carpeta={carpeta} archivos={archivos} />}
    </div>
  );
}
