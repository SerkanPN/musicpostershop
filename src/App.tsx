import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { useStore } from './store/useStore';

// Sayfalar
import ClaimOrder from './pages/ClaimOrder';
import AdminPortal from './pages/AdminPortal';
import TrendPostersSelection from './pages/TrendPostersSelection';

// 14 Trend Poster Editörleri
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

  const hostname = window.location.hostname;
  const isAdminDomain = hostname.startsWith('serkan1881.');

  // Müşterinin "Back" veya işlem iptalinde nereye gideceğini belirleyen helper
  const handleNavigate = (path: string) => {
    window.location.href = path;
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          
          {/* ========= ADMİN DOMAİNİ YÖNLENDİRMELERİ ========= */}
          {isAdminDomain ? (
            <>
              <Route index element={<AdminPortal />} />
              <Route path="admin-portal" element={<AdminPortal />} />
              
              {/* Admin Seçim Sayfası */}
              <Route path="trend-posters" element={<TrendPostersSelection />} />
              
              {/* Admin Demo Editörleri (Tokensiz Doğrudan Test İçin) */}
              <Route path="trend-posters/soundwave" element={<SoundwavePosterPage navigate={handleNavigate} />} />
              <Route path="trend-posters/receipt" element={<ReceiptPosterPage navigate={handleNavigate} />} />
              <Route path="trend-posters/typography" element={<TypographyPosterPage navigate={handleNavigate} />} />
              <Route path="trend-posters/coordinates" element={<CoordinatesPosterPage navigate={handleNavigate} />} />
              <Route path="trend-posters/starmap" element={<StarMapPosterPage navigate={handleNavigate} />} />
              <Route path="trend-posters/cassette" element={<CassettePosterPage navigate={handleNavigate} />} />
              <Route path="trend-posters/typewriter" element={<TypewriterPosterPage navigate={handleNavigate} />} />
              <Route path="trend-posters/polaroid" element={<PolaroidPosterPage navigate={handleNavigate} />} />
              <Route path="trend-posters/patent" element={<PatentPosterPage navigate={handleNavigate} />} />
              <Route path="trend-posters/pantone" element={<PantonePosterPage navigate={handleNavigate} />} />
              <Route path="trend-posters/newspaper" element={<NewspaperPosterPage navigate={handleNavigate} />} />
              <Route path="trend-posters/heart" element={<HeartPosterPage navigate={handleNavigate} />} />
              <Route path="trend-posters/airbnb" element={<AirbnbPosterPage navigate={handleNavigate} />} />
              <Route path="trend-posters/toddler" element={<ToddlerPosterPage navigate={handleNavigate} />} />

              {/* Admin Müşteri Sipariş İnceleme Editörleri (Tokenli) */}
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
              
              <Route path="claim" element={<ClaimOrder />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>

          ) : (

          /* ========= MÜŞTERİ (NORMAL) DOMAİN YÖNLENDİRMELERİ ========= */
            <>
              <Route index element={<Navigate to="/claim" replace />} />
              <Route path="claim" element={<ClaimOrder />} />
              
              {/* Müşteri Sipariş Düzenleme Ekranları (Sadece Token ile Girilir) */}
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

              {/* Müşteri sitenin içinde gezinip Admin panosuna falan giremesin diye Fallback */}
              <Route path="*" element={<Navigate to="/claim" replace />} />
            </>
          )}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
