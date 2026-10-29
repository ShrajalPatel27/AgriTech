import { useEffect, useState } from 'react';
import api, { errMsg, fmtDate } from '../api';
import { useAuth } from '../AuthContext';
import { useLang } from '../i18n';

export default function Forum() {
  const { t } = useLang();
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState({ title: '', body: '' });
  const [comment, setComment] = useState({});
  const [err, setErr] = useState('');

  const load = () => api.get('/forum').then((r) => setPosts(r.data)).catch((e) => setErr(errMsg(e)));
  useEffect(() => { load(); }, []);

  const post = async (e) => {
    e.preventDefault();
    try {
      await api.post('/forum', form);
      setForm({ title: '', body: '' });
      setErr('');
      load();
    } catch (e2) {
      setErr(errMsg(e2));
    }
  };
  const addComment = async (id) => {
    try {
      await api.post(`/forum/${id}/comments`, { text: comment[id] });
      setComment({ ...comment, [id]: '' });
      load();
    } catch (e) {
      setErr(errMsg(e));
    }
  };
  const del = async (id) => {
    if (!window.confirm('Delete this post?')) return;
    await api.delete(`/forum/${id}`).catch((e) => setErr(errMsg(e)));
    load();
  };

  return (
    <div className="container py-4">
      <h2 className="page-title mb-3">{t('forum')}</h2>
      {err && <div className="alert alert-danger py-2">{err}</div>}
      <form className="card card-body mb-4" onSubmit={post}>
        <h6>Start a discussion</h6>
        <input className="form-control mb-2" placeholder="Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <textarea className="form-control mb-2" rows={3} placeholder="Share a tip or ask the community..." required value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
        <div><button className="btn btn-primary">Post</button></div>
      </form>

      {!posts.length && <p className="text-muted">{t('noData')}</p>}
      {posts.map((p) => (
        <div className="card mb-3" key={p._id}><div className="card-body">
          <div className="d-flex justify-content-between">
            <h6 className="mb-0">{p.title}</h6>
            {(user.role === 'admin' || p.author === user._id) && <button className="btn btn-sm btn-outline-danger" onClick={() => del(p._id)}>{t('delete')}</button>}
          </div>
          <div className="small text-muted mb-2">{p.authorName} · {fmtDate(p.createdAt)}</div>
          <p>{p.body}</p>
          {p.comments.map((c, i) => (
            <div key={i} className="thread"><span className="small fw-semibold">{c.authorName}</span> <span className="small text-muted">· {fmtDate(c.at)}</span><div>{c.text}</div></div>
          ))}
          <div className="d-flex gap-2 mt-3">
            <input className="form-control form-control-sm" placeholder="Write a comment..." value={comment[p._id] || ''} onChange={(e) => setComment({ ...comment, [p._id]: e.target.value })} />
            <button className="btn btn-sm btn-primary" disabled={!(comment[p._id] || '').trim()} onClick={() => addComment(p._id)}>Comment</button>
          </div>
        </div></div>
      ))}
    </div>
  );
}
