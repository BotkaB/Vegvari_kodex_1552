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
    <section className="flex flex-col rounded-3xl border border-[#3a3f4d] bg-[#1f222b]/90 p-4 shadow-xl" aria-label="Erőforrás Motor szekció">
      {/* Fejléc és Módválasztó */}
      <div className="mb-3 flex flex-col gap-3 border-b border-[#3a3f4d] pb-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold tracking-wide text-amber-400">
          📖 Erőforrás Motor
        </h2>
        <p className="text-[10px] text-amber-400 font-medium uppercase tracking-wider mt-0.5 opacity-90">
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
            className="rounded-xl border border-[#3a3f4d] bg-[#14161b] px-3 py-1 text-xs text-stone-200 outline-none shadow-inner focus:border-amber-400 focus:ring-2 focus:ring-amber-400 disabled:opacity-50"
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
                className={`rounded-xl px-2.5 py-1 text-xs font-semibold shadow-sm transition disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                  activeResourceMode === m.id
                    ? "bg-amber-500 font-bold text-stone-950"
                    : "border border-[#3a3f4d] bg-[#14161b] text-stone-300 hover:bg-[#252833]"
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
          <div className="flex flex-col items-center justify-center space-y-2 py-12 text-amber-400" aria-live="polite">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" aria-hidden="true"></div>
            <p className="text-xs font-semibold">
              Az AI éppen feldolgozza a dokumentumot...
            </p>
          </div>
        )}

        {/* AI Hibaüzenet kezelése, ha nincs fájl kiválasztva */}
        {!resourceSubmitting && isMissingFileError && (
          <div className="rounded-2xl border border-amber-500/50 bg-amber-950/30 p-6 text-center space-y-2" role="alert">
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
              <h3 className="border-b border-[#3a3f4d] pb-2 text-base font-bold text-amber-400">
                {serverData.document_content.title || "Dokumentum összefoglaló"}
              </h3>
              
              {Array.isArray(serverData.document_content.paragraphs) &&
              serverData.document_content.paragraphs.length > 0 ? (
                serverData.document_content.paragraphs.map((para, pIdx) => (
                  <div
                    key={pIdx}
                    className="rounded-2xl border border-[#3a3f4d] bg-[#14161b]/80 p-4 shadow-sm transition hover:border-amber-500/40"
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
                <div className="rounded-2xl border border-[#3a3f4d] bg-[#14161b]/80 p-5 shadow-inner">
                  <p className="text-sm leading-relaxed text-stone-200">
                    {serverData.document_content.text || "Nincs elérhető tartalom."}
                  </p>
                </div>
              )}
            </div>
          )}

        {/* 2. KVÍZ NÉZET (5 Kérdés) */}
        {!resourceSubmitting &&
          !isMissingFileError &&
          activeResourceMode === "quiz_generation" &&
          quizList.length > 0 && (
            <div className="space-y-4">
              {/* Eredményjelző sáv és Új Kvíz gomb */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 rounded-2xl border border-amber-500/30 bg-[#14161b] p-3 text-xs" aria-live="polite">
                <span className="font-semibold text-stone-300">
                  Kitöltött kérdések: {answeredCount} / {quizList.length}
                  {answeredCount === quizList.length && (
                    <span className="ml-2 font-bold text-amber-400">
                      (Eredmény: {correctCount} / {quizList.length} helyes! 🎉)
                    </span>
                  )}
                </span>

                <button
                  onClick={() => {
                    if (handleResourceFetch && selectedFileUri) {
                      handleResourceFetch("quiz_generation", selectedFileUri);
                    }
                  }}
                  disabled={resourceSubmitting || !selectedFileUri}
                  className="rounded-xl bg-amber-500/20 border border-amber-500/50 px-3 py-1 font-semibold text-amber-300 transition hover:bg-amber-500/30 focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50"
                >
                  🔄 Új kvíz generálása
                </button>
              </div>

              {/* Kérdések listája */}
              {quizList.map((q, qIdx) => {
                const selectedOpt = userAnswers[qIdx];
                const isAnswered = selectedOpt !== undefined;

                return (
                  <div
                    key={qIdx}
                    className="rounded-2xl border border-[#3a3f4d] bg-[#14161b]/80 p-4 transition shadow-md"
                  >
                    <p className="mb-3 text-sm font-bold text-amber-300">
                      {qIdx + 1}. {q.question}
                    </p>

                    <div className="mb-3 space-y-2" role="group" aria-label={`${qIdx + 1}. kérdés válaszlehetőségei`}>
                      {q.options?.map((opt, oIdx) => {
                        let btnStyle =
                          "border-[#3a3f4d] bg-[#252833] text-stone-200 hover:bg-[#323645]";

                        if (isAnswered) {
                          if (opt === q.correct_answer) {
                            btnStyle =
                              "border-green-500 bg-green-950/60 text-green-200 font-semibold";
                          } else if (opt === selectedOpt) {
                            btnStyle =
                              "border-red-500 bg-red-950/60 text-red-200 line-through opacity-80";
                          } else {
                            btnStyle =
                              "border-[#2a2d37] bg-[#1a1c23] text-stone-500 opacity-50";
                          }
                        }

                        return (
                          <button
                            key={oIdx}
                            onClick={() => handleSelectOption(qIdx, opt)}
                            disabled={isAnswered}
                            aria-pressed={selectedOpt === opt}
                            className={`w-full text-left rounded-xl border p-2.5 text-xs transition duration-150 focus:outline-none focus:ring-2 focus:ring-amber-400 ${btnStyle}`}
                          >
                            <span className="mr-2 font-mono font-bold text-stone-400" aria-hidden="true">
                              {String.fromCharCode(65 + oIdx)}.
                            </span>
                            {opt}
                          </button>
                        );
                      })}
                    </div>

                    {/* Magyarázat válaszadás után */}
                    {isAnswered && q.explanation && (
                      <div className="mt-3 rounded-xl border border-[#3a3f4d] bg-[#0d0f13] p-3 text-xs leading-relaxed text-stone-300" role="note">
                        <strong className="text-amber-400">Magyarázat: </strong>
                        {q.explanation}
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
            {localSubmitting && (
              <p className="py-4 text-center text-xs text-amber-400" aria-live="polite">
                GYIK adatok betöltése a szerverről...
              </p>
            )}

            {faqError && (
              <div className="rounded-2xl border border-red-500/50 bg-red-950/40 p-4 text-center" role="alert">
                <p className="mb-2 text-xs font-semibold text-red-300">
                  ❌ {faqError}
                </p>
                <button
                  onClick={fetchFaqData}
                  className="rounded-xl bg-red-800/60 px-3 py-1 text-xs text-white transition hover:bg-red-700/80 focus:outline-none focus:ring-2 focus:ring-red-400"
                >
                  Újrapróbálkozás
                </button>
              </div>
            )}

            {!localSubmitting && !faqError && kategoriak.length === 0 && (
              <p className="py-4 text-center text-xs text-stone-400">
                Nincsenek megjeleníthető GYIK adatok.
              </p>
            )}

            {!localSubmitting &&
              !faqError &&
              kategoriak.map((cat, cIdx) => {
                const catName = cat.nev || cat.név || `Kategória ${cIdx + 1}`;
                const elemek = cat.elemek || [];

                return (
                  <div
                    key={cIdx}
                    className="overflow-hidden rounded-2xl border border-[#3a3f4d] bg-[#14161b]/80"
                  >
                    <button
                      onClick={() => toggleCategory(cIdx)}
                      aria-expanded={Boolean(openCategories[cIdx])}
                      className="flex w-full items-center justify-between bg-[#1a1d26] p-3 text-left font-bold text-white transition hover:bg-[#252833] focus:outline-none focus:ring-2 focus:ring-amber-400"
                    >
                      <span className="text-sm text-amber-400">
                        📁 {catName} ({elemek.length})
                      </span>
                      <span className="text-xs text-stone-400" aria-hidden="true">
                        {openCategories[cIdx] ? "▲ Bezár" : "▼ Nyit"}
                      </span>
                    </button>

                    {openCategories[cIdx] && (
                      <div className="space-y-2 border-t border-[#3a3f4d] p-3">
                        {elemek.map((el, eIdx) => {
                          const itemKey = `${cIdx}-${eIdx}`;
                          const isOpen = openItems[itemKey];
                          const kerdes = el.kerdes || el.kérdés || "Kérdés";
                          const valasz = el.valasz || el.válasz || "Válasz";

                          return (
                            <div
                              key={eIdx}
                              className="overflow-hidden rounded-xl border border-[#3a3f4d] bg-[#14161b]"
                            >
                              <button
                                onClick={() => toggleItem(cIdx, eIdx)}
                                aria-expanded={Boolean(isOpen)}
                                className="flex w-full items-center justify-between p-2.5 text-left text-xs font-semibold text-stone-200 transition hover:bg-[#252833] focus:outline-none focus:ring-2 focus:ring-amber-400"
                              >
                                <span>❓ {kerdes}</span>
                                <span className="text-stone-400" aria-hidden="true">
                                  {isOpen ? "−" : "+"}
                                </span>
                              </button>
                              {isOpen && (
                                <div className="border-t border-[#3a3f4d] bg-[#101216] p-2.5 text-xs leading-relaxed text-stone-300">
                                  <span className="mr-1 font-bold text-amber-300">
                                    Válasz:
                                  </span>{" "}
                                  {valasz}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}

        {/* Hivatkozás megjelenítése az alján */}
        {serverData?.citation && !resourceSubmitting && !isMissingFileError && (
          <p className="mt-2 text-xs italic text-stone-400">
            Hivatkozás: {serverData.citation}
          </p>
        )}
      </div>
    </section>
  );
}