import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import jsPDF from 'jspdf';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ModernStudioLayout, { PresetItem } from '../../components/ModernStudioLayout';
import { 
  Sparkles, Disc, Sliders, Palette, Type, 
  Image as ImageIcon, Upload, Check, Music
} from 'lucide-react';

const VINYL_PRESETS = [
  {
    id: 'first-dance-vinyl',
    title: 'First Dance Vinyl',
    label: 'Wedding',
    songTitle: 'PERFECT',
    artist: 'ED SHEERAN',
    names: 'SARAH & DANIEL',
    dateText: 'AUGUST 24, 2026',
    lyrics: "I found a love, for me. Darling, just dive right in and follow my lead. Well, I found a girl, beautiful and sweet. Oh, I never knew you were the someone waiting for me. 'Cause we were just kids when we fell in love, not knowing what it was. I will not give you up this time. Darling, just kiss me slow, your heart is all I own, and in your eyes, you're holding mine. Baby, I'm dancing in the dark with you between my arms. Barefoot on the grass, listening to our favorite song.",
    bgColor: '#fdfbf7',
    textColor: '#1c1917',
    subColor: '#78716c',
    vinylColor: '#121214',
    grooveColor: 'rgba(255,255,255,0.08)'
  },
  {
    id: 'anniversary-vinyl',
    title: 'Anniversary Track',
    label: 'Love',
    songTitle: 'ALL OF ME',
    artist: 'JOHN LEGEND',
    names: 'EMILY & JAMES',
    dateText: '10 YEARS TOGETHER',
    lyrics: "'Cause all of me loves all of you. Love your curves and all your edges, all your perfect imperfections. Give your all to me, I'll give my all to you. You're my end and my beginning, even when I lose, I'm winning. 'Cause I give you all of me and you give me all of you.",
    bgColor: '#0c0a09',
    textColor: '#fafaf9',
    subColor: '#a8a29e',
    vinylColor: '#18181b',
    grooveColor: 'rgba(255,255,255,0.09)'
  },
  {
    id: 'vintage-classics',
    title: 'Vintage Classic',
    label: 'Music',
    songTitle: 'FLY ME TO THE MOON',
    artist: 'FRANK SINATRA',
    names: 'VINYL MASTER SERIES',
    dateText: '1964 • STEREO 33 RPM',
    lyrics: "Fly me to the moon, let me play among the stars. Let me see what spring is like on Jupiter and Mars. In other words, hold my hand. In other words, baby, kiss me. Fill my heart with song and let me sing forevermore. You are all I long for, all I worship and adore.",
    bgColor: '#fcf8f2',
    textColor: '#292524',
    subColor: '#78716c',
    vinylColor: '#1a1816',
    grooveColor: 'rgba(255,255,255,0.07)'
  },
  {
    id: 'lofi-sunset',
    title: 'Lo-Fi Sunset',
    label: 'Chill',
    songTitle: 'GOLDEN HOUR',
    artist: 'JVKE',
    names: 'SUMMER MEMORIES',
    dateText: 'COASTAL DRIVE 2026',
    lyrics: "It was just two lovers sittin' in the car, listenin' to Blonde, fallin' for each other. Pink and orange skies, feelin' super childish, no Donald Glover. Missed call from my mother, like, 'Where you at tonight?' Got no alibi. I was all alone with the love of my life. She's got glitter for skin, my radiant beam in the night.",
    bgColor: '#18181b',
    textColor: '#ffffff',
    subColor: '#f43f5e',
    vinylColor: '#09090b',
    grooveColor: 'rgba(244,63,94,0.12)'
  }
];

