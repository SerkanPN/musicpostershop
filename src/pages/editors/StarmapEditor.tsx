import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import jsPDF from 'jspdf';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ModernStudioLayout, { PresetItem } from '../../components/ModernStudioLayout';
import { POSTER_PRESETS } from '../../lib/presets';
import { 
  Sparkles, Moon, Sliders, Palette, Type, Check
} from 'lucide-react';

const STARMAP_PRESET_DATA: Record<string, any> = {
  'the-night-we-met': {
    title: 'THE NIGHT WE MET',
    location: 'PARIS, FRANCE',
    dateText: '14 OCTOBER 2020 • 22:45 PM',
    latLng: '48.8566° N, 2.3522° E',
    quote: '"UNDER THESE STARS, MY UNIVERSE BEGAN WITH YOU"',
    bgColor: '#08080c',
    discColor: '#0c0f1d',
    textColor: '#fafafa',
    subColor: '#94a3b8',
    starColor: '#ffffff',
    constellationColor: 'rgba(56, 189, 248, 0.4)'
  },
  'wedding-night-sky': {
    title: 'THE NIGHT WE SAID I DO',
    location: 'SANTORINI, GREECE',
    dateText: 'AUGUST 24, 2026 • 20:30 PM',
    latLng: '36.3932° N, 25.4615° E',
    quote: '"WRITTEN IN THE STARS, SEALED IN OUR HEARTS"',
    bgColor: '#0a0d18',
    discColor: '#0e1428',
    textColor: '#f8fafc',
    subColor: '#cbd5e1',
    starColor: '#ffffff',
    constellationColor: 'rgba(251, 113, 133, 0.45)'
  },
  'birthday-under-stars': {
    title: 'A STAR WAS BORN',
    location: 'NEW YORK, NY',
    dateText: 'MAY 14, 2026 • 04:18 AM',
    latLng: '40.7128° N, 74.0060° W',
    quote: '"THE SKY ON THE DAY YOU ENTERED OUR WORLD"',
    bgColor: '#09090b',
    discColor: '#121216',
    textColor: '#ffffff',
    subColor: '#a1a1aa',
    starColor: '#fef08a',
    constellationColor: 'rgba(250, 204, 21, 0.4)'
  }
};

const STARMAP_THEMES = [
  { name: 'Deep Midnight', bg: '#08080c', disc: '#0c0f1d', text: '#fafafa', sub: '#94a3b8', star: '#ffffff', con: 'rgba(56, 189, 248, 0.4)' },
  { name: 'Velvet Rose', bg: '#10070c', disc: '#1c0d17', text: '#fff1f2', sub: '#fda4af', star: '#ffe4e6', con: 'rgba(244, 63, 94, 0.45)' },
  { name: 'Pure Obsidian', bg: '#000000', disc: '#09090b', text: '#ffffff', sub: '#a1a1aa', star: '#ffffff', con: 'rgba(255, 255, 255, 0.3)' },
  { name: 'Warm Ivory Night', bg: '#fdfbf7', disc: '#111827', text: '#1c1917', sub: '#6b7280', star: '#ffffff', con: 'rgba(56, 189, 248, 0.4)' }
];

