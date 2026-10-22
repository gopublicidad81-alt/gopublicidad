import { NextResponse } from "next/server";
import {
  esBucketValido,
  listarArchivos,
  publicUrl,
} from "@/lib/multimedia";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const bucket = searchParams.get("bucket") || "";
  const carpeta = searchParams.get("carpeta") || "";

  if (!esBucketValido(bucket)) {
    return NextResponse.json({ error: "Bucket no válido." }, { status: 400 });
  }

  try {
    const archivos = await listarArchivos(bucket, carpeta);
    return NextResponse.json({
      archivos: archivos.map((a) => ({
        name: a.name,
        size: a.size,
        updated_at: a.updated_at,
        es_carpeta: a.es_carpeta,
        url: a.es_carpeta ? "" : publicUrl(bucket, (carpeta ? carpeta + "/" : "") + a.name),
      })),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error listando el bucket.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
