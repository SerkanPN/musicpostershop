import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { useStore } from './store/useStore';

// Sayfalar
import ClaimOrder from './pages/ClaimOrder';
import AdminPortal from './pages/AdminPortal';
import TrendPostersSelection from './pages/TrendPostersSelection';

// 14 Trend Poster Editörleri (Orijinal Derin Sistem)
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
          {/* Ana Sayfa Vitrini: Tüm 14 Trend Poster ve 180+ Preset Seçimi */}
          <Route index element={<TrendPostersSelection />} />
          <Route path="trend-posters" element={<TrendPostersSelection />} />

          {/* 14 Canlı Trend Poster Editörü (Doğrudan & Parametreli Erişim) */}
          <Route path="trend-posters/soundwave" element={<SoundwavePosterPage navigate={handleNavigate} />} />
          <Route path="soundwave" element={<SoundwavePosterPage navigate={handleNavigate} />} />
          <Route path="soundwave-lyrics-art" element={<SoundwavePosterPage navigate={handleNavigate} />} />

          <Route path="trend-posters/receipt" element={<ReceiptPosterPage navigate={handleNavigate} />} />
          <Route path="receipt" element={<ReceiptPosterPage navigate={handleNavigate} />} />
          <Route path="music-posters" element={<ReceiptPosterPage navigate={handleNavigate} />} />

          <Route path="trend-posters/typography" element={<TypographyPosterPage navigate={handleNavigate} />} />
          <Route path="typography" element={<TypographyPosterPage navigate={handleNavigate} />} />

          <Route path="trend-posters/coordinates" element={<CoordinatesPosterPage navigate={handleNavigate} />} />
          <Route path="coordinates" element={<CoordinatesPosterPage navigate={handleNavigate} />} />
          <Route path="custom-map-print" element={<CoordinatesPosterPage navigate={handleNavigate} />} />

          <Route path="trend-posters/starmap" element={<StarMapPosterPage navigate={handleNavigate} />} />
          <Route path="starmap" element={<StarMapPosterPage navigate={handleNavigate} />} />

          <Route path="trend-posters/cassette" element={<CassettePosterPage navigate={handleNavigate} />} />
          <Route path="cassette" element={<CassettePosterPage navigate={handleNavigate} />} />

          <Route path="trend-posters/typewriter" element={<TypewriterPosterPage navigate={handleNavigate} />} />
          <Route path="typewriter" element={<TypewriterPosterPage navigate={handleNavigate} />} />

          <Route path="trend-posters/polaroid" element={<PolaroidPosterPage navigate={handleNavigate} />} />
          <Route path="polaroid" element={<PolaroidPosterPage navigate={handleNavigate} />} />

          <Route path="trend-posters/patent" element={<PatentPosterPage navigate={handleNavigate} />} />
          <Route path="patent" element={<PatentPosterPage navigate={handleNavigate} />} />

          <Route path="trend-posters/pantone" element={<PantonePosterPage navigate={handleNavigate} />} />
          <Route path="pantone" element={<PantonePosterPage navigate={handleNavigate} />} />

          <Route path="trend-posters/newspaper" element={<NewspaperPosterPage navigate={handleNavigate} />} />
          <Route path="newspaper" element={<NewspaperPosterPage navigate={handleNavigate} />} />

          <Route path="trend-posters/heart" element={<HeartPosterPage navigate={handleNavigate} />} />
          <Route path="heart" element={<HeartPosterPage navigate={handleNavigate} />} />

          <Route path="trend-posters/airbnb" element={<AirbnbPosterPage navigate={handleNavigate} />} />
          <Route path="airbnb" element={<AirbnbPosterPage navigate={handleNavigate} />} />

          <Route path="trend-posters/toddler" element={<ToddlerPosterPage navigate={handleNavigate} />} />
          <Route path="toddler" element={<ToddlerPosterPage navigate={handleNavigate} />} />

          {/* Müşteri Sipariş İnceleme Editörleri (Token ile) */}
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

          {/* Sipariş Claim & Admin Portalları */}
          <Route path="claim" element={<ClaimOrder />} />
          <Route path="admin-portal" element={<AdminPortal />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
