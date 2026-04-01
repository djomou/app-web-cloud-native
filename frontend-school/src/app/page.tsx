"use client";

import ProtectedRoute from '@/components/ProtectedRoute';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const GATEWAY_URL = "http://192.168.56.10:8080";

const getToken = () => {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; token=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return null;
};

const SPECIALITE_COLORS: Record<string, string> = {
  default:        { bg: 'rgba(59,130,246,0.1)',  text: '#93c5fd', border: 'rgba(59,130,246,0.25)' } as any,
  math:           { bg: 'rgba(245,158,11,0.1)',  text: '#fcd34d', border: 'rgba(245,158,11,0.25)' } as any,
  info:           { bg: 'rgba(16,185,129,0.1)',  text: '#6ee7b7', border: 'rgba(16,185,129,0.25)' } as any,
  physique:       { bg: 'rgba(139,92,246,0.1)',  text: '#c4b5fd', border: 'rgba(139,92,246,0.25)' } as any,
  chimie:         { bg: 'rgba(249,115,22,0.1)',  text: '#fdba74', border: 'rgba(249,115,22,0.25)' } as any,
  français:       { bg: 'rgba(236,72,153,0.1)',  text: '#f9a8d4', border: 'rgba(236,72,153,0.25)' } as any,
};

function getBadgeStyle(specialite: string) {
  const key = Object.keys(SPECIALITE_COLORS).find(k =>
    k !== 'default' && specialite?.toLowerCase().includes(k)
  );
  return SPECIALITE_COLORS[key || 'default'] as { bg: string; text: string; border: string };
}

function getInitials(nom: string, prenom: string) {
  return `${(prenom || '')[0] || ''}${(nom || '')[0] || ''}`.toUpperCase();
}

const AVATAR_COLORS = [
  'linear-gradient(135deg,#3b82f6,#1d4ed8)',
  'linear-gradient(135deg,#10b981,#065f46)',
  'linear-gradient(135deg,#8b5cf6,#4c1d95)',
  'linear-gradient(135deg,#f59e0b,#92400e)',
  'linear-gradient(135deg,#ef4444,#7f1d1d)',
  'linear-gradient(135deg,#06b6d4,#164e63)',
];

