-- ============================================================
-- Migración FRONTECO: tabla vendedores + asignación en leads
-- Ejecutar en Supabase → SQL Editor → New query → Run
-- Es idempotente: se puede correr varias veces sin romper nada.
-- ============================================================

-- 1) Tabla de vendedores
create table if not exists public.vendedores (
  id uuid not null default gen_random_uuid(),
  nombre text not null,
  email text null,
  telefono text null,
  activo boolean not null default true,
  created_at timestamp with time zone not null default now(),
  constraint vendedores_pkey primary key (id)
);

-- 2) Columna vendedor_id en leads (FK a vendedores)
alter table public.leads
  add column if not exists vendedor_id uuid null;

do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where constraint_name = 'leads_vendedor_id_fkey'
      and table_name = 'leads'
  ) then
    alter table public.leads
      add constraint leads_vendedor_id_fkey
      foreign key (vendedor_id)
      references public.vendedores (id)
      on delete set null;
  end if;
end $$;

-- 3) Índice para filtrar leads por vendedor
create index if not exists idx_leads_vendedor
  on public.leads using btree (vendedor_id);

-- 4) Permisos: el frontend usa el rol service_role (server-side).
--    Sin este GRANT la tabla da "permission denied for table vendedores".
grant all on public.vendedores to service_role;

-- 5) RLS activado: bloquea el acceso directo por API con la anon key.
--    service_role (que usa el frontend en el servidor) ignora RLS igualmente.
alter table public.vendedores enable row level security;

-- Listo. Recarga el dashboard.
