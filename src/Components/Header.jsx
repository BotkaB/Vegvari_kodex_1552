// src/Components/Header.jsx
export function Header({ showButtons = false, presentationMode, setPresentationMode, onLogout, onOpenPresentation }) {
  return (
    <header className="border-b border-castle-border bg-castle-base/90 p-4 backdrop-blur-sm shadow-md" role="banner">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-ember-400 font-semibold">Végvári Kódex 1552</p>
          <h1 className="text-2xl font-black text-white tracking-wide">Multi-Persona Mentor Engine</h1>
        </div>
        {showButtons && (
          <nav className="flex items-center gap-3" aria-label="Fő navigáció">
            <button
              onClick={onOpenPresentation}
              className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-200 transition hover:bg-amber-500/20 shadow focus:outline-none focus:ring-2 focus:ring-ember-400"
            >
              Projekt Bemutató
            </button>
            <button
              onClick={onLogout}
              className="rounded-xl border border-red-500/50 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/20 shadow focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              Kilépés
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}