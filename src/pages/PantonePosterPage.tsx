import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as fabric from 'fabric';
import jsPDF from 'jspdf';
import { AlertTriangle, Lock, MessageCircle, X, CheckCircle, Upload } from 'lucide-react';
import { supabase } from '../lib/supabase';

const GOOGLE_FONTS = [
  "Space Mono", "Courier Prime", "Inter", "Montserrat", "Oswald",
  "Playfair Display", "Prata", "Lora", "Crimson Text", "Cinzel"
];

const PRINT_SIZES = [
  { value: '5.83x8.27', label: 'A5 (5.83" x 8.27")' },
  { value: '8.27x11.69', label: 'A4 (8.27" x 11.69")' },
  { value: '11.69x16.54', label: 'A3 (11.69" x 16.54")' },
  { value: '16.54x23.39', label: 'A2 (16.54" x 23.39")' },
  { value: '23.39x33.11', label: 'A1 (23.39" x 33.11")' },
  { value: '5x7', label: '5" x 7"' },
  { value: '6x8', label: '6" x 8"' },
  { value: '8x10', label: '8" x 10"' },
  { value: '9x11', label: '9" x 11"' },
  { value: '11x14', label: '11" x 14"' },
  { value: '11x17', label: '11" x 17"' },
  { value: '11.7x16.5', label: '11.7" x 16.5"' },
  { value: '12x16', label: '12" x 16"' },
  { value: '12x18', label: '12" x 18"' },
  { value: '16x20', label: '16" x 20"' },
  { value: '16x24', label: '16" x 24"' },
  { value: '16.5x23.4', label: '16.5" x 23.4"' },
  { value: '18x24', label: '18" x 24"' },
  { value: '20x30', label: '20" x 30"' },
  { value: '22x34', label: '22" x 34"' },
  { value: '23.4x33.1', label: '23.4" x 33.1"' },
  { value: '24x32', label: '24" x 32"' },
  { value: '24x36', label: '24" x 36"' },
  { value: '26x36', label: '26" x 36"' },
  { value: '28x40', label: '28" x 40"' },
  { value: '30x40', label: '30" x 40"' },
  { value: '40x50', label: '40" x 50"' },
  { value: '50x60', label: '50" x 60"' },
  { value: '60x80', label: '60" x 80"' },
  { value: '68x80', label: '68" x 80"' },
  { value: '88x104', label: '88" x 104"' },
];

interface SwatchState {
  color: string;
  name: string;
  code: string;
}

const PRESETS = [
  {
    id: 'sunset-date',
    label: 'Sunset Date',
    desc: 'Warm peach, lavender, and soft amber hues inspired by a romantic twilight sky.',
    texts: {
      title: 'THE COLORS OF OUR FIRST DATE',
      footer: 'AUGUST 24, 2025  •  SANTA MONICA PIER'
    },
    swatches: [
      { color: '#fbcfe8', name: 'TWILIGHT ROSE', code: 'P 13-1520' },
      { color: '#fca5a5', name: 'GOLDEN AMBER', code: 'P 15-1150' },
      { color: '#fdba74', name: 'PEACH SUNSET', code: 'P 14-1230' },
      { color: '#c084fc', name: 'COSMIC LILAC', code: 'P 17-3810' },
      { color: '#818cf8', name: 'DEEP DUSK', code: 'P 18-3940' }
    ],
    styling: {
      bg: '#fafaf9',
      text: '#1c1917',
      font: 'Inter'
    }
  },
  {
    id: 'baby-nursery',
    label: 'Baby Nursery Palette',
    desc: 'Soft, calming pastel tones matching a nursery and newborn photo.',
    texts: {
      title: 'WELCOME HOME BABY EMMA',
      footer: 'OCTOBER 12, 2025  •  NURSERY COLLECTION'
    },
    swatches: [
      { color: '#f0fdf4', name: 'MINT ICE', code: 'P 11-0110' },
      { color: '#f0fdfa', name: 'SOFT SEAFOAM', code: 'P 12-0420' },
      { color: '#ecfeff', name: 'SKY BLUSH', code: 'P 12-4302' },
      { color: '#fdf2f8', name: 'PALE ROSE', code: 'P 11-1305' },
      { color: '#fff7ed', name: 'WARM SAND', code: 'P 11-0907' }
    ],
    styling: {
      bg: '#fafaf9',
      text: '#1c1917',
      font: 'Inter'
    }
  },
  {
    id: 'ocean-wanderer',
    label: 'Ocean Wanderer',
    desc: 'Rich, deep nautical blues and teals reminiscent of beach vacations.',
    texts: {
      title: 'AMALFI COAST EXPLORATION',
      footer: 'SUMMER OF 2024  •  THE Mediterranean VIBES'
    },
    swatches: [
      { color: '#0f172a', name: 'MIDNIGHT OCEAN', code: 'P 19-4010' },
      { color: '#1e3a8a', name: 'NAVY BAY', code: 'P 19-3920' },
      { color: '#0369a1', name: 'TEAL WATER', code: 'P 17-4530' },
      { color: '#0d9488', name: 'SEAFOAM SPLASH', code: 'P 16-5120' },
      { color: '#2dd4bf', name: 'MINTY BREEZE', code: 'P 13-5410' }
    ],
    styling: {
      bg: '#f8fafc',
      text: '#0f172a',
      font: 'Space Mono'
    }
  }
];