export default function StarmapEditor() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const presetParam = searchParams.get('preset') || 'the-night-we-met';

  const [activePreset, setActivePreset] = useState<string>(presetParam);
  const initial = STARMAP_PRESET_DATA[presetParam] || STARMAP_PRESET_DATA['the-night-we-met'];

  const [title, setTitle] = useState(initial.title);
  const [location, setLocation] = useState(initial.location);
  const [dateText, setDateText] = useState(initial.dateText);
  const [latLng, setLatLng] = useState(initial.latLng);
  const [quote, setQuote] = useState(initial.quote);

  const [starCount, setStarCount] = useState(180);
  const [showConstellations, setShowConstellations] = useState(true);
  const [showGrid, setShowGrid] = useState(true);

  const [bgColor, setBgColor] = useState(initial.bgColor);
  const [discColor, setDiscColor] = useState(initial.discColor);
  const [textColor, setTextColor] = useState(initial.textColor);
  const [subColor, setSubColor] = useState(initial.subColor);
  const [starColor, setStarColor] = useState(initial.starColor);
  const [constellationColor, setConstellationColor] = useState(initial.constellationColor);

  const [zoom, setZoom] = useState(1);
  const [printSize, setPrintSize] = useState('18x24');
  const [isExporting, setIsExporting] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Cinzel:wght@400;700&family=Inter:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  const handlePresetSelect = (id: string) => {
    setActivePreset(id);
    const data = STARMAP_PRESET_DATA[id];
    if (data) {
      setTitle(data.title);
      setLocation(data.location);
      setDateText(data.dateText);
      setLatLng(data.latLng);
      setQuote(data.quote);
      setBgColor(data.bgColor);
      setDiscColor(data.discColor);
      setTextColor(data.textColor);
      setSubColor(data.subColor);
      setStarColor(data.starColor);
      setConstellationColor(data.constellationColor);
    } else {
      const general = (POSTER_PRESETS.STARMAP as any[]).find(p => p.id === id);
      if (general) {
        setTitle(general.label.toUpperCase());
      }
    }
  };

  // Render Museum-Grade Starmap Poster
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

    // 1. Background
    const bg = new fabric.Rect({
      left: 0, top: 0, width: w, height: h, fill: bgColor, selectable: false
    });
    canvas.add(bg);

    // Inset Frame Border
    const inset = new fabric.Rect({
      left: 36, top: 36, width: w - 72, height: h - 72, fill: 'transparent',
      stroke: textColor, strokeWidth: 0.5, opacity: 0.2, selectable: false
    });
    canvas.add(inset);

    // 2. Celestial Sky Disc
    const center = { x: w / 2, y: h * 0.42 };
    const radius = 195;

    // Celestial Disc Shadow
    const discShadow = new fabric.Circle({
      left: center.x - radius, top: center.y - radius + 6,
      radius: radius, fill: '#000000', opacity: 0.3, selectable: false
    });
    canvas.add(discShadow);

    // Sky Dome Circle
    const skyDisc = new fabric.Circle({
      left: center.x - radius, top: center.y - radius,
      radius: radius, fill: discColor, stroke: textColor, strokeWidth: 1,
      opacity: 0.95, selectable: false
    });
    canvas.add(skyDisc);

    // Celestial Grid Rings
    if (showGrid) {
      const gridRings = [radius * 0.35, radius * 0.68];
      gridRings.forEach(gr => {
        const ring = new fabric.Circle({
          left: center.x - gr, top: center.y - gr, radius: gr,
          fill: 'transparent', stroke: textColor, strokeWidth: 0.5,
          strokeDashArray: [2, 3], opacity: 0.2, selectable: false
        });
        canvas.add(ring);
      });

      // Grid Cross lines
      const gcH = new fabric.Line([center.x - radius + 15, center.y, center.x + radius - 15, center.y], {
        stroke: textColor, strokeWidth: 0.5, strokeDashArray: [2, 3], opacity: 0.2, selectable: false
      });
      canvas.add(gcH);

      const gcV = new fabric.Line([center.x, center.y - radius + 15, center.x, center.y + radius - 15], {
        stroke: textColor, strokeWidth: 0.5, strokeDashArray: [2, 3], opacity: 0.2, selectable: false
      });
      canvas.add(gcV);
    }

    // 3. Stars Field (Deterministic Seed for Smoothness)
    const starPoints: { x: number; y: number }[] = [];
    for (let s = 0; s < starCount; s++) {
      const seedR = (Math.sin(s * 91.34) * 10000) % 1;
      const seedA = (Math.cos(s * 47.12) * 10000) % 1;
      const dist = Math.sqrt(Math.abs(seedR)) * (radius - 12);
      const angle = Math.abs(seedA) * 2 * Math.PI;

      const sx = center.x + dist * Math.cos(angle);
      const sy = center.y + dist * Math.sin(angle);
      starPoints.push({ x: sx, y: sy });

      const starSize = (s % 7 === 0) ? 2.2 : (s % 3 === 0 ? 1.4 : 0.8);
      const starOpacity = (s % 5 === 0) ? 0.95 : 0.65;

      const star = new fabric.Circle({
        left: sx, top: sy, radius: starSize,
        fill: starColor, opacity: starOpacity, selectable: false
      });
      canvas.add(star);
    }

    // 4. Constellation Lines
    if (showConstellations && starPoints.length >= 20) {
      const conPairs = [
        [4, 12], [12, 19], [19, 28], [28, 35], [35, 4], // Major loop
        [15, 22], [22, 31], [31, 44], // Secondary constellation
        [50, 62], [62, 75], [75, 88] // Third constellation
      ];

      conPairs.forEach(([p1, p2]) => {
        if (starPoints[p1] && starPoints[p2]) {
          const conLine = new fabric.Line(
            [starPoints[p1].x, starPoints[p1].y, starPoints[p2].x, starPoints[p2].y],
            { stroke: constellationColor, strokeWidth: 0.8, selectable: false }
          );
          canvas.add(conLine);
        }
      });
    }

    // Cardinal Marks
    canvas.add(new fabric.Text('N', {
      left: center.x, top: center.y - radius - 14,
      fontSize: 9, fontWeight: '700', fill: textColor, fontFamily: 'Inter, sans-serif',
      originX: 'center', originY: 'center', selectable: false
    }));

    // 5. Bottom Editorial Typography
    let curY = h * 0.71;

    const titleEl = new fabric.Textbox(title.toUpperCase(), {
      left: w / 2, top: curY, width: w - 90, originX: 'center', textAlign: 'center',
      fontSize: 24, fontWeight: 700, fill: textColor, fontFamily: 'Cinzel, serif',
      charSpacing: 100, selectable: false
    });
    canvas.add(titleEl);
    curY += titleEl.height + 6;

    const locEl = new fabric.Textbox(`${location.toUpperCase()}   •   ${latLng}`, {
      left: w / 2, top: curY, width: w - 90, originX: 'center', textAlign: 'center',
      fontSize: 10, fontWeight: 600, fill: subColor, fontFamily: 'Inter, sans-serif',
      charSpacing: 120, selectable: false
    });
    canvas.add(locEl);
    curY += locEl.height + 4;

    const dateEl = new fabric.Textbox(dateText.toUpperCase(), {
      left: w / 2, top: curY, width: w - 90, originX: 'center', textAlign: 'center',
      fontSize: 9.5, fontWeight: 600, fill: subColor, fontFamily: 'Space Mono, monospace',
      charSpacing: 100, selectable: false
    });
    canvas.add(dateEl);
    curY += dateEl.height + 14;

    const divider = new fabric.Line([w/2 - 25, curY, w/2 + 25, curY], {
      stroke: textColor, strokeWidth: 1, opacity: 0.3, selectable: false
    });
    canvas.add(divider);
    curY += 14;

    if (quote) {
      const quoteEl = new fabric.Textbox(quote, {
        left: w / 2, top: curY, width: w - 100, originX: 'center', textAlign: 'center',
        fontSize: 11, fontStyle: 'italic', fill: textColor, fontFamily: 'Playfair Display, serif',
        selectable: false
      });
      canvas.add(quoteEl);
    }

    canvas.renderAll();
  };

  useEffect(() => {
    renderCanvas();
  }, [
    title, location, dateText, latLng, quote, starCount, showConstellations, showGrid,
    bgColor, discColor, textColor, subColor, starColor, constellationColor
  ]);

  const handleDownloadPNG = () => {
    if (!fabricRef.current) return;
    setIsExporting(true);
    const dataUrl = fabricRef.current.toDataURL({ format: 'png', multiplier: 3 });
    const link = document.createElement('a');
    link.download = `starmap-poster-${activePreset}.png`;
    link.href = dataUrl;
    link.click();
    setIsExporting(false);
  };

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
    pdf.save(`starmap-poster-300dpi-${activePreset}.pdf`);
    setIsExporting(false);
  };

  const starmapPresetsList: PresetItem[] = (POSTER_PRESETS.STARMAP as any[]).map(p => ({
    id: p.id,
    title: p.label,
    label: p.category
  }));

  const sidebar = (
    <div className="space-y-6">
      {/* SECTION 1: PRESET CHOOSER */}
      <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
        <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          Choose StarMap Preset ({starmapPresetsList.length})
        </label>
        <select
          value={activePreset}
          onChange={e => handlePresetSelect(e.target.value)}
          className="w-full bg-[#18191c] border border-neutral-700 rounded-lg px-3 py-2.5 text-xs text-white focus:border-blue-500 outline-none"
        >
          {starmapPresetsList.map(p => (
            <option key={p.id} value={p.id}>
              {p.title} ({p.label})
            </option>
          ))}
        </select>
      </div>

      {/* SECTION 2: TITLE & DATE */}
      <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
        <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
          <Type className="w-3.5 h-3.5 text-purple-400" />
          Sky Details & Location
        </label>

        <div>
          <span className="text-[10px] text-neutral-500 uppercase font-semibold">Poster Title</span>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full bg-[#18191c] border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white font-semibold focus:border-blue-500 outline-none mt-1"
          />
        </div>

        <div>
          <span className="text-[10px] text-neutral-500 uppercase font-semibold">City & Country</span>
          <input
            type="text"
            value={location}
            onChange={e => setLocation(e.target.value)}
            className="w-full bg-[#18191c] border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:border-blue-500 outline-none mt-1"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] text-neutral-500 uppercase font-semibold">Date & Time</span>
            <input
              type="text"
              value={dateText}
              onChange={e => setDateText(e.target.value)}
              className="w-full bg-[#18191c] border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-blue-500 outline-none mt-1"
            />
          </div>
          <div>
            <span className="text-[10px] text-neutral-500 uppercase font-semibold">Lat / Lng</span>
            <input
              type="text"
              value={latLng}
              onChange={e => setLatLng(e.target.value)}
              className="w-full bg-[#18191c] border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-blue-500 outline-none mt-1 font-mono"
            />
          </div>
        </div>

        <div>
          <span className="text-[10px] text-neutral-500 uppercase font-semibold">Romantic Quote</span>
          <input
            type="text"
            value={quote}
            onChange={e => setQuote(e.target.value)}
            className="w-full bg-[#18191c] border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:border-blue-500 outline-none mt-1"
          />
        </div>
      </div>

      {/* SECTION 3: CELESTIAL CONTROLS */}
      <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
        <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
          <Sliders className="w-3.5 h-3.5 text-emerald-400" />
          Celestial Sky Features
        </label>

        <div>
          <div className="flex justify-between text-xs text-neutral-400 mb-1.5">
            <span>Star Field Density</span>
            <span className="font-mono text-white">{starCount} stars</span>
          </div>
          <input
            type="range"
            min="80"
            max="300"
            value={starCount}
            onChange={e => setStarCount(Number(e.target.value))}
            className="w-full accent-blue-500 cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-neutral-300">Show Constellations</span>
          <input
            type="checkbox"
            checked={showConstellations}
            onChange={e => setShowConstellations(e.target.checked)}
            className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-neutral-300">Show Celestial Grid</span>
          <input
            type="checkbox"
            checked={showGrid}
            onChange={e => setShowGrid(e.target.checked)}
            className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
          />
        </div>
      </div>

      {/* SECTION 4: COLOR THEMES */}
      <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
        <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
          <Palette className="w-3.5 h-3.5 text-pink-400" />
          Night Sky Color Themes
        </label>
        <div className="grid grid-cols-2 gap-2">
          {STARMAP_THEMES.map(th => (
            <button
              key={th.name}
              onClick={() => {
                setBgColor(th.bg);
                setDiscColor(th.disc);
                setTextColor(th.text);
                setSubColor(th.sub);
                setStarColor(th.star);
                setConstellationColor(th.con);
              }}
              className="flex items-center gap-2.5 p-2 rounded-lg bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-left transition-all group"
            >
              <div 
                className="w-5 h-5 rounded-full border border-neutral-700 shrink-0" 
                style={{ backgroundColor: th.disc }}
              />
              <span className="text-[11px] font-medium text-neutral-300 group-hover:text-white truncate">
                {th.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <ModernStudioLayout
      title="StarMap Sky Studio"
      category="Celestial Art"
      onBack={() => navigate('/')}
      onDownloadPNG={handleDownloadPNG}
      onDownloadPDF={handleDownloadPDF}
      isExporting={isExporting}
      presets={starmapPresetsList}
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
