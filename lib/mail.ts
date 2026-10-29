import nodemailer from "nodemailer";
import { Lead, Vendedor } from "./types";
import { ESTADO_META } from "./ui";

// SMTP genérico (cPanel/hosting). Si no se define SMTP_*, cae en las variables
// GMAIL_* por compatibilidad con la configuración anterior.
const SMTP_USER = process.env.SMTP_USER || process.env.GMAIL_USER;
const SMTP_PASS = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;
const SMTP_HOST = process.env.SMTP_HOST || (process.env.GMAIL_USER ? "smtp.gmail.com" : undefined);
const SMTP_PORT = Number(process.env.SMTP_PORT || 465);
// secure=true para puerto 465 (SSL); false para 587 (STARTTLS). Se puede forzar con SMTP_SECURE.
const SMTP_SECURE = process.env.SMTP_SECURE
  ? process.env.SMTP_SECURE === "true"
  : SMTP_PORT === 465;
const MAIL_FROM = process.env.MAIL_FROM || (SMTP_USER ? `Ecostand CRM <${SMTP_USER}>` : undefined);
const APP_URL = (process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");

export function mailConfigurado(): boolean {
  return Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS);
}

let _transport: nodemailer.Transporter | null = null;
function getTransport() {
  if (_transport) return _transport;
  _transport = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return _transport;
}

function fila(label: string, value?: string | number | null): string {
  if (value === null || value === undefined || value === "") return "";
  return `<tr>
    <td style="padding:6px 12px;color:#64748b;font-size:13px;">${label}</td>
    <td style="padding:6px 12px;color:#0f172a;font-size:13px;font-weight:600;">${value}</td>
  </tr>`;
}

/**
 * Envía al vendedor el aviso de que se le asignó un lead/cotización.
 * Best-effort: si el correo no está configurado o falla, no lanza (devuelve estado).
 */
export async function enviarAvisoAsignacion(
  vendedor: Vendedor,
  lead: Lead
): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  if (!mailConfigurado()) return { ok: false, skipped: true, error: "mail no configurado" };
  if (!vendedor.email) return { ok: false, skipped: true, error: "vendedor sin email" };

  const cliente = lead.cliente?.nombre || lead.telefono || "Cliente";
  const estado = ESTADO_META[lead.estado]?.label ?? lead.estado;
  const link = `${APP_URL}/leads/${lead.id}`;

  const html = `
  <div style="font-family:ui-sans-serif,system-ui,Segoe UI,Roboto,sans-serif;background:#f8fafc;padding:24px;">
    <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;">
      <div style="background:#059669;padding:18px 24px;">
        <div style="color:#d1fae5;font-size:12px;letter-spacing:.04em;text-transform:uppercase;">Ecostand · CRM</div>
        <div style="color:#fff;font-size:18px;font-weight:700;margin-top:2px;">Nueva cotización asignada</div>
      </div>
      <div style="padding:24px;">
        <p style="color:#0f172a;font-size:15px;margin:0 0 16px;">
          Hola ${vendedor.nombre}, se te asignó un nuevo lead para atender.
        </p>
        <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;">
          ${fila("Cliente", cliente)}
          ${fila("Empresa", lead.cliente?.empresa)}
          ${fila("Teléfono", lead.telefono)}
          ${fila("Sector", lead.sector)}
          ${fila("Tipo de stand", lead.tipo_stand?.replace("_", " "))}
          ${fila("Metros²", lead.m2 != null ? `${lead.m2} m²` : null)}
          ${fila("Feria", lead.feria)}
          ${fila("Ciudad", lead.ciudad)}
          ${fila("Estado", estado)}
          ${fila("Score", `${lead.score}/100`)}
          ${lead.urgente ? fila("Prioridad", "⚠️ URGENTE") : ""}
        </table>
        ${lead.resumen ? `<p style="margin:16px 0 0;padding:12px;background:#f1f5f9;border-radius:8px;color:#475569;font-size:13px;">${lead.resumen}</p>` : ""}
        <a href="${link}" style="display:inline-block;margin-top:20px;background:#059669;color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:11px 20px;border-radius:9px;">
          Ver la cotización →
        </a>
        <p style="color:#94a3b8;font-size:11px;margin:20px 0 0;">Este es un aviso automático del CRM de Ecostand.</p>
      </div>
    </div>
  </div>`;

  try {
    await getTransport().sendMail({
      from: MAIL_FROM,
      to: vendedor.email,
      subject: `🟢 Nueva cotización asignada: ${cliente}`,
      html,
    });
    return { ok: true };
  } catch (e: any) {
    console.error("[mail] error enviando aviso:", e?.message);
    return { ok: false, error: e?.message ?? "error desconocido" };
  }
}