const DPI = 300;
const BASE_MAX_W = 550;
const BASE_MAX_H = 750;

export default function PantonePosterPage({ navigate }: { navigate: (path: string) => void }) {
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
    colorAnalysis: false,
    swatches: false,
    textFields: false,
    styling: false
  });

  const [activePreset, setActivePreset] = useState<string>('sunset-date');

  const [canvasSize, setCanvasSize] = useState<string>('8.27x11.69');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [containerDims, setContainerDims] = useState(() => {
    const { w, h } = parseAndOrientSize('8.27x11.69', 'portrait');
    return fitContain(w, h, BASE_MAX_W, BASE_MAX_H);
  });
  const [zoom, setZoom] = useState<number>(1);

  const [titleText, setTitleText] = useState('THE COLORS OF OUR FIRST DATE');
  const [footerText, setFooterText] = useState('AUGUST 24, 2025  •  SANTA MONICA PIER');

  const [swatches, setSwatches] = useState<SwatchState[]>([
    { color: '#fbcfe8', name: 'TWILIGHT ROSE', code: 'P 13-1520' },
    { color: '#fca5a5', name: 'GOLDEN AMBER', code: 'P 15-1150' },
    { color: '#fdba74', name: 'PEACH SUNSET', code: 'P 14-1230' },
    { color: '#c084fc', name: 'COSMIC LILAC', code: 'P 17-3810' },
    { color: '#818cf8', name: 'DEEP DUSK', code: 'P 18-3940' }
  ]);

  const [bgColor, setBgColor] = useState('#fafaf9');
  const [textColor, setTextColor] = useState('#1c1917');
  const [fontFamily, setFontFamily] = useState('Inter');

  const showToast = (msg: string) => {
    const el = document.querySelector('.pan-toast') as HTMLElement;
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

    setTitleText(preset.texts.title);
    setFooterText(preset.texts.footer);
    setSwatches(preset.swatches.map(s => ({ ...s })));
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
        if (!token || token === 'demo-token' || token === 'pantone' || token.length < 10) {
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
          setTitleText(ds.titleText || '');
          setFooterText(ds.footerText || '');
          setSwatches(ds.swatches || []);
          setBgColor(ds.bgColor || '#fafaf9');
          setTextColor(ds.textColor || '#1c1917');
          setFontFamily(ds.fontFamily || 'Inter');
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

  const extractDominantColors = (imgUrl: string, count: number): Promise<string[]> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const tempCanvas = document.createElement('canvas');
        const ctx = tempCanvas.getContext('2d');
        if (!ctx) {
          resolve([]);
          return;
        }
        tempCanvas.width = 50;
        tempCanvas.height = 50;
        ctx.drawImage(img, 0, 0, 50, 50);
        const imgData = ctx.getImageData(0, 0, 50, 50).data;

        const colors: string[] = [];
        const step = Math.floor(imgData.length / (count * 4));
        for (let i = 0; i < count; i++) {
          const idx = i * step * 4;
          const r = imgData[idx];
          const g = imgData[idx + 1];
          const b = imgData[idx + 2];
          const hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
          colors.push(hex);
        }
        resolve(colors);
      };
      img.src = imgUrl;
    });
  };

  const handlePhotoUploadAndAnalysis = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    showToast('Analyzing image colors...');
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const url = ev.target?.result as string;
      const extractedHexes = await extractDominantColors(url, 5);

      if (extractedHexes.length === 5) {
        setSwatches(prev => {
          return prev.map((s, idx) => ({
            ...s,
            color: extractedHexes[idx]
          }));
        });
        showToast('Color analysis complete! Applied to swatches.');
      }
    };
    reader.readAsDataURL(file);
  };

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

    drawPantoneStructure();

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

  const drawPantoneStructure = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    isRebuildingRef.current = true;

    const objs = canvas.getObjects().filter(o => o !== bgRectRef.current);
    objs.forEach(o => canvas.remove(o));

    const cw = containerDims.width;
    const ch = containerDims.height;

    const cx = cw / 2;
    const cy = ch * 0.40;

    const totalSwatchesW = cw * 0.84;
    const swatchW = totalSwatchesW / 5.4; 
    const swatchH = swatchW * 1.5;

    const startX = cx - (totalSwatchesW / 2) + (swatchW / 2);

    const drawSwatchCard = (sX: number, color: string, name: string, code: string) => {
      const card = new fabric.Rect({
        left: 0,
        top: 0,
        width: swatchW,
        height: swatchH,
        rx: 3,
        ry: 3,
        fill: '#ffffff',
        shadow: new fabric.Shadow({
          color: 'rgba(0,0,0,0.06)',
          blur: 10,
          offsetX: 0,
          offsetY: 4
        }),
        selectable: false
      });

      const colorBlock = new fabric.Rect({
        left: 0,
        top: 0,
        width: swatchW,
        height: swatchH * 0.68,
        rx: 3,
        ry: 3,
        fill: color,
        selectable: false
      });

      const textName = new fabric.Text(name.toUpperCase(), {
        left: 8,
        top: swatchH * 0.73,
        fontSize: swatchW * 0.08,
        fontFamily: fontFamily,
        fontWeight: 'bold',
        fill: '#1c1917',
        selectable: false
      });

      const textCode = new fabric.Text(code.toUpperCase(), {
        left: 8,
        top: swatchH * 0.85,
        fontSize: swatchW * 0.06,
        fontFamily: fontFamily,
        fontWeight: '500',
        fill: '#78716c',
        charSpacing: 20,
        selectable: false
      });

      const sGroup = new fabric.Group([card, colorBlock, textName, textCode], {
        left: sX,
        top: cy,
        originX: 'center',
        originY: 'center',
        selectable: !isLocked,
      });

      canvas.add(sGroup);
    };

    swatches.forEach((s, idx) => {
      const sX = startX + idx * (swatchW * 1.1);
      drawSwatchCard(sX, s.color, s.name, s.code);
    });

    const drawText = (txt: string, yPos: number, size: number, weight: string, color: string, spacing = 80) => {
      const obj = new fabric.Text(txt.toUpperCase(), {
        left: cx,
        top: yPos,
        originX: 'center',
        fontSize: size,
        fontFamily: fontFamily,
        fontWeight: weight,
        fill: color,
        charSpacing: spacing,
        selectable: !isLocked,
      });
      canvas.add(obj);
      return obj;
    };

    drawText(titleText, ch * 0.76, 18, '900', textColor, 100);
    drawText(footerText, ch * 0.88, 10, '700', textColor, 120);

    canvas.requestRenderAll();
    isRebuildingRef.current = false;
  };

  useEffect(() => {
    if (!isCheckingToken && !tokenError) {
      drawPantoneStructure();
    }
  }, [isCheckingToken, tokenError, titleText, footerText, swatches, bgColor, textColor, fontFamily]);

  const updateSwatchField = (index: number, key: keyof SwatchState, val: string) => {
    setSwatches(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: val };
      return next;
    });
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

  const getMultiplier = () => {
    const { w } = parseAndOrientSize(canvasSize, orientation);
    return (w * DPI) / containerDims.width;
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
          a.download = `pantone-poster.png`;
          a.click();
        } else if (format === 'pdf') {
          const dataUrl = canvas.toDataURL({ format: 'png', multiplier });
          const pdf = new jsPDF({ orientation: w > h ? 'landscape' : 'portrait', unit: 'in', format: [w, h] });
          pdf.addImage(dataUrl, 'PNG', 0, 0, w, h);
          pdf.save(`pantone-poster.pdf`);
        } else if (format === 'svg') {
          const svg = canvas.toSVG();
          const blob = new Blob([svg], { type: 'image/svg+xml' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `pantone-poster.svg`;
          a.click();
          URL.revokeObjectURL(url);
        }

        const designStateJSON = {
          canvasSize, orientation, titleText, footerText, swatches, bgColor, textColor, fontFamily
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
        .pan-toast {
          position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%) translateY(20px);
          background: var(--accent); color: #000; padding: 10px 20px; border-radius: 24px;
          font-size: 13px; font-weight: 600; opacity: 0; transition: all 0.3s; z-index: 9999; pointer-events: none;
        }
        .file-generator-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(10px);
          display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 10000;
        }

        .upload-compact-btn {
          display: inline-flex; align-items: center; gap: 6px; background: var(--input-bg);
          border: 1px solid var(--input-border); color: #fff; padding: 6px 12px; border-radius: 6px;
          font-size: 11px; cursor: pointer; transition: all 0.15s; font-family: inherit; font-weight: 600;
        }
        .upload-compact-btn:hover { border-color: var(--accent); }
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

      <div id="panel" className={isLocked ? 'hidden' : ''}>
        <div className="panel-header">
          <div className="title-group">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <h1>Pantone Palette</h1>
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

        <button className={`accordion-btn${openSections.colorAnalysis ? ' open' : ''}`} onClick={() => toggleAccordion('colorAnalysis')}>
          &#128444;&#65039; Scan Image Palette<span className="arrow">&#9660;</span>
        </button>
        <div className={`accordion-content${openSections.colorAnalysis ? ' open' : ''}`}>
          <div className="form-row">
            <label>Scan dominant colors from image</label>
            <button className="upload-compact-btn w-full justify-center mt-2" onClick={() => document.getElementById('pan-analysis-upload')?.click()}>
              <Upload className="w-4 h-4" /> Upload & Scan Colors
            </button>
            <input type="file" id="pan-analysis-upload" accept="image/*" onChange={handlePhotoUploadAndAnalysis} style={{ display: 'none' }} />
          </div>
        </div>

        <button className={`accordion-btn${openSections.swatches ? ' open' : ''}`} onClick={() => toggleAccordion('swatches')}>
          &#127911; Pantone Color Blocks<span className="arrow">&#9660;</span>
        </button>
        <div className={`accordion-content${openSections.swatches ? ' open' : ''}`}>
          {swatches.map((swatch, idx) => (
            <div className="form-row" key={`swatch-ctrl-${idx}`} style={{ borderBottom: '1px solid var(--panel-border)', paddingBottom: '12px', marginBottom: '12px' }}>
              <label style={{ color: 'var(--accent)', fontWeight: 'bold' }}>Swatch Block {idx + 1}</label>
              <div className="color-row mt-2">
                <input type="color" value={swatch.color} onChange={(e) => updateSwatchField(idx, 'color', e.target.value)} />
                <input type="text" value={swatch.color} onChange={(e) => updateSwatchField(idx, 'color', e.target.value)} />
              </div>
              <div className="mt-2">
                <label>Color Name</label>
                <input type="text" value={swatch.name} onChange={(e) => updateSwatchField(idx, 'name', e.target.value)} />
              </div>
              <div className="mt-2">
                <label>Pantone Code</label>
                <input type="text" value={swatch.code} onChange={(e) => updateSwatchField(idx, 'code', e.target.value)} />
              </div>
            </div>
          ))}
        </div>

        <button className={`accordion-btn${openSections.textFields ? ' open' : ''}`} onClick={() => toggleAccordion('textFields')}>
          &#128294; Typography Contents<span className="arrow">&#9660;</span>
        </button>
        <div className={`accordion-content${openSections.textFields ? ' open' : ''}`}>
          <div className="form-row">
            <label>Main Headline</label>
            <input type="text" value={titleText} onChange={(e) => setTitleText(e.target.value)} />
          </div>
          <div className="form-row">
            <label>Footer Stamp</label>
            <input type="text" value={footerText} onChange={(e) => setFooterText(e.target.value)} />
          </div>
        </div>

        <button className={`accordion-btn${openSections.styling ? ' open' : ''}`} onClick={() => toggleAccordion('styling')}>
          &#127912; Styles & Colors<span className="arrow">&#9660;</span>
        </button>
        <div className={`accordion-content${openSections.styling ? ' open' : ''}`}>
          <div className="form-row">
            <label>Font Family</label>
            <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)}>
              {GOOGLE_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div className="form-row">
            <label>Canvas Background</label>
            <div className="color-row">
              <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} />
              <input type="text" value={bgColor} onChange={(e) => setBgColor(e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <label>Ink Text Color</label>
            <div className="color-row">
              <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} />
              <input type="text" value={textColor} onChange={(e) => setTextColor(e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      <div id="canvas-area" ref={containerRef} className={isLocked ? 'locked-mode' : ''}>
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

      {showReviewModal && (
        <div className="review-modal-overlay">
          <div className="review-modal-content">
            <div className="review-warning-box">
              <AlertTriangle className="w-8 h-8 text-red-400 shrink-0" />
              <div>
                <h3 className="text-red-400 font-black uppercase tracking-wider mb-1">Final Review</h3>
                <p className="text-red-200/80 text-sm leading-relaxed">
                  Please review your Pantone swatches carefully. Check color tones, codes, and text alignments.
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

      <div className="pan-toast" style={{
        position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%) translateY(20px)',
        background: 'var(--accent)', color: '#000', padding: '10px 20px', borderRadius: '24px',
        fontSize: '13px', fontWeight: 600, opacity: 0, transition: 'all 0.3s', zIndex: 9999, pointerEvents: 'none'
      }}>Done</div>
    </div>
  );
}
