import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
          {/* ARTIK ANA SAYFAMIZ TREND POSTER SEÇİM EKRANI */}
          <Route index element={<TrendPostersSelection />} />
          
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
