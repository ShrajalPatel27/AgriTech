import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import api from '../api';
import { useAuth } from '../AuthContext';
import { useLang } from '../i18n';
import { wmo, Advisories } from './Weather';

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useLang();
  const [d, setD] = useState({ farms: [], crops: [], soil: [], alerts: [] });
  const [w, setW] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const get = (u) => api.get(u).then((r) => r.data).catch(() => []);
      const [farms, crops, soil, alerts] = await Promise.all(['/farms', '/crops', '/soil', '/alerts'].map(get));
      setD({ farms, crops, soil, alerts });
      setLoading(false);
      if (farms[0]) api.get('/weather', { params: { farmId: farms[0]._id } }).then((r) => setW(r.data)).catch(() => {});
    })();
  }, []);

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary" /></div>;

  const soilSorted = [...d.soil].sort((a, b) => new Date(a.date) - new Date(b.date));
  const latest = soilSorted[soilSorted.length - 1];
  const nutrients = latest ? [{ name: 'N', value: latest.nitrogen || 0 }, { name: 'P', value: latest.phosphorus || 0 }, { name: 'K', value: latest.potassium || 0 }] : [];
  const phTrend = soilSorted.map((s) => ({ date: new Date(s.date).toLocaleDateString(), ph: s.ph }));
  const growing = d.crops.filter((c) => c.status === 'Growing').length;
  const stat = (label, value, to) => (
    <div className="col-6 col-lg-3" key={label}>
      <Link to={to} className="text-decoration-none text-dark">
        <div className="card stat-card h-100"><div className="card-body text-center">
          <div className="display-6">{value}</div><div className="text-muted small">{label}</div>
        </div></div>
      </Link>
    </div>
  );

  return (
    <div className="container py-4">
      <h2 className="page-title mb-1">{t('welcome')}, {user.name} 👋</h2>
      <p className="text-muted">{user.role === 'admin' ? 'You are logged in as an administrator.' : 'Here is an overview of your farm today.'}</p>

      <div className="row g-3 mb-3">
        {stat(t('farms'), d.farms.length, '/farms')}
        {stat(t('crops'), d.crops.length, '/crops')}
        {stat('Growing', growing, '/crops')}
        {stat('Soil score', latest?.analysis?.score ?? '-', '/soil')}
      </div>

      <div className="row g-3 mb-3">
        <div className="col-12 col-lg-5">
          <div className="card h-100"><div className="card-body">
            <h6>{t('weather')} {w?.location?.name && <span className="text-muted small">- {w.location.name}</span>}</h6>
            {w ? (
              <>
                <div className="weather-big">{wmo(w.current.code)[1]} {Math.round(w.current.temperature)}°C</div>
                <div className="small text-muted mb-2">{wmo(w.current.code)[0]} · Humidity {w.current.humidity}% · Wind {w.current.wind} km/h</div>
                <Advisories list={w.advisories.slice(0, 2)} />
                <Link to="/weather" className="small">7-day forecast →</Link>
              </>
            ) : <p className="text-muted mb-0">Add a farm to see live weather. <Link to="/farms">{t('farms')}</Link></p>}
          </div></div>
        </div>
        <div className="col-12 col-lg-7">
          <div className="card h-100"><div className="card-body">
            <h6>{t('alerts')}</h6>
            {d.alerts.slice(0, 3).map((a) => (
              <div key={a._id} className="d-flex gap-2 mb-2">
                <span className={`badge badge-${a.severity} align-self-start`}>{a.severity}</span>
                <div><b>{a.title}</b><div className="small text-muted">{a.crop} {a.region && `· ${a.region}`}</div></div>
              </div>
            ))}
            {!d.alerts.length && <p className="text-muted">No alerts.</p>}
            <Link to="/alerts" className="small">All alerts →</Link>
          </div></div>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-12 col-md-6">
          <div className="card"><div className="card-body">
            <h6>Latest soil nutrients (kg/ha)</h6>
            {nutrients.length ? (
              <div style={{ height: 220 }}><ResponsiveContainer><BarChart data={nutrients}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="value" fill="#2e7d32" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
            ) : <p className="text-muted">No soil readings yet. <Link to="/soil">Add one</Link></p>}
          </div></div>
        </div>
        <div className="col-12 col-md-6">
          <div className="card"><div className="card-body">
            <h6>Soil pH trend</h6>
            {phTrend.length > 1 ? (
              <div style={{ height: 220 }}><ResponsiveContainer><LineChart data={phTrend}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis domain={[4, 9]} /><Tooltip /><Line type="monotone" dataKey="ph" stroke="#ef6c00" strokeWidth={2} /></LineChart></ResponsiveContainer></div>
            ) : <p className="text-muted">Add at least two soil readings to see a trend.</p>}
          </div></div>
        </div>
      </div>
    </div>
  );
}
