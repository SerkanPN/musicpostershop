import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';

import ClaimOrder from './pages/ClaimOrder';
import TrendPostersSelection from './pages/TrendPostersSelection';
import SoundwavePosterPage from './pages/SoundwavePosterPage';
import AdminPortal from './pages/AdminPortal';
import { useStore } from './store/useStore';

export default function App() {
  const { checkUser } = useStore();
  const [isAdminSubdomain, setIsAdminSubdomain] = useState<boolean>(false);

  useEffect(() => {
    try {
      checkUser();
    } catch (error) {
      console.error(error);
    }

    const hostname = window.location.hostname;
    if (hostname === 'serkan1881.musicposter.shop') {
      setIsAdminSubdomain(true);
    }
  }, [checkUser]);

  return (
    <BrowserRouter>
      <Routes>
        {isAdminSubdomain ? (
          <Route path="*" element={<AdminPortal />} />
        ) : (
          <Route path="/" element={<Layout />}>
            <Route index element={<ClaimOrder />} />
            <Route path="trend-posters" element={<TrendPostersSelection />} />
            <Route path="trend-posters/soundwave" element={<SoundwavePosterPage navigate={(path) => window.location.href = path} />} />
            <Route path="trend-posters/soundwave/:token" element={<SoundwavePosterPage navigate={(path) => window.location.href = path} />} />
            <Route path="admin-portal" element={<AdminPortal />} />
            <Route 
              path="*" 
              element={
                <div className="container mx-auto px-4 py-24 text-center">
                  <h1 className="text-4xl font-black italic tracking-tighter uppercase text-zinc-600">
                    Resource Not Found
                  </h1>
                </div>
              } 
            />
          </Route>
        )}
      </Routes>
    </BrowserRouter>
  );
}
