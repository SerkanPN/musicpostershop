import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import jsPDF from 'jspdf';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ModernStudioLayout, { PresetItem } from '../../components/ModernStudioLayout';
import { POSTER_PRESETS } from '../../lib/presets';
import { 
  Sparkles, MapPin, Compass, Sliders, Palette, Type, Check
} from 'lucide-react';

const COORD_PRESET_DATA: Record<string, any> = {
  'first-home': {
    location: 'KENSINGTON, LONDON',
    lat: '51°30\'05.0"N',
    lng: '0°11\'31.6"W',
    caption: 'OUR FIRST HOME',
    sub: 'WHERE OUR ADVENTURE CONTINUED',
    footer: 'ESTABLISHED 24.08.2026',
    bgColor: '#fcfbf7',
    textColor: '#1c1917',
    subColor: '#78716c',
    ringColor: '#1c1917'
  },
  'where-we-met': {
    location: 'CENTRAL PARK, NEW YORK',
    lat: '40°46\'56.4"N',
    lng: '73°58\'20.2"W',
    caption: 'WHERE IT ALL BEGAN',
    sub: 'THE MOMENT EVERYTHING CHANGED',
    footer: '14 OCTOBER 2020',
    bgColor: '#0c0a09',
    textColor: '#fafaf9',
    subColor: '#a8a29e',
    ringColor: '#f43f5e'
  },
  'the-proposal-spot': {
    location: 'SANTORINI, GREECE',
    lat: '36°27\'43.2"N',
    lng: '25°22\'26.4"E',
    caption: 'SHE SAID YES',
    sub: 'UNDER THE AEGEAN SUNSET',
    footer: '18 JUNE 2025',
    bgColor: '#0f172a',
    textColor: '#f8fafc',
    subColor: '#94a3b8',
    ringColor: '#38bdf8'
  },
  'mountain-summit-map': {
    location: 'MATTERHORN, SWITZERLAND',
    lat: '45°58\'35.0"N',
    lng: '7°39\'30.0"E',
    caption: 'SUMMIT REACHED • 4,478 M',
    sub: 'NEVER STOP CLIMBING',
    footer: 'AUGUST 2026',
    bgColor: '#ffffff',
    textColor: '#09090b',
    subColor: '#71717a',
    ringColor: '#18181b'
  }
};

const COORD_THEMES = [
  { name: 'Warm Ivory', bg: '#fcfbf7', text: '#1c1917', sub: '#78716c', ring: '#1c1917' },
  { name: 'Midnight Onyx', bg: '#0c0a09', text: '#fafaf9', sub: '#a8a29e', ring: '#f43f5e' },
  { name: 'Aegean Blue', bg: '#0f172a', text: '#f8fafc', sub: '#94a3b8', ring: '#38bdf8' },
  { name: 'Pure Minimal', bg: '#ffffff', text: '#09090b', sub: '#71717a', ring: '#09090b' },
  { name: 'Sage Linen', bg: '#f4f7f4', text: '#14532d', sub: '#166534', ring: '#15803d' }
];

