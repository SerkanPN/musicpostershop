import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import jsPDF from 'jspdf';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ModernStudioLayout, { PresetItem } from '../../components/ModernStudioLayout';
import { POSTER_PRESETS } from '../../lib/presets';
import { 
  Sparkles, Plus, Trash2, Sliders, Palette, Type, 
  Barcode, Receipt, FileText, Check
} from 'lucide-react';

interface ReceiptItem {
  name: string;
  price: string;
}

const RECEIPT_PRESET_DATA: Record<string, any> = {
  'love-invoice': {
    storeName: 'STORE OF UNCONDITIONAL LOVE',
    orderNum: 'ORDER #14022026',
    dateText: 'MAY 14, 2026 • TABLE FOR TWO',
    items: [
      { name: 'FIRST NERVOUS SMILES', price: 'PRICELESS' },
      { name: 'LATE NIGHT PHONE CALLS', price: '1,420 HRS' },
      { name: 'INSIDE JOKES SHARED', price: 'COUNTLESS' },
      { name: 'SPONTANEOUS ROAD TRIPS', price: '18 TRIPS' },
      { name: 'ARGUMENTS WON BY YOU', price: 'ALL OF THEM' },
      { name: 'BUTTERFLIES IN STOMACH', price: '100%' },
      { name: 'A LIFETIME OF HAPPINESS', price: 'INCLUDED' },
    ],
    subtotal: '100% DEVOTION',
    tax: '0.00 (NO TAX ON LOVE)',
    total: 'FOREVER & ALWAYS',
    barcodeText: 'I LOVE YOU MORE THAN YESTERDAY',
    footerText: 'THANK YOU FOR BEING MY FAVORITE PERSON',
    bgColor: '#fbfbfb',
    paperColor: '#ffffff',
    textColor: '#18181b',
    fontStyle: 'Space Mono, monospace'
  },
  'marathon-finisher': {
    storeName: 'BERLIN MARATHON FINISHER',
    orderNum: 'BIB #42195 • OFFICIAL SPLITS',
    dateText: 'SEP 24, 2026 • 09:15 AM',
    items: [
      { name: 'TOTAL DISTANCE', price: '42.195 KM' },
      { name: 'OFFICIAL CHIP TIME', price: '03:42:15' },
      { name: 'AVERAGE PACE', price: '05:16 /KM' },
      { name: 'HALF MARATHON SPLIT', price: '01:48:10' },
      { name: 'CALORIES BURNED', price: '3,150 KCAL' },
      { name: 'OVERALL PLACEMENT', price: 'TOP 12%' },
      { name: 'HEART RATE PEAK', price: '182 BPM' },
    ],
    subtotal: '42.195 KM CONQUERED',
    tax: 'SWEAT & DEDICATION',
    total: 'MEDAL SECURED',
    barcodeText: 'NEVER STOP RUNNING • PB CRUSHED',
    footerText: 'PAIN IS TEMPORARY • GLORY IS FOREVER',
    bgColor: '#111827',
    paperColor: '#f9fafb',
    textColor: '#111827',
    fontStyle: 'Space Mono, monospace'
  },
  'cafe-bistro': {
    storeName: 'THE ARTISAN COFFEE ROASTERS',
    orderNum: 'TICKET #042 • MORNING RUSH',
    dateText: 'TODAY • 08:30 AM',
    items: [
      { name: 'DOUBLE ESPRESSO (ETHIOPIA)', price: '$4.50' },
      { name: 'OAT MILK CORTADO', price: '$5.00' },
      { name: 'AVOCADO TOAST ON SOURDOUGH', price: '$12.50' },
      { name: 'PISTACHIO CROISSANT', price: '$4.75' },
      { name: 'COLD BREW REFILL', price: '$4.00' },
    ],
    subtotal: '$30.75',
    tax: 'TAX (8.5%): $2.61',
    total: '$33.36 (PAID)',
    barcodeText: 'CRAFT COFFEE & GOOD VIBES',
    footerText: 'LIFE BEGINS AFTER COFFEE',
    bgColor: '#faf6f0',
    paperColor: '#fffefc',
    textColor: '#3e2723',
    fontStyle: 'Space Mono, monospace'
  },
  'gym': {
    storeName: 'BEAST MODE FITNESS LOG',
    orderNum: 'PHASE 4: HYPERTROPHY',
    dateText: 'SEASON 2026 • SQUAT RACK 3',
    items: [
      { name: 'STARTING WEIGHT', price: '94.0 KG' },
      { name: 'CURRENT LEAN WEIGHT', price: '76.5 KG' },
      { name: 'BENCH PRESS 1RM', price: '140 KG' },
      { name: 'DEADLIFT RECORD', price: '220 KG' },
      { name: 'WORKOUTS COMPLETED', price: '248 DAYS' },
      { name: 'PROTEIN SHAKES DRUNK', price: '500+ L' },
    ],
    subtotal: '100% DISCIPLINE',
    tax: 'ZERO EXCUSES',
    total: 'TRANSFORMATION COMPLETE',
    barcodeText: 'NEVER SKIP LEG DAY',
    footerText: 'CONSISTENCY OVER INTENSITY',
    bgColor: '#09090b',
    paperColor: '#f4f4f5',
    textColor: '#18181b',
    fontStyle: 'Space Mono, monospace'
  }
};

