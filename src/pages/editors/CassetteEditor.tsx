import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import jsPDF from 'jspdf';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ModernStudioLayout, { PresetItem } from '../../components/ModernStudioLayout';
import { POSTER_PRESETS } from '../../lib/presets';
import { 
  Sparkles, Disc, Sliders, Palette, Type, Check, Music
} from 'lucide-react';

const CASSETTE_PRESET_DATA: Record<string, any> = {
  'synthwave-80s': {
    tapeTitle: '80s SYNTHWAVE MIXTAPE',
    sideText: 'SIDE A • 45 MIN',
    subText: 'RECORDED IN STEREO • HI-FI CASSETTE',
    tracks: '1. RESO - NIGHTCALL\n2. THE MIDNIGHT - SUNSET\n3. GUNSHIP - TECH NOIR\n4. KAVINSKY - DRIVE',
    dateText: 'SUMMER OF 1984',
    bgColor: '#09090b',
    cassetteColor: '#18181b',
    labelColor: '#f43f5e',
    textColor: '#ffffff',
    subColor: '#a1a1aa'
  },
  'lofi-study-tape': {
    tapeTitle: 'LATE NIGHT LO-FI BEATS',
    sideText: 'SIDE B • 60 MIN',
    subText: 'CHILLHOP RECORDS • CHILL VIBES ONLY',
    tracks: '1. RAIN OVER TOKYO\n2. COFFEE IN BED\n3. MIDNIGHT WALK\n4. STUDY SESSIONS',
    dateText: 'STUDY VOLUME 04',
    bgColor: '#faf6f0',
    cassetteColor: '#292524',
    labelColor: '#f59e0b',
    textColor: '#1c1917',
    subColor: '#78716c'
  },
  'road-trip-tape': {
    tapeTitle: 'COASTAL ROAD TRIP MIX',
    sideText: 'SIDE A • PACIFIC HIGHWAY',
    subText: 'FOR SARAH & DANIEL • KEEP ON DRIVING',
    tracks: '1. DREAMS - FLEETWOOD MAC\n2. HOTEL CALIFORNIA - EAGLES\n3. FAST CAR - TRACY CHAPMAN\n4. RIPTIDE - VANCE JOY',
    dateText: 'CALIFORNIA 2026',
    bgColor: '#0f172a',
    cassetteColor: '#1e293b',
    labelColor: '#38bdf8',
    textColor: '#f8fafc',
    subColor: '#94a3b8'
  }
};