export default function CoordinatesEditor() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const presetParam = searchParams.get('preset') || 'first-home';

  const [activePreset, setActivePreset] = useState<string>(presetParam);
  const initial = COORD_PRESET_DATA[presetParam] || COORD_PRESET_DATA['first-home'];

  const [location, setLocation] = useState(initial.location);
  const [lat, setLat] = useState(initial.lat);
  const [lng, setLng] = useState(initial.lng);
  const [caption, setCaption] = useState(initial.caption);
  const [sub, setSub] = useState(initial.sub);
  const [footer, setFooter] = useState(initial.footer);

  const [bgColor, setBgColor] = useState(initial.bgColor);
  const [textColor, setTextColor] = useState(initial.textColor);
  const [subColor, setSubColor] = useState(initial.subColor);
  const [ringColor, setRingColor] = useState(initial.ringColor);

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
    const data = COORD_PRESET_DATA[id];
    if (data) {
      setLocation(data.location);
      setLat(data.lat);
      setLng(data.lng);
      setCaption(data.caption);
      setSub(data.sub);
      setFooter(data.footer);
      setBgColor(data.bgColor);
      setTextColor(data.textColor);
      setSubColor(data.subColor);
      setRingColor(data.ringColor);
    } else {
      const general = (POSTER_PRESETS.COORDINATES as any[]).find(p => p.id === id);
      if (general) {
        setCaption(general.label.toUpperCase());
      }
    }
  };

  // Render Modern Coordinates Map Poster
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

    // Inset Thin Frame Border
    const inset = new fabric.Rect({
      left: 36, top: 36, width: w - 72, height: h - 72, fill: 'transparent',
      stroke: textColor, strokeWidth: 0.5, opacity: 0.2, selectable: false
    });
    canvas.add(inset);

    // 2. Map Circle Center Graphic
    const mapCenter = { x: w / 2, y: h * 0.42 };
    const mapRadius = 190;

    // Outer Circle Ring
    const outerRing = new fabric.Circle({
      left: mapCenter.x - mapRadius, top: mapCenter.y - mapRadius,
      radius: mapRadius, fill: 'transparent', stroke: ringColor, strokeWidth: 1.5,
      opacity: 0.85, selectable: false
    });
    canvas.add(outerRing);

    // Inner Secondary Ring
    const innerRing = new fabric.Circle({
      left: mapCenter.x - mapRadius + 8, top: mapCenter.y - mapRadius + 8,
      radius: mapRadius - 8, fill: 'transparent', stroke: ringColor, strokeWidth: 0.6,
      opacity: 0.35, selectable: false
    });
    canvas.add(innerRing);

    // Crosshairs Grid Lines
    const hLine = new fabric.Line([mapCenter.x - mapRadius + 20, mapCenter.y, mapCenter.x + mapRadius - 20, mapCenter.y], {
      stroke: ringColor, strokeWidth: 0.5, strokeDashArray: [3, 3], opacity: 0.35, selectable: false
    });
    canvas.add(hLine);

    const vLine = new fabric.Line([mapCenter.x, mapCenter.y - mapRadius + 20, mapCenter.x, mapCenter.y + mapRadius - 20], {
      stroke: ringColor, strokeWidth: 0.5, strokeDashArray: [3, 3], opacity: 0.35, selectable: false
    });
    canvas.add(vLine);

    // Compass Cardinal Marks (N, S, E, W)
    canvas.add(new fabric.Text('N', {
      left: mapCenter.x, top: mapCenter.y - mapRadius - 14,
      fontSize: 10, fontWeight: '700', fill: textColor, fontFamily: 'Inter, sans-serif',
      originX: 'center', originY: 'center', selectable: false
    }));
    canvas.add(new fabric.Text('S', {
      left: mapCenter.x, top: mapCenter.y + mapRadius + 14,
      fontSize: 10, fontWeight: '700', fill: textColor, fontFamily: 'Inter, sans-serif',
      originX: 'center', originY: 'center', selectable: false
    }));
    canvas.add(new fabric.Text('E', {
      left: mapCenter.x + mapRadius + 14, top: mapCenter.y,
      fontSize: 10, fontWeight: '700', fill: textColor, fontFamily: 'Inter, sans-serif',
      originX: 'center', originY: 'center', selectable: false
    }));
    canvas.add(new fabric.Text('W', {
      left: mapCenter.x - mapRadius - 14, top: mapCenter.y,
      fontSize: 10, fontWeight: '700', fill: textColor, fontFamily: 'Inter, sans-serif',
      originX: 'center', originY: 'center', selectable: false
    }));

    // Center Coordinate Pin
    const pinCircle = new fabric.Circle({
      left: mapCenter.x - 4, top: mapCenter.y - 4, radius: 4,
      fill: ringColor, selectable: false
    });
    canvas.add(pinCircle);

    // 3. Bottom Editorial Typography
    let curY = h * 0.71;

    const locEl = new fabric.Textbox(location.toUpperCase(), {
      left: w / 2, top: curY, width: w - 90, originX: 'center', textAlign: 'center',
      fontSize: 26, fontWeight: 700, fill: textColor, fontFamily: 'Playfair Display, serif',
      charSpacing: 80, selectable: false
    });
    canvas.add(locEl);
    curY += locEl.height + 6;

    const coordBadge = new fabric.Textbox(`${lat}   •   ${lng}`, {
      left: w / 2, top: curY, width: w - 90, originX: 'center', textAlign: 'center',
      fontSize: 11, fontWeight: 600, fill: subColor, fontFamily: 'Space Mono, monospace',
      charSpacing: 100, selectable: false
    });
    canvas.add(coordBadge);
    curY += coordBadge.height + 14;

    const divider = new fabric.Line([w/2 - 25, curY, w/2 + 25, curY], {
      stroke: textColor, strokeWidth: 1, opacity: 0.3, selectable: false
    });
    canvas.add(divider);
    curY += 14;

    const captionEl = new fabric.Textbox(caption.toUpperCase(), {
      left: w / 2, top: curY, width: w - 100, originX: 'center', textAlign: 'center',
      fontSize: 11, fontWeight: 700, fill: textColor, fontFamily: 'Inter, sans-serif',
      charSpacing: 160, selectable: false
    });
    canvas.add(captionEl);
    curY += captionEl.height + 4;

    const subEl = new fabric.Textbox(sub, {
      left: w / 2, top: curY, width: w - 100, originX: 'center', textAlign: 'center',
      fontSize: 10.5, fontStyle: 'italic', fill: textColor, fontFamily: 'Playfair Display, serif',
      selectable: false
    });
    canvas.add(subEl);
    curY += subEl.height + 4;

    const footerEl = new fabric.Textbox(footer.toUpperCase(), {
      left: w / 2, top: curY, width: w - 100, originX: 'center', textAlign: 'center',
      fontSize: 8.5, fontWeight: 600, fill: subColor, fontFamily: 'Inter, sans-serif',
      charSpacing: 140, selectable: false
    });
    canvas.add(footerEl);

    canvas.renderAll();
  };

  useEffect(() => {
    renderCanvas();
  }, [location, lat, lng, caption, sub, footer, bgColor, textColor, subColor, ringColor]);

  const handleDownloadPNG = () => {
    if (!fabricRef.current) return;
    setIsExporting(true);
    const dataUrl = fabricRef.current.toDataURL({ format: 'png', multiplier: 3 });
    const link = document.createElement('a');
    link.download = `coordinates-poster-${activePreset}.png`;
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
    pdf.save(`coordinates-poster-300dpi-${activePreset}.pdf`);
    setIsExporting(false);
  };

  const coordPresetsList: PresetItem[] = (POSTER_PRESETS.COORDINATES as any[]).map(p => ({
    id: p.id,
    title: p.label,
    label: p.category
  }));

  const sidebar = (
    <div className="space-y-6">
      {/* SECTION 1: PRESET CHOOSER */}
      <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
        <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-rose-400" />
          Choose Coordinates Preset ({coordPresetsList.length})
        </label>
        <select
          value={activePreset}
          onChange={e => handlePresetSelect(e.target.value)}
          className="w-full bg-[#18191c] border border-neutral-700 rounded-lg px-3 py-2.5 text-xs text-white focus:border-rose-500 outline-none"
        >
          {coordPresetsList.map(p => (
            <option key={p.id} value={p.id}>
              {p.title} ({p.label})
            </option>
          ))}
        </select>
      </div>

      {/* SECTION 2: LOCATION & GPS */}
      <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
        <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-blue-400" />
          Location & GPS Coordinates
        </label>

        <div>
          <span className="text-[10px] text-neutral-500 uppercase font-semibold">Location Name / City</span>
          <input
            type="text"
            value={location}
            onChange={e => setLocation(e.target.value)}
            className="w-full bg-[#18191c] border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white font-semibold focus:border-rose-500 outline-none mt-1"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] text-neutral-500 uppercase font-semibold">Latitude</span>
            <input
              type="text"
              value={lat}
              onChange={e => setLat(e.target.value)}
              className="w-full bg-[#18191c] border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-rose-500 outline-none mt-1 font-mono"
            />
          </div>
          <div>
            <span className="text-[10px] text-neutral-500 uppercase font-semibold">Longitude</span>
            <input
              type="text"
              value={lng}
              onChange={e => setLng(e.target.value)}
              className="w-full bg-[#18191c] border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-rose-500 outline-none mt-1 font-mono"
            />
          </div>
        </div>
      </div>

      {/* SECTION 3: CAPTIONS & SUBTITLES */}
      <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
        <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
          <Type className="w-3.5 h-3.5 text-emerald-400" />
          Poster Captions
        </label>

        <div>
          <span className="text-[10px] text-neutral-500 uppercase font-semibold">Main Caption</span>
          <input
            type="text"
            value={caption}
            onChange={e => setCaption(e.target.value)}
            className="w-full bg-[#18191c] border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 outline-none mt-1"
          />
        </div>

        <div>
          <span className="text-[10px] text-neutral-500 uppercase font-semibold">Subtitle Quote</span>
          <input
            type="text"
            value={sub}
            onChange={e => setSub(e.target.value)}
            className="w-full bg-[#18191c] border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 outline-none mt-1"
          />
        </div>

        <div>
          <span className="text-[10px] text-neutral-500 uppercase font-semibold">Established / Date</span>
          <input
            type="text"
            value={footer}
            onChange={e => setFooter(e.target.value)}
            className="w-full bg-[#18191c] border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 outline-none mt-1"
          />
        </div>
      </div>

      {/* SECTION 4: COLOR THEMES */}
      <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
        <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
          <Palette className="w-3.5 h-3.5 text-pink-400" />
          Map Color Schemes
        </label>
        <div className="grid grid-cols-2 gap-2">
          {COORD_THEMES.map(th => (
            <button
              key={th.name}
              onClick={() => {
                setBgColor(th.bg);
                setTextColor(th.text);
                setSubColor(th.sub);
                setRingColor(th.ring);
              }}
              className="flex items-center gap-2.5 p-2 rounded-lg bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-left transition-all group"
            >
              <div 
                className="w-5 h-5 rounded-full border border-neutral-700 shrink-0" 
                style={{ backgroundColor: th.bg }}
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
      title="Coordinates Map Studio"
      category="Location Art"
      onBack={() => navigate('/')}
      onDownloadPNG={handleDownloadPNG}
      onDownloadPDF={handleDownloadPDF}
      isExporting={isExporting}
      presets={coordPresetsList}
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
