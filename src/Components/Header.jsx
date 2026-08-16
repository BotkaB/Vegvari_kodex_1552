export function Header({ showButtons = false, presentationMode, setPresentationMode, onLogout }) {
  return (
    <header className="border-b border-[#3a3f4d] bg-[#1a1c23]/90 p-4 backdrop-blur-sm shadow-md">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-amber-400 font-semibold">Végvári Kódex 1552</p>
          <h1 className="text-2xl font-black text-white tracking-wide">Multi-Persona Mentor Engine</h1>
        </div>
        {showButtons && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPresentationMode(!presentationMode)}
              className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-200 transition hover:bg-amber-500/20 shadow"
            >
              {presentationMode ? 'Normál Mód' : 'Prezentációs Mód'}
            </button>
            <button
              onClick={onLogout}
              className="rounded-xl border border-red-500/50 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/20 shadow"
            >
              Kilépés
            </button>
          </div>
        )}
      </div>
    </header>
  );
}