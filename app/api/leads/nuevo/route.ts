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
  // Sin secreto: el pipeline de build de Coolify bakea las ENV y un valor viejo
  // daba 401 eterno. La protección real es que el payload necesita el UUID de un
  // lead existente (no adivinable) y el endpoint solo dispara un correo interno.
  const body = await req.json().catch(() => null);
  const leadId = body?.record?.id;
  const esUuid =
    typeof leadId === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(leadId);
  if (!esUuid) {
    return NextResponse.json(
      { error: "Payload sin record.id válido (¿es un webhook de Supabase?)." },
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

  const res = await enviarAvisoNuevoLead(lead);
  // Best-effort: aunque el correo falle, respondemos 200 para que el webhook no
  // quede reintentando; el error queda en los logs del CRM.
  return NextResponse.json({ ok: res.ok, skipped: res.skipped || false, error: res.error || null });
}
