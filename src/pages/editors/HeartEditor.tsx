import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import jsPDF from 'jspdf';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ModernStudioLayout, { PresetItem } from '../../components/ModernStudioLayout';
import { POSTER_PRESETS } from '../../lib/presets';
import { Sparkles, Heart, Type, Check, Palette } from 'lucide-react';

const HEART_PRESETS_DATA: Record<string, any> = {
  'heart-vows-words': {
    names: 'SARAH & DANIEL',
    dateText: 'AUGUST 24, 2026',
    heartText: 'YOU ARE MY TODAY AND ALL OF MY TOMORROWS • I LOVE YOU WITH ALL MY HEART • FOREVER & ALWAYS • BEST FRIENDS • SOULMATES • OUR GREATEST ADVENTURE • HAND IN HAND • IN EVERY LIFETIME • YOU ARE MY HOME • MY SUNSHINE',
    subText: 'TWO HEARTS • ONE STORY',
    bgColor: '#fffdfa',
    heartColor: '#f43f5e',
    textColor: '#1c1917',
    subColor: '#78716c'
  }
};

export default function HeartEditor() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const presetParam = searchParams.get('preset') || 'heart-vows-words';

  const [activePreset, setActivePreset] = useState<string>(presetParam);
  const initial = HEART_PRESETS_DATA[presetParam] || HEART_PRESETS_DATA['heart-vows-words'];

  const [names, setNames] = useState(initial.names);
  const [dateText, setDateText] = useState(initial.dateText);
  const [heartText, setHeartText] = useState(initial.heartText);
  const [subText, setSubText] = useState(initial.subText);

  const [bgColor, setBgColor] = useState(initial.bgColor);
  const [heartColor, setHeartColor] = useState(initial.heartColor);
  const [textColor, setTextColor] = useState(initial.textColor);
  const [subColor, setSubColor] = useState(initial.subColor);

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
    const data = HEART_PRESETS_DATA[id];
    if (data) {
      setNames(data.names);
      setDateText(data.dateText);
      setHeartText(data.heartText);
      setSubText(data.subText);
      setBgColor(data.bgColor);
      setHeartColor(data.heartColor);
      setTextColor(data.textColor);
      setSubColor(data.subColor);
    } else {
      const general = (POSTER_PRESETS.HEART as any[]).find(p => p.id === id);
      if (general) {
        setNames(general.label.toUpperCase());
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
      stroke: textColor, strokeWidth: 0.5, opacity: 0.2, selectable: false
    }));

    // Heart Graphic Center
    const hcx = w / 2;
    const hcy = h * 0.40;

    // Outer silhouette heart
    const heartSvgPath = 'M 0,-60 A 45,45 0 0,0 -90,30 Q -90,90 0,160 Q 90,90 90,30 A 45,45 0 0,0 0,-60 Z';
    const heartObj = new fabric.Path(heartSvgPath, {
      left: hcx, top: hcy, fill: 'transparent', stroke: heartColor, strokeWidth: 1.5,
      originX: 'center', originY: 'center', scaleX: 1.6, scaleY: 1.6, selectable: false
    });
    canvas.add(heartObj);

    // Inner Typographic Heart Text Mask
    const wordsHeart = new fabric.Textbox(heartText.toUpperCase(), {
      left: hcx, top: hcy - 20, width: 220, originX: 'center', originY: 'center',
      textAlign: 'center', fontSize: 10, lineHeight: 1.4, fontWeight: 700,
      fill: heartColor, fontFamily: 'Inter, sans-serif', charSpacing: 80, selectable: false
    });
    canvas.add(wordsHeart);

    // Bottom Editorial Typography
    let curY = h * 0.72;

    const namesEl = new fabric.Textbox(names.toUpperCase(), {
      left: w / 2, top: curY, width: w - 90, originX: 'center', textAlign: 'center',
      fontSize: 28, fontWeight: 700, fill: textColor, fontFamily: 'Playfair Display, serif',
      charSpacing: 80, selectable: false
    });
    canvas.add(namesEl);
    curY += namesEl.height + 6;

    const dateEl = new fabric.Textbox(dateText.toUpperCase(), {
      left: w / 2, top: curY, width: w - 90, originX: 'center', textAlign: 'center',
      fontSize: 10, fontWeight: 600, fill: subColor, fontFamily: 'Inter, sans-serif',
      charSpacing: 160, selectable: false
    });
    canvas.add(dateEl);
    curY += dateEl.height + 14;

    canvas.add(new fabric.Line([w/2 - 25, curY, w/2 + 25, curY], {
      stroke: textColor, strokeWidth: 1, opacity: 0.3, selectable: false
    }));
    curY += 14;

    const subEl = new fabric.Textbox(subText.toUpperCase(), {
      left: w / 2, top: curY, width: w - 90, originX: 'center', textAlign: 'center',
      fontSize: 9, fontWeight: 600, fill: subColor, fontFamily: 'Inter, sans-serif',
      charSpacing: 180, selectable: false
    });
    canvas.add(subEl);

    canvas.renderAll();
  };

  useEffect(() => {
    renderCanvas();
  }, [names, dateText, heartText, subText, bgColor, heartColor, textColor, subColor]);

  const handleDownloadPNG = () => {
    if (!fabricRef.current) return;
    setIsExporting(true);
    const dataUrl = fabricRef.current.toDataURL({ format: 'png', multiplier: 3 });
    const link = document.createElement('a');
    link.download = `heart-poster-${activePreset}.png`;
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
    pdf.save(`heart-poster-300dpi-${activePreset}.pdf`);
    setIsExporting(false);
  };

  const heartPresetsList: PresetItem[] = (POSTER_PRESETS.HEART as any[]).map(p => ({
    id: p.id,
    title: p.label,
    label: p.category
  }));

  const sidebar = (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
        <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-rose-400" />
          Choose Heart Preset ({heartPresetsList.length})
        </label>
        <select
          value={activePreset}
          onChange={e => handlePresetSelect(e.target.value)}
          className="w-full bg-[#18191c] border border-neutral-700 rounded-lg px-3 py-2.5 text-xs text-white focus:border-rose-500 outline-none"
        >
          {heartPresetsList.map(p => (
            <option key={p.id} value={p.id}>
              {p.title} ({p.label})
            </option>
          ))}
        </select>
      </div>

      <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
        <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
          <Heart className="w-3.5 h-3.5 text-rose-400" />
          Heart Silhouette Text & Details
        </label>

        <div>
          <span className="text-[10px] text-neutral-500 uppercase font-semibold">Couple Names</span>
          <input
            type="text"
            value={names}
            onChange={e => setNames(e.target.value)}
            className="w-full bg-[#18191c] border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white font-semibold focus:border-rose-500 outline-none mt-1"
          />
        </div>

        <div>
          <span className="text-[10px] text-neutral-500 uppercase font-semibold">Date</span>
          <input
            type="text"
            value={dateText}
            onChange={e => setDateText(e.target.value)}
            className="w-full bg-[#18191c] border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-rose-500 outline-none mt-1"
          />
        </div>

        <div>
          <span className="text-[10px] text-neutral-500 uppercase font-semibold">Heart Typography Words</span>
          <textarea
            value={heartText}
            onChange={e => setHeartText(e.target.value)}
            rows={4}
            className="w-full bg-[#18191c] border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 outline-none mt-1 resize-none"
          />
        </div>
      </div>
    </div>
  );

  return (
    <ModernStudioLayout
      title="Heart Typography Studio"
      category="Romantic Art"
      onBack={() => navigate('/')}
      onDownloadPNG={handleDownloadPNG}
      onDownloadPDF={handleDownloadPDF}
      isExporting={isExporting}
      presets={heartPresetsList}
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
