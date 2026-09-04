import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const MIGRACION_MSG =
  "La tabla 'vendedores' no existe todavía. Corre supabase/migration.sql en el SQL Editor de Supabase.";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body?.nombre || typeof body.nombre !== "string" || !body.nombre.trim()) {
    return NextResponse.json({ error: "El nombre es obligatorio." }, { status: 400 });
  }
  const { data, error } = await supabaseAdmin
    .from("vendedores")
    .insert({
      nombre: body.nombre.trim(),
      email: body.email?.trim() || null,
      telefono: body.telefono?.trim() || null,
    })
    .select()
    .single();

  if (error) {
    const msg = /relation .*vendedores.* does not exist/i.test(error.message) ? MIGRACION_MSG : error.message;
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  return NextResponse.json({ data });
}

export async function PATCH(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body?.id) return NextResponse.json({ error: "Falta id." }, { status: 400 });
  const patch: Record<string, unknown> = {};
  if (typeof body.activo === "boolean") patch.activo = body.activo;
  if (typeof body.nombre === "string" && body.nombre.trim()) patch.nombre = body.nombre.trim();
  if ("email" in body) patch.email = body.email?.trim() || null;
  if ("telefono" in body) patch.telefono = body.telefono?.trim() || null;

  const { data, error } = await supabaseAdmin.from("vendedores").update(patch).eq("id", body.id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Falta id." }, { status: 400 });
  const { error } = await supabaseAdmin.from("vendedores").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
