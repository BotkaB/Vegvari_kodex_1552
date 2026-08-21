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
    <div className="flex min-h-screen flex-col bg-castle-dark text-stone-100">
      <Header showButtons={false} />
      <main className="flex flex-1 items-center justify-center px-4" role="main">
        <div className="w-full max-w-md rounded-3xl border border-castle-border bg-castle-light/95 p-8 shadow-2xl backdrop-blur-sm">
          <div className="mb-8 text-center">
            <p className="text-xs uppercase tracking-[0.24em] text-ember-400 font-semibold">Végvári Kódex 1552</p>
            <h1 className="mt-2 text-3xl font-black text-white">Bejelentkezés</h1>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4" aria-label="Bejelentkezési űrlap">
            <div>
              <label htmlFor="username" className="mb-2 block text-sm font-medium text-stone-300">Felhasználónév</label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="castle-input"
                placeholder="Felhasználónév"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-stone-300">Jelszó</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="castle-input"
                placeholder="Jelszó"
              />
            </div>
            {error && (
              <div className="error-box" role="alert">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Feldolgozás...' : 'Bejelentkezés'}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}