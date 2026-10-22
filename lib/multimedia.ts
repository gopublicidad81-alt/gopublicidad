import { supabaseAdmin } from "@/lib/supabase";

/** ── Configuración de Carga Multimedia (buckets + carpetas con nombre amigable) ── */

export type BucketInfo = {
  bucket: string;
  nombre: string;
  descripcion: string;
};

export type CarpetaInfo = {
  carpeta: string;
  nombre: string;
};

export const BUCKETS: BucketInfo[] = [
  {
    bucket: "categorias-stand",
    nombre: "Categorías de Stand",
    descripcion: "Renders por categoría (ministand, mediano, pantallas, exterior, interior gran tamaño)",
  },
  {
    bucket: "imagenes_proyectos",
    nombre: "Imágenes Proyectos",
    descripcion: "Fotos reales de proyectos montados, por tamaño de stand",
  },
  {
    bucket: "productos",
    nombre: "Productos",
    descripcion: "Renders de productos y catálogos en PDF",
  },
];

/** Subcarpetas con nombre amigable. "" = archivos en la raíz del bucket. */
export const CARPETAS_POR_BUCKET: Record<string, CarpetaInfo[]> = {
  "categorias-stand": [
    { carpeta: "ministand", nombre: "Ministand" },
    { carpeta: "mediano_stand", nombre: "Stand Mediano" },
    { carpeta: "proyectos_pantalla_led", nombre: "Proyectos Pantalla LED" },
    { carpeta: "stand_exterior_gran_tamano", nombre: "Stand Exterior Gran Tamaño" },
    { carpeta: "stand_interior_gran_tamano", nombre: "Stand Interior Gran Tamaño" },
  ],
  "imagenes_proyectos": [
    { carpeta: "mini_stand", nombre: "Mini Stand" },
    { carpeta: "medio_stand", nombre: "Medio Stand" },
    { carpeta: "stand_exteriores", nombre: "Stands Exteriores" },
    { carpeta: "stand_interiores", nombre: "Stands Interiores" },
  ],
  "productos": [], // sin subcarpetas fijas: se muestran las que existan + archivos de raíz
};

export function getBucketInfo(bucket: string): BucketInfo | null {
  return BUCKETS.find((b) => b.bucket === bucket) || null;
}

export function getCarpetas(bucket: string): CarpetaInfo[] {
  return CARPETAS_POR_BUCKET[bucket] || [];
}

export function esBucketValido(bucket: string): boolean {
  return BUCKETS.some((b) => b.bucket === bucket);
}

export type Archivo = {
  name: string;
  size: number;
  updated_at: string | null;
  es_carpeta: boolean;
  url: string;
};

/** URL pública de un objeto (los buckets del proyecto son públicos). */
export function publicUrl(bucket: string, path: string): string {
  const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/** Lista archivos (y carpetas) de un bucket, opcionalmente dentro de una carpeta. */
export async function listarArchivos(bucket: string, carpeta?: string): Promise<Archivo[]> {
  const opts = { limit: 1000, offset: 0, search: "" };
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .list(carpeta && carpeta !== "" ? carpeta : "", opts);
  if (error) throw new Error(error.message);
  const base = carpeta && carpeta !== "" ? `${carpeta}/` : "";
  return (data || [])
    .filter((f) => f.name !== ".emptyFolderPlaceholder")
    .map((f) => {
      const esCarpeta = !f.id; // las carpetas llegan sin id en Storage
      return {
        name: f.name,
        size: f.metadata?.size ?? 0,
        updated_at: f.updated_at ?? null,
        es_carpeta: esCarpeta,
        url: esCarpeta ? "" : publicUrl(bucket, base + f.name),
      };
    })
    .sort((a, b) => Number(b.es_carpeta) - Number(a.es_carpeta) || a.name.localeCompare(b.name));
}

/** Sube un archivo (sobrescribe si existe el mismo nombre → la URL no cambia). */
export async function subirArchivo(
  bucket: string,
  carpeta: string,
  nombre: string,
  bytes: ArrayBuffer,
  contentType: string,
): Promise<{ path: string; url: string }> {
  const path = carpeta && carpeta !== "" ? `${carpeta}/${nombre}` : nombre;
  const { error } = await supabaseAdmin.storage.from(bucket).upload(path, bytes, {
    contentType,
    upsert: true, // re-subir el mismo nombre ACTUALIZA el archivo (URL estable)
  });
  if (error) throw new Error(error.message);
  return { path, url: publicUrl(bucket, path) };
}

/** Borra archivos por ruta completa (carpeta incluida). */
export async function borrarArchivos(bucket: string, paths: string[]): Promise<string[]> {
  const { data, error } = await supabaseAdmin.storage.from(bucket).remove(paths);
  if (error) throw new Error(error.message);
  return (data || []).map((d) => d.name);
}

/** Cuenta archivos por carpeta configurada (para la vista principal). */
export async function contarPorCarpeta(bucket: string): Promise<Record<string, number>> {
  const carpetas = getCarpetas(bucket);
  const out: Record<string, number> = {};
  for (const c of carpetas) {
    try {
      const archivos = await listarArchivos(bucket, c.carpeta);
      out[c.carpeta] = archivos.filter((a) => !a.es_carpeta).length;
    } catch {
      out[c.carpeta] = 0;
    }
  }
  return out;
}
