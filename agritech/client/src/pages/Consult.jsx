import { useEffect, useState } from 'react';
import api, { errMsg, fmtDate } from '../api';
import { useAuth } from '../AuthContext';
import { useLang } from '../i18n';

const statusColor = { Open: 'warning', Answered: 'info', Resolved: 'success' };

export default function Consult() {
  const { t } = useLang();
  const { user } = useAuth();
  const isAdmin = user.role === 'admin';
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ subject: '', question: '' });
  const [reply, setReply] = useState({});
  const [err, setErr] = useState('');

  const load = () => api.get('/consultations').then((r) => setList(r.data)).catch((e) => setErr(errMsg(e)));
  useEffect(() => { load(); }, []);

  const ask = async (e) => {
    e.preventDefault();
    try {
      await api.post('/consultations', form);
      setForm({ subject: '', question: '' });
      setErr('');
      load();
    } catch (e2) {
      setErr(errMsg(e2));
    }
  };
  const send = async (id) => {
    try {
      await api.post(`/consultations/${id}/reply`, { text: reply[id] });
      setReply({ ...reply, [id]: '' });
      load();
    } catch (e) {
      setErr(errMsg(e));
    }
  };
  const resolve = async (id) => {
    await api.patch(`/consultations/${id}/status`, { status: 'Resolved' }).catch((e) => setErr(errMsg(e)));
    load();
  };

  return (
    <div className="container py-4">
      <h2 className="page-title mb-3">{t('consult')}</h2>
      {err && <div className="alert alert-danger py-2">{err}</div>}

      {!isAdmin && (
        <form className="card card-body mb-4" onSubmit={ask}>
          <h6>Ask an agriculture expert</h6>
          <input className="form-control mb-2" placeholder="Subject (e.g. Yellow leaves on tomato)" required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
          <textarea className="form-control mb-2" rows={3} placeholder="Describe your problem in detail" required value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} />
          <div><button className="btn btn-primary">Submit question</button></div>
        </form>
      )}

      {!list.length && <p className="text-muted">{t('noData')}</p>}
      {list.map((c) => (
        <div className="card mb-3" key={c._id}><div className="card-body">
          <div className="d-flex justify-content-between flex-wrap gap-1">
            <h6 className="mb-0">{c.subject}</h6>
            <span className={`badge bg-${statusColor[c.status]}`}>{c.status}</span>
          </div>
          <div className="small text-muted mb-2">{c.farmerName} · {fmtDate(c.createdAt)}</div>
          <p className="mb-2">{c.question}</p>
          {c.replies.map((r, i) => (
            <div key={i} className={`thread ${r.isExpert ? 'expert' : ''}`}>
              <div className="small fw-semibold">{r.byName} {r.isExpert && <span className="badge bg-success">Expert</span>} <span className="text-muted fw-normal">· {fmtDate(r.at)}</span></div>
              <div>{r.text}</div>
            </div>
          ))}
          {c.status !== 'Resolved' && (
            <div className="d-flex gap-2 mt-3">
              <input className="form-control" placeholder="Write a reply..." value={reply[c._id] || ''} onChange={(e) => setReply({ ...reply, [c._id]: e.target.value })} />
              <button className="btn btn-primary" disabled={!(reply[c._id] || '').trim()} onClick={() => send(c._id)}>Reply</button>
              <button className="btn btn-outline-success" onClick={() => resolve(c._id)}>Resolve</button>
            </div>
          )}
        </div></div>
      ))}
    </div>
  );
}
