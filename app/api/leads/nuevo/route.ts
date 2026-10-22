import { NextResponse } from "next/server";
import { getLead } from "@/lib/data";
import { enviarAvisoNuevoLead } from "@/lib/mail";

export const dynamic = "force-dynamic";

/**
 * Aviso de lead NUEVO por correo (nicolas@go-publicidad.cl + gopublicidad81@gmail.com
 * por defecto; configurable en LEADS_NOTIFICAR_A).
 *
 * Lo llama el Database Webhook de Supabase cuando hay un INSERT en la tabla `leads`
 * (Dashboard → Database → Webhooks). El webhook envía { type, table, record: {...} }.
 * Autenticación por header secreto: x-webhook-secret = LEADS_WEBHOOK_SECRET.
 */
export async function POST(req: Request) {
  const secret = process.env.LEADS_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Falta LEADS_WEBHOOK_SECRET en las variables de entorno." },
      { status: 500 },
    );
  }
  if (req.headers.get("x-webhook-secret") !== secret) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const leadId = body?.record?.id;
  if (!leadId) {
    return NextResponse.json({ error: "Payload sin record.id (¿es un webhook de Supabase?)." }, { status: 400 });
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

  const res = await enviarAvisoNuevoLead(lead);
  // Best-effort: aunque el correo falle, respondemos 200 para que el webhook no
  // quede reintentando; el error queda en los logs del CRM.
  return NextResponse.json({ ok: res.ok, skipped: res.skipped || false, error: res.error || null });
}