/** Destinatarios del aviso de lead nuevo (env LEADS_NOTIFICAR_A, separados por coma). */
function destinatariosNuevoLead(): string[] {
  return (process.env.LEADS_NOTIFICAR_A || "nicolas@go-publicidad.cl,gopublicidad81@gmail.com")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Envía el aviso de lead nuevo (llega por WhatsApp) a la bandeja del equipo.
 * Best-effort: si el correo no está configurado o falla, no lanza.
 */
export async function enviarAvisoNuevoLead(
  lead: Lead
): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  const to = destinatariosNuevoLead();
  if (!mailConfigurado()) return { ok: false, skipped: true, error: "mail no configurado" };
  if (to.length === 0) return { ok: false, skipped: true, error: "sin destinatarios" };

  const cliente = lead.cliente?.nombre || lead.telefono || "Cliente";
  const link = `${APP_URL}/leads/${lead.id}`;

  const html = `
  <div style="font-family:ui-sans-serif,system-ui,Segoe UI,Roboto,sans-serif;background:#f8fafc;padding:24px;">
    <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;">
      <div style="background:#1d4ed8;padding:18px 24px;">
        <div style="color:#dbeafe;font-size:12px;letter-spacing:.04em;text-transform:uppercase;">Ecostand · CRM</div>
        <div style="color:#fff;font-size:18px;font-weight:700;margin-top:2px;">Nuevo lead desde WhatsApp</div>
      </div>
      <div style="padding:24px;">
        <p style="color:#0f172a;font-size:15px;margin:0 0 16px;">
          Entró un lead nuevo a la bandeja del CRM.
        </p>
        <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;">
          ${fila("Cliente", cliente)}
          ${fila("Empresa", lead.cliente?.empresa)}
          ${fila("Teléfono", lead.telefono)}
          ${fila("Sector", lead.sector)}
          ${fila("Tipo de stand", lead.tipo_stand?.replace("_", " "))}
          ${fila("Metros²", lead.m2 != null ? `${lead.m2} m²` : null)}
          ${fila("Feria", lead.feria)}
          ${fila("Ciudad", lead.ciudad)}
          ${fila("Ubicación", lead.ubicacion)}
          ${fila("Score", `${lead.score}/100`)}
          ${lead.urgente ? fila("Prioridad", "⚠️ URGENTE") : ""}
        </table>
        ${lead.resumen ? `<p style="margin:16px 0 0;padding:12px;background:#f1f5f9;border-radius:8px;color:#475569;font-size:13px;">${lead.resumen}</p>` : ""}
        <a href="${link}" style="display:inline-block;margin-top:20px;background:#1d4ed8;color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:11px 20px;border-radius:9px;">
          Abrir en el CRM →
        </a>
        <p style="color:#94a3b8;font-size:11px;margin:20px 0 0;">Este es un aviso automático del CRM de Ecostand.</p>
      </div>
    </div>
  </div>`;

  try {
    await getTransport().sendMail({
      from: MAIL_FROM,
      to: to.join(", "),
      subject: `📥 Nuevo lead: ${cliente}`,
      html,
    });
    return { ok: true };
  } catch (e: any) {
    console.error("[mail] error enviando aviso de lead nuevo:", e?.message);
    return { ok: false, error: e?.message ?? "error desconocido" };
  }
}
