import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { useStore } from './store/useStore';

// Sayfalar
import HomePage from './pages/HomePage';
import ClaimOrder from './pages/ClaimOrder';
import AdminPortal from './pages/AdminPortal';
import TrendPostersSelection from './pages/TrendPostersSelection';

// 14 Trend Poster Editörleri (Yeni Zengin AI Motorları)
import SoundwaveEditor from './pages/editors/SoundwaveEditor';
import ReceiptEditor from './pages/editors/ReceiptEditor';
import DictionaryEditor from './pages/editors/DictionaryEditor';
import CoordinatesEditor from './pages/editors/CoordinatesEditor';
import StarmapEditor from './pages/editors/StarmapEditor';
import CassetteEditor from './pages/editors/CassetteEditor';
import TypewriterEditor from './pages/editors/TypewriterEditor';
import PolaroidEditor from './pages/editors/PolaroidEditor';
import PatentEditor from './pages/editors/PatentEditor';
import PantoneEditor from './pages/editors/PantoneEditor';
import NewspaperEditor from './pages/editors/NewspaperEditor';
import HeartEditor from './pages/editors/HeartEditor';
import AirbnbEditor from './pages/editors/AirbnbEditor';
import ToddlerEditor from './pages/editors/ToddlerEditor';

// Tokenli Müşteri Sipariş İnceleme Editörleri (Supabase & 300 DPI Export)
import SoundwavePosterPage from './pages/SoundwavePosterPage';
import ReceiptPosterPage from './pages/ReceiptPosterPage';
import TypographyPosterPage from './pages/TypographyPosterPage';
import CoordinatesPosterPage from './pages/CoordinatesPosterPage';
import StarMapPosterPage from './pages/StarMapPosterPage';
import CassettePosterPage from './pages/CassettePosterPage';
import TypewriterPosterPage from './pages/TypewriterPosterPage';
import PolaroidPosterPage from './pages/PolaroidPosterPage';
import PatentPosterPage from './pages/PatentPosterPage';
import PantonePosterPage from './pages/PantonePosterPage';
import NewspaperPosterPage from './pages/NewspaperPosterPage';
import HeartPosterPage from './pages/HeartPosterPage';
import AirbnbPosterPage from './pages/AirbnbPosterPage';
import ToddlerPosterPage from './pages/ToddlerPosterPage';

export default function App() {
  const { checkUser } = useStore();

  useEffect(() => {
    try {
      checkUser();
    } catch (error) {
      console.error(error);
    }
  }, [checkUser]);

  const handleNavigate = (path: string) => {
    window.location.href = path;
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Ana Sayfa: 14 Kategori ve 180+ Zengin Preset Vitrini */}
          <Route index element={<HomePage />} />
          <Route path="trend-posters" element={<HomePage />} />
          <Route path="gallery" element={<HomePage />} />
          <Route path="selection" element={<TrendPostersSelection />} />

          {/* 14 Editör Demo Rotaları (/trend-posters/ ve /editor/) */}
          <Route path="trend-posters/soundwave" element={<SoundwaveEditor />} />
          <Route path="trend-posters/receipt" element={<ReceiptEditor />} />
          <Route path="trend-posters/typography" element={<DictionaryEditor />} />
          <Route path="trend-posters/coordinates" element={<CoordinatesEditor />} />
          <Route path="trend-posters/starmap" element={<StarmapEditor />} />
          <Route path="trend-posters/cassette" element={<CassetteEditor />} />
          <Route path="trend-posters/typewriter" element={<TypewriterEditor />} />
          <Route path="trend-posters/polaroid" element={<PolaroidEditor />} />
          <Route path="trend-posters/patent" element={<PatentEditor />} />
          <Route path="trend-posters/pantone" element={<PantoneEditor />} />
          <Route path="trend-posters/newspaper" element={<NewspaperEditor />} />
          <Route path="trend-posters/heart" element={<HeartEditor />} />
          <Route path="trend-posters/airbnb" element={<AirbnbEditor />} />
          <Route path="trend-posters/toddler" element={<ToddlerEditor />} />

          <Route path="editor/soundwave" element={<SoundwaveEditor />} />
          <Route path="editor/receipt" element={<ReceiptEditor />} />
          <Route path="editor/typography" element={<DictionaryEditor />} />
          <Route path="editor/coordinates" element={<CoordinatesEditor />} />
          <Route path="editor/starmap" element={<StarmapEditor />} />
          <Route path="editor/cassette" element={<CassetteEditor />} />
          <Route path="editor/typewriter" element={<TypewriterEditor />} />
          <Route path="editor/polaroid" element={<PolaroidEditor />} />
          <Route path="editor/patent" element={<PatentEditor />} />
          <Route path="editor/pantone" element={<PantoneEditor />} />
          <Route path="editor/newspaper" element={<NewspaperEditor />} />
          <Route path="editor/heart" element={<HeartEditor />} />
          <Route path="editor/airbnb" element={<AirbnbEditor />} />
          <Route path="editor/toddler" element={<ToddlerEditor />} />

          {/* Müşteri Etsy Sipariş İnceleme Editörleri (Tokenli) */}
          <Route path="design/soundwave/:token" element={<SoundwavePosterPage navigate={handleNavigate} />} />
          <Route path="design/receipt/:token" element={<ReceiptPosterPage navigate={handleNavigate} />} />
          <Route path="design/typography/:token" element={<TypographyPosterPage navigate={handleNavigate} />} />
          <Route path="design/coordinates/:token" element={<CoordinatesPosterPage navigate={handleNavigate} />} />
          <Route path="design/starmap/:token" element={<StarMapPosterPage navigate={handleNavigate} />} />
          <Route path="design/cassette/:token" element={<CassettePosterPage navigate={handleNavigate} />} />
          <Route path="design/typewriter/:token" element={<TypewriterPosterPage navigate={handleNavigate} />} />
          <Route path="design/polaroid/:token" element={<PolaroidPosterPage navigate={handleNavigate} />} />
          <Route path="design/patent/:token" element={<PatentPosterPage navigate={handleNavigate} />} />
          <Route path="design/pantone/:token" element={<PantonePosterPage navigate={handleNavigate} />} />
          <Route path="design/newspaper/:token" element={<NewspaperPosterPage navigate={handleNavigate} />} />
          <Route path="design/heart/:token" element={<HeartPosterPage navigate={handleNavigate} />} />
          <Route path="design/airbnb/:token" element={<AirbnbPosterPage navigate={handleNavigate} />} />
          <Route path="design/toddler/:token" element={<ToddlerPosterPage navigate={handleNavigate} />} />

          {/* Portal ve Claim */}
          <Route path="claim" element={<ClaimOrder />} />
          <Route path="admin-portal" element={<AdminPortal />} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