const RECEIPT_THEMES = [
  { name: 'Classic Thermal', bg: '#18181b', paper: '#ffffff', text: '#18181b' },
  { name: 'Matte Minimalist', bg: '#fafafa', paper: '#f4f4f5', text: '#09090b' },
  { name: 'Vintage Newsprint', bg: '#292524', paper: '#f5f0eb', text: '#292524' },
  { name: 'Dark Cyberpunk', bg: '#050505', paper: '#18181b', text: '#f43f5e' },
  { name: 'Warm Parchment', bg: '#451a03', paper: '#fffdfa', text: '#451a03' }
];

export default function ReceiptEditor() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const presetParam = searchParams.get('preset') || 'love-invoice';

  const [activePreset, setActivePreset] = useState<string>(presetParam);
  const initial = RECEIPT_PRESET_DATA[presetParam] || RECEIPT_PRESET_DATA['love-invoice'];

  const [storeName, setStoreName] = useState(initial.storeName);
  const [orderNum, setOrderNum] = useState(initial.orderNum);
  const [dateText, setDateText] = useState(initial.dateText);
  const [items, setItems] = useState<ReceiptItem[]>(initial.items);
  const [subtotal, setSubtotal] = useState(initial.subtotal);
  const [tax, setTax] = useState(initial.tax);
  const [total, setTotal] = useState(initial.total);
  const [barcodeText, setBarcodeText] = useState(initial.barcodeText);
  const [footerText, setFooterText] = useState(initial.footerText);

  const [bgColor, setBgColor] = useState(initial.bgColor);
  const [paperColor, setPaperColor] = useState(initial.paperColor);
  const [textColor, setTextColor] = useState(initial.textColor);

  const [zoom, setZoom] = useState(1);
  const [printSize, setPrintSize] = useState('18x24');
  const [isExporting, setIsExporting] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);

  // Load Google Monospace Fonts
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&family=Share+Tech+Mono&family=Inter:wght@400;600&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  // Handle Preset Switching
  const handlePresetSelect = (id: string) => {
    setActivePreset(id);
    const data = RECEIPT_PRESET_DATA[id];
    if (data) {
      setStoreName(data.storeName);
      setOrderNum(data.orderNum);
      setDateText(data.dateText);
      setItems(data.items);
      setSubtotal(data.subtotal);
      setTax(data.tax);
      setTotal(data.total);
      setBarcodeText(data.barcodeText);
      setFooterText(data.footerText);
      setBgColor(data.bgColor);
      setPaperColor(data.paperColor);
      setTextColor(data.textColor);
    } else {
      const general = (POSTER_PRESETS.RECEIPT as any[]).find(p => p.id === id);
      if (general) {
        setStoreName(general.label.toUpperCase());
        setOrderNum(`REF: ${id.replace('-', '').toUpperCase()}`);
      }
    }
  };

  // Add / Remove item
  const handleAddItem = () => {
    setItems([...items, { name: 'NEW MILESTONE / ITEM', price: '$10.00' }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: 'name' | 'price', val: string) => {
    const next = [...items];
    next[index][field] = val;
    setItems(next);
  };

  // Render Canvas with Ultra-Realistic Thermal Paper Receipt Graphics
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

    // 2. Receipt Paper Dimension & Jagged Edge Geometry
    const pw = 420;
    const ph = 700;
    const px = (w - pw) / 2;
    const py = (h - ph) / 2;

    // Paper Drop Shadow
    const shadow = new fabric.Rect({
      left: px + 6, top: py + 8, width: pw, height: ph, fill: '#000000',
      opacity: 0.18, rx: 2, ry: 2, selectable: false
    });
    canvas.add(shadow);

    // Main Paper Body
    const paper = new fabric.Rect({
      left: px, top: py, width: pw, height: ph, fill: paperColor,
      stroke: '#e4e4e7', strokeWidth: 0.5, selectable: false
    });
    canvas.add(paper);

    // Serrated Zigzag Cut Effect on Top and Bottom
    const teethCount = 28;
    const toothW = pw / teethCount;
    const toothH = 4;

    for (let t = 0; t < teethCount; t++) {
      const tx = px + (t * toothW);
      // Top tooth
      const topTooth = new fabric.Triangle({
        left: tx, top: py - 2, width: toothW, height: toothH,
        fill: bgColor, angle: 180, originX: 'left', originY: 'top', selectable: false
      });
      canvas.add(topTooth);

      // Bottom tooth
      const btmTooth = new fabric.Triangle({
        left: tx, top: py + ph - 2, width: toothW, height: toothH,
        fill: bgColor, originX: 'left', originY: 'top', selectable: false
      });
      canvas.add(btmTooth);
    }

    let curY = py + 32;

    // 3. Receipt Store Header
    const storeEl = new fabric.Textbox(storeName.toUpperCase(), {
      left: w / 2, top: curY, width: pw - 50, originX: 'center', textAlign: 'center',
      fontSize: 15, fontWeight: 700, fill: textColor, fontFamily: 'Space Mono, monospace',
      charSpacing: 80, selectable: false
    });
    canvas.add(storeEl);
    curY += storeEl.height + 10;

    // Order info & date
    const metaEl = new fabric.Textbox(`${orderNum}\n${dateText}`, {
      left: w / 2, top: curY, width: pw - 50, originX: 'center', textAlign: 'center',
      fontSize: 9.5, fill: textColor, fontFamily: 'Space Mono, monospace',
      opacity: 0.8, selectable: false
    });
    canvas.add(metaEl);
    curY += metaEl.height + 16;

    // Dotted separator line
    const dotLine1 = new fabric.Line([px + 20, curY, px + pw - 20, curY], {
      stroke: textColor, strokeWidth: 1, strokeDashArray: [4, 4], opacity: 0.6, selectable: false
    });
    canvas.add(dotLine1);
    curY += 14;

    // Column Headers
    canvas.add(new fabric.Textbox('DESCRIPTION', {
      left: px + 24, top: curY, fontSize: 9.5, fontWeight: 700, fill: textColor,
      fontFamily: 'Space Mono, monospace', selectable: false
    }));
    canvas.add(new fabric.Textbox('QTY/VAL', {
      left: px + pw - 100, top: curY, width: 76, textAlign: 'right', fontSize: 9.5,
      fontWeight: 700, fill: textColor, fontFamily: 'Space Mono, monospace', selectable: false
    }));
    curY += 18;

    const dotLine2 = new fabric.Line([px + 20, curY, px + pw - 20, curY], {
      stroke: textColor, strokeWidth: 1, strokeDashArray: [4, 4], opacity: 0.6, selectable: false
    });
    canvas.add(dotLine2);
    curY += 14;

    // 4. Line Items
    items.slice(0, 9).forEach((item) => {
      const itemTitle = new fabric.Textbox(item.name.toUpperCase(), {
        left: px + 24, top: curY, width: pw - 140, fontSize: 9.5, fill: textColor,
        fontFamily: 'Space Mono, monospace', fontWeight: 600, selectable: false
      });
      canvas.add(itemTitle);

      const itemPrice = new fabric.Textbox(item.price.toUpperCase(), {
        left: px + pw - 120, top: curY, width: 96, textAlign: 'right', fontSize: 9.5,
        fill: textColor, fontFamily: 'Space Mono, monospace', fontWeight: 600, selectable: false
      });
      canvas.add(itemPrice);

      curY += Math.max(itemTitle.height, 18) + 6;
    });

    curY += 6;
    // Dotted separator line before total
    const dotLine3 = new fabric.Line([px + 20, curY, px + pw - 20, curY], {
      stroke: textColor, strokeWidth: 1, strokeDashArray: [4, 4], opacity: 0.6, selectable: false
    });
    canvas.add(dotLine3);
    curY += 12;

    // Subtotal, Tax, Total
    canvas.add(new fabric.Textbox('SUBTOTAL', {
      left: px + 24, top: curY, fontSize: 9.5, fill: textColor, opacity: 0.8,
      fontFamily: 'Space Mono, monospace', selectable: false
    }));
    canvas.add(new fabric.Textbox(subtotal.toUpperCase(), {
      left: px + pw - 150, top: curY, width: 126, textAlign: 'right', fontSize: 9.5,
      fill: textColor, opacity: 0.8, fontFamily: 'Space Mono, monospace', selectable: false
    }));
    curY += 16;

    if (tax) {
      canvas.add(new fabric.Textbox(tax.toUpperCase(), {
        left: px + 24, top: curY, width: pw - 48, fontSize: 8.5, fill: textColor,
        opacity: 0.65, fontFamily: 'Space Mono, monospace', selectable: false
      }));
      curY += 16;
    }

    // Bold Total
    canvas.add(new fabric.Textbox('TOTAL', {
      left: px + 24, top: curY, fontSize: 13, fontWeight: 700, fill: textColor,
      fontFamily: 'Space Mono, monospace', selectable: false
    }));
    canvas.add(new fabric.Textbox(total.toUpperCase(), {
      left: px + pw - 170, top: curY, width: 146, textAlign: 'right', fontSize: 13,
      fontWeight: 700, fill: textColor, fontFamily: 'Space Mono, monospace', selectable: false
    }));
    curY += 24;

    const solidLine = new fabric.Line([px + 20, curY, px + pw - 20, curY], {
      stroke: textColor, strokeWidth: 1.5, opacity: 0.8, selectable: false
    });
    canvas.add(solidLine);
    curY += 14;

    // 5. Authentic Barcode Graphics
    const barCount = 42;
    const barStartX = px + (pw - 260) / 2;
    for (let b = 0; b < barCount; b++) {
      const bw = (b % 3 === 0 || b % 5 === 0) ? 3 : 1.5;
      const bx = barStartX + (b * 6.2);
      const barEl = new fabric.Rect({
        left: bx, top: curY, width: bw, height: 36, fill: textColor,
        opacity: 0.88, selectable: false
      });
      canvas.add(barEl);
    }
    curY += 40;

    canvas.add(new fabric.Textbox(barcodeText.toUpperCase(), {
      left: w / 2, top: curY, width: pw - 40, originX: 'center', textAlign: 'center',
      fontSize: 8.5, fontWeight: 600, fill: textColor, fontFamily: 'Space Mono, monospace',
      charSpacing: 180, selectable: false
    }));
    curY += 18;

    canvas.add(new fabric.Textbox(footerText.toUpperCase(), {
      left: w / 2, top: curY, width: pw - 40, originX: 'center', textAlign: 'center',
      fontSize: 8, fontStyle: 'italic', fill: textColor, opacity: 0.7,
      fontFamily: 'Space Mono, monospace', selectable: false
    }));

    canvas.renderAll();
  };

  useEffect(() => {
    renderCanvas();
  }, [
    storeName, orderNum, dateText, items, subtotal, tax, total,
    barcodeText, footerText, bgColor, paperColor, textColor
  ]);

  const handleDownloadPNG = () => {
    if (!fabricRef.current) return;
    setIsExporting(true);
    const dataUrl = fabricRef.current.toDataURL({ format: 'png', multiplier: 3 });
    const link = document.createElement('a');
    link.download = `receipt-poster-${activePreset}.png`;
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
    pdf.save(`receipt-poster-300dpi-${activePreset}.pdf`);
    setIsExporting(false);
  };

  const receiptPresets: PresetItem[] = (POSTER_PRESETS.RECEIPT as any[]).map(p => ({
    id: p.id,
    title: p.label,
    label: p.category
  }));

  const sidebar = (
    <div className="space-y-6">
      {/* SECTION 1: PRESET CHOOSER */}
      <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
        <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Choose Receipt Preset ({receiptPresets.length})
        </label>
        <select
          value={activePreset}
          onChange={e => handlePresetSelect(e.target.value)}
          className="w-full bg-[#18191c] border border-neutral-700 rounded-lg px-3 py-2.5 text-xs text-white focus:border-amber-500 outline-none"
        >
          {receiptPresets.map(p => (
            <option key={p.id} value={p.id}>
              {p.title} ({p.label})
            </option>
          ))}
        </select>
      </div>

      {/* SECTION 2: STORE HEADER & META */}
      <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
        <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
          <Receipt className="w-3.5 h-3.5 text-blue-400" />
          Receipt Header & Details
        </label>

        <div>
          <span className="text-[10px] text-neutral-500 uppercase font-semibold">Store / Event Title</span>
          <input
            type="text"
            value={storeName}
            onChange={e => setStoreName(e.target.value)}
            className="w-full bg-[#18191c] border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white font-semibold focus:border-amber-500 outline-none mt-1"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] text-neutral-500 uppercase font-semibold">Order / Bib #</span>
            <input
              type="text"
              value={orderNum}
              onChange={e => setOrderNum(e.target.value)}
              className="w-full bg-[#18191c] border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-amber-500 outline-none mt-1"
            />
          </div>
          <div>
            <span className="text-[10px] text-neutral-500 uppercase font-semibold">Date & Time</span>
            <input
              type="text"
              value={dateText}
              onChange={e => setDateText(e.target.value)}
              className="w-full bg-[#18191c] border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-amber-500 outline-none mt-1"
            />
          </div>
        </div>
      </div>

      {/* SECTION 3: LINE ITEMS EDITOR */}
      <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5 text-emerald-400" />
            Receipt Line Items ({items.length})
          </label>
          <button
            onClick={handleAddItem}
            className="flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors"
          >
            <Plus className="w-3 h-3" /> Add Item
          </button>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-[#18191c] border border-neutral-800">
              <input
                type="text"
                value={item.name}
                onChange={e => handleItemChange(idx, 'name', e.target.value)}
                placeholder="Item name"
                className="flex-1 bg-transparent text-xs text-white focus:outline-none"
              />
              <input
                type="text"
                value={item.price}
                onChange={e => handleItemChange(idx, 'price', e.target.value)}
                placeholder="Price / Val"
                className="w-24 bg-neutral-900 px-2 py-1 rounded text-xs text-right text-amber-300 font-mono focus:outline-none"
              />
              {items.length > 2 && (
                <button
                  onClick={() => handleRemoveItem(idx)}
                  className="text-neutral-500 hover:text-rose-400 transition-colors p-1"
                  title="Remove"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-800">
          <div>
            <span className="text-[10px] text-neutral-500 uppercase font-semibold">Subtotal</span>
            <input
              type="text"
              value={subtotal}
              onChange={e => setSubtotal(e.target.value)}
              className="w-full bg-[#18191c] border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-amber-500 outline-none mt-1"
            />
          </div>
          <div>
            <span className="text-[10px] text-neutral-500 uppercase font-semibold">Total Display</span>
            <input
              type="text"
              value={total}
              onChange={e => setTotal(e.target.value)}
              className="w-full bg-[#18191c] border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold focus:border-amber-500 outline-none mt-1"
            />
          </div>
        </div>
      </div>

      {/* SECTION 4: BARCODE & FOOTER */}
      <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
        <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
          <Barcode className="w-3.5 h-3.5 text-purple-400" />
          Barcode & Footer Text
        </label>
        <div>
          <span className="text-[10px] text-neutral-500 uppercase font-semibold">Barcode Subtext</span>
          <input
            type="text"
            value={barcodeText}
            onChange={e => setBarcodeText(e.target.value)}
            className="w-full bg-[#18191c] border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:border-amber-500 outline-none mt-1"
          />
        </div>
        <div>
          <span className="text-[10px] text-neutral-500 uppercase font-semibold">Footer Note</span>
          <input
            type="text"
            value={footerText}
            onChange={e => setFooterText(e.target.value)}
            className="w-full bg-[#18191c] border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:border-amber-500 outline-none mt-1"
          />
        </div>
      </div>

      {/* SECTION 5: COLOR THEMES */}
      <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
        <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
          <Palette className="w-3.5 h-3.5 text-pink-400" />
          Receipt Color Schemes
        </label>
        <div className="grid grid-cols-2 gap-2">
          {RECEIPT_THEMES.map(th => (
            <button
              key={th.name}
              onClick={() => {
                setBgColor(th.bg);
                setPaperColor(th.paper);
                setTextColor(th.text);
              }}
              className="flex items-center gap-2.5 p-2 rounded-lg bg-neutral-950 border border-neutral-800 hover:border-neutral-700 text-left transition-all group"
            >
              <div 
                className="w-5 h-5 rounded border border-neutral-600 shrink-0" 
                style={{ backgroundColor: th.paper }}
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
      title="Vintage Receipt Studio"
      category="Retro Paper"
      onBack={() => navigate('/')}
      onDownloadPNG={handleDownloadPNG}
      onDownloadPDF={handleDownloadPDF}
      isExporting={isExporting}
      presets={receiptPresets}
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
