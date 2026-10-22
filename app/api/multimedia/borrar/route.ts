import { NextResponse } from "next/server";
import { borrarArchivos, esBucketValido } from "@/lib/multimedia";

export const dynamic = "force-dynamic";

/** POST JSON: { bucket, paths: string[] } — paths completos ("carpeta/archivo.png"). */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const bucket = String(body?.bucket || "");
  const paths: unknown = body?.paths;

  if (!esBucketValido(bucket)) {
    return NextResponse.json({ error: "Bucket no válido." }, { status: 400 });
  }
  if (!Array.isArray(paths) || paths.length === 0 || !paths.every((p) => typeof p === "string")) {
    return NextResponse.json({ error: "Debes indicar los archivos a borrar." }, { status: 400 });
  }

  try {
    const borrados = await borrarArchivos(bucket, paths as string[]);
    return NextResponse.json({ borrados });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error borrando archivos.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
