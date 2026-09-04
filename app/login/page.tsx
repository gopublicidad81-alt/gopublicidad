"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error || "No se pudo iniciar sesión.");
      setSaving(false);
      return;
    }
    // Cookie seteada; navegamos al destino.
    router.replace(next);
    router.refresh();
  }

  return (
    <div className="min-h-screen grid place-items-center bg-slate-50 p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 justify-center mb-6">
          <div className="h-10 w-10 rounded-xl bg-brand-600 grid place-items-center text-white font-bold text-lg">E</div>
          <div>
            <div className="font-semibold text-slate-900 leading-tight">Ecostand</div>
            <div className="text-[11px] text-slate-400 leading-tight">CRM Leads · WhatsApp</div>
          </div>
        </div>

        <form onSubmit={onSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div>
            <h1 className="text-lg font-bold text-slate-900">Iniciar sesión</h1>
            <p className="text-sm text-slate-500">Ingresa tus credenciales para acceder al panel.</p>
          </div>

          <label className="block">
            <span className="text-xs font-medium text-slate-500">Correo</span>
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tucorreo@gmail.com"
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white py-2.5 px-3 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              required
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium text-slate-500">Clave</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white py-2.5 px-3 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              required
            />
          </label>

          {error && <div className="rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 text-sm text-rose-700">{error}</div>}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60 transition"
          >
            {saving ? "Entrando…" : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
