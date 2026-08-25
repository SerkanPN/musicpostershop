import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import jsPDF from 'jspdf';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ModernStudioLayout, { PresetItem } from '../../components/ModernStudioLayout';
import { POSTER_PRESETS } from '../../lib/presets';
import { Sparkles, FileText, Palette, Type, Check } from 'lucide-react';

const PATENT_PRESETS_DATA: Record<string, any> = {
  'electric-guitar-patent': {
    patentNum: 'US PAT. 2,714,326',
    title: 'ELECTRIC GUITAR',
    inventor: 'LEO FENDER',
    filedDate: 'FILED MARCH 29, 1954',
    figText: 'FIG. 1',
    bgColor: '#0f172a',
    lineColor: '#38bdf8',
    textColor: '#f8fafc'
  },
  'coffee-maker-patent': {
    patentNum: 'US PAT. 1,607,854',
    title: 'ESPRESSO COFFEE MACHINE',
    inventor: 'L. BEZZERA',
    filedDate: 'FILED JUNE 15, 1901',
    figText: 'FIG. 1',
    bgColor: '#18181b',
    lineColor: '#fbbf24',
    textColor: '#ffffff'
  }
};

export default function PatentEditor() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const presetParam = searchParams.get('preset') || 'electric-guitar-patent';

  const [activePreset, setActivePreset] = useState<string>(presetParam);
  const initial = PATENT_PRESETS_DATA[presetParam] || PATENT_PRESETS_DATA['electric-guitar-patent'];

  const [patentNum, setPatentNum] = useState(initial.patentNum);
  const [title, setTitle] = useState(initial.title);
  const [inventor, setInventor] = useState(initial.inventor);
  const [filedDate, setFiledDate] = useState(initial.filedDate);

  const [bgColor, setBgColor] = useState(initial.bgColor);
  const [lineColor, setLineColor] = useState(initial.lineColor);
  const [textColor, setTextColor] = useState(initial.textColor);

  const [zoom, setZoom] = useState(1);
  const [printSize, setPrintSize] = useState('18x24');
  const [isExporting, setIsExporting] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Playfair+Display:wght@700&family=Inter:wght@400;600&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  const handlePresetSelect = (id: string) => {
    setActivePreset(id);
    const data = PATENT_PRESETS_DATA[id];
    if (data) {
      setPatentNum(data.patentNum);
      setTitle(data.title);
      setInventor(data.inventor);
      setFiledDate(data.filedDate);
      setBgColor(data.bgColor);
      setLineColor(data.lineColor);
      setTextColor(data.textColor);
    } else {
      const general = (POSTER_PRESETS.PATENT as any[]).find(p => p.id === id);
      if (general) {
        setTitle(general.label.toUpperCase());
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

    // Blueprint Grid Lines
    for (let i = 40; i < w; i += 40) {
      canvas.add(new fabric.Line([i, 30, i, h - 30], {
        stroke: lineColor, strokeWidth: 0.3, opacity: 0.15, selectable: false
      }));
    }
    for (let j = 40; j < h; j += 40) {
      canvas.add(new fabric.Line([30, j, w - 30, j], {
        stroke: lineColor, strokeWidth: 0.3, opacity: 0.15, selectable: false
      }));
    }

    // Outer Double Border
    canvas.add(new fabric.Rect({
      left: 36, top: 36, width: w - 72, height: h - 72, fill: 'transparent',
      stroke: lineColor, strokeWidth: 1.5, opacity: 0.8, selectable: false
    }));
    canvas.add(new fabric.Rect({
      left: 42, top: 42, width: w - 84, height: h - 84, fill: 'transparent',
      stroke: lineColor, strokeWidth: 0.5, opacity: 0.4, selectable: false
    }));

    // Header
    canvas.add(new fabric.Textbox('UNITED STATES PATENT OFFICE', {
      left: w / 2, top: 58, width: w - 100, originX: 'center', textAlign: 'center',
      fontSize: 10, fontWeight: 700, fill: textColor, fontFamily: 'Space Mono, monospace',
      charSpacing: 180, selectable: false
    }));

    canvas.add(new fabric.Textbox(patentNum, {
      left: w / 2, top: 82, width: w - 100, originX: 'center', textAlign: 'center',
      fontSize: 14, fontWeight: 700, fill: lineColor, fontFamily: 'Space Mono, monospace',
      charSpacing: 140, selectable: false
    }));

    canvas.add(new fabric.Textbox(`${inventor.toUpperCase()} • ${title.toUpperCase()}`, {
      left: w / 2, top: 110, width: w - 100, originX: 'center', textAlign: 'center',
      fontSize: 16, fontWeight: 700, fill: textColor, fontFamily: 'Space Mono, monospace',
      charSpacing: 80, selectable: false
    }));

    canvas.add(new fabric.Textbox(filedDate.toUpperCase(), {
      left: w / 2, top: 138, width: w - 100, originX: 'center', textAlign: 'center',
      fontSize: 9, fill: lineColor, fontFamily: 'Space Mono, monospace',
      charSpacing: 120, opacity: 0.8, selectable: false
    }));

    // Technical Blueprint Drawing Schematic
    const cx = w / 2;
    const cy = h * 0.52;

    canvas.add(new fabric.Rect({
      left: cx - 120, top: cy - 140, width: 240, height: 280,
      fill: 'transparent', stroke: lineColor, strokeWidth: 1, opacity: 0.6, selectable: false
    }));
    canvas.add(new fabric.Circle({
      left: cx - 70, top: cy - 70, radius: 70,
      fill: 'transparent', stroke: lineColor, strokeWidth: 1.2, opacity: 0.8, selectable: false
    }));
    canvas.add(new fabric.Line([cx - 100, cy, cx + 100, cy], {
      stroke: lineColor, strokeWidth: 0.8, strokeDashArray: [4, 4], opacity: 0.6, selectable: false
    }));
    canvas.add(new fabric.Line([cx, cy - 120, cx, cy + 120], {
      stroke: lineColor, strokeWidth: 0.8, strokeDashArray: [4, 4], opacity: 0.6, selectable: false
    }));

    canvas.add(new fabric.Textbox('FIG. 1', {
      left: cx, top: cy + 155, width: 100, originX: 'center', textAlign: 'center',
      fontSize: 11, fontWeight: 700, fill: lineColor, fontFamily: 'Space Mono, monospace', selectable: false
    }));

    // Bottom Signatures
    canvas.add(new fabric.Textbox(`INVENTOR: ${inventor.toUpperCase()}`, {
      left: 56, top: h - 75, fontSize: 8.5, fontWeight: 700, fill: textColor,
      fontFamily: 'Space Mono, monospace', selectable: false
    }));
    canvas.add(new fabric.Textbox('ATTORNEY: J. DOE & ASSOC.', {
      left: w - 240, top: h - 75, width: 184, textAlign: 'right', fontSize: 8.5,
      fontWeight: 700, fill: textColor, fontFamily: 'Space Mono, monospace', selectable: false
    }));

    canvas.renderAll();
  };

  useEffect(() => {
    renderCanvas();
  }, [patentNum, title, inventor, filedDate, bgColor, lineColor, textColor]);

  const handleDownloadPNG = () => {
    if (!fabricRef.current) return;
    setIsExporting(true);
    const dataUrl = fabricRef.current.toDataURL({ format: 'png', multiplier: 3 });
    const link = document.createElement('a');
    link.download = `patent-poster-${activePreset}.png`;
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
    pdf.save(`patent-poster-300dpi-${activePreset}.pdf`);
    setIsExporting(false);
  };

  const patentPresetsList: PresetItem[] = (POSTER_PRESETS.PATENT as any[]).map(p => ({
    id: p.id,
    title: p.label,
    label: p.category
  }));

  const sidebar = (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
        <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          Choose Patent Preset ({patentPresetsList.length})
        </label>
        <select
          value={activePreset}
          onChange={e => handlePresetSelect(e.target.value)}
          className="w-full bg-[#18191c] border border-neutral-700 rounded-lg px-3 py-2.5 text-xs text-white focus:border-blue-500 outline-none"
        >
          {patentPresetsList.map(p => (
            <option key={p.id} value={p.id}>
              {p.title} ({p.label})
            </option>
          ))}
        </select>
      </div>

      <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
        <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
          <FileText className="w-3.5 h-3.5 text-emerald-400" />
          Patent Specification
        </label>

        <div>
          <span className="text-[10px] text-neutral-500 uppercase font-semibold">Patent # / Reg</span>
          <input
            type="text"
            value={patentNum}
            onChange={e => setPatentNum(e.target.value)}
            className="w-full bg-[#18191c] border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-blue-500 outline-none mt-1"
          />
        </div>

        <div>
          <span className="text-[10px] text-neutral-500 uppercase font-semibold">Invention Title</span>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full bg-[#18191c] border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white font-semibold focus:border-blue-500 outline-none mt-1"
          />
        </div>

        <div>
          <span className="text-[10px] text-neutral-500 uppercase font-semibold">Inventor Name</span>
          <input
            type="text"
            value={inventor}
            onChange={e => setInventor(e.target.value)}
            className="w-full bg-[#18191c] border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:border-blue-500 outline-none mt-1"
          />
        </div>

        <div>
          <span className="text-[10px] text-neutral-500 uppercase font-semibold">Filing Date</span>
          <input
            type="text"
            value={filedDate}
            onChange={e => setFiledDate(e.target.value)}
            className="w-full bg-[#18191c] border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:border-blue-500 outline-none mt-1"
          />
        </div>
      </div>
    </div>
  );

  return (
    <ModernStudioLayout
      title="Vintage Patent Blueprint Studio"
      category="Technical Art"
      onBack={() => navigate('/')}
      onDownloadPNG={handleDownloadPNG}
      onDownloadPDF={handleDownloadPDF}
      isExporting={isExporting}
      presets={patentPresetsList}
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
