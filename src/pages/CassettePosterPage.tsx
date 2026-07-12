import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as fabric from 'fabric';
import jsPDF from 'jspdf';
import { AlertTriangle, Lock, MessageCircle, X, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

const GOOGLE_FONTS = [
  "Inter", "Montserrat", "Oswald", "Bebas Neue", "Space Mono", "VT323",
  "Playfair Display", "Prata", "Lora", "Crimson Text", "Cinzel"
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
    id: 'synthwave-80s',
    label: '80s Synthwave',
    desc: 'Electric neon pinks, deep cyans, and dark retro-futuristic grid aesthetics.',
    texts: {
      mixtapeTitle: 'AWESOME MIX VOL. 1',
      subtext: 'LATE NIGHT CO-DRIVING',
      side: 'A-SIDE',
      year: '1988',
      footer: 'SYNTHWAVE SOUNDTRACKS INC.'
    },
    styling: {
      bg: '#050509',
      tapeBody: '#110c1f',
      sticker: '#22d3ee',
      accent: '#f43f5e',
      text: '#ffffff',
      font: 'VT323'
    }
  },
  {
    id: 'vintage-acoustic',
    label: 'Vintage Acoustic',
    desc: 'Warm desert sand, rich mahogany, and classic retro rock styling.',
    texts: {
      mixtapeTitle: 'AWARDS & BALLADS',
      subtext: 'THE UNPLUGGED SESSION',
      side: 'B-SIDE',
      year: '1975',
      footer: 'SATELLITE VINYL RECORDS'
    },
    styling: {
      bg: '#fffbeb',
      tapeBody: '#451a03',
      sticker: '#fed7aa',
      accent: '#ea580c',
      text: '#451a03',
      font: 'Space Mono'
    }
  },
  {
    id: 'lofi-sunset',
    label: 'Lo-Fi Sunset',
    desc: 'Cozy pastel gradient of peach, lavender, and mint with minimal accents.',
    texts: {
      mixtapeTitle: 'LO-FI SUNSET STUDY',
      subtext: 'CHILL BEATS TO WRITE CODE',
      side: 'A-SIDE',
      year: '2026',
      footer: 'COZY ROOM RECORDINGS'
    },
    styling: {
      bg: '#faf5ff',
      tapeBody: '#475569',
      sticker: '#fbcfe8',
      accent: '#2dd4bf',
      text: '#4a044e',
      font: 'Montserrat'
    }
  }
];

const DPI = 300;
const BASE_MAX_W = 550;
const BASE_MAX_H = 750;

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

