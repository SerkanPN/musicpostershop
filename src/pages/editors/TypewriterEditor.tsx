import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import jsPDF from 'jspdf';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ModernStudioLayout, { PresetItem } from '../../components/ModernStudioLayout';
import { POSTER_PRESETS } from '../../lib/presets';
import { Sparkles, FileText, Type, Check } from 'lucide-react';

const TYPEWRITER_PRESETS_DATA: Record<string, any> = {
  'love-letter-typewriter': {
    salutation: 'MY DEAREST SARAH,',
    letterBody: 'If I had a single flower for every time I thought of you, I could walk forever in my garden. You are the poetry I never knew how to write, and the peace I always searched for. Thank you for filling every quiet corner of my world with warmth and light.',
    signoff: 'FOREVER YOURS,',
    signature: 'DANIEL',
    dateText: 'OCTOBER 14, 2026',
    bgColor: '#faf6eb',
    textColor: '#1c1917'
  }
};

export default function TypewriterEditor() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const presetParam = searchParams.get('preset') || 'love-letter-typewriter';

  const [activePreset, setActivePreset] = useState<string>(presetParam);
  const initial = TYPEWRITER_PRESETS_DATA[presetParam] || TYPEWRITER_PRESETS_DATA['love-letter-typewriter'];

  const [salutation, setSalutation] = useState(initial.salutation);
  const [letterBody, setLetterBody] = useState(initial.letterBody);
  const [signoff, setSignoff] = useState(initial.signoff);
  const [signature, setSignature] = useState(initial.signature);
  const [dateText, setDateText] = useState(initial.dateText);

  const [bgColor, setBgColor] = useState(initial.bgColor);
  const [textColor, setTextColor] = useState(initial.textColor);

  const [zoom, setZoom] = useState(1);
  const [printSize, setPrintSize] = useState('18x24');
  const [isExporting, setIsExporting] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Special+Elite&family=Caveat:wght@700&family=Inter:wght@400;600&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  const handlePresetSelect = (id: string) => {
    setActivePreset(id);
    const data = TYPEWRITER_PRESETS_DATA[id];
    if (data) {
      setSalutation(data.salutation);
      setLetterBody(data.letterBody);
      setSignoff(data.signoff);
      setSignature(data.signature);
      setDateText(data.dateText);
      setBgColor(data.bgColor);
      setTextColor(data.textColor);
    } else {
      const general = (POSTER_PRESETS.TYPEWRITER as any[]).find(p => p.id === id);
      if (general) {
        setSalutation(`DEAR ${general.label.toUpperCase()},`);
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

    // Antique Paper Background
    canvas.add(new fabric.Rect({
      left: 0, top: 0, width: w, height: h, fill: bgColor, selectable: false
    }));

    // Inset Margin
    canvas.add(new fabric.Rect({
      left: 45, top: 45, width: w - 90, height: h - 90, fill: 'transparent',
      stroke: textColor, strokeWidth: 0.5, opacity: 0.2, selectable: false
    }));

    let curY = 75;

    // Top Right Date
    canvas.add(new fabric.Textbox(dateText.toUpperCase(), {
      left: w - 245, top: curY, width: 190, textAlign: 'right', fontSize: 11,
      fontWeight: 600, fill: textColor, fontFamily: 'Special Elite, monospace', selectable: false
    }));
    curY += 45;

    // Salutation
    canvas.add(new fabric.Textbox(salutation, {
      left: 65, top: curY, width: w - 130, fontSize: 15, fontWeight: 700,
      fill: textColor, fontFamily: 'Special Elite, monospace', selectable: false
    }));
    curY += 40;

    // Letter Body (Typewriter Monospace with subtle realism)
    const bodyEl = new fabric.Textbox(letterBody, {
      left: 65, top: curY, width: w - 130, fontSize: 13, lineHeight: 1.6,
      fill: textColor, fontFamily: 'Special Elite, monospace', selectable: false
    });
    canvas.add(bodyEl);
    curY += bodyEl.height + 40;

    // Signoff
    canvas.add(new fabric.Textbox(signoff, {
      left: 65, top: curY, width: 200, fontSize: 12,
      fill: textColor, fontFamily: 'Special Elite, monospace', selectable: false
    }));
    curY += 24;

    // Handwritten Signature
    canvas.add(new fabric.Textbox(signature, {
      left: 65, top: curY, width: 200, fontSize: 26, fontWeight: '700',
      fill: textColor, fontFamily: 'Caveat, cursive', selectable: false
    }));

    // Wax Seal / Monogram Stamp on Bottom Right
    const stampX = w - 110;
    const stampY = curY + 15;
    canvas.add(new fabric.Circle({
      left: stampX - 25, top: stampY - 25, radius: 25,
      fill: '#991b1b', opacity: 0.85, selectable: false
    }));
    canvas.add(new fabric.Text('♥', {
      left: stampX, top: stampY, fontSize: 20, fill: '#fef2f2',
      originX: 'center', originY: 'center', selectable: false
    }));

    canvas.renderAll();
  };

  useEffect(() => {
    renderCanvas();
  }, [salutation, letterBody, signoff, signature, dateText, bgColor, textColor]);

  const handleDownloadPNG = () => {
    if (!fabricRef.current) return;
    setIsExporting(true);
    const dataUrl = fabricRef.current.toDataURL({ format: 'png', multiplier: 3 });
    const link = document.createElement('a');
    link.download = `typewriter-poster-${activePreset}.png`;
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
    pdf.save(`typewriter-poster-300dpi-${activePreset}.pdf`);
    setIsExporting(false);
  };

  const typewriterPresetsList: PresetItem[] = (POSTER_PRESETS.TYPEWRITER as any[]).map(p => ({
    id: p.id,
    title: p.label,
    label: p.category
  }));

  const sidebar = (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
        <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Choose Letter Preset ({typewriterPresetsList.length})
        </label>
        <select
          value={activePreset}
          onChange={e => handlePresetSelect(e.target.value)}
          className="w-full bg-[#18191c] border border-neutral-700 rounded-lg px-3 py-2.5 text-xs text-white focus:border-amber-500 outline-none"
        >
          {typewriterPresetsList.map(p => (
            <option key={p.id} value={p.id}>
              {p.title} ({p.label})
            </option>
          ))}
        </select>
      </div>

      <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
        <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
          <Type className="w-3.5 h-3.5 text-blue-400" />
          Typewritten Letter Contents
        </label>

        <div>
          <span className="text-[10px] text-neutral-500 uppercase font-semibold">Salutation</span>
          <input
            type="text"
            value={salutation}
            onChange={e => setSalutation(e.target.value)}
            className="w-full bg-[#18191c] border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:border-amber-500 outline-none mt-1"
          />
        </div>

        <div>
          <span className="text-[10px] text-neutral-500 uppercase font-semibold">Letter Text</span>
          <textarea
            value={letterBody}
            onChange={e => setLetterBody(e.target.value)}
            rows={5}
            className="w-full bg-[#18191c] border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:border-amber-500 outline-none mt-1 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] text-neutral-500 uppercase font-semibold">Signature</span>
            <input
              type="text"
              value={signature}
              onChange={e => setSignature(e.target.value)}
              className="w-full bg-[#18191c] border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-amber-500 outline-none mt-1"
            />
          </div>
          <div>
            <span className="text-[10px] text-neutral-500 uppercase font-semibold">Date</span>
            <input
              type="text"
              value={dateText}
              onChange={e => setDateText(e.target.value)}
              className="w-full bg-[#18191c] border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-amber-500 outline-none mt-1"
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <ModernStudioLayout
      title="Antique Typewriter Studio"
      category="Vintage Letter Art"
      onBack={() => navigate('/')}
      onDownloadPNG={handleDownloadPNG}
      onDownloadPDF={handleDownloadPDF}
      isExporting={isExporting}
      presets={typewriterPresetsList}
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
