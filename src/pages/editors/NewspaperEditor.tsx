import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import jsPDF from 'jspdf';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ModernStudioLayout, { PresetItem } from '../../components/ModernStudioLayout';
import { POSTER_PRESETS } from '../../lib/presets';
import { Sparkles, Newspaper, Type, Check } from 'lucide-react';

const NEWS_PRESETS_DATA: Record<string, any> = {
  'birthday-chronicle': {
    masthead: 'THE BIRTHDAY CHRONICLE',
    edition: 'SPECIAL COMMEMORATIVE EDITION • VOL. 18 NO. 1',
    dateText: 'MAY 14, 2026 • WEATHER: PURE SUNSHINE',
    headline: 'LOCAL LEGEND CELEBRATES 18TH BIRTHDAY IN STYLE',
    subhead: 'Friends and family gather from around the world to honor a truly extraordinary milestone.',
    leadStory: 'It was a day that will go down in history books. Citizens gathered across the city to celebrate eighteen magnificent years of laughter, kindness, brilliance, and unstoppable ambition. Sources confirm that the future has never looked brighter.',
    sideStory: 'EXTRA! EXTRA!\nExclusive interviews with lifelong friends reveal legendary stories of childhood adventures, inside jokes, and dreams that turned into reality.',
    bgColor: '#faf6eb',
    textColor: '#1c1917'
  }
};

