import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import TrendPostersSelection from './pages/TrendPostersSelection';
import SoundwavePosterPage from './pages/SoundwavePosterPage';
import ClaimOrder from './pages/ClaimOrder';
import { useStore } from './store/useStore';

interface AdminRouteProps {
  children: React.ReactNode;
}

function AdminRoute({ children }: AdminRouteProps) {
  const isAuth = localStorage.getItem('admin_auth') === 'true';
  const params = new URLSearchParams(window.location.search);
  
  if (params.get('admin') === 'true') {
    localStorage.setItem('admin_auth', 'true');
    return <>{children}</>;
  }
  
  if (!isAuth) {
    return <Navigate to="/claim" replace />;
  }
  
  return <>{children}</>;
}

export default function App() {
  const { checkUser } = useStore();

  useEffect(() => {
    try {
      checkUser();
    } catch (error) {
      console.error(error);
    }
  }, [checkUser]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<AdminRoute><TrendPostersSelection /></AdminRoute>} />
          <Route path="trend-posters" element={<AdminRoute><TrendPostersSelection /></AdminRoute>} />
          <Route path="design/:token" element={<SoundwavePosterPage navigate={(path) => window.location.href = path} />} />
          <Route path="claim" element={<ClaimOrder />} />
          <Route 
            path="*" 
            element={
              <div className="flex items-center justify-center min-h-screen bg-zinc-950 text-white">
                <h1 className="text-4xl font-black uppercase">404 - Not Found</h1>
              </div>
            } 
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