export default function CassetteEditor() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const presetParam = searchParams.get('preset') || 'synthwave-80s';

  const [activePreset, setActivePreset] = useState<string>(presetParam);
  const initial = CASSETTE_PRESET_DATA[presetParam] || CASSETTE_PRESET_DATA['synthwave-80s'];

  const [tapeTitle, setTapeTitle] = useState(initial.tapeTitle);
  const [sideText, setSideText] = useState(initial.sideText);
  const [subText, setSubText] = useState(initial.subText);
  const [tracks, setTracks] = useState(initial.tracks);
  const [dateText, setDateText] = useState(initial.dateText);

  const [bgColor, setBgColor] = useState(initial.bgColor);
  const [cassetteColor, setCassetteColor] = useState(initial.cassetteColor);
  const [labelColor, setLabelColor] = useState(initial.labelColor);
  const [textColor, setTextColor] = useState(initial.textColor);
  const [subColor, setSubColor] = useState(initial.subColor);

  const [zoom, setZoom] = useState(1);
  const [printSize, setPrintSize] = useState('18x24');
  const [isExporting, setIsExporting] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&family=Space+Mono:wght@400;700&family=Inter:wght@400;600;700&family=Playfair+Display:wght@700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  const handlePresetSelect = (id: string) => {
    setActivePreset(id);
    const data = CASSETTE_PRESET_DATA[id];
    if (data) {
      setTapeTitle(data.tapeTitle);
      setSideText(data.sideText);
      setSubText(data.subText);
      setTracks(data.tracks);
      setDateText(data.dateText);
      setBgColor(data.bgColor);
      setCassetteColor(data.cassetteColor);
      setLabelColor(data.labelColor);
      setTextColor(data.textColor);
      setSubColor(data.subColor);
    } else {
      const general = (POSTER_PRESETS.CASSETTE as any[]).find(p => p.id === id);
      if (general) {
        setTapeTitle(general.label.toUpperCase());
      }
    }
  };

  // Render Realistic 80s Cassette Tape Wall Art
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

    // Inset Margin
    const inset = new fabric.Rect({
      left: 36, top: 36, width: w - 72, height: h - 72, fill: 'transparent',
      stroke: textColor, strokeWidth: 0.5, opacity: 0.2, selectable: false
    });
    canvas.add(inset);

    // 2. Realistic Cassette Tape Body
    const cw = 440;
    const ch = 280;
    const cx = (w - cw) / 2;
    const cy = h * 0.22;

    // Drop Shadow
    const tapeShadow = new fabric.Rect({
      left: cx + 6, top: cy + 8, width: cw, height: ch, rx: 16, ry: 16,
      fill: '#000000', opacity: 0.25, selectable: false
    });
    canvas.add(tapeShadow);

    // Cassette Plastic Shell
    const tapeShell = new fabric.Rect({
      left: cx, top: cy, width: cw, height: ch, rx: 16, ry: 16,
      fill: cassetteColor, stroke: '#3f3f46', strokeWidth: 1.5, selectable: false
    });
    canvas.add(tapeShell);

    // 4 Corner Screws
    const screws = [
      { x: cx + 18, y: cy + 18 }, { x: cx + cw - 18, y: cy + 18 },
      { x: cx + 18, y: cy + ch - 18 }, { x: cx + cw - 18, y: cy + ch - 18 }
    ];
    screws.forEach(sc => {
      const screwCircle = new fabric.Circle({
        left: sc.x - 5, top: sc.y - 5, radius: 5, fill: '#52525b', selectable: false
      });
      const screwSlot = new fabric.Line([sc.x - 3, sc.y, sc.x + 3, sc.y], {
        stroke: '#27272a', strokeWidth: 1, selectable: false
      });
      canvas.add(screwCircle);
      canvas.add(screwSlot);
    });

    // Paper Label Area
    const lw = cw - 50;
    const lh = ch - 80;
    const lx = cx + 25;
    const ly = cy + 30;

    const paperLabel = new fabric.Rect({
      left: lx, top: ly, width: lw, height: lh, rx: 8, ry: 8,
      fill: '#fcfbf7', stroke: '#e4e4e7', strokeWidth: 1, selectable: false
    });
    canvas.add(paperLabel);

    // Colored Accent Stripe
    const labelStripe = new fabric.Rect({
      left: lx, top: ly, width: lw, height: 32, rx: 8, ry: 8,
      fill: labelColor, opacity: 0.9, selectable: false
    });
    canvas.add(labelStripe);

    // Tape Title handwritten
    canvas.add(new fabric.Textbox(tapeTitle, {
      left: lx + 16, top: ly + 4, width: lw - 32, fontSize: 18,
      fontWeight: '700', fill: '#ffffff', fontFamily: 'Caveat, cursive', selectable: false
    }));

    // Tape Spool Window
    const winW = 180;
    const winH = 70;
    const winX = cx + (cw - winW) / 2;
    const winY = cy + (ch - winH) / 2 + 10;

    const tapeWin = new fabric.Rect({
      left: winX, top: winY, width: winW, height: winH, rx: 6, ry: 6,
      fill: '#18181b', stroke: '#52525b', strokeWidth: 1, selectable: false
    });
    canvas.add(tapeWin);

    // Left and Right Spool Teeth
    const leftSpool = new fabric.Circle({
      left: winX + 25, top: winY + winH/2 - 18, radius: 18,
      fill: '#ffffff', stroke: '#a1a1aa', strokeWidth: 1.5, selectable: false
    });
    const rightSpool = new fabric.Circle({
      left: winX + winW - 60, top: winY + winH/2 - 18, radius: 18,
      fill: '#ffffff', stroke: '#a1a1aa', strokeWidth: 1.5, selectable: false
    });
    canvas.add(leftSpool);
    canvas.add(rightSpool);

    // 3. Bottom Poster Typography & Tracklist
    let curY = h * 0.62;

    const mainTitleEl = new fabric.Textbox(tapeTitle.toUpperCase(), {
      left: w / 2, top: curY, width: w - 90, originX: 'center', textAlign: 'center',
      fontSize: 26, fontWeight: 700, fill: textColor, fontFamily: 'Space Mono, monospace',
      charSpacing: 80, selectable: false
    });
    canvas.add(mainTitleEl);
    curY += mainTitleEl.height + 4;

    const metaEl = new fabric.Textbox(`${sideText.toUpperCase()}   •   ${dateText.toUpperCase()}`, {
      left: w / 2, top: curY, width: w - 90, originX: 'center', textAlign: 'center',
      fontSize: 10, fontWeight: 600, fill: subColor, fontFamily: 'Inter, sans-serif',
      charSpacing: 140, selectable: false
    });
    canvas.add(metaEl);
    curY += metaEl.height + 14;

    const divider = new fabric.Line([w/2 - 25, curY, w/2 + 25, curY], {
      stroke: textColor, strokeWidth: 1, opacity: 0.3, selectable: false
    });
    canvas.add(divider);
    curY += 14;

    const tracksEl = new fabric.Textbox(tracks.toUpperCase(), {
      left: w / 2, top: curY, width: w - 120, originX: 'center', textAlign: 'center',
      fontSize: 9.5, lineHeight: 1.6, fill: textColor, fontFamily: 'Space Mono, monospace',
      selectable: false
    });
    canvas.add(tracksEl);

    canvas.renderAll();
  };

  useEffect(() => {
    renderCanvas();
  }, [
    tapeTitle, sideText, subText, tracks, dateText,
    bgColor, cassetteColor, labelColor, textColor, subColor
  ]);

  const handleDownloadPNG = () => {
    if (!fabricRef.current) return;
    setIsExporting(true);
    const dataUrl = fabricRef.current.toDataURL({ format: 'png', multiplier: 3 });
    const link = document.createElement('a');
    link.download = `cassette-poster-${activePreset}.png`;
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
    pdf.save(`cassette-poster-300dpi-${activePreset}.pdf`);
    setIsExporting(false);
  };

  const cassettePresetsList: PresetItem[] = (POSTER_PRESETS.CASSETTE as any[]).map(p => ({
    id: p.id,
    title: p.label,
    label: p.category
  }));

  const sidebar = (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
        <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Choose Cassette Preset ({cassettePresetsList.length})
        </label>
        <select
          value={activePreset}
          onChange={e => handlePresetSelect(e.target.value)}
          className="w-full bg-[#18191c] border border-neutral-700 rounded-lg px-3 py-2.5 text-xs text-white focus:border-amber-500 outline-none"
        >
          {cassettePresetsList.map(p => (
            <option key={p.id} value={p.id}>
              {p.title} ({p.label})
            </option>
          ))}
        </select>
      </div>

      <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
        <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
          <Disc className="w-3.5 h-3.5 text-rose-400" />
          Cassette & Track Details
        </label>

        <div>
          <span className="text-[10px] text-neutral-500 uppercase font-semibold">Mixtape Title</span>
          <input
            type="text"
            value={tapeTitle}
            onChange={e => setTapeTitle(e.target.value)}
            className="w-full bg-[#18191c] border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white font-semibold focus:border-amber-500 outline-none mt-1"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] text-neutral-500 uppercase font-semibold">Side / Duration</span>
            <input
              type="text"
              value={sideText}
              onChange={e => setSideText(e.target.value)}
              className="w-full bg-[#18191c] border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-amber-500 outline-none mt-1"
            />
          </div>
          <div>
            <span className="text-[10px] text-neutral-500 uppercase font-semibold">Year / Date</span>
            <input
              type="text"
              value={dateText}
              onChange={e => setDateText(e.target.value)}
              className="w-full bg-[#18191c] border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-amber-500 outline-none mt-1"
            />
          </div>
        </div>

        <div>
          <span className="text-[10px] text-neutral-500 uppercase font-semibold">Tracklist (Numbered)</span>
          <textarea
            value={tracks}
            onChange={e => setTracks(e.target.value)}
            rows={4}
            className="w-full bg-[#18191c] border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:border-amber-500 outline-none mt-1 resize-none"
          />
        </div>
      </div>
    </div>
  );

  return (
    <ModernStudioLayout
      title="Retro Cassette Mixtape Studio"
      category="80s Vintage Art"
      onBack={() => navigate('/')}
      onDownloadPNG={handleDownloadPNG}
      onDownloadPDF={handleDownloadPDF}
      isExporting={isExporting}
      presets={cassettePresetsList}
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
