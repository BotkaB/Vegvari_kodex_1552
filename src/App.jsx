import { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LoginForm } from './components/LoginForm';
import { ResourceEngine } from './components/ResourceEngine';
import { MentorChat } from './components/MentorChat';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [presentationMode, setPresentationMode] = useState(false);
  const [activeResourceMode, setActiveResourceMode] = useState('faq');
  
  const [selectedMentors, setSelectedMentors] = useState({
    mate_ba: true,
    ambrus_ba: true,
    kristof_aprod: true,
    janos_deak: true,
  });
  
  const [serverData, setServerData] = useState({
    document_content: null,
    faq_content: null,
    quiz: null,
    citation: '',
  });
  
  const [resourceInput, setResourceInput] = useState('');
  const [resourceSubmitting, setResourceSubmitting] = useState(false);

  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [chatSubmitting, setChatSubmitting] = useState(false);

  // Új állapotok a hibakezeléshez és figyelmeztetésekhez
  const [quotaExhausted, setQuotaExhausted] = useState(false);
  const [warningMessage, setWarningMessage] = useState(null);

  useEffect(() => {
    fetch('/api/auth/status')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) setUser(data.user);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
  };

  const toggleMentor = (mentorKey) => {
    setSelectedMentors((prev) => ({
      ...prev,
      [mentorKey]: !prev[mentorKey],
    }));
  };

  const handleResourceFetch = async () => {
    const trimmed = resourceInput.trim();
    if (!trimmed || resourceSubmitting) return;

    setResourceSubmitting(true);
    setQuotaExhausted(false);
    setWarningMessage(null);

    try {
      const res = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, mode: activeResourceMode }),
      });
      const data = await res.json();

      // 429-es státusz vagy "elfogyott a keret" hiba kezelése
      if (res.status === 429 || data.error === 'elfogyott a keret') {
        setQuotaExhausted(true);
        throw new Error(data.details || 'Minden elérhető AI modell napi kvótája kimerült.');
      }

      if (!res.ok) throw new Error(data.error || 'Hiba történt az erőforrás lekérdezésekor.');

      // Háttérbeli modellváltás figyelmeztetés kezelése
      if (data._warning) {
        setWarningMessage(data._warning);
      }

      setServerData({
        document_content: data.document_content || null,
        faq_content: data.faq_content || null,
        quiz: data.quiz || null,
        citation: data.citation || '',
      });
    } catch (err) {
      if (!quotaExhausted) {
        console.error(err.message);
      }
    } finally {
      setResourceSubmitting(false);
    }
  };

  const handleChatSend = async () => {
    const trimmed = chatInput.trim();
    if (!trimmed || chatSubmitting) return;

    setMessages((prev) => [...prev, { role: 'user', content: trimmed }]);
    setChatInput('');
    setChatSubmitting(true);
    setQuotaExhausted(false);
    setWarningMessage(null);

    try {
      const res = await fetch('/api/mentor-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, activeMentors: selectedMentors }),
      });
      const data = await res.json();

      // 429-es státusz vagy "elfogyott a keret" hiba kezelése
      if (res.status === 429 || data.error === 'elfogyott a keret') {
        setQuotaExhausted(true);
        throw new Error(data.details || 'Minden elérhető AI modell napi kvótája kimerült.');
      }

      if (!res.ok) throw new Error(data.error || 'Hiba történt a mentor chat során.');

      // Háttérbeli modellváltás figyelmeztetés kezelése
      if (data._warning) {
        setWarningMessage(data._warning);
      }

      setMessages((prev) => [...prev, { role: 'assistant', data }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'error', content: err.message }]);
    } finally {
      setChatSubmitting(false);
    }
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-[#16181d] text-stone-400">Betöltés...</div>;
  if (!user) return <LoginForm onLogin={setUser} />;

  return (
    <div className={`flex min-h-screen flex-col bg-[#16181d] text-stone-100 ${presentationMode ? 'scale-105 transition-transform' : ''}`}>
      <Header 
        showButtons={true} 
        presentationMode={presentationMode} 
        setPresentationMode={setPresentationMode} 
        onLogout={handleLogout} 
      />

      {/* Keret kimerülését jelző hiba sáv */}
      {quotaExhausted && (
        <div className="bg-red-900/90 border-b border-red-700 p-3 text-center text-sm font-semibold text-red-200">
          ⚠️ Elfogyott a keret: Minden elérhető AI modell napi kvótája kimerült. Kérjük, próbálja meg később.
        </div>
      )}

      {/* Háttérbeli modellváltásról szóló figyelmeztető sáv */}
      {warningMessage && !quotaExhausted && (
        <div className="bg-amber-900/80 border-b border-amber-700 p-2 text-center text-xs font-semibold text-amber-200">
          ℹ️ {warningMessage}
        </div>
      )}

      <main className="grid flex-1 gap-4 p-4 lg:grid-cols-2">
        <ResourceEngine
          activeResourceMode={activeResourceMode}
          setActiveResourceMode={setActiveResourceMode}
          serverData={serverData}
          resourceInput={resourceInput}
          setResourceInput={setResourceInput}
          resourceSubmitting={resourceSubmitting}
          handleResourceFetch={handleResourceFetch}
        />

        <MentorChat
          selectedMentors={selectedMentors}
          toggleMentor={toggleMentor}
          messages={messages}
          chatInput={chatInput}
          setChatInput={setChatInput}
          chatSubmitting={chatSubmitting}
          handleChatSend={handleChatSend}
        />
      </main>

      <Footer />
    </div>
  );
}