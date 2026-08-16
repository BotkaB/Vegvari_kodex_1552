import React, { useState, useEffect } from "react";

// Helyi biztonsági fallback adatok a GYIK-hez, hogy azonnal megjelenjen
const FALLBACK_FAQ = {
  kategóriák: [
    {
      név: "Általános Várvédelmi Szabályok",
      elemek: [
        {
          kérdés: "Mi a teendő riadó és vészhelyzet esetén?",
          válasz: "Azonnal fel kell venni a védőfelszerelést, ellenőrizni kell a szolgálati utat, és a kijelölt körlethez kell vonulni a riadási utasítások szerint."
        },
        {
          kérdés: "Hol találom a hatályos belső szabályzatokat?",
          válasz: "Minden hivatalos SOP, HR szabályzat és a Végvári Kódex is elérhető a digitális archívumban az erőforrás motoron keresztül."
        }
      ]
    },
    {
      név: "HR és Munkavégzési Irányelvek",
      elemek: [
        {
          kérdés: "Hogyan működik a belső helyszíni és távmunkavégzés?",
          válasz: "A távmunka feltételeit a HR_POL_1552-es szabályzat részletezi. A kérelmet előzetesen egyeztetni kell a közvetlen felettessel."
        },
        {
          kérdés: "Milyen elvárások vonatkoznak az új junior program résztvevőire?",
          válasz: "A junior program (HR_ONB_1552) strukturált mentorált bevezetést biztosít a várvédelmi feladatokba és a dokumentumkezelésbe."
        }
      ]
    },
    {
      név: "Beszerzés és Biztonság (NDA)",
      elemek: [
        {
          kérdés: "Milyen szabályok vonatkoznak a beszerzésekre és készletkezelésre?",
          válasz: "A beszerzési folyamatokat a PRO_PUR_1552 szabályzat írja elő, amely biztosítja a vár logisztikai és élelmezési biztonságát."
        },
        {
          kérdés: "Mit tartalmaz a Végvári NDA (Titoktartási nyilatkozat)?",
          válasz: "A SEC_NDA_1552 dokumentum értelmében a várbeli belső információk, védelmi tervek és stratégiai adatok harmadik félnek nem adhatók ki."
        }
      ]
    }
  ]
};

