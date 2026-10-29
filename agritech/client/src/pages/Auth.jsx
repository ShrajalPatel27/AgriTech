import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useLang, LANGS } from '../i18n';
import { errMsg } from '../api';

function Shell({ title, children }) {
  const { t, lang, setLang } = useLang();
  return (
    <div className="auth-wrap">
      <div className="card auth-card">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3 className="mb-0 page-title">🌾 {t('appName')}</h3>
            <select className="form-select form-select-sm w-auto" value={lang} onChange={(e) => setLang(e.target.value)} aria-label={t('language')}>
              {Object.entries(LANGS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <h5 className="mb-3">{title}</h5>
          {children}
        </div>
      </div>
    </div>
  );
}

export function Login() {
  const { user, login } = useAuth();
  const { t } = useLang();
  const nav = useNavigate();
  const [f, setF] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await login(f.email, f.password);
      nav('/');
    } catch (e2) {
      setErr(errMsg(e2));
      setBusy(false);
    }
  };

  return (
    <Shell title={t('login')}>
      {err && <div className="alert alert-danger py-2">{err}</div>}
      <form onSubmit={submit}>
        <div className="mb-3">
          <label className="form-label">{t('email')}</label>
          <input className="form-control" type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        </div>
        <div className="mb-3">
          <label className="form-label">{t('password')}</label>
          <input className="form-control" type="password" required value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
        </div>
        <button className="btn btn-primary w-100" disabled={busy}>{busy ? t('loading') : t('login')}</button>
      </form>
      <p className="mt-3 mb-2 small">{t('noAccount')} <Link to="/register">{t('register')}</Link></p>
      <div className="small text-muted border-top pt-2">
        {t('demo')}:
        <div className="d-flex gap-2 mt-1 flex-wrap">
          <button className="btn btn-sm btn-outline-secondary" onClick={() => setF({ email: 'farmer@agritech.com', password: 'Farmer@123' })}>Farmer</button>
          <button className="btn btn-sm btn-outline-secondary" onClick={() => setF({ email: 'admin@agritech.com', password: 'Admin@123' })}>Admin</button>
        </div>
      </div>
    </Shell>
  );
}

export function Register() {
  const { user, register } = useAuth();
  const { t, lang } = useLang();
  const nav = useNavigate();
  const [f, setF] = useState({ name: '', email: '', password: '', phone: '', location: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/" replace />;
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (f.password.length < 6) return setErr('Password must be at least 6 characters');
    setBusy(true);
    try {
      await register({ ...f, language: lang });
      nav('/');
    } catch (e2) {
      setErr(errMsg(e2));
      setBusy(false);
    }
  };

  return (
    <Shell title={t('register')}>
      {err && <div className="alert alert-danger py-2">{err}</div>}
      <form onSubmit={submit}>
        <div className="mb-2"><label className="form-label">{t('name')}</label><input className="form-control" required value={f.name} onChange={set('name')} /></div>
        <div className="mb-2"><label className="form-label">{t('email')}</label><input className="form-control" type="email" required value={f.email} onChange={set('email')} /></div>
        <div className="mb-2"><label className="form-label">{t('password')}</label><input className="form-control" type="password" required minLength={6} value={f.password} onChange={set('password')} /></div>
        <div className="row g-2 mb-3">
          <div className="col"><label className="form-label">{t('phone')}</label><input className="form-control" value={f.phone} onChange={set('phone')} /></div>
          <div className="col"><label className="form-label">{t('location')}</label><input className="form-control" value={f.location} onChange={set('location')} /></div>
        </div>
        <button className="btn btn-primary w-100" disabled={busy}>{busy ? t('loading') : t('register')}</button>
      </form>
      <p className="mt-3 mb-0 small">{t('haveAccount')} <Link to="/login">{t('login')}</Link></p>
    </Shell>
  );
}
