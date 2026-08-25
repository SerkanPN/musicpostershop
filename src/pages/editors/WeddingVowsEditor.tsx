import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import jsPDF from 'jspdf';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ModernStudioLayout, { PresetItem } from '../../components/ModernStudioLayout';
import { 
  Sparkles, Heart, Sliders, Palette, Type, 
  Check, FileText
} from 'lucide-react';

const VOWS_PRESETS = [
  {
    id: 'wedding-vows-spiral',
    title: 'Wedding Vows Spiral',
    label: 'Vows',
    names: 'SARAH & DANIEL',
    dateText: 'AUGUST 24, 2026',
    venue: 'ST. IVES CHAPEL, CORNWALL',
    vowsText: "I take you to be my best friend, my faithful partner, and my one true love. I promise to encourage you, to inspire you, and to love you truly through good times and bad. I will forever be there to laugh with you, to lift you up when you are down, and to love you unconditionally through all of our adventures. Wherever our journey leads us, I will walk beside you hand in hand, today, tomorrow, and for all of our days to come.",
    bgColor: '#fdfbf7',
    textColor: '#1c1917',
    subColor: '#78716c',
    heartColor: '#e11d48'
  },
  {
    id: 'anniversary-promise',
    title: 'Anniversary Promise',
    label: 'Anniversary',
    names: 'EMILY & JAMES',
    dateText: '10 YEARS OF LOVE',
    venue: 'PARIS, FRANCE',
    vowsText: "Ten years ago I gave you my heart, and every single day since has proven it was the best decision of my life. Thank you for the laughter, the quiet mornings, the wild adventures, and for always being my home. I choose you today, I will choose you tomorrow, and I will choose you for all the lifetimes after this.",
    bgColor: '#0c0a09',
    textColor: '#fafaf9',
    subColor: '#a8a29e',
    heartColor: '#fb7185'
  },
  {
    id: 'unconditional-vows',
    title: 'Unconditional Vows',
    label: 'Romance',
    names: 'OLIVIA & ETHAN',
    dateText: 'SEPTEMBER 12, 2026',
    venue: 'TUSCANY, ITALY',
    vowsText: "You are my sunrise on dark days, my anchor in the storm, and my greatest joy in this world. In your eyes I have found home. I give you my hand, my heart, and my unconditional devotion, from this day forward and until the end of time.",
    bgColor: '#fffdfa',
    textColor: '#451a03',
    subColor: '#92400e',
    heartColor: '#b45309'
  }
];