export default function CassettePosterPage({ navigate }: { navigate: (path: string) => void }) {
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
    cassette: false,
    textFields: false,
    styling: false
  });

  const [activePreset, setActivePreset] = useState<string>('synthwave-80s');

  const [canvasSize, setCanvasSize] = useState<string>('8.27x11.69');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [containerDims, setContainerDims] = useState(() => {
    const { w, h } = parseAndOrientSize('8.27x11.69', 'portrait');
    return fitContain(w, h, BASE_MAX_W, BASE_MAX_H);
  });
  const [zoom, setZoom] = useState<number>(1);

  const [mixtapeTitle, setMixtapeTitle] = useState('AWESOME MIX VOL. 1');
  const [subtext, setSubtext] = useState('LATE NIGHT CO-DRIVING');
  const [sideText, setSideText] = useState('A-SIDE');
  const [yearText, setYearText] = useState('1988');
  const [footerText, setFooterText] = useState('SYNTHWAVE SOUNDTRACKS INC.');

  const [bgColor, setBgColor] = useState('#050509');
  const [tapeBodyColor, setTapeBodyColor] = useState('#110c1f');
  const [stickerColor, setStickerColor] = useState('#22d3ee');
  const [accentColor, setAccentColor] = useState('#f43f5e');
  const [textColor, setTextColor] = useState('#ffffff');
  const [fontFamily, setFontFamily] = useState('VT323');

  const showToast = (msg: string) => {
    const el = document.querySelector('.cas-toast') as HTMLElement;
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

    setMixtapeTitle(preset.texts.mixtapeTitle);
    setSubtext(preset.texts.subtext);
    setSideText(preset.texts.side);
    setYearText(preset.texts.year);
    setFooterText(preset.texts.footer);

    setBgColor(preset.styling.bg);
    setTapeBodyColor(preset.styling.tapeBody);
    setStickerColor(preset.styling.sticker);
    setAccentColor(preset.styling.accent);
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
        if (!token || token === 'demo-token' || token === 'cassette' || token.length < 10) {
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
          setMixtapeTitle(ds.mixtapeTitle || '');
          setSubtext(ds.subtext || '');
          setSideText(ds.sideText || 'A-SIDE');
          setYearText(ds.yearText || '');
          setFooterText(ds.footerText || '');
          setBgColor(ds.bgColor || '#050509');
          setTapeBodyColor(ds.tapeBodyColor || '#110c1f');
          setStickerColor(ds.stickerColor || '#22d3ee');
          setAccentColor(ds.accentColor || '#f43f5e');
          setTextColor(ds.textColor || '#ffffff');
          setFontFamily(ds.fontFamily || 'VT323');
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

    drawCassetteStructure();

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

  const drawCassetteStructure = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    isRebuildingRef.current = true;

    const objs = canvas.getObjects().filter(o => o !== bgRectRef.current);
    objs.forEach(o => canvas.remove(o));

    const cw = containerDims.width;
    const ch = containerDims.height;

    const cx = cw / 2;
    const cy = ch * 0.40;

    const tapeW = cw * 0.76;
    const tapeH = tapeW * 0.62;

    const tapeShell = new fabric.Rect({
      left: cx,
      top: cy,
      width: tapeW,
      height: tapeH,
      rx: 18,
      ry: 18,
      fill: tapeBodyColor,
      stroke: accentColor,
      strokeWidth: 2.5,
      originX: 'center',
      originY: 'center',
      selectable: false,
    });
    canvas.add(tapeShell);

    const trapY = cy + tapeH/2 - 12;
    const trapW = tapeW * 0.55;
    const trapPath = new fabric.Path(
      `M ${cx - trapW/2 + 10} ${cy + 15} L ${cx + trapW/2 - 10} ${cy + 15} L ${cx + trapW/2} ${trapY} L ${cx - trapW/2} ${trapY} Z`,
      {
        fill: tapeBodyColor,
        stroke: accentColor,
        strokeWidth: 2,
        selectable: false,
      }
    );
    canvas.add(trapPath);

    const stickerW = tapeW * 0.88;
    const stickerH = tapeH * 0.52;
    const sticker = new fabric.Rect({
      left: cx,
      top: cy - 25,
      width: stickerW,
      height: stickerH,
      rx: 8,
      ry: 8,
      fill: stickerColor,
      originX: 'center',
      originY: 'center',
      selectable: false,
    });
    canvas.add(sticker);

    const drawStickerAccents = () => {
      const line1 = new fabric.Line([cx - stickerW/2 + 15, cy - 25, cx + stickerW/2 - 15, cy - 25], {
        stroke: accentColor,
        strokeWidth: 3,
        selectable: false,
      });
      const line2 = new fabric.Line([cx - stickerW/2 + 15, cy - 18, cx + stickerW/2 - 15, cy - 18], {
        stroke: accentColor,
        strokeWidth: 1.5,
        selectable: false,
      });
      canvas.add(line1, line2);
    };

    drawStickerAccents();

    const centerWindowW = stickerW * 0.44;
    const centerWindowH = stickerH * 0.48;
    const centerWindow = new fabric.Rect({
      left: cx,
      top: cy - 10,
      width: centerWindowW,
      height: centerWindowH,
      rx: 6,
      ry: 6,
      fill: tapeBodyColor,
      stroke: accentColor,
      strokeWidth: 1.5,
      originX: 'center',
      originY: 'center',
      selectable: false,
    });
    canvas.add(centerWindow);

    const drawSpoolMechanism = (sX: number) => {
      const spoolOutline = new fabric.Circle({
        left: sX,
        top: cy - 10,
        radius: 18,
        fill: stickerColor,
        stroke: accentColor,
        strokeWidth: 1,
        originX: 'center',
        originY: 'center',
        selectable: false,
      });
      const spoolCenter = new fabric.Circle({
        left: sX,
        top: cy - 10,
        radius: 10,
        fill: tapeBodyColor,
        stroke: accentColor,
        strokeWidth: 1.5,
        originX: 'center',
        originY: 'center',
        selectable: false,
      });
      canvas.add(spoolOutline, spoolCenter);

      for (let i = 0; i < 6; i++) {
        const rad = (i * Math.PI) / 3;
        const tooth = new fabric.Rect({
          left: sX + Math.cos(rad) * 12,
          top: cy - 10 + Math.sin(rad) * 12,
          width: 3.5,
          height: 3.5,
          fill: accentColor,
          originX: 'center',
          originY: 'center',
          angle: (rad * 180) / Math.PI,
          selectable: false,
        });
        canvas.add(tooth);
      }
    };

    drawSpoolMechanism(cx - 52);
    drawSpoolMechanism(cx + 52);

    const drawScrewHoles = () => {
      const positions = [
        { x: cx - tapeW/2 + 15, y: cy - tapeH/2 + 15 },
        { x: cx + tapeW/2 - 15, y: cy - tapeH/2 + 15 },
        { x: cx - tapeW/2 + 15, y: cy + tapeH/2 - 15 },
        { x: cx + tapeW/2 - 15, y: cy + tapeH/2 - 15 },
      ];
      positions.forEach(pos => {
        const screw = new fabric.Circle({
          left: pos.x,
          top: pos.y,
          radius: 3.5,
          fill: tapeBodyColor,
          stroke: accentColor,
          strokeWidth: 1,
          originX: 'center',
          originY: 'center',
          selectable: false,
        });
        canvas.add(screw);
      });
    };

    drawScrewHoles();

    const tMixtape = new fabric.Textbox(mixtapeTitle.toUpperCase(), {
      left: cx,
      top: cy - stickerH/2 - 2,
      width: stickerW - 30,
      originX: 'center',
      textAlign: 'center',
      fontSize: 15,
      fontFamily: fontFamily,
      fontWeight: '900',
      fill: textColor,
      selectable: !isLocked,
    });
    canvas.add(tMixtape);

    const tSub = new fabric.Textbox(subtext.toUpperCase(), {
      left: cx - 45,
      top: cy - 43,
      width: centerWindowW * 1.5,
      originX: 'center',
      textAlign: 'center',
      fontSize: 9,
      fontFamily: fontFamily,
      fontWeight: '700',
      fill: textColor,
      selectable: !isLocked,
    });
    canvas.add(tSub);

    const tSide = new fabric.Text(sideText.toUpperCase(), {
      left: cx - stickerW/2 + 20,
      top: cy - 14,
      fontSize: 10,
      fontFamily: fontFamily,
      fontWeight: '900',
      fill: textColor,
      selectable: !isLocked,
    });
    canvas.add(tSide);

    const tYear = new fabric.Text(yearText.toUpperCase(), {
      left: cx + stickerW/2 - 20,
      top: cy - 14,
      originX: 'right',
      fontSize: 10,
      fontFamily: fontFamily,
      fontWeight: '900',
      fill: textColor,
      selectable: !isLocked,
    });
    canvas.add(tYear);

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

    drawText(footerText, ch * 0.88, 10, '700', textColor, 100);

    canvas.requestRenderAll();
    isRebuildingRef.current = false;
  };

  useEffect(() => {
    if (!isCheckingToken && !tokenError) {
      drawCassetteStructure();
    }
  }, [
    isCheckingToken, tokenError, mixtapeTitle, subtext, sideText, yearText, 
    footerText, bgColor, tapeBodyColor, stickerColor, accentColor, textColor, fontFamily
  ]);

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
          a.download = `cassette-poster.png`;
          a.click();
        } else if (format === 'pdf') {
          const dataUrl = canvas.toDataURL({ format: 'png', multiplier });
          const pdf = new jsPDF({ orientation: w > h ? 'landscape' : 'portrait', unit: 'in', format: [w, h] });
          pdf.addImage(dataUrl, 'PNG', 0, 0, w, h);
          pdf.save(`cassette-poster.pdf`);
        } else if (format === 'svg') {
          const svg = canvas.toSVG();
          const blob = new Blob([svg], { type: 'image/svg+xml' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `cassette-poster.svg`;
          a.click();
          URL.revokeObjectURL(url);
        }

        const designStateJSON = {
          canvasSize, orientation, mixtapeTitle, subtext, sideText, yearText,
          footerText, bgColor, tapeBodyColor, stickerColor, accentColor, textColor, fontFamily
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
        .cas-toast {
          position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%) translateY(20px);
          background: var(--accent); color: #000; padding: 10px 20px; border-radius: 24px;
          font-size: 13px; font-weight: 600; opacity: 0; transition: all 0.3s; z-index: 9999; pointer-events: none;
        }
        .file-generator-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(10px);
          display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 10000;
        }
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
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <circle cx="7" cy="12" r="2" />
              <circle cx="17" cy="12" r="2" />
              <path d="M12 8v8" />
            </svg>
            <h1>Cassette Tape</h1>
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

        <button className={`accordion-btn${openSections.textFields ? ' open' : ''}`} onClick={() => toggleAccordion('textFields')}>
          &#128294; Typography Contents<span className="arrow">&#9660;</span>
        </button>
        <div className={`accordion-content${openSections.textFields ? ' open' : ''}`}>
          <div className="form-row">
            <label>Mixtape Title</label>
            <input type="text" value={mixtapeTitle} onChange={(e) => setMixtapeTitle(e.target.value)} />
          </div>
          <div className="form-row">
            <label>Subtitle / Details</label>
            <input type="text" value={subtext} onChange={(e) => setSubtext(e.target.value)} />
          </div>
          <div className="form-row">
            <label>Side Label</label>
            <input type="text" value={sideText} onChange={(e) => setSideText(e.target.value)} />
          </div>
          <div className="form-row">
            <label>Tape Year</label>
            <input type="text" value={yearText} onChange={(e) => setYearText(e.target.value)} />
          </div>
          <div className="form-row">
            <label>Footer Stamp</label>
            <input type="text" value={footerText} onChange={(e) => setFooterText(e.target.value)} />
          </div>
        </div>

        <button className={`accordion-btn${openSections.styling ? ' open' : ''}`} onClick={() => toggleAccordion('styling')}>
          &#127912; Retro Styles & Colors<span className="arrow">&#9660;</span>
        </button>
        <div className={`accordion-content${openSections.styling ? ' open' : ''}`}>
          <div className="form-row">
            <label>Font Family</label>
            <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)}>
              {GOOGLE_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div className="form-row">
            <label>Outer Background Color</label>
            <div className="color-row">
              <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} />
              <input type="text" value={bgColor} onChange={(e) => setBgColor(e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <label>Cassette Body Color</label>
            <div className="color-row">
              <input type="color" value={tapeBodyColor} onChange={(e) => setTapeBodyColor(e.target.value)} />
              <input type="text" value={tapeBodyColor} onChange={(e) => setTapeBodyColor(e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <label>Sticker Paper Color</label>
            <div className="color-row">
              <input type="color" value={stickerColor} onChange={(e) => setStickerColor(e.target.value)} />
              <input type="text" value={stickerColor} onChange={(e) => setStickerColor(e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <label>Stripe / Accent Color</label>
            <div className="color-row">
              <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} />
              <input type="text" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <label>Tape Text Color</label>
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
                  Please review your retro mixtape carefully. Check titles, years, and vector colors.
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

      <div className="cas-toast" style={{
        position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%) translateY(20px)',
        background: 'var(--accent)', color: '#000', padding: '10px 20px', borderRadius: '24px',
        fontSize: '13px', fontWeight: 600, opacity: 0, transition: 'all 0.3s', zIndex: 9999, pointerEvents: 'none'
      }}>Done</div>
    </div>
  );
}
