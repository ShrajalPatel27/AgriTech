import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Navbar from './components/Navbar';

// Code splitting: every page is loaded on demand
const lz = (loader, name) => lazy(() => loader().then((m) => ({ default: m[name] })));
const Login = lz(() => import('./pages/Auth'), 'Login');
const Register = lz(() => import('./pages/Auth'), 'Register');
const Dashboard = lz(() => import('./pages/Dashboard'), 'default');
const Farms = lz(() => import('./pages/Simple'), 'Farms');
const Crops = lz(() => import('./pages/Simple'), 'Crops');
const Soil = lz(() => import('./pages/Simple'), 'Soil');
const Alerts = lz(() => import('./pages/Simple'), 'Alerts');
const Weather = lz(() => import('./pages/Weather'), 'default');
const Shop = lz(() => import('./pages/Shop'), 'default');
const Consult = lz(() => import('./pages/Consult'), 'default');
const Forum = lz(() => import('./pages/Forum'), 'default');
const Admin = lz(() => import('./pages/Admin'), 'default');

function Spinner() {
  return (
    <div className="text-center py-5">
      <div className="spinner-border text-primary" role="status" />
    </div>
  );
}

function Guard({ admin }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (admin && user.role !== 'admin') return <Navigate to="/" replace />;
  return (
    <>
      <Navbar />
      <Suspense fallback={<Spinner />}>
        <Outlet />
      </Suspense>
    </>
  );
}

export default function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<Guard />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/farms" element={<Farms />} />
          <Route path="/crops" element={<Crops />} />
          <Route path="/soil" element={<Soil />} />
          <Route path="/weather" element={<Weather />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/consult" element={<Consult />} />
          <Route path="/forum" element={<Forum />} />
        </Route>
        <Route element={<Guard admin />}>
          <Route path="/admin" element={<Admin />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