export default function WeddingVowsEditor() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const presetParam = searchParams.get('preset') || 'wedding-vows-spiral';

  const [activePreset, setActivePreset] = useState<string>(presetParam);
  const initial = VOWS_PRESETS.find(p => p.id === presetParam) || VOWS_PRESETS[0];

  const [names, setNames] = useState(initial.names);
  const [dateText, setDateText] = useState(initial.dateText);
  const [venue, setVenue] = useState(initial.venue);
  const [vowsText, setVowsText] = useState(initial.vowsText);

  const [bgColor, setBgColor] = useState(initial.bgColor);
  const [textColor, setTextColor] = useState(initial.textColor);
  const [subColor, setSubColor] = useState(initial.subColor);
  const [heartColor, setHeartColor] = useState(initial.heartColor);

  const [zoom, setZoom] = useState(1);
  const [printSize, setPrintSize] = useState('18x24');
  const [isExporting, setIsExporting] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Cinzel:wght@400;700&family=Great+Vibes&family=Inter:wght@300;400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  const handlePresetSelect = (id: string) => {
    setActivePreset(id);
    const p = VOWS_PRESETS.find(item => item.id === id);
    if (p) {
      setNames(p.names);
      setDateText(p.dateText);
      setVenue(p.venue);
      setVowsText(p.vowsText);
      setBgColor(p.bgColor);
      setTextColor(p.textColor);
      setSubColor(p.subColor);
      setHeartColor(p.heartColor);
    }
  };

  // Render Wedding Vows Spiral Canvas
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

    // 2. Inset Thin Border Line
    const insetBorder = new fabric.Rect({
      left: 36, top: 36, width: w - 72, height: h - 72, fill: 'transparent',
      stroke: textColor, strokeWidth: 0.5, opacity: 0.2, selectable: false
    });
    canvas.add(insetBorder);

    let curY = 60;

    // 3. Top Header
    canvas.add(new fabric.Textbox('OUR WEDDING VOWS', {
      left: w / 2, top: curY, width: w - 100, originX: 'center', textAlign: 'center',
      fontSize: 10, fontWeight: 700, fill: subColor, fontFamily: 'Inter, sans-serif',
      charSpacing: 220, selectable: false
    }));
    curY += 24;

    const namesEl = new fabric.Textbox(names.toUpperCase(), {
      left: w / 2, top: curY, width: w - 100, originX: 'center', textAlign: 'center',
      fontSize: 26, fontWeight: 700, fill: textColor, fontFamily: 'Playfair Display, serif',
      charSpacing: 100, selectable: false
    });
    canvas.add(namesEl);
    curY += namesEl.height + 6;

    const dateEl = new fabric.Textbox(`${dateText.toUpperCase()}   •   ${venue.toUpperCase()}`, {
      left: w / 2, top: curY, width: w - 100, originX: 'center', textAlign: 'center',
      fontSize: 9, fontWeight: 600, fill: subColor, fontFamily: 'Inter, sans-serif',
      charSpacing: 140, selectable: false
    });
    canvas.add(dateEl);

    // 4. Vows Spiral Graphic (Concentric Rings Converging to Center)
    const spiralCenter = { x: w / 2, y: h * 0.56 };
    const words = vowsText.replace(/\n/g, ' ').split(' ');
    let wordIdx = 0;
    const ringRadii = [210, 185, 160, 135, 110, 85];

    ringRadii.forEach((r, rIdx) => {
      const circum = 2 * Math.PI * r;
      const ringWords: string[] = [];
      let curLen = 0;
      while (wordIdx < words.length && curLen < circum / 7.5) {
        ringWords.push(words[wordIdx]);
        curLen += words[wordIdx].length * 7 + 8;
        wordIdx++;
      }

      if (ringWords.length > 0) {
        const ringText = ringWords.join('   •   ');
        const chars = ringText.split('');
        const angleStep = (2 * Math.PI) / (chars.length + 4);

        chars.forEach((ch, cIdx) => {
          const angle = (cIdx * angleStep) - (Math.PI / 2) + (rIdx * 0.45);
          const cx = spiralCenter.x + (r * Math.cos(angle));
          const cy = spiralCenter.y + (r * Math.sin(angle));

          const charObj = new fabric.Text(ch, {
            left: cx, top: cy,
            fontSize: 8, fontWeight: '500',
            fill: textColor, opacity: 0.85,
            fontFamily: 'Inter, sans-serif',
            originX: 'center', originY: 'center',
            angle: (angle * 180 / Math.PI) + 90,
            selectable: false
          });
          canvas.add(charObj);
        });
      }
    });

    // Center Emblem Heart / Initials
    const centerCircle = new fabric.Circle({
      left: spiralCenter.x - 45, top: spiralCenter.y - 45, radius: 45,
      fill: bgColor, stroke: textColor, strokeWidth: 0.75, opacity: 0.8,
      selectable: false
    });
    canvas.add(centerCircle);

    // Center Monogram / Heart
    const centerHeart = new fabric.Text('♥', {
      left: spiralCenter.x, top: spiralCenter.y - 12,
      fontSize: 20, fill: heartColor, originX: 'center', originY: 'center',
      selectable: false
    });
    canvas.add(centerHeart);

    const centerForever = new fabric.Textbox('FOREVER', {
      left: spiralCenter.x, top: spiralCenter.y + 12, width: 80,
      originX: 'center', textAlign: 'center', fontSize: 7, fontWeight: 700,
      fill: textColor, fontFamily: 'Inter, sans-serif', charSpacing: 160, selectable: false
    });
    canvas.add(centerForever);

    // 5. Bottom Script Dedication
    const scriptEl = new fabric.Textbox('"With my whole heart for my whole life"', {
      left: w / 2, top: h * 0.89, width: w - 100, originX: 'center', textAlign: 'center',
      fontSize: 16, fontStyle: 'italic', fill: textColor, fontFamily: 'Playfair Display, serif',
      selectable: false
    });
    canvas.add(scriptEl);

    canvas.renderAll();
  };

  useEffect(() => {
    renderCanvas();
  }, [names, dateText, venue, vowsText, bgColor, textColor, subColor, heartColor]);

  const handleDownloadPNG = () => {
    if (!fabricRef.current) return;
    setIsExporting(true);
    const dataUrl = fabricRef.current.toDataURL({ format: 'png', multiplier: 3 });
    const link = document.createElement('a');
    link.download = `wedding-vows-poster-${activePreset}.png`;
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
    pdf.save(`wedding-vows-300dpi-${activePreset}.pdf`);
    setIsExporting(false);
  };

  const vowsPresetsList: PresetItem[] = VOWS_PRESETS.map(p => ({
    id: p.id,
    title: p.title,
    label: p.label
  }));

  const sidebar = (
    <div className="space-y-6">
      {/* SECTION 1: PRESET CHOOSER */}
      <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
        <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-rose-400" />
          Choose Vows Preset ({vowsPresetsList.length})
        </label>
        <select
          value={activePreset}
          onChange={e => handlePresetSelect(e.target.value)}
          className="w-full bg-[#18191c] border border-neutral-700 rounded-lg px-3 py-2.5 text-xs text-white focus:border-rose-500 outline-none"
        >
          {vowsPresetsList.map(p => (
            <option key={p.id} value={p.id}>
              {p.title} ({p.label})
            </option>
          ))}
        </select>
      </div>

      {/* SECTION 2: NAMES & WEDDING DETAILS */}
      <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
        <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
          <Heart className="w-3.5 h-3.5 text-rose-400" />
          Couple & Wedding Details
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

        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] text-neutral-500 uppercase font-semibold">Wedding Date</span>
            <input
              type="text"
              value={dateText}
              onChange={e => setDateText(e.target.value)}
              className="w-full bg-[#18191c] border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-rose-500 outline-none mt-1"
            />
          </div>
          <div>
            <span className="text-[10px] text-neutral-500 uppercase font-semibold">Venue / City</span>
            <input
              type="text"
              value={venue}
              onChange={e => setVenue(e.target.value)}
              className="w-full bg-[#18191c] border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-rose-500 outline-none mt-1"
            />
          </div>
        </div>
      </div>

      {/* SECTION 3: VOWS TEXT (SPIRAL) */}
      <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
        <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
          <Type className="w-3.5 h-3.5 text-blue-400" />
          Wedding Vows / Promise Text
        </label>
        <textarea
          value={vowsText}
          onChange={e => setVowsText(e.target.value)}
          rows={5}
          className="w-full bg-[#18191c] border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 outline-none mt-1 resize-none"
        />
      </div>

      {/* SECTION 4: COLOR PALETTES */}
      <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
        <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
          <Palette className="w-3.5 h-3.5 text-pink-400" />
          Romantic Color Palette
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              setBgColor('#fdfbf7');
              setTextColor('#1c1917');
              setSubColor('#78716c');
              setHeartColor('#e11d48');
            }}
            className="flex items-center gap-2 p-2 rounded-lg bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-left transition-all"
          >
            <div className="w-5 h-5 rounded-full bg-[#fdfbf7] border border-neutral-300" />
            <span className="text-[11px] text-neutral-300 font-medium">Rose Gold & Ivory</span>
          </button>
          <button
            onClick={() => {
              setBgColor('#0c0a09');
              setTextColor('#fafaf9');
              setSubColor('#a8a29e');
              setHeartColor('#fb7185');
            }}
            className="flex items-center gap-2 p-2 rounded-lg bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-left transition-all"
          >
            <div className="w-5 h-5 rounded-full bg-[#0c0a09] border border-neutral-700" />
            <span className="text-[11px] text-neutral-300 font-medium">Midnight Velvet</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <ModernStudioLayout
      title="Wedding Vows Spiral Studio"
      category="Wedding Keepsake"
      onBack={() => navigate('/')}
      onDownloadPNG={handleDownloadPNG}
      onDownloadPDF={handleDownloadPDF}
      isExporting={isExporting}
      presets={vowsPresetsList}
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
