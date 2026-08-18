import React, { useState, useEffect } from 'react';

const presentationSlides = [
  {
    slideNumber: 1,
    title: "Végvári Kódex 1552",
    subtitle: "Multi-Persona Mentor Engine & Kódex Platform",
    bullets: [
      "AI-vezérelt vállalati onboarding és tudásmenedzsment",
      "Középkori egri vári narratíva gamifikált HR-folyamatokhoz",
      "Jogdíjmentes közkincs (Egri csillagok) mint kockázatmentes RAG alap",
      "Két fő pillér: Erőforrás Motor és Mentor Chat"
    ]
  },
  {
    slideNumber: 2,
    title: "Architektúra & Biztonság",
    subtitle: "Tiszta kliens-szerver szétválasztás",
    bullets: [
      "Frontend: React 18 + Vite + Tailwind CSS",
      "Backend: Node.js / Express, Session-alapú auth, HttpOnly sütik",
      "Biztonságos API Proxy: A kliens soha nem kommunikál közvetlenül az AI-val",
      "Költségkontroll és védelem: express-rate-limit throttling"
    ]
  },
  {
    slideNumber: 3,
    title: "UX & Erőforrás Motor",
    subtitle: "ResourceEngine.jsx — Három nézet, egy komponens",
    bullets: [
      "GYIK mód: Cache-elt tartalom, kinyitható/becsukható elemek",
      "Kvízgenerálás: 5 kérdéses, azonnali vizuális visszajelzéssel",
      "Fejezet-összefoglaló: Dokumentum alapú tömörítés",
      "Akadálymentesség: aria-live, role='log', aria-expanded támogatás"
    ]
  },
  {
    slideNumber: 4,
    title: "Mentor Chat & Karakterek",
    subtitle: "MentorChat.jsx — Négy perszóna egyidejű válasza",
    bullets: [
      "Máté bá: Cinikus, fáradt vitéz (szabálykerülés)",
      "Ambrus bá: Paranoiás bástyaőr (NDA & biztonság)",
      "Kristóf apród: Vállalati zsargont toló karrierista",
      "János deák: Isztambuli emlékeket mesélő megfigyelő",
      "Valós idejű Attack UI biztonsági riasztási sáv"
    ]
  },
  {
    slideNumber: 5,
    title: "A Robusztus AI Réteg",
    subtitle: "Mérnöki megoldások a háttérben",
    bullets: [
      "Modell-fallback lánc: Automatikus váltás kvótakimerülés ellen",
      "Kényszerített JSON-séma (responseSchema) a stabil frontendért",
      "SafeJsonParse védőháló code fence tisztítással",
      "Közös biztonsági szabályok prompt injection és scope ellen"
    ]
  },
  {
    slideNumber: 6,
    title: "AI-támogatott Workflow & Jövő",
    subtitle: "Eszközspecializált fejlesztési ciklus",
    bullets: [
      "1. Tervezés: Google AI Studio (promptok, sémák tesztelése)",
      "2. Implementáció: Gemini kódolási asszisztencia",
      "3. Dokumentáció & Bemutató: Claude elemzés és Gemini slide generálás",
      "További irányok: Streaming válaszok, perzisztens chat, admin felület"
    ]
  }
];

export default function PresentationModal({ isOpen, onClose }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentSlide]);

  if (!isOpen) return null;

  const nextSlide = () => {
    if (currentSlide < presentationSlides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const slide = presentationSlides[currentSlide];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="relative w-full max-w-4xl bg-stone-900 border border-stone-700 rounded-xl shadow-2xl overflow-hidden text-stone-100 flex flex-col h-[600px]">
        
        {/* Fejléc */}
        <div className="flex items-center justify-between px-6 py-4 bg-stone-950 border-b border-stone-800">
          <div id="modal-title" className="text-sm font-semibold text-amber-500 tracking-wider">
            VÉGVÁRI KÓDEX 1552 — PROJEKTPREZENTÁCIÓ
          </div>
          <button 
            onClick={onClose}
            aria-label="Prezentáció bezárása"
            className="text-stone-400 hover:text-white transition text-xl font-bold px-2 focus:outline-none focus:ring-2 focus:ring-amber-500 rounded"
          >
            ✕
          </button>
        </div>

        {/* Fő tartalom */}
        <div 
          className="flex-1 p-8 md:p-12 flex flex-col justify-center bg-gradient-to-br from-stone-900 to-stone-950 focus:outline-none"
          aria-live="polite"
        >
          <div className="text-amber-400/80 text-sm font-medium uppercase tracking-widest mb-2">
            {slide.subtitle}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-stone-100 mb-6 border-b border-stone-800 pb-4">
            {slide.title}
          </h2>
          <ul className="space-y-3 text-stone-300 text-lg md:text-xl">
            {slide.bullets.map((bullet, index) => (
              <li key={index} className="flex items-start">
                <span className="text-amber-500 mr-3 mt-1.5 text-sm" aria-hidden="true">▪</span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Lábléc / Navigáció */}
        <div className="flex items-center justify-between px-6 py-4 bg-stone-950 border-t border-stone-800">
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="px-4 py-2 bg-stone-800 hover:bg-stone-700 disabled:opacity-40 disabled:cursor-not-allowed rounded text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            ← Előző
          </button>

          <span className="text-sm text-stone-400" aria-current="step">
            {currentSlide + 1}. dia / {presentationSlides.length}
          </span>

          <button
            onClick={nextSlide}
            disabled={currentSlide === presentationSlides.length - 1}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-stone-950 font-semibold rounded text-sm transition focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            Következő →
          </button>
        </div>

      </div>
    </div>
  );
}