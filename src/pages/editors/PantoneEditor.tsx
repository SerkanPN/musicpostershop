import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import jsPDF from 'jspdf';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ModernStudioLayout, { PresetItem } from '../../components/ModernStudioLayout';
import { POSTER_PRESETS } from '../../lib/presets';
import { Sparkles, Palette, Type, Check } from 'lucide-react';

const PANTONE_PRESETS_DATA: Record<string, any> = {
  'sunset-serenade-pantone': {
    colorCode: 'PANTONE 18-1662 TCX',
    colorName: 'FLAME SCARLET',
    cmyk: 'C: 0%  M: 88%  Y: 82%  K: 0%',
    rgb: 'R: 244  G: 63  B: 94',
    meaning: 'PASSION • ADVENTURE • UNCONDITIONAL LOVE',
    swatchColor: '#f43f5e',
    bgColor: '#ffffff',
    textColor: '#18181b'
  },
  'sage-green-pantone': {
    colorCode: 'PANTONE 16-0421 TCX',
    colorName: 'SAGE OASIS',
    cmyk: 'C: 45%  M: 10%  Y: 48%  K: 12%',
    rgb: 'R: 132  G: 169  B: 140',
    meaning: 'SERENITY • BALANCE • INNER PEACE',
    swatchColor: '#84a98c',
    bgColor: '#ffffff',
    textColor: '#18181b'
  }
};

