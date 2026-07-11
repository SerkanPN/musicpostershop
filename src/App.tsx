import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TrendPostersSelection from './pages/TrendPostersSelection';
import SoundwavePosterPage from './pages/SoundwavePosterPage';
import ClaimOrder from './pages/ClaimOrder';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TrendPostersSelection />} />
        <Route path="/trend-posters" element={<TrendPostersSelection />} />
        <Route path="/trend-posters/soundwave" element={<SoundwavePosterPage navigate={(path) => window.location.href = path} />} />
        <Route path="/claim" element={<ClaimOrder />} />
        
        {/* Hata Sayfası */}
        <Route 
          path="*" 
          element={
            <div className="flex items-center justify-center min-h-screen bg-zinc-950 text-white">
              <h1 className="text-4xl font-black uppercase">404 - Not Found</h1>
            </div>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}
