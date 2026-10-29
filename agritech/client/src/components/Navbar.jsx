import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useLang, LANGS } from '../i18n';

const links = [
  ['/', 'dashboard'], ['/farms', 'farms'], ['/crops', 'crops'], ['/soil', 'soil'], ['/weather', 'weather'],
  ['/alerts', 'alerts'], ['/shop', 'shop'], ['/consult', 'consult'], ['/forum', 'forum'],
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { t, lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const all = user?.role === 'admin' ? [...links, ['/admin', 'admin']] : links;

  return (
    <nav className="navbar navbar-expand-lg agri-nav navbar-dark sticky-top">
      <div className="container-fluid">
        <NavLink className="navbar-brand fw-bold" to="/">🌾 {t('appName')}</NavLink>
        <button className="navbar-toggler" type="button" aria-label="Menu" onClick={() => setOpen(!open)}>
          <span className="navbar-toggler-icon" />
        </button>
        <div className={`collapse navbar-collapse ${open ? 'show' : ''}`}>
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {all.map(([to, key]) => (
              <li className="nav-item" key={to}>
                <NavLink end={to === '/'} to={to} className="nav-link" onClick={() => setOpen(false)}>{t(key)}</NavLink>
              </li>
            ))}
          </ul>
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <select className="form-select form-select-sm" style={{ width: 110 }} value={lang} onChange={(e) => setLang(e.target.value)} aria-label={t('language')}>
              {Object.entries(LANGS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <span className="text-white small">{user?.name}</span>
            <button className="btn btn-sm btn-light" onClick={() => { logout(); nav('/login'); }}>{t('logout')}</button>
          </div>
        </div>
      </div>
    </nav>
  );
}
