import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import jsPDF from 'jspdf';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ModernStudioLayout, { PresetItem } from '../../components/ModernStudioLayout';
import { POSTER_PRESETS } from '../../lib/presets';
import { Sparkles, Image as ImageIcon, Palette, Type, Check } from 'lucide-react';

const POLAROID_PRESET_DATA: Record<string, any> = {
  'summer-memories-polaroid': {
    caption: 'that golden summer in amalfi',
    dateText: 'july 2026 • forever in my mind',
    subText: 'SARAH & DANIEL • MEMORIES THAT NEVER FADE',
    bgColor: '#faf6f0',
    cardColor: '#ffffff',
    textColor: '#1c1917'
  },
  'first-date-polaroid': {
    caption: 'the night we talked until 4am',
    dateText: 'table for two • central park bistro',
    subText: 'WHERE OUR STORY BEGAN',
    bgColor: '#0c0a09',
    cardColor: '#fcfbf7',
    textColor: '#1c1917'
  }
};

export default function PolaroidEditor() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const presetParam = searchParams.get('preset') || 'summer-memories-polaroid';

  const [activePreset, setActivePreset] = useState<string>(presetParam);
  const initial = POLAROID_PRESET_DATA[presetParam] || POLAROID_PRESET_DATA['summer-memories-polaroid'];

  const [caption, setCaption] = useState(initial.caption);
  const [dateText, setDateText] = useState(initial.dateText);
  const [subText, setSubText] = useState(initial.subText);
  const [bgColor, setBgColor] = useState(initial.bgColor);
  const [cardColor, setCardColor] = useState(initial.cardColor);

  const [zoom, setZoom] = useState(1);
  const [printSize, setPrintSize] = useState('18x24');
  const [isExporting, setIsExporting] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&family=Playfair+Display:ital,wght@0,700;1,400&family=Inter:wght@400;600&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  const handlePresetSelect = (id: string) => {
    setActivePreset(id);
    const data = POLAROID_PRESET_DATA[id];
    if (data) {
      setCaption(data.caption);
      setDateText(data.dateText);
      setSubText(data.subText);
      setBgColor(data.bgColor);
      setCardColor(data.cardColor);
    } else {
      const general = (POSTER_PRESETS.POLAROID as any[]).find(p => p.id === id);
      if (general) {
        setCaption(general.label.toLowerCase());
      }
    }
  };

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

    // Background
    canvas.add(new fabric.Rect({
      left: 0, top: 0, width: w, height: h, fill: bgColor, selectable: false
    }));

    // Inset Margin
    canvas.add(new fabric.Rect({
      left: 36, top: 36, width: w - 72, height: h - 72, fill: 'transparent',
      stroke: '#78716c', strokeWidth: 0.5, opacity: 0.2, selectable: false
    }));

    // Polaroid Frame Dimensions
    const pw = 420;
    const ph = 520;
    const px = (w - pw) / 2;
    const py = h * 0.14;

    // Subtle drop shadow
    canvas.add(new fabric.Rect({
      left: px + 6, top: py + 8, width: pw, height: ph, rx: 4, ry: 4,
      fill: '#000000', opacity: 0.18, selectable: false
    }));

    // Polaroid Card
    canvas.add(new fabric.Rect({
      left: px, top: py, width: pw, height: ph, rx: 4, ry: 4,
      fill: cardColor, stroke: '#e4e4e7', strokeWidth: 1, selectable: false
    }));

    // Tape Accent on Top
    canvas.add(new fabric.Rect({
      left: w/2 - 45, top: py - 12, width: 90, height: 24,
      fill: '#fef08a', opacity: 0.75, rx: 2, ry: 2, selectable: false
    }));

    // Photo Area
    const photoW = pw - 48;
    const photoH = 360;
    const photoX = px + 24;
    const photoY = py + 24;

    canvas.add(new fabric.Rect({
      left: photoX, top: photoY, width: photoW, height: photoH,
      fill: '#e7e5e4', stroke: '#d6d3d1', strokeWidth: 0.5, selectable: false
    }));

    // Photo Inner Silhouette
    canvas.add(new fabric.Circle({
      left: photoX + photoW/2 - 50, top: photoY + 90, radius: 50,
      fill: '#d6d3d1', selectable: false
    }));

    // Handwritten Caption below photo
    canvas.add(new fabric.Textbox(caption, {
      left: px + 28, top: photoY + photoH + 24, width: pw - 56,
      fontSize: 26, fontWeight: '700', fill: '#1c1917', fontFamily: 'Caveat, cursive',
      textAlign: 'center', selectable: false
    }));

    canvas.add(new fabric.Textbox(dateText, {
      left: px + 28, top: photoY + photoH + 68, width: pw - 56,
      fontSize: 15, fill: '#78716c', fontFamily: 'Caveat, cursive',
      textAlign: 'center', selectable: false
    }));

    // Bottom Poster Meta
    canvas.add(new fabric.Textbox(subText.toUpperCase(), {
      left: w / 2, top: h * 0.88, width: w - 100, originX: 'center', textAlign: 'center',
      fontSize: 9.5, fontWeight: 600, fill: '#78716c', fontFamily: 'Inter, sans-serif',
      charSpacing: 180, selectable: false
    }));

    canvas.renderAll();
  };

  useEffect(() => {
    renderCanvas();
  }, [caption, dateText, subText, bgColor, cardColor]);

  const handleDownloadPNG = () => {
    if (!fabricRef.current) return;
    setIsExporting(true);
    const dataUrl = fabricRef.current.toDataURL({ format: 'png', multiplier: 3 });
    const link = document.createElement('a');
    link.download = `polaroid-poster-${activePreset}.png`;
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
    pdf.save(`polaroid-poster-300dpi-${activePreset}.pdf`);
    setIsExporting(false);
  };

  const polaroidPresetsList: PresetItem[] = (POSTER_PRESETS.POLAROID as any[]).map(p => ({
    id: p.id,
    title: p.label,
    label: p.category
  }));

  const sidebar = (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
        <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-rose-400" />
          Choose Polaroid Preset ({polaroidPresetsList.length})
        </label>
        <select
          value={activePreset}
          onChange={e => handlePresetSelect(e.target.value)}
          className="w-full bg-[#18191c] border border-neutral-700 rounded-lg px-3 py-2.5 text-xs text-white focus:border-rose-500 outline-none"
        >
          {polaroidPresetsList.map(p => (
            <option key={p.id} value={p.id}>
              {p.title} ({p.label})
            </option>
          ))}
        </select>
      </div>

      <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
        <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
          <Type className="w-3.5 h-3.5 text-blue-400" />
          Polaroid Handwritten Caption
        </label>

        <div>
          <span className="text-[10px] text-neutral-500 uppercase font-semibold">Handwritten Note</span>
          <input
            type="text"
            value={caption}
            onChange={e => setCaption(e.target.value)}
            className="w-full bg-[#18191c] border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white font-semibold focus:border-rose-500 outline-none mt-1"
          />
        </div>

        <div>
          <span className="text-[10px] text-neutral-500 uppercase font-semibold">Date / Location</span>
          <input
            type="text"
            value={dateText}
            onChange={e => setDateText(e.target.value)}
            className="w-full bg-[#18191c] border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 outline-none mt-1"
          />
        </div>

        <div>
          <span className="text-[10px] text-neutral-500 uppercase font-semibold">Poster Footer Subtitle</span>
          <input
            type="text"
            value={subText}
            onChange={e => setSubText(e.target.value)}
            className="w-full bg-[#18191c] border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 outline-none mt-1"
          />
        </div>
      </div>
    </div>
  );

  return (
    <ModernStudioLayout
      title="Vintage Polaroid Studio"
      category="Photo Memory"
      onBack={() => navigate('/')}
      onDownloadPNG={handleDownloadPNG}
      onDownloadPDF={handleDownloadPDF}
      isExporting={isExporting}
      presets={polaroidPresetsList}
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
