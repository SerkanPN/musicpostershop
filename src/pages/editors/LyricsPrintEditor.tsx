import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import jsPDF from 'jspdf';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ModernStudioLayout, { PresetItem } from '../../components/ModernStudioLayout';
import { 
  Sparkles, Image as ImageIcon, Sliders, Palette, Type, 
  Columns, Upload, Check, Music
} from 'lucide-react';

const LYRICS_PRINT_PRESETS = [
  {
    id: 'first-dance-arch',
    title: 'First Dance Arch',
    label: 'Wedding',
    songTitle: 'CAN\'T HELP FALLING IN LOVE',
    artist: 'ELVIS PRESLEY',
    names: 'SARAH & DANIEL',
    dateText: '24 AUGUST 2026',
    lyricsCol1: "Wise men say only fools rush in\nBut I can't help falling in love with you\nShall I stay? Would it be a sin\nIf I can't help falling in love with you?\nLike a river flows surely to the sea\nDarling, so it goes, some things are meant to be",
    lyricsCol2: "Take my hand, take my whole life too\nFor I can't help falling in love with you\nLike a river flows surely to the sea\nDarling, so it goes, some things are meant to be\nTake my hand, take my whole life too\nFor I can't help falling in love with you",
    quote: '"Whatever our souls are made of, his and mine are the same."',
    bgColor: '#faf7f2',
    textColor: '#1c1917',
    subColor: '#78716c',
    maskShape: 'arch'
  },
  {
    id: 'anniversary-minimal',
    title: 'Anniversary Minimal',
    label: 'Love',
    songTitle: 'UNTIL I FOUND YOU',
    artist: 'STEPHEN SANCHEZ',
    names: 'EMILY & JAMES',
    dateText: 'ESTABLISHED 2020',
    lyricsCol1: "Georgia, Wrap me up in all your... I want ya\nIn my arms, oh, let me hold ya\nI'll never let you go again, like I did\nOh, I used to say\nI would never fall in love until I found her\nI said, 'I would never fall unless it's you I fall into'",
    lyricsCol2: "I was lost within the darkness, but then I found her\nI found you\nHeaven, when I held you again\nHow could we ever just be friends?\nI would never fall in love until I found her\nI said, 'I would never fall unless it's you'",
    quote: '"I have found the one whom my soul loves."',
    bgColor: '#ffffff',
    textColor: '#09090b',
    subColor: '#71717a',
    maskShape: 'rounded'
  },
  {
    id: 'vintage-sepia-lyrics',
    title: 'Vintage Sepia',
    label: 'Retro',
    songTitle: 'STAND BY ME',
    artist: 'BEN E. KING',
    names: 'FOREVER TOGETHER',
    dateText: 'SINCE 2018',
    lyricsCol1: "When the night has come\nAnd the land is dark\nAnd the moon is the only light we'll see\nNo, I won't be afraid\nOh, I won't be afraid\nJust as long as you stand, stand by me",
    lyricsCol2: "So darling, darling, stand by me\nOh, stand by me\nOh, stand, stand by me, stand by me\nIf the sky that we look upon should tumble and fall\nOr the mountain should crumble to the sea\nI won't cry, I won't cry",
    quote: '"Love is not about how many days, months, or years you have been together. Love is about how much you love each other every single day."',
    bgColor: '#fbf8f3',
    textColor: '#451a03',
    subColor: '#92400e',
    maskShape: 'circle'
  }
];

