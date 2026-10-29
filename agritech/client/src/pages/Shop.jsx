import { useEffect, useState } from 'react';
import api, { errMsg, fmtDate } from '../api';
import { useLang } from '../i18n';

const statusColor = { Pending: 'warning', Approved: 'info', Shipped: 'primary', Delivered: 'success', Cancelled: 'secondary' };
export const inr = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

export default function Shop() {
  const { t } = useLang();
  const [items, setItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState({});
  const [address, setAddress] = useState('');
  const [cat, setCat] = useState('All');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const load = async () => {
    try {
      const [a, b] = await Promise.all([api.get('/resources'), api.get('/orders')]);
      setItems(a.data);
      setOrders(b.data);
    } catch (e) {
      setErr(errMsg(e));
    }
  };
  useEffect(() => { load(); }, []);

  const setQty = (id, q, max) => setCart((c) => {
    const n = { ...c };
    if (q <= 0) delete n[id];
    else n[id] = Math.min(q, max);
    return n;
  });
  const lines = items.filter((i) => cart[i._id]).map((i) => ({ ...i, qty: cart[i._id] }));
  const total = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const cats = ['All', ...new Set(items.map((i) => i.category))];

  const place = async () => {
    setErr('');
    setMsg('');
    try {
      await api.post('/orders', { address, items: lines.map((l) => ({ resource: l._id, qty: l.qty })) });
      setCart({});
      setMsg('Order placed successfully!');
      load();
    } catch (e) {
      setErr(errMsg(e));
    }
  };

  const cancel = async (id) => {
    try {
      await api.patch(`/orders/${id}/status`, { status: 'Cancelled' });
      load();
    } catch (e) {
      setErr(errMsg(e));
    }
  };

  return (
    <div className="container py-4">
      <h2 className="page-title mb-3">{t('shop')}</h2>
      {err && <div className="alert alert-danger py-2">{err}</div>}
      {msg && <div className="alert alert-success py-2">{msg}</div>}

      <div className="mb-3 d-flex gap-2 flex-wrap">
        {cats.map((c) => <button key={c} className={`btn btn-sm ${cat === c ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setCat(c)}>{c}</button>)}
      </div>

      <div className="row g-3 mb-4">
        <div className="col-12 col-lg-8">
          <div className="row g-3">
            {items.filter((i) => cat === 'All' || i.category === cat).map((i) => (
              <div className="col-12 col-md-6" key={i._id}>
                <div className="card h-100"><div className="card-body">
                  <span className="badge bg-success-subtle text-success-emphasis mb-1">{i.category}</span>
                  <h6 className="mb-1">{i.name}</h6>
                  <div className="small text-muted mb-2">{i.description}</div>
                  <div className="d-flex justify-content-between align-items-center">
                    <div><b>{inr(i.price)}</b> <span className="small text-muted">/ {i.unit}</span><div className="small text-muted">{i.stock} in stock</div></div>
                    {i.stock > 0 ? (
                      <div className="btn-group btn-group-sm">
                        <button className="btn btn-outline-secondary" onClick={() => setQty(i._id, (cart[i._id] || 0) - 1, i.stock)}>−</button>
                        <span className="btn btn-light disabled">{cart[i._id] || 0}</span>
                        <button className="btn btn-primary" onClick={() => setQty(i._id, (cart[i._id] || 0) + 1, i.stock)}>+</button>
                      </div>
                    ) : <span className="badge bg-secondary">Out of stock</span>}
                  </div>
                </div></div>
              </div>
            ))}
            {!items.length && <p className="text-muted">No products available.</p>}
          </div>
        </div>
        <div className="col-12 col-lg-4">
          <div className="card sticky-top" style={{ top: 70 }}><div className="card-body">
            <h6>Your cart</h6>
            {!lines.length && <p className="text-muted small">Cart is empty.</p>}
            {lines.map((l) => <div key={l._id} className="d-flex justify-content-between small mb-1"><span>{l.name} × {l.qty}</span><span>{inr(l.price * l.qty)}</span></div>)}
            <hr />
            <div className="d-flex justify-content-between fw-bold mb-2"><span>Total</span><span>{inr(total)}</span></div>
            <textarea className="form-control mb-2" rows={2} placeholder="Delivery address" value={address} onChange={(e) => setAddress(e.target.value)} />
            <button className="btn btn-primary w-100" disabled={!lines.length || !address.trim()} onClick={place}>Place order</button>
          </div></div>
        </div>
      </div>

      <h5 className="page-title">My orders</h5>
      <div className="card"><div className="table-responsive">
        <table className="table align-middle mb-0">
          <thead className="table-light"><tr><th>Date</th><th>Items</th><th>Total</th><th>Status</th><th /></tr></thead>
          <tbody>
            {!orders.length && <tr><td colSpan={5} className="text-center text-muted py-3">{t('noData')}</td></tr>}
            {orders.map((o) => (
              <tr key={o._id}>
                <td>{fmtDate(o.createdAt)}</td>
                <td className="small">{o.items.map((i) => `${i.name} × ${i.qty}`).join(', ')}</td>
                <td>{inr(o.total)}</td>
                <td><span className={`badge bg-${statusColor[o.status]}`}>{o.status}</span></td>
                <td>{o.status === 'Pending' && <button className="btn btn-sm btn-outline-danger" onClick={() => cancel(o._id)}>Cancel</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div></div>
    </div>
  );
}
