import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as fabric from 'fabric';
import jsPDF from 'jspdf';
import { AlertTriangle, Lock, MessageCircle, X, CheckCircle, Trash2, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';

const GOOGLE_FONTS = [
  "Courier Prime", "Inter", "Montserrat", "Roboto", "Oswald", "Bebas Neue", 
  "Space Mono", "VT323", "Share Tech Mono", "Inconsolata", "Playfair Display",
  "Nunito", "Bungee", "Fredoka One", "Russo One", "Teko", "Syncopate"
];

const PRINT_SIZES = [
  { value: '8.27x11.69', label: 'A4 (8.27" x 11.69")' },
  { value: '11.69x16.54', label: 'A3 (11.69" x 16.54")' },
  { value: '16.54x23.39', label: 'A2 (16.54" x 23.39")' },
  { value: '11x14', label: '11" x 14"' },
  { value: '12x18', label: '12" x 18"' },
  { value: '16x24', label: '16" x 24"' },
  { value: '18x24', label: '18" x 24"' },
  { value: '24x36', label: '24" x 36"' }
];

const PRESETS = [
  {
    id: 'love-invoice',
    label: 'Love Invoice',
    desc: 'List relationship milestones as billable items. The perfect romantic anniversary gift.',
    texts: {
      shopName: 'THE LOVE STORE CO.',
      address: 'INFINITY ROAD, AMOR DISTRICT',
      cashier: 'DESTINY',
      receiptNo: 'REC-LOVE-2026',
      taxRate: 0,
      discount: 100,
      footer: 'THANK YOU FOR BEING MY FOREVER',
      totalLabel: 'ETERNAL LOVE'
    },
    items: [
      { qty: '1', name: 'FIRST EYE CONTACT', price: 0.00 },
      { qty: '1', name: 'FIRST SWEET COFFEE DATE', price: 12.50 },
      { qty: '45', name: 'LATE NIGHT PHONE CALLS', price: 90.00 },
      { qty: '3', name: 'UNPLANNED ROAD TRIPS', price: 150.00 },
      { qty: '99', name: 'SHARED WARM HUGS', price: 0.00 },
      { qty: '1', name: 'PROMISE TO STAY FOREVER', price: 1000.00 }
    ],
    styling: {
      bg: '#fafafa',
      text: '#171717',
      font: 'Courier Prime'
    }
  },
  {
    id: 'marathon-finisher',
    label: 'Marathon Finisher',
    desc: 'Commemorate athletic achievements with a custom receipt showing race split records.',
    texts: {
      shopName: 'ATHLETIC TIMING INC.',
      address: '26.2 MILES FINISH LINE, BOSTON',
      cashier: 'CHIP TIMER #410',
      receiptNo: 'REC-RUN-42K',
      taxRate: 0,
      discount: 0,
      footer: 'PAIN IS TEMPORARY, PRIDE IS FOREVER',
      totalLabel: 'FINISH TIME'
    },
    items: [
      { qty: '10K', name: 'FIRST SECTOR SPLIT', price: 48.30 },
      { qty: '21K', name: 'HALF MARATHON MILESTONE', price: 104.15 },
      { qty: '30K', name: 'HIT THE WALL DEFIANCE', price: 155.00 },
      { qty: '42K', name: 'FINAL SPRINT REVELATION', price: 215.42 },
      { qty: '1', name: 'TOTAL CALORIES BURNED', price: 2800.00 }
    ],
    styling: {
      bg: '#0f172a',
      text: '#38bdf8',
      font: 'Space Mono'
    }
  },
  {
    id: 'cafe-bistro',
    label: 'Cafe & Bistro Menu',
    desc: 'A gorgeous vintage coffee house ticket displaying standard custom specials.',
    texts: {
      shopName: 'THE ROAST & BREW',
      address: '404 BEAN ST, ESPRESSOLAND',
      cashier: 'BARISTA MAX',
      receiptNo: 'REC-BREW-99',
      taxRate: 8,
      discount: 10,
      footer: 'LIFE BEGINS AFTER COFFEE',
      totalLabel: 'GRAND TOTAL'
    },
    items: [
      { qty: '2', name: 'DOUBLE SHOT CORTADO', price: 9.00 },
      { qty: '1', name: 'FRESH ALMOND CROISSANT', price: 5.50 },
      { qty: '1', name: 'V60 ETHIOPIA HAND BREW', price: 6.50 },
      { qty: '1', name: 'EXTRA COLD GOOD VIBES', price: 0.00 }
    ],
    styling: {
      bg: '#fffbf2',
      text: '#451a03',
      font: 'Courier Prime'
    }
  },
  {
    id: 'gamer-stats',
    label: 'Gamer Match Stats',
    desc: 'Display matches, wins, kills, and earned experience points like store items.',
    texts: {
      shopName: 'BATTLEFIELD MATRIX',
      address: 'SECTOR-7 COMPILER GATE',
      cashier: 'SYSTEM AI v2',
      receiptNo: 'REC-MATCH-107',
      taxRate: 0,
      discount: 0,
      footer: 'GG WP - LEVEL UP COMPLETED',
      totalLabel: 'XP EARNED'
    },
    items: [
      { qty: '24', name: 'CONFIRMED RIVAL KILLS', price: 2400 },
      { qty: '12', name: 'TACTICAL ASSISTS SECURED', price: 1200 },
      { qty: '1', name: 'CHAMPIONS MATCH WIN', price: 5000 },
      { qty: '3', name: 'HEADSHOT BONUSES', price: 300 }
    ],
    styling: {
      bg: '#020617',
      text: '#22c55e',
      font: 'VT323'
    }
  }
];

const DPI = 300;
const BASE_MAX_W = 550;
const BASE_MAX_H = 750;

interface ReceiptItem {
  qty: string;
  name: string;
  price: number;
}

interface OrientedSize {
  w: number;
  h: number;
}

function parseAndOrientSize(value: string, orientation: 'portrait' | 'landscape'): OrientedSize {
  const [w, h] = value.split('x').map(Number);
  if (orientation === 'landscape') {
    return { w: Math.max(w, h), h: Math.min(w, h) };
  }
  return { w: Math.min(w, h), h: Math.max(w, h) };
}

function fitContain(wIn: number, hIn: number, maxW: number, maxH: number) {
  const aspect = wIn / hIn;
  let width = maxW;
  let height = width / aspect;
  if (height > maxH) {
    height = maxH;
    width = height * aspect;
  }
  return { width: Math.round(width), height: Math.round(height) };
}

interface ReceiptPosterPageProps {
  navigate: (path: string) => void;
}

export default function ReceiptPosterPage({ navigate }: ReceiptPosterPageProps) {
  const canvasElRef = useRef<HTMLCanvasElement | null>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const bgRectRef = useRef<fabric.Rect | null>(null);

  const isRebuildingRef = useRef<boolean>(false);
  const token = window.location.pathname.split('/').filter(Boolean).pop() || '';

  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [isCheckingToken, setIsCheckingToken] = useState<boolean>(true);
  const [tokenError, setTokenError] = useState<string>('');

  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);
  const [userConfirmed, setUserConfirmed] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string>('');

  const [showSupportModal, setShowSupportModal] = useState<boolean>(false);
  const [supportMessage, setSupportMessage] = useState<string>('');
  const [sendingTicket, setSendingTicket] = useState<boolean>(false);
  const [ticketSubmitted, setTicketSubmitted] = useState<boolean>(false);
  const [isGeneratingFile, setIsGeneratingFile] = useState<boolean>(false);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    presets: true,
    size: false,
    header: false,
    items: false,
    calculations: false,
    styling: false
  });

  const [activePreset, setActivePreset] = useState<string>('love-invoice');

  const [canvasSize, setCanvasSize] = useState<string>('8.27x11.69'); 
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [containerDims, setContainerDims] = useState(() => {
    const { w, h } = parseAndOrientSize('8.27x11.69', 'portrait');
    return fitContain(w, h, BASE_MAX_W, BASE_MAX_H);
  });
  const [zoom, setZoom] = useState<number>(1);

  const [shopName, setShopName] = useState('THE LOVE STORE CO.');
  const [address, setAddress] = useState('INFINITY ROAD, AMOR DISTRICT');
  const [cashier, setCashier] = useState('DESTINY');
  const [receiptNo, setReceiptNo] = useState('REC-LOVE-2026');
  const [taxRate, setTaxRate] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(100);
  const [footer, setFooter] = useState('THANK YOU FOR BEING MY FOREVER');
  const [totalLabel, setTotalLabel] = useState('ETERNAL LOVE');

  const [items, setItems] = useState<ReceiptItem[]>([
    { qty: '1', name: 'FIRST EYE CONTACT', price: 0.00 },
    { qty: '1', name: 'FIRST SWEET COFFEE DATE', price: 12.50 },
    { qty: '45', name: 'LATE NIGHT PHONE CALLS', price: 90.00 },
    { qty: '3', name: 'UNPLANNED ROAD TRIPS', price: 150.00 },
    { qty: '99', name: 'SHARED WARM HUGS', price: 0.00 },
    { qty: '1', name: 'PROMISE TO STAY FOREVER', price: 1000.00 }
  ]);

  const [bgColor, setBgColor] = useState('#fafafa');
  const [textColor, setTextColor] = useState('#171717');
  const [fontFamily, setFontFamily] = useState('Courier Prime');

  const showToast = (msg: string) => {
    const el = document.querySelector('.rec-toast') as HTMLElement;
    if (el) {
      el.innerText = msg;
      el.style.opacity = '1';
      el.style.transform = 'translateX(-50%) translateY(0)';
      setTimeout(() => {
        el.style.opacity = '0';
        el.style.transform = 'translateX(-50%) translateY(20px)';
      }, 2200);
    }
  };

  const toggleAccordion = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const applyPreset = (presetId: string) => {
    setActivePreset(presetId);
    const preset = PRESETS.find(p => p.id === presetId);
    if (!preset) return;

    setShopName(preset.texts.shopName);
    setAddress(preset.texts.address);
    setCashier(preset.texts.cashier);
    setReceiptNo(preset.texts.receiptNo);
    setTaxRate(preset.texts.taxRate);
    setDiscount(preset.texts.discount);
    setFooter(preset.texts.footer);
    setTotalLabel(preset.texts.totalLabel);
    setItems(preset.items.map(item => ({ ...item })));
    setBgColor(preset.styling.bg);
    setTextColor(preset.styling.text);
    setFontFamily(preset.styling.font);

    showToast('Preset applied');
  };

  useEffect(() => {
    const checkToken = async () => {
      const hostname = window.location.hostname;
      const isAdmin = hostname.startsWith('serkan1881.') || localStorage.getItem('admin_session') === 'active';

      if (isAdmin) {
        setIsLocked(false);
        if (!token || token === 'demo-token' || token === 'receipt' || token.length < 10) {
          setIsCheckingToken(false);
          return;
        }
      } else {
        if (!token || token === 'demo-token') {
          setTokenError('Invalid or expired design link.');
          setIsCheckingToken(false);
          return;
        }
      }

      try {
        const { data, error } = await supabase
          .from('etsy_orders')
          .select('*')
          .eq('id', token)
          .single();

        if (error || !data) {
          if (isAdmin) {
            setIsCheckingToken(false);
            return;
          }
          setTokenError('Invalid or expired design link.');
          setIsCheckingToken(false);
          return;
        }

        if (data.status === 'completed') {
          if (isAdmin) {
            setIsLocked(false);
          } else {
            setIsLocked(true);
          }
        }

        if (data.design_state) {
          const ds = data.design_state;
          setCanvasSize(ds.canvasSize || '8.27x11.69');
          setOrientation(ds.orientation || 'portrait');
          setShopName(ds.shopName || '');
          setAddress(ds.address || '');
          setCashier(ds.cashier || '');
          setReceiptNo(ds.receiptNo || '');
          setTaxRate(ds.taxRate ?? 0);
          setDiscount(ds.discount ?? 0);
          setFooter(ds.footer || '');
          setTotalLabel(ds.totalLabel || '');
          setItems(ds.items || []);
          setBgColor(ds.bgColor || '#fafafa');
          setTextColor(ds.textColor || '#171717');
          setFontFamily(ds.fontFamily || 'Courier Prime');
        }
      } catch (err) {
        if (!isAdmin) {
          setTokenError('Connection error. Please reload.');
        }
      } finally {
        setIsCheckingToken(false);
      }
    };

    checkToken();
  }, [token]);

  useEffect(() => {
    if (isCheckingToken || tokenError || !canvasElRef.current) return;

    const canvas = new fabric.Canvas(canvasElRef.current, {
      width: containerDims.width,
      height: containerDims.height,
      backgroundColor: bgColor,
      preserveObjectStacking: true,
      selection: !isLocked,
    });
    fabricRef.current = canvas;

    const bgRect = new fabric.Rect({
      left: 0,
      top: 0,
      width: containerDims.width,
      height: containerDims.height,
      fill: bgColor,
      selectable: false,
      evented: false,
    });
    canvas.add(bgRect);
    bgRectRef.current = bgRect;

    drawReceiptStructure();

    const fontWeightsStr = ':100,100i,300,300i,400,400i,500,500i,600,600i,700,700i,800,800i,900,900i';
    const link = document.createElement('link');
    link.href = `https://fonts.googleapis.com/css?family=${GOOGLE_FONTS.map(f => f.replace(/ /g, '+') + fontWeightsStr).join('|')}&display=swap`;
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    canvas.renderAll();

    return () => {
      canvas.dispose();
    };
  }, [isCheckingToken, tokenError, isLocked, containerDims]);

  const drawReceiptStructure = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    isRebuildingRef.current = true;

    const objs = canvas.getObjects().filter(o => o !== bgRectRef.current);
    objs.forEach(o => canvas.remove(o));

    const cw = containerDims.width;
    const padding = cw * 0.1;
    const rw = cw - padding * 2;
    const lX = padding;
    const rX = cw - padding;

    let y = containerDims.height * 0.08;

    const drawText = (txt: string, size: number, weight: string, align: 'left' | 'center' | 'right', italic = false) => {
      const obj = new fabric.Text(txt, {
        left: align === 'center' ? cw / 2 : align === 'left' ? lX : rX,
        top: y,
        originX: align,
        fontSize: size,
        fontFamily: fontFamily,
        fontWeight: weight,
        fontStyle: italic ? 'italic' : 'normal',
        fill: textColor,
        selectable: !isLocked,
      });
      canvas.add(obj);
      return obj;
    };

    const drawDashedLine = () => {
      const line = new fabric.Line([lX, y, rX, y], {
        stroke: textColor,
        strokeWidth: 1.5,
        strokeDashArray: [5, 4],
        selectable: false,
      });
      canvas.add(line);
      y += 15;
    };

    drawText(shopName.toUpperCase(), 24, '800', 'center');
    y += 32;

    if (address) {
      drawText(address.toUpperCase(), 11, '400', 'center');
      y += 18;
    }

    y += 10;
    drawDashedLine();

    const now = new Date();
    const dateStr = `DATE: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
    drawText(dateStr, 11, '400', 'left');
    drawText(`RECEIPT: ${receiptNo.toUpperCase()}`, 11, '400', 'right');
    y += 18;

    drawText(`CASHIER: ${cashier.toUpperCase()}`, 11, '400', 'left');
    y += 24;

    drawDashedLine();

    drawText('QTY', 11, '700', 'left');
    drawText('DESCRIPTION', 11, '700', 'left');
    const descObj = canvas.getObjects()[canvas.getObjects().length - 1];
    descObj.set({ left: lX + 45 });
    drawText('PRICE', 11, '700', 'right');
    y += 22;

    drawDashedLine();

    let subtotal = 0;
    items.forEach((item) => {
      const lineTotal = item.price;
      subtotal += lineTotal;

      drawText(item.qty, 11, '400', 'left');
      
      const descStr = item.name.toUpperCase();
      drawText(descStr, 11, '400', 'left');
      const curDesc = canvas.getObjects()[canvas.getObjects().length - 1];
      curDesc.set({ left: lX + 45 });

      const priceStr = lineTotal === 0 ? 'FREE' : lineTotal.toFixed(2);
      drawText(priceStr, 11, '400', 'right');

      y += 18;
    });

    y += 10;
    drawDashedLine();

    const drawCalculationLine = (label: string, valStr: string, size = 11, weight = '400') => {
      drawText(label, size, weight, 'left');
      drawText(valStr, size, weight, 'right');
      y += 18;
    };

    const calculatedTax = subtotal * (taxRate / 100);
    const grandTotal = Math.max(0, subtotal + calculatedTax - discount);

    drawCalculationLine('SUBTOTAL', `$${subtotal.toFixed(2)}`);
    if (taxRate > 0) {
      drawCalculationLine(`TAX (${taxRate}%)`, `$${calculatedTax.toFixed(2)}`);
    }
    if (discount > 0) {
      drawCalculationLine('DISCOUNT', `-$${discount.toFixed(2)}`);
    }

    y += 6;
    drawDashedLine();

    drawCalculationLine(totalLabel.toUpperCase(), `$${grandTotal.toFixed(2)}`, 14, '800');

    y += 20;
    drawDashedLine();

    if (footer) {
      drawText(footer.toUpperCase(), 11, '600', 'center', true);
      y += 35;
    }

    const drawBarcode = () => {
      const barcodeGroupObjects = [];
      const codeStr = receiptNo.replace(/[^A-Za-z0-9]/g, '') || 'LOVE';
      const barcodeW = rw * 0.7;
      const barcodeX = (cw - barcodeW) / 2;
      const barcodeH = 35;

      const randomWithSeed = (seed: number) => {
        const x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
      };

      let bX = barcodeX;
      let seed = 42;
      while (bX < barcodeX + barcodeW) {
        const rVal = randomWithSeed(seed++);
        const thickness = rVal > 0.7 ? 4 : rVal > 0.4 ? 2 : 1;
        const gap = randomWithSeed(seed++) * 3 + 1;

        if (bX + thickness <= barcodeX + barcodeW) {
          const bar = new fabric.Rect({
            left: bX,
            top: y,
            width: thickness,
            height: barcodeH,
            fill: textColor,
            selectable: false,
          });
          barcodeGroupObjects.push(bar);
          canvas.add(bar);
        }
        bX += thickness + gap;
      }

      y += barcodeH + 8;
      drawText(codeStr.toUpperCase(), 10, '400', 'center');
    };

    drawBarcode();

    canvas.requestRenderAll();
    isRebuildingRef.current = false;
  };

  useEffect(() => {
    if (!isCheckingToken && !tokenError) {
      drawReceiptStructure();
    }
  }, [
    isCheckingToken, tokenError, shopName, address, cashier, receiptNo, 
    taxRate, discount, footer, totalLabel, items, bgColor, textColor, fontFamily
  ]);

  const updateItemField = (index: number, key: keyof ReceiptItem, value: string | number) => {
    setItems(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: value };
      return next;
    });
  };

  const addItemRow = () => {
    setItems(prev => [...prev, { qty: '1', name: 'NEW ITEM', price: 0.00 }]);
  };

  const removeItemRow = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSizeOrOrientationChange = (newSize: string, newOrient: 'portrait' | 'landscape') => {
    if (isLocked) return;
    setCanvasSize(newSize);
    setOrientation(newOrient);

    const { w, h } = parseAndOrientSize(newSize, newOrient);
    const dims = fitContain(w, h, BASE_MAX_W, BASE_MAX_H);
    setContainerDims(dims);

    const canvas = fabricRef.current;
    if (!canvas) return;

    canvas.setWidth(dims.width * zoom);
    canvas.setHeight(dims.height * zoom);
    if (bgRectRef.current) {
      bgRectRef.current.set({ width: dims.width, height: dims.height });
      bgRectRef.current.set('dirty', true);
    }
  };

  const triggerDownloadAction = async (format: 'png' | 'pdf' | 'svg') => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    setIsGeneratingFile(true);

    setTimeout(async () => {
      try {
        canvas.discardActiveObject();
        canvas.renderAll();

        const multiplier = getMultiplier();
        const { w, h } = parseAndOrientSize(canvasSize, orientation);

        if (format === 'png') {
          const dataUrl = canvas.toDataURL({ format: 'png', multiplier });
          const a = document.createElement('a');
          a.href = dataUrl;
          a.download = `receipt-poster.png`;
          a.click();
        } else if (format === 'pdf') {
          const dataUrl = canvas.toDataURL({ format: 'png', multiplier });
          const pdf = new jsPDF({ orientation: w > h ? 'landscape' : 'portrait', unit: 'in', format: [w, h] });
          pdf.addImage(dataUrl, 'PNG', 0, 0, w, h);
          pdf.save(`receipt-poster.pdf`);
        } else if (format === 'svg') {
          const svg = canvas.toSVG();
          const blob = new Blob([svg], { type: 'image/svg+xml' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `receipt-poster.svg`;
          a.click();
          URL.revokeObjectURL(url);
        }

        const designStateJSON = {
          canvasSize, orientation, shopName, address, cashier, receiptNo,
          taxRate, discount, footer, totalLabel, items, bgColor, textColor, fontFamily
        };

        if (token && token !== 'demo-token') {
          await supabase
            .from('etsy_orders')
            .update({
              status: 'completed',
              design_state: designStateJSON,
              download_started_at: new Date().toISOString()
            })
            .eq('id', token);
        }

        setShowReviewModal(false);
        setIsLocked(true);
      } catch (err) {
        showToast('Export failed. Please try again.');
      } finally {
        setIsGeneratingFile(false);
      }
    }, 100);
  };

  const handleDownloadMasterpieceClick = () => {
    const canvas = fabricRef.current;
    if (canvas) {
      canvas.discardActiveObject();
      canvas.requestRenderAll();
      try {
        const dataUrl = canvas.toDataURL({ format: 'png', multiplier: 2.0 });
        setPreviewImage(dataUrl);
      } catch (err) {
        setPreviewImage('');
      }
    }
    setShowReviewModal(true);
  };

  const handleSupportClick = () => {
    setShowSupportModal(true);
  };

  const submitSupportTicket = async () => {
    if (!supportMessage.trim()) return;
    setSendingTicket(true);
    try {
      const { error } = await supabase
        .from('support_tickets')
        .insert({
          order_id: token,
          message: supportMessage.trim()
        });

      if (error) throw error;
      setTicketSubmitted(true);
    } catch (err) {
      showToast('Failed to send message.');
    } finally {
      setSendingTicket(false);
    }
  };

  if (isCheckingToken) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (tokenError) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
        <div className="text-center max-w-md bg-zinc-900 border border-zinc-800 p-8 rounded-3xl shadow-2xl">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-black uppercase mb-2">Access Denied</h1>
          <p className="text-zinc-400 text-sm mb-6 leading-relaxed">{tokenError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`soundwave-poster-page ${isLocked ? 'locked-mode' : ''}`}>
      <style>{`
        .soundwave-poster-page {
          --panel-bg: #0d0d0d;
          --panel-border: #1e1e1e;
          --spotify-text: #ffffff;
          --spotify-subtext: #8a8a8a;
          --accent: #1DB954;
          --input-bg: #161616;
          --input-border: #262626;
          display: flex;
          height: 100vh;
          width: 100%;
          background: #000;
          color: var(--spotify-text);
          font-family: 'DM Sans', sans-serif;
          overflow: hidden;
        }
        .soundwave-poster-page.locked-mode #panel,
        .soundwave-poster-page.locked-mode #props-panel {
          display: none;
        }
        .soundwave-poster-page.locked-mode #canvas-area {
          padding-top: 100px;
        }
        .soundwave-poster-page #panel {
          width: 300px;
          min-width: 300px;
          background: var(--panel-bg);
          border-right: 1px solid var(--panel-border);
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }
        .soundwave-poster-page #panel::-webkit-scrollbar { width: 3px; }
        .soundwave-poster-page #panel::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
        .soundwave-poster-page .panel-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px; border-bottom: 1px solid var(--panel-border); flex-shrink: 0;
        }
        .soundwave-poster-page .title-group { display: flex; align-items: center; gap: 8px; }
        .soundwave-poster-page .title-group h1 {
          font-size: 13px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; margin: 0;
        }
        .soundwave-poster-page .back-btn {
          background: none; border: 1px solid var(--panel-border); color: var(--spotify-subtext);
          font-size: 11px; padding: 6px 10px; border-radius: 6px; cursor: pointer; font-family: inherit;
          transition: all 0.15s;
        }
        .soundwave-poster-page .back-btn:hover { color: var(--spotify-text); border-color: #333; }

        .soundwave-poster-page .form-row { padding: 0 16px 12px; }
        .soundwave-poster-page .form-row label {
          display: block; font-size: 10px; color: var(--spotify-subtext); margin-bottom: 5px;
          text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600;
        }
        .soundwave-poster-page .form-row input[type=text],
        .soundwave-poster-page .form-row input[type=number],
        .soundwave-poster-page .form-row select,
        .soundwave-poster-page .form-row textarea {
          width: 100%; background: var(--input-bg); border: 1px solid var(--input-border);
          border-radius: 6px; color: var(--spotify-text); padding: 8px 10px; font-size: 12px;
          font-family: inherit; outline: none; transition: border-color 0.15s; box-sizing: border-box;
        }
        .soundwave-poster-page .form-row input[type=text]:focus,
        .soundwave-poster-page .form-row select:focus,
        .soundwave-poster-page .form-row textarea:focus { border-color: var(--accent); }
        .soundwave-poster-page .form-row select option { background: #1a1a1a; }

        .soundwave-poster-page .color-row { display: flex; gap: 8px; align-items: center; padding: 0 16px 12px; }
        .soundwave-poster-page .color-row input[type=color] {
          width: 34px; height: 30px; border: none; border-radius: 6px; padding: 2px;
          background: var(--input-bg); cursor: pointer; flex-shrink: 0;
        }
        .soundwave-poster-page .color-row input[type=text] {
          flex: 1; background: var(--input-bg); border: 1px solid var(--input-border);
          border-radius: 6px; color: var(--spotify-text); padding: 6px 8px; font-size: 11px; font-family: inherit;
        }

        .soundwave-poster-page .range-row { display: flex; align-items: center; gap: 8px; padding: 0 16px 12px; }
        .soundwave-poster-page .range-row input[type=range] { flex: 1; accent-color: var(--accent); cursor: pointer; }
        .soundwave-poster-page .range-val { font-size: 10px; color: var(--accent); font-weight: 600; min-width: 34px; text-align: right; }

        .soundwave-poster-page .btn {
          border: none; border-radius: 6px; padding: 9px 14px; font-size: 12px; font-weight: 600;
          cursor: pointer; font-family: inherit; transition: opacity 0.15s;
        }
        .soundwave-poster-page .btn:hover { opacity: 0.85; }
        .soundwave-poster-page .btn-primary { background: var(--accent); color: #000; }
        .soundwave-poster-page .btn-secondary {
          background: var(--input-bg); color: var(--spotify-text); border: 1px solid var(--input-border); flex: 1;
        }

        .soundwave-poster-page .canvas-header-actions {
          display: flex; gap: 8px; margin-bottom: 24px; z-index: 50; position: relative;
        }
        .soundwave-poster-page .btn-masterpiece {
          background: linear-gradient(to right, #4f46e5, #9333ea);
          color: white;
          padding: 12px 32px;
          font-size: 14px;
          border-radius: 30px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          box-shadow: 0 10px 25px rgba(79, 70, 229, 0.4);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .soundwave-poster-page .btn-masterpiece:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 30px rgba(79, 70, 229, 0.6);
        }

        .soundwave-poster-page #canvas-area {
          flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-start;
          background: #0d0d0d; padding: 30px; overflow: auto; position: relative;
        }
        .soundwave-poster-page #canvas-area::before {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(ellipse at center, #1a1a1a 0%, #0d0d0d 70%); pointer-events: none;
        }
        .soundwave-poster-page #poster-wrapper {
          position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; gap: 20px;
          padding: 40px;
        }
        .soundwave-poster-page #poster-container {
          position: relative; overflow: hidden;
          box-shadow: 0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05);
          border-radius: 4px;
          transform-origin: center center;
          transition: transform 0.15s ease-out, width 0.4s cubic-bezier(0.4,0,0.2,1), height 0.4s cubic-bezier(0.4,0,0.2,1);
        }

        .soundwave-poster-page .accordion-btn {
          width: 100%; background: none; border: none; color: var(--spotify-subtext);
          font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
          text-align: left; padding: 16px; cursor: pointer; display: flex; justify-content: space-between;
          align-items: center; border-bottom: 1px solid var(--panel-border); font-family: 'DM Sans', sans-serif;
          transition: color 0.15s;
        }
        .soundwave-poster-page .accordion-btn:hover { color: var(--spotify-text); }
        .soundwave-poster-page .accordion-btn .arrow { font-size: 9px; transition: transform 0.2s; }
        .soundwave-poster-page .accordion-btn.open .arrow { transform: rotate(180deg); }
        .soundwave-poster-page .accordion-content { display: none; padding: 14px 0; border-bottom: 1px solid var(--panel-border); }
        .soundwave-poster-page .accordion-content.open { display: block; }

        .orient-group { display: flex; gap: 8px; margin-top: 8px; }

        .review-modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.95); backdrop-filter: blur(15px);
          display: flex; align-items: flex-start; justify-content: center; z-index: 9999; overflow-y: auto; padding: 40px 20px;
        }
        .review-modal-content {
          max-width: 900px; width: 100%; display: flex; flex-direction: column; align-items: center; gap: 30px;
        }
        .review-warning-box {
          background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2);
          padding: 16px 24px; border-radius: 12px; display: flex; gap: 16px; align-items: center; width: 100%;
        }
        .review-preview-img {
          width: auto; max-height: 75vh; object-fit: contain; box-shadow: 0 20px 60px rgba(0,0,0,0.8);
          border: 1px solid rgba(255,255,255,0.1); border-radius: 4px;
        }
        .review-action-area {
          width: 100%; display: flex; flex-direction: column; align-items: center; gap: 24px;
        }
        .review-checkbox-wrapper {
          display: flex; align-items: center; gap: 12px; cursor: pointer;
          background: #1a1a1a; padding: 16px 24px; border-radius: 12px; border: 1px solid #333; transition: border-color 0.2s;
          width: 100%; justify-content: center;
        }
        .review-checkbox-wrapper input[type=checkbox] { width: 24px; height: 24px; accent-color: var(--accent); cursor: pointer; }
        .review-btn-grid { display: flex; gap: 12px; width: 100%; justify-content: center; flex-wrap: wrap; }
        .review-btn-grid button {
          padding: 16px 32px; border-radius: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; font-size: 14px; min-width: 240px;
        }

        .readonly-banner {
          position: fixed; top: 24px; left: 50%; transform: translateX(-50%);
          background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3);
          color: #fca5a5; padding: 16px 24px; border-radius: 16px; display: flex; align-items: center; justify-content: space-between;
          max-width: 800px; width: 90%; box-shadow: 0 10px 30px rgba(0,0,0,0.8); z-index: 1000; backdrop-filter: blur(10px);
        }
        .rec-toast {
          position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%) translateY(20px);
          background: var(--accent); color: #000; padding: 10px 20px; border-radius: 24px;
          font-size: 13px; font-weight: 600; opacity: 0; transition: all 0.3s; z-index: 9999; pointer-events: none;
        }
        .file-generator-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(10px);
          display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 10000;
        }

        .items-editor-table {
          width: 100%; border-collapse: collapse; margin-top: 8px;
        }
        .items-editor-table th {
          text-align: left; font-size: 9px; text-transform: uppercase; color: var(--spotify-subtext); padding-bottom: 6px;
        }
        .items-editor-table td {
          padding: 4px 0;
        }
        .items-editor-table input {
          background: var(--input-bg); border: 1px solid var(--input-border); color: #fff;
          font-family: inherit; font-size: 11px; padding: 6px; border-radius: 4px; outline: none; width: 100%; box-sizing: border-box;
        }
        .items-editor-table input:focus { border-color: var(--accent); }
        .trash-btn {
          background: none; border: none; color: #ef4444; cursor: pointer; display: flex; align-items: center; justify-content: center;
        }
        .trash-btn:hover { color: #f87171; }
      `}</style>

      {isGeneratingFile && (
        <div className="file-generator-overlay">
          <div className="text-center bg-zinc-900 border border-zinc-800 p-8 rounded-3xl max-w-md shadow-2xl flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
            <h3 className="text-lg font-black uppercase text-white mb-2 tracking-wider">Generating File</h3>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Your high-resolution file is being generated... Please wait.
            </p>
          </div>
        </div>
      )}

      {isLocked && (
        <div className="readonly-banner">
          <div>
            <div className="flex items-center gap-2 text-red-200 font-bold mb-1">
              <Lock className="w-4 h-4" /> Design Locked (Read-Only Mode)
            </div>
            <p className="text-xs text-red-300/80">Your design has been finalized. If you made a mistake, please contact support.</p>
          </div>
          <button onClick={handleSupportClick} className="flex items-center gap-2 bg-red-950 border border-red-900 text-red-200 px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-900 transition-colors cursor-pointer">
            <MessageCircle className="w-4 h-4" /> Open Support Ticket
          </button>
        </div>
      )}

      {showReviewModal && (
        <div className="review-modal-overlay">
          <div className="review-modal-content">
            <div className="review-warning-box">
              <AlertTriangle className="w-8 h-8 text-red-400 shrink-0" />
              <div>
                <h3 className="text-red-400 font-black uppercase tracking-wider mb-1">Final Review</h3>
                <p className="text-red-200/80 text-sm leading-relaxed">
                  Please review your receipt design carefully. Check all spellings, totals, and line items.
                </p>
              </div>
            </div>

            {previewImage && <img src={previewImage} alt="Preview" className="review-preview-img" />}

            <div className="review-action-area">
              <label className="review-checkbox-wrapper">
                <input type="checkbox" checked={userConfirmed} onChange={(e) => setUserConfirmed(e.target.checked)} />
                <span className="text-sm text-zinc-300 font-medium">
                  <strong className="text-white block mb-1">I approve my design.</strong> I confirm that all details are exactly how I want them to be printed.
                </span>
              </label>

              <div className="review-btn-grid">
                <button 
                  className={`btn ${userConfirmed ? 'btn-primary' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border-none'}`}
                  disabled={!userConfirmed}
                  onClick={() => triggerDownloadAction('pdf')}
                >
                  Download PDF (Print)
                </button>
                <button 
                  className={`btn ${userConfirmed ? 'btn-secondary' : 'bg-zinc-900 text-zinc-600 border-zinc-800 cursor-not-allowed'}`}
                  disabled={!userConfirmed}
                  onClick={() => triggerDownloadAction('png')}
                >
                  Download PNG
                </button>
                <button 
                  className={`btn ${userConfirmed ? 'btn-secondary' : 'bg-zinc-900 text-zinc-600 border-zinc-800 cursor-not-allowed'}`}
                  disabled={!userConfirmed}
                  onClick={() => triggerDownloadAction('svg')}
                >
                  Download SVG
                </button>
              </div>

              <button 
                className="mt-4 text-zinc-500 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2"
                onClick={() => setShowReviewModal(false)}
              >
                <X className="w-4 h-4" /> Cancel & Go Back to Editing
              </button>
            </div>
          </div>
        </div>
      )}

      {showSupportModal && (
        <div className="review-modal-overlay">
          <div className="review-modal-content" style={{ maxWidth: '500px' }}>
            <div style={{ width: '100%' }}>
              {ticketSubmitted ? (
                <div className="text-center py-6">
                  <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-black uppercase text-white mb-2 tracking-tight">Ticket Submitted</h2>
                  <p className="text-zinc-400 text-xs leading-relaxed mb-6">
                    Your message has been sent successfully. We will respond within 24 hours.
                  </p>
                  <button 
                    onClick={() => { setShowSupportModal(false); setTicketSubmitted(false); setSupportMessage(''); }}
                    className="btn btn-primary w-full"
                  >
                    Close Window
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-black uppercase text-white mb-4 tracking-tight">Open Support Ticket</h2>
                  <p className="text-zinc-400 text-xs mb-6 leading-relaxed">
                    Need changes to your locked design? Describe your request below.
                  </p>
                  <div className="form-row" style={{ padding: 0, marginBottom: '20px' }}>
                    <label>Your Message</label>
                    <textarea 
                      value={supportMessage}
                      onChange={(e) => setSupportMessage(e.target.value)}
                      placeholder="Describe the changes you want..."
                      style={{
                        width: '100%', background: 'var(--input-bg)', border: '1px solid var(--input-border)',
                        borderRadius: '8px', color: 'var(--spotify-text)', padding: '12px', fontSize: '12px',
                        fontFamily: 'inherit', minHeight: '120px', resize: 'vertical', outline: 'none'
                      }}
                    />
                  </div>
                  <div className="flex gap-3">
                    <button 
                      disabled={sendingTicket || !supportMessage.trim()}
                      onClick={submitSupportTicket}
                      className={`btn ${sendingTicket || !supportMessage.trim() ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'btn-primary'}`}
                      style={{ flex: 1, padding: '12px 0' }}
                    >
                      {sendingTicket ? 'Sending...' : 'Send Message'}
                    </button>
                    <button 
                      disabled={sendingTicket}
                      onClick={() => { setShowSupportModal(false); setSupportMessage(''); }}
                      className="btn btn-secondary"
                      style={{ flex: 1, padding: '12px 0' }}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <div id="panel" className={isLocked ? 'hidden' : ''}>
        <div className="panel-header">
          <div className="title-group">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z" />
              <path d="M16 8H8M16 12H8M13 16H8" />
            </svg>
            <h1>Vintage Receipt</h1>
          </div>
          <button className="back-btn" onClick={() => navigate('/trend-posters')}>&#10229; Back</button>
        </div>

        <button className={`accordion-btn${openSections.presets ? ' open' : ''}`} onClick={() => toggleAccordion('presets')}>
          &#127912; Templates & Presets<span className="arrow">&#9660;</span>
        </button>
        <div className={`accordion-content${openSections.presets ? ' open' : ''}`}>
          <div className="form-row">
            <label>Select Theme</label>
            <select value={activePreset} onChange={(e) => applyPreset(e.target.value)}>
              {PRESETS.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
            <p style={{ fontSize: '10px', color: 'var(--spotify-subtext)', marginTop: '8px', lineHeight: '1.4' }}>
              {PRESETS.find(p => p.id === activePreset)?.desc}
            </p>
          </div>
        </div>

        <button className={`accordion-btn${openSections.size ? ' open' : ''}`} onClick={() => toggleAccordion('size')}>
          &#128208; Canvas Size<span className="arrow">&#9660;</span>
        </button>
        <div className={`accordion-content${openSections.size ? ' open' : ''}`}>
          <div className="form-row">
            <label>Print Size</label>
            <select value={canvasSize} onChange={(e) => handleSizeOrOrientationChange(e.target.value, orientation)}>
              {PRINT_SIZES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <div className="orient-group">
              <button 
                className={`btn ${orientation === 'portrait' ? 'btn-primary' : 'btn-secondary'}`} 
                onClick={() => handleSizeOrOrientationChange(canvasSize, 'portrait')}
              >
                Portrait
              </button>
              <button 
                className={`btn ${orientation === 'landscape' ? 'btn-primary' : 'btn-secondary'}`} 
                onClick={() => handleSizeOrOrientationChange(canvasSize, 'landscape')}
              >
                Landscape
              </button>
            </div>
          </div>
        </div>

        <button className={`accordion-btn${openSections.header ? ' open' : ''}`} onClick={() => toggleAccordion('header')}>
          &#128294; Header Information<span className="arrow">&#9660;</span>
        </button>
        <div className={`accordion-content${openSections.header ? ' open' : ''}`}>
          <div className="form-row">
            <label>Store / Shop Name</label>
            <input type="text" value={shopName} onChange={(e) => setShopName(e.target.value)} />
          </div>
          <div className="form-row">
            <label>Address Line</label>
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <div className="form-row">
            <label>Cashier Name</label>
            <input type="text" value={cashier} onChange={(e) => setCashier(e.target.value)} />
          </div>
          <div className="form-row">
            <label>Receipt Code / No</label>
            <input type="text" value={receiptNo} onChange={(e) => setReceiptNo(e.target.value)} />
          </div>
        </div>

        <button className={`accordion-btn${openSections.items ? ' open' : ''}`} onClick={() => toggleAccordion('items')}>
          &#128221; Receipt Line Items<span className="arrow">&#9660;</span>
        </button>
        <div className={`accordion-content${openSections.items ? ' open' : ''}`}>
          <div style={{ padding: '0 16px' }}>
            <table className="items-editor-table">
              <thead>
                <tr>
                  <th style={{ width: '45px' }}>Qty</th>
                  <th>Name / Desc</th>
                  <th style={{ width: '70px' }}>Price</th>
                  <th style={{ width: '30px' }}></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={`item-tr-${idx}`}>
                    <td>
                      <input type="text" value={item.qty} onChange={(e) => updateItemField(idx, 'qty', e.target.value)} />
                    </td>
                    <td>
                      <input type="text" value={item.name} onChange={(e) => updateItemField(idx, 'name', e.target.value)} />
                    </td>
                    <td>
                      <input type="number" step="0.01" value={item.price} onChange={(e) => updateItemField(idx, 'price', parseFloat(e.target.value) || 0)} />
                    </td>
                    <td>
                      <button className="trash-btn" onClick={() => removeItemRow(idx)}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="btn btn-secondary w-full flex items-center justify-center gap-2 mt-4" onClick={addItemRow}>
              <Plus className="w-4 h-4" /> Add Row Item
            </button>
          </div>
        </div>

        <button className={`accordion-btn${openSections.calculations ? ' open' : ''}`} onClick={() => toggleAccordion('calculations')}>
          &#128526; Totals & Footer<span className="arrow">&#9660;</span>
        </button>
        <div className={`accordion-content${openSections.calculations ? ' open' : ''}`}>
          <div className="form-row">
            <label>Total Label Text</label>
            <input type="text" value={totalLabel} onChange={(e) => setTotalLabel(e.target.value)} />
          </div>
          <div className="form-row">
            <label>Tax Rate (%)</label>
            <input type="number" value={taxRate} onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)} />
          </div>
          <div className="form-row">
            <label>Discount Amount ($)</label>
            <input type="number" value={discount} onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)} />
          </div>
          <div className="form-row">
            <label>Footer Note</label>
            <input type="text" value={footer} onChange={(e) => setFooter(e.target.value)} />
          </div>
        </div>

        <button className={`accordion-btn${openSections.styling ? ' open' : ''}`} onClick={() => toggleAccordion('styling')}>
          &#127912; Colors & Fonts<span className="arrow">&#9660;</span>
        </button>
        <div className={`accordion-content${openSections.styling ? ' open' : ''}`}>
          <div className="form-row">
            <label>Font Family</label>
            <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)}>
              {GOOGLE_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div className="form-row">
            <label>Paper Background Color</label>
            <div className="color-row">
              <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} />
              <input type="text" value={bgColor} onChange={(e) => setBgColor(e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <label>Text & Ink Color</label>
            <div className="color-row">
              <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} />
              <input type="text" value={textColor} onChange={(e) => setTextColor(e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      <div id="canvas-area" ref={containerRef} className={isLocked ? 'locked-mode' : ''}>
        {isLocked && (
          <div className="readonly-banner">
            <div>
              <div className="flex items-center gap-2 text-red-200 font-bold mb-1">
                <Lock className="w-4 h-4" /> Design Locked (Read-Only Mode)
              </div>
              <p className="text-xs text-red-300/80">Your design has been finalized. If you made a mistake, please contact support.</p>
            </div>
            <button onClick={handleSupportClick} className="flex items-center gap-2 bg-red-950 border border-red-900 text-red-200 px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-900 transition-colors cursor-pointer">
              <MessageCircle className="w-4 h-4" /> Open Support Ticket
            </button>
          </div>
        )}

        {!isLocked && (
          <div className="canvas-header-actions">
            <button className="btn btn-masterpiece" onClick={handleDownloadMasterpieceClick}>
              Download Masterpiece
            </button>
          </div>
        )}

        <div id="poster-wrapper">
          <div id="poster-container" style={{ 
            width: containerDims.width * zoom, 
            height: containerDims.height * zoom
          }}>
            <canvas ref={canvasElRef} />
          </div>
        </div>
      </div>

      <div className="rec-toast" style={{
        position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%) translateY(20px)',
        background: 'var(--accent)', color: '#000', padding: '10px 20px', borderRadius: '24px',
        fontSize: '13px', fontWeight: 600, opacity: 0, transition: 'all 0.3s', zIndex: 9999, pointerEvents: 'none'
      }}>Done</div>
    </div>
  );
}