export default function LyricsPrintEditor() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const presetParam = searchParams.get('preset') || 'first-dance-arch';

  const [activePreset, setActivePreset] = useState<string>(presetParam);
  const initial = LYRICS_PRINT_PRESETS.find(p => p.id === presetParam) || LYRICS_PRINT_PRESETS[0];

  const [songTitle, setSongTitle] = useState(initial.songTitle);
  const [artist, setArtist] = useState(initial.artist);
  const [names, setNames] = useState(initial.names);
  const [dateText, setDateText] = useState(initial.dateText);
  const [lyricsCol1, setLyricsCol1] = useState(initial.lyricsCol1);
  const [lyricsCol2, setLyricsCol2] = useState(initial.lyricsCol2);
  const [quote, setQuote] = useState(initial.quote);

  const [maskShape, setMaskShape] = useState<'arch' | 'circle' | 'rounded'>(initial.maskShape as any || 'arch');
  const [bgColor, setBgColor] = useState(initial.bgColor);
  const [textColor, setTextColor] = useState(initial.textColor);
  const [subColor, setSubColor] = useState(initial.subColor);

  const [zoom, setZoom] = useState(1);
  const [printSize, setPrintSize] = useState('18x24');
  const [isExporting, setIsExporting] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Cinzel:wght@400;700&family=Inter:wght@300;400;500;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  const handlePresetSelect = (id: string) => {
    setActivePreset(id);
    const p = LYRICS_PRINT_PRESETS.find(item => item.id === id);
    if (p) {
      setSongTitle(p.songTitle);
      setArtist(p.artist);
      setNames(p.names);
      setDateText(p.dateText);
      setLyricsCol1(p.lyricsCol1);
      setLyricsCol2(p.lyricsCol2);
      setQuote(p.quote);
      setBgColor(p.bgColor);
      setTextColor(p.textColor);
      setSubColor(p.subColor);
      setMaskShape(p.maskShape as any || 'arch');
    }
  };

  // Render High-End Custom Song Lyrics Print with Photo Arch & 2-Column Typography
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
      stroke: textColor, strokeWidth: 0.5, opacity: 0.18, selectable: false
    });
    canvas.add(insetBorder);

    let curY = 55;

    // 3. Top Header: Song Title & Artist
    const titleEl = new fabric.Textbox(songTitle.toUpperCase(), {
      left: w / 2, top: curY, width: w - 100, originX: 'center', textAlign: 'center',
      fontSize: 22, fontWeight: 700, fill: textColor, fontFamily: 'Playfair Display, serif',
      charSpacing: 80, selectable: false
    });
    canvas.add(titleEl);
    curY += titleEl.height + 4;

    const artistEl = new fabric.Textbox(`${artist.toUpperCase()}   •   ${dateText.toUpperCase()}`, {
      left: w / 2, top: curY, width: w - 100, originX: 'center', textAlign: 'center',
      fontSize: 9.5, fontWeight: 600, fill: subColor, fontFamily: 'Inter, sans-serif',
      charSpacing: 160, selectable: false
    });
    canvas.add(artistEl);
    curY += artistEl.height + 18;

    // 4. Center Photo Mask Area (Arch / Circle / Rounded)
    const photoW = 200;
    const photoH = 220;
    const photoX = (w - photoW) / 2;

    if (maskShape === 'arch') {
      // Elegant Arch Frame
      const archBg = new fabric.Rect({
        left: photoX, top: curY, width: photoW, height: photoH,
        fill: '#e7e5e4', rx: photoW / 2, ry: photoW / 2,
        stroke: textColor, strokeWidth: 0.75, opacity: 0.8, selectable: false
      });
      canvas.add(archBg);

      // Stylized inner silhouette illustration
      const archInner = new fabric.Circle({
        left: photoX + photoW/2 - 40, top: curY + 45, radius: 40,
        fill: '#d6d3d1', selectable: false
      });
      canvas.add(archInner);
    } else if (maskShape === 'circle') {
      const circlePhoto = new fabric.Circle({
        left: w/2 - 100, top: curY + 10, radius: 100,
        fill: '#e7e5e4', stroke: textColor, strokeWidth: 0.75, opacity: 0.85, selectable: false
      });
      canvas.add(circlePhoto);
    } else {
      const rectPhoto = new fabric.Rect({
        left: photoX, top: curY + 10, width: photoW, height: photoH - 20,
        rx: 12, ry: 12, fill: '#e7e5e4', stroke: textColor, strokeWidth: 0.75, opacity: 0.85, selectable: false
      });
      canvas.add(rectPhoto);
    }

    curY += photoH + 20;

    // Couple Names Banner
    const namesEl = new fabric.Textbox(names.toUpperCase(), {
      left: w / 2, top: curY, width: w - 100, originX: 'center', textAlign: 'center',
      fontSize: 12, fontWeight: 600, fill: textColor, fontFamily: 'Playfair Display, serif',
      charSpacing: 140, selectable: false
    });
    canvas.add(namesEl);
    curY += namesEl.height + 12;

    // Divider Line
    const divider = new fabric.Line([w/2 - 30, curY, w/2 + 30, curY], {
      stroke: textColor, strokeWidth: 0.8, opacity: 0.3, selectable: false
    });
    canvas.add(divider);
    curY += 16;

    // 5. Two Balanced Columns of Lyrics
    const colW = 210;
    const col1X = 60;
    const col2X = w - 60 - colW;

    const col1El = new fabric.Textbox(lyricsCol1, {
      left: col1X, top: curY, width: colW, fontSize: 8.5, lineHeight: 1.5,
      fill: textColor, fontFamily: 'Cormorant Garamond, serif', textAlign: 'center',
      selectable: false
    });
    canvas.add(col1El);

    const col2El = new fabric.Textbox(lyricsCol2, {
      left: col2X, top: curY, width: colW, fontSize: 8.5, lineHeight: 1.5,
      fill: textColor, fontFamily: 'Cormorant Garamond, serif', textAlign: 'center',
      selectable: false
    });
    canvas.add(col2El);

    curY += Math.max(col1El.height, col2El.height) + 14;

    // 6. Bottom Signature Quote
    if (quote) {
      const quoteEl = new fabric.Textbox(quote, {
        left: w / 2, top: curY, width: w - 120, originX: 'center', textAlign: 'center',
        fontSize: 9.5, fontStyle: 'italic', fill: subColor, fontFamily: 'Playfair Display, serif',
        selectable: false
      });
      canvas.add(quoteEl);
    }

    canvas.renderAll();
  };

  useEffect(() => {
    renderCanvas();
  }, [
    songTitle, artist, names, dateText, lyricsCol1, lyricsCol2, quote,
    maskShape, bgColor, textColor, subColor
  ]);

  const handleDownloadPNG = () => {
    if (!fabricRef.current) return;
    setIsExporting(true);
    const dataUrl = fabricRef.current.toDataURL({ format: 'png', multiplier: 3 });
    const link = document.createElement('a');
    link.download = `lyrics-print-${activePreset}.png`;
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
    pdf.save(`lyrics-print-300dpi-${activePreset}.pdf`);
    setIsExporting(false);
  };

  const lyricsPresetsList: PresetItem[] = LYRICS_PRINT_PRESETS.map(p => ({
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
          Choose Lyrics Preset ({lyricsPresetsList.length})
        </label>
        <select
          value={activePreset}
          onChange={e => handlePresetSelect(e.target.value)}
          className="w-full bg-[#18191c] border border-neutral-700 rounded-lg px-3 py-2.5 text-xs text-white focus:border-rose-500 outline-none"
        >
          {lyricsPresetsList.map(p => (
            <option key={p.id} value={p.id}>
              {p.title} ({p.label})
            </option>
          ))}
        </select>
      </div>

      {/* SECTION 2: PHOTO MASK SHAPE */}
      <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
        <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
          <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
          Center Photo Mask Shape
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setMaskShape('arch')}
            className={`p-2 rounded-lg text-xs font-medium border text-center transition-all ${
              maskShape === 'arch'
                ? 'bg-rose-600 text-white border-rose-500'
                : 'bg-neutral-950 text-neutral-300 border-neutral-800 hover:border-neutral-700'
            }`}
          >
            Arch (Kemer)
          </button>
          <button
            onClick={() => setMaskShape('circle')}
            className={`p-2 rounded-lg text-xs font-medium border text-center transition-all ${
              maskShape === 'circle'
                ? 'bg-rose-600 text-white border-rose-500'
                : 'bg-neutral-950 text-neutral-300 border-neutral-800 hover:border-neutral-700'
            }`}
          >
            Circle (Daire)
          </button>
          <button
            onClick={() => setMaskShape('rounded')}
            className={`p-2 rounded-lg text-xs font-medium border text-center transition-all ${
              maskShape === 'rounded'
                ? 'bg-rose-600 text-white border-rose-500'
                : 'bg-neutral-950 text-neutral-300 border-neutral-800 hover:border-neutral-700'
            }`}
          >
            Rounded
          </button>
        </div>
      </div>

      {/* SECTION 3: SONG & LYRICS COLUMNS */}
      <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
        <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
          <Columns className="w-3.5 h-3.5 text-blue-400" />
          Song & Multi-Column Lyrics
        </label>

        <div>
          <span className="text-[10px] text-neutral-500 uppercase font-semibold">Song Title</span>
          <input
            type="text"
            value={songTitle}
            onChange={e => setSongTitle(e.target.value)}
            className="w-full bg-[#18191c] border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white font-semibold focus:border-rose-500 outline-none mt-1"
          />
        </div>

        <div>
          <span className="text-[10px] text-neutral-500 uppercase font-semibold">Artist & Date</span>
          <input
            type="text"
            value={artist}
            onChange={e => setArtist(e.target.value)}
            className="w-full bg-[#18191c] border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 outline-none mt-1"
          />
        </div>

        <div>
          <span className="text-[10px] text-neutral-500 uppercase font-semibold">Lyrics (Column 1)</span>
          <textarea
            value={lyricsCol1}
            onChange={e => setLyricsCol1(e.target.value)}
            rows={4}
            className="w-full bg-[#18191c] border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 outline-none mt-1 resize-none"
          />
        </div>

        <div>
          <span className="text-[10px] text-neutral-500 uppercase font-semibold">Lyrics (Column 2)</span>
          <textarea
            value={lyricsCol2}
            onChange={e => setLyricsCol2(e.target.value)}
            rows={4}
            className="w-full bg-[#18191c] border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 outline-none mt-1 resize-none"
          />
        </div>
      </div>

      {/* SECTION 4: DEDICATION & NAMES */}
      <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
        <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
          <Type className="w-3.5 h-3.5 text-purple-400" />
          Dedication & Names
        </label>
        <div>
          <span className="text-[10px] text-neutral-500 uppercase font-semibold">Names Line</span>
          <input
            type="text"
            value={names}
            onChange={e => setNames(e.target.value)}
            className="w-full bg-[#18191c] border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 outline-none mt-1"
          />
        </div>
        <div>
          <span className="text-[10px] text-neutral-500 uppercase font-semibold">Bottom Quote</span>
          <input
            type="text"
            value={quote}
            onChange={e => setQuote(e.target.value)}
            className="w-full bg-[#18191c] border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 outline-none mt-1"
          />
        </div>
      </div>
    </div>
  );

  return (
    <ModernStudioLayout
      title="Photo Arch Lyrics Studio"
      category="Custom Lyrics Print"
      onBack={() => navigate('/')}
      onDownloadPNG={handleDownloadPNG}
      onDownloadPDF={handleDownloadPDF}
      isExporting={isExporting}
      presets={lyricsPresetsList}
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
