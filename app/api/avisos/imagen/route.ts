import { NextResponse } from "next/server";
import { getLead } from "@/lib/data";
import { enviarAvisoImagen } from "@/lib/mail";

export const dynamic = "force-dynamic";

/**
 * Alerta al equipo por correo: el cliente envió una IMAGEN que el bot no pudo
 * interpretar automáticamente (falló la visión) → se derivó a ejecutivo.
 * Lo llama el bot Ecostand (agent._avisar_crm_imagen).
 * Body: { record: { id: <lead-uuid> }, nota?, imagen? }
 * Ruta pública en middleware.ts (la validación real es el UUID del lead).
 */
function esUuid(v: unknown): boolean {
  return (
    typeof v === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)
  );
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const leadId = body?.record?.id;
  if (!esUuid(leadId)) {
    return NextResponse.json(
      { error: "Payload sin record.id válido." },
      { status: 400 },
    );
  }

  let lead = null;
  try {
    lead = await getLead(String(leadId));
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error leyendo el lead." },
      { status: 500 },
    );
  }
  if (!lead) {
    return NextResponse.json({ error: "Lead no encontrado." }, { status: 404 });
  }

  const nota = typeof body?.nota === "string" ? body.nota.slice(0, 500) : null;
  const imagen =
    typeof body?.imagen === "string" && /^https?:\/\//i.test(body.imagen)
      ? body.imagen.slice(0, 800)
      : null;

  const res = await enviarAvisoImagen(lead, nota, imagen);
  // Best-effort: aunque el correo falle, respondemos 200 con el detalle.
  return NextResponse.json({
    ok: res.ok,
    skipped: res.skipped || false,
    error: res.error || null,
  });
}
