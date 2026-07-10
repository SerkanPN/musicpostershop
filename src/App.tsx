import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Layout & Components
import { Layout } from './components/Layout';

// Sayfalar
import { Home } from './pages/Home';
import TrendPostersSelection from './pages/TrendPostersSelection';
import SoundwavePosterPage from './pages/SoundwavePosterPage';
import ClaimOrder from './pages/ClaimOrder';

// Store (Giriş için)
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
          <Route index element={<Home />} />
          <Route path="trend-posters" element={<TrendPostersSelection />} />
          <Route path="trend-posters/soundwave" element={<SoundwavePosterPage navigate={(path) => window.location.href = path} />} />
          <Route path="claim" element={<ClaimOrder />} />
          
          <Route 
            path="*" 
            element={
              <div className="container mx-auto px-4 py-24 text-center">
                <h1 className="text-4xl font-black text-white">404 - NOT FOUND</h1>
              </div>
            } 
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
