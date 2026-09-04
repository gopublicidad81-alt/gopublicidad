import { NextResponse } from "next/server";
import { SESSION_COOKIE, SESSION_MAX_AGE_SEC, crearSesion, timingSafeEqual } from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const email = String(body?.email ?? "").trim().toLowerCase();
  const password = String(body?.password ?? "");

  const AUTH_EMAIL = (process.env.AUTH_EMAIL || "").trim().toLowerCase();
  const AUTH_PASSWORD = process.env.AUTH_PASSWORD || "";
  const AUTH_SECRET = process.env.AUTH_SECRET || "";

  if (!AUTH_EMAIL || !AUTH_PASSWORD || !AUTH_SECRET) {
    return NextResponse.json(
      { error: "Login no configurado (faltan AUTH_EMAIL / AUTH_PASSWORD / AUTH_SECRET)." },
      { status: 500 }
    );
  }

  const emailOk = email.length === AUTH_EMAIL.length && timingSafeEqual(email, AUTH_EMAIL);
  const passOk = password.length === AUTH_PASSWORD.length && timingSafeEqual(password, AUTH_PASSWORD);
  if (!emailOk || !passOk) {
    return NextResponse.json({ error: "Correo o clave incorrectos." }, { status: 401 });
  }

  const token = await crearSesion(AUTH_SECRET);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    // secure solo si sirves por HTTPS (según APP_URL). Así funciona también
    // detrás de http://IP:3000 en un VPS sin HTTPS.
    secure: (process.env.APP_URL || "").startsWith("https://"),
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SEC,
  });
  return res;
}
