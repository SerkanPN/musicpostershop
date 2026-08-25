import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import jsPDF from 'jspdf';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ModernStudioLayout, { PresetItem } from '../../components/ModernStudioLayout';
import { POSTER_PRESETS } from '../../lib/presets';
import { 
  Sparkles, Plus, Trash2, Sliders, Palette, Type, 
  BookOpen, Quote, Check
} from 'lucide-react';

interface DefItem {
  num: string;
  text: string;
}

const TYPOGRAPHY_PRESET_DATA: Record<string, any> = {
  'stoic-wisdom': {
    word: 'STOICISM',
    phonetic: '/ˈstō-ə-ˌsi-zəm/',
    pos: 'noun',
    definitions: [
      { num: '1.', text: 'The endurance of pain or hardship without the display of feelings and without complaint.' },
      { num: '2.', text: 'An ancient Greek school of philosophy founded at Athens by Zeno of Citium. The virtue of living in harmony with nature.' },
      { num: '3.', text: 'The practice of distinguishing between what is in your control and what is not, focusing energy only on the former.' }
    ],
    synonyms: 'resilience • fortitude • self-mastery • clarity • grit',
    quote: '"You have power over your mind - not outside events. Realize this, and you will find strength." — Marcus Aurelius',
    bgColor: '#faf8f5',
    textColor: '#1c1917',
    subColor: '#78716c',
    fontTitle: 'Playfair Display, serif'
  },
  'personal-manifesto': {
    word: 'PURPOSE',
    phonetic: '/ˈpər-pəs/',
    pos: 'noun',
    definitions: [
      { num: '1.', text: 'The reason for which something is done or created or for which a person exists.' },
      { num: '2.', text: 'A relentless commitment to growth, integrity, and lifelong pursuit of mastery.' },
      { num: '3.', text: 'Waking up every morning with clear intention and unapologetic dedication.' }
    ],
    synonyms: 'mission • calling • determination • ambition • vision',
    quote: '"The two most important days in your life are the day you are born and the day you find out why." — Mark Twain',
    bgColor: '#0c0a09',
    textColor: '#fafaf9',
    subColor: '#a8a29e',
    fontTitle: 'Cinzel, serif'
  },
  'dog-house-rules': {
    word: 'DOG',
    phonetic: '/dôɡ/',
    pos: 'noun • best friend',
    definitions: [
      { num: '1.', text: 'A four-legged furry child that loves you unconditionally and sheds happiness everywhere.' },
      { num: '2.', text: 'The official master of belly rubs, treat begging, and doorbell alert systems.' },
      { num: '3.', text: 'An eternal source of loyalty, pure joy, and messy paw prints on clean floors.' }
    ],
    synonyms: 'good boy • protector • family • joy • shadow',
    quote: '"A dog is the only thing on earth that loves you more than he loves himself." — Josh Billings',
    bgColor: '#fffdfa',
    textColor: '#451a03',
    subColor: '#92400e',
    fontTitle: 'Playfair Display, serif'
  },
  'martial-arts-dojo': {
    word: 'DISCIPLINE',
    phonetic: '/ˈdi-sə-plən/',
    pos: 'noun',
    definitions: [
      { num: '1.', text: 'The practice of training one’s mind and body to obey rules and standards of self-control.' },
      { num: '2.', text: 'Choosing what you want most over what you want now.' },
      { num: '3.', text: 'Doing the work when nobody is watching and when motivation has completely faded.' }
    ],
    synonyms: 'unyielding • focus • dedication • strength • honor',
    quote: '"We must all suffer one of two things: the pain of discipline or the pain of regret." — Jim Rohn',
    bgColor: '#09090b',
    textColor: '#ffffff',
    subColor: '#a1a1aa',
    fontTitle: 'Cinzel, serif'
  }
};

