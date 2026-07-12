import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as fabric from 'fabric';
import jsPDF from 'jspdf';
import { AlertTriangle, Lock, MessageCircle, X, CheckCircle, MapPin, Compass, Crosshair, HelpCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

const GOOGLE_FONTS = [
  "Inter", "Montserrat", "Oswald", "Bebas Neue", "Space Mono",
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
    id: 'first-home',
    label: 'Our First Home',
    desc: 'Commemorate the coordinates of your very first home together. Warm and cozy.',
    texts: {
      location: 'KENSINGTON, LONDON',
      lat: 51.5014,
      lng: -0.1921,
      caption: 'OUR FIRST HOME',
      sub: 'WHERE OUR ADVENTURE CONTINUED',
      footer: 'ESTABLISHED 2026'
    },
    styling: {
      bg: '#fcfbf7',
      text: '#1c1917',
      accent: '#b45309',
      font: 'Playfair Display',
      pinType: 'compass'
    }
  },
  {
    id: 'where-we-met',
    label: 'Where We Met',
    desc: 'The exact coordinates where you first locked eyes. Highly romantic.',
    texts: {
      location: 'CENTRAL PARK, NEW YORK',
      lat: 40.7851,
      lng: -73.9682,
      caption: 'THE FIRST HELLO',
      sub: 'THE COORDINTES OF OUR DESTINY',
      footer: 'SEPTEMBER 12, 2024'
    },
    styling: {
      bg: '#fff5f5',
      text: '#7f1d1d',
      accent: '#ef4444',
      font: 'Montserrat',
      pinType: 'pin'
    }
  },
  {
    id: 'proposal-spot',
    label: 'The Proposal Spot',
    desc: 'Mark the exact coordinate target where they said yes under the sky.',
    texts: {
      location: 'EIFFEL TOWER, PARIS',
      lat: 48.8584,
      lng: 2.2945,
      caption: 'SHE SAID YES',
      sub: 'UNDER THE LIGHTS OF THE TOWER',
      footer: 'AUGUST 24, 2025'
    },
    styling: {
      bg: '#0f172a',
      text: '#f8fafc',
      accent: '#fbbf24',
      font: 'Cinzel',
      pinType: 'crosshair'
    }
  },
  {
    id: 'realtor-gift',
    label: 'Realtor Closing Gift',
    desc: 'Elegant, modern coordinate layout. Highly professional client handover gift.',
    texts: {
      location: 'BEVERLY HILLS, CA',
      lat: 34.0736,
      lng: -118.4004,
      caption: 'HOME SWEET HOME',
      sub: 'CONGRATULATIONS ON YOUR NEW JOURNEY',
      footer: 'GIFTED BY ELITE PROPERTIES'
    },
    styling: {
      bg: '#fafafa',
      text: '#0f172a',
      accent: '#2563eb',
      font: 'Inter',
      pinType: 'compass'
    }
  }
];

const DPI = 300;
const BASE_MAX_W = 550;
const BASE_MAX_H = 750;