export function ResourceEngine({
  activeResourceMode,
  setActiveResourceMode,
  serverData,
  setServerData,
  resourceInput,
  setResourceInput,
  resourceSubmitting,
  handleResourceFetch,
  availableFiles = [],
  selectedFileUri,
  setSelectedFileUri,
}) {
  const [openCategories, setOpenCategories] = useState({ 0: true }); // Alapból az első kategória nyitva
  const [openItems, setOpenItems] = useState({});
  const [localSubmitting, setLocalSubmitting] = useState(false);

  // Függvény a GYIK adatok lekérésére a szerverről (ha sikertelen, a fallback lép életbe)
  const fetchFaqData = async () => {
    // Ha már van betöltve faq_content, nem hívjuk újra
    if (serverData?.faq_content?.kategóriák) return;

    setLocalSubmitting(true);
    try {
      const res = await fetch('/api/faq', { credentials: 'include' });
      const data = await res.json();
      if (data.ok && setServerData) {
        setServerData(prev => ({
          ...(prev || {}),
          faq_content: { kategóriák: data.kategóriák },
          document_content: null,
          quiz: null,
          citation: "FAQ_1552.pdf (Hivatalos Várvédelmi Gyűjtemény)"
        }));
      } else {
        applyFallbackFaq();
      }
    } catch (err) {
      console.warn("Hiba a GYIK lekérésekor, fallback használata:", err);
      applyFallbackFaq();
    } finally {
      setLocalSubmitting(false);
    }
  };

  const applyFallbackFaq = () => {
    if (setServerData) {
      setServerData(prev => ({
        ...(prev || {}),
        faq_content: FALLBACK_FAQ,
        document_content: null,
        quiz: null,
        citation: "FAQ_1552.pdf (Hivatalos Várvédelmi Gyűjtemény)"
      }));
    }
  };

  // Komponens betöltődésekor azonnal állítsuk be a GYIK módot és töltsük be az adatot
  useEffect(() => {
    if (!activeResourceMode || activeResourceMode === 'faq') {
      if (setActiveResourceMode && activeResourceMode !== 'faq') {
        setActiveResourceMode('faq');
      }
      if (!serverData?.faq_content) {
        applyFallbackFaq(); // Először azonnal kirajzoljuk a statikusat, majd lekérdezzük a szervert
        fetchFaqData();
      }
    }
  }, []);

  const toggleCategory = (catIdx) => {
    setOpenCategories(prev => ({ ...prev, [catIdx]: !prev[catIdx] }));
  };

  const toggleItem = (catIdx, eIdx) => {
    const key = `${catIdx}-${eIdx}`;
    setOpenItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Módváltás kezelése
  const handleModeChange = async (newMode) => {
    setActiveResourceMode(newMode);
    if (newMode === 'faq') {
      await fetchFaqData();
    }
  };

  return (
    <section className="flex flex-col rounded-3xl border border-[#3a3f4d] bg-[#1f222b]/90 p-4 shadow-xl">
      <div className="mb-3 flex flex-col gap-3 border-b border-[#3a3f4d] pb-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold text-amber-400 tracking-wide">📖 Erőforrás Motor</h2>
        
        {/* Dokumentumválasztó legördülő */}
        <div className="flex items-center gap-2">
          <select
            value={selectedFileUri}
            onChange={(e) => setSelectedFileUri(e.target.value)}
            className="rounded-xl border border-[#3a3f4d] bg-[#14161b] px-3 py-1 text-xs text-stone-200 outline-none focus:border-amber-400 shadow-inner"
          >
            <option value="">-- Összes / Nincs kiválasztva --</option>
            {availableFiles.map((file, idx) => (
              <option key={idx} value={file.fileUri}>
                {file.displayName || file.name || `Dokumentum ${idx + 1}`}
              </option>
            ))}
          </select>

          <div className="flex flex-wrap gap-1">
            {[
              { id: 'faq', label: 'GYIK' },
              { id: 'quiz_generation', label: 'Kvíz' },
              { id: 'chapter_summary', label: 'Összefoglaló' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => handleModeChange(m.id)}
                className={`rounded-xl px-2.5 py-1 text-xs font-semibold transition shadow-sm ${
                  activeResourceMode === m.id
                    ? 'bg-amber-500 text-stone-950 font-bold'
                    : 'bg-[#14161b] text-stone-300 hover:bg-[#252833] border border-[#3a3f4d]'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 text-stone-300 mb-4 max-h-[50vh]">
        {serverData?.document_content && activeResourceMode !== 'faq' && (
          <div className="rounded-2xl bg-[#14161b]/80 p-4 border border-[#3a3f4d]">
            <h3 className="font-bold text-white mb-2">{serverData.document_content.title}</h3>
            <p className="text-sm leading-relaxed">{serverData.document_content.text}</p>
          </div>
        )}

        {serverData?.quiz && activeResourceMode !== 'faq' && (
          <div className="rounded-2xl bg-[#14161b]/80 p-4 border border-amber-500/30">
            <p className="text-sm font-semibold mb-2 text-stone-200">{serverData.quiz.question}</p>
            <ul className="space-y-1 mb-2">
              {serverData.quiz.options?.map((opt, i) => (
                <li key={i} className="text-xs bg-[#252833] p-2 rounded-xl border border-[#3a3f4d]">{opt}</li>
              ))}
            </ul>
            {serverData.quiz.explanation && (
              <p className="text-xs text-stone-400 mt-2"><strong>Magyarázat:</strong> {serverData.quiz.explanation}</p>
            )}
          </div>
        )}

        {/* Lenyitható (Accordion) GYIK nézet */}
        {activeResourceMode === 'faq' && (
          <div className="space-y-3">
            {localSubmitting && <p className="text-xs text-amber-400 text-center mb-1">Adatok frissítése...</p>}
            {(serverData?.faq_content?.kategóriák || FALLBACK_FAQ.kategóriák).map((cat, cIdx) => (
              <div key={cIdx} className="rounded-2xl bg-[#14161b]/80 border border-[#3a3f4d] overflow-hidden">
                <button
                  onClick={() => toggleCategory(cIdx)}
                  className="w-full flex items-center justify-between p-3 text-left font-bold text-white bg-[#1a1d26] hover:bg-[#252833] transition"
                >
                  <span className="text-sm text-amber-400">📁 {cat.név}</span>
                  <span className="text-xs text-stone-400">{openCategories[cIdx] ? '▲ Bezár' : '▼ Nyit'}</span>
                </button>

                {openCategories[cIdx] && (
                  <div className="p-3 space-y-2 border-t border-[#3a3f4d]">
                    {cat.elemek?.map((el, eIdx) => {
                      const itemKey = `${cIdx}-${eIdx}`;
                      const isOpen = openItems[itemKey];
                      return (
                        <div key={eIdx} className="rounded-xl bg-[#14161b] border border-[#3a3f4d] overflow-hidden">
                          <button
                            onClick={() => toggleItem(cIdx, eIdx)}
                            className="w-full flex items-center justify-between p-2.5 text-left text-xs font-semibold text-stone-200 hover:bg-[#252833] transition"
                          >
                            <span>❓ {el.kérdés}</span>
                            <span className="text-stone-400">{isOpen ? '−' : '+'}</span>
                          </button>
                          {isOpen && (
                            <div className="p-2.5 text-xs text-stone-300 border-t border-[#3a3f4d] bg-[#101216] leading-relaxed">
                              <span className="font-bold text-amber-300 mr-1">Válasz:</span> {el.válasz}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {serverData?.citation && activeResourceMode === 'faq' && (
          <p className="text-xs italic text-stone-400 mt-2">Hivatkozás: {serverData.citation}</p>
        )}
      </div>

      {activeResourceMode !== 'faq' && (
        <div className="flex gap-2 border-t border-[#3a3f4d] pt-3">
          <input
            type="text"
            value={resourceInput}
            onChange={(e) => setResourceInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleResourceFetch()}
            placeholder="Írd be a keresendő témát / kulcsszót..."
            className="flex-1 rounded-2xl border border-[#3a3f4d] bg-[#14161b] px-4 py-2 text-sm text-white outline-none focus:border-amber-400 shadow-inner"
          />
          <button
            onClick={handleResourceFetch}
            disabled={resourceSubmitting}
            className="rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2 text-sm font-bold text-stone-950 transition hover:brightness-110 disabled:opacity-50 shadow"
          >
            {resourceSubmitting ? 'Töltés...' : 'Lekérés'}
          </button>
        </div>
      )}
    </section>
  );
}