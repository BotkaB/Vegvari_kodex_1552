export function MentorChat({
  selectedMentors,
  toggleMentor,
  messages,
  chatInput,
  setChatInput,
  chatSubmitting,
  handleChatSend,
}) {
  return (
    <section className="flex flex-col rounded-3xl border border-[#3a3f4d] bg-[#1f222b]/90 p-4 shadow-xl" aria-label="Mentor Chat szekció">
      <div className="mb-3 flex items-center justify-between border-b border-[#3a3f4d] pb-3">
        <h2 className="text-xl font-bold text-amber-400 tracking-wide">👥 Mentor Chat</h2>
      </div>

      <div className="mb-3 flex items-center justify-between rounded-2xl bg-[#14161b]/70 p-2 border border-[#3a3f4d]">
        <span id="mentor-filter-label" className="text-xs font-medium text-stone-400 px-2">Megjelenítés:</span>
        <div className="flex flex-wrap gap-2" role="group" aria-labelledby="mentor-filter-label">
          {[
            { key: 'mate_ba', label: 'Máté Bá', color: 'text-red-400' },
            { key: 'ambrus_ba', label: 'Ambrus Bá', color: 'text-blue-400' },
            { key: 'kristof_aprod', label: 'Kristóf', color: 'text-amber-400' },
            { key: 'janos_deak', label: 'János Deák', color: 'text-purple-400' },
          ].map((mentor) => (
            <button
              key={mentor.key}
              onClick={() => toggleMentor(mentor.key)}
              aria-pressed={Boolean(selectedMentors[mentor.key])}
              className={`rounded-xl px-2.5 py-1 text-xs font-semibold transition border focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                selectedMentors[mentor.key]
                  ? `bg-[#252833] border-[#4f566b] ${mentor.color}`
                  : 'bg-[#14161b]/40 border-[#2a2e39] text-stone-600 line-through'
              }`}
            >
              {mentor.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-2" role="log" aria-live="polite" aria-label="Csevegési üzenetek">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-3 text-sm shadow ${msg.role === 'user' ? 'bg-cyan-950/40 border border-cyan-600/40 text-cyan-50' : 'bg-[#14161b] border border-[#3a3f4d] text-stone-200'}`}>
              {msg.role === 'user' ? (
                msg.content
              ) : msg.role === 'error' ? (
                <p className="text-red-400" role="alert">Hiba: {msg.content}</p>
              ) : (
                <div className="space-y-2">
                  {/* 🚨 BIZTONSÁGI RIASZTÁS SÁV (Ha támadást észlel a rendszer) */}
                  {msg.data?.attack_detected && (
                    <div className="mb-2 rounded-xl bg-red-950/80 border border-red-500 px-3 py-2 text-xs font-bold text-red-300 flex items-center gap-2 shadow-inner">
                      <span>🛡️ Védelmi Protokoll Aktiválva! Típus: {msg.data.attack_type}</span>
                    </div>
                  )}

                  {selectedMentors.mate_ba && msg.data.mate_ba && <p><strong className="text-red-400">Máté Bá:</strong> {msg.data.mate_ba}</p>}
                  {selectedMentors.ambrus_ba && msg.data.ambrus_ba && <p><strong className="text-blue-400">Ambrus Bá:</strong> {msg.data.ambrus_ba}</p>}
                  {selectedMentors.kristof_aprod && msg.data.kristof_aprod && <p><strong className="text-amber-400">Kristóf Apród:</strong> {msg.data.kristof_aprod}</p>}
                  {selectedMentors.janos_deak && msg.data.janos_deak && <p><strong className="text-purple-400">János Deák:</strong> {msg.data.janos_deak}</p>}
                  {msg.data.citation && <p className="text-xs italic text-stone-400 mt-1">Forrás: {msg.data.citation}</p>}
                </div>
              )}
            </div>
          </div>
        ))}
        {chatSubmitting && <div className="text-xs text-stone-400 animate-pulse p-2" aria-live="polite">A 4 mentor válaszol...</div>}
      </div>

      <div className="mt-4 flex gap-2 border-t border-[#3a3f4d] pt-3">
        <label htmlFor="chat-input" className="sr-only">Üzenet a mentoroknak</label>
        <input
          id="chat-input"
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleChatSend()}
          placeholder="Kérdezd a mentorokat..."
          className="flex-1 rounded-2xl border border-[#3a3f4d] bg-[#14161b] px-4 py-2 text-sm text-white outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400 shadow-inner"
        />
        <button
          onClick={handleChatSend}
          disabled={chatSubmitting}
          className="rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2 text-sm font-bold text-stone-950 transition hover:brightness-110 disabled:opacity-50 shadow focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          Küldés
        </button>
      </div>
    </section>
  );
}