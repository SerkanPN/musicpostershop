import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import jsPDF from 'jspdf';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ModernStudioLayout, { PresetItem } from '../../components/ModernStudioLayout';
import { POSTER_PRESETS } from '../../lib/presets';
import { 
  Sparkles, Sliders, Palette, Type, QrCode, Music, 
  RefreshCw, Check, AlignCenter, FileText
} from 'lucide-react';

const SOUNDWAVE_PRESET_DATA: Record<string, any> = {
  'first-heartbeat': {
    topBadge: 'BABY BOY',
    dateText: '14 MAY 2026',
    title: 'FIRST HEARTBEAT',
    subtitle: '142 BPM • ULTRASOUND RECORDING',
    bottom1: 'THE SWEETEST SOUND IN THE WORLD',
    bottom2: 'MEMORIAL HOSPITAL • 08:42 AM',
    qrText: 'https://musicpostershop.com',
    bgColor: '#faf7f5',
    textColor: '#1c1917',
    subColor: '#78716c',
    waveType: 'gradient',
    waveColor1: '#f43f5e',
    waveColor2: '#fb7185',
    fontTitle: 'Playfair Display, serif',
    fontBody: 'Inter, sans-serif'
  },
  'first-cry': {
    topBadge: 'NEW ARRIVAL',
    dateText: '24 AUGUST 2026',
    title: 'THE FIRST CRY',
    subtitle: 'LEO ALEXANDER • 3.42 KG • 51 CM',
    bottom1: 'WELCOME TO OUR WORLD',
    bottom2: 'FOREVER IN OUR HEARTS',
    qrText: 'https://musicpostershop.com',
    bgColor: '#fffdfa',
    textColor: '#292524',
    subColor: '#78716c',
    waveType: 'gradient',
    waveColor1: '#f59e0b',
    waveColor2: '#ea580c',
    fontTitle: 'Playfair Display, serif',
    fontBody: 'Inter, sans-serif'
  },
  'wedding-vows-audio': {
    topBadge: 'OUR WEDDING DAY',
    dateText: '24.08.2026',
    title: 'THE WEDDING VOWS',
    subtitle: 'SARAH & DANIEL • FOREVER & ALWAYS',
    bottom1: 'I PROMISE TO LOVE YOU IN EVERY LIFETIME',
    bottom2: 'RECORDED LIVE AT ST. IVES CHAPEL',
    qrText: 'https://musicpostershop.com',
    bgColor: '#0f172a',
    textColor: '#f8fafc',
    subColor: '#94a3b8',
    waveType: 'gradient',
    waveColor1: '#38bdf8',
    waveColor2: '#818cf8',
    fontTitle: 'Cinzel, serif',
    fontBody: 'Inter, sans-serif'
  },
  'first-dance-audio': {
    topBadge: 'FIRST DANCE',
    dateText: '24.08.2026',
    title: 'PERFECT',
    subtitle: 'ED SHEERAN • OUR SONG',
    bottom1: '"BABY, I\'M DANCING IN THE DARK WITH YOU BETWEEN MY ARMS"',
    bottom2: 'SARAH & DANIEL • FIRST DANCE',
    qrText: 'https://musicpostershop.com',
    bgColor: '#18181b',
    textColor: '#ffffff',
    subColor: '#a1a1aa',
    waveType: 'gradient',
    waveColor1: '#e11d48',
    waveColor2: '#fb7185',
    fontTitle: 'Playfair Display, serif',
    fontBody: 'Inter, sans-serif'
  },
  'grandmas-voicemail': {
    topBadge: 'SAVED VOICEMAIL',
    dateText: '14.11.2024',
    title: '"HELLO MY DEAR"',
    subtitle: 'GRANDMA ELEANOR • 1938 - 2025',
    bottom1: 'IN LOVING MEMORY • FOREVER IN OUR HEARTS',
    bottom2: 'PRESERVED VOICEMAIL AUDIO',
    qrText: 'https://musicpostershop.com',
    bgColor: '#fbf8f3',
    textColor: '#3e2723',
    subColor: '#8d6e63',
    waveType: 'solid',
    waveColor1: '#8d6e63',
    waveColor2: '#8d6e63',
    fontTitle: 'Playfair Display, serif',
    fontBody: 'Inter, sans-serif'
  },
  'song-chorus': {
    topBadge: 'ICONIC SOLO',
    dateText: '1979',
    title: 'COMFORTABLY NUMB',
    subtitle: 'PINK FLOYD • THE GUITAR SOLO',
    bottom1: 'RECORDED AT PRODUCERS WORKSHOP, LA',
    bottom2: 'HARVEST RECORDS • STEREO MASTER',
    qrText: 'https://musicpostershop.com',
    bgColor: '#09090b',
    textColor: '#fafafa',
    subColor: '#a1a1aa',
    waveType: 'gradient',
    waveColor1: '#06b6d4',
    waveColor2: '#3b82f6',
    fontTitle: 'Montserrat, sans-serif',
    fontBody: 'Inter, sans-serif'
  }
};