export default function ProfesseursPage() {
  const router  = useRouter();
  const [profs, setProfs]             = useState<any[]>([]);
  const [nom, setNom]                 = useState('');
  const [prenom, setPrenom]           = useState('');
  const [specialite, setSpecialite]   = useState('');
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

  const showSuccess = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3000);
  };

  const fetchProfs = async () => {
    const token = getToken();
    setError(null);
    try {
      const res = await fetch(`${GATEWAY_URL}/api/professeurs`, {
        headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" }
      });
      if (res.status === 401 || res.status === 403) { handleLogout(); return; }
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
      const data = await res.json();
      setProfs(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError("Impossible d'afficher les professeurs. Vérifiez que le microservice est actif.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfs(); }, []);

  const handleCardClick = (p: any) => {
    if (selectedId === p.id) {
      setSelectedId(null); setNom(''); setPrenom(''); setSpecialite('');
    } else {
      setSelectedId(p.id); setNom(p.nom); setPrenom(p.prenom); setSpecialite(p.specialite);
    }
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const token = getToken();
    const payload = {
      nom: nom.trim(), prenom: prenom.trim(), specialite: specialite.trim(),
      email: `${prenom.trim().toLowerCase()}.${nom.trim().toLowerCase()}@ecole.com`
    };
    try {
      const res = await fetch(`${GATEWAY_URL}/api/professeurs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setNom(''); setPrenom(''); setSpecialite(''); setSelectedId(null);
        showSuccess("Professeur ajouté avec succès !");
        fetchProfs();
      } else { setError("Erreur lors de l'enregistrement."); }
    } catch { setError("Erreur de communication avec la Gateway."); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    if (!confirm("Supprimer ce professeur définitivement ?")) return;
    const token = getToken();
    try {
      const res = await fetch(`${GATEWAY_URL}/api/professeurs/${selectedId}`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setNom(''); setPrenom(''); setSpecialite(''); setSelectedId(null);
        showSuccess("Professeur supprimé.");
        fetchProfs();
      }
    } catch { setError("Erreur lors de la suppression."); }
  };

  const filtered = profs.filter(p =>
    `${p.nom} ${p.prenom} ${p.specialite}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ProtectedRoute>
      <style>{`
        .prof-page { max-width:960px; margin:0 auto; padding:32px 20px 60px; font-family:'DM Sans',sans-serif; }
        .page-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:32px; gap:16px; flex-wrap:wrap; }
        .page-title { font-family:'Playfair Display',serif; font-size:clamp(22px,3vw,32px); color:#f0f4ff; letter-spacing:-0.02em; margin:0; }
        .page-subtitle { font-size:13px; color:#8899bb; margin-top:4px; }
        .stats-row { display:grid; grid-template-columns:repeat(auto-fit,minmax(140px,1fr)); gap:12px; margin-bottom:28px; }
        .stat-card { background:#111c30; border:1px solid rgba(59,130,246,0.18); border-radius:12px; padding:16px 20px; transition:all 0.2s; }
        .stat-card:hover { border-color:rgba(59,130,246,0.35); transform:translateY(-2px); }
        .stat-num { font-size:28px; font-weight:700; color:#f0f4ff; line-height:1; }
        .stat-lbl { font-size:11px; color:#8899bb; text-transform:uppercase; letter-spacing:0.07em; margin-top:4px; }
        .form-card { background:#111c30; border:1px solid rgba(59,130,246,0.18); border-radius:16px; padding:28px; margin-bottom:28px; box-shadow:0 4px 24px rgba(0,0,0,0.3); }
        .form-title { font-size:13px; font-weight:600; color:#8899bb; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:20px; display:flex; align-items:center; gap:8px; }
        .form-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:14px; }
        .field-wrap { display:flex; flex-direction:column; gap:6px; }
        .field-label { font-size:11px; font-weight:600; color:#8899bb; text-transform:uppercase; letter-spacing:0.07em; }
        .field-input { background:rgba(8,12,20,0.6); border:1px solid rgba(59,130,246,0.15); border-radius:8px; padding:11px 14px; color:#f0f4ff; font-family:'DM Sans',sans-serif; font-size:14px; outline:none; transition:all 0.2s; width:100%; box-sizing:border-box; }
        .field-input::placeholder { color:#4a5a7a; }
        .field-input:focus { border-color:#3b82f6; box-shadow:0 0 0 3px rgba(59,130,246,0.18); background:rgba(8,12,20,0.9); }
        .btn-row { display:flex; gap:10px; margin-top:18px; flex-wrap:wrap; }
        .btn { display:inline-flex; align-items:center; justify-content:center; gap:7px; padding:11px 20px; border-radius:8px; font-family:'DM Sans',sans-serif; font-size:14px; font-weight:600; cursor:pointer; border:none; transition:all 0.2s; flex:1; min-width:120px; }
        .btn:disabled { opacity:0.4; cursor:not-allowed; }
        .btn-blue { background:#3b82f6; color:#fff; box-shadow:0 4px 14px rgba(59,130,246,0.3); }
        .btn-blue:hover:not(:disabled) { background:#2563eb; transform:translateY(-1px); box-shadow:0 6px 20px rgba(59,130,246,0.4); }
        .btn-red { background:rgba(239,68,68,0.1); color:#fca5a5; border:1px solid rgba(239,68,68,0.25); }
        .btn-red:hover:not(:disabled) { background:#ef4444; color:#fff; transform:translateY(-1px); }
        .btn-ghost { background:transparent; color:#8899bb; border:1px solid rgba(59,130,246,0.15); }
        .btn-ghost:hover { background:rgba(59,130,246,0.07); color:#f0f4ff; }
        .alert { padding:12px 16px; border-radius:8px; font-size:13px; font-weight:500; display:flex; align-items:center; gap:10px; margin-bottom:16px; animation:fadeIn 0.3s ease; }
        .alert-error { background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.2); color:#fca5a5; }
        .alert-success { background:rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.2); color:#6ee7b7; }
        .search-wrap { position:relative; margin-bottom:20px; }
        .search-icon { position:absolute; left:14px; top:50%; transform:translateY(-50%); font-size:14px; pointer-events:none; }
        .search-input { width:100%; background:#111c30; border:1px solid rgba(59,130,246,0.15); border-radius:10px; padding:11px 14px 11px 40px; color:#f0f4ff; font-family:'DM Sans',sans-serif; font-size:14px; outline:none; transition:all 0.2s; box-sizing:border-box; }
        .search-input::placeholder { color:#4a5a7a; }
        .search-input:focus { border-color:#3b82f6; box-shadow:0 0 0 3px rgba(59,130,246,0.15); }
        .cards-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:14px; }
        .prof-card { background:#111c30; border:1px solid rgba(59,130,246,0.15); border-radius:14px; padding:20px; cursor:pointer; transition:all 0.2s; display:flex; gap:14px; align-items:flex-start; animation:fadeInUp 0.35s both; }
        .prof-card:hover { border-color:rgba(59,130,246,0.35); transform:translateY(-2px); box-shadow:0 8px 24px rgba(0,0,0,0.3); }
        .prof-card.selected { background:rgba(59,130,246,0.08); border-color:#3b82f6; box-shadow:0 0 0 1px #3b82f6,0 8px 24px rgba(59,130,246,0.15); }
        .avatar { width:44px; height:44px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:15px; font-weight:700; color:#fff; flex-shrink:0; letter-spacing:0.02em; }
        .prof-name { font-size:15px; font-weight:600; color:#f0f4ff; margin-bottom:4px; }
        .prof-email { font-size:11px; color:#4a5a7a; margin-top:6px; font-style:italic; }
        .badge { display:inline-flex; align-items:center; padding:3px 10px; border-radius:99px; font-size:11px; font-weight:600; letter-spacing:0.03em; border:1px solid; }
        .empty-state { text-align:center; padding:64px 20px; color:#4a5a7a; }
        .empty-icon { font-size:48px; margin-bottom:16px; opacity:0.5; }
        .empty-text { font-size:15px; color:#8899bb; }
        .skeleton-card { background:linear-gradient(90deg,#111c30 25%,#162038 50%,#111c30 75%); background-size:200% 100%; animation:shimmer 1.5s infinite; border-radius:14px; height:88px; }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes fadeInUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        .spinner { width:15px;height:15px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:spin 0.7s linear infinite;display:inline-block; }
        @keyframes spin { to{transform:rotate(360deg)} }
        @media(max-width:640px){ .prof-page{padding:20px 16px 40px} .stats-row{grid-template-columns:1fr 1fr} }
      `}</style>

      <div className="prof-page">

        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">👤 Professeurs</h1>
            <p className="page-subtitle">Gérez les enseignants de l'établissement</p>
          </div>
          <button className="btn btn-ghost" onClick={handleLogout} style={{ flex: 'none', minWidth: 'auto' }}>
            ← Déconnexion
          </button>
        </div>

        {/* Stats */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-num">{profs.length}</div>
            <div className="stat-lbl">Total professeurs</div>
          </div>
          <div className="stat-card">
            <div className="stat-num">{new Set(profs.map((p: any) => p.specialite)).size}</div>
            <div className="stat-lbl">Spécialités</div>
          </div>
          <div className="stat-card">
            <div className="stat-num" style={{ color: selectedId ? '#3b82f6' : '#4a5a7a' }}>
              {selectedId ? '1' : '0'}
            </div>
            <div className="stat-lbl">Sélectionné</div>
          </div>
        </div>

        {/* Alertes */}
        {error   && <div className="alert alert-error">⚠️ {error}</div>}
        {success && <div className="alert alert-success">✅ {success}</div>}

        {/* Formulaire */}
        <div className="form-card">
          <div className="form-title">
            <span style={{ color: '#3b82f6' }}>✦</span>
            {selectedId ? 'Professeur sélectionné' : 'Ajouter un professeur'}
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="field-wrap">
                <label className="field-label">Nom</label>
                <input className="field-input" type="text" placeholder="Ex: Dupont" value={nom} onChange={e => setNom(e.target.value)} required />
              </div>
              <div className="field-wrap">
                <label className="field-label">Prénom</label>
                <input className="field-input" type="text" placeholder="Ex: Marie" value={prenom} onChange={e => setPrenom(e.target.value)} required />
              </div>
              <div className="field-wrap">
                <label className="field-label">Spécialité</label>
                <input className="field-input" type="text" placeholder="Ex: Mathématiques" value={specialite} onChange={e => setSpecialite(e.target.value)} required />
              </div>
            </div>
            <div className="btn-row">
              <button type="submit" className="btn btn-blue" disabled={submitting}>
                {submitting ? <><span className="spinner" /> Enregistrement...</> : selectedId ? '✚ Ajouter quand même' : '✚ Ajouter le professeur'}
              </button>
              <button type="button" className="btn btn-red" onClick={handleDelete} disabled={!selectedId}>
                🗑 Supprimer
              </button>
              {selectedId && (
                <button type="button" className="btn btn-ghost" style={{ flex: 'none' }}
                  onClick={() => { setSelectedId(null); setNom(''); setPrenom(''); setSpecialite(''); }}>
                  ✕ Désélectionner
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Recherche */}
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input className="search-input" type="text" placeholder="Rechercher par nom, prénom ou spécialité..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Liste */}
        {loading ? (
          <div className="cards-grid">
            {[1,2,3,4].map(i => <div key={i} className="skeleton-card" style={{ animationDelay: `${i*0.1}s` }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎓</div>
            <div className="empty-text">{search ? 'Aucun résultat pour cette recherche.' : 'Aucun professeur enregistré.'}</div>
          </div>
        ) : (
          <div className="cards-grid">
            {filtered.map((p: any, i: number) => {
              const badge = getBadgeStyle(p.specialite);
              const avatarGrad = AVATAR_COLORS[p.id % AVATAR_COLORS.length];
              return (
                <div key={p.id} className={`prof-card${selectedId === p.id ? ' selected' : ''}`}
                  style={{ animationDelay: `${i * 0.05}s` }}
                  onClick={() => handleCardClick(p)}>
                  <div className="avatar" style={{ background: avatarGrad }}>
                    {getInitials(p.nom, p.prenom)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="prof-name">{p.prenom} {p.nom}</div>
                    <div style={{ marginTop: '6px' }}>
                      <span className="badge" style={{ background: badge.bg, color: badge.text, borderColor: badge.border }}>
                        {p.specialite}
                      </span>
                    </div>
                    <div className="prof-email">{p.email}</div>
                  </div>
                  {selectedId === p.id && (
                    <div style={{ color: '#3b82f6', fontSize: '18px', flexShrink: 0 }}>✓</div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>
    </ProtectedRoute>
  );
}
