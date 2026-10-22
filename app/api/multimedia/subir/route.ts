import { NextResponse } from "next/server";
import { esBucketValido, getCarpetas, subirArchivo } from "@/lib/multimedia";

export const dynamic = "force-dynamic";

/** POST multipart/form-data: bucket, carpeta (opcional), files[] */
export async function POST(req: Request) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Se esperaba multipart/form-data." }, { status: 400 });
  }

  const bucket = String(form.get("bucket") || "");
  const carpeta = String(form.get("carpeta") || "");
  const files = form.getAll("files").filter((f): f is File => f instanceof File);

  if (!esBucketValido(bucket)) {
    return NextResponse.json({ error: "Bucket no válido." }, { status: 400 });
  }
  if (files.length === 0) {
    return NextResponse.json({ error: "No se recibieron archivos." }, { status: 400 });
  }
  // La carpeta debe ser una de las configuradas (o vacía = raíz).
  if (carpeta && !getCarpetas(bucket).some((c) => c.carpeta === carpeta)) {
    return NextResponse.json({ error: "Carpeta no válida para este bucket." }, { status: 400 });
  }

  const subidos: { path: string; url: string }[] = [];
  const errores: { nombre: string; error: string }[] = [];

  for (const file of files) {
    // Conserva el nombre ORIGINAL (espacios incluidos — la convención del proyecto es
    // "Marca - Rubro.ext" y el bot la usa para detectar el rubro). Solo se evitan
    // barras de ruta y nombres vacíos.
    const limpio = file.name.trim().replace(/[/\\]+/g, "-");
    if (!limpio || limpio === "." || limpio === "..") {
      errores.push({ nombre: file.name, error: "Nombre de archivo no válido." });
      continue;
    }
    try {
      const bytes = await file.arrayBuffer();
      const res = await subirArchivo(bucket, carpeta, limpio, bytes, file.type || "application/octet-stream");
      subidos.push(res);
    } catch (e) {
      errores.push({ nombre: file.name, error: e instanceof Error ? e.message : "Error al subir." });
    }
  }

  return NextResponse.json({ subidos, errores });
}
