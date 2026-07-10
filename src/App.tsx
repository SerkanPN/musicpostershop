import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import TrendPostersSelection from './pages/TrendPostersSelection';
import SoundwavePosterPage from './pages/SoundwavePosterPage';
import ClaimOrder from './pages/ClaimOrder';
import { useStore } from './store/useStore';

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
          
          {/* ANA SAYFA VİTRİN */}
          <Route index element={<TrendPostersSelection />} />
          <Route path="trend-posters" element={<Navigate to="/" replace />} />

          {/* EDİTÖRLER */}
          <Route path="trend-posters/soundwave" element={<SoundwavePosterPage navigate={(path) => window.location.href = path} />} />
          
          {/* GİRİŞ VE DİĞER SAYFALAR */}
          <Route path="claim" element={<ClaimOrder />} />
          
          {/* HATA SAYFASI */}
          <Route 
            path="*" 
            element={
              <div className="flex items-center justify-center min-h-screen bg-zinc-950">
                <div className="text-center">
                  <h1 className="text-4xl font-black text-white uppercase tracking-widest">404 - Not Found</h1>
                  <p className="text-zinc-500 mt-4 font-medium text-sm">Please return to the home page.</p>
                </div>
              </div>
            } 
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
