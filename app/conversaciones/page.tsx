export default function ConversacionesIndex() {
  return (
    <div className="h-full grid place-items-center text-center p-8">
      <div>
        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-brand-100 text-brand-600">
          <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2a10 10 0 00-8.94 14.47L2 22l5.65-1.05A10 10 0 1012 2z"/></svg>
        </div>
        <div className="font-semibold text-slate-700">Selecciona una conversación</div>
        <div className="text-sm text-slate-400 mt-1">Elige un chat de la lista para ver los mensajes.</div>
      </div>
    </div>
  );
}