export default function PantoneEditor() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const presetParam = searchParams.get('preset') || 'sunset-serenade-pantone';

  const [activePreset, setActivePreset] = useState<string>(presetParam);
  const initial = PANTONE_PRESETS_DATA[presetParam] || PANTONE_PRESETS_DATA['sunset-serenade-pantone'];

  const [colorCode, setColorCode] = useState(initial.colorCode);
  const [colorName, setColorName] = useState(initial.colorName);
  const [cmyk, setCmyk] = useState(initial.cmyk);
  const [rgb, setRgb] = useState(initial.rgb);
  const [meaning, setMeaning] = useState(initial.meaning);
  const [swatchColor, setSwatchColor] = useState(initial.swatchColor);

  const [zoom, setZoom] = useState(1);
  const [printSize, setPrintSize] = useState('18x24');
  const [isExporting, setIsExporting] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&family=Space+Mono:wght@400;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  const handlePresetSelect = (id: string) => {
    setActivePreset(id);
    const data = PANTONE_PRESETS_DATA[id];
    if (data) {
      setColorCode(data.colorCode);
      setColorName(data.colorName);
      setCmyk(data.cmyk);
      setRgb(data.rgb);
      setMeaning(data.meaning);
      setSwatchColor(data.swatchColor);
    } else {
      const general = (POSTER_PRESETS.PANTONE as any[]).find(p => p.id === id);
      if (general) {
        setColorName(general.label.toUpperCase());
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
        backgroundColor: '#ffffff',
        selection: false
      });
    }

    const canvas = fabricRef.current;
    canvas.clear();

    const w = 600;
    const h = 800;

    // White Card Background
    canvas.add(new fabric.Rect({
      left: 0, top: 0, width: w, height: h, fill: '#ffffff', selectable: false
    }));

    // Large Pantone Color Swatch Block
    const swH = 540;
    canvas.add(new fabric.Rect({
      left: 45, top: 45, width: w - 90, height: swH,
      fill: swatchColor, rx: 2, ry: 2, selectable: false
    }));

    // Pantone Card Typography
    let curY = 45 + swH + 28;

    canvas.add(new fabric.Textbox(colorCode.toUpperCase(), {
      left: 45, top: curY, fontSize: 13, fontWeight: 700, fill: '#71717a',
      fontFamily: 'Inter, sans-serif', charSpacing: 80, selectable: false
    }));
    curY += 24;

    canvas.add(new fabric.Textbox(colorName.toUpperCase(), {
      left: 45, top: curY, width: w - 90, fontSize: 32, fontWeight: 900,
      fill: '#18181b', fontFamily: 'Inter, sans-serif', charSpacing: 40, selectable: false
    }));
    curY += 44;

    canvas.add(new fabric.Textbox(`${cmyk}   •   ${rgb}`, {
      left: 45, top: curY, fontSize: 10, fontWeight: 600, fill: '#71717a',
      fontFamily: 'Space Mono, monospace', selectable: false
    }));
    curY += 20;

    canvas.add(new fabric.Textbox(meaning.toUpperCase(), {
      left: 45, top: curY, width: w - 90, fontSize: 9, fontWeight: 700,
      fill: '#a1a1aa', fontFamily: 'Inter, sans-serif', charSpacing: 120, selectable: false
    }));

    canvas.renderAll();
  };

  useEffect(() => {
    renderCanvas();
  }, [colorCode, colorName, cmyk, rgb, meaning, swatchColor]);

  const handleDownloadPNG = () => {
    if (!fabricRef.current) return;
    setIsExporting(true);
    const dataUrl = fabricRef.current.toDataURL({ format: 'png', multiplier: 3 });
    const link = document.createElement('a');
    link.download = `pantone-poster-${activePreset}.png`;
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
    pdf.save(`pantone-poster-300dpi-${activePreset}.pdf`);
    setIsExporting(false);
  };

  const pantonePresetsList: PresetItem[] = (POSTER_PRESETS.PANTONE as any[]).map(p => ({
    id: p.id,
    title: p.label,
    label: p.category
  }));

  const sidebar = (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
        <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-pink-400" />
          Choose Palette Preset ({pantonePresetsList.length})
        </label>
        <select
          value={activePreset}
          onChange={e => handlePresetSelect(e.target.value)}
          className="w-full bg-[#18191c] border border-neutral-700 rounded-lg px-3 py-2.5 text-xs text-white focus:border-pink-500 outline-none"
        >
          {pantonePresetsList.map(p => (
            <option key={p.id} value={p.id}>
              {p.title} ({p.label})
            </option>
          ))}
        </select>
      </div>

      <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
        <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
          <Palette className="w-3.5 h-3.5 text-rose-400" />
          Color Details & Swatch
        </label>

        <div className="flex items-center justify-between">
          <span className="text-xs text-neutral-300 font-medium">Swatch Color</span>
          <input
            type="color"
            value={swatchColor}
            onChange={e => setSwatchColor(e.target.value)}
            className="w-8 h-8 rounded-lg bg-transparent cursor-pointer border border-neutral-700"
          />
        </div>

        <div>
          <span className="text-[10px] text-neutral-500 uppercase font-semibold">Color Code / Standard</span>
          <input
            type="text"
            value={colorCode}
            onChange={e => setColorCode(e.target.value)}
            className="w-full bg-[#18191c] border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:border-pink-500 outline-none mt-1"
          />
        </div>

        <div>
          <span className="text-[10px] text-neutral-500 uppercase font-semibold">Color Name</span>
          <input
            type="text"
            value={colorName}
            onChange={e => setColorName(e.target.value)}
            className="w-full bg-[#18191c] border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white font-bold focus:border-pink-500 outline-none mt-1"
          />
        </div>

        <div>
          <span className="text-[10px] text-neutral-500 uppercase font-semibold">Meaning / Emotion</span>
          <input
            type="text"
            value={meaning}
            onChange={e => setMeaning(e.target.value)}
            className="w-full bg-[#18191c] border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:border-pink-500 outline-none mt-1"
          />
        </div>
      </div>
    </div>
  );

  return (
    <ModernStudioLayout
      title="Pantone Color Swatch Studio"
      category="Designer Wall Art"
      onBack={() => navigate('/')}
      onDownloadPNG={handleDownloadPNG}
      onDownloadPDF={handleDownloadPDF}
      isExporting={isExporting}
      presets={pantonePresetsList}
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
