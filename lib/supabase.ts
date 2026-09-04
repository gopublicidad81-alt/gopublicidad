import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

/** Crea el cliente admin (service_role) la primera vez que se usa (no en build). */
function getClient(): SupabaseClient {
  if (_client) return _client;
  const url = process.env.SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE;
  if (!url || !serviceRole) {
    throw new Error(
      "Faltan variables de entorno SUPABASE_URL / SUPABASE_SERVICE_ROLE. " +
        "En local usa .env.local; en Docker pásalas con --env-file o env_file."
    );
  }
  _client = createClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      // Evita que Next.js cachee las respuestas GET de Supabase (si no, la
      // lista queda con datos viejos/vacíos aunque la base ya tenga filas).
      fetch: (input, init) => fetch(input as RequestInfo, { ...init, cache: "no-store" }),
    },
  });
  return _client;
}

/**
 * Cliente admin (service_role). SOLO se usa en el servidor
 * (server components, route handlers). Nunca importar desde componentes "use client".
 *
 * Es un Proxy que inicializa el cliente real en el primer acceso, para que
 * `next build` no falle aunque las claves no estén presentes en tiempo de build.
 */
export const supabaseAdmin: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const client = getClient();
    const value = Reflect.get(client as object, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
