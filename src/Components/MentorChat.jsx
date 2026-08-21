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
    <section className="flex flex-col rounded-3xl border border-castle-border bg-castle-light/90 p-4 shadow-xl" aria-label="Mentor Chat szekció">
      <div className="mb-3 flex items-center justify-between border-b border-castle-border pb-3">
        <h2 className="text-xl font-bold text-ember-400 tracking-wide">👥 Mentor Chat - mesterséges intelligencia által generált válaszok</h2>
      </div>

      <div className="mb-3 flex items-center justify-between rounded-2xl bg-castle-input/70 p-2 border border-castle-border">
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
              className={`rounded-xl px-2.5 py-1 text-xs font-semibold transition border focus:outline-none focus:ring-2 focus:ring-ember ${
                selectedMentors[mentor.key]
                  ? `bg-castle-base border-castle-border ${mentor.color}`
                  : 'bg-castle-input/40 border-castle-border text-stone-600 line-through'
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
            <div className={`max-w-[85%] rounded-2xl p-3 text-sm shadow ${msg.role === 'user' ? 'bg-status-info/20 border border-status-info/40 text-cyan-50' : 'bg-castle-input border border-castle-border text-stone-200'}`}>
              {msg.role === 'user' ? (
                msg.content
              ) : msg.role === 'error' ? (
                <p className="text-status-error" role="alert">Hiba: {msg.content}</p>
              ) : (
                <div className="space-y-2">
                  {msg.data?.attack_detected && (
                    <div className="mb-2 rounded-xl bg-status-error/20 border border-status-error px-3 py-2 text-xs font-bold text-red-300 flex items-center gap-2 shadow-inner">
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

      <div className="mt-4 flex gap-2 border-t border-castle-border pt-3">
        <label htmlFor="chat-input" className="sr-only">Üzenet a mentoroknak</label>
        <input
          id="chat-input"
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleChatSend()}
          placeholder="Kérdezd a mentorokat..."
          className="castle-input"
        />
        <button
          onClick={handleChatSend}
          disabled={chatSubmitting}
          className="btn-primary"
        >
          Küldés
        </button>
      </div>
    </section>
  );
}