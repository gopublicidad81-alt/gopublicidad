# Fronteco — CRM de Leads & WhatsApp (Ecostand)

Panel para ver los leads generados por WhatsApp (ZAVU), leer las conversaciones y
gestionar vendedores. Hecho con **Next.js 14 + TypeScript + Tailwind + Supabase**.

## Puesta en marcha

```bash
npm install
npm run dev
```

Abre http://localhost:3000

## ⚠️ Paso obligatorio: migración de vendedores

La tabla `leads` no traía columna de vendedor. Para poder asignar vendedores:

1. Entra a **Supabase → SQL Editor → New query**
2. Pega el contenido de [`supabase/migration.sql`](supabase/migration.sql)
3. **Run**

Eso crea la tabla `vendedores` y agrega `leads.vendedor_id`. Mientras no lo corras,
el panel funciona igual pero muestra un aviso y no deja asignar vendedores.

**Migración 02 (estado de gestión):** corre también
[`supabase/migration-02-procesado.sql`](supabase/migration-02-procesado.sql). Agrega
`leads.procesado` (boolean) para el switch **En proceso / Listo** de cada lead
asignado, visible en la vista de Vendedores y en el detalle del lead.

## Estructura

| Ruta | Qué hace |
|------|----------|
| `/` | Dashboard: KPIs, pipeline por estado, leads recientes |
| `/leads` | Tabla de leads con búsqueda y filtros; asignar vendedor inline |
| `/leads/[id]` | Detalle del lead + conversación WhatsApp + cambiar estado/vendedor |
| `/conversaciones` | Bandeja tipo inbox con todas las conversaciones |
| `/vendedores` | Alta/baja de vendedores y su carga de leads |

## Acceso (login)

El panel está protegido con un login de un solo usuario (middleware + cookie de
sesión firmada). Se configura con variables de entorno:

- `AUTH_EMAIL` — correo de acceso
- `AUTH_PASSWORD` — clave
- `AUTH_SECRET` — secreto para firmar la sesión (genera uno largo y aleatorio)

Sin sesión válida, todo redirige a `/login`. La clave nunca viaja al navegador ni
se guarda en git.

## Deploy en Vercel

1. Sube el repo a GitHub (ya está).
2. En Vercel: **Add New → Project** → importa el repo `gopublicidad`.
3. Framework: **Next.js** (autodetectado). No cambies el build.
4. En **Environment Variables** agrega (Production + Preview):

   | Variable | Valor |
   |----------|-------|
   | `SUPABASE_URL` | tu URL de Supabase |
   | `SUPABASE_ANON_KEY` | anon key |
   | `SUPABASE_SERVICE_ROLE` | service_role key |
   | `AUTH_EMAIL` | correo de acceso |
   | `AUTH_PASSWORD` | clave de acceso |
   | `AUTH_SECRET` | secreto aleatorio largo |
   | `APP_URL` | la URL final de Vercel (ej. https://fronteco.vercel.app) |

5. **Deploy**. Vercel te da la URL. Luego actualiza `APP_URL` con esa URL y
   redeploy (para que los links de correos apunten bien).

> Las páginas usan render dinámico y los datos de Supabase van con `no-store`,
> así que en Vercel siempre ves datos frescos.

## Deploy con Docker (servidor)

La imagen usa el output **standalone** de Next (imagen chica, sin dev deps).
Las claves de Supabase **no** van en la imagen: se inyectan en runtime.

En el servidor, tras clonar el repo desde git:

```bash
# 1) Crear el archivo de entorno (NO está en git)
cp .env.example .env.local
nano .env.local            # pega tus claves reales de Supabase

# 2) Levantar
docker compose up -d --build

# App en http://localhost:3000  (ponle un reverse proxy / dominio delante)
```

Comandos útiles:

```bash
docker compose logs -f       # ver logs
docker compose down          # detener
docker compose up -d --build # re-desplegar tras un git pull
```

Sin compose (Docker a mano):

```bash
docker build -t fronteco .
docker run -d --name fronteco -p 3000:3000 --env-file .env.local fronteco
```

> El build **no** necesita las claves (el cliente Supabase se inicializa de forma
> lazy); solo se requieren al ejecutar el contenedor.

## Seguridad

- Las claves de Supabase están en `.env.local` (ignorado por git).
- El `service_role` **solo se usa en el servidor** (`lib/supabase.ts`, server
  components y rutas `/api`). Nunca llega al navegador.
- Es una herramienta interna sin login. Si la vas a exponer en internet, primero
  hay que agregar autenticación.

## Datos (Supabase)

`clientes` → `leads` (cliente_id) → `conversaciones` (lead_id) → `mensajes` (conversacion_id).
Los mensajes son de solo lectura; los gestiona ZAVU.
