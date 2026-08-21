import React, { useState, useEffect } from "react";

export function ResourceEngine({
  activeResourceMode,
  setActiveResourceMode,
  serverData,
  setServerData,
  resourceSubmitting,
  handleResourceFetch,
  availableFiles = [],
  selectedFileUri,
  setSelectedFileUri,
}) {
  const [openCategories, setOpenCategories] = useState({});
  const [openItems, setOpenItems] = useState({});
  const [localSubmitting, setLocalSubmitting] = useState(false);
  const [faqError, setFaqError] = useState(null);

  // Kvíz válaszok állapotkezelése: { [questionIndex]: selectedOptionString }
  const [userAnswers, setUserAnswers] = useState({});

  // Függvény a GYIK adatok lekérésére a backendről (/api/faq)
  const fetchFaqData = async () => {
    setLocalSubmitting(true);
    setFaqError(null);

    try {
      const res = await fetch("/api/faq", { credentials: "include" });
      const responseData = await res.json();

      const actualData = responseData.data || responseData;

      if (res.ok && actualData) {
        if (setServerData) {
          setServerData((prev) => ({
            ...(prev || {}),
            faq_content: actualData,
            document_content: null,
            quizzes: null,
            citation:
              actualData.citation ||
              "FAQ-1552.pdf (Hivatalos Végvári Tudásbázis)",
          }));
        }
      } else {
        setFaqError(
          responseData.error ||
            "Nem sikerült betölteni a GYIK adatokat a szerverről.",
        );
      }
    } catch (err) {
      console.error("❌ Hiba a GYIK lekérésekor:", err);
      setFaqError("Hálózati hiba történt a GYIK betöltése során.");
    } finally {
      setLocalSubmitting(false);
    }
  };

  // Komponens betöltődésekor alapértelmezetten a GYIK-et kérjük le
  useEffect(() => {
    if (!activeResourceMode || activeResourceMode === "faq") {
      if (setActiveResourceMode && activeResourceMode !== "faq") {
        setActiveResourceMode("faq");
      }
      if (!serverData?.faq_content) {
        fetchFaqData();
      }
    }
  }, []);

  // Új kvíz adatok érkezésekor nullázzuk a korábbi felhasználói válaszokat
  useEffect(() => {
    if (serverData?.quizzes) {
      setUserAnswers({});
    }
  }, [serverData?.quizzes]);

  const toggleCategory = (catIdx) => {
    setOpenCategories((prev) => ({ ...prev, [catIdx]: !prev[catIdx] }));
  };

  const toggleItem = (catIdx, eIdx) => {
    const key = `${catIdx}-${eIdx}`;
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleModeChange = async (newMode) => {
    if (newMode === activeResourceMode) return;

    // Ha kvízre vagy összefoglalóra vált, de nincs kiválasztva fájl, figyelmeztetünk
    if (newMode !== "faq" && !selectedFileUri) {
      alert("Kérlek, válassz ki egy dokumentumot a kvíz vagy összefoglaló generálásához!");
      return;
    }

    setActiveResourceMode(newMode);

    if (newMode === "faq") {
      if (!serverData?.faq_content) {
        await fetchFaqData();
      }
    } else {
      if (handleResourceFetch) {
        handleResourceFetch(newMode, selectedFileUri);
      }
    }
  };

  const handleFileChange = (newUri) => {
    setSelectedFileUri(newUri);
    // Fájlváltáskor nem hívunk API-t, a felhasználó maga döntheti el, 
    // hogy a kiválasztott gombra (Kvíz vagy Összefoglaló) kattintva kéri-e a tartalmat.
  };

  const handleSelectOption = (qIdx, option) => {
    setUserAnswers((prev) => ({
      ...prev,
      [qIdx]: option,
    }));
  };

  const kategoriak =
    serverData?.faq_content?.kategoriak ||
    serverData?.faq_content?.kategóriák ||
    [];

  const quizList = serverData?.quizzes || [];
  const answeredCount = Object.keys(userAnswers).length;
  const correctCount = quizList.reduce((acc, q, idx) => {
    return userAnswers[idx] === q.correct_answer ? acc + 1 : acc;
  }, 0);

  // Ellenőrizzük, hogy az AI visszaküldte-e a hiányzó dokumentumra utaló hibaüzenetet
  const isMissingFileError = serverData?.citation === "Nincs megfelelő dokumentum kiválasztva.";

    return (
    <section className="flex flex-col rounded-3xl border border-castle-border bg-castle-base/90 p-4 shadow-xl" aria-label="Erőforrás Motor szekció">
      {/* Fejléc és Módválasztó */}
      <div className="mb-3 flex flex-col gap-3 border-b border-castle-border pb-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold tracking-wide text-ember-400">
          📖 Erőforrás Motor
        </h2>
        <p className="text-[10px] text-ember-400 font-medium uppercase tracking-wider mt-0.5 opacity-90">
         Mesterséges intelligencia alapú kvízgenerálás, javítás és dokumentum-összefoglalás
        </p>

        {/* Dokumentumválasztó legördülő */}
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="document-select" className="sr-only">Dokumentum kiválasztása</label>
          <select
            id="document-select"
            value={selectedFileUri || ""}
            onChange={(e) => handleFileChange(e.target.value)}
            disabled={resourceSubmitting}
            className="rounded-xl border border-castle-border bg-castle-input px-3 py-1 text-xs text-stone-200 outline-none shadow-inner focus:border-ember focus:ring-2 focus:ring-ember disabled:opacity-50"
          >
            <option value="" disabled>
              -- Válassz dokumentumot --
            </option>
            {availableFiles.map((file, idx) => (
              <option key={idx} value={file.fileData?.fileUri}>
                {file.displayName || file.name || `Dokumentum ${idx + 1}`}
              </option>
            ))}
          </select>

          {/* Módválasztó gombok */}
          <div className="flex flex-wrap gap-1" role="group" aria-label="Erőforrás módok">
            {[
              { id: "faq", label: "GYIK" },
              { id: "quiz_generation", label: "Kvíz (5 kérdés)" },
              { id: "chapter_summary", label: "Összefoglaló" },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => handleModeChange(m.id)}
                disabled={resourceSubmitting || (m.id !== "faq" && !selectedFileUri)}
                title={m.id !== "faq" && !selectedFileUri ? "Előbb válassz ki egy dokumentumot!" : ""}
                aria-pressed={activeResourceMode === m.id}
                className={`rounded-xl px-2.5 py-1 text-xs font-semibold shadow-sm transition disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-ember ${
                  activeResourceMode === m.id
                    ? "bg-ember font-bold text-stone-950"
                    : "border border-castle-border bg-castle-input text-stone-300 hover:bg-castle-base"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Fő tartalom megjelenítő terület */}
      <div className="mb-2 max-h-[60vh] flex-1 space-y-4 overflow-y-auto text-stone-300" role="region" aria-label="Erőforrás tartalom">
        {/* AI Töltés kijelzése */}
        {resourceSubmitting && (
          <div className="flex flex-col items-center justify-center space-y-2 py-12 text-ember-400" aria-live="polite">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-ember-400 border-t-transparent" aria-hidden="true"></div>
            <p className="text-xs font-semibold">
              Az AI éppen feldolgozza a dokumentumot...
            </p>
          </div>
        )}

        {/* AI Hibaüzenet kezelése, ha nincs fájl kiválasztva */}
        {!resourceSubmitting && isMissingFileError && (
          <div className="rounded-2xl border border-status-error/50 bg-status-error/10 p-6 text-center space-y-2" role="alert">
            <p className="text-sm font-bold text-amber-300">⚠️ Figyelem</p>
            <p className="text-xs text-stone-300">
              Kérlek, válassz ki egy konkrét dokumentumot a felső legördülő menüből a kvíz vagy az összefoglaló generálásához!
            </p>
          </div>
        )}

        {/* 1. ÖSSZEFOGLALÓ NÉZET */}
        {!resourceSubmitting &&
          !isMissingFileError &&
          activeResourceMode === "chapter_summary" &&
          serverData?.document_content && (
            <div className="space-y-3">
              <h3 className="border-b border-castle-border pb-2 text-base font-bold text-amber-400">
                {serverData.document_content.title || "Dokumentum összefoglaló"}
              </h3>
              
              {Array.isArray(serverData.document_content.paragraphs) &&
              serverData.document_content.paragraphs.length > 0 ? (
                serverData.document_content.paragraphs.map((para, pIdx) => (
                  <div
                    key={pIdx}
                    className="rounded-2xl border border-castle-border bg-castle-input/80 p-4 shadow-sm transition hover:border-ember-500/40"
                  >
                    <p className="text-xs font-mono font-bold text-amber-400/80 mb-1">
                      {pIdx + 1}. szakasz
                    </p>
                    <p className="text-sm leading-relaxed text-stone-200">
                      {para}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-castle-border bg-castle-input/80 p-5 shadow-inner">
                  <p className="text-sm leading-relaxed text-stone-200">
                    {serverData.document_content.text || "Nincs elérhető tartalom."}
                  </p>
                </div>
              )}
            </div>
          )}

        {/* 2. KVÍZ NÉZET */}
        {!resourceSubmitting &&
          !isMissingFileError &&
          activeResourceMode === "quiz_generation" &&
          quizList.length > 0 && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 rounded-2xl border border-ember-500/30 bg-castle-input p-3 text-xs" aria-live="polite">
                <span className="font-semibold text-stone-300">
                  Kitöltött kérdések: {answeredCount} / {quizList.length}
                  {answeredCount === quizList.length && (
                    <span className="ml-2 font-bold text-amber-400">
                      (Eredmény: {correctCount} / {quizList.length} helyes! 🎉)
                    </span>
                  )}
                </span>
                <button
                  onClick={() => handleResourceFetch("quiz_generation", selectedFileUri)}
                  disabled={resourceSubmitting || !selectedFileUri}
                  className="btn-primary py-1 px-3 w-auto"
                >
                  🔄 Új kvíz generálása
                </button>
              </div>

              {quizList.map((q, qIdx) => {
                const selectedOpt = userAnswers[qIdx];
                const isAnswered = selectedOpt !== undefined;

                return (
                  <div key={qIdx} className="rounded-2xl border border-castle-border bg-castle-input p-4 transition shadow-md">
                    <p className="mb-3 text-sm font-bold text-amber-300">{qIdx + 1}. {q.question}</p>
                    <div className="mb-3 space-y-2">
                      {q.options?.map((opt, oIdx) => {
                        let btnStyle = "border-castle-border bg-castle-base text-stone-200 hover:bg-castle-input";
                        if (isAnswered) {
                          if (opt === q.correct_answer) btnStyle = "border-status-success bg-status-success/20 text-green-200 font-semibold";
                          else if (opt === selectedOpt) btnStyle = "border-status-error bg-status-error/20 text-red-200 line-through opacity-80";
                          else btnStyle = "border-castle-border bg-castle-base text-stone-500 opacity-50";
                        }
                        return (
                          <button key={oIdx} onClick={() => handleSelectOption(qIdx, opt)} disabled={isAnswered} className={`w-full text-left rounded-xl border p-2.5 text-xs transition duration-150 focus:outline-none focus:ring-2 focus:ring-ember ${btnStyle}`}>
                            <span className="mr-2 font-mono font-bold text-stone-400">{String.fromCharCode(65 + oIdx)}.</span> {opt}
                          </button>
                        );
                      })}
                    </div>
                    {isAnswered && q.explanation && (
                      <div className="mt-3 rounded-xl border border-castle-border bg-castle-dark p-3 text-xs leading-relaxed text-stone-300">
                        <strong className="text-amber-400">Magyarázat: </strong>{q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

        {/* 3. GYIK NÉZET */}
        {!resourceSubmitting && activeResourceMode === "faq" && (
          <div className="space-y-3">
            {localSubmitting && <p className="py-4 text-center text-xs text-ember-400">GYIK adatok betöltése...</p>}
            {faqError && (
              <div className="rounded-2xl border border-status-error/50 bg-status-error/10 p-4 text-center">
                <p className="mb-2 text-xs font-semibold text-status-error">❌ {faqError}</p>
                <button onClick={fetchFaqData} className="btn-primary w-auto px-3 py-1">Újrapróbálkozás</button>
              </div>
            )}
            {kategoriak.map((cat, cIdx) => (
              <div key={cIdx} className="overflow-hidden rounded-2xl border border-castle-border bg-castle-input/80">
                <button onClick={() => toggleCategory(cIdx)} className="flex w-full items-center justify-between bg-castle-base p-3 text-left font-bold text-white transition hover:bg-castle-base focus:ring-2 focus:ring-ember">
                  <span className="text-sm text-ember-400">📁 {cat.nev || cat.név} ({cat.elemek?.length})</span>
                </button>
                {openCategories[cIdx] && (
                  <div className="space-y-2 border-t border-castle-border p-3">
                    {cat.elemek.map((el, eIdx) => (
                      <div key={eIdx} className="overflow-hidden rounded-xl border border-castle-border bg-castle-input">
                        <button onClick={() => toggleItem(cIdx, eIdx)} className="flex w-full items-center justify-between p-2.5 text-left text-xs font-semibold text-stone-200 hover:bg-castle-base focus:ring-2 focus:ring-ember">
                          <span>❓ {el.kerdes || el.kérdés}</span>
                        </button>
                        {openItems[`${cIdx}-${eIdx}`] && <div className="border-t border-castle-border bg-castle-dark p-2.5 text-xs text-stone-300">{el.valasz || el.válasz}</div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}