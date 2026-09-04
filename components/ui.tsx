import { EstadoLead } from "@/lib/types";
import { ESTADO_META, scoreColor, avatarColor, initials } from "@/lib/ui";

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function EstadoBadge({ estado }: { estado: EstadoLead }) {
  const m = ESTADO_META[estado] ?? ESTADO_META.nuevo;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${m.className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
}

export function ScoreBadge({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-2 min-w-[80px]">
      <div className="h-1.5 w-14 rounded-full bg-slate-100 overflow-hidden">
        <div
          className={`h-full rounded-full ${score >= 70 ? "bg-emerald-500" : score >= 40 ? "bg-amber-500" : "bg-slate-400"}`}
          style={{ width: `${Math.max(4, score)}%` }}
        />
      </div>
      <span className={`text-xs font-semibold tabular-nums ${scoreColor(score)}`}>{score}</span>
    </div>
  );
}

export function Avatar({ name, size = 36 }: { name?: string | null; size?: number }) {
  return (
    <div
      className={`grid place-items-center rounded-full text-white font-semibold uppercase shrink-0 ${avatarColor(name)}`}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials(name)}
    </div>
  );
}

export function KpiCard({
  label,
  value,
  sub,
  accent = "brand",
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  accent?: "brand" | "blue" | "amber" | "rose" | "slate";
}) {
  const ring: Record<string, string> = {
    brand: "from-brand-500/10 to-brand-500/0 text-brand-700",
    blue: "from-blue-500/10 to-blue-500/0 text-blue-700",
    amber: "from-amber-500/10 to-amber-500/0 text-amber-700",
    rose: "from-rose-500/10 to-rose-500/0 text-rose-700",
    slate: "from-slate-500/10 to-slate-500/0 text-slate-700",
  };
  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`absolute inset-0 bg-gradient-to-br ${ring[accent]} pointer-events-none`} />
      <div className="relative">
        <div className="text-sm font-medium text-slate-500">{label}</div>
        <div className="mt-2 text-3xl font-bold text-slate-900 tabular-nums">{value}</div>
        {sub && <div className="mt-1 text-xs text-slate-400">{sub}</div>}
      </div>
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="grid place-items-center rounded-xl border border-dashed border-slate-300 bg-white/50 py-16 text-center">
      <div className="text-slate-500 font-medium">{title}</div>
      {hint && <div className="text-sm text-slate-400 mt-1 max-w-md">{hint}</div>}
    </div>
  );
}
