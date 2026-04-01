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

const AVATAR_COLORS = [
  'linear-gradient(135deg,#3b82f6,#1d4ed8)',
  'linear-gradient(135deg,#10b981,#065f46)',
  'linear-gradient(135deg,#8b5cf6,#4c1d95)',
  'linear-gradient(135deg,#f59e0b,#92400e)',
  'linear-gradient(135deg,#ef4444,#7f1d1d)',
  'linear-gradient(135deg,#06b6d4,#164e63)',
];

export default function AttributionsPage() {
  const router = useRouter();
  const [attributions, setAttributions] = useState<any[]>([]);
  const [profs, setProfs]               = useState<any[]>([]);
  const [matieres, setMatieres]         = useState<any[]>([]);
  const [selectedProf, setSelectedProf] = useState('');
  const [selectedMat, setSelectedMat]   = useState('');
  const [annee, setAnnee]               = useState('2025-2026');
  const [error, setError]               = useState<string | null>(null);
  const [success, setSuccess]           = useState<string | null>(null);
  const [loading, setLoading]           = useState(true);
  const [submitting, setSubmitting]     = useState(false);
  const [filterProf, setFilterProf]     = useState('');
  const [filterMat, setFilterMat]       = useState('');

  const handleLogout = () => {
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax";
    router.push('/login');
  };

  const showSuccess = (msg: string) => { setSuccess(msg); setTimeout(() => setSuccess(null), 3500); };

  const loadData = async () => {
    const token = getToken();
    const headers = { "Authorization": `Bearer ${token}`, "Accept": "application/json" };
    setError(null);
    try {
      const [resAt, resPr, resMa] = await Promise.all([
        fetch(`${GATEWAY_URL}/api/attributions`, { headers }),
        fetch(`${GATEWAY_URL}/api/professeurs`,  { headers }),
        fetch(`${GATEWAY_URL}/api/matieres`,     { headers }),
      ]);
      if ([resAt, resPr, resMa].some(r => r.status === 401 || r.status === 403)) { handleLogout(); return; }
      if (resAt.ok) setAttributions(await resAt.json());
      if (resPr.ok) setProfs(await resPr.json());
      if (resMa.ok) setMatieres(await resMa.json());
    } catch { setError("Erreur de communication avec la Gateway. Vérifiez les conteneurs Docker."); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null); setSubmitting(true);
    const token = getToken();
    try {
      const res = await fetch(`${GATEWAY_URL}/api/attributions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ professeurId: Number(selectedProf), matiereId: Number(selectedMat), anneeAcademique: annee.trim() }),
      });
      if (res.ok) {
        setSelectedProf(''); setSelectedMat('');
        showSuccess("Affectation enregistrée avec succès !"); loadData();
      } else { setError("L'affectation a été refusée. Elle existe peut-être déjà."); }
    } catch { setError("Impossible de joindre la Gateway."); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Supprimer cette affectation définitivement ?")) return;
    const token = getToken();
    try {
      const res = await fetch(`${GATEWAY_URL}/api/attributions/${id}`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) { showSuccess("Affectation supprimée."); loadData(); }
    } catch { setError("Erreur lors de la suppression."); }
  };

  const getProf    = (id: number) => profs.find((p: any) => p.id === id);
  const getMatiere = (id: number) => matieres.find((m: any) => m.id === id);

  const filtered = attributions.filter((a: any) => {
    const prof = getProf(a.professeurId);
    const mat  = getMatiere(a.matiereId);
    const profMatch = !filterProf || String(a.professeurId) === filterProf;
    const matMatch  = !filterMat  || String(a.matiereId)    === filterMat;
    return profMatch && matMatch;
  });

  // Compter affectations par prof
  const profCount = (id: number) => attributions.filter((a: any) => a.professeurId === id).length;

  return (
    <ProtectedRoute>
      <style>{`
        .att-page { max-width:960px; margin:0 auto; padding:32px 20px 60px; font-family:'DM Sans',sans-serif; }
        .page-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:32px; gap:16px; flex-wrap:wrap; }
        .page-title { font-family:'Playfair Display',serif; font-size:clamp(22px,3vw,32px); color:#f0f4ff; letter-spacing:-0.02em; margin:0; }
        .page-subtitle { font-size:13px; color:#8899bb; margin-top:4px; }
        .stats-row { display:grid; grid-template-columns:repeat(auto-fit,minmax(140px,1fr)); gap:12px; margin-bottom:28px; }
        .stat-card { background:#111c30; border:1px solid rgba(249,115,22,0.18); border-radius:12px; padding:16px 20px; transition:all 0.2s; }
        .stat-card:hover { border-color:rgba(249,115,22,0.35); transform:translateY(-2px); }
        .stat-num { font-size:28px; font-weight:700; color:#f0f4ff; line-height:1; }
        .stat-lbl { font-size:11px; color:#8899bb; text-transform:uppercase; letter-spacing:0.07em; margin-top:4px; }

        /* Formulaire */
        .form-card { background:#111c30; border:1px solid rgba(249,115,22,0.18); border-radius:16px; padding:28px; margin-bottom:28px; }
        .form-title { font-size:13px; font-weight:600; color:#8899bb; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:20px; display:flex; align-items:center; gap:8px; }
        .form-grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:14px; }
        .field-wrap { display:flex; flex-direction:column; gap:6px; }
        .field-label { font-size:11px; font-weight:600; color:#8899bb; text-transform:uppercase; letter-spacing:0.07em; }
        .field-input, .field-select { background:rgba(8,12,20,0.6); border:1px solid rgba(249,115,22,0.15); border-radius:8px; padding:11px 14px; color:#f0f4ff; font-family:'DM Sans',sans-serif; font-size:14px; outline:none; transition:all 0.2s; width:100%; box-sizing:border-box; }
        .field-input::placeholder, .field-select::placeholder { color:#4a5a7a; }
        .field-input:focus, .field-select:focus { border-color:#f97316; box-shadow:0 0 0 3px rgba(249,115,22,0.15); background:rgba(8,12,20,0.9); }
        .field-select { appearance:none; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%238899bb' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 14px center; padding-right:40px; cursor:pointer; }
        .field-select option { background:#0d1525; color:#f0f4ff; }

        /* Boutons */
        .btn { display:inline-flex; align-items:center; justify-content:center; gap:7px; padding:11px 20px; border-radius:8px; font-family:'DM Sans',sans-serif; font-size:14px; font-weight:600; cursor:pointer; border:none; transition:all 0.2s; }
        .btn:disabled { opacity:0.4; cursor:not-allowed; }
        .btn-orange { background:#f97316; color:#fff; box-shadow:0 4px 14px rgba(249,115,22,0.3); width:100%; justify-content:center; padding:13px; font-size:15px; border-radius:10px; }
        .btn-orange:hover:not(:disabled) { background:#ea6c00; transform:translateY(-1px); box-shadow:0 6px 20px rgba(249,115,22,0.4); }
        .btn-ghost { background:transparent; color:#8899bb; border:1px solid rgba(249,115,22,0.15); }
        .btn-ghost:hover { background:rgba(249,115,22,0.07); color:#f0f4ff; }

        /* Alertes */
        .alert { padding:12px 16px; border-radius:8px; font-size:13px; font-weight:500; display:flex; align-items:center; gap:10px; margin-bottom:16px; animation:fadeIn 0.3s ease; }
        .alert-error { background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.2); color:#fca5a5; }
        .alert-success { background:rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.2); color:#6ee7b7; }

        /* Filtres */
        .filters-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:20px; }
        .filter-select { background:#111c30; border:1px solid rgba(249,115,22,0.15); border-radius:10px; padding:10px 14px 10px 14px; color:#f0f4ff; font-family:'DM Sans',sans-serif; font-size:13px; outline:none; transition:all 0.2s; width:100%; box-sizing:border-box; appearance:none; cursor:pointer; }
        .filter-select:focus { border-color:#f97316; }
        .filter-select option { background:#0d1525; }

        /* Cartes attributions */
        .att-list { display:flex; flex-direction:column; gap:10px; }
        .att-card { background:#111c30; border:1px solid rgba(249,115,22,0.15); border-radius:14px; padding:18px 20px; display:flex; align-items:center; gap:16px; transition:all 0.2s; animation:fadeInUp 0.35s both; }
        .att-card:hover { border-color:rgba(249,115,22,0.35); transform:translateX(2px); box-shadow:0 4px 20px rgba(0,0,0,0.25); }
        .att-avatar { width:42px; height:42px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:700; color:#fff; flex-shrink:0; }
        .att-prof { font-size:14px; font-weight:600; color:#f0f4ff; }
        .att-mat-code { font-family:monospace; font-size:11px; font-weight:700; color:#10b981; background:rgba(16,185,129,0.1); border:1px solid rgba(16,185,129,0.2); padding:2px 7px; border-radius:5px; }
        .att-mat-name { font-size:13px; color:#8899bb; }
        .att-year { font-size:11px; color:#4a5a7a; font-family:monospace; text-transform:uppercase; letter-spacing:0.06em; background:rgba(249,115,22,0.08); border:1px solid rgba(249,115,22,0.15); padding:2px 8px; border-radius:6px; }
        .att-del { background:none; border:none; cursor:pointer; color:#4a5a7a; font-size:18px; padding:6px; border-radius:6px; transition:all 0.2s; flex-shrink:0; margin-left:auto; }
        .att-del:hover { color:#ef4444; background:rgba(239,68,68,0.1); }
        .att-info { flex:1; min-width:0; display:flex; flex-direction:column; gap:5px; }
        .att-row2 { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }

        .empty-state { text-align:center; padding:64px 20px; color:#4a5a7a; }
        .empty-icon { font-size:48px; margin-bottom:16px; opacity:0.5; }
        .empty-text { font-size:15px; color:#8899bb; }
        .skeleton-item { background:linear-gradient(90deg,#111c30 25%,#162038 50%,#111c30 75%); background-size:200% 100%; animation:shimmer 1.5s infinite; border-radius:14px; height:74px; margin-bottom:10px; }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes fadeInUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        .spinner { width:15px;height:15px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:spin 0.7s linear infinite;display:inline-block; }
        @keyframes spin { to{transform:rotate(360deg)} }
        .divider { height:1px; background:rgba(249,115,22,0.1); margin:24px 0; }
        @media(max-width:640px){ .att-page{padding:20px 16px 40px} .form-grid-2,.filters-row{grid-template-columns:1fr} }
      `}</style>

      <div className="att-page">

        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">🔗 Affectations</h1>
            <p className="page-subtitle">Reliez les professeurs à leurs matières d'enseignement</p>
          </div>
          <button className="btn btn-ghost" onClick={handleLogout} style={{ flex: 'none', minWidth: 'auto' }}>
            ← Déconnexion
          </button>
        </div>

        {/* Stats */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-num">{attributions.length}</div>
            <div className="stat-lbl">Affectations</div>
          </div>
          <div className="stat-card">
            <div className="stat-num" style={{ color: '#f97316' }}>{profs.length}</div>
            <div className="stat-lbl">Professeurs</div>
          </div>
          <div className="stat-card">
            <div className="stat-num" style={{ color: '#10b981' }}>{matieres.length}</div>
            <div className="stat-lbl">Matières</div>
          </div>
          <div className="stat-card">
            <div className="stat-num">
              {profs.length > 0
                ? (attributions.length / profs.length).toFixed(1)
                : '0'}
            </div>
            <div className="stat-lbl">Moy. / prof</div>
          </div>
        </div>

        {/* Alertes */}
        {error   && <div className="alert alert-error">⚠️ {error}</div>}
        {success && <div className="alert alert-success">✅ {success}</div>}

        {/* Formulaire */}
        <div className="form-card">
          <div className="form-title">
            <span style={{ color: '#f97316' }}>✦</span>
            Nouvelle affectation
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-grid-2">
              <div className="field-wrap">
                <label className="field-label">Professeur</label>
                <select className="field-select" value={selectedProf} onChange={e => setSelectedProf(e.target.value)} required>
                  <option value="">— Sélectionner un enseignant —</option>
                  {profs.map((p: any) => (
                    <option key={p.id} value={p.id}>
                      {p.prenom} {p.nom} · {p.specialite}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field-wrap">
                <label className="field-label">Matière</label>
                <select className="field-select" value={selectedMat} onChange={e => setSelectedMat(e.target.value)} required>
                  <option value="">— Sélectionner une matière —</option>
                  {matieres.map((m: any) => (
                    <option key={m.id} value={m.id}>
                      {m.code} · {m.intitule}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="field-wrap" style={{ marginBottom: '18px' }}>
              <label className="field-label">Année académique</label>
              <input className="field-input" type="text" value={annee} onChange={e => setAnnee(e.target.value)}
                placeholder="Ex: 2025-2026" required />
            </div>

            {/* Aperçu sélection */}
            {selectedProf && selectedMat && (
              <div style={{ background:'rgba(249,115,22,0.06)', border:'1px solid rgba(249,115,22,0.15)', borderRadius:'10px', padding:'12px 16px', marginBottom:'16px', display:'flex', alignItems:'center', gap:'10px', fontSize:'13px', color:'#fdba74' }}>
                <span>👁</span>
                <span>
                  <strong>{profs.find(p => p.id === Number(selectedProf))?.prenom} {profs.find(p => p.id === Number(selectedProf))?.nom}</strong>
                  {' → '}
                  <strong>{matieres.find(m => m.id === Number(selectedMat))?.code}</strong>
                  {' · '}{annee}
                </span>
              </div>
            )}

            <button type="submit" className="btn btn-orange" disabled={submitting}>
              {submitting ? <><span className="spinner" /> Enregistrement...</> : '🔗 Valider l\'affectation'}
            </button>
          </form>
        </div>

        <div className="divider" />

        {/* Filtres */}
        <div className="filters-row">
          <select className="filter-select" value={filterProf} onChange={e => setFilterProf(e.target.value)}>
            <option value="">Tous les professeurs</option>
            {profs.map((p: any) => (
              <option key={p.id} value={p.id}>{p.prenom} {p.nom} ({profCount(p.id)})</option>
            ))}
          </select>
          <select className="filter-select" value={filterMat} onChange={e => setFilterMat(e.target.value)}>
            <option value="">Toutes les matières</option>
            {matieres.map((m: any) => <option key={m.id} value={m.id}>{m.code} · {m.intitule}</option>)}
          </select>
        </div>

        {/* Liste */}
        {loading ? (
          <div>{[1,2,3,4].map(i => <div key={i} className="skeleton-item" style={{ animationDelay:`${i*0.1}s` }}/>)}</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔗</div>
            <div className="empty-text">
              {filterProf || filterMat ? 'Aucune affectation pour ces filtres.' : 'Aucune affectation enregistrée.'}
            </div>
          </div>
        ) : (
          <div className="att-list">
            {filtered.map((a: any, i: number) => {
              const prof = getProf(a.professeurId);
              const mat  = getMatiere(a.matiereId);
              const avatarGrad = AVATAR_COLORS[(a.professeurId || 0) % AVATAR_COLORS.length];
              const initials = prof
                ? `${(prof.prenom || '')[0] || ''}${(prof.nom || '')[0] || ''}`.toUpperCase()
                : '??';
              return (
                <div key={a.id} className="att-card" style={{ animationDelay: `${i * 0.04}s` }}>
                  <div className="att-avatar" style={{ background: avatarGrad }}>{initials}</div>
                  <div className="att-info">
                    <div className="att-prof">
                      {prof ? `${prof.prenom} ${prof.nom}` : `Professeur #${a.professeurId}`}
                      {prof && (
                        <span style={{ fontSize:'11px', color:'#8899bb', fontWeight:400, marginLeft:'8px' }}>
                          {prof.specialite}
                        </span>
                      )}
                    </div>
                    <div className="att-row2">
                      {mat ? (
                        <>
                          <span className="att-mat-code">{mat.code}</span>
                          <span className="att-mat-name">{mat.intitule}</span>
                        </>
                      ) : (
                        <span style={{ color:'#4a5a7a', fontSize:'13px' }}>Matière #{a.matiereId}</span>
                      )}
                      <span className="att-year">{a.anneeAcademique}</span>
                    </div>
                  </div>
                  <button className="att-del" onClick={() => handleDelete(a.id)} title="Supprimer">🗑</button>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </ProtectedRoute>
  );
}
