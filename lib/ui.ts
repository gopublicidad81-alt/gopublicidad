import { EstadoLead } from "./types";

export const ESTADO_META: Record<EstadoLead, { label: string; className: string; dot: string }> = {
  nuevo: { label: "Nuevo", className: "bg-slate-100 text-slate-700 ring-slate-200", dot: "bg-slate-400" },
  conversando: { label: "Conversando", className: "bg-blue-50 text-blue-700 ring-blue-200", dot: "bg-blue-500" },
  calificado: { label: "Calificado", className: "bg-indigo-50 text-indigo-700 ring-indigo-200", dot: "bg-indigo-500" },
  propuesta: { label: "Propuesta", className: "bg-amber-50 text-amber-700 ring-amber-200", dot: "bg-amber-500" },
  negociacion: { label: "Negociación", className: "bg-orange-50 text-orange-700 ring-orange-200", dot: "bg-orange-500" },
  ganado: { label: "Ganado", className: "bg-emerald-50 text-emerald-700 ring-emerald-200", dot: "bg-emerald-500" },
  perdido: { label: "Perdido", className: "bg-rose-50 text-rose-700 ring-rose-200", dot: "bg-rose-500" },
  derivado: { label: "Derivado", className: "bg-violet-50 text-violet-700 ring-violet-200", dot: "bg-violet-500" },
};

export function scoreColor(score: number): string {
  if (score >= 70) return "text-emerald-600";
  if (score >= 40) return "text-amber-600";
  return "text-slate-500";
}

export function scoreBar(score: number): string {
  if (score >= 70) return "bg-emerald-500";
  if (score >= 40) return "bg-amber-500";
  return "bg-slate-400";
}

export function initials(name?: string | null): string {
  if (!name) return "?";
  // Toma la primera letra/número de las dos primeras palabras, de forma segura
  // por code points (Array.from) para no cortar emojis por la mitad y evitar
  // el carácter roto "�" que rompe la hidratación de React.
  const words = name.trim().split(/\s+/).filter(Boolean);
  const letras = words
    .map((w) => Array.from(w).find((ch) => /[\p{L}\p{N}]/u.test(ch)))
    .filter((ch): ch is string => Boolean(ch))
    .slice(0, 2);
  return letras.join("") || "?";
}

// Zona horaria fija: el server (Coolify) suele correr en UTC y el cliente en
// America/Santiago; sin fijarla, las fechas difieren y rompen la hidratación.
const TZ = "America/Santiago";

export function fmtDate(iso?: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric", timeZone: TZ });
}

export function fmtDateTime(iso?: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("es-CL", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TZ,
  });
}

export function timeAgo(iso?: string | null): string {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "recién";
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  return `hace ${d} d`;
}

const AVATAR_COLORS = [
  "bg-rose-500", "bg-pink-500", "bg-fuchsia-500", "bg-violet-500", "bg-indigo-500",
  "bg-blue-500", "bg-sky-500", "bg-teal-500", "bg-emerald-500", "bg-amber-500",
];

export function avatarColor(seed?: string | null): string {
  if (!seed) return "bg-slate-400";
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[Math.abs(h)];
}
