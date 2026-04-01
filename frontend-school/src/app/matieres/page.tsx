"use client";
import ProtectedRoute from '@/components/ProtectedRoute';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const GATEWAY_URL = "http://192.168.56.10:8080";
const getToken = () => {
  if (typeof document === "undefined") return null;
  const v = `; ${document.cookie}`, p = v.split(`; token=`);
  if (p.length === 2) return p.pop()?.split(';').shift();
  return null;
};

const CREDIT_COLOR: Record<number, { bg: string; text: string; border: string }> = {
  1: { bg:'rgba(239,68,68,0.1)',   text:'#fca5a5', border:'rgba(239,68,68,0.25)' },
  2: { bg:'rgba(249,115,22,0.1)',  text:'#fdba74', border:'rgba(249,115,22,0.25)' },
  3: { bg:'rgba(59,130,246,0.1)',  text:'#93c5fd', border:'rgba(59,130,246,0.25)' },
  4: { bg:'rgba(139,92,246,0.1)',  text:'#c4b5fd', border:'rgba(139,92,246,0.25)' },
  5: { bg:'rgba(16,185,129,0.1)',  text:'#6ee7b7', border:'rgba(16,185,129,0.25)' },
  6: { bg:'rgba(245,158,11,0.1)',  text:'#fcd34d', border:'rgba(245,158,11,0.25)' },
};
const getCreditStyle = (c: number) => CREDIT_COLOR[Math.min(c, 6)] || CREDIT_COLOR[3];

