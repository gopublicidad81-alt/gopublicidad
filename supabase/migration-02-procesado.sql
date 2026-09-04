-- ============================================================
-- Migración 02 FRONTECO: estado de gestión del vendedor
-- Cada lead asignado arranca "en proceso" (procesado = false).
-- El vendedor lo marca como listo con el switch (procesado = true).
-- Ejecutar en Supabase → SQL Editor → Run. Idempotente.
-- ============================================================

alter table public.leads
  add column if not exists procesado boolean not null default false;

create index if not exists idx_leads_procesado
  on public.leads using btree (procesado);

-- Listo. Recarga el dashboard.
