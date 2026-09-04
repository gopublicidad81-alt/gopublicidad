"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV = [
  { href: "/", label: "Dashboard", icon: "grid" },
  { href: "/leads", label: "Leads", icon: "users" },
  { href: "/conversaciones", label: "Conversaciones", icon: "chat" },
  { href: "/vendedores", label: "Vendedores", icon: "badge" },
];

function Icon({ name }: { name: string }) {
  const common = "h-5 w-5";
  switch (name) {
    case "grid":
      return (<svg className={common} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h1.5A2.25 2.25 0 019.75 6v1.5A2.25 2.25 0 017.5 9.75H6A2.25 2.25 0 013.75 7.5V6zM3.75 16.5A2.25 2.25 0 016 14.25h1.5a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 017.5 20.25H6A2.25 2.25 0 013.75 18v-1.5zM14.25 6A2.25 2.25 0 0116.5 3.75H18A2.25 2.25 0 0120.25 6v1.5A2.25 2.25 0 0118 9.75h-1.5A2.25 2.25 0 0114.25 7.5V6zM14.25 16.5a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-1.5A2.25 2.25 0 0114.25 18v-1.5z" /></svg>);
    case "users":
      return (<svg className={common} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>);
    case "chat":
      return (<svg className={common} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.019z" /></svg>);
    case "badge":
      return (<svg className={common} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9a9.75 9.75 0 00-.372-.372c.36-.216.75-.375 1.152-.472C8.24 17.62 9.06 17.25 10 17.25h4c.94 0 1.76.37 2.72.656.402.097.792.256 1.152.472A9.75 9.75 0 0016.5 18.75zM18 8.25a6 6 0 11-12 0 6 6 0 0112 0z" /></svg>);
    default:
      return null;
  }
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  // No mostrar el sidebar en el login.
  if (pathname === "/login" || pathname.startsWith("/login/")) return null;

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="flex items-center gap-2 px-5 h-16 border-b border-slate-100">
        <div className="h-8 w-8 rounded-lg bg-brand-600 grid place-items-center text-white font-bold">E</div>
        <div>
          <div className="font-semibold leading-tight">Ecostand</div>
          <div className="text-[11px] text-slate-400 leading-tight">CRM Leads · WhatsApp</div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {NAV.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                active
                  ? "bg-brand-50 text-brand-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon name={item.icon} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-slate-100">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /></svg>
          Cerrar sesión
        </button>
        <div className="px-3 pt-2 text-[11px] text-slate-400">ZAVU · Supabase</div>
      </div>
    </aside>
  );
}
