import { supabaseAdmin } from "./supabase";
import { Cliente, Conversacion, Lead, Mensaje, Vendedor } from "./types";

/** Vendedores. Devuelve [] si la tabla aún no existe (migración no aplicada). */
export async function getVendedores(): Promise<{ data: Vendedor[]; migrado: boolean }> {
  const { data, error } = await supabaseAdmin
    .from("vendedores")
    .select("*")
    .order("nombre", { ascending: true });
  if (error) return { data: [], migrado: false };
  return { data: (data ?? []) as Vendedor[], migrado: true };
}

/** Leads con cliente embebido y vendedor unido en JS (no depende de la FK de vendedores). */
export async function getLeads(): Promise<Lead[]> {
  const { data, error } = await supabaseAdmin
    .from("leads")
    .select("*, cliente:clientes(*)")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);

  const leads = (data ?? []) as Lead[];
  const { data: vendedores } = await getVendedores();
  const vmap = new Map(vendedores.map((v) => [v.id, v]));
  for (const l of leads) l.vendedor = l.vendedor_id ? vmap.get(l.vendedor_id) ?? null : null;
  return leads;
}

export async function getLead(id: string): Promise<Lead | null> {
  const { data, error } = await supabaseAdmin
    .from("leads")
    .select("*, cliente:clientes(*)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  const lead = data as Lead;
  if (lead.vendedor_id) {
    const { data: v } = await supabaseAdmin.from("vendedores").select("*").eq("id", lead.vendedor_id).maybeSingle();
    lead.vendedor = (v as Vendedor) ?? null;
  }
  return lead;
}

export async function getConversacionesByLead(leadId: string): Promise<Conversacion[]> {
  const { data } = await supabaseAdmin
    .from("conversaciones")
    .select("*")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: true });
  return (data ?? []) as Conversacion[];
}

export async function getMensajes(conversacionId: string): Promise<Mensaje[]> {
  const { data } = await supabaseAdmin
    .from("mensajes")
    .select("*")
    .eq("conversacion_id", conversacionId)
    .order("created_at", { ascending: true });
  return (data ?? []) as Mensaje[];
}

export interface ConversacionResumen extends Conversacion {
  lead: Lead | null;
  ultimo_mensaje: Mensaje | null;
  total_mensajes: number;
}

/** Lista de conversaciones con su lead y el último mensaje (para la bandeja). */
export async function getConversacionesInbox(): Promise<ConversacionResumen[]> {
  const { data: convs } = await supabaseAdmin
    .from("conversaciones")
    .select("*")
    .order("updated_at", { ascending: false });
  const conversaciones = (convs ?? []) as Conversacion[];
  if (conversaciones.length === 0) return [];

  const leadIds = Array.from(new Set(conversaciones.map((c) => c.lead_id).filter(Boolean)));
  const { data: leadsData } = await supabaseAdmin
    .from("leads")
    .select("*, cliente:clientes(*)")
    .in("id", leadIds);
  const leadMap = new Map((leadsData as Lead[] ?? []).map((l) => [l.id, l]));

  const convIds = conversaciones.map((c) => c.id);
  const { data: msgs } = await supabaseAdmin
    .from("mensajes")
    .select("*")
    .in("conversacion_id", convIds)
    .order("created_at", { ascending: true });
  const mensajes = (msgs ?? []) as Mensaje[];

  const lastByConv = new Map<string, Mensaje>();
  const countByConv = new Map<string, number>();
  for (const m of mensajes) {
    lastByConv.set(m.conversacion_id, m); // ascending → última gana
    countByConv.set(m.conversacion_id, (countByConv.get(m.conversacion_id) ?? 0) + 1);
  }

  return conversaciones.map((c) => ({
    ...c,
    lead: leadMap.get(c.lead_id) ?? null,
    ultimo_mensaje: lastByConv.get(c.id) ?? null,
    total_mensajes: countByConv.get(c.id) ?? 0,
  }));
}

export interface ClienteLite {
  id: string;
  nombre: string | null;
  empresa: string | null;
}

export async function getClientesMap(): Promise<Map<string, Cliente>> {
  const { data } = await supabaseAdmin.from("clientes").select("*");
  return new Map((data as Cliente[] ?? []).map((c) => [c.id, c]));
}
