import { useState } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

export function LoginForm({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Bejelentkezés sikertelen.');
        return;
      }
      onLogin(data.user);
    } catch (err) {
      setError(err.message || 'Hálózati hiba.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#16181d] text-stone-100">
      <Header showButtons={false} />
      <div className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-md rounded-3xl border border-[#3a3f4d] bg-[#1f222b]/95 p-8 shadow-2xl backdrop-blur-sm">
          <div className="mb-8 text-center">
            <p className="text-xs uppercase tracking-[0.24em] text-amber-400 font-semibold">Végvári Kódex 1552</p>
            <h1 className="mt-2 text-3xl font-black text-white">Bejelentkezés</h1>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-stone-300">Felhasználónév</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-2xl border border-[#3a3f4d] bg-[#14161b] px-4 py-2 text-white outline-none focus:border-amber-400 shadow-inner"
                placeholder="Felhasználónév"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-stone-300">Jelszó</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-[#3a3f4d] bg-[#14161b] px-4 py-2 text-white outline-none focus:border-amber-400 shadow-inner"
                placeholder="Jelszó"
              />
            </div>
            {error && (
              <div className="rounded-2xl border border-red-500/50 bg-red-500/10 px-4 py-2 text-sm text-red-200">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2.5 font-bold text-stone-950 transition hover:brightness-110 disabled:opacity-50 shadow-lg"
            >
              {loading ? 'Feldolgozás...' : 'Bejelentkezés'}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}