export default function VinylEditor() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const presetParam = searchParams.get('preset') || 'first-dance-vinyl';

  const [activePreset, setActivePreset] = useState<string>(presetParam);
  const initial = VINYL_PRESETS.find(p => p.id === presetParam) || VINYL_PRESETS[0];

  const [songTitle, setSongTitle] = useState(initial.songTitle);
  const [artist, setArtist] = useState(initial.artist);
  const [names, setNames] = useState(initial.names);
  const [dateText, setDateText] = useState(initial.dateText);
  const [lyrics, setLyrics] = useState(initial.lyrics);

  const [bgColor, setBgColor] = useState(initial.bgColor);
  const [textColor, setTextColor] = useState(initial.textColor);
  const [subColor, setSubColor] = useState(initial.subColor);
  const [vinylColor, setVinylColor] = useState(initial.vinylColor);

  const [zoom, setZoom] = useState(1);
  const [printSize, setPrintSize] = useState('18x24');
  const [isExporting, setIsExporting] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Cinzel:wght@400;700;900&family=Inter:wght@300;400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  const handlePresetSelect = (id: string) => {
    setActivePreset(id);
    const p = VINYL_PRESETS.find(item => item.id === id);
    if (p) {
      setSongTitle(p.songTitle);
      setArtist(p.artist);
      setNames(p.names);
      setDateText(p.dateText);
      setLyrics(p.lyrics);
      setBgColor(p.bgColor);
      setTextColor(p.textColor);
      setSubColor(p.subColor);
      setVinylColor(p.vinylColor);
    }
  };

  // Render High-End Vinyl Spiral Lyrics Poster
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

    // 1. Mat Background
    const bg = new fabric.Rect({
      left: 0, top: 0, width: w, height: h, fill: bgColor, selectable: false
    });
    canvas.add(bg);

    // 2. Vinyl Record Disc Graphics
    const discRadius = 220;
    const discCenter = { x: w / 2, y: h * 0.40 };

    // Outer Shadow
    const discShadow = new fabric.Circle({
      left: discCenter.x - discRadius, top: discCenter.y - discRadius + 8,
      radius: discRadius, fill: '#000000', opacity: 0.25, selectable: false
    });
    canvas.add(discShadow);

    // Main Vinyl Disc
    const vinylDisc = new fabric.Circle({
      left: discCenter.x - discRadius, top: discCenter.y - discRadius,
      radius: discRadius, fill: vinylColor, stroke: '#27272a', strokeWidth: 1, selectable: false
    });
    canvas.add(vinylDisc);

    // Realistic Grooves Rings
    const grooveCount = 14;
    for (let g = 0; g < grooveCount; g++) {
      const gr = 95 + (g * 8.5);
      const ring = new fabric.Circle({
        left: discCenter.x - gr, top: discCenter.y - gr,
        radius: gr, fill: 'transparent',
        stroke: 'rgba(255, 255, 255, 0.06)', strokeWidth: 0.75, selectable: false
      });
      canvas.add(ring);
    }

    // 3. Circular Wrapping Lyrics (Concentric Text Rings)
    const words = lyrics.replace(/\n/g, ' ').split(' ');
    let wordIdx = 0;
    const ringRadii = [205, 185, 165, 145, 125];

    ringRadii.forEach((r, rIdx) => {
      const circum = 2 * Math.PI * r;
      // take a slice of words for this ring
      const ringWords: string[] = [];
      let curLen = 0;
      while (wordIdx < words.length && curLen < circum / 7.5) {
        ringWords.push(words[wordIdx]);
        curLen += words[wordIdx].length * 7 + 8;
        wordIdx++;
      }

      if (ringWords.length > 0) {
        const ringText = ringWords.join('   •   ');
        // Render ring text angle calculation
        const chars = ringText.split('');
        const angleStep = (2 * Math.PI) / (chars.length + 4);

        chars.forEach((ch, cIdx) => {
          const angle = (cIdx * angleStep) - (Math.PI / 2) + (rIdx * 0.4);
          const cx = discCenter.x + (r * Math.cos(angle));
          const cy = discCenter.y + (r * Math.sin(angle));

          const charObj = new fabric.Text(ch, {
            left: cx, top: cy,
            fontSize: 7.5, fontWeight: '500',
            fill: '#d4d4d8', opacity: 0.85,
            fontFamily: 'Inter, sans-serif',
            originX: 'center', originY: 'center',
            angle: (angle * 180 / Math.PI) + 90,
            selectable: false
          });
          canvas.add(charObj);
        });
      }
    });

    // 4. Center Label
    const labelRadius = 65;
    const centerLabel = new fabric.Circle({
      left: discCenter.x - labelRadius, top: discCenter.y - labelRadius,
      radius: labelRadius, fill: '#faf6f0', stroke: '#d4d4d8', strokeWidth: 1.5,
      selectable: false
    });
    canvas.add(centerLabel);

    // Center Spindle Hole
    const spindleHole = new fabric.Circle({
      left: discCenter.x - 7, top: discCenter.y - 7,
      radius: 7, fill: bgColor, stroke: '#71717a', strokeWidth: 1,
      selectable: false
    });
    canvas.add(spindleHole);

    // Label Text
    canvas.add(new fabric.Textbox(songTitle.toUpperCase(), {
      left: discCenter.x, top: discCenter.y - 42, width: 110,
      originX: 'center', textAlign: 'center', fontSize: 8.5, fontWeight: '700',
      fill: '#1c1917', fontFamily: 'Playfair Display, serif', selectable: false
    }));

    canvas.add(new fabric.Textbox(artist.toUpperCase(), {
      left: discCenter.x, top: discCenter.y - 28, width: 110,
      originX: 'center', textAlign: 'center', fontSize: 6.5, fontWeight: '600',
      fill: '#78716c', fontFamily: 'Inter, sans-serif', charSpacing: 100, selectable: false
    }));

    canvas.add(new fabric.Textbox('33⅓ RPM • STEREO', {
      left: discCenter.x, top: discCenter.y + 16, width: 110,
      originX: 'center', textAlign: 'center', fontSize: 5.5, fontWeight: '700',
      fill: '#a8a29e', fontFamily: 'Inter, sans-serif', charSpacing: 120, selectable: false
    }));

    canvas.add(new fabric.Textbox(names.toUpperCase(), {
      left: discCenter.x, top: discCenter.y + 28, width: 110,
      originX: 'center', textAlign: 'center', fontSize: 6.5, fontWeight: '600',
      fill: '#1c1917', fontFamily: 'Playfair Display, serif', selectable: false
    }));

    // 5. Bottom Editorial Typography
    let btmY = h * 0.72;

    const titleEl = new fabric.Textbox(songTitle, {
      left: w / 2, top: btmY, width: w - 80, originX: 'center', textAlign: 'center',
      fontSize: 32, fontWeight: '700', fill: textColor, fontFamily: 'Playfair Display, serif',
      charSpacing: 60, selectable: false
    });
    canvas.add(titleEl);
    btmY += titleEl.height + 4;

    const artistEl = new fabric.Textbox(artist.toUpperCase(), {
      left: w / 2, top: btmY, width: w - 80, originX: 'center', textAlign: 'center',
      fontSize: 12, fontWeight: '600', fill: subColor, fontFamily: 'Inter, sans-serif',
      charSpacing: 200, selectable: false
    });
    canvas.add(artistEl);
    btmY += artistEl.height + 16;

    const divider = new fabric.Line([w/2 - 25, btmY, w/2 + 25, btmY], {
      stroke: textColor, strokeWidth: 1, opacity: 0.3, selectable: false
    });
    canvas.add(divider);
    btmY += 14;

    const namesEl = new fabric.Textbox(names.toUpperCase(), {
      left: w / 2, top: btmY, width: w - 80, originX: 'center', textAlign: 'center',
      fontSize: 11, fontWeight: '600', fill: textColor, fontFamily: 'Playfair Display, serif',
      charSpacing: 140, selectable: false
    });
    canvas.add(namesEl);
    btmY += namesEl.height + 4;

    const dateEl = new fabric.Textbox(dateText.toUpperCase(), {
      left: w / 2, top: btmY, width: w - 80, originX: 'center', textAlign: 'center',
      fontSize: 9, fontWeight: '500', fill: subColor, fontFamily: 'Inter, sans-serif',
      charSpacing: 160, selectable: false
    });
    canvas.add(dateEl);

    canvas.renderAll();
  };

  useEffect(() => {
    renderCanvas();
  }, [
    songTitle, artist, names, dateText, lyrics,
    bgColor, textColor, subColor, vinylColor
  ]);

  const handleDownloadPNG = () => {
    if (!fabricRef.current) return;
    setIsExporting(true);
    const dataUrl = fabricRef.current.toDataURL({ format: 'png', multiplier: 3 });
    const link = document.createElement('a');
    link.download = `vinyl-poster-${activePreset}.png`;
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
    pdf.save(`vinyl-poster-300dpi-${activePreset}.pdf`);
    setIsExporting(false);
  };

  const vinylPresetsList: PresetItem[] = VINYL_PRESETS.map(p => ({
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
          Choose Vinyl Preset ({vinylPresetsList.length})
        </label>
        <select
          value={activePreset}
          onChange={e => handlePresetSelect(e.target.value)}
          className="w-full bg-[#18191c] border border-neutral-700 rounded-lg px-3 py-2.5 text-xs text-white focus:border-rose-500 outline-none"
        >
          {vinylPresetsList.map(p => (
            <option key={p.id} value={p.id}>
              {p.title} ({p.label})
            </option>
          ))}
        </select>
      </div>

      {/* SECTION 2: SONG & LYRICS */}
      <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
        <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
          <Music className="w-3.5 h-3.5 text-blue-400" />
          Song Details & Circular Lyrics
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
          <span className="text-[10px] text-neutral-500 uppercase font-semibold">Artist Name</span>
          <input
            type="text"
            value={artist}
            onChange={e => setArtist(e.target.value)}
            className="w-full bg-[#18191c] border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 outline-none mt-1"
          />
        </div>

        <div>
          <span className="text-[10px] text-neutral-500 uppercase font-semibold">Song Lyrics (Spiral Text)</span>
          <textarea
            value={lyrics}
            onChange={e => setLyrics(e.target.value)}
            rows={4}
            className="w-full bg-[#18191c] border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:border-rose-500 outline-none mt-1 resize-none"
          />
        </div>
      </div>

      {/* SECTION 3: PERSONALIZATION */}
      <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
        <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
          <Type className="w-3.5 h-3.5 text-emerald-400" />
          Personalization & Dates
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] text-neutral-500 uppercase font-semibold">Names</span>
            <input
              type="text"
              value={names}
              onChange={e => setNames(e.target.value)}
              className="w-full bg-[#18191c] border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-rose-500 outline-none mt-1"
            />
          </div>
          <div>
            <span className="text-[10px] text-neutral-500 uppercase font-semibold">Date / Milestone</span>
            <input
              type="text"
              value={dateText}
              onChange={e => setDateText(e.target.value)}
              className="w-full bg-[#18191c] border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-rose-500 outline-none mt-1"
            />
          </div>
        </div>
      </div>

      {/* SECTION 4: COLOR PALETTES */}
      <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
        <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
          <Palette className="w-3.5 h-3.5 text-pink-400" />
          Poster Color Theme
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              setBgColor('#fdfbf7');
              setTextColor('#1c1917');
              setSubColor('#78716c');
              setVinylColor('#121214');
            }}
            className="flex items-center gap-2 p-2 rounded-lg bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-left transition-all"
          >
            <div className="w-5 h-5 rounded-full bg-[#fdfbf7] border border-neutral-300" />
            <span className="text-[11px] text-neutral-300 font-medium">Warm Ivory</span>
          </button>
          <button
            onClick={() => {
              setBgColor('#0c0a09');
              setTextColor('#fafaf9');
              setSubColor('#a8a29e');
              setVinylColor('#18181b');
            }}
            className="flex items-center gap-2 p-2 rounded-lg bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-left transition-all"
          >
            <div className="w-5 h-5 rounded-full bg-[#0c0a09] border border-neutral-700" />
            <span className="text-[11px] text-neutral-300 font-medium">Midnight Onyx</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <ModernStudioLayout
      title="Vinyl Spiral Lyrics Studio"
      category="Vinyl Wall Art"
      onBack={() => navigate('/')}
      onDownloadPNG={handleDownloadPNG}
      onDownloadPDF={handleDownloadPDF}
      isExporting={isExporting}
      presets={vinylPresetsList}
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