const TYPO_THEMES = [
  { name: 'Editorial Cream', bg: '#faf7f2', text: '#1c1917', sub: '#78716c' },
  { name: 'Onyx Gallery', bg: '#09090b', text: '#fafafa', sub: '#a1a1aa' },
  { name: 'Bordeaux Luxury', bg: '#2b0914', text: '#fdf2f8', sub: '#f472b6' },
  { name: 'Warm Terracotta', bg: '#fffaf5', text: '#7c2d12', sub: '#ea580c' },
  { name: 'Sage Linen', bg: '#f4f7f4', text: '#14532d', sub: '#166534' }
];

export default function DictionaryEditor() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const presetParam = searchParams.get('preset') || 'stoic-wisdom';

  const [activePreset, setActivePreset] = useState<string>(presetParam);
  const initial = TYPOGRAPHY_PRESET_DATA[presetParam] || TYPOGRAPHY_PRESET_DATA['stoic-wisdom'];

  const [word, setWord] = useState(initial.word);
  const [phonetic, setPhonetic] = useState(initial.phonetic);
  const [pos, setPos] = useState(initial.pos);
  const [definitions, setDefinitions] = useState<DefItem[]>(initial.definitions);
  const [synonyms, setSynonyms] = useState(initial.synonyms);
  const [quote, setQuote] = useState(initial.quote);

  const [bgColor, setBgColor] = useState(initial.bgColor);
  const [textColor, setTextColor] = useState(initial.textColor);
  const [subColor, setSubColor] = useState(initial.subColor);
  const [fontTitle, setFontTitle] = useState(initial.fontTitle || 'Playfair Display, serif');

  const [zoom, setZoom] = useState(1);
  const [printSize, setPrintSize] = useState('18x24');
  const [isExporting, setIsExporting] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=Cinzel:wght@400;700;900&family=Inter:wght@300;400;500;600;700&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  const handlePresetSelect = (id: string) => {
    setActivePreset(id);
    const data = TYPOGRAPHY_PRESET_DATA[id];
    if (data) {
      setWord(data.word);
      setPhonetic(data.phonetic);
      setPos(data.pos);
      setDefinitions(data.definitions);
      setSynonyms(data.synonyms);
      setQuote(data.quote);
      setBgColor(data.bgColor);
      setTextColor(data.textColor);
      setSubColor(data.subColor);
      if (data.fontTitle) setFontTitle(data.fontTitle);
    } else {
      const general = (POSTER_PRESETS.TYPOGRAPHY as any[]).find(p => p.id === id);
      if (general) {
        setWord(general.label.toUpperCase());
        setPhonetic(`/${general.label.toLowerCase()}/`);
      }
    }
  };

  const handleAddDef = () => {
    const nextNum = `${definitions.length + 1}.`;
    setDefinitions([...definitions, { num: nextNum, text: 'A meaningful principle, definition, or guiding rule.' }]);
  };

  const handleRemoveDef = (index: number) => {
    setDefinitions(definitions.filter((_, i) => i !== index));
  };

  const handleDefChange = (index: number, text: string) => {
    const next = [...definitions];
    next[index].text = text;
    setDefinitions(next);
  };

  // Render Museum-Grade Editorial Typography Poster
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

    // 2. Elegant Outer Thin Inset Margin Border
    const marginBorder = new fabric.Rect({
      left: 36, top: 36, width: w - 72, height: h - 72, fill: 'transparent',
      stroke: textColor, strokeWidth: 0.5, opacity: 0.2, selectable: false
    });
    canvas.add(marginBorder);

    let curY = 65;

    // 3. Top Classification Tag
    canvas.add(new fabric.Textbox('DEFINITION & MANIFESTO NO. 01', {
      left: 55, top: curY, fontSize: 8.5, fontWeight: 700, fill: subColor,
      fontFamily: 'Inter, sans-serif', charSpacing: 180, selectable: false
    }));
    curY += 32;

    // 4. Large Main Word Headword
    const wordEl = new fabric.Textbox(word.toUpperCase(), {
      left: 55, top: curY, width: w - 110, fontSize: 38, fontWeight: 900,
      fill: textColor, fontFamily: fontTitle, charSpacing: 60, selectable: false
    });
    canvas.add(wordEl);
    curY += wordEl.height + 6;

    // 5. Phonetic & Part of Speech Badge
    const phoneticEl = new fabric.Textbox(`${phonetic}   •   [${pos}]`, {
      left: 55, top: curY, width: w - 110, fontSize: 13, fontStyle: 'italic',
      fill: subColor, fontFamily: fontTitle, selectable: false
    });
    canvas.add(phoneticEl);
    curY += phoneticEl.height + 18;

    // Heavy Editorial Rule Line
    const solidLine = new fabric.Line([55, curY, w - 55, curY], {
      stroke: textColor, strokeWidth: 1.5, opacity: 0.85, selectable: false
    });
    canvas.add(solidLine);
    curY += 24;

    // 6. Numbered Definitions with Bold Typography
    definitions.forEach((def, idx) => {
      // Number
      const numEl = new fabric.Textbox(def.num, {
        left: 55, top: curY, width: 26, fontSize: 13, fontWeight: 700,
        fill: textColor, fontFamily: fontTitle, selectable: false
      });
      canvas.add(numEl);

      // Definition text
      const textEl = new fabric.Textbox(def.text, {
        left: 84, top: curY, width: w - 140, fontSize: 11.5, lineHeight: 1.45,
        fill: textColor, fontFamily: 'Inter, sans-serif', selectable: false
      });
      canvas.add(textEl);

      curY += Math.max(textEl.height, 28) + 16;
    });

    curY += 8;

    // 7. Synonyms Tag Line
    if (synonyms) {
      const synLabel = new fabric.Textbox('SYNONYMS / PRINCIPLES:', {
        left: 55, top: curY, fontSize: 8.5, fontWeight: 700, fill: subColor,
        fontFamily: 'Inter, sans-serif', charSpacing: 140, selectable: false
      });
      canvas.add(synLabel);
      curY += 16;

      const synEl = new fabric.Textbox(synonyms.toUpperCase(), {
        left: 55, top: curY, width: w - 110, fontSize: 10, fontWeight: 600,
        fill: textColor, fontFamily: 'Inter, sans-serif', charSpacing: 100, selectable: false
      });
      canvas.add(synEl);
      curY += synEl.height + 24;
    }

    // 8. Quote / Wisdom Manifesto Section at Bottom
    const btmLine = new fabric.Line([55, curY, w - 55, curY], {
      stroke: textColor, strokeWidth: 0.5, opacity: 0.25, selectable: false
    });
    canvas.add(btmLine);
    curY += 18;

    if (quote) {
      const quoteEl = new fabric.Textbox(quote, {
        left: 55, top: curY, width: w - 110, fontSize: 11, fontStyle: 'italic',
        lineHeight: 1.4, fill: textColor, fontFamily: fontTitle, selectable: false
      });
      canvas.add(quoteEl);
    }

    canvas.renderAll();
  };

  useEffect(() => {
    renderCanvas();
  }, [
    word, phonetic, pos, definitions, synonyms, quote,
    bgColor, textColor, subColor, fontTitle
  ]);

  const handleDownloadPNG = () => {
    if (!fabricRef.current) return;
    setIsExporting(true);
    const dataUrl = fabricRef.current.toDataURL({ format: 'png', multiplier: 3 });
    const link = document.createElement('a');
    link.download = `typography-poster-${activePreset}.png`;
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
    pdf.save(`typography-poster-300dpi-${activePreset}.pdf`);
    setIsExporting(false);
  };

  const typoPresets: PresetItem[] = (POSTER_PRESETS.TYPOGRAPHY as any[]).map(p => ({
    id: p.id,
    title: p.label,
    label: p.category
  }));

  const sidebar = (
    <div className="space-y-6">
      {/* SECTION 1: PRESET CHOOSER */}
      <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
        <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          Choose Typography Theme ({typoPresets.length})
        </label>
        <select
          value={activePreset}
          onChange={e => handlePresetSelect(e.target.value)}
          className="w-full bg-[#18191c] border border-neutral-700 rounded-lg px-3 py-2.5 text-xs text-white focus:border-blue-500 outline-none"
        >
          {typoPresets.map(p => (
            <option key={p.id} value={p.id}>
              {p.title} ({p.label})
            </option>
          ))}
        </select>
      </div>

      {/* SECTION 2: WORD & PHONETICS */}
      <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
        <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
          <Type className="w-3.5 h-3.5 text-emerald-400" />
          Headword & Pronunciation
        </label>

        <div>
          <span className="text-[10px] text-neutral-500 uppercase font-semibold">Headword / Title</span>
          <input
            type="text"
            value={word}
            onChange={e => setWord(e.target.value)}
            className="w-full bg-[#18191c] border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white font-bold focus:border-blue-500 outline-none mt-1"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] text-neutral-500 uppercase font-semibold">Phonetic Spelling</span>
            <input
              type="text"
              value={phonetic}
              onChange={e => setPhonetic(e.target.value)}
              className="w-full bg-[#18191c] border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-blue-500 outline-none mt-1"
            />
          </div>
          <div>
            <span className="text-[10px] text-neutral-500 uppercase font-semibold">Grammar Tag / Category</span>
            <input
              type="text"
              value={pos}
              onChange={e => setPos(e.target.value)}
              className="w-full bg-[#18191c] border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-blue-500 outline-none mt-1"
            />
          </div>
        </div>
      </div>

      {/* SECTION 3: DEFINITIONS MANAGER */}
      <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5 text-pink-400" />
            Definitions ({definitions.length})
          </label>
          <button
            onClick={handleAddDef}
            className="flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
          >
            <Plus className="w-3 h-3" /> Add Definition
          </button>
        </div>

        <div className="space-y-2 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
          {definitions.map((def, idx) => (
            <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-[#18191c] border border-neutral-800">
              <span className="text-xs font-bold text-neutral-400 mt-1">{def.num}</span>
              <textarea
                value={def.text}
                onChange={e => handleDefChange(idx, e.target.value)}
                rows={2}
                className="flex-1 bg-transparent text-xs text-white focus:outline-none resize-none"
              />
              {definitions.length > 1 && (
                <button
                  onClick={() => handleRemoveDef(idx)}
                  className="text-neutral-500 hover:text-rose-400 transition-colors p-1"
                  title="Remove"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 4: SYNONYMS & QUOTE */}
      <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
        <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
          <Quote className="w-3.5 h-3.5 text-amber-400" />
          Synonyms & Wisdom Quote
        </label>
        <div>
          <span className="text-[10px] text-neutral-500 uppercase font-semibold">Synonyms Line</span>
          <input
            type="text"
            value={synonyms}
            onChange={e => setSynonyms(e.target.value)}
            className="w-full bg-[#18191c] border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:border-blue-500 outline-none mt-1"
          />
        </div>
        <div>
          <span className="text-[10px] text-neutral-500 uppercase font-semibold">Signature Quote</span>
          <textarea
            value={quote}
            onChange={e => setQuote(e.target.value)}
            rows={2}
            className="w-full bg-[#18191c] border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:border-blue-500 outline-none mt-1 resize-none"
          />
        </div>
      </div>

      {/* SECTION 5: COLOR THEMES */}
      <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
        <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
          <Palette className="w-3.5 h-3.5 text-purple-400" />
          Editorial Color Themes
        </label>
        <div className="grid grid-cols-2 gap-2">
          {TYPO_THEMES.map(th => (
            <button
              key={th.name}
              onClick={() => {
                setBgColor(th.bg);
                setTextColor(th.text);
                setSubColor(th.sub);
              }}
              className="flex items-center gap-2.5 p-2 rounded-lg bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-left transition-all group"
            >
              <div 
                className="w-5 h-5 rounded-full border border-neutral-700 shrink-0" 
                style={{ backgroundColor: th.bg }}
              />
              <span className="text-[11px] font-medium text-neutral-300 group-hover:text-white truncate">
                {th.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <ModernStudioLayout
      title="Typography & Manifesto Studio"
      category="Editorial Art"
      onBack={() => navigate('/')}
      onDownloadPNG={handleDownloadPNG}
      onDownloadPDF={handleDownloadPDF}
      isExporting={isExporting}
      presets={typoPresets}
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
