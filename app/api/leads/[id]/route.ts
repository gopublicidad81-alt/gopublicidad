import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { ESTADOS } from "@/lib/types";

const MIGRACION_MSG =
  "La columna 'vendedor_id' no existe todavía. Corre supabase/migration.sql en el SQL Editor de Supabase.";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Body inválido." }, { status: 400 });

  const patch: Record<string, unknown> = {};

  if ("vendedor_id" in body) {
    patch.vendedor_id = body.vendedor_id || null; // "" o null → desasignar
  }
  if ("estado" in body) {
    if (!ESTADOS.includes(body.estado)) {
      return NextResponse.json({ error: "Estado inválido." }, { status: 400 });
    }
    patch.estado = body.estado;
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Nada que actualizar." }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin.from("leads").update(patch).eq("id", params.id).select().single();
  if (error) {
    const msg = /vendedor_id/i.test(error.message) && /column|does not exist/i.test(error.message)
      ? MIGRACION_MSG
      : error.message;
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  return NextResponse.json({ data });
}
