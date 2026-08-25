import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
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
import VinylEditor from './pages/editors/VinylEditor';
import LyricsPrintEditor from './pages/editors/LyricsPrintEditor';
import WeddingVowsEditor from './pages/editors/WeddingVowsEditor';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/trend-posters" element={<HomePage />} />
      
      {/* Lyricsposter.com Direct Standalone & Specific Editors */}
      <Route path="/custom-vinyl-lyrics-print" element={<VinylEditor />} />
      <Route path="/editor/vinyl" element={<VinylEditor />} />

      <Route path="/custom-song-lyrics-print" element={<LyricsPrintEditor />} />
      <Route path="/lyrics-poster-maker" element={<LyricsPrintEditor />} />
      <Route path="/editor/lyrics" element={<LyricsPrintEditor />} />

      <Route path="/custom-wedding-vows-print" element={<WeddingVowsEditor />} />
      <Route path="/editor/vows" element={<WeddingVowsEditor />} />

      {/* 14 Category Bespoke Editors */}
      <Route path="/editor/soundwave" element={<SoundwaveEditor />} />
      <Route path="/soundwave-lyrics-art" element={<SoundwaveEditor />} />
      <Route path="/soundwave" element={<SoundwaveEditor />} />

      <Route path="/editor/receipt" element={<ReceiptEditor />} />
      <Route path="/music-posters" element={<ReceiptEditor />} />
      <Route path="/receipt" element={<ReceiptEditor />} />

      <Route path="/editor/dictionary" element={<DictionaryEditor />} />
      <Route path="/editor/typography" element={<DictionaryEditor />} />

      <Route path="/editor/coordinates" element={<CoordinatesEditor />} />
      <Route path="/custom-map-print" element={<CoordinatesEditor />} />

      <Route path="/editor/starmap" element={<StarmapEditor />} />
      <Route path="/starmap" element={<StarmapEditor />} />

      <Route path="/editor/cassette" element={<CassetteEditor />} />
      <Route path="/editor/typewriter" element={<TypewriterEditor />} />
      <Route path="/editor/polaroid" element={<PolaroidEditor />} />
      <Route path="/editor/patent" element={<PatentEditor />} />
      <Route path="/editor/pantone" element={<PantoneEditor />} />
      <Route path="/editor/newspaper" element={<NewspaperEditor />} />
      <Route path="/editor/heart" element={<HeartEditor />} />
      <Route path="/editor/airbnb" element={<AirbnbEditor />} />
      <Route path="/editor/toddler" element={<ToddlerEditor />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
