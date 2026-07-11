import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import TrendPostersSelection from './pages/TrendPostersSelection';
import SoundwavePosterPage from './pages/SoundwavePosterPage';
import ClaimOrder from './pages/ClaimOrder';
import { useStore } from './store/useStore';
import AdminPortal from './pages/AdminPortal';

export default function App() {
  const { checkUser } = useStore();

  useEffect(() => {
    try {
      checkUser();
    } catch (error) {
      console.error(error);
    }
  }, [checkUser]);

  const hostname = window.location.hostname;
  const isAdminDomain = hostname.startsWith('serkan1881.');

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          {isAdminDomain ? (
            <>
              <Route index element={<AdminPortal />} />
              <Route path="admin-portal" element={<AdminPortal />} />
              <Route path="admin-portal/:token" element={<AdminPortal />} />
              <Route path="trend-posters" element={<TrendPostersSelection />} />
              <Route path="trend-posters/soundwave" element={<SoundwavePosterPage navigate={(path) => window.location.href = path} />} />
              <Route path="design/:token" element={<SoundwavePosterPage navigate={(path) => window.location.href = path} />} />
              <Route path="claim" element={<ClaimOrder />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          ) : (
            <>
              <Route index element={<Navigate to="/claim" replace />} />
              <Route path="claim" element={<ClaimOrder />} />
              <Route path="design/:token" element={<SoundwavePosterPage navigate={(path) => window.location.href = path} />} />
              <Route path="trend-posters" element={<TrendPostersSelection />} />
              <Route path="trend-posters/soundwave" element={<SoundwavePosterPage navigate={(path) => window.location.href = path} />} />
              <Route path="*" element={<Navigate to="/claim" replace />} />
            </>
          )}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
