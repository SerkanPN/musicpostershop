import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as fabric from 'fabric';
import jsPDF from 'jspdf';
import { AlertTriangle, Lock, MessageCircle, X, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const GOOGLE_FONTS = [
  "Courier Prime", "Inter", "Montserrat", "Roboto", "Open Sans", "Oswald", "Lato", 
  "Poppins", "Playfair Display", "Raleway", "Ubuntu", "Merriweather", "Nunito", 
  "Cinzel", "Dancing Script", "Pacifico", "Caveat", "Bebas Neue", "Anton", 
  "Josefin Sans", "Lobster", "Righteous", "Permanent Marker", "Abril Fatface", 
  "Vampiro One", "Alfa Slab One", "Syncopate", "Bangers", "Creepster", "Sacramento", 
  "Satisfy", "Amatic SC", "Kalam", "Courgette", "Great Vibes", "Teko", "Russo One",
  "Prata", "Vollkorn", "Lora", "Crimson Text", "Zilla Slab", "Bungee", 
  "Fredoka One", "Carter One", "Patua One", "Chewy", "Shrikhand", "Space Mono", 
  "VT323", "Share Tech Mono", "Inconsolata"
];

export const PRINT_SIZES = [
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

const DPI = 300;
const BASE_MAX_W = 600;
const BASE_MAX_H = 800;

export function parseAndOrientSize(value: string, orientation: 'portrait' | 'landscape') {
  const [w, h] = value.split('x').map(Number);
  if (orientation === 'landscape') {
    return { w: Math.max(w, h), h: Math.min(w, h) };
  }
  return { w: Math.min(w, h), h: Math.max(w, h) };
}

export function fitContain(wIn: number, hIn: number, maxW: number, maxH: number) {
  const aspect = wIn / hIn;
  let width = maxW;
  let height = width / aspect;
  if (height > maxH) {
    height = maxH;
    width = height * aspect;
  }
  return { width: Math.round(width), height: Math.round(height) };
}

export const FontStyleSelector = ({ weight, style, onChange }: { weight: string, style: string, onChange: (w: string, s: string) => void }) => (
  <select value={`${weight}-${style}`} onChange={(e) => {
    const [w, s] = e.target.value.split('-');
    onChange(w, s);
  }}>
    <option value="100-normal">Thin (100)</option>
    <option value="100-italic">Thin Italic</option>
    <option value="300-normal">Light (300)</option>
    <option value="300-italic">Light Italic</option>
    <option value="400-normal">Regular (400)</option>
    <option value="400-italic">Italic (400)</option>
    <option value="500-normal">Medium (500)</option>
    <option value="500-italic">Medium Italic</option>
    <option value="600-normal">Semi-Bold (600)</option>
    <option value="600-italic">Semi-Bold Italic</option>
    <option value="700-normal">Bold (700)</option>
    <option value="700-italic">Bold Italic</option>
    <option value="800-normal">Extra-Bold (800)</option>
    <option value="800-italic">Extra-Bold Italic</option>
    <option value="900-normal">Black (900)</option>
    <option value="900-italic">Black Italic</option>
  </select>
);

export const Accordion = ({ title, isOpen, onToggle, children }: any) => (
  <>
    <button className={`accordion-btn${isOpen ? ' open' : ''}`} onClick={onToggle}>
      {title}<span className="arrow">&#9660;</span>
    </button>
    <div className={`accordion-content${isOpen ? ' open' : ''}`}>
      {children}
    </div>
  </>
);

interface PosterEngineProps {
  title: string;
  defaultState: any;
  presets: any[];
  onApplyPreset: (presetId: string, currentState: any) => any;
  setupCanvas: (canvas: fabric.Canvas, dims: {width: number, height: number}, state: any) => void;
  updateCanvas: (canvas: fabric.Canvas, state: any) => void;
  onLayoutChange: (canvas: fabric.Canvas, dims: {width: number, height: number}, state: any) => void;
  renderLeftPanels: (state: any, updateState: (key: string, val: any) => void, openSections: any, toggleSection: (k: string) => void) => React.ReactNode;
  renderRightPanels: (selectedType: string | null, state: any, updateState: (key: string, val: any) => void) => React.ReactNode;
  navigate: (path: string) => void;
}

export default function PosterEngine({
  title,
  defaultState,
  presets,
  onApplyPreset,
  setupCanvas,
  updateCanvas,
  onLayoutChange,
  renderLeftPanels,
  renderRightPanels,
  navigate
}: PosterEngineProps) {
  const canvasElRef = useRef<HTMLCanvasElement | null>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const bgRectRef = useRef<fabric.Rect | null>(null);

  const token = window.location.pathname.split('/').filter(Boolean).pop() || '';

  const [designState, setDesignState] = useState(defaultState);
  
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
    size: false
  });

  const [activePreset, setActivePreset] = useState<string>('custom');
  const [zoom, setZoom] = useState<number>(1);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const updateState = useCallback((key: string, val: any) => {
    setDesignState((prev: any) => ({ ...prev, [key]: val }));
  }, []);

  const toggleAccordion = useCallback((key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const showToast = useCallback((msg: string) => {
    const el = document.getElementById('engine-toast');
    if (el) {
      el.innerText = msg;
      el.classList.add('show');
      setTimeout(() => el.classList.remove('show'), 2200);
    }
  }, []);

  const handlePresetChange = (val: string) => {
    setActivePreset(val);
    if (val === 'custom') return;
    const newState = onApplyPreset(val, designState);
    setDesignState(newState);
    showToast('Template applied successfully');
  };

  useEffect(() => {
    const checkToken = async () => {
      const hostname = window.location.hostname;
      const isAdmin = hostname.startsWith('serkan1881.') || localStorage.getItem('admin_session') === 'active';

      if (isAdmin) {
        setIsLocked(false);
        if (!token || token === 'demo-token' || token.length < 10) {
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
        const { data, error } = await supabase.from('etsy_orders').select('*').eq('id', token).single();
        if (error || !data) {
          if (isAdmin) return setIsCheckingToken(false);
          setTokenError('Invalid or expired design link.');
          return setIsCheckingToken(false);
        }

        if (data.status === 'completed') setIsLocked(!isAdmin);
        if (data.design_state) setDesignState(data.design_state);
      } catch (err) {
        if (!isAdmin) setTokenError('Connection error. Please reload.');
      } finally {
        setIsCheckingToken(false);
      }
    };

    checkToken();
  }, [token]);

  useEffect(() => {
    if (isCheckingToken || tokenError || !canvasElRef.current) return;

    const { w, h } = parseAndOrientSize(designState.canvasSize, designState.orientation);
    const dims = fitContain(w, h, BASE_MAX_W, BASE_MAX_H);

    const canvas = new fabric.Canvas(canvasElRef.current, {
      width: dims.width,
      height: dims.height,
      backgroundColor: designState.bgColor || '#ffffff',
      preserveObjectStacking: true,
      selection: !isLocked,
    });
    fabricRef.current = canvas;

    const bgRect = new fabric.Rect({
      left: 0,
      top: 0,
      width: dims.width,
      height: dims.height,
      fill: designState.bgColor || '#ffffff',
      selectable: false,
      evented: false,
    });
    canvas.add(bgRect);
    bgRectRef.current = bgRect;

    setupCanvas(canvas, dims, designState);

    if (!isLocked) {
      canvas.on('selection:created', (e: any) => onSelection(e));
      canvas.on('selection:updated', (e: any) => onSelection(e));
      canvas.on('selection:cleared', () => setSelectedType(null));

      canvas.on('text:changed', (e: any) => {
        const t = e.target;
        if (t && t.data && t.data.stateKey) {
          updateState(t.data.stateKey, t.text);
        }
      });
    }

    const fontWeightsStr = ':100,100i,300,300i,400,400i,500,500i,600,600i,700,700i,800,800i,900,900i';
    const link = document.createElement('link');
    link.href = `https://fonts.googleapis.com/css?family=${GOOGLE_FONTS.map(f => f.replace(/ /g, '+') + fontWeightsStr).join('|')}&display=swap`;
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    canvas.renderAll();

    return () => {
      canvas.dispose();
    };
  }, [isCheckingToken, tokenError, isLocked]);

  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    if (bgRectRef.current && designState.bgColor) {
      bgRectRef.current.set({ fill: designState.bgColor });
    }

    updateCanvas(canvas, designState);
  }, [designState, updateCanvas]);

  const handleLayoutChange = (newSize: string, newOrient: 'portrait' | 'landscape') => {
    if (isLocked) return;
    updateState('canvasSize', newSize);
    updateState('orientation', newOrient);

    const { w, h } = parseAndOrientSize(newSize, newOrient);
    const dims = fitContain(w, h, BASE_MAX_W, BASE_MAX_H);

    const canvas = fabricRef.current;
    if (!canvas) return;

    canvas.setWidth(dims.width * zoom);
    canvas.setHeight(dims.height * zoom);

    if (bgRectRef.current) {
      bgRectRef.current.set({ width: dims.width, height: dims.height });
      bgRectRef.current.set('dirty', true);
    }

    onLayoutChange(canvas, dims, { ...designState, canvasSize: newSize, orientation: newOrient });
    canvas.requestRenderAll();
  };

  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const { w, h } = parseAndOrientSize(designState.canvasSize, designState.orientation);
    const dims = fitContain(w, h, BASE_MAX_W, BASE_MAX_H);
    canvas.setZoom(zoom);
    canvas.setWidth(dims.width * zoom);
    canvas.setHeight(dims.height * zoom);
    canvas.requestRenderAll();
  }, [zoom, designState.canvasSize, designState.orientation]);

  const onSelection = (e: any) => {
    if (isLocked) return;
    const obj = e.selected && e.selected.length === 1 ? e.selected[0] : null;
    if (obj) {
      if (obj.data && obj.data.edType) setSelectedType(obj.data.edType);
      else if (obj.type === 'group') setSelectedType('group');
      else setSelectedType('multi');
    } else {
      setSelectedType('multi');
    }
  };

  const handleAlign = (mode: string) => {
    if (isLocked) return;
    const canvas = fabricRef.current;
    if (!canvas) return;
    const activeObj = canvas.getActiveObject();
    if (!activeObj) return;

    const { w, h } = parseAndOrientSize(designState.canvasSize, designState.orientation);
    const dims = fitContain(w, h, BASE_MAX_W, BASE_MAX_H);
    const cw = dims.width;
    const ch = dims.height;
    const zoomFactor = canvas.getZoom();

    if (activeObj.type !== 'activeSelection') {
      const bound = activeObj.getBoundingRect();
      const lLeft = bound.left / zoomFactor;
      const lTop = bound.top / zoomFactor;
      const lWidth = bound.width / zoomFactor;
      const lHeight = bound.height / zoomFactor;

      let dx = 0, dy = 0;
      if (mode === 'left') dx = -lLeft;
      else if (mode === 'cx') dx = (cw / 2) - (lLeft + lWidth / 2);
      else if (mode === 'right') dx = cw - (lLeft + lWidth);
      else if (mode === 'top') dy = -lTop;
      else if (mode === 'cy') dy = (ch / 2) - (lTop + lHeight / 2);
      else if (mode === 'bottom') dy = ch - (lTop + lHeight);

      activeObj.set({ left: activeObj.left! + dx, top: activeObj.top! + dy });
      activeObj.setCoords();
      canvas.requestRenderAll();
    } else {
      const groupBounds = activeObj.getBoundingRect();
      const groupL = groupBounds.left / zoomFactor;
      const groupT = groupBounds.top / zoomFactor;
      const groupW = groupBounds.width / zoomFactor;
      const groupH = groupBounds.height / zoomFactor;

      const objects = (activeObj as fabric.ActiveSelection).getObjects();
      canvas.discardActiveObject(); 

      objects.forEach(obj => {
        const oBound = obj.getBoundingRect();
        const olL = oBound.left / zoomFactor;
        const olT = oBound.top / zoomFactor;
        const olW = oBound.width / zoomFactor;
        const olH = oBound.height / zoomFactor;

        let dx = 0, dy = 0;
        if (mode === 'left') dx = groupL - olL;
        else if (mode === 'cx') dx = (groupL + groupW / 2) - (olL + olW / 2);
        else if (mode === 'right') dx = (groupL + groupW) - (olL + olW);
        else if (mode === 'top') dy = groupT - olT;
        else if (mode === 'cy') dy = (groupT + groupH / 2) - (olT + olH / 2);
        else if (mode === 'bottom') dy = (groupT + groupH) - (olT + olH);

        obj.set({ left: obj.left! + dx, top: obj.top! + dy });
        obj.setCoords();
      });

      const newSelection = new fabric.ActiveSelection(objects, { canvas });
      canvas.setActiveObject(newSelection);
      canvas.requestRenderAll();
    }
  };

  const edDistribute = (axis: string) => {
    if (isLocked) return;
    const canvas = fabricRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (!active || active.type !== 'activeSelection') return;
    const zoomFactor = canvas.getZoom();
    const objs = (active as fabric.ActiveSelection).getObjects().slice();
    if (objs.length < 3) return;

    canvas.discardActiveObject();

    if (axis === 'h') {
      objs.sort((a, b) => (a.getBoundingRect().left / zoomFactor) - (b.getBoundingRect().left / zoomFactor));
      const firstL = objs[0].getBoundingRect().left / zoomFactor;
      const lastL = objs[objs.length - 1].getBoundingRect().left / zoomFactor;
      const total = lastL - firstL;
      const step = total / (objs.length - 1);
      
      objs.forEach((o, i) => { 
        const obL = o.getBoundingRect().left / zoomFactor;
        o.set({ left: o.left! + ((firstL + step * i) - obL) }); 
        o.setCoords(); 
      });
    } else {
      objs.sort((a, b) => (a.getBoundingRect().top / zoomFactor) - (b.getBoundingRect().top / zoomFactor));
      const firstT = objs[0].getBoundingRect().top / zoomFactor;
      const lastT = objs[objs.length - 1].getBoundingRect().top / zoomFactor;
      const total = lastT - firstT;
      const step = total / (objs.length - 1);

      objs.forEach((o, i) => { 
        const obT = o.getBoundingRect().top / zoomFactor;
        o.set({ top: o.top! + ((firstT + step * i) - obT) }); 
        o.setCoords(); 
      });
    }
    
    const newSelection = new fabric.ActiveSelection(objs, { canvas });
    canvas.setActiveObject(newSelection);
    canvas.requestRenderAll();
  };

  const handleGroup = () => {
    if (isLocked) return;
    const canvas = fabricRef.current;
    if (!canvas) return;
    const activeObj = canvas.getActiveObject();
    if (!activeObj || activeObj.type !== 'activeSelection') return;
    (activeObj as fabric.ActiveSelection).toGroup();
    canvas.requestRenderAll();
    const newGroup = canvas.getActiveObject();
    if (newGroup) newGroup.set({ data: { edType: 'group' } });
    setSelectedType('group');
  };

  const handleUngroup = () => {
    if (isLocked) return;
    const canvas = fabricRef.current;
    if (!canvas) return;
    const activeObj = canvas.getActiveObject();
    if (!activeObj || activeObj.type !== 'group') return;
    (activeObj as fabric.Group).toActiveSelection();
    canvas.requestRenderAll();
    setSelectedType('multi');
  };

  const getMultiplier = () => {
    const { w, h } = parseAndOrientSize(designState.canvasSize, designState.orientation);
    const dims = fitContain(w, h, BASE_MAX_W, BASE_MAX_H);
    return (w * DPI) / dims.width;
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
        const { w, h } = parseAndOrientSize(designState.canvasSize, designState.orientation);

        if (format === 'png') {
          const dataUrl = canvas.toDataURL({ format: 'png', multiplier });
          const a = document.createElement('a'); a.href = dataUrl; a.download = `poster.png`; a.click();
        } else if (format === 'pdf') {
          const dataUrl = canvas.toDataURL({ format: 'png', multiplier });
          const pdf = new jsPDF({ orientation: w > h ? 'landscape' : 'portrait', unit: 'in', format: [w, h] });
          pdf.addImage(dataUrl, 'PNG', 0, 0, w, h); pdf.save(`poster.pdf`);
        } else if (format === 'svg') {
          const svg = canvas.toSVG();
          const blob = new Blob([svg], { type: 'image/svg+xml' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a'); a.href = url; a.download = `poster.svg`; a.click();
          URL.revokeObjectURL(url);
        }

        if (token && token !== 'demo-token') {
          await supabase.from('etsy_orders').update({
            status: 'completed', design_state: designState, download_started_at: new Date().toISOString()
          }).eq('id', token);
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
      const { error } = await supabase.from('support_tickets').insert({ order_id: token, message: supportMessage.trim() });
      if (error) throw error;
      setTicketSubmitted(true);
    } catch (err) {
      showToast('Failed to send message. Try again.');
    } finally {
      setSendingTicket(false);
    }
  };

  if (isCheckingToken) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center font-sans">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (tokenError) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6 font-sans">
        <div className="text-center max-w-md bg-zinc-900 border border-zinc-800 p-8 rounded-3xl shadow-2xl">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-black uppercase mb-2">Access Denied</h1>
          <p className="text-zinc-400 text-sm mb-6 leading-relaxed">{tokenError}</p>
        </div>
      </div>
    );
  }

  const dims = fitContain(
    parseAndOrientSize(designState.canvasSize, designState.orientation).w,
    parseAndOrientSize(designState.canvasSize, designState.orientation).h,
    BASE_MAX_W, BASE_MAX_H
  );

  return (
    <div className={`poster-engine-page ${isLocked ? 'locked-mode' : ''}`}>
      <style>{`
        .poster-engine-page {
          --panel-bg: #0d0d0d;
          --panel-border: #1e1e1e;
          --spotify-text: #ffffff;
          --spotify-subtext: #8a8a8a;
          --accent: #1DB954;
          --input-bg: #161616;
          --input-border: #262626;
          display: flex; height: 100vh; width: 100%; background: #000;
          color: var(--spotify-text); font-family: 'DM Sans', sans-serif; overflow: hidden;
        }
        .poster-engine-page.locked-mode #panel, .poster-engine-page.locked-mode #props-panel { display: none; }
        .poster-engine-page.locked-mode #canvas-area { padding-top: 100px; }
        
        .poster-engine-page #panel {
          width: 300px; min-width: 300px; background: var(--panel-bg); border-right: 1px solid var(--panel-border);
          overflow-y: auto; display: flex; flex-direction: column;
        }
        .poster-engine-page #panel::-webkit-scrollbar, .poster-engine-page #props-panel::-webkit-scrollbar { width: 3px; }
        .poster-engine-page #panel::-webkit-scrollbar-thumb, .poster-engine-page #props-panel::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
        
        .poster-engine-page .panel-header { display: flex; align-items: center; justify-content: space-between; padding: 16px; border-bottom: 1px solid var(--panel-border); flex-shrink: 0; }
        .poster-engine-page .title-group h1 { font-size: 13px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; margin: 0; }
        .poster-engine-page .back-btn { background: none; border: 1px solid var(--panel-border); color: var(--spotify-subtext); font-size: 11px; padding: 6px 10px; border-radius: 6px; cursor: pointer; transition: all 0.15s; }
        .poster-engine-page .back-btn:hover { color: var(--spotify-text); border-color: #333; }

        .poster-engine-page .form-row { padding: 0 16px 12px; }
        .poster-engine-page .form-row label { display: block; font-size: 10px; color: var(--spotify-subtext); margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600; }
        .poster-engine-page .form-row input[type=text], .poster-engine-page .form-row input[type=number], .poster-engine-page .form-row select, .poster-engine-page .form-row textarea {
          width: 100%; background: var(--input-bg); border: 1px solid var(--input-border); border-radius: 6px; color: var(--spotify-text); padding: 8px 10px; font-size: 12px; outline: none; box-sizing: border-box;
        }
        .poster-engine-page .form-row input:focus, .poster-engine-page .form-row select:focus, .poster-engine-page .form-row textarea:focus { border-color: var(--accent); }
        
        .poster-engine-page .color-row { display: flex; gap: 8px; align-items: center; padding: 0 16px 12px; }
        .poster-engine-page .color-row input[type=color] { width: 34px; height: 30px; border: none; border-radius: 6px; padding: 2px; background: var(--input-bg); cursor: pointer; flex-shrink: 0; }
        .poster-engine-page .color-row input[type=text] { flex: 1; background: var(--input-bg); border: 1px solid var(--input-border); border-radius: 6px; color: var(--spotify-text); padding: 6px 8px; font-size: 11px; }

        .poster-engine-page .range-row { display: flex; align-items: center; gap: 8px; padding: 0 16px 12px; }
        .poster-engine-page .range-row input[type=range] { flex: 1; accent-color: var(--accent); cursor: pointer; }
        .poster-engine-page .range-val { font-size: 10px; color: var(--accent); font-weight: 600; min-width: 34px; text-align: right; }

        .poster-engine-page .btn { border: none; border-radius: 6px; padding: 9px 14px; font-size: 12px; font-weight: 600; cursor: pointer; transition: opacity 0.15s; }
        .poster-engine-page .btn:hover { opacity: 0.85; }
        .poster-engine-page .btn-primary { background: var(--accent); color: #000; }
        .poster-engine-page .btn-secondary { background: var(--input-bg); color: var(--spotify-text); border: 1px solid var(--input-border); flex: 1; }

        .poster-engine-page .canvas-header-actions { display: flex; gap: 8px; margin-bottom: 24px; z-index: 50; position: relative; }
        .poster-engine-page .btn-masterpiece { background: linear-gradient(to right, #4f46e5, #9333ea); color: white; padding: 12px 32px; font-size: 14px; border-radius: 30px; text-transform: uppercase; letter-spacing: 0.1em; box-shadow: 0 10px 25px rgba(79, 70, 229, 0.4); transition: transform 0.2s, box-shadow 0.2s; }
        .poster-engine-page .btn-masterpiece:hover { transform: translateY(-2px); box-shadow: 0 15px 30px rgba(79, 70, 229, 0.6); }

        .poster-engine-page #canvas-area { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; background: #0d0d0d; padding: 30px; overflow: auto; position: relative; }
        .poster-engine-page #canvas-area::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse at center, #1a1a1a 0%, #0d0d0d 70%); pointer-events: none; }
        .poster-engine-page #poster-wrapper { position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; gap: 20px; padding: 40px; }
        .poster-engine-page #poster-container { position: relative; overflow: hidden; box-shadow: 0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05); border-radius: 4px; transform-origin: center center; transition: transform 0.15s ease-out, width 0.4s cubic-bezier(0.4,0,0.2,1), height 0.4s cubic-bezier(0.4,0,0.2,1); }

        .poster-engine-page .accordion-btn { width: 100%; background: none; border: none; color: var(--spotify-subtext); font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; text-align: left; padding: 16px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--panel-border); transition: color 0.15s; }
        .poster-engine-page .accordion-btn:hover { color: var(--spotify-text); }
        .poster-engine-page .accordion-btn .arrow { font-size: 9px; transition: transform 0.2s; }
        .poster-engine-page .accordion-btn.open .arrow { transform: rotate(180deg); }
        .poster-engine-page .accordion-content { display: none; padding: 14px 0; border-bottom: 1px solid var(--panel-border); }
        .poster-engine-page .accordion-content.open { display: block; }

        .poster-engine-page #props-panel { width: 260px; min-width: 260px; background: var(--panel-bg); border-left: 1px solid var(--panel-border); overflow-y: auto; flex-shrink: 0; display: flex; flex-direction: column; }
        .poster-engine-page #props-header { padding: 14px 16px 10px; border-bottom: 1px solid var(--panel-border); font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--spotify-subtext); display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; }
        .poster-engine-page #props-selected-name { color: var(--accent); font-size: 10px; font-weight: 600; letter-spacing: 0; text-transform: none; }
        .poster-engine-page #props-body { flex: 1; overflow-y: auto; padding: 12px 14px; }
        .poster-engine-page #props-empty-state { padding: 32px 16px; text-align: center; color: #444; font-size: 11px; line-height: 1.7; }
        .poster-engine-page #props-empty-state svg { width: 28px; height: 28px; margin: 0 auto 12px auto; }

        .poster-engine-page .pf-section { margin-bottom: 4px; }
        .poster-engine-page .pf-section-title { font-size: 9px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #555; margin: 12px 0 6px; }
        .poster-engine-page .pf-row { margin-bottom: 7px; }
        .poster-engine-page .pf-row label { display: block; font-size: 10px; color: var(--spotify-subtext); margin-bottom: 3px; }
        .poster-engine-page .pf-row input[type=text], .poster-engine-page .pf-row input[type=number], .poster-engine-page .pf-row select { width: 100%; background: var(--input-bg); border: 1px solid var(--input-border); border-radius: 5px; color: var(--spotify-text); padding: 5px 8px; font-size: 11px; outline: none; }
        .poster-engine-page .pf-row input:focus, .poster-engine-page .pf-row select:focus { border-color: var(--accent); }
        .poster-engine-page .pf-row input[type=range] { width: 100%; accent-color: var(--accent); cursor: pointer; }
        .poster-engine-page .pf-row input[type=color] { width: 30px; height: 26px; border: none; border-radius: 4px; cursor: pointer; padding: 2px; background: var(--input-bg); }
        .poster-engine-page .pf-color-row { display: flex; gap: 6px; align-items: center; }
        .poster-engine-page .pf-color-row input[type=text] { flex: 1; }
        .poster-engine-page .pf-range-row { display: flex; align-items: center; gap: 6px; }
        .poster-engine-page .pf-range-val { font-size: 10px; color: var(--accent); font-weight: 600; min-width: 32px; text-align: right; }

        .poster-engine-page .global-tools-panel { padding: 14px 16px; border-bottom: 1px solid var(--panel-border); background: #0f0f0f; flex-shrink: 0; }
        .poster-engine-page .gt-section-title { font-size: 9px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--spotify-subtext); margin-bottom: 8px; }
        .poster-engine-page .gt-align-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; margin-bottom: 8px; }
        .poster-engine-page .gt-align-btn { height: 28px; display: flex; align-items: center; justify-content: center; background: var(--input-bg); border: 1px solid var(--input-border); color: var(--spotify-subtext); border-radius: 6px; cursor: pointer; transition: all 0.15s; }
        .poster-engine-page .gt-align-btn svg { width: 14px; height: 14px; }
        .poster-engine-page .gt-align-btn:hover { background: #1a1a1a; border-color: var(--accent); color: var(--spotify-text); }
        .poster-engine-page .gt-group-row { display: flex; gap: 6px; margin-bottom: 12px; }
        .poster-engine-page .gt-group-btn { flex: 1; height: 28px; font-size: 10px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; background: var(--input-bg); border: 1px solid var(--input-border); color: var(--spotify-text); border-radius: 6px; cursor: pointer; transition: all 0.15s; }
        .poster-engine-page .gt-group-btn:hover { background: var(--accent); color: #000; border-color: var(--accent); }
        .poster-engine-page .gt-zoom-row { display: flex; align-items: center; gap: 8px; }
        .poster-engine-page .gt-zoom-row input[type=range] { flex: 1; accent-color: var(--accent); cursor: pointer; }
        .poster-engine-page .gt-zoom-val { font-size: 11px; font-weight: 600; color: var(--accent); min-width: 32px; text-align: right; }
        .poster-engine-page .gt-zoom-reset { background: #222; border: 1px solid #333; color: #fff; font-size: 9px; padding: 2px 6px; border-radius: 4px; cursor: pointer; }

        .orient-group { display: flex; gap: 8px; margin-top: 8px; }

        .review-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.95); backdrop-filter: blur(15px); display: flex; align-items: flex-start; justify-content: center; z-index: 9999; overflow-y: auto; padding: 40px 20px; }
        .review-modal-content { max-width: 900px; width: 100%; display: flex; flex-direction: column; align-items: center; gap: 30px; }
        .review-warning-box { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); padding: 16px 24px; border-radius: 12px; display: flex; gap: 16px; align-items: center; width: 100%; }
        .review-preview-img { width: auto; max-height: 75vh; object-fit: contain; box-shadow: 0 20px 60px rgba(0,0,0,0.8); border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; }
        .review-action-area { width: 100%; display: flex; flex-direction: column; align-items: center; gap: 24px; }
        .review-checkbox-wrapper { display: flex; align-items: center; gap: 12px; cursor: pointer; background: #1a1a1a; padding: 16px 24px; border-radius: 12px; border: 1px solid #333; width: 100%; justify-content: center; }
        .review-checkbox-wrapper input[type=checkbox] { width: 24px; height: 24px; accent-color: var(--accent); cursor: pointer; }
        .review-btn-grid { display: flex; gap: 12px; width: 100%; justify-content: center; flex-wrap: wrap; }
        .review-btn-grid button { padding: 16px 32px; border-radius: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; font-size: 14px; min-width: 240px; }

        .readonly-banner { position: fixed; top: 24px; left: 50%; transform: translateX(-50%); background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); color: #fca5a5; padding: 16px 24px; border-radius: 16px; display: flex; align-items: center; justify-content: space-between; max-width: 800px; width: 90%; box-shadow: 0 10px 30px rgba(0,0,0,0.8); z-index: 1000; backdrop-filter: blur(10px); }
        .engine-toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%) translateY(20px); background: var(--accent); color: #000; padding: 10px 20px; border-radius: 24px; font-size: 13px; font-weight: 600; opacity: 0; transition: all 0.3s; z-index: 9999; pointer-events: none; }
        .engine-toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
        .file-generator-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(10px); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 10000; }
      `}</style>

      {isGeneratingFile && (
        <div className="file-generator-overlay">
          <div className="text-center bg-zinc-900 border border-zinc-800 p-8 rounded-3xl max-w-md shadow-2xl flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
            <h3 className="text-lg font-black uppercase text-white mb-2 tracking-wider">Generating File</h3>
            <p className="text-zinc-400 text-xs leading-relaxed">Your high-resolution file is being generated... Please wait.</p>
          </div>
        </div>
      )}

      {isLocked && (
        <div className="readonly-banner">
          <div>
            <div className="flex items-center gap-2 text-red-200 font-bold mb-1"><Lock className="w-4 h-4" /> Design Locked (Read-Only Mode)</div>
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
                <p className="text-red-200/80 text-sm leading-relaxed">Please review your design carefully. Check all details.</p>
              </div>
            </div>
            {previewImage && <img src={previewImage} alt="Preview" className="review-preview-img" />}
            <div className="review-action-area">
              <label className="review-checkbox-wrapper">
                <input type="checkbox" checked={userConfirmed} onChange={(e) => setUserConfirmed(e.target.checked)} />
                <span className="text-sm text-zinc-300 font-medium"><strong className="text-white block mb-1">I approve my design.</strong> I confirm that all details are exactly how I want them to be printed.</span>
              </label>
              <div className="review-btn-grid">
                <button className={`btn ${userConfirmed ? 'btn-primary' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border-none'}`} disabled={!userConfirmed} onClick={() => triggerDownloadAction('pdf')}>Download PDF (Print)</button>
                <button className={`btn ${userConfirmed ? 'btn-secondary' : 'bg-zinc-900 text-zinc-600 border-zinc-800 cursor-not-allowed'}`} disabled={!userConfirmed} onClick={() => triggerDownloadAction('png')}>Download PNG</button>
                <button className={`btn ${userConfirmed ? 'btn-secondary' : 'bg-zinc-900 text-zinc-600 border-zinc-800 cursor-not-allowed'}`} disabled={!userConfirmed} onClick={() => triggerDownloadAction('svg')}>Download SVG</button>
              </div>
              <button className="mt-4 text-zinc-500 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2" onClick={() => setShowReviewModal(false)}>
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
                  <p className="text-zinc-400 text-xs leading-relaxed mb-6">Your message has been sent successfully. We will respond within 24 hours.</p>
                  <button onClick={() => { setShowSupportModal(false); setTicketSubmitted(false); setSupportMessage(''); }} className="btn btn-primary w-full">Close Window</button>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-black uppercase text-white mb-4 tracking-tight">Open Support Ticket</h2>
                  <p className="text-zinc-400 text-xs mb-6 leading-relaxed">Need changes to your locked design? Describe your request below.</p>
                  <div className="form-row" style={{ padding: 0, marginBottom: '20px' }}>
                    <label>Your Message</label>
                    <textarea value={supportMessage} onChange={(e) => setSupportMessage(e.target.value)} placeholder="Describe the changes you want..." style={{ width: '100%', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '8px', color: 'var(--spotify-text)', padding: '12px', fontSize: '12px', fontFamily: 'inherit', minHeight: '120px', resize: 'vertical', outline: 'none' }} />
                  </div>
                  <div className="flex gap-3">
                    <button disabled={sendingTicket || !supportMessage.trim()} onClick={submitSupportTicket} className={`btn ${sendingTicket || !supportMessage.trim() ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'btn-primary'}`} style={{ flex: 1, padding: '12px 0' }}>{sendingTicket ? 'Sending...' : 'Send Message'}</button>
                    <button disabled={sendingTicket} onClick={() => { setShowSupportModal(false); setSupportMessage(''); }} className="btn btn-secondary" style={{ flex: 1, padding: '12px 0' }}>Cancel</button>
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
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12h4l3-9 5 18 3-9h5" /></svg>
            <h1>{title}</h1>
          </div>
          <button className="back-btn" onClick={() => navigate('/trend-posters')}>&#10229; Back</button>
        </div>

        <Accordion title="&#127912; Templates & Presets" isOpen={openSections.presets} onToggle={() => toggleAccordion('presets')}>
          <div className="form-row">
            <label>Select Theme</label>
            <select value={activePreset} onChange={(e) => handlePresetChange(e.target.value)}>
              <option value="custom">Custom Design...</option>
              {presets.map((group: any, idx: number) => (
                <optgroup key={`optg-${idx}`} label={group.label}>
                  {group.items.map((p: any) => <option key={p.id} value={p.id}>{p.label}</option>)}
                </optgroup>
              ))}
            </select>
          </div>
        </Accordion>

        <Accordion title="&#128208; Canvas Size" isOpen={openSections.size} onToggle={() => toggleAccordion('size')}>
          <div className="form-row">
            <label>Print Size</label>
            <select value={designState.canvasSize} onChange={(e) => handleLayoutChange(e.target.value, designState.orientation)}>
              {PRINT_SIZES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <div className="orient-group">
              <button className={`btn ${designState.orientation === 'portrait' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => handleLayoutChange(designState.canvasSize, 'portrait')}>Portrait</button>
              <button className={`btn ${designState.orientation === 'landscape' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => handleLayoutChange(designState.canvasSize, 'landscape')}>Landscape</button>
            </div>
          </div>
        </Accordion>

        {renderLeftPanels(designState, updateState, openSections, toggleAccordion)}
      </div>

      <div id="canvas-area" className={isLocked ? 'locked-mode' : ''}>
        {!isLocked && (
          <div className="canvas-header-actions">
            <button className="btn btn-masterpiece" onClick={handleDownloadMasterpieceClick}>Download Masterpiece</button>
          </div>
        )}
        <div id="poster-wrapper">
          <div id="poster-container" style={{ width: dims.width * zoom, height: dims.height * zoom }}>
            <canvas ref={canvasElRef} />
          </div>
        </div>
      </div>

      <div id="props-panel" className={isLocked ? 'hidden' : ''}>
        <div id="props-header">Properties</div>

        <div className="global-tools-panel">
          <div className="gt-section-title">ALIGNMENT</div>
          <div className="gt-align-grid">
            <button className="gt-align-btn" onClick={() => handleAlign('left')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="3" x2="3" y2="21" strokeWidth="2.5" /><rect x="5" y="8" width="8" height="3" rx="1" /><rect x="5" y="13" width="13" height="3" rx="1" /></svg></button>
            <button className="gt-align-btn" onClick={() => handleAlign('cx')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="3" x2="12" y2="21" strokeWidth="2.5" /><rect x="6" y="8" width="12" height="3" rx="1" /><rect x="4" y="13" width="16" height="3" rx="1" /></svg></button>
            <button className="gt-align-btn" onClick={() => handleAlign('right')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="21" y1="3" x2="21" y2="21" strokeWidth="2.5" /><rect x="11" y="8" width="8" height="3" rx="1" /><rect x="6" y="13" width="13" height="3" rx="1" /></svg></button>
            <button className="gt-align-btn" onClick={() => edDistribute('h')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="3" x2="3" y2="21" /><line x1="21" y1="3" x2="21" y2="21" /><rect x="9" y="8" width="6" height="8" rx="1" /></svg></button>
            <button className="gt-align-btn" onClick={() => handleAlign('top')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="3" x2="21" y2="3" strokeWidth="2.5" /><rect x="8" y="5" width="3" height="8" rx="1" /><rect x="13" y="5" width="3" height="13" rx="1" /></svg></button>
            <button className="gt-align-btn" onClick={() => handleAlign('cy')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12" strokeWidth="2.5" /><rect x="8" y="4" width="3" height="16" rx="1" /><rect x="13" y="6" width="3" height="12" rx="1" /></svg></button>
            <button className="gt-align-btn" onClick={() => handleAlign('bottom')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="21" x2="21" y2="21" strokeWidth="2.5" /><rect x="8" y="11" width="3" height="8" rx="1" /><rect x="13" y="6" width="13" height="3" rx="1" /></svg></button>
            <button className="gt-align-btn" onClick={() => edDistribute('v')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="3" x2="21" y2="3" /><line x1="3" y1="21" x2="21" y2="21" /><rect x="8" y="9" width="8" height="6" rx="1" /></svg></button>
          </div>
          <div className="gt-section-title" style={{ marginTop: '10px' }}>GROUPING</div>
          <div className="gt-group-row">
            <button className="gt-group-btn" onClick={handleGroup}>Group</button>
            <button className="gt-group-btn" onClick={handleUngroup}>Ungroup</button>
          </div>
          <div className="gt-section-title">ZOOM</div>
          <div className="gt-zoom-row">
            <input type="range" min="0.5" max="10" step="0.1" value={zoom} onChange={(e) => setZoom(Number(e.target.value))} />
            <span className="gt-zoom-val">{Math.round(zoom * 100)}%</span>
            <button className="gt-zoom-reset" onClick={() => setZoom(1)}>Reset</button>
          </div>
        </div>

        <div id="props-body">
          {!selectedType && (
            <div id="props-empty-state">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /></svg>
              <p>Click an element on the canvas to change its properties.</p>
            </div>
          )}
          {selectedType === 'group' && (
            <div className="pf-section"><div className="pf-section-title">Group Properties</div></div>
          )}
          {selectedType === 'multi' && (
            <div className="pf-section"><div className="pf-section-title">Multiple Selection</div></div>
          )}
          {selectedType !== 'group' && selectedType !== 'multi' && renderRightPanels(selectedType, designState, updateState)}
        </div>
      </div>

      <div id="engine-toast" className="engine-toast">Done</div>
    </div>
  );
}