export default function NewspaperEditor() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const presetParam = searchParams.get('preset') || 'birthday-chronicle';

  const [activePreset, setActivePreset] = useState<string>(presetParam);
  const initial = NEWS_PRESETS_DATA[presetParam] || NEWS_PRESETS_DATA['birthday-chronicle'];

  const [masthead, setMasthead] = useState(initial.masthead);
  const [edition, setEdition] = useState(initial.edition);
  const [dateText, setDateText] = useState(initial.dateText);
  const [headline, setHeadline] = useState(initial.headline);
  const [subhead, setSubhead] = useState(initial.subhead);
  const [leadStory, setLeadStory] = useState(initial.leadStory);
  const [sideStory, setSideStory] = useState(initial.sideStory);

  const [bgColor, setBgColor] = useState(initial.bgColor);
  const [textColor, setTextColor] = useState(initial.textColor);

  const [zoom, setZoom] = useState(1);
  const [printSize, setPrintSize] = useState('18x24');
  const [isExporting, setIsExporting] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Chomsky&family=Cinzel:wght@700;900&family=Inter:wght@400;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  const handlePresetSelect = (id: string) => {
    setActivePreset(id);
    const data = NEWS_PRESETS_DATA[id];
    if (data) {
      setMasthead(data.masthead);
      setEdition(data.edition);
      setDateText(data.dateText);
      setHeadline(data.headline);
      setSubhead(data.subhead);
      setLeadStory(data.leadStory);
      setSideStory(data.sideStory);
    } else {
      const general = (POSTER_PRESETS.NEWSPAPER as any[]).find(p => p.id === id);
      if (general) {
        setHeadline(general.label.toUpperCase());
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

    // Newsprint Vintage Background
    canvas.add(new fabric.Rect({
      left: 0, top: 0, width: w, height: h, fill: bgColor, selectable: false
    }));

    // Inset Margin
    canvas.add(new fabric.Rect({
      left: 36, top: 36, width: w - 72, height: h - 72, fill: 'transparent',
      stroke: textColor, strokeWidth: 0.5, opacity: 0.25, selectable: false
    }));

    let curY = 48;

    // Masthead Banner
    const mastEl = new fabric.Textbox(masthead.toUpperCase(), {
      left: w / 2, top: curY, width: w - 80, originX: 'center', textAlign: 'center',
      fontSize: 28, fontWeight: 900, fill: textColor, fontFamily: 'Playfair Display, serif',
      charSpacing: 60, selectable: false
    });
    canvas.add(mastEl);
    curY += mastEl.height + 6;

    // Edition Dateline Double Rule
    canvas.add(new fabric.Line([45, curY, w - 45, curY], {
      stroke: textColor, strokeWidth: 1.5, opacity: 0.85, selectable: false
    }));
    curY += 6;

    canvas.add(new fabric.Textbox(`${edition.toUpperCase()}   •   ${dateText.toUpperCase()}`, {
      left: w / 2, top: curY, width: w - 90, originX: 'center', textAlign: 'center',
      fontSize: 8.5, fontWeight: 700, fill: textColor, fontFamily: 'Inter, sans-serif',
      charSpacing: 100, selectable: false
    }));
    curY += 18;

    canvas.add(new fabric.Line([45, curY, w - 45, curY], {
      stroke: textColor, strokeWidth: 0.75, opacity: 0.6, selectable: false
    }));
    curY += 16;

    // Giant Headline
    const headEl = new fabric.Textbox(headline.toUpperCase(), {
      left: w / 2, top: curY, width: w - 90, originX: 'center', textAlign: 'center',
      fontSize: 26, fontWeight: 900, fill: textColor, fontFamily: 'Playfair Display, serif',
      lineHeight: 1.15, charSpacing: 40, selectable: false
    });
    canvas.add(headEl);
    curY += headEl.height + 10;

    // Subhead Italic
    const subEl = new fabric.Textbox(subhead, {
      left: w / 2, top: curY, width: w - 100, originX: 'center', textAlign: 'center',
      fontSize: 11, fontStyle: 'italic', fill: textColor, fontFamily: 'Playfair Display, serif',
      selectable: false
    });
    canvas.add(subEl);
    curY += subEl.height + 16;

    canvas.add(new fabric.Line([45, curY, w - 45, curY], {
      stroke: textColor, strokeWidth: 0.5, opacity: 0.3, selectable: false
    }));
    curY += 16;

    // Multi-Column Front Page Stories
    const colW = 240;
    const col1El = new fabric.Textbox(leadStory, {
      left: 55, top: curY, width: colW, fontSize: 10, lineHeight: 1.45,
      fill: textColor, fontFamily: 'Playfair Display, serif', textAlign: 'justify',
      selectable: false
    });
    canvas.add(col1El);

    // Column Divider Line
    canvas.add(new fabric.Line([w / 2, curY, w / 2, curY + 220], {
      stroke: textColor, strokeWidth: 0.5, opacity: 0.3, selectable: false
    }));

    const col2El = new fabric.Textbox(sideStory, {
      left: w / 2 + 15, top: curY, width: colW, fontSize: 10, lineHeight: 1.45,
      fill: textColor, fontFamily: 'Playfair Display, serif', textAlign: 'justify',
      selectable: false
    });
    canvas.add(col2El);

    canvas.renderAll();
  };

  useEffect(() => {
    renderCanvas();
  }, [masthead, edition, dateText, headline, subhead, leadStory, sideStory, bgColor, textColor]);

  const handleDownloadPNG = () => {
    if (!fabricRef.current) return;
    setIsExporting(true);
    const dataUrl = fabricRef.current.toDataURL({ format: 'png', multiplier: 3 });
    const link = document.createElement('a');
    link.download = `newspaper-poster-${activePreset}.png`;
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
    pdf.save(`newspaper-poster-300dpi-${activePreset}.pdf`);
    setIsExporting(false);
  };

  const newsPresetsList: PresetItem[] = (POSTER_PRESETS.NEWSPAPER as any[]).map(p => ({
    id: p.id,
    title: p.label,
    label: p.category
  }));

  const sidebar = (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
        <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Choose Newspaper Preset ({newsPresetsList.length})
        </label>
        <select
          value={activePreset}
          onChange={e => handlePresetSelect(e.target.value)}
          className="w-full bg-[#18191c] border border-neutral-700 rounded-lg px-3 py-2.5 text-xs text-white focus:border-amber-500 outline-none"
        >
          {newsPresetsList.map(p => (
            <option key={p.id} value={p.id}>
              {p.title} ({p.label})
            </option>
          ))}
        </select>
      </div>

      <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
        <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
          <Newspaper className="w-3.5 h-3.5 text-blue-400" />
          Masthead & Front Page Articles
        </label>

        <div>
          <span className="text-[10px] text-neutral-500 uppercase font-semibold">Newspaper Masthead</span>
          <input
            type="text"
            value={masthead}
            onChange={e => setMasthead(e.target.value)}
            className="w-full bg-[#18191c] border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white font-bold focus:border-amber-500 outline-none mt-1"
          />
        </div>

        <div>
          <span className="text-[10px] text-neutral-500 uppercase font-semibold">Main Headline</span>
          <input
            type="text"
            value={headline}
            onChange={e => setHeadline(e.target.value)}
            className="w-full bg-[#18191c] border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white font-bold focus:border-amber-500 outline-none mt-1"
          />
        </div>

        <div>
          <span className="text-[10px] text-neutral-500 uppercase font-semibold">Subhead</span>
          <input
            type="text"
            value={subhead}
            onChange={e => setSubhead(e.target.value)}
            className="w-full bg-[#18191c] border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:border-amber-500 outline-none mt-1"
          />
        </div>

        <div>
          <span className="text-[10px] text-neutral-500 uppercase font-semibold">Lead Article Story</span>
          <textarea
            value={leadStory}
            onChange={e => setLeadStory(e.target.value)}
            rows={4}
            className="w-full bg-[#18191c] border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:border-amber-500 outline-none mt-1 resize-none"
          />
        </div>
      </div>
    </div>
  );

  return (
    <ModernStudioLayout
      title="Vintage Newspaper Studio"
      category="Broadsheet Art"
      onBack={() => navigate('/')}
      onDownloadPNG={handleDownloadPNG}
      onDownloadPDF={handleDownloadPDF}
      isExporting={isExporting}
      presets={newsPresetsList}
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
