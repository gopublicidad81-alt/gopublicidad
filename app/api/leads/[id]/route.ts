import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { ESTADOS } from "@/lib/types";
import { getLead } from "@/lib/data";
import { enviarAvisoAsignacion } from "@/lib/mail";

const MIGRACION_MSG =
  "Falta una columna en 'leads' (vendedor_id o procesado). Corre las migraciones de supabase/ en el SQL Editor de Supabase.";

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
  if ("procesado" in body) {
    patch.procesado = Boolean(body.procesado);
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Nada que actualizar." }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin.from("leads").update(patch).eq("id", params.id).select().single();
  if (error) {
    const msg = /(vendedor_id|procesado)/i.test(error.message) && /column|does not exist/i.test(error.message)
      ? MIGRACION_MSG
      : error.message;
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  // Aviso por correo al vendedor asignado (best-effort: no rompe el PATCH si falla).
  if (patch.vendedor_id) {
    try {
      const lead = await getLead(params.id);
      if (lead?.vendedor) {
        const res = await enviarAvisoAsignacion(lead.vendedor, lead);
        if (!res.ok && !res.skipped) console.error("[leads] aviso de asignación falló:", res.error);
      }
    } catch (e) {
      console.error("[leads] error enviando aviso de asignación:", e);
    }
  }

  return NextResponse.json({ data });
}