export default function MatieresPage() {
  const router = useRouter();
  const [matieres, setMatieres]       = useState<any[]>([]);
  const [intitule, setIntitule]       = useState('');
  const [code, setCode]               = useState('');
  const [credits, setCredits]         = useState(3);
  const [selectedId, setSelectedId]   = useState<number | null>(null);
  const [error, setError]             = useState<string | null>(null);
  const [success, setSuccess]         = useState<string | null>(null);
  const [loading, setLoading]         = useState(true);
  const [submitting, setSubmitting]   = useState(false);
  const [search, setSearch]           = useState('');

  const handleLogout = () => {
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax";
    router.push('/login');
  };

  const showSuccess = (msg: string) => { setSuccess(msg); setTimeout(() => setSuccess(null), 3000); };

  const fetchMatieres = async () => {
    const token = getToken();
    setError(null);
    try {
      const res = await fetch(`${GATEWAY_URL}/api/matieres`, {
        headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" }
      });
      if (res.status === 401 || res.status === 403) { handleLogout(); return; }
      if (!res.ok) throw new Error();
      const data = await res.json();
      setMatieres(Array.isArray(data) ? data : []);
    } catch { setError("Impossible de charger les matières. Vérifiez le microservice."); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchMatieres(); }, []);

  const handleCardClick = (m: any) => {
    if (selectedId === m.id) {
      setSelectedId(null); setIntitule(''); setCode(''); setCredits(3);
    } else {
      setSelectedId(m.id); setIntitule(m.intitule); setCode(m.code); setCredits(m.credits);
    }
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null); setSubmitting(true);
    const token = getToken();
    try {
      const res = await fetch(`${GATEWAY_URL}/api/matieres`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ intitule: intitule.trim(), code: code.trim().toUpperCase(), credits: Number(credits) }),
      });
      if (res.ok) {
        setIntitule(''); setCode(''); setCredits(3); setSelectedId(null);
        showSuccess("Matière ajoutée avec succès !"); fetchMatieres();
      } else { setError("Action refusée par la Gateway."); }
    } catch { setError("Erreur de connexion."); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!selectedId || !confirm("Supprimer cette matière définitivement ?")) return;
    const token = getToken();
    try {
      const res = await fetch(`${GATEWAY_URL}/api/matieres/${selectedId}`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setIntitule(''); setCode(''); setCredits(3); setSelectedId(null);
        showSuccess("Matière supprimée."); fetchMatieres();
      }
    } catch { setError("Erreur lors de la suppression."); }
  };

  const filtered = matieres.filter(m =>
    `${m.intitule} ${m.code}`.toLowerCase().includes(search.toLowerCase())
  );

  const totalCredits = matieres.reduce((acc: number, m: any) => acc + (m.credits || 0), 0);

  return (
    <ProtectedRoute>
      <style>{`
        .mat-page { max-width:960px; margin:0 auto; padding:32px 20px 60px; font-family:'DM Sans',sans-serif; }
        .page-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:32px; gap:16px; flex-wrap:wrap; }
        .page-title { font-family:'Playfair Display',serif; font-size:clamp(22px,3vw,32px); color:#f0f4ff; letter-spacing:-0.02em; margin:0; }
        .page-subtitle { font-size:13px; color:#8899bb; margin-top:4px; }
        .stats-row { display:grid; grid-template-columns:repeat(auto-fit,minmax(140px,1fr)); gap:12px; margin-bottom:28px; }
        .stat-card { background:#111c30; border:1px solid rgba(16,185,129,0.18); border-radius:12px; padding:16px 20px; transition:all 0.2s; }
        .stat-card:hover { border-color:rgba(16,185,129,0.35); transform:translateY(-2px); }
        .stat-num { font-size:28px; font-weight:700; color:#f0f4ff; line-height:1; }
        .stat-lbl { font-size:11px; color:#8899bb; text-transform:uppercase; letter-spacing:0.07em; margin-top:4px; }
        .form-card { background:#111c30; border:1px solid rgba(16,185,129,0.18); border-radius:16px; padding:28px; margin-bottom:28px; }
        .form-title { font-size:13px; font-weight:600; color:#8899bb; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:20px; display:flex; align-items:center; gap:8px; }
        .form-grid { display:grid; grid-template-columns:2fr 1fr 1fr; gap:14px; }
        .field-wrap { display:flex; flex-direction:column; gap:6px; }
        .field-label { font-size:11px; font-weight:600; color:#8899bb; text-transform:uppercase; letter-spacing:0.07em; }
        .field-input { background:rgba(8,12,20,0.6); border:1px solid rgba(16,185,129,0.15); border-radius:8px; padding:11px 14px; color:#f0f4ff; font-family:'DM Sans',sans-serif; font-size:14px; outline:none; transition:all 0.2s; width:100%; box-sizing:border-box; }
        .field-input::placeholder { color:#4a5a7a; }
        .field-input:focus { border-color:#10b981; box-shadow:0 0 0 3px rgba(16,185,129,0.18); background:rgba(8,12,20,0.9); }
        .btn-row { display:flex; gap:10px; margin-top:18px; flex-wrap:wrap; }
        .btn { display:inline-flex; align-items:center; justify-content:center; gap:7px; padding:11px 20px; border-radius:8px; font-family:'DM Sans',sans-serif; font-size:14px; font-weight:600; cursor:pointer; border:none; transition:all 0.2s; flex:1; min-width:120px; }
        .btn:disabled { opacity:0.4; cursor:not-allowed; }
        .btn-green { background:#10b981; color:#fff; box-shadow:0 4px 14px rgba(16,185,129,0.3); }
        .btn-green:hover:not(:disabled) { background:#059669; transform:translateY(-1px); }
        .btn-red { background:rgba(239,68,68,0.1); color:#fca5a5; border:1px solid rgba(239,68,68,0.25); }
        .btn-red:hover:not(:disabled) { background:#ef4444; color:#fff; transform:translateY(-1px); }
        .btn-ghost { background:transparent; color:#8899bb; border:1px solid rgba(16,185,129,0.15); }
        .btn-ghost:hover { background:rgba(16,185,129,0.07); color:#f0f4ff; }
        .alert { padding:12px 16px; border-radius:8px; font-size:13px; font-weight:500; display:flex; align-items:center; gap:10px; margin-bottom:16px; animation:fadeIn 0.3s ease; }
        .alert-error { background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.2); color:#fca5a5; }
        .alert-success { background:rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.2); color:#6ee7b7; }
        .search-wrap { position:relative; margin-bottom:20px; }
        .search-icon { position:absolute; left:14px; top:50%; transform:translateY(-50%); font-size:14px; pointer-events:none; }
        .search-input { width:100%; background:#111c30; border:1px solid rgba(16,185,129,0.15); border-radius:10px; padding:11px 14px 11px 40px; color:#f0f4ff; font-family:'DM Sans',sans-serif; font-size:14px; outline:none; transition:all 0.2s; box-sizing:border-box; }
        .search-input::placeholder { color:#4a5a7a; }
        .search-input:focus { border-color:#10b981; box-shadow:0 0 0 3px rgba(16,185,129,0.15); }
        .cards-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(240px,1fr)); gap:14px; }
        .mat-card { background:#111c30; border:1px solid rgba(16,185,129,0.15); border-radius:14px; padding:20px; cursor:pointer; transition:all 0.2s; animation:fadeInUp 0.35s both; position:relative; overflow:hidden; }
        .mat-card::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; background:linear-gradient(90deg,#10b981,#059669); opacity:0; transition:opacity 0.2s; }
        .mat-card:hover { border-color:rgba(16,185,129,0.35); transform:translateY(-2px); box-shadow:0 8px 24px rgba(0,0,0,0.3); }
        .mat-card:hover::before { opacity:1; }
        .mat-card.selected { background:rgba(16,185,129,0.07); border-color:#10b981; box-shadow:0 0 0 1px #10b981; }
        .mat-card.selected::before { opacity:1; }
        .mat-code { font-family:monospace; font-size:11px; font-weight:700; letter-spacing:0.08em; color:#10b981; background:rgba(16,185,129,0.1); border:1px solid rgba(16,185,129,0.2); padding:3px 8px; border-radius:6px; display:inline-block; margin-bottom:10px; }
        .mat-name { font-size:15px; font-weight:600; color:#f0f4ff; margin-bottom:12px; line-height:1.3; }
        .mat-footer { display:flex; align-items:center; justify-content:space-between; }
        .credit-badge { display:inline-flex; align-items:center; gap:5px; padding:4px 10px; border-radius:99px; font-size:12px; font-weight:600; border:1px solid; }
        .selected-check { color:#10b981; font-size:18px; }
        .empty-state { text-align:center; padding:64px 20px; color:#4a5a7a; }
        .empty-icon { font-size:48px; margin-bottom:16px; opacity:0.5; }
        .empty-text { font-size:15px; color:#8899bb; }
        .skeleton-card { background:linear-gradient(90deg,#111c30 25%,#162038 50%,#111c30 75%); background-size:200% 100%; animation:shimmer 1.5s infinite; border-radius:14px; height:110px; }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes fadeInUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        .spinner { width:15px;height:15px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:spin 0.7s linear infinite;display:inline-block; }
        @keyframes spin { to{transform:rotate(360deg)} }
        @media(max-width:640px){ .mat-page{padding:20px 16px 40px} .form-grid{grid-template-columns:1fr} }
      `}</style>

      <div className="mat-page">

        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">📚 Matières</h1>
            <p className="page-subtitle">Catalogue des enseignements de l'établissement</p>
          </div>
          <button className="btn btn-ghost" onClick={handleLogout} style={{ flex: 'none', minWidth: 'auto' }}>
            ← Déconnexion
          </button>
        </div>

        {/* Stats */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-num">{matieres.length}</div>
            <div className="stat-lbl">Total matières</div>
          </div>
          <div className="stat-card">
            <div className="stat-num" style={{ color: '#10b981' }}>{totalCredits}</div>
            <div className="stat-lbl">Crédits totaux</div>
          </div>
          <div className="stat-card">
            <div className="stat-num">{matieres.length > 0 ? (totalCredits / matieres.length).toFixed(1) : '0'}</div>
            <div className="stat-lbl">Moy. crédits</div>
          </div>
        </div>

        {/* Alertes */}
        {error   && <div className="alert alert-error">⚠️ {error}</div>}
        {success && <div className="alert alert-success">✅ {success}</div>}

        {/* Formulaire */}
        <div className="form-card">
          <div className="form-title">
            <span style={{ color: '#10b981' }}>✦</span>
            {selectedId ? 'Matière sélectionnée' : 'Ajouter une matière'}
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="field-wrap">
                <label className="field-label">Intitulé</label>
                <input className="field-input" type="text" placeholder="Ex: Mathématiques Avancées" value={intitule} onChange={e => setIntitule(e.target.value)} required />
              </div>
              <div className="field-wrap">
                <label className="field-label">Code</label>
                <input className="field-input" type="text" placeholder="Ex: MATH101" value={code} onChange={e => setCode(e.target.value)} required />
              </div>
              <div className="field-wrap">
                <label className="field-label">Crédits</label>
                <input className="field-input" type="number" min="1" max="10" value={credits} onChange={e => setCredits(Number(e.target.value))} required />
              </div>
            </div>
            <div className="btn-row">
              <button type="submit" className="btn btn-green" disabled={submitting}>
                {submitting ? <><span className="spinner" /> Enregistrement...</> : '✚ Enregistrer la matière'}
              </button>
              <button type="button" className="btn btn-red" onClick={handleDelete} disabled={!selectedId}>
                🗑 Supprimer
              </button>
              {selectedId && (
                <button type="button" className="btn btn-ghost" style={{ flex: 'none' }}
                  onClick={() => { setSelectedId(null); setIntitule(''); setCode(''); setCredits(3); }}>
                  ✕ Désélectionner
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Recherche */}
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input className="search-input" type="text" placeholder="Rechercher par intitulé ou code..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Liste */}
        {loading ? (
          <div className="cards-grid">
            {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton-card" style={{ animationDelay: `${i*0.08}s` }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📖</div>
            <div className="empty-text">{search ? 'Aucun résultat.' : 'Aucune matière enregistrée.'}</div>
          </div>
        ) : (
          <div className="cards-grid">
            {filtered.map((m: any, i: number) => {
              const cs = getCreditStyle(m.credits);
              return (
                <div key={m.id} className={`mat-card${selectedId === m.id ? ' selected' : ''}`}
                  style={{ animationDelay: `${i * 0.05}s` }}
                  onClick={() => handleCardClick(m)}>
                  <div className="mat-code">{m.code}</div>
                  <div className="mat-name">{m.intitule}</div>
                  <div className="mat-footer">
                    <span className="credit-badge" style={{ background: cs.bg, color: cs.text, borderColor: cs.border }}>
                      ⭐ {m.credits} crédit{m.credits > 1 ? 's' : ''}
                    </span>
                    {selectedId === m.id && <span className="selected-check">✓</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </ProtectedRoute>
  );
}