function convertToDMS(lat: number, lng: number): string {
  const getDMS = (val: number, isLat: boolean) => {
    const dir = isLat ? (val >= 0 ? 'N' : 'S') : (val >= 0 ? 'E' : 'W');
    const absVal = Math.abs(val);
    const deg = Math.floor(absVal);
    const min = Math.floor((absVal - deg) * 60);
    const sec = Math.round(((absVal - deg) * 60 - min) * 60);
    return `${deg}° ${min}' ${sec}" ${dir}`;
  };
  return `${getDMS(lat, true)}   ${getDMS(lng, false)}`;
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

export default function CoordinatesPosterPage({ navigate }: { navigate: (path: string) => void }) {
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
    coords: false,
    textFields: false,
    styling: false
  });

  const [activePreset, setActivePreset] = useState<string>('first-home');

  const [canvasSize, setCanvasSize] = useState<string>('8.27x11.69');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [containerDims, setContainerDims] = useState(() => {
    const { w, h } = parseAndOrientSize('8.27x11.69', 'portrait');
    return fitContain(w, h, BASE_MAX_W, BASE_MAX_H);
  });
  const [zoom, setZoom] = useState<number>(1);

  const [locationText, setLocationText] = useState('KENSINGTON, LONDON');
  const [latitude, setLatitude] = useState<number>(51.5014);
  const [longitude, setLongitude] = useState<number>(-0.1921);
  const [captionText, setCaptionText] = useState('OUR FIRST HOME');
  const [subText, setSubText] = useState('WHERE OUR ADVENTURE CONTINUED');
  const [footerText, setFooterText] = useState('ESTABLISHED 2026');

  const [bgColor, setBgColor] = useState('#fcfbf7');
  const [textColor, setTextColor] = useState('#1c1917');
  const [accentColor, setAccentColor] = useState('#b45309');
  const [fontFamily, setFontFamily] = useState('Playfair Display');
  const [pinType, setPinType] = useState<string>('compass');

  const showToast = (msg: string) => {
    const el = document.querySelector('.coord-toast') as HTMLElement;
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

    setLocationText(preset.texts.location);
    setLatitude(preset.texts.lat);
    setLongitude(preset.texts.lng);
    setCaptionText(preset.texts.caption);
    setSubText(preset.texts.sub);
    setFooterText(preset.texts.footer);

    setBgColor(preset.styling.bg);
    setTextColor(preset.styling.text);
    setAccentColor(preset.styling.accent);
    setFontFamily(preset.styling.font);
    setPinType(preset.styling.pinType);

    showToast('Preset applied');
  };

  useEffect(() => {
    const checkToken = async () => {
      const hostname = window.location.hostname;
      const isAdmin = hostname.startsWith('serkan1881.') || localStorage.getItem('admin_session') === 'active';

      if (isAdmin) {
        setIsLocked(false);
        if (!token || token === 'demo-token' || token === 'coordinates' || token.length < 10) {
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
          setLocationText(ds.locationText || '');
          setLatitude(ds.latitude ?? 51.5014);
          setLongitude(ds.longitude ?? -0.1921);
          setCaptionText(ds.captionText || '');
          setSubText(ds.subText || '');
          setFooterText(ds.footerText || '');
          setBgColor(ds.bgColor || '#fcfbf7');
          setTextColor(ds.textColor || '#1c1917');
          setAccentColor(ds.accentColor || '#b45309');
          setFontFamily(ds.fontFamily || 'Playfair Display');
          setPinType(ds.pinType || 'compass');
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

    drawCoordinatesStructure();

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

  const drawCoordinatesStructure = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    isRebuildingRef.current = true;

    const objs = canvas.getObjects().filter(o => o !== bgRectRef.current);
    objs.forEach(o => canvas.remove(o));

    const cw = containerDims.width;
    const ch = containerDims.height;

    const drawText = (txt: string, yPos: number, size: number, weight: string, color: string, spacing = 50) => {
      const obj = new fabric.Text(txt.toUpperCase(), {
        left: cw / 2,
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

    const drawVectorPin = () => {
      const cx = cw / 2;
      const cy = ch * 0.38;

      if (pinType === 'pin') {
        const pinPath = new fabric.Path(
          'M 12 2 C 7.03 2 3 6.03 3 11 C 3 17.5 12 22 12 22 C 12 22 21 17.5 21 11 C 21 6.03 16.97 2 12 2 Z M 12 14 C 10.34 14 9 12.66 9 11 C 9 9.34 10.34 8 12 8 C 13.66 8 15 9.34 15 11 C 15 12.66 13.66 14 12 14 Z',
          {
            left: cx,
            top: cy,
            originX: 'center',
            originY: 'center',
            fill: accentColor,
            scaleX: 3.5,
            scaleY: 3.5,
            selectable: !isLocked,
          }
        );
        canvas.add(pinPath);
      } else if (pinType === 'compass') {
        const outerCircle = new fabric.Circle({
          left: cx,
          top: cy,
          radius: 45,
          fill: '',
          stroke: textColor,
          strokeWidth: 2,
          originX: 'center',
          originY: 'center',
          selectable: !isLocked,
        });
        canvas.add(outerCircle);

        const innerCircle = new fabric.Circle({
          left: cx,
          top: cy,
          radius: 6,
          fill: accentColor,
          originX: 'center',
          originY: 'center',
          selectable: !isLocked,
        });
        canvas.add(innerCircle);

        const needleNorth = new fabric.Path('M 0 0 L -8 0 L 0 -38 Z', {
          left: cx,
          top: cy - 19,
          originX: 'center',
          originY: 'center',
          fill: accentColor,
          selectable: !isLocked,
        });
        const needleSouth = new fabric.Path('M 0 0 L 8 0 L 0 38 Z', {
          left: cx,
          top: cy + 19,
          originX: 'center',
          originY: 'center',
          fill: textColor,
          selectable: !isLocked,
        });
        canvas.add(needleNorth, needleSouth);
      } else if (pinType === 'crosshair') {
        const circle1 = new fabric.Circle({
          left: cx,
          top: cy,
          radius: 35,
          fill: '',
          stroke: textColor,
          strokeWidth: 1.5,
          originX: 'center',
          originY: 'center',
          selectable: !isLocked,
        });
        const circle2 = new fabric.Circle({
          left: cx,
          top: cy,
          radius: 15,
          fill: '',
          stroke: accentColor,
          strokeWidth: 1.5,
          originX: 'center',
          originY: 'center',
          selectable: !isLocked,
        });
        const lH = new fabric.Line([cx - 50, cy, cx + 50, cy], {
          stroke: textColor,
          strokeWidth: 1.5,
          selectable: !isLocked,
        });
        const lV = new fabric.Line([cx, cy - 50, cx, cy + 50], {
          stroke: textColor,
          strokeWidth: 1.5,
          selectable: !isLocked,
        });
        canvas.add(circle1, circle2, lH, lV);
      }
    };

    drawVectorPin();

    drawText(locationText, ch * 0.12, 14, '700', textColor, 100);

    const dmsString = convertToDMS(latitude, longitude);
    drawText(dmsString, ch * 0.54, 18, '900', textColor, 120);

    const sepLine = new fabric.Line([cw * 0.35, ch * 0.60, cw * 0.65, ch * 0.60], {
      stroke: accentColor,
      strokeWidth: 2,
      selectable: !isLocked,
    });
    canvas.add(sepLine);

    drawText(captionText, ch * 0.65, 24, '800', textColor, 80);
    drawText(subText, ch * 0.70, 11, '500', accentColor, 60);
    drawText(footerText, ch * 0.88, 10, '600', textColor, 100);

    canvas.requestRenderAll();
    isRebuildingRef.current = false;
  };

  useEffect(() => {
    if (!isCheckingToken && !tokenError) {
      drawCoordinatesStructure();
    }
  }, [
    isCheckingToken, tokenError, locationText, latitude, longitude, captionText, 
    subText, footerText, bgColor, textColor, accentColor, fontFamily, pinType
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
          a.download = `coordinates-poster.png`;
          a.click();
        } else if (format === 'pdf') {
          const dataUrl = canvas.toDataURL({ format: 'png', multiplier });
          const pdf = new jsPDF({ orientation: w > h ? 'landscape' : 'portrait', unit: 'in', format: [w, h] });
          pdf.addImage(dataUrl, 'PNG', 0, 0, w, h);
          pdf.save(`coordinates-poster.pdf`);
        } else if (format === 'svg') {
          const svg = canvas.toSVG();
          const blob = new Blob([svg], { type: 'image/svg+xml' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `coordinates-poster.svg`;
          a.click();
          URL.revokeObjectURL(url);
        }

        const designStateJSON = {
          canvasSize, orientation, locationText, latitude, longitude, captionText,
          subText, footerText, bgColor, textColor, accentColor, fontFamily, pinType
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
        .coord-toast {
          position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%) translateY(20px);
          background: var(--accent); color: #000; padding: 10px 20px; border-radius: 24px;
          font-size: 13px; font-weight: 600; opacity: 0; transition: all 0.3s; z-index: 9999; pointer-events: none;
        }
        .file-generator-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(10px);
          display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 10000;
        }
        .pin-selectors {
          display: flex; gap: 8px; margin-top: 6px;
        }
        .pin-btn {
          flex: 1; height: 32px; display: flex; align-items: center; justify-content: center;
          background: var(--input-bg); border: 1px solid var(--input-border); color: var(--spotify-subtext);
          border-radius: 6px; cursor: pointer; transition: all 0.15s;
        }
        .pin-btn.active {
          background: var(--accent); color: #000; border-color: var(--accent);
        }
        .pin-btn svg { width: 14px; height: 14px; }
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
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <h1>Coordinates</h1>
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

        <button className={`accordion-btn${openSections.coords ? ' open' : ''}`} onClick={() => toggleAccordion('coords')}>
          &#127913; GPS Coordinates<span className="arrow">&#9660;</span>
        </button>
        <div className={`accordion-content${openSections.coords ? ' open' : ''}`}>
          <div className="form-row">
            <label>Latitude (Enlem)</label>
            <input type="number" step="0.0001" value={latitude} onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)} />
          </div>
          <div className="form-row">
            <label>Longitude (Boylam)</label>
            <input type="number" step="0.0001" value={longitude} onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)} />
          </div>
        </div>

        <button className={`accordion-btn${openSections.textFields ? ' open' : ''}`} onClick={() => toggleAccordion('textFields')}>
          &#128294; Typography Contents<span className="arrow">&#9660;</span>
        </button>
        <div className={`accordion-content${openSections.textFields ? ' open' : ''}`}>
          <div className="form-row">
            <label>Location Label (Top)</label>
            <input type="text" value={locationText} onChange={(e) => setLocationText(e.target.value)} />
          </div>
          <div className="form-row">
            <label>Main Caption</label>
            <input type="text" value={captionText} onChange={(e) => setCaptionText(e.target.value)} />
          </div>
          <div className="form-row">
            <label>Sub-Caption</label>
            <input type="text" value={subText} onChange={(e) => setSubText(e.target.value)} />
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
            <label>Target Pin Icon</label>
            <div className="pin-selectors">
              <button className={`pin-btn ${pinType === 'pin' ? 'active' : ''}`} onClick={() => setPinType('pin')} title="Map Pin">
                <MapPin />
              </button>
              <button className={`pin-btn ${pinType === 'compass' ? 'active' : ''}`} onClick={() => setPinType('compass')} title="Compass">
                <Compass />
              </button>
              <button className={`pin-btn ${pinType === 'crosshair' ? 'active' : ''}`} onClick={() => setPinType('crosshair')} title="Crosshair">
                <Crosshair />
              </button>
            </div>
          </div>
          <div className="form-row">
            <label>Font Family</label>
            <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)}>
              {GOOGLE_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div className="form-row">
            <label>Background Color</label>
            <div className="color-row">
              <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} />
              <input type="text" value={bgColor} onChange={(e) => setBgColor(e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <label>Text Ink Color</label>
            <div className="color-row">
              <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} />
              <input type="text" value={textColor} onChange={(e) => setTextColor(e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <label>Accent Highlights</label>
            <div className="color-row">
              <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} />
              <input type="text" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} />
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
                  Please review your coordinates carefully. Check GPS formats, spelling, and design parameters.
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

      <div className="coord-toast" style={{
        position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%) translateY(20px)',
        background: 'var(--accent)', color: '#000', padding: '10px 20px', borderRadius: '24px',
        fontSize: '13px', fontWeight: 600, opacity: 0, transition: 'all 0.3s', zIndex: 9999, pointerEvents: 'none'
      }}>Done</div>
    </div>
  );
}
