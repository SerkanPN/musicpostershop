import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import jsPDF from 'jspdf';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ModernStudioLayout, { PresetItem } from '../../components/ModernStudioLayout';
import { POSTER_PRESETS } from '../../lib/presets';
import { Sparkles, Baby, Type, Check, Palette } from 'lucide-react';

const TODDLER_PRESETS_DATA: Record<string, any> = {
  'little-wildflower': {
    babyName: 'MAYA ROSE',
    birthDate: '14 MAY 2026',
    birthTime: '08:42 AM',
    weight: '3.42 KG (7 LBS 8 OZ)',
    height: '51 CM (20 INCHES)',
    quote: '"LITTLE WILDFLOWER, GROW AND BLOOM WILD & FREE"',
    bgColor: '#fdfbf7',
    textColor: '#292524',
    subColor: '#78716c',
    accentColor: '#fb7185'
  }
};

export default function ToddlerEditor() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const presetParam = searchParams.get('preset') || 'little-wildflower';

  const [activePreset, setActivePreset] = useState<string>(presetParam);
  const initial = TODDLER_PRESETS_DATA[presetParam] || TODDLER_PRESETS_DATA['little-wildflower'];

  const [babyName, setBabyName] = useState(initial.babyName);
  const [birthDate, setBirthDate] = useState(initial.birthDate);
  const [birthTime, setBirthTime] = useState(initial.birthTime);
  const [weight, setWeight] = useState(initial.weight);
  const [height, setHeight] = useState(initial.height);
  const [quote, setQuote] = useState(initial.quote);

  const [bgColor, setBgColor] = useState(initial.bgColor);
  const [textColor, setTextColor] = useState(initial.textColor);
  const [subColor, setSubColor] = useState(initial.subColor);
  const [accentColor, setAccentColor] = useState(initial.accentColor);

  const [zoom, setZoom] = useState(1);
  const [printSize, setPrintSize] = useState('18x24');
  const [isExporting, setIsExporting] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Inter:wght@400;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  const handlePresetSelect = (id: string) => {
    setActivePreset(id);
    const data = TODDLER_PRESETS_DATA[id];
    if (data) {
      setBabyName(data.babyName);
      setBirthDate(data.birthDate);
      setBirthTime(data.birthTime);
      setWeight(data.weight);
      setHeight(data.height);
      setQuote(data.quote);
      setBgColor(data.bgColor);
      setTextColor(data.textColor);
      setSubColor(data.subColor);
      setAccentColor(data.accentColor);
    } else {
      const general = (POSTER_PRESETS.TODDLER as any[]).find(p => p.id === id);
      if (general) {
        setBabyName(general.label.toUpperCase());
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

    // Nordic Background
    canvas.add(new fabric.Rect({
      left: 0, top: 0, width: w, height: h, fill: bgColor, selectable: false
    }));

    // Inset Margin
    canvas.add(new fabric.Rect({
      left: 36, top: 36, width: w - 72, height: h - 72, fill: 'transparent',
      stroke: textColor, strokeWidth: 0.5, opacity: 0.2, selectable: false
    }));

    let curY = 75;

    // Top Nursery Badge
    canvas.add(new fabric.Textbox('WELCOME TO THE WORLD', {
      left: w / 2, top: curY, width: w - 100, originX: 'center', textAlign: 'center',
      fontSize: 10, fontWeight: 700, fill: subColor, fontFamily: 'Inter, sans-serif',
      charSpacing: 220, selectable: false
    }));
    curY += 28;

    // Baby Name in Large Elegant Editorial Serif
    const nameEl = new fabric.Textbox(babyName.toUpperCase(), {
      left: w / 2, top: curY, width: w - 90, originX: 'center', textAlign: 'center',
      fontSize: 36, fontWeight: 900, fill: textColor, fontFamily: 'Playfair Display, serif',
      charSpacing: 60, selectable: false
    });
    canvas.add(nameEl);
    curY += nameEl.height + 12;

    // Date & Time
    canvas.add(new fabric.Textbox(`${birthDate.toUpperCase()}   •   ${birthTime.toUpperCase()}`, {
      left: w / 2, top: curY, width: w - 90, originX: 'center', textAlign: 'center',
      fontSize: 11, fontWeight: 600, fill: accentColor, fontFamily: 'Inter, sans-serif',
      charSpacing: 140, selectable: false
    }));
    curY += 36;

    // Scandinavian Botanical Icon / Moon Illustration
    const icx = w / 2;
    const icy = curY + 60;
    canvas.add(new fabric.Circle({
      left: icx - 45, top: icy - 45, radius: 45,
      fill: 'transparent', stroke: accentColor, strokeWidth: 1.5, opacity: 0.7,
      selectable: false
    }));
    canvas.add(new fabric.Text('★', {
      left: icx, top: icy, fontSize: 24, fill: accentColor,
      originX: 'center', originY: 'center', selectable: false
    }));
    curY += 140;

    // Stats Grid Box
    const boxW = 440;
    const boxH = 90;
    const boxX = (w - boxW) / 2;

    canvas.add(new fabric.Rect({
      left: boxX, top: curY, width: boxW, height: boxH, rx: 8, ry: 8,
      fill: '#f5f5f4', stroke: '#e7e5e4', strokeWidth: 0.75, selectable: false
    }));

    canvas.add(new fabric.Textbox('WEIGHT AT BIRTH', {
      left: boxX + 24, top: curY + 18, fontSize: 8.5, fontWeight: 700,
      fill: subColor, fontFamily: 'Inter, sans-serif', charSpacing: 120, selectable: false
    }));
    canvas.add(new fabric.Textbox(weight.toUpperCase(), {
      left: boxX + 24, top: curY + 40, fontSize: 13, fontWeight: 700,
      fill: textColor, fontFamily: 'Inter, sans-serif', selectable: false
    }));

    canvas.add(new fabric.Textbox('HEIGHT AT BIRTH', {
      left: boxX + 240, top: curY + 18, fontSize: 8.5, fontWeight: 700,
      fill: subColor, fontFamily: 'Inter, sans-serif', charSpacing: 120, selectable: false
    }));
    canvas.add(new fabric.Textbox(height.toUpperCase(), {
      left: boxX + 240, top: curY + 40, fontSize: 13, fontWeight: 700,
      fill: textColor, fontFamily: 'Inter, sans-serif', selectable: false
    }));

    curY += boxH + 36;

    // Nursery Quote / Blessing
    const quoteEl = new fabric.Textbox(quote, {
      left: w / 2, top: curY, width: w - 120, originX: 'center', textAlign: 'center',
      fontSize: 12, fontStyle: 'italic', fill: subColor, fontFamily: 'Playfair Display, serif',
      lineHeight: 1.4, selectable: false
    });
    canvas.add(quoteEl);

    canvas.renderAll();
  };

  useEffect(() => {
    renderCanvas();
  }, [babyName, birthDate, birthTime, weight, height, quote, bgColor, textColor, subColor, accentColor]);

  const handleDownloadPNG = () => {
    if (!fabricRef.current) return;
    setIsExporting(true);
    const dataUrl = fabricRef.current.toDataURL({ format: 'png', multiplier: 3 });
    const link = document.createElement('a');
    link.download = `toddler-poster-${activePreset}.png`;
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
    pdf.save(`toddler-poster-300dpi-${activePreset}.pdf`);
    setIsExporting(false);
  };

  const toddlerPresetsList: PresetItem[] = (POSTER_PRESETS.TODDLER as any[]).map(p => ({
    id: p.id,
    title: p.label,
    label: p.category
  }));

  const sidebar = (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
        <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-pink-400" />
          Choose Nursery Preset ({toddlerPresetsList.length})
        </label>
        <select
          value={activePreset}
          onChange={e => handlePresetSelect(e.target.value)}
          className="w-full bg-[#18191c] border border-neutral-700 rounded-lg px-3 py-2.5 text-xs text-white focus:border-pink-500 outline-none"
        >
          {toddlerPresetsList.map(p => (
            <option key={p.id} value={p.id}>
              {p.title} ({p.label})
            </option>
          ))}
        </select>
      </div>

      <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
        <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
          <Baby className="w-3.5 h-3.5 text-rose-400" />
          Baby Details & Birth Stats
        </label>

        <div>
          <span className="text-[10px] text-neutral-500 uppercase font-semibold">Baby Full Name</span>
          <input
            type="text"
            value={babyName}
            onChange={e => setBabyName(e.target.value)}
            className="w-full bg-[#18191c] border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white font-bold focus:border-pink-500 outline-none mt-1"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] text-neutral-500 uppercase font-semibold">Birth Date</span>
            <input
              type="text"
              value={birthDate}
              onChange={e => setBirthDate(e.target.value)}
              className="w-full bg-[#18191c] border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-pink-500 outline-none mt-1"
            />
          </div>
          <div>
            <span className="text-[10px] text-neutral-500 uppercase font-semibold">Birth Time</span>
            <input
              type="text"
              value={birthTime}
              onChange={e => setBirthTime(e.target.value)}
              className="w-full bg-[#18191c] border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-pink-500 outline-none mt-1"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] text-neutral-500 uppercase font-semibold">Weight</span>
            <input
              type="text"
              value={weight}
              onChange={e => setWeight(e.target.value)}
              className="w-full bg-[#18191c] border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-pink-500 outline-none mt-1"
            />
          </div>
          <div>
            <span className="text-[10px] text-neutral-500 uppercase font-semibold">Height / Length</span>
            <input
              type="text"
              value={height}
              onChange={e => setHeight(e.target.value)}
              className="w-full bg-[#18191c] border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-pink-500 outline-none mt-1"
            />
          </div>
        </div>

        <div>
          <span className="text-[10px] text-neutral-500 uppercase font-semibold">Nursery Blessing / Quote</span>
          <textarea
            value={quote}
            onChange={e => setQuote(e.target.value)}
            rows={2}
            className="w-full bg-[#18191c] border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:border-pink-500 outline-none mt-1 resize-none"
          />
        </div>
      </div>
    </div>
  );

  return (
    <ModernStudioLayout
      title="Nordic Nursery Studio"
      category="Baby Milestone Art"
      onBack={() => navigate('/')}
      onDownloadPNG={handleDownloadPNG}
      onDownloadPDF={handleDownloadPDF}
      isExporting={isExporting}
      presets={toddlerPresetsList}
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