const COLOR_PALETTES = [
  { name: 'Onyx & Cream', bg: '#0c0a09', text: '#fafaf9', sub: '#a8a29e', w1: '#f43f5e', w2: '#fb7185' },
  { name: 'Pure Minimal', bg: '#ffffff', text: '#18181b', sub: '#71717a', w1: '#18181b', w2: '#3f3f46' },
  { name: 'Warm Parchment', bg: '#faf6f0', text: '#292524', sub: '#78716c', w1: '#c2410c', w2: '#ea580c' },
  { name: 'Midnight Navy', bg: '#0b1329', text: '#f8fafc', sub: '#94a3b8', w1: '#38bdf8', w2: '#818cf8' },
  { name: 'Sage & Forest', bg: '#f4f7f4', text: '#14532d', sub: '#166534', w1: '#15803d', w2: '#22c55e' },
  { name: 'Sepia Vintage', bg: '#fdfbf7', text: '#451a03', sub: '#78350f', w1: '#b45309', w2: '#d97706' },
  { name: 'Cyberpunk Neon', bg: '#050505', text: '#f43f5e', sub: '#fb7185', w1: '#06b6d4', w2: '#ec4899' }
];

export default function SoundwaveEditor() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const presetParam = searchParams.get('preset') || 'first-heartbeat';

  const [activePreset, setActivePreset] = useState<string>(presetParam);
  const initial = SOUNDWAVE_PRESET_DATA[presetParam] || SOUNDWAVE_PRESET_DATA['first-heartbeat'];

  const [topBadge, setTopBadge] = useState(initial.topBadge);
  const [dateText, setDateText] = useState(initial.dateText);
  const [title, setTitle] = useState(initial.title);
  const [subtitle, setSubtitle] = useState(initial.subtitle);
  const [bottom1, setBottom1] = useState(initial.bottom1);
  const [bottom2, setBottom2] = useState(initial.bottom2);
  const [qrText, setQrText] = useState(initial.qrText);
  const [showQR, setShowQR] = useState(true);

  const [bgColor, setBgColor] = useState(initial.bgColor);
  const [textColor, setTextColor] = useState(initial.textColor);
  const [subColor, setSubColor] = useState(initial.subColor);
  const [waveColor1, setWaveColor1] = useState(initial.waveColor1);
  const [waveColor2, setWaveColor2] = useState(initial.waveColor2);
  const [waveType, setWaveType] = useState<'gradient' | 'solid'>(initial.waveType || 'gradient');

  const [waveDensity, setWaveDensity] = useState(140);
  const [waveHeightScale, setWaveHeightScale] = useState(140);
  const [fontTitle, setFontTitle] = useState(initial.fontTitle || 'Playfair Display, serif');
  const [fontBody, setFontBody] = useState(initial.fontBody || 'Inter, sans-serif');

  const [zoom, setZoom] = useState(1);
  const [printSize, setPrintSize] = useState('18x24');
  const [isExporting, setIsExporting] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);

  // Load Google Fonts
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Cinzel:wght@400;700;900&family=Inter:wght@300;400;500;600;700&family=Montserrat:wght@400;600;800&family=Space+Mono:wght@400;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  // Handle Preset Switching
  const handlePresetSelect = (id: string) => {
    setActivePreset(id);
    const data = SOUNDWAVE_PRESET_DATA[id];
    if (data) {
      setTopBadge(data.topBadge);
      setDateText(data.dateText);
      setTitle(data.title);
      setSubtitle(data.subtitle);
      setBottom1(data.bottom1);
      setBottom2(data.bottom2);
      setBgColor(data.bgColor);
      setTextColor(data.textColor);
      setSubColor(data.subColor);
      setWaveColor1(data.waveColor1);
      setWaveColor2(data.waveColor2);
      setWaveType(data.waveType);
      if (data.fontTitle) setFontTitle(data.fontTitle);
      if (data.fontBody) setFontBody(data.fontBody);
    } else {
      // Fallback for general preset list
      const general = (POSTER_PRESETS.SOUNDWAVE as any[]).find(p => p.id === id);
      if (general) {
        setTitle(general.label.toUpperCase());
        setSubtitle('CUSTOM AUDIO WAVEFORM RECORDING');
        setTopBadge(general.category.toUpperCase());
      }
    }
  };

  // Render Canvas with High-End Editorial Design
  const renderCanvas = () => {
    if (!canvasRef.current) return;

    if (!fabricRef.current) {
      const c = document.createElement('canvas');
      canvasRef.current.innerHTML = '';
      canvasRef.current.appendChild(c);
      fabricRef.current = new fabric.Canvas(c, {
        width: 600,
        height: 800,
        backgroundColor: bgColor,
        selection: false
      });
    }

    const canvas = fabricRef.current;
    canvas.clear();

    const w = 600;
    const h = 800;

    // 1. Luxury Textured Background
    const bg = new fabric.Rect({
      left: 0, top: 0, width: w, height: h, fill: bgColor, selectable: false
    });
    canvas.add(bg);

    // 2. Elegant Editorial Double Header Border
    const headerLine = new fabric.Line([45, 75, w - 45, 75], {
      stroke: textColor, strokeWidth: 0.75, opacity: 0.25, selectable: false
    });
    canvas.add(headerLine);

    // Top Left Badge
    canvas.add(new fabric.Textbox(topBadge.toUpperCase(), {
      left: 45, top: 52, fontSize: 10, fontWeight: 700, fill: textColor,
      fontFamily: fontBody, charSpacing: 180, selectable: false
    }));

    // Top Right Date
    canvas.add(new fabric.Textbox(dateText.toUpperCase(), {
      left: w - 245, top: 52, width: 200, textAlign: 'right', fontSize: 10,
      fontWeight: 600, fill: subColor, fontFamily: fontBody, charSpacing: 120, selectable: false
    }));

    // 3. Audio Waveform Graphic (Smooth, Ultra-High Quality)
    const cy = h * 0.46;
    const step = (w - 110) / waveDensity;
    const startX = 55;

    for (let i = 0; i < waveDensity; i++) {
      const x = startX + (i * step);
      // Dual envelope bell-curve for natural audio profile
      const normalizedX = (i / waveDensity) * 2 - 1;
      const env1 = Math.exp(-Math.pow(normalizedX * 2.2, 2));
      const env2 = Math.sin((i / waveDensity) * Math.PI);
      const combinedEnv = (env1 * 0.75) + (env2 * 0.25);

      // Deterministic smooth organic variation
      const seed = Math.sin(i * 12.9898 + (i % 7) * 78.233);
      const noise = (Math.abs(seed) % 1) * 0.65 + 0.35;
      const amp = waveHeightScale * combinedEnv * noise;

      if (amp > 2) {
        // Gradient color interpolation across the width
        const ratio = i / waveDensity;
        const barColor = waveType === 'solid' ? waveColor1 : (ratio < 0.5 ? waveColor1 : waveColor2);

        const bar = new fabric.Rect({
          left: x,
          top: cy - amp,
          width: Math.max(1.2, step * 0.58),
          height: amp * 2,
          fill: barColor,
          rx: 1.5,
          ry: 1.5,
          opacity: 0.92,
          selectable: false
        });
        canvas.add(bar);
      }
    }

    // Waveform subtle center horizon guideline
    const centerGuide = new fabric.Line([45, cy, w - 45, cy], {
      stroke: textColor, strokeWidth: 0.5, opacity: 0.15, selectable: false
    });
    canvas.add(centerGuide);

    // 4. Main Title & Subtitle Hierarchy
    const titleEl = new fabric.Textbox(title, {
      left: w / 2, top: h * 0.66, width: w - 90, originX: 'center', textAlign: 'center',
      fontSize: 30, fontWeight: 700, fill: textColor, fontFamily: fontTitle,
      charSpacing: 80, selectable: false
    });
    canvas.add(titleEl);

    const subEl = new fabric.Textbox(subtitle.toUpperCase(), {
      left: w / 2, top: h * 0.725, width: w - 90, originX: 'center', textAlign: 'center',
      fontSize: 11, fontWeight: 600, fill: subColor, fontFamily: fontBody,
      charSpacing: 160, selectable: false
    });
    canvas.add(subEl);

    // 5. Divider & Dedication
    const bottomDivider = new fabric.Line([w/2 - 30, h * 0.77, w/2 + 30, h * 0.77], {
      stroke: textColor, strokeWidth: 1, opacity: 0.3, selectable: false
    });
    canvas.add(bottomDivider);

    const b1El = new fabric.Textbox(bottom1, {
      left: w / 2, top: h * 0.80, width: w - 100, originX: 'center', textAlign: 'center',
      fontSize: 11, fontStyle: 'italic', fill: textColor, fontFamily: fontTitle,
      selectable: false
    });
    canvas.add(b1El);

    const b2El = new fabric.Textbox(bottom2.toUpperCase(), {
      left: w / 2, top: h * 0.85, width: w - 100, originX: 'center', textAlign: 'center',
      fontSize: 9, fontWeight: 600, fill: subColor, fontFamily: fontBody,
      charSpacing: 140, selectable: false
    });
    canvas.add(b2El);

    // 6. Optional Soundwave / Scannable Spotify Barcode Art Badge
    if (showQR) {
      const codeWidth = 140;
      const codeY = h * 0.90;
      
      // Fine frame box around soundwave code
      const codeFrame = new fabric.Rect({
        left: w/2 - codeWidth/2, top: codeY, width: codeWidth, height: 26,
        rx: 13, ry: 13, fill: bgColor, stroke: textColor, strokeWidth: 0.8,
        opacity: 0.4, selectable: false
      });
      canvas.add(codeFrame);

      // Mini scannable soundwave lines inside badge
      for (let k = 0; k < 24; k++) {
        const kx = (w/2 - codeWidth/2 + 18) + (k * 4.5);
        const kh = (Math.sin(k * 0.8) * 6 + 7);
        const kBar = new fabric.Rect({
          left: kx, top: codeY + 13 - (kh / 2), width: 2, height: kh,
          rx: 1, ry: 1, fill: textColor, opacity: 0.7, selectable: false
        });
        canvas.add(kBar);
      }
    }

    canvas.renderAll();
  };

  useEffect(() => {
    renderCanvas();
  }, [
    topBadge, dateText, title, subtitle, bottom1, bottom2, qrText, showQR,
    bgColor, textColor, subColor, waveColor1, waveColor2, waveType,
    waveDensity, waveHeightScale, fontTitle, fontBody
  ]);

  // Export PNG
  const handleDownloadPNG = () => {
    if (!fabricRef.current) return;
    setIsExporting(true);
    const dataUrl = fabricRef.current.toDataURL({ format: 'png', multiplier: 3 });
    const link = document.createElement('a');
    link.download = `soundwave-poster-${activePreset}.png`;
    link.href = dataUrl;
    link.click();
    setIsExporting(false);
  };

  // Export 300 DPI Vector PDF
  const handleDownloadPDF = () => {
    if (!fabricRef.current) return;
    setIsExporting(true);
    const dataUrl = fabricRef.current.toDataURL({ format: 'png', multiplier: 4 });
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'in',
      format: [18, 24]
    });
    pdf.addImage(dataUrl, 'PNG', 0, 0, 18, 24);
    pdf.save(`soundwave-poster-300dpi-${activePreset}.pdf`);
    setIsExporting(false);
  };

  // Preset list for Dropdown
  const soundwavePresets: PresetItem[] = (POSTER_PRESETS.SOUNDWAVE as any[]).map(p => ({
    id: p.id,
    title: p.label,
    label: p.category
  }));

  // Sidebar Controls JSX
  const sidebar = (
    <div className="space-y-6">
      {/* SECTION 1: PRESET SELECTION */}
      <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
        <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-rose-400" />
          Choose Preset Theme ({soundwavePresets.length})
        </label>
        <select
          value={activePreset}
          onChange={e => handlePresetSelect(e.target.value)}
          className="w-full bg-[#18191c] border border-neutral-700 rounded-lg px-3 py-2.5 text-xs text-white focus:border-rose-500 outline-none"
        >
          {soundwavePresets.map(p => (
            <option key={p.id} value={p.id}>
              {p.title} ({p.label})
            </option>
          ))}
        </select>
      </div>

      {/* SECTION 2: TEXT & TITLES */}
      <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
        <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
          <Type className="w-3.5 h-3.5 text-blue-400" />
          Poster Texts & Details
        </label>
        
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] text-neutral-500 uppercase font-semibold">Top Badge</span>
            <input
              type="text"
              value={topBadge}
              onChange={e => setTopBadge(e.target.value)}
              className="w-full bg-[#18191c] border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-rose-500 outline-none mt-1"
            />
          </div>
          <div>
            <span className="text-[10px] text-neutral-500 uppercase font-semibold">Date / Location</span>
            <input
              type="text"
              value={dateText}
              onChange={e => setDateText(e.target.value)}
              className="w-full bg-[#18191c] border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-rose-500 outline-none mt-1"
            />
          </div>
        </div>

        <div>
          <span className="text-[10px] text-neutral-500 uppercase font-semibold">Main Title</span>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full bg-[#18191c] border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white font-semibold focus:border-rose-500 outline-none mt-1"
          />
        </div>

        <div>
          <span className="text-[10px] text-neutral-500 uppercase font-semibold">Subtitle / Artist</span>
          <input
            type="text"
            value={subtitle}
            onChange={e => setSubtitle(e.target.value)}
            className="w-full bg-[#18191c] border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 outline-none mt-1"
          />
        </div>

        <div>
          <span className="text-[10px] text-neutral-500 uppercase font-semibold">Dedication Message (Line 1)</span>
          <input
            type="text"
            value={bottom1}
            onChange={e => setBottom1(e.target.value)}
            className="w-full bg-[#18191c] border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 outline-none mt-1"
          />
        </div>

        <div>
          <span className="text-[10px] text-neutral-500 uppercase font-semibold">Footer Notes (Line 2)</span>
          <input
            type="text"
            value={bottom2}
            onChange={e => setBottom2(e.target.value)}
            className="w-full bg-[#18191c] border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 outline-none mt-1"
          />
        </div>
      </div>

      {/* SECTION 3: WAVEFORM ENGINE CONTROLS */}
      <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-4">
        <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
          <Sliders className="w-3.5 h-3.5 text-emerald-400" />
          Waveform Dynamics
        </label>

        <div>
          <div className="flex justify-between text-xs text-neutral-400 mb-1.5">
            <span>Wave Density</span>
            <span className="font-mono text-white">{waveDensity} bars</span>
          </div>
          <input
            type="range"
            min="60"
            max="220"
            value={waveDensity}
            onChange={e => setWaveDensity(Number(e.target.value))}
            className="w-full accent-rose-500 cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs text-neutral-400 mb-1.5">
            <span>Wave Amplitude</span>
            <span className="font-mono text-white">{waveHeightScale}px</span>
          </div>
          <input
            type="range"
            min="60"
            max="200"
            value={waveHeightScale}
            onChange={e => setWaveHeightScale(Number(e.target.value))}
            className="w-full accent-rose-500 cursor-pointer"
          />
        </div>

        {/* Wave Colors */}
        <div className="pt-2 border-t border-neutral-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-neutral-400">Wave Color 1</span>
            <input
              type="color"
              value={waveColor1}
              onChange={e => setWaveColor1(e.target.value)}
              className="w-7 h-7 rounded-lg bg-transparent cursor-pointer border border-neutral-700"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-400">Wave Color 2 (Gradient)</span>
            <input
              type="color"
              value={waveColor2}
              onChange={e => setWaveColor2(e.target.value)}
              className="w-7 h-7 rounded-lg bg-transparent cursor-pointer border border-neutral-700"
            />
          </div>
        </div>
      </div>

      {/* SECTION 4: COLOR PALETTES */}
      <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
        <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
          <Palette className="w-3.5 h-3.5 text-pink-400" />
          Curated Color Palettes
        </label>
        <div className="grid grid-cols-2 gap-2">
          {COLOR_PALETTES.map(cp => (
            <button
              key={cp.name}
              onClick={() => {
                setBgColor(cp.bg);
                setTextColor(cp.text);
                setSubColor(cp.sub);
                setWaveColor1(cp.w1);
                setWaveColor2(cp.w2);
              }}
              className="flex items-center gap-2.5 p-2 rounded-lg bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-left transition-all group"
            >
              <div 
                className="w-5 h-5 rounded-full border border-neutral-700 shrink-0" 
                style={{ backgroundColor: cp.bg }}
              />
              <span className="text-[11px] font-medium text-neutral-300 group-hover:text-white truncate">
                {cp.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* SECTION 5: SOUNDWAVE BADGE TOGGLE */}
      <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <QrCode className="w-4 h-4 text-neutral-400" />
          <span className="text-xs font-medium text-neutral-200">Show Scannable Audio Badge</span>
        </div>
        <input
          type="checkbox"
          checked={showQR}
          onChange={e => setShowQR(e.target.checked)}
          className="w-4 h-4 accent-rose-600 rounded cursor-pointer"
        />
      </div>
    </div>
  );

  return (
    <ModernStudioLayout
      title="Soundwave Art Studio"
      category="Audio Memory"
      onBack={() => navigate('/')}
      onDownloadPNG={handleDownloadPNG}
      onDownloadPDF={handleDownloadPDF}
      isExporting={isExporting}
      presets={soundwavePresets}
      activePreset={activePreset}
      onSelectPreset={handlePresetSelect}
      zoom={zoom}
      setZoom={setZoom}
      printSize={printSize}
      setPrintSize={setPrintSize}
      sidebarContent={sidebar}
      canvasRef={canvasRef}
      canvasWidth={600}
      canvasHeight={800}
    />
  );
}
