import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as fabric from 'fabric';
import jsPDF from 'jspdf';
import { AlertTriangle, Lock, MessageCircle, X, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

const GOOGLE_FONTS = [
  "Playfair Display", "Cormorant Garamond", "Bodoni Moda", "Lora", "Prata", "Cinzel",
  "Montserrat", "Inter", "Josefin Sans", "Oswald", "Space Mono", "Courier Prime",
  "Nunito", "Raleway", "Abril Fatface", "Bebas Neue", "Syncopate"
];

const PRINT_SIZES = [
  { value: '5.83x8.27', label: 'A5 (5.83" x 8.27")' },
  { value: '8.27x11.69', label: 'A4 (8.27" x 11.69")' },
  { value: '11.69x16.54', label: 'A3 (11.69" x 16.54")' },
  { value: '16.54x23.39', label: 'A2 (16.54" x 23.39")' },
  { value: '23.39x33.11', label: 'A1 (23.39" x 33.11")' },
  { value: '8x10', label: '8" x 10"' },
  { value: '11x14', label: '11" x 14"' },
  { value: '12x18', label: '12" x 18"' },
  { value: '16x24', label: '16" x 24"' },
  { value: '18x24', label: '18" x 24"' },
  { value: '24x36', label: '24" x 36"' }
];

const PRESETS = [
  {
    id: 'elegant-boutique',
    label: 'Elegant Boutique Stay',
    desc: 'High-end serif typography with soft beige and charcoal tones for luxury rentals.',
    texts: {
      headline: 'WELCOME TO THE VILLA',
      host: 'HOSTED BY: THE KAYA FAMILY (+90 555 123 4567)',
      checkin: 'CHECK-IN: 15:00  •  CHECK-OUT: 11:00',
      wifiSsid: 'VILLA_GUEST_5G',
      wifiPass: 'oceanbreeze2026',
      rules: '• PLEASE RESPECT QUIET HOURS AFTER 10:00 PM.\n\n• NO SMOKING OR VAPING INSIDE THE PROPERTY.\n\n• PLEASE SHAKE OFF SAND BEFORE ENTERING.\n\n• ENJOY THE COMPLIMENTARY COFFEE BAR.',
      emergency: 'EMERGENCY: DIAL 112  •  NEAREST PHARMACY: 2 KM AWAY'
    },
    styling: {
      bg: '#fbfaf8', 
      ink: '#292524', 
      accent: '#9a3412', 
      font: 'Cormorant Garamond'
    }
  },
  {
    id: 'urban-minimalist',
    label: 'Urban Minimalist Loft',
    desc: 'Clean, modern sans-serif look. High contrast black & white with a pop of teal.',
    texts: {
      headline: 'LOFT NUMBER SEVEN',
      host: 'YOUR HOSTS: ALEX & MARCUS',
      checkin: 'CHECK-IN: 3:00 PM  |  CHECK-OUT: 10:00 AM',
      wifiSsid: 'LOFT_7_FIBER',
      wifiPass: 'disruptthecity',
      rules: '• NO PARTYING OR LOUD MUSIC ALLOWED.\n\n• CHUTE TRASH DOWN THE HALLWAY DAILY.\n\n• KEEP FRONT GATE LOCKED AT ALL TIMES.\n\n• MAKE YOURSELF AT HOME!',
      emergency: 'POLICE: DIAL 999  |  AC UNIT CODE: *404#'
    },
    styling: {
      bg: '#ffffff', 
      ink: '#09090b', 
      accent: '#0d9488', 
      font: 'Montserrat'
    }
  },
  {
    id: 'dog-rules',
    label: 'The Golden Retriever Rules',
    desc: 'A hilarious poster for dog owners listing the "laws" of the house.',
    texts: {
      headline: 'HOUSE RULES',
      host: 'DICTATED BY: MAX THE GOLDEN RETRIEVER',
      checkin: 'WAKE UP: 06:30 AM  •  BEDTIME: WHEN I SAY SO',
      wifiSsid: 'VET CLINIC',
      wifiPass: 'DR. SMITH (555-0000)',
      rules: '• IF IT DROPS ON THE FLOOR, IT BELONGS TO ME.\n\n• YOU MUST PAY THE CHEESE TAX WHEN COOKING.\n\n• KNOCKS ON THE DOOR REQUIRE MAXIMUM BARKING.\n\n• BELLY RUBS ARE MANDATORY UPON ENTRY.',
      emergency: 'TREATS LOCATION: TOP SHELF  •  FAVORITE TOY: MR. SQUEAKY'
    },
    styling: {
      bg: '#fffbeb', 
      ink: '#451a03', 
      accent: '#d97706', 
      font: 'Josefin Sans'
    }
  },
  {
    id: 'roommate-guide',
    label: 'Roommate Survival Guide',
    desc: 'A stylish and fun manifesto for shared apartments to keep the peace.',
    texts: {
      headline: 'APARTMENT 4B SURVIVAL',
      host: 'THE TRIBUNAL: SARAH, MIKE & JOSH',
      checkin: 'RENT DUE: 1ST OF MONTH  •  TRASH DAY: TUESDAY',
      wifiSsid: 'APT_4B_ROUTER',
      wifiPass: 'payyourrent',
      rules: '• REPLACE THE TOILET PAPER ROLL. IT IS NOT HARD.\n\n• IF YOU EMPTY THE COFFEE POT, MAKE A NEW ONE.\n\n• NO GUESTS LONGER THAN 3 DAYS WITHOUT VOTING.\n\n• WASH YOUR OWN DISHES WITHIN 24 HOURS.',
      emergency: 'LANDLORD: MR. HECKLES  •  PLUMBER: 555-PIPE'
    },
    styling: {
      bg: '#18181b', 
      ink: '#f4f4f5', 
      accent: '#c084fc', 
      font: 'Space Mono'
    }
  }
];

const DPI = 300;
const BASE_MAX_W = 600;
const BASE_MAX_H = 850;

const EDIT_TYPES = {
  HEADLINE: 'ab-headline',
  HOST: 'ab-host',
  CHECKIN: 'ab-checkin',
  WIFI_SSID: 'ab-wifissid',
  WIFI_PASS: 'ab-wifipass',
  RULES_TITLE: 'ab-rules-title',
  RULES_TEXT: 'ab-rules-text',
  EMERGENCY: 'ab-emergency',
};

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

export default function AirbnbPosterPage({ navigate }: { navigate: (path: string) => void }) {
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
    textFields: false,
    styling: false
  });

  const [activePreset, setActivePreset] = useState<string>('elegant-boutique');

  const [canvasSize, setCanvasSize] = useState<string>('8.27x11.69');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [containerDims, setContainerDims] = useState(() => {
    const { w, h } = parseAndOrientSize('8.27x11.69', 'portrait');
    return fitContain(w, h, BASE_MAX_W, BASE_MAX_H);
  });
  const [zoom, setZoom] = useState<number>(1);

  const [headline, setHeadline] = useState('WELCOME TO THE VILLA');
  const [host, setHost] = useState('HOSTED BY: THE KAYA FAMILY (+90 555 123 4567)');
  const [checkin, setCheckin] = useState('CHECK-IN: 15:00  •  CHECK-OUT: 11:00');
  const [wifiSsid, setWifiSsid] = useState('VILLA_GUEST_5G');
  const [wifiPass, setWifiPass] = useState('oceanbreeze2026');
  const [rules, setRules] = useState('• PLEASE RESPECT QUIET HOURS AFTER 10:00 PM.\n\n• NO SMOKING OR VAPING INSIDE THE PROPERTY.\n\n• PLEASE SHAKE OFF SAND BEFORE ENTERING.\n\n• ENJOY THE COMPLIMENTARY COFFEE BAR.');
  const [emergency, setEmergency] = useState('EMERGENCY: DIAL 112  •  NEAREST PHARMACY: 2 KM AWAY');

  const [bgColor, setBgColor] = useState('#fbfaf8');
  const [inkColor, setInkColor] = useState('#292524');
  const [accentColor, setAccentColor] = useState('#9a3412');
  const [fontFamily, setFontFamily] = useState('Cormorant Garamond');

  const [selectedType, setSelectedType] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    const el = document.querySelector('.air-toast') as HTMLElement;
    if (el) {
      el.innerText = msg;
      el.style.opacity = '1';
      el.style.transform = 'translateX(-50%) translateY(0)';
      setTimeout(() => {
        el.style.opacity = '0';
        el.style.transform = 'translateX(-50%) translateY(20px)';
      }, 2200);
    }
  }, []);

  const toggleAccordion = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const applyPreset = (presetId: string) => {
    setActivePreset(presetId);
    const preset = PRESETS.find(p => p.id === presetId);
    if (!preset) return;

    setHeadline(preset.texts.headline);
    setHost(preset.texts.host);
    setCheckin(preset.texts.checkin);
    setWifiSsid(preset.texts.wifiSsid);
    setWifiPass(preset.texts.wifiPass);
    setRules(preset.texts.rules);
    setEmergency(preset.texts.emergency);

    setBgColor(preset.styling.bg);
    setInkColor(preset.styling.ink);
    setAccentColor(preset.styling.accent);
    setFontFamily(preset.styling.font);

    showToast('Premium layout applied');
  };

  useEffect(() => {
    const checkToken = async () => {
      const hostname = window.location.hostname;
      const isAdmin = hostname.startsWith('serkan1881.') || localStorage.getItem('admin_session') === 'active';

      if (isAdmin) {
        setIsLocked(false);
        if (!token || token === 'demo-token' || token === 'airbnb' || token.length < 10) {
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
          if (isAdmin) { setIsCheckingToken(false); return; }
          setTokenError('Invalid or expired design link.');
          setIsCheckingToken(false);
          return;
        }

        if (data.status === 'completed') {
          setIsLocked(!isAdmin);
        }

        if (data.design_state) {
          const ds = data.design_state;
          setCanvasSize(ds.canvasSize || '8.27x11.69');
          setOrientation(ds.orientation || 'portrait');
          setHeadline(ds.headline || '');
          setHost(ds.host || '');
          setCheckin(ds.checkin || '');
          setWifiSsid(ds.wifiSsid || '');
          setWifiPass(ds.wifiPass || '');
          setRules(ds.rules || '');
          setEmergency(ds.emergency || '');
          setBgColor(ds.bgColor || '#fbfaf8');
          setInkColor(ds.inkColor || '#292524');
          setAccentColor(ds.accentColor || '#9a3412');
          setFontFamily(ds.fontFamily || 'Cormorant Garamond');
        }
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

    const canvas = new fabric.Canvas(canvasElRef.current, {
      width: containerDims.width,
      height: containerDims.height,
      backgroundColor: bgColor,
      preserveObjectStacking: true,
      selection: !isLocked,
    });
    fabricRef.current = canvas;

    const bgRect = new fabric.Rect({
      left: 0, top: 0, width: containerDims.width, height: containerDims.height,
      fill: bgColor, selectable: false, evented: false,
    });
    canvas.add(bgRect);
    bgRectRef.current = bgRect;

    drawLayout();

    if (!isLocked) {
      canvas.on('selection:created', onSelectionChange);
      canvas.on('selection:updated', onSelectionChange);
      canvas.on('selection:cleared', () => {
        if (isRebuildingRef.current) return;
        const activeEl = document.activeElement;
        if (activeEl && (activeEl.closest('#panel') || activeEl.closest('#props-panel'))) return;
        setSelectedType(null);
      });
      
      canvas.on('text:changed', (e: any) => {
        const t = e.target;
        if (!t || !t.data) return;
        const v = t.text;
        switch (t.data.edType) {
          case EDIT_TYPES.HEADLINE: setHeadline(v); break;
          case EDIT_TYPES.HOST: setHost(v); break;
          case EDIT_TYPES.CHECKIN: setCheckin(v); break;
          case EDIT_TYPES.WIFI_SSID: setWifiSsid(v); break;
          case EDIT_TYPES.WIFI_PASS: setWifiPass(v); break;
          case EDIT_TYPES.RULES_TEXT: setRules(v); break;
          case EDIT_TYPES.EMERGENCY: setEmergency(v); break;
        }
      });
    }

    const fontWeightsStr = ':100,100i,300,300i,400,400i,500,500i,600,600i,700,700i,800,800i,900,900i';
    const link = document.createElement('link');
    link.href = `https://fonts.googleapis.com/css?family=${GOOGLE_FONTS.map(f => f.replace(/ /g, '+') + fontWeightsStr).join('|')}&display=swap`;
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    canvas.renderAll();

    return () => canvas.dispose();
  }, [isCheckingToken, tokenError, isLocked, containerDims]);

  function onSelectionChange(e: any) {
    if (isRebuildingRef.current || isLocked) return;
    const obj = e.selected && e.selected.length === 1 ? e.selected[0] : null;
    if (obj) {
      if (obj.data && obj.data.edType) {
        setSelectedType(obj.data.edType);
      } else if (obj.type === 'group') {
        setSelectedType('group');
      } else {
        setSelectedType('multi');
      }
    } else {
      setSelectedType('multi');
    }
  }

  const drawLayout = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    isRebuildingRef.current = true;
    
    const objs = canvas.getObjects().filter(o => o !== bgRectRef.current);
    objs.forEach(o => canvas.remove(o));

    const cw = containerDims.width;
    const ch = containerDims.height;
    const isPortrait = orientation === 'portrait';

    const marginL = cw * 0.08;
    const marginR = cw * 0.92;
    const innerW = marginR - marginL;

    let y = ch * 0.08;

    const createText = (txt: string, size: number, weight: string, align: 'left'|'center'|'right', x: number, customY: number, color: string, edType: string, width?: number) => {
      const isSerif = ['Playfair Display', 'Cormorant Garamond', 'Bodoni Moda', 'Lora', 'Prata', 'Cinzel'].includes(fontFamily);
      const options: any = {
        left: x, top: customY, originX: align,
        fontSize: size, fontFamily: fontFamily, fontWeight: weight,
        fill: color, selectable: !isLocked,
        data: { edType }
      };

      if (edType === EDIT_TYPES.HEADLINE) options.charSpacing = isSerif ? 100 : 50;
      if (edType === EDIT_TYPES.HOST || edType === EDIT_TYPES.CHECKIN) options.charSpacing = 150;
      
      let obj;
      if (width) {
        options.width = width;
        options.lineHeight = 1.6;
        options.textAlign = align;
        obj = new fabric.Textbox(txt, options);
      } else {
        obj = new fabric.IText(txt, options);
      }
      canvas.add(obj);
      return obj;
    };

    const drawLine = (x1: number, x2: number, yPos: number, thick: number = 1) => {
      const line = new fabric.Line([x1, yPos, x2, yPos], {
        stroke: inkColor, strokeWidth: thick, selectable: false, evented: false
      });
      canvas.add(line);
      return line;
    };

    const headObj = createText(headline.toUpperCase(), isPortrait ? 26 : 28, '700', 'center', cw/2, y, inkColor, EDIT_TYPES.HEADLINE);
    y += headObj.getBoundingRect().height + 15;

    createText(host.toUpperCase(), 10, '500', 'center', cw/2, y, inkColor, EDIT_TYPES.HOST);
    y += 20;

    drawLine(marginL, marginR, y, 2);
    y += 15;

    createText(checkin.toUpperCase(), 10, '600', 'center', cw/2, y, inkColor, EDIT_TYPES.CHECKIN);
    y += 20;

    drawLine(marginL, marginR, y, 1);
    y += 30;

    const drawBoxes = (startX: number, startY: number, boxW: number, boxH: number) => {
      const wifiRect = new fabric.Rect({
        left: startX, top: startY, width: boxW, height: boxH, rx: 6, ry: 6,
        fill: bgColor === '#09090b' || bgColor === '#18181b' ? '#27272a' : '#f5f5f4',
        stroke: accentColor, strokeWidth: 1.5, selectable: false
      });
      canvas.add(wifiRect);

      const wLabel = new fabric.Text('WI-FI & ACCESS', {
        left: startX + 20, top: startY + 20, fontSize: 10, fontFamily: fontFamily, fontWeight: '800', fill: accentColor, selectable: false
      });
      canvas.add(wLabel);

      createText(wifiSsid, 14, '700', 'left', startX + 20, startY + 45, inkColor, EDIT_TYPES.WIFI_SSID);
      
      const pLabel = new fabric.Text('PASSWORD', {
        left: startX + 20, top: startY + 75, fontSize: 10, fontFamily: fontFamily, fontWeight: '800', fill: accentColor, selectable: false
      });
      canvas.add(pLabel);

      createText(wifiPass, 14, '700', 'left', startX + 20, startY + 95, inkColor, EDIT_TYPES.WIFI_PASS);

      const contactRectX = isPortrait ? startX + boxW + (innerW - boxW*2) : startX;
      const contactRectY = isPortrait ? startY : startY + boxH + 20;
      
      const contactRect = new fabric.Rect({
        left: contactRectX, top: contactRectY, width: boxW, height: boxH, rx: 6, ry: 6,
        fill: 'transparent', stroke: inkColor, strokeWidth: 1, selectable: false
      });
      canvas.add(contactRect);

      const cLabel = new fabric.Text('SUPPORT & ASSISTANCE', {
        left: contactRectX + 20, top: contactRectY + 20, fontSize: 10, fontFamily: fontFamily, fontWeight: '800', fill: inkColor, selectable: false
      });
      canvas.add(cLabel);

      createText('If you need anything during your stay, fresh towels, or local recommendations, please text us via the app anytime.', 11, '400', 'left', contactRectX + 20, contactRectY + 45, inkColor, 'none', boxW - 40);

      return isPortrait ? boxH : (boxH * 2 + 20);
    };

    if (isPortrait) {
      const boxW = innerW * 0.47;
      const boxH = ch * 0.16;
      
      const consumedH = drawBoxes(marginL, y, boxW, boxH);
      y += consumedH + 35;

      drawLine(marginL, marginR, y, 1);
      y += 20;

      createText('HOUSE RULES & GUIDE', 12, '800', 'left', marginL, y, inkColor, EDIT_TYPES.RULES_TITLE);
      y += 30;

      const rObj = createText(rules, 12, '500', 'left', marginL, y, inkColor, EDIT_TYPES.RULES_TEXT, innerW);
      
      const footerY = ch * 0.92;
      drawLine(marginL, marginR, footerY - 20, 2);
      createText(emergency.toUpperCase(), 9, '700', 'center', cw/2, footerY, inkColor, EDIT_TYPES.EMERGENCY);

    } else {
      const leftColW = innerW * 0.45;
      const rightColW = innerW * 0.48;
      const boxH = ch * 0.22;
      const colGap = innerW - (leftColW + rightColW);
      
      drawBoxes(marginL, y, leftColW, boxH);

      const rightColX = marginL + leftColW + colGap;
      createText('HOUSE RULES & GUIDE', 14, '800', 'left', rightColX, y, inkColor, EDIT_TYPES.RULES_TITLE);
      
      createText(rules, 12, '500', 'left', rightColX, y + 40, inkColor, EDIT_TYPES.RULES_TEXT, rightColW);

      const footerY = ch * 0.90;
      drawLine(marginL, marginR, footerY - 20, 2);
      createText(emergency.toUpperCase(), 9, '700', 'center', cw/2, footerY, inkColor, EDIT_TYPES.EMERGENCY);
    }

    canvas.requestRenderAll();
    isRebuildingRef.current = false;
  }, [containerDims, orientation, headline, host, checkin, wifiSsid, wifiPass, rules, emergency, bgColor, inkColor, accentColor, fontFamily, isLocked]);

  useEffect(() => {
    if (!isCheckingToken && !tokenError) {
      drawLayout();
    }
  }, [drawLayout, isCheckingToken, tokenError]);

  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.setZoom(zoom);
    canvas.setWidth(containerDims.width * zoom);
    canvas.setHeight(containerDims.height * zoom);
    canvas.renderAll();
  }, [zoom, containerDims]);

  const handleSizeOrOrientationChange = (newSize: string, newOrient: 'portrait' | 'landscape') => {
    if (isLocked) return;
    setCanvasSize(newSize);
    setOrientation(newOrient);

    const { w, h } = parseAndOrientSize(newSize, newOrient);
    const dims = fitContain(w, h, BASE_MAX_W, BASE_MAX_H);
    setContainerDims(dims);

    if (bgRectRef.current) {
      bgRectRef.current.set({ width: dims.width, height: dims.height });
      bgRectRef.current.set('dirty', true);
    }
  };

  const handleAlign = (mode: string) => {
    if(isLocked) return;
    const canvas = fabricRef.current;
    if (!canvas) return;
    const activeObj = canvas.getActiveObject();
    if (!activeObj) return;

    const cw = containerDims.width;
    const ch = containerDims.height;
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
    if(isLocked) return;
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
    if(isLocked) return;
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
    if(isLocked) return;
    const canvas = fabricRef.current;
    if (!canvas) return;
    const activeObj = canvas.getActiveObject();
    if (!activeObj || activeObj.type !== 'group') return;
    
    (activeObj as fabric.Group).toActiveSelection();
    canvas.requestRenderAll();
    setSelectedType('multi');
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
          a.download = `airbnb-poster.png`;
          a.click();
        } else if (format === 'pdf') {
          const dataUrl = canvas.toDataURL({ format: 'png', multiplier });
          const pdf = new jsPDF({ orientation: w > h ? 'landscape' : 'portrait', unit: 'in', format: [w, h] });
          pdf.addImage(dataUrl, 'PNG', 0, 0, w, h);
          pdf.save(`airbnb-poster.pdf`);
        } else if (format === 'svg') {
          const svg = canvas.toSVG();
          const blob = new Blob([svg], { type: 'image/svg+xml' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `airbnb-poster.svg`;
          a.click();
          URL.revokeObjectURL(url);
        }

        const designStateJSON = {
          canvasSize, orientation, headline, host, checkin, wifiSsid,
          wifiPass, rules, emergency, bgColor, inkColor, accentColor, fontFamily
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

  const handleSupportClick = () => setShowSupportModal(true);

  const submitSupportTicket = async () => {
    if (!supportMessage.trim()) return;
    setSendingTicket(true);
    try {
      const { error } = await supabase.from('support_tickets').insert({ order_id: token, message: supportMessage.trim() });
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

  return (
    <div className={`soundwave-poster-page ${isLocked ? 'locked-mode' : ''}`}>
      <style>{`
        .soundwave-poster-page {
          --panel-bg: #0d0d0d; --panel-border: #1e1e1e; --spotify-text: #ffffff;
          --spotify-subtext: #8a8a8a; --accent: #1DB954; --input-bg: #161616; --input-border: #262626;
          display: flex; height: 100vh; width: 100%; background: #000; color: var(--spotify-text);
          font-family: 'DM Sans', sans-serif; overflow: hidden;
        }
        .soundwave-poster-page.locked-mode #panel, .soundwave-poster-page.locked-mode #props-panel { display: none; }
        .soundwave-poster-page.locked-mode #canvas-area { padding-top: 100px; }
        
        .soundwave-poster-page #panel { width: 300px; min-width: 300px; background: var(--panel-bg); border-right: 1px solid var(--panel-border); overflow-y: auto; display: flex; flex-direction: column; }
        .soundwave-poster-page #panel::-webkit-scrollbar { width: 3px; }
        .soundwave-poster-page #panel::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
        
        .soundwave-poster-page .panel-header { display: flex; align-items: center; justify-content: space-between; padding: 16px; border-bottom: 1px solid var(--panel-border); flex-shrink: 0; }
        .soundwave-poster-page .title-group { display: flex; align-items: center; gap: 8px; }
        .soundwave-poster-page .title-group h1 { font-size: 13px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; margin: 0; }
        .soundwave-poster-page .back-btn { background: none; border: 1px solid var(--panel-border); color: var(--spotify-subtext); font-size: 11px; padding: 6px 10px; border-radius: 6px; cursor: pointer; transition: all 0.15s; }
        .soundwave-poster-page .back-btn:hover { color: var(--spotify-text); border-color: #333; }

        .soundwave-poster-page .form-row { padding: 0 16px 12px; }
        .soundwave-poster-page .form-row label { display: block; font-size: 10px; color: var(--spotify-subtext); margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600; }
        .soundwave-poster-page .form-row input[type=text], .soundwave-poster-page .form-row select { width: 100%; background: var(--input-bg); border: 1px solid var(--input-border); border-radius: 6px; color: var(--spotify-text); padding: 8px 10px; font-size: 12px; font-family: inherit; outline: none; transition: border-color 0.15s; box-sizing: border-box; }
        .soundwave-poster-page .form-row input:focus, .soundwave-poster-page .form-row select:focus { border-color: var(--accent); }
        .soundwave-poster-page .color-row { display: flex; gap: 8px; align-items: center; padding: 0 16px 12px; }
        .soundwave-poster-page .color-row input[type=color] { width: 34px; height: 30px; border: none; border-radius: 6px; padding: 2px; background: var(--input-bg); cursor: pointer; flex-shrink: 0; }
        .soundwave-poster-page .color-row input[type=text] { flex: 1; background: var(--input-bg); border: 1px solid var(--input-border); border-radius: 6px; color: var(--spotify-text); padding: 6px 8px; font-size: 11px; }

        .soundwave-poster-page .btn { border: none; border-radius: 6px; padding: 9px 14px; font-size: 12px; font-weight: 600; cursor: pointer; transition: opacity 0.15s; }
        .soundwave-poster-page .btn:hover { opacity: 0.85; }
        .soundwave-poster-page .btn-primary { background: var(--accent); color: #000; }
        .soundwave-poster-page .btn-secondary { background: var(--input-bg); color: var(--spotify-text); border: 1px solid var(--input-border); flex: 1; }

        .soundwave-poster-page .canvas-header-actions { display: flex; gap: 8px; margin-bottom: 24px; z-index: 50; position: relative; }
        .soundwave-poster-page .btn-masterpiece { background: linear-gradient(to right, #4f46e5, #9333ea); color: white; padding: 12px 32px; font-size: 14px; border-radius: 30px; text-transform: uppercase; letter-spacing: 0.1em; box-shadow: 0 10px 25px rgba(79, 70, 229, 0.4); transition: transform 0.2s, box-shadow 0.2s; }
        .soundwave-poster-page .btn-masterpiece:hover { transform: translateY(-2px); box-shadow: 0 15px 30px rgba(79, 70, 229, 0.6); }

        .soundwave-poster-page #canvas-area { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; background: #0d0d0d; padding: 30px; overflow: auto; position: relative; }
        .soundwave-poster-page #canvas-area::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse at center, #1a1a1a 0%, #0d0d0d 70%); pointer-events: none; }
        .soundwave-poster-page #poster-wrapper { position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; gap: 20px; padding: 40px; }
        .soundwave-poster-page #poster-container { position: relative; overflow: hidden; box-shadow: 0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05); border-radius: 4px; transform-origin: center center; transition: transform 0.15s ease-out, width 0.4s cubic-bezier(0.4,0,0.2,1), height 0.4s cubic-bezier(0.4,0,0.2,1); }

        .soundwave-poster-page .accordion-btn { width: 100%; background: none; border: none; color: var(--spotify-subtext); font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; text-align: left; padding: 16px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--panel-border); font-family: 'DM Sans', sans-serif; transition: color 0.15s; }
        .soundwave-poster-page .accordion-btn:hover { color: var(--spotify-text); }
        .soundwave-poster-page .accordion-btn .arrow { font-size: 9px; transition: transform 0.2s; }
        .soundwave-poster-page .accordion-btn.open .arrow { transform: rotate(180deg); }
        .soundwave-poster-page .accordion-content { display: none; padding: 14px 0; border-bottom: 1px solid var(--panel-border); }
        .soundwave-poster-page .accordion-content.open { display: block; }
        .orient-group { display: flex; gap: 8px; margin-top: 8px; }

        /* --- RIGHT PANEL --- */
        .soundwave-poster-page #props-panel { width: 260px; min-width: 260px; background: var(--panel-bg); border-left: 1px solid var(--panel-border); overflow-y: auto; flex-shrink: 0; display: flex; flex-direction: column; }
        .soundwave-poster-page #props-panel::-webkit-scrollbar { width: 3px; }
        .soundwave-poster-page #props-panel::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
        .soundwave-poster-page #props-header { padding: 14px 16px 10px; border-bottom: 1px solid var(--panel-border); font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--spotify-subtext); display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; }
        .soundwave-poster-page #props-selected-name { color: var(--accent); font-size: 10px; font-weight: 600; letter-spacing: 0; text-transform: none; }
        .soundwave-poster-page #props-body { flex: 1; overflow-y: auto; padding: 12px 14px; }
        .soundwave-poster-page #props-body::-webkit-scrollbar { width: 3px; }
        .soundwave-poster-page #props-body::-webkit-scrollbar-thumb { background: #333; }
        .soundwave-poster-page #props-empty-state { padding: 32px 16px; text-align: center; color: #444; font-size: 11px; line-height: 1.7; }
        .soundwave-poster-page #props-empty-state svg { margin-bottom: 12px; }

        .soundwave-poster-page .global-tools-panel { padding: 14px 16px; border-bottom: 1px solid var(--panel-border); background: #0f0f0f; flex-shrink: 0; }
        .soundwave-poster-page .gt-section-title { font-size: 9px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--spotify-subtext); margin-bottom: 8px; }
        .soundwave-poster-page .gt-align-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; margin-bottom: 8px; }
        .soundwave-poster-page .gt-align-btn { height: 28px; display: flex; align-items: center; justify-content: center; background: var(--input-bg); border: 1px solid var(--input-border); color: var(--spotify-subtext); border-radius: 6px; cursor: pointer; transition: all 0.15s; }
        .soundwave-poster-page .gt-align-btn:hover { background: #1a1a1a; border-color: var(--accent); color: var(--spotify-text); }
        .soundwave-poster-page .gt-align-btn svg { width: 14px; height: 14px; }
        .soundwave-poster-page .gt-group-row { display: flex; gap: 6px; margin-bottom: 12px; }
        .soundwave-poster-page .gt-group-btn { flex: 1; height: 28px; font-size: 10px; font-weight: 700; background: var(--input-bg); border: 1px solid var(--input-border); color: var(--spotify-text); border-radius: 6px; cursor: pointer; transition: all 0.15s; }
        .soundwave-poster-page .gt-group-btn:hover { background: var(--accent); color: #000; border-color: var(--accent); }
        .soundwave-poster-page .gt-zoom-row { display: flex; align-items: center; gap: 8px; }
        .soundwave-poster-page .gt-zoom-row input[type=range] { flex: 1; accent-color: var(--accent); cursor: pointer; }
        .soundwave-poster-page .gt-zoom-val { font-size: 11px; font-weight: 600; color: var(--accent); min-width: 32px; text-align: right; }
        .soundwave-poster-page .gt-zoom-reset { background: #222; border: 1px solid #333; color: #fff; font-size: 9px; padding: 2px 6px; border-radius: 4px; cursor: pointer; }
        
        .review-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.95); backdrop-filter: blur(15px); display: flex; align-items: flex-start; justify-content: center; z-index: 9999; overflow-y: auto; padding: 40px 20px; }
        .review-modal-content { max-width: 900px; width: 100%; display: flex; flex-direction: column; align-items: center; gap: 30px; }
        .review-warning-box { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); padding: 16px 24px; border-radius: 12px; display: flex; gap: 16px; align-items: center; width: 100%; }
        .review-preview-img { width: auto; max-height: 75vh; object-fit: contain; box-shadow: 0 20px 60px rgba(0,0,0,0.8); border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; }
        .review-action-area { width: 100%; display: flex; flex-direction: column; align-items: center; gap: 24px; }
        .review-checkbox-wrapper { display: flex; align-items: center; gap: 12px; cursor: pointer; background: #1a1a1a; padding: 16px 24px; border-radius: 12px; border: 1px solid #333; transition: border-color 0.2s; width: 100%; justify-content: center; }
        .review-checkbox-wrapper input[type=checkbox] { width: 24px; height: 24px; accent-color: var(--accent); cursor: pointer; }
        .review-btn-grid { display: flex; gap: 12px; width: 100%; justify-content: center; flex-wrap: wrap; }
        .review-btn-grid button { padding: 16px 32px; border-radius: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; font-size: 14px; min-width: 240px; }
        
        .readonly-banner { position: fixed; top: 24px; left: 50%; transform: translateX(-50%); background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); color: #fca5a5; padding: 16px 24px; border-radius: 16px; display: flex; align-items: center; justify-content: space-between; max-width: 800px; width: 90%; box-shadow: 0 10px 30px rgba(0,0,0,0.8); z-index: 1000; backdrop-filter: blur(10px); }
        .air-toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%) translateY(20px); background: var(--accent); color: #000; padding: 10px 20px; border-radius: 24px; font-size: 13px; font-weight: 600; opacity: 0; transition: all 0.3s; z-index: 9999; pointer-events: none; }
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
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <h1>House Guide</h1>
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
              <button className={`btn ${orientation === 'portrait' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => handleSizeOrOrientationChange(canvasSize, 'portrait')}>Portrait</button>
              <button className={`btn ${orientation === 'landscape' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => handleSizeOrOrientationChange(canvasSize, 'landscape')}>Landscape</button>
            </div>
          </div>
        </div>

        <button className={`accordion-btn${openSections.textFields ? ' open' : ''}`} onClick={() => toggleAccordion('textFields')}>
          &#128294; Guide Information<span className="arrow">&#9660;</span>
        </button>
        <div className={`accordion-content${openSections.textFields ? ' open' : ''}`}>
          <div className="form-row">
            <label>Headline</label>
            <input type="text" value={headline} onChange={(e) => setHeadline(e.target.value)} />
          </div>
          <div className="form-row">
            <label>Host / Subheadline</label>
            <input type="text" value={host} onChange={(e) => setHost(e.target.value)} />
          </div>
          <div className="form-row">
            <label>Check-in / Extra Info</label>
            <input type="text" value={checkin} onChange={(e) => setCheckin(e.target.value)} />
          </div>
          <div className="form-row">
            <label>Wi-Fi Network Name</label>
            <input type="text" value={wifiSsid} onChange={(e) => setWifiSsid(e.target.value)} />
          </div>
          <div className="form-row">
            <label>Wi-Fi Password</label>
            <input type="text" value={wifiPass} onChange={(e) => setWifiPass(e.target.value)} />
          </div>
          <div className="form-row">
            <label>Rules List</label>
            <textarea value={rules} onChange={(e) => setRules(e.target.value)}
              style={{
                width: '100%', background: 'var(--input-bg)', border: '1px solid var(--input-border)',
                borderRadius: '6px', color: 'var(--spotify-text)', padding: '8px 10px', fontSize: '11px',
                fontFamily: 'inherit', minHeight: '90px', resize: 'vertical', outline: 'none'
              }}
            />
          </div>
          <div className="form-row">
            <label>Emergency / Footer Note</label>
            <input type="text" value={emergency} onChange={(e) => setEmergency(e.target.value)} />
          </div>
        </div>

        <button className={`accordion-btn${openSections.styling ? ' open' : ''}`} onClick={() => toggleAccordion('styling')}>
          &#127912; Styles & Colors<span className="arrow">&#9660;</span>
        </button>
        <div className={`accordion-content${openSections.styling ? ' open' : ''}`}>
          <div className="form-row">
            <label>Typography Font</label>
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
            <label>Main Text Ink Color</label>
            <div className="color-row">
              <input type="color" value={inkColor} onChange={(e) => setInkColor(e.target.value)} />
              <input type="text" value={inkColor} onChange={(e) => setInkColor(e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <label>Highlight / Accent Color</label>
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
          <div id="poster-container" style={{ width: containerDims.width * zoom, height: containerDims.height * zoom }}>
            <canvas ref={canvasElRef} />
          </div>
        </div>
      </div>

      <div id="props-panel" className={isLocked ? 'hidden' : ''}>
        <div id="props-header">
          Properties
          <span id="props-selected-name">
            {selectedType ? 'Selected Object' : 'Selection'}
          </span>
        </div>

        <div className="global-tools-panel">
          <div className="gt-section-title">ALIGNMENT</div>
          <div className="gt-align-grid">
            <button className="gt-align-btn" title="Align Left" onClick={() => handleAlign('left')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="3" x2="3" y2="21" strokeWidth="2.5" /><rect x="5" y="8" width="8" height="3" rx="1" /><rect x="5" y="13" width="13" height="3" rx="1" />
              </svg>
            </button>
            <button className="gt-align-btn" title="Center X" onClick={() => handleAlign('cx')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="3" x2="12" y2="21" strokeWidth="2.5" /><rect x="6" y="8" width="12" height="3" rx="1" /><rect x="4" y="13" width="16" height="3" rx="1" />
              </svg>
            </button>
            <button className="gt-align-btn" title="Align Right" onClick={() => handleAlign('right')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="21" y1="3" x2="21" y2="21" strokeWidth="2.5" /><rect x="11" y="8" width="8" height="3" rx="1" /><rect x="6" y="13" width="13" height="3" rx="1" />
              </svg>
            </button>
            <button className="gt-align-btn" title="Distribute H" onClick={() => edDistribute('h')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="3" x2="3" y2="21" /><line x1="21" y1="3" x2="21" y2="21" /><rect x="9" y="8" width="6" height="8" rx="1" />
              </svg>
            </button>
            <button className="gt-align-btn" title="Align Top" onClick={() => handleAlign('top')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="3" x2="21" y2="3" strokeWidth="2.5" /><rect x="8" y="5" width="3" height="8" rx="1" /><rect x="13" y="5" width="3" height="13" rx="1" />
              </svg>
            </button>
            <button className="gt-align-btn" title="Center Y" onClick={() => handleAlign('cy')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12" strokeWidth="2.5" /><rect x="8" y="4" width="3" height="16" rx="1" /><rect x="13" y="6" width="3" height="12" rx="1" />
              </svg>
            </button>
            <button className="gt-align-btn" title="Align Bottom" onClick={() => handleAlign('bottom')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="21" x2="21" y2="21" strokeWidth="2.5" /><rect x="8" y="11" width="3" height="8" rx="1" /><rect x="13" y="6" width="13" height="3" rx="1" />
              </svg>
            </button>
            <button className="gt-align-btn" title="Distribute V" onClick={() => edDistribute('v')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="3" x2="21" y2="3" /><line x1="3" y1="21" x2="21" y2="21" /><rect x="8" y="9" width="8" height="6" rx="1" />
              </svg>
            </button>
          </div>

          <div className="gt-section-title" style={{ marginTop: '10px' }}>GROUPING</div>
          <div className="gt-group-row">
            <button className="gt-group-btn" title="Group Selected" onClick={handleGroup}>Group</button>
            <button className="gt-group-btn" title="Ungroup" onClick={handleUngroup}>Ungroup</button>
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
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
              </svg>
              <p>Click an element on the canvas to move it or align it via the toolbar above.</p>
              <p style={{ marginTop: '8px', color: 'var(--accent)' }}>Use the left panel to change text contents globally.</p>
            </div>
          )}

          {(selectedType === 'group' || selectedType === 'multi') && (
            <div id="props-fields">
              <div className="pf-section">
                <div className="pf-section-title">Selection</div>
                <p style={{ fontSize: '11px', color: '#888' }}>
                  Use the alignment or grouping tools above. Text content editing for groups is disabled.
                </p>
              </div>
            </div>
          )}
          
          {selectedType && selectedType !== 'group' && selectedType !== 'multi' && (
             <div id="props-fields">
               <div className="pf-section">
                 <div className="pf-section-title">Element Selected</div>
                 <p style={{ fontSize: '11px', color: '#888' }}>
                   You can drag, resize, or delete this element directly on the canvas. 
                 </p>
               </div>
             </div>
          )}
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
                  Please review your guide carefully. Check WiFi credentials, spellings, and rules.
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
                  disabled={!userConfirmed} onClick={() => triggerDownloadAction('pdf')}
                >
                  Download PDF (Print)
                </button>
                <button 
                  className={`btn ${userConfirmed ? 'btn-secondary' : 'bg-zinc-900 text-zinc-600 border-zinc-800 cursor-not-allowed'}`}
                  disabled={!userConfirmed} onClick={() => triggerDownloadAction('png')}
                >
                  Download PNG
                </button>
                <button 
                  className={`btn ${userConfirmed ? 'btn-secondary' : 'bg-zinc-900 text-zinc-600 border-zinc-800 cursor-not-allowed'}`}
                  disabled={!userConfirmed} onClick={() => triggerDownloadAction('svg')}
                >
                  Download SVG
                </button>
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

      <div className="air-toast" style={{ position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%) translateY(20px)', background: 'var(--accent)', color: '#000', padding: '10px 20px', borderRadius: '24px', fontSize: '13px', fontWeight: 600, opacity: 0, transition: 'all 0.3s', zIndex: 9999, pointerEvents: 'none' }}>Done</div>
    </div>
  );
}
