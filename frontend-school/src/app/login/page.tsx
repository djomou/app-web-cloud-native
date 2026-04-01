"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const response = await fetch("http://192.168.56.10:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        document.cookie = `token=${data.token}; path=/; max-age=86400; SameSite=Lax`;
        router.push('/');
      } else {
        setError(data.message || "Identifiants incorrects.");
      }
    } catch {
      setError("Impossible de contacter la Gateway. Vérifiez le port 8080.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@600;700&display=swap');

        .login-bg {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background-color: #080c14;
          background-image:
            radial-gradient(ellipse 80% 60% at 20% 10%, rgba(59,130,246,0.12) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 80% 90%, rgba(245,158,11,0.07) 0%, transparent 50%),
            linear-gradient(rgba(59,130,246,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59,130,246,0.03) 1px, transparent 1px);
          background-size: auto, auto, 40px 40px, 40px 40px;
          font-family: 'DM Sans', sans-serif;
        }

        .login-card {
          width: 100%;
          max-width: 420px;
          background: rgba(13, 21, 37, 0.8);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(59,130,246,0.18);
          border-radius: 24px;
          padding: 48px 40px;
          box-shadow: 0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03) inset;
          animation: slideUp 0.5s cubic-bezier(0.4,0,0.2,1) both;
        }

        @keyframes slideUp {
          from { opacity:0; transform: translateY(24px); }
          to   { opacity:1; transform: translateY(0); }
        }

        .login-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-bottom: 32px;
        }

        .login-icon {
          width: 48px; height: 48px;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          font-size: 24px;
          box-shadow: 0 8px 24px rgba(59,130,246,0.4);
        }

        .login-brand {
          font-family: 'Playfair Display', serif;
          font-size: 26px;
          font-weight: 700;
          color: #f0f4ff;
          letter-spacing: -0.02em;
        }

        .login-tagline {
          text-align: center;
          font-size: 13px;
          color: #8899bb;
          margin-bottom: 36px;
          line-height: 1.5;
        }

        .login-label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: #8899bb;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 8px;
        }

        .login-input-wrap {
          position: relative;
          margin-bottom: 20px;
        }

        .login-input {
          width: 100%;
          background: rgba(8,12,20,0.6);
          border: 1px solid rgba(59,130,246,0.15);
          border-radius: 10px;
          padding: 13px 16px;
          color: #f0f4ff;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          outline: none;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }
        .login-input::placeholder { color: #4a5a7a; }
        .login-input:focus {
          border-color: #3b82f6;
          background: rgba(8,12,20,0.9);
          box-shadow: 0 0 0 3px rgba(59,130,246,0.2);
        }

        .pass-toggle {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #4a5a7a;
          font-size: 16px;
          padding: 4px;
          transition: color 0.2s;
        }
        .pass-toggle:hover { color: #8899bb; }

        .login-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 8px 0 24px;
        }
        .login-divider::before,
        .login-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(59,130,246,0.12);
        }
        .login-divider span {
          font-size: 11px;
          color: #4a5a7a;
          white-space: nowrap;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .login-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: #fff;
          border: none;
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 20px rgba(59,130,246,0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          letter-spacing: 0.01em;
        }
        .login-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 28px rgba(59,130,246,0.5);
          background: linear-gradient(135deg, #4f92ff, #3b82f6);
        }
        .login-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .login-error {
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 10px;
          padding: 12px 16px;
          color: #fca5a5;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
          animation: fadeIn 0.3s ease;
        }
        .login-hint strong { color: #f59e0b; font-weight: 600; }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @media (max-width: 480px) {
          .login-card { padding: 36px 24px; }
        }
      `}</style>

      <div className="login-bg">
        <div className="login-card">

          {/* Logo */}
          <div className="login-logo">
            <div className="login-icon">🎓</div>
            <span className="login-brand">
              School<span style={{ color: '#3b82f6' }}>Manager</span>
            </span>
          </div>

          <p className="login-tagline">
            Plateforme de gestion académique<br />
            <span style={{ color: '#4a5a7a' }}>Accès réservé aux administrateurs</span>
          </p>

          {error && (
            <div className="login-error">
              <span style={{ fontSize: '16px' }}>⚠️</span>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="login-input-wrap">
              <label className="login-label">Adresse email</label>
              <input
                type="email"
                className="login-input"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@ecole.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="login-input-wrap">
              <label className="login-label">Mot de passe</label>
              <input
                type={showPass ? 'text' : 'password'}
                className="login-input"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{ paddingRight: '44px' }}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="pass-toggle"
                onClick={() => setShowPass(v => !v)}
                tabIndex={-1}
              >
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>

            <button type="submit" className="login-btn" disabled={isLoading}>
              {isLoading ? (
                <><div className="spinner" /> Connexion en cours...</>
              ) : (
                <>Se connecter →</>
              )}
            </button>
          </form>

        </div>
      </div>
    </>
  );
}
