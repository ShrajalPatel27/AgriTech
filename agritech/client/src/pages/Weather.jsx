import { useEffect, useState } from 'react';
import { ComposedChart, Line, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from 'recharts';
import api, { errMsg } from '../api';
import { useLang } from '../i18n';

export function wmo(code) {
  if (code === 0) return ['Clear sky', '☀️'];
  if (code <= 3) return ['Partly cloudy', '⛅'];
  if (code === 45 || code === 48) return ['Fog', '🌫️'];
  if (code >= 51 && code <= 57) return ['Drizzle', '🌦️'];
  if (code >= 61 && code <= 67) return ['Rain', '🌧️'];
  if (code >= 71 && code <= 77) return ['Snow', '❄️'];
  if (code >= 80 && code <= 82) return ['Rain showers', '🌧️'];
  if (code >= 95) return ['Thunderstorm', '⛈️'];
  return ['Cloudy', '☁️'];
}

export function Advisories({ list }) {
  const color = { High: 'danger', Medium: 'warning', Low: 'success' };
  return list.map((a) => (
    <div key={a.title} className={`alert alert-${color[a.level]} py-2 mb-2`}>
      <b>{a.title}</b> <span className="small">- {a.text}</span>
    </div>
  ));
}

export default function Weather() {
  const { t } = useLang();
  const [farms, setFarms] = useState([]);
  const [farmId, setFarmId] = useState('');
  const [q, setQ] = useState('');
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const fetchWeather = async (params) => {
    setBusy(true);
    setErr('');
    try {
      const { data } = await api.get('/weather', { params });
      setData(data);
    } catch (e) {
      setErr(errMsg(e));
      setData(null);
    }
    setBusy(false);
  };

  useEffect(() => {
    api.get('/farms').then((r) => {
      setFarms(r.data);
      if (r.data[0]) {
        setFarmId(r.data[0]._id);
        fetchWeather({ farmId: r.data[0]._id });
      }
    });
  }, []);

  const search = async (e) => {
    e.preventDefault();
    if (!q.trim()) return;
    try {
      const { data: g } = await api.get('/weather/geocode', { params: { q } });
      setFarmId('');
      fetchWeather({ lat: g.lat, lon: g.lon, name: g.name });
    } catch (e2) {
      setErr(errMsg(e2));
    }
  };

  const [desc, icon] = data ? wmo(data.current.code) : [];

  return (
    <div className="container py-4">
      <h2 className="page-title mb-3">{t('weather')}</h2>
      <div className="row g-2 mb-3">
        <div className="col-12 col-md-4">
          <select className="form-select" value={farmId} onChange={(e) => { setFarmId(e.target.value); if (e.target.value) fetchWeather({ farmId: e.target.value }); }}>
            <option value="">-- {t('farms')} --</option>
            {farms.map((f) => <option key={f._id} value={f._id}>{f.name}</option>)}
          </select>
        </div>
        <form className="col-12 col-md-8 d-flex gap-2" onSubmit={search}>
          <input className="form-control" placeholder="Or search any city / village" value={q} onChange={(e) => setQ(e.target.value)} />
          <button className="btn btn-primary">Search</button>
        </form>
      </div>

      {err && <div className="alert alert-danger py-2">{err}</div>}
      {busy && <div className="text-center py-4"><div className="spinner-border text-primary" /></div>}
      {!busy && !data && !err && <p className="text-muted">Add a farm or search a place to see the forecast.</p>}

      {data && !busy && (
        <>
          <div className="row g-3 mb-3">
            <div className="col-12 col-md-5">
              <div className="card h-100"><div className="card-body">
                <div className="text-muted small">{data.location.name || `${data.location.lat}, ${data.location.lon}`} {data.cached && <span className="badge bg-secondary">cached</span>}</div>
                <div className="weather-big">{icon} {Math.round(data.current.temperature)}°C</div>
                <div>{desc}</div>
                <div className="small text-muted mt-2">Humidity {data.current.humidity}% · Wind {data.current.wind} km/h · Rain {data.current.precipitation} mm</div>
              </div></div>
            </div>
            <div className="col-12 col-md-7">
              <div className="card h-100"><div className="card-body">
                <h6>Crop &amp; pest advisories</h6>
                <Advisories list={data.advisories} />
              </div></div>
            </div>
          </div>
          <div className="card mb-3"><div className="card-body">
            <h6>7-day forecast</h6>
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer>
                <ComposedChart data={data.daily.map((d) => ({ ...d, day: d.date.slice(5) }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis yAxisId="l" unit="°" />
                  <YAxis yAxisId="r" orientation="right" unit="mm" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="r" dataKey="rain" name="Rain (mm)" fill="#64b5f6" />
                  <Line yAxisId="l" type="monotone" dataKey="max" name="Max °C" stroke="#e53935" strokeWidth={2} />
                  <Line yAxisId="l" type="monotone" dataKey="min" name="Min °C" stroke="#1e88e5" strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div></div>
        </>
      )}
    </div>
  );
}
