import { useEffect, useState } from 'react';
import api, { errMsg } from '../api';
import { useLang } from '../i18n';

const opt = (o) => (typeof o === 'string' ? { value: o, label: o } : o);

/**
 * Generic CRUD table + form.
 * fields:  [{ name, label, type: text|number|date|select|textarea, required, options, ref: '/farms', refLabel: 'name', step }]
 * columns: [{ key, label, render?(row) }]
 */
export default function CrudPage({ title, endpoint, fields, columns, canWrite = true, hint }) {
  const { t } = useLang();
  const [rows, setRows] = useState([]);
  const [refs, setRefs] = useState({});
  const [form, setForm] = useState(null);
  const [editId, setEditId] = useState(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const { data } = await api.get(endpoint);
      setRows(data);
    } catch (e) {
      setErr(errMsg(e));
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    fields.filter((f) => f.ref).forEach(async (f) => {
      try {
        const { data } = await api.get(f.ref);
        setRefs((r) => ({ ...r, [f.name]: data }));
      } catch (e) { /* ignore */ }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint]);

  const blank = () => Object.fromEntries(fields.map((f) => [f.name, f.type === 'select' && !f.ref && !f.allowEmpty ? opt(f.options[0]).value : '']));

  const startEdit = (row) => {
    const f = {};
    fields.forEach((fd) => {
      let v = row[fd.name];
      if (v && typeof v === 'object' && v._id) v = v._id;
      if (fd.type === 'date' && v) v = String(v).slice(0, 10);
      f[fd.name] = v ?? '';
    });
    setForm(f);
    setEditId(row._id);
    setErr('');
  };

  const submit = async (e) => {
    e.preventDefault();
    for (const f of fields) {
      if (f.required && (form[f.name] === '' || form[f.name] == null)) return setErr(`${f.label} is required`);
    }
    const body = {};
    fields.forEach((f) => {
      const v = form[f.name];
      if (v === '') {
        if (editId && f.type !== 'number' && f.type !== 'date') body[f.name] = '';
        return;
      }
      body[f.name] = f.type === 'number' ? Number(v) : v;
    });
    try {
      if (editId) await api.put(`${endpoint}/${editId}`, body);
      else await api.post(endpoint, body);
      setForm(null);
      setEditId(null);
      setErr('');
      load();
    } catch (e2) {
      setErr(errMsg(e2));
    }
  };

  const remove = async (row) => {
    if (!window.confirm('Delete this record?')) return;
    try {
      await api.delete(`${endpoint}/${row._id}`);
      load();
    } catch (e) {
      setErr(errMsg(e));
    }
  };

  const input = (f) => {
    const common = { className: 'form-control', value: form[f.name] ?? '', onChange: (e) => setForm({ ...form, [f.name]: e.target.value }), required: !!f.required };
    if (f.type === 'select') {
      const options = f.ref ? (refs[f.name] || []).map((r) => ({ value: r._id, label: r[f.refLabel || 'name'] })) : f.options.map(opt);
      return (
        <select {...common} className="form-select">
          {(f.ref || f.allowEmpty) && <option value="">-- select --</option>}
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      );
    }
    if (f.type === 'textarea') return <textarea {...common} rows={2} />;
    return <input {...common} type={f.type || 'text'} step={f.type === 'number' ? f.step || 'any' : undefined} min={f.min} max={f.max} />;
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h2 className="page-title mb-0">{title}</h2>
        {canWrite && !form && <button className="btn btn-primary" onClick={() => { setForm(blank()); setEditId(null); setErr(''); }}>+ {t('add')}</button>}
      </div>
      {hint && <p className="text-muted">{hint}</p>}
      {err && <div className="alert alert-danger py-2">{err}</div>}

      {form && (
        <form className="card card-body mb-4" onSubmit={submit}>
          <div className="row g-3">
            {fields.map((f) => (
              <div className={f.type === 'textarea' ? 'col-12' : 'col-12 col-md-4'} key={f.name}>
                <label className="form-label small fw-semibold">{f.label}{f.required && ' *'}</label>
                {input(f)}
              </div>
            ))}
          </div>
          <div className="mt-3 d-flex gap-2">
            <button className="btn btn-primary" type="submit">{t('save')}</button>
            <button className="btn btn-outline-secondary" type="button" onClick={() => { setForm(null); setEditId(null); setErr(''); }}>{t('cancel')}</button>
          </div>
        </form>
      )}

      <div className="card">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                {columns.map((c) => <th key={c.key}>{c.label}</th>)}
                {canWrite && <th>{t('actions')}</th>}
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={columns.length + 1} className="text-center py-4">{t('loading')}</td></tr>}
              {!loading && !rows.length && <tr><td colSpan={columns.length + 1} className="text-center text-muted py-4">{t('noData')}</td></tr>}
              {rows.map((r) => (
                <tr key={r._id}>
                  {columns.map((c) => <td key={c.key}>{c.render ? c.render(r) : r[c.key] ?? '-'}</td>)}
                  {canWrite && (
                    <td className="text-nowrap">
                      <button className="btn btn-sm btn-outline-primary me-1" onClick={() => startEdit(r)}>{t('edit')}</button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => remove(r)}>{t('delete')}</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
