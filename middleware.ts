import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verificarSesion } from "@/lib/auth";

// Rutas que no requieren sesión.
// /api/leads/nuevo y /api/avisos/imagen: webhooks del bot (aviso de lead nuevo
// y alerta de imagen). Se validan por UUID del lead dentro de cada ruta; NO
// requieren cookie de sesión.
const PUBLICAS = ["/login", "/api/login", "/api/logout", "/api/leads/nuevo", "/api/avisos/imagen"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLICAS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const ok = await verificarSesion(process.env.AUTH_SECRET || "", token);
  if (ok) return NextResponse.next();

  // API → 401; páginas → redirige a /login
  if (pathname.startsWith("/api")) {
    return new NextResponse(JSON.stringify({ error: "No autorizado" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  // Aplica a todo excepto estáticos de Next y el favicon.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
