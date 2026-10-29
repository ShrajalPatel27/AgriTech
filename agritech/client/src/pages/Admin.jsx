import { useEffect, useState } from 'react';
import api, { errMsg, fmtDate } from '../api';
import { useAuth } from '../AuthContext';
import CrudPage from '../components/CrudPage';
import { alertFields, alertColumns } from './Simple';
import { inr } from './Shop';

function Overview() {
  const [s, setS] = useState(null);
  useEffect(() => { api.get('/admin/stats').then((r) => setS(r.data)); }, []);
  if (!s) return <div className="spinner-border text-primary" />;
  const items = [['Users', s.users], ['Farms', s.farms], ['Crops', s.crops], ['Orders', s.orders], ['Open questions', s.openQuestions], ['Forum posts', s.posts], ['Revenue', inr(s.revenue)]];
  return (
    <div className="row g-3">
      {items.map(([k, v]) => (
        <div className="col-6 col-md-3" key={k}><div className="card stat-card"><div className="card-body text-center"><div className="display-6">{v}</div><div className="text-muted small">{k}</div></div></div></div>
      ))}
    </div>
  );
}

function Users() {
  const { user: me } = useAuth();
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState('');
  const load = () => api.get('/admin/users').then((r) => setRows(r.data)).catch((e) => setErr(errMsg(e)));
  useEffect(() => { load(); }, []);
  const setRole = async (id, role) => { await api.patch(`/admin/users/${id}/role`, { role }).catch((e) => setErr(errMsg(e))); load(); };
  const del = async (u) => {
    if (!window.confirm(`Delete ${u.name} and all their data?`)) return;
    await api.delete(`/admin/users/${u._id}`).catch((e) => setErr(errMsg(e)));
    load();
  };
  return (
    <>
      {err && <div className="alert alert-danger py-2">{err}</div>}
      <div className="card"><div className="table-responsive"><table className="table align-middle mb-0">
        <thead className="table-light"><tr><th>Name</th><th>Email</th><th>Location</th><th>Joined</th><th>Role</th><th /></tr></thead>
        <tbody>{rows.map((u) => (
          <tr key={u._id}>
            <td>{u.name}</td><td>{u.email}</td><td>{u.location || '-'}</td><td>{fmtDate(u.createdAt)}</td>
            <td><select className="form-select form-select-sm" value={u.role} disabled={u._id === me._id} onChange={(e) => setRole(u._id, e.target.value)}><option>farmer</option><option>admin</option></select></td>
            <td>{u._id !== me._id && <button className="btn btn-sm btn-outline-danger" onClick={() => del(u)}>Delete</button>}</td>
          </tr>
        ))}</tbody>
      </table></div></div>
    </>
  );
}

function Orders() {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState('');
  const load = () => api.get('/orders').then((r) => setRows(r.data)).catch((e) => setErr(errMsg(e)));
  useEffect(() => { load(); }, []);
  const setStatus = async (id, status) => { await api.patch(`/orders/${id}/status`, { status }).catch((e) => setErr(errMsg(e))); load(); };
  return (
    <>
      {err && <div className="alert alert-danger py-2">{err}</div>}
      <div className="card"><div className="table-responsive"><table className="table align-middle mb-0">
        <thead className="table-light"><tr><th>Date</th><th>Farmer</th><th>Items</th><th>Address</th><th>Total</th><th>Status</th></tr></thead>
        <tbody>
          {!rows.length && <tr><td colSpan={6} className="text-center text-muted py-3">No orders yet</td></tr>}
          {rows.map((o) => (
            <tr key={o._id}>
              <td>{fmtDate(o.createdAt)}</td><td>{o.user?.name}<div className="small text-muted">{o.user?.phone}</div></td>
              <td className="small">{o.items.map((i) => `${i.name} × ${i.qty}`).join(', ')}</td><td className="small">{o.address}</td><td>{inr(o.total)}</td>
              <td><select className="form-select form-select-sm" value={o.status} onChange={(e) => setStatus(o._id, e.target.value)}>{['Pending', 'Approved', 'Shipped', 'Delivered', 'Cancelled'].map((s) => <option key={s}>{s}</option>)}</select></td>
            </tr>
          ))}
        </tbody>
      </table></div></div>
    </>
  );
}

const tabs = ['Overview', 'Users', 'Orders', 'Resources', 'Pest alerts'];

export default function Admin() {
  const [tab, setTab] = useState('Overview');
  return (
    <div className="container py-4">
      <h2 className="page-title mb-3">Admin dashboard</h2>
      <ul className="nav nav-pills mb-3 gap-1 flex-wrap">
        {tabs.map((x) => <li className="nav-item" key={x}><button className={`nav-link ${tab === x ? 'active bg-success' : 'text-success'}`} onClick={() => setTab(x)}>{x}</button></li>)}
      </ul>
      {tab === 'Overview' && <Overview />}
      {tab === 'Users' && <Users />}
      {tab === 'Orders' && <Orders />}
      {tab === 'Resources' && (
        <div className="mx-n3">
          <CrudPage
            title="Resources catalogue"
            endpoint="/resources"
            fields={[
              { name: 'name', label: 'Name', required: true },
              { name: 'category', label: 'Category', type: 'select', options: ['Seeds', 'Fertilizer', 'Pesticide', 'Tools', 'Equipment'] },
              { name: 'price', label: 'Price (₹)', type: 'number', required: true, min: 0 },
              { name: 'unit', label: 'Unit' },
              { name: 'stock', label: 'Stock', type: 'number', min: 0 },
              { name: 'description', label: 'Description', type: 'textarea' },
            ]}
            columns={[
              { key: 'name', label: 'Name' }, { key: 'category', label: 'Category' },
              { key: 'price', label: 'Price', render: (r) => inr(r.price) }, { key: 'unit', label: 'Unit' }, { key: 'stock', label: 'Stock' },
            ]}
          />
        </div>
      )}
      {tab === 'Pest alerts' && <div className="mx-n3"><CrudPage title="Pest alerts" endpoint="/alerts" fields={alertFields} columns={alertColumns} /></div>}
    </div>
  );
}
