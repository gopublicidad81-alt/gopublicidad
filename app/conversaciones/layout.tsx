import { getConversacionesInbox } from "@/lib/data";
import InboxList from "@/components/InboxList";

export const dynamic = "force-dynamic";

export default async function ConversacionesLayout({ children }: { children: React.ReactNode }) {
  const items = await getConversacionesInbox();
  return (
    <div className="h-screen flex flex-col">
      <div className="px-6 lg:px-8 py-4 border-b border-slate-200 bg-white">
        <h1 className="text-xl font-bold text-slate-900">Conversaciones</h1>
        <p className="text-xs text-slate-400">{items.length} conversaciones de WhatsApp</p>
      </div>
      <div className="flex-1 flex min-h-0">
        <div className="w-80 shrink-0 border-r border-slate-200 bg-white">
          <InboxList items={items} />
        </div>
        <div className="flex-1 min-w-0 bg-slate-50">{children}</div>
      </div>
    </div>
  );
}
