import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as fabric from 'fabric';
import jsPDF from 'jspdf';
import { AlertTriangle, Lock, MessageCircle, X, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

const GOOGLE_FONTS = [
  "Inter", "Montserrat", "Roboto", "Open Sans", "Oswald", "Lato", "Poppins", 
  "Playfair Display", "Raleway", "Ubuntu", "Merriweather", "Nunito", "Cinzel", 
  "Dancing Script", "Pacifico", "Caveat", "Bebas Neue", "Anton", "Josefin Sans", 
  "Lobster", "Righteous", "Permanent Marker", "Abril Fatface", "Vampiro One", 
  "Alfa Slab One", "Syncopate", "Bangers", "Creepster", "Sacramento", "Satisfy",
  "Amatic SC", "Kalam", "Courgette", "Great Vibes", "Teko", "Russo One",
  "Prata", "Vollkorn", "Lora", "Crimson Text", "Zilla Slab", "Bungee", 
  "Fredoka One", "Carter One", "Patua One", "Chewy", "Shrikhand"
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

const PRESETS = [
  {
    id: 'elegant-welcome',
    label: 'Elegant Welcome Guide',
    desc: 'Classic script headline with structured, clean columns for a luxury cottage feel.',
    texts: {
      headline: 'Welcome!',
      subhead: 'TO THE COTTAGE',
      address: '123 WATERVIEW LANE, CITY, STATE 00123',
      sec1Title: 'WIFI ACCESS',
      sec1Text: 'NETWORK: waterviewcottage\nPASSWORD: password123',
      sec2Title: 'CONTACT INFO',
      sec2Text: 'HOST: Sarah & Mike\nPHONE: 555-555-5555\nEMAIL: hello@cottage.com',
      sec3Title: 'EMERGENCY INFO',
      sec3Text: 'HOSPITAL (2 MILES): 123 Main Street\nPOLICE (0.7 MILES): 456 Safety Rd\nURGENT CARE: 789 Health Ave',
      sec4Title: 'HOUSE RULES',
      sec4Text: '• NO SMOKING INSIDE\n• NO PARTIES\n• TRASH OUT THURSDAY\n• QUIET HOURS AFTER 10 PM\n• RESPECT THE NEIGHBORS',
      sec5Title: 'CHECK-OUT',
      sec5Text: '• CHECK OUT IS AT 10 AM\n• PLEASE LEAVE UNIT TIDY\n• PUT DISHES IN DISHWASHER\n• LEAVE TOWELS IN BATHROOM\n• TURN OFF LIGHTS & LOCK DOOR',
      footer: 'Enjoy Your Stay!'
    },
    styles: {
      bg: '#ffffff',
      ink: '#1c1917',
      divider: '#d6d3d1',
      headF: 'Dancing Script', headS: 54, headW: '400', headC: '#1c1917',
      subF: 'Montserrat', subS: 12, subW: '400', subC: '#44403c',
      bodyTitleF: 'Playfair Display', bodyTitleS: 14, bodyTitleW: '700', bodyTitleC: '#1c1917',
      bodyTextF: 'Lora', bodyTextS: 9, bodyTextW: '400', bodyTextC: '#44403c',
      footF: 'Dancing Script', footS: 32, footW: '400', footC: '#1c1917'
    }
  },
  {
    id: 'minimal-wifi',
    label: 'Minimalist WiFi Sign',
    desc: 'A bold, oversized WiFi network sign perfect for quick scanning.',
    texts: {
      headline: 'WIFI',
      subhead: 'IS ON IN THE HOUSE',
      address: '',
      sec1Title: 'NETWORK NAME',
      sec1Text: 'ourhome123',
      sec2Title: 'PASSWORD',
      sec2Text: 'airbnb1234',
      sec3Title: '',
      sec3Text: '',
      sec4Title: '',
      sec4Text: '',
      sec5Title: '',
      sec5Text: '',
      footer: 'Connect & Relax'
    },
    styles: {
      bg: '#fcfaf8',
      ink: '#000000',
      divider: 'transparent',
      headF: 'Montserrat', headS: 72, headW: '900', headC: '#000000',
      subF: 'Dancing Script', subS: 28, subW: '400', subC: '#000000',
      bodyTitleF: 'Montserrat', bodyTitleS: 12, bodyTitleW: '700', bodyTitleC: '#52525b',
      bodyTextF: 'Space Mono', bodyTextS: 18, bodyTextW: '700', bodyTextC: '#000000',
      footF: 'Montserrat', footS: 12, footW: '500', footC: '#a1a1aa'
    }
  },
  {
    id: 'local-guide',
    label: 'Local Recommendations',
    desc: 'Clean 2-column layout highlighting the best food, drinks, and activities.',
    texts: {
      headline: 'LOCAL',
      subhead: 'RECOMMENDATIONS',
      address: 'CURATED JUST FOR YOU',
      sec1Title: 'COFFEE & BREAKFAST',
      sec1Text: 'THE DAILY GRIND\n123 Brew St. (Amazing lattes)\n\nSUNNY SIDE DINER\n456 Egg Ave. (Best pancakes)',
      sec2Title: 'LUNCH & DINNER',
      sec2Text: 'OCEAN CATCH SEAFOOD\n789 Pier Rd. (Fresh oysters)\n\nLUIGI\'S PIZZA\n321 Slice Blvd. (Wood-fired)',
      sec3Title: '',
      sec3Text: '',
      sec4Title: 'TO DO / ACTIVITIES',
      sec4Text: 'HIKING TRAILS\nMount View Park (2 miles away)\n\nMUSEUM OF ART\nDowntown Cultural Center',
      sec5Title: 'NIGHTLIFE',
      sec5Text: 'THE VELVET LOUNGE\nCraft cocktails & live jazz\n\nSTARLIGHT BREWERY\nLocal craft beers on tap',
      footer: 'Live Like A Local'
    },
    styles: {
      bg: '#ffffff',
      ink: '#27272a',
      divider: '#e4e4e7',
      headF: 'Montserrat', headS: 36, headW: '600', headC: '#18181b',
      subF: 'Dancing Script', subS: 28, subW: '400', subC: '#18181b',
      bodyTitleF: 'Montserrat', bodyTitleS: 12, bodyTitleW: '700', bodyTitleC: '#27272a',
      bodyTextF: 'Inter', bodyTextS: 9, bodyTextW: '400', bodyTextC: '#52525b',
      footF: 'Montserrat', footS: 14, footW: '500', footC: '#a1a1aa'
    }
  },
  {
    id: 'pet-rules',
    label: 'House & Pet Rules',
    desc: 'Playful yet clear house rules focusing on pet etiquette.',
    texts: {
      headline: 'HOUSE RULES',
      subhead: 'FOR HUMANS & PAWS',
      address: 'PLEASE READ CAREFULLY',
      sec1Title: 'PET ETIQUETTE',
      sec1Text: '• DOGS ARE WELCOME BUT MUST BE TRAINED\n• PLEASE KEEP PETS OFF THE WHITE SOFAS\n• CLEAN UP AFTER YOUR DOG IN THE YARD\n• USE PROVIDED PAW TOWELS AT ENTRY',
      sec2Title: 'HUMAN ETIQUETTE',
      sec2Text: '• NO SHOES INSIDE THE HOUSE\n• PLEASE WASH YOUR DISHES\n• TURN OFF AC WHEN LEAVING\n• LOCK THE DEADBOLT AT NIGHT',
      sec3Title: 'WASTE MANAGEMENT',
      sec3Text: 'TRASH: BLUE BIN\nRECYCLING: GREEN BIN\nGLASS: YELLOW BIN',
      sec4Title: '',
      sec4Text: '',
      sec5Title: '',
      sec5Text: '',
      footer: 'Thank You!'
    },
    styles: {
      bg: '#fafaf9',
      ink: '#44403c',
      divider: '#d6d3d1',
      headF: 'Playfair Display', headS: 42, headW: '700', headC: '#292524',
      subF: 'Montserrat', subS: 12, subW: '600', subC: '#78716c',
      bodyTitleF: 'Montserrat', bodyTitleS: 13, bodyTitleW: '700', bodyTitleC: '#292524',
      bodyTextF: 'Inter', bodyTextS: 10, bodyTextW: '500', bodyTextC: '#57534e',
      footF: 'Dancing Script', footS: 36, footW: '400', footC: '#292524'
    }
  }
];

const DPI = 300;
const BASE_MAX_W = 600;
const BASE_MAX_H = 850;

const EDIT_TYPES = {
  HEADLINE: 'ab-headline',
  SUBHEAD: 'ab-subhead',
  ADDRESS: 'ab-address',
  S1_TITLE: 'ab-s1-title', S1_TEXT: 'ab-s1-text',
  S2_TITLE: 'ab-s2-title', S2_TEXT: 'ab-s2-text',
  S3_TITLE: 'ab-s3-title', S3_TEXT: 'ab-s3-text',
  S4_TITLE: 'ab-s4-title', S4_TEXT: 'ab-s4-text',
  S5_TITLE: 'ab-s5-title', S5_TEXT: 'ab-s5-text',
  FOOTER: 'ab-footer',
  QR_CODE: 'ab-qrcode'
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

interface FontStyleSelectorProps {
  weight: string;
  style: string;
  onChange: (w: string, s: string) => void;
}

const FontStyleSelector: React.FC<FontStyleSelectorProps> = ({ weight, style, onChange }) => (
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

export default function AirbnbPosterPage({ navigate }: { navigate: (path: string) => void }) {
  const canvasElRef = useRef<HTMLCanvasElement | null>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const bgRectRef = useRef<fabric.Rect | null>(null);
  const qrCodeRef = useRef<fabric.Image | null>(null);

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
    presets: true, size: false, header: false, sections: false,
    styling: false, qrcode: false
  });

  const [activePreset, setActivePreset] = useState<string>('elegant-welcome');

  const [canvasSize, setCanvasSize] = useState<string>('8.27x11.69');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [containerDims, setContainerDims] = useState(() => {
    const { w, h } = parseAndOrientSize('8.27x11.69', 'portrait');
    return fitContain(w, h, BASE_MAX_W, BASE_MAX_H);
  });
  const [zoom, setZoom] = useState<number>(1);

  const [bgColor, setBgColor] = useState('#ffffff');
  const [dividerColor, setDividerColor] = useState('#d6d3d1');
  
  const [headline, setHeadline] = useState('Welcome!');
  const [subhead, setSubhead] = useState('TO THE COTTAGE');
  const [address, setAddress] = useState('123 WATERVIEW LANE, CITY, STATE 00123');
  const [footer, setFooter] = useState('Enjoy Your Stay!');

  const [sec1Title, setSec1Title] = useState('WIFI ACCESS');
  const [sec1Text, setSec1Text] = useState('NETWORK: waterviewcottage\nPASSWORD: password123');
  const [sec2Title, setSec2Title] = useState('CONTACT INFO');
  const [sec2Text, setSec2Text] = useState('HOST: Sarah & Mike\nPHONE: 555-555-5555\nEMAIL: hello@cottage.com');
  const [sec3Title, setSec3Title] = useState('EMERGENCY INFO');
  const [sec3Text, setSec3Text] = useState('HOSPITAL (2 MILES): 123 Main Street\nPOLICE (0.7 MILES): 456 Safety Rd\nURGENT CARE: 789 Health Ave');
  const [sec4Title, setSec4Title] = useState('HOUSE RULES');
  const [sec4Text, setSec4Text] = useState('• NO SMOKING INSIDE\n• NO PARTIES\n• TRASH OUT THURSDAY\n• QUIET HOURS AFTER 10 PM\n• RESPECT THE NEIGHBORS');
  const [sec5Title, setSec5Title] = useState('CHECK-OUT');
  const [sec5Text, setSec5Text] = useState('• CHECK OUT IS AT 10 AM\n• PLEASE LEAVE UNIT TIDY\n• PUT DISHES IN DISHWASHER\n• LEAVE TOWELS IN BATHROOM\n• TURN OFF LIGHTS & LOCK DOOR');

  const [headF, setHeadF] = useState('Dancing Script'); const [headS, setHeadS] = useState(54); const [headW, setHeadW] = useState('400'); const [headC, setHeadC] = useState('#1c1917');
  const [subF, setSubF] = useState('Montserrat'); const [subS, setSubS] = useState(12); const [subW, setSubW] = useState('400'); const [subC, setSubC] = useState('#44403c');
  const [bodyTitleF, setBodyTitleF] = useState('Playfair Display'); const [bodyTitleS, setBodyTitleS] = useState(14); const [bodyTitleW, setBodyTitleW] = useState('700'); const [bodyTitleC, setBodyTitleC] = useState('#1c1917');
  const [bodyTextF, setBodyTextF] = useState('Lora'); const [bodyTextS, setBodyTextS] = useState(9); const [bodyTextW, setBodyTextW] = useState('400'); const [bodyTextC, setBodyTextC] = useState('#44403c');
  const [footF, setFootF] = useState('Dancing Script'); const [footS, setFootS] = useState(32); const [footW, setFootW] = useState('400'); const [footC, setFootC] = useState('#1c1917');

  const [showQR, setShowQR] = useState(false);
  const [qrLink, setQrLink] = useState('https://wifi.login');
  const [qrSize, setQrSize] = useState(60);

  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [toast, setToast] = useState<string>('');

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2200);
  }, []);

  const toggleAccordion = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const applyPreset = (presetId: string) => {
    setActivePreset(presetId);
    if (presetId === 'custom') return;

    const p = PRESETS.find(x => x.id === presetId);
    if (!p) return;

    setHeadline(p.texts.headline);
    setSubhead(p.texts.subhead);
    setAddress(p.texts.address);
    setSec1Title(p.texts.sec1Title); setSec1Text(p.texts.sec1Text);
    setSec2Title(p.texts.sec2Title); setSec2Text(p.texts.sec2Text);
    setSec3Title(p.texts.sec3Title); setSec3Text(p.texts.sec3Text);
    setSec4Title(p.texts.sec4Title); setSec4Text(p.texts.sec4Text);
    setSec5Title(p.texts.sec5Title); setSec5Text(p.texts.sec5Text);
    setFooter(p.texts.footer);

    setBgColor(p.styles.bg);
    setDividerColor(p.styles.divider);

    setHeadF(p.styles.headF); setHeadS(p.styles.headS); setHeadW(p.styles.headW); setHeadC(p.styles.headC);
    setSubF(p.styles.subF); setSubS(p.styles.subS); setSubW(p.styles.subW); setSubC(p.styles.subC);
    setBodyTitleF(p.styles.bodyTitleF); setBodyTitleS(p.styles.bodyTitleS); setBodyTitleW(p.styles.bodyTitleW); setBodyTitleC(p.styles.bodyTitleC);
    setBodyTextF(p.styles.bodyTextF); setBodyTextS(p.styles.bodyTextS); setBodyTextW(p.styles.bodyTextW); setBodyTextC(p.styles.bodyTextC);
    setFootF(p.styles.footF); setFootS(p.styles.footS); setFootW(p.styles.footW); setFootC(p.styles.footC);

    showToast('Template applied successfully');
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
          
          setHeadline(ds.headline || ''); setSubhead(ds.subhead || ''); setAddress(ds.address || '');
          setSec1Title(ds.sec1Title || ''); setSec1Text(ds.sec1Text || '');
          setSec2Title(ds.sec2Title || ''); setSec2Text(ds.sec2Text || '');
          setSec3Title(ds.sec3Title || ''); setSec3Text(ds.sec3Text || '');
          setSec4Title(ds.sec4Title || ''); setSec4Text(ds.sec4Text || '');
          setSec5Title(ds.sec5Title || ''); setSec5Text(ds.sec5Text || '');
          setFooter(ds.footer || '');

          setBgColor(ds.bgColor || '#ffffff'); setDividerColor(ds.dividerColor || '#d6d3d1');
          
          setHeadF(ds.headF || 'Dancing Script'); setHeadS(ds.headS || 54); setHeadW(ds.headW || '400'); setHeadC(ds.headC || '#1c1917');
          setSubF(ds.subF || 'Montserrat'); setSubS(ds.subS || 12); setSubW(ds.subW || '400'); setSubC(ds.subC || '#44403c');
          setBodyTitleF(ds.bodyTitleF || 'Playfair Display'); setBodyTitleS(ds.bodyTitleS || 14); setBodyTitleW(ds.bodyTitleW || '700'); setBodyTitleC(ds.bodyTitleC || '#1c1917');
          setBodyTextF(ds.bodyTextF || 'Lora'); setBodyTextS(ds.bodyTextS || 9); setBodyTextW(ds.bodyTextW || '400'); setBodyTextC(ds.bodyTextC || '#44403c');
          setFootF(ds.footF || 'Dancing Script'); setFootS(ds.footS || 32); setFootW(ds.footW || '400'); setFootC(ds.footC || '#1c1917');

          setShowQR(ds.showQR || false); setQrLink(ds.qrLink || ''); setQrSize(ds.qrSize || 60);
        }
      } catch (err) {
        if (!isAdmin) setTokenError('Connection error. Please reload.');
      } finally {
        setIsCheckingToken(false);
      }
    };
    
    checkToken();
  }, [token]);

  const drawLayout = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    isRebuildingRef.current = true;
    const cw = containerDims.width;
    const ch = containerDims.height;
    
    const existingObjs = canvas.getObjects().filter(o => o !== bgRectRef.current);
    existingObjs.forEach(o => canvas.remove(o));

    const marginX = cw * 0.12;
    const usableW = cw - (marginX * 2);
    let y = ch * 0.08;

    const drawDashedLine = (yPos: number) => {
      if (dividerColor === 'transparent') return;
      const line = new fabric.Line([marginX, yPos, cw - marginX, yPos], {
        stroke: dividerColor, strokeWidth: 1, strokeDashArray: [4, 4], selectable: false, evented: false
      });
      canvas.add(line);
    };

    if (headline.trim()) {
      const headObj = new fabric.Textbox(headline, {
        left: cw / 2, top: y, width: usableW, originX: 'center', textAlign: 'center',
        fontSize: headS, fontFamily: headF, fontWeight: headW, fill: headC,
        data: { edType: EDIT_TYPES.HEADLINE }, selectable: !isLocked
      });
      canvas.add(headObj);
      y += headObj.getBoundingRect().height + (subhead ? 5 : 20);
    }

    if (subhead.trim()) {
      const subObj = new fabric.Textbox(subhead, {
        left: cw / 2, top: y, width: usableW, originX: 'center', textAlign: 'center',
        fontSize: subS, fontFamily: subF, fontWeight: subW, fill: subC, charSpacing: 100,
        data: { edType: EDIT_TYPES.SUBHEAD }, selectable: !isLocked
      });
      canvas.add(subObj);
      y += subObj.getBoundingRect().height + 8;
    }

    if (address.trim()) {
      const addObj = new fabric.Textbox(address, {
        left: cw / 2, top: y, width: usableW, originX: 'center', textAlign: 'center',
        fontSize: subS * 0.8, fontFamily: subF, fontWeight: '400', fill: subC, charSpacing: 50,
        data: { edType: EDIT_TYPES.ADDRESS }, selectable: !isLocked
      });
      canvas.add(addObj);
      y += addObj.getBoundingRect().height + 15;
    }

    drawDashedLine(y);
    y += 20;

    const colGap = 20;
    const colW = (usableW - colGap) / 2;

    let col1Height = 0;
    let col2Height = 0;

    const createSection = (title: string, text: string, colX: number, startY: number, edTitle: string, edText: string) => {
      let currentY = startY;
      if (title.trim()) {
        const tObj = new fabric.Textbox(title, {
          left: colX, top: currentY, width: colW, fontSize: bodyTitleS, fontFamily: bodyTitleF,
          fontWeight: bodyTitleW, fill: bodyTitleC, data: { edType: edTitle }, selectable: !isLocked
        });
        canvas.add(tObj);
        currentY += tObj.getBoundingRect().height + 8;
      }
      if (text.trim()) {
        const pObj = new fabric.Textbox(text, {
          left: colX, top: currentY, width: colW, fontSize: bodyTextS, fontFamily: bodyTextF,
          fontWeight: bodyTextW, fill: bodyTextC, lineHeight: 1.6, data: { edType: edText }, selectable: !isLocked
        });
        canvas.add(pObj);
        currentY += pObj.getBoundingRect().height;
      }
      return currentY - startY;
    };

    if (orientation === 'portrait') {
      col1Height = createSection(sec1Title, sec1Text, marginX, y, EDIT_TYPES.S1_TITLE, EDIT_TYPES.S1_TEXT);
      col2Height = createSection(sec2Title, sec2Text, marginX + colW + colGap, y, EDIT_TYPES.S2_TITLE, EDIT_TYPES.S2_TEXT);
      y += Math.max(col1Height, col2Height) + 20;

      if (sec3Title.trim() || sec3Text.trim()) {
        drawDashedLine(y);
        y += 20;
        const sec3H = createSection(sec3Title, sec3Text, marginX, y, EDIT_TYPES.S3_TITLE, EDIT_TYPES.S3_TEXT);
        y += sec3H + 20;
      }

      if (sec4Title.trim() || sec4Text.trim() || sec5Title.trim() || sec5Text.trim()) {
        drawDashedLine(y);
        y += 20;
        const col4Height = createSection(sec4Title, sec4Text, marginX, y, EDIT_TYPES.S4_TITLE, EDIT_TYPES.S4_TEXT);
        const col5Height = createSection(sec5Title, sec5Text, marginX + colW + colGap, y, EDIT_TYPES.S5_TITLE, EDIT_TYPES.S5_TEXT);
        y += Math.max(col4Height, col5Height) + 30;
      }
    } else {
      const col3W = (usableW - colGap * 2) / 3;
      const createLandscapeSec = (title: string, text: string, colX: number, startY: number, edTitle: string, edText: string) => {
        let currentY = startY;
        if (title.trim()) {
          const tObj = new fabric.Textbox(title, {
            left: colX, top: currentY, width: col3W, fontSize: bodyTitleS, fontFamily: bodyTitleF,
            fontWeight: bodyTitleW, fill: bodyTitleC, data: { edType: edTitle }, selectable: !isLocked
          });
          canvas.add(tObj);
          currentY += tObj.getBoundingRect().height + 8;
        }
        if (text.trim()) {
          const pObj = new fabric.Textbox(text, {
            left: colX, top: currentY, width: col3W, fontSize: bodyTextS, fontFamily: bodyTextF,
            fontWeight: bodyTextW, fill: bodyTextC, lineHeight: 1.6, data: { edType: edText }, selectable: !isLocked
          });
          canvas.add(pObj);
          currentY += pObj.getBoundingRect().height;
        }
        return currentY - startY;
      };

      let leftY = y;
      let midY = y;
      let rightY = y;

      const c1 = marginX;
      const c2 = marginX + col3W + colGap;
      const c3 = marginX + (col3W * 2) + (colGap * 2);

      leftY += createLandscapeSec(sec1Title, sec1Text, c1, leftY, EDIT_TYPES.S1_TITLE, EDIT_TYPES.S1_TEXT) + 20;
      leftY += createLandscapeSec(sec2Title, sec2Text, c1, leftY, EDIT_TYPES.S2_TITLE, EDIT_TYPES.S2_TEXT) + 20;

      midY += createLandscapeSec(sec4Title, sec4Text, c2, midY, EDIT_TYPES.S4_TITLE, EDIT_TYPES.S4_TEXT) + 20;

      rightY += createLandscapeSec(sec5Title, sec5Text, c3, rightY, EDIT_TYPES.S5_TITLE, EDIT_TYPES.S5_TEXT) + 20;
      rightY += createLandscapeSec(sec3Title, sec3Text, c3, rightY, EDIT_TYPES.S3_TITLE, EDIT_TYPES.S3_TEXT) + 20;

      y = Math.max(leftY, midY, rightY) + 20;
    }

    if (showQR && qrLink.trim()) {
      const qrColor = bodyTitleC.replace('#', '');
      const bgHex = bgColor.replace('#', '');
      const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrLink)}&color=${qrColor}&bgcolor=${bgHex}`;
      fabric.Image.fromURL(apiUrl, { crossOrigin: 'anonymous' }).then((img) => {
        img.set({
          left: cw / 2, top: y + (qrSize / 2),
          originX: 'center', originY: 'center',
          scaleX: qrSize / img.width!, scaleY: qrSize / img.height!,
          selectable: !isLocked, data: { edType: EDIT_TYPES.QR_CODE }
        });
        canvas.add(img);
        qrCodeRef.current = img;
        canvas.requestRenderAll();
      }).catch(() => {});
      y += qrSize + 20;
    }

    drawDashedLine(y);
    y += 20;

    if (footer.trim()) {
      const footObj = new fabric.Textbox(footer, {
        left: cw / 2, top: y, width: usableW, originX: 'center', textAlign: 'center',
        fontSize: footS, fontFamily: footF, fontWeight: footW, fill: footC,
        data: { edType: EDIT_TYPES.FOOTER }, selectable: !isLocked
      });
      canvas.add(footObj);
    }

    canvas.requestRenderAll();
    isRebuildingRef.current = false;
  }, [
    containerDims, orientation, headline, subhead, address, footer,
    sec1Title, sec1Text, sec2Title, sec2Text, sec3Title, sec3Text, sec4Title, sec4Text, sec5Title, sec5Text,
    bgColor, dividerColor, headF, headS, headW, headC, subF, subS, subW, subC,
    bodyTitleF, bodyTitleS, bodyTitleW, bodyTitleC, bodyTextF, bodyTextS, bodyTextW, bodyTextC,
    footF, footS, footW, footC, showQR, qrLink, qrSize, isLocked
  ]);

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
          case EDIT_TYPES.SUBHEAD: setSubhead(v); break;
          case EDIT_TYPES.ADDRESS: setAddress(v); break;
          case EDIT_TYPES.S1_TITLE: setSec1Title(v); break; case EDIT_TYPES.S1_TEXT: setSec1Text(v); break;
          case EDIT_TYPES.S2_TITLE: setSec2Title(v); break; case EDIT_TYPES.S2_TEXT: setSec2Text(v); break;
          case EDIT_TYPES.S3_TITLE: setSec3Title(v); break; case EDIT_TYPES.S3_TEXT: setSec3Text(v); break;
          case EDIT_TYPES.S4_TITLE: setSec4Title(v); break; case EDIT_TYPES.S4_TEXT: setSec4Text(v); break;
          case EDIT_TYPES.S5_TITLE: setSec5Title(v); break; case EDIT_TYPES.S5_TEXT: setSec5Text(v); break;
          case EDIT_TYPES.FOOTER: setFooter(v); break;
          default: break;
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
  }, [isCheckingToken, tokenError, isLocked, containerDims]);

  useEffect(() => {
    if (!isCheckingToken && !tokenError && fabricRef.current) {
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

  const handleSizeOrOrientationChange = (newSize: string, newOrient: 'portrait' | 'landscape') => {
    if(isLocked) return;
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
          a.download = `welcome-guide.png`;
          a.click();
        } else if (format === 'pdf') {
          const dataUrl = canvas.toDataURL({ format: 'png', multiplier });
          const pdf = new jsPDF({ orientation: w > h ? 'landscape' : 'portrait', unit: 'in', format: [w, h] });
          pdf.addImage(dataUrl, 'PNG', 0, 0, w, h);
          pdf.save(`welcome-guide.pdf`);
        } else if (format === 'svg') {
          const svg = canvas.toSVG();
          const blob = new Blob([svg], { type: 'image/svg+xml' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `welcome-guide.svg`;
          a.click();
          URL.revokeObjectURL(url);
        }

        const designStateJSON = {
          canvasSize, orientation, bgColor, dividerColor,
          headline, subhead, address, footer,
          sec1Title, sec1Text, sec2Title, sec2Text, sec3Title, sec3Text, sec4Title, sec4Text, sec5Title, sec5Text,
          headF, headS, headW, headC, subF, subS, subW, subC,
          bodyTitleF, bodyTitleS, bodyTitleW, bodyTitleC, bodyTextF, bodyTextS, bodyTextW, bodyTextC,
          footF, footS, footW, footC,
          showQR, qrLink, qrSize
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
        .insert({ order_id: token, message: supportMessage.trim() });
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
          <button className="w-full btn btn-primary py-3 flex items-center justify-center gap-2">
            Contact Etsy Support
          </button>
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
        .soundwave-poster-page.locked-mode #props-panel { display: none; }
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
        .soundwave-poster-page .form-row input[type=text],
        .soundwave-poster-page .form-row select,
        .soundwave-poster-page .form-row textarea { width: 100%; background: var(--input-bg); border: 1px solid var(--input-border); border-radius: 6px; color: var(--spotify-text); padding: 8px 10px; font-size: 12px; font-family: inherit; outline: none; transition: border-color 0.15s; box-sizing: border-box; }
        .soundwave-poster-page .form-row input[type=text]:focus,
        .soundwave-poster-page .form-row select:focus,
        .soundwave-poster-page .form-row textarea:focus { border-color: var(--accent); }
        .soundwave-poster-page .form-row select option { background: #1a1a1a; }
        .soundwave-poster-page .color-row { display: flex; gap: 8px; align-items: center; padding: 0 16px 12px; }
        .soundwave-poster-page .color-row input[type=color] { width: 34px; height: 30px; border: none; border-radius: 6px; padding: 2px; background: var(--input-bg); cursor: pointer; flex-shrink: 0; }
        .soundwave-poster-page .color-row input[type=text] { flex: 1; background: var(--input-bg); border: 1px solid var(--input-border); border-radius: 6px; color: var(--spotify-text); padding: 6px 8px; font-size: 11px; font-family: inherit; }
        .soundwave-poster-page .range-row { display: flex; align-items: center; gap: 8px; padding: 0 16px 12px; }
        .soundwave-poster-page .range-row input[type=range] { flex: 1; accent-color: var(--accent); cursor: pointer; }
        .soundwave-poster-page .range-val { font-size: 10px; color: var(--accent); font-weight: 600; min-width: 34px; text-align: right; }
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
        .soundwave-poster-page .pf-section { margin-bottom: 4px; }
        .soundwave-poster-page .pf-section-title { font-size: 9px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #555; margin: 12px 0 6px; }
        .soundwave-poster-page .pf-row { margin-bottom: 7px; }
        .soundwave-poster-page .pf-row label { display: block; font-size: 10px; color: var(--spotify-subtext); margin-bottom: 3px; }
        .soundwave-poster-page .pf-row input[type=text],
        .soundwave-poster-page .pf-row input[type=number],
        .soundwave-poster-page .pf-row select { width: 100%; background: var(--input-bg); border: 1px solid var(--input-border); border-radius: 5px; color: var(--spotify-text); padding: 5px 8px; font-size: 11px; outline: none; transition: border-color 0.15s; }
        .soundwave-poster-page .pf-row input:focus, .soundwave-poster-page .pf-row select:focus { border-color: var(--accent); }
        .soundwave-poster-page .pf-row select option { background: #1a1a1a; }
        .soundwave-poster-page .pf-row input[type=range] { width: 100%; accent-color: var(--accent); cursor: pointer; }
        .soundwave-poster-page .pf-row input[type=color] { width: 30px; height: 26px; border: none; border-radius: 4px; cursor: pointer; padding: 2px; background: var(--input-bg); }
        .soundwave-poster-page .pf-color-row { display: flex; gap: 6px; align-items: center; }
        .soundwave-poster-page .pf-color-row input[type=text] { flex: 1; }
        .soundwave-poster-page .pf-range-row { display: flex; align-items: center; gap: 6px; }
        .soundwave-poster-page .pf-range-val { font-size: 10px; color: var(--accent); font-weight: 600; min-width: 32px; text-align: right; }
        .soundwave-poster-page .global-tools-panel { padding: 14px 16px; border-bottom: 1px solid var(--panel-border); background: #0f0f0f; flex-shrink: 0; }
        .soundwave-poster-page .gt-section-title { font-size: 9px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--spotify-subtext); margin-bottom: 8px; }
        .soundwave-poster-page .gt-align-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; margin-bottom: 8px; }
        .soundwave-poster-page .gt-align-btn { height: 28px; display: flex; align-items: center; justify-content: center; background: var(--input-bg); border: 1px solid var(--input-border); color: var(--spotify-subtext); border-radius: 6px; cursor: pointer; transition: all 0.15s; }
        .soundwave-poster-page .gt-align-btn:hover { background: #1a1a1a; border-color: var(--accent); color: var(--spotify-text); }
        .soundwave-poster-page .gt-align-btn svg { width: 14px; height: 14px; }
        .soundwave-poster-page .gt-group-row { display: flex; gap: 6px; margin-bottom: 12px; }
        .soundwave-poster-page .gt-group-btn { flex: 1; height: 28px; font-size: 10px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; background: var(--input-bg); border: 1px solid var(--input-border); color: var(--spotify-text); border-radius: 6px; cursor: pointer; transition: all 0.15s; }
        .soundwave-poster-page .gt-group-btn:hover { background: var(--accent); color: #000; border-color: var(--accent); }
        .soundwave-poster-page .gt-zoom-row { display: flex; align-items: center; gap: 8px; }
        .soundwave-poster-page .gt-zoom-row input[type=range] { flex: 1; accent-color: var(--accent); cursor: pointer; }
        .soundwave-poster-page .gt-zoom-val { font-size: 11px; font-weight: 600; color: var(--accent); min-width: 32px; text-align: right; }
        .soundwave-poster-page .gt-zoom-reset { background: #222; border: 1px solid #333; color: #fff; font-size: 9px; padding: 2px 6px; border-radius: 4px; cursor: pointer; }
        .soundwave-poster-page .gt-zoom-reset:hover { background: #333; }
        .orient-group { display: flex; gap: 8px; margin-top: 8px; }
        .pf-checkbox-row { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; cursor: pointer; }
        .pf-checkbox-row input[type=checkbox] { width: 16px; height: 16px; cursor: pointer; accent-color: var(--accent); }
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
                  Please review your design carefully. Check all spellings, dates, and color choices.
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
                <button className={`btn ${userConfirmed ? 'btn-primary' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border-none'}`} disabled={!userConfirmed} onClick={() => triggerDownloadAction('pdf')}>
                  Download PDF (Print)
                </button>
                <button className={`btn ${userConfirmed ? 'btn-secondary' : 'bg-zinc-900 text-zinc-600 border-zinc-800 cursor-not-allowed'}`} disabled={!userConfirmed} onClick={() => triggerDownloadAction('png')}>
                  Download PNG
                </button>
                <button className={`btn ${userConfirmed ? 'btn-secondary' : 'bg-zinc-900 text-zinc-600 border-zinc-800 cursor-not-allowed'}`} disabled={!userConfirmed} onClick={() => triggerDownloadAction('svg')}>
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
                  <p className="text-zinc-400 text-xs leading-relaxed mb-6">
                    Your message has been sent successfully. We will respond to your request within 24 hours.
                  </p>
                  <button onClick={() => { setShowSupportModal(false); setTicketSubmitted(false); setSupportMessage(''); }} className="btn btn-primary w-full">
                    Close Window
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-black uppercase text-white mb-4 tracking-tight">Open Support Ticket</h2>
                  <p className="text-zinc-400 text-xs mb-6 leading-relaxed">
                    Need to make changes to your locked design? Describe your request below, and our team will update it for you.
                  </p>
                  <div className="form-row" style={{ padding: 0, marginBottom: '20px' }}>
                    <label>Your Message</label>
                    <textarea value={supportMessage} onChange={(e) => setSupportMessage(e.target.value)} placeholder="Describe the changes you want (e.g., date correction)..." style={{ width: '100%', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '8px', color: 'var(--spotify-text)', padding: '12px', fontSize: '12px', fontFamily: 'inherit', minHeight: '120px', resize: 'vertical', outline: 'none' }} />
                  </div>
                  <div className="flex gap-3">
                    <button disabled={sendingTicket || !supportMessage.trim()} onClick={submitSupportTicket} className={`btn ${sendingTicket || !supportMessage.trim() ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'btn-primary'}`} style={{ flex: 1, padding: '12px 0' }}>
                      {sendingTicket ? 'Sending...' : 'Send Message'}
                    </button>
                    <button disabled={sendingTicket} onClick={() => { setShowSupportModal(false); setSupportMessage(''); }} className="btn btn-secondary" style={{ flex: 1, padding: '12px 0' }}>
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
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <h1>Airbnb Guide</h1>
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
              <option value="custom">Custom Design...</option>
              {PRESETS.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
            {activePreset !== 'custom' && (
              <p style={{ fontSize: '10px', color: 'var(--spotify-subtext)', marginTop: '8px', lineHeight: '1.4' }}>
                {PRESETS.find(p => p.id === activePreset)?.desc}
              </p>
            )}
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

        <button className={`accordion-btn${openSections.header ? ' open' : ''}`} onClick={() => toggleAccordion('header')}>
          &#128294; Headers & Titles<span className="arrow">&#9660;</span>
        </button>
        <div className={`accordion-content${openSections.header ? ' open' : ''}`}>
          <div className="form-row">
            <label>Headline</label>
            <input type="text" value={headline} onChange={(e) => setHeadline(e.target.value)} />
          </div>
          <div className="form-row">
            <label>Subheadline</label>
            <input type="text" value={subhead} onChange={(e) => setSubhead(e.target.value)} />
          </div>
          <div className="form-row">
            <label>Address / Contact / Tagline</label>
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <div className="form-row">
            <label>Footer Text</label>
            <input type="text" value={footer} onChange={(e) => setFooter(e.target.value)} />
          </div>
        </div>

        <button className={`accordion-btn${openSections.sections ? ' open' : ''}`} onClick={() => toggleAccordion('sections')}>
          &#128221; Columns & Sections<span className="arrow">&#9660;</span>
        </button>
        <div className={`accordion-content${openSections.sections ? ' open' : ''}`}>
          {[
            { t: sec1Title, setT: setSec1Title, b: sec1Text, setB: setSec1Text, label: '1' },
            { t: sec2Title, setT: setSec2Title, b: sec2Text, setB: setSec2Text, label: '2' },
            { t: sec3Title, setT: setSec3Title, b: sec3Text, setB: setSec3Text, label: '3' },
            { t: sec4Title, setT: setSec4Title, b: sec4Text, setB: setSec4Text, label: '4' },
            { t: sec5Title, setT: setSec5Title, b: sec5Text, setB: setSec5Text, label: '5' }
          ].map((sec) => (
            <div key={`sec-${sec.label}`} style={{ marginBottom: '16px', borderLeft: '2px solid var(--panel-border)', paddingLeft: '10px' }}>
              <div className="form-row">
                <label>Section {sec.label} Title</label>
                <input type="text" value={sec.t} onChange={(e) => sec.setT(e.target.value)} />
              </div>
              <div className="form-row">
                <label>Section {sec.label} Text</label>
                <textarea value={sec.b} onChange={(e) => sec.setB(e.target.value)} style={{ width: '100%', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '6px', color: 'var(--spotify-text)', padding: '8px', fontSize: '11px', minHeight: '60px' }} />
              </div>
            </div>
          ))}
        </div>

        <button className={`accordion-btn${openSections.qrcode ? ' open' : ''}`} onClick={() => toggleAccordion('qrcode')}>
          &#128241; QR Code<span className="arrow">&#9660;</span>
        </button>
        <div className={`accordion-content${openSections.qrcode ? ' open' : ''}`}>
          <label className="pf-checkbox-row" style={{ padding: '0 16px' }}>
            <input type="checkbox" checked={showQR} onChange={(e) => setShowQR(e.target.checked)} />
            <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Show QR Code</span>
          </label>

          {showQR && (
            <>
              <div className="form-row">
                <label>QR Link / URL</label>
                <input type="text" value={qrLink} placeholder="https://..." onChange={(e) => setQrLink(e.target.value)} />
              </div>
              <div className="form-row">
                <label>QR Size</label>
                <div className="pf-range-row">
                  <input type="range" min="30" max="200" value={qrSize} onChange={(e) => setQrSize(Number(e.target.value))} />
                  <span className="pf-range-val">{qrSize}px</span>
                </div>
              </div>
            </>
          )}
        </div>

        <button className={`accordion-btn${openSections.styling ? ' open' : ''}`} onClick={() => toggleAccordion('styling')}>
          &#127912; Global Colors<span className="arrow">&#9660;</span>
        </button>
        <div className={`accordion-content${openSections.styling ? ' open' : ''}`}>
          <div className="form-row">
            <label>Background Color</label>
            <div className="color-row">
              <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} />
              <input type="text" value={bgColor} onChange={(e) => setBgColor(e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <label>Divider Lines Color</label>
            <div className="color-row">
              <input type="color" value={dividerColor} onChange={(e) => setDividerColor(e.target.value)} />
              <input type="text" value={dividerColor} onChange={(e) => setDividerColor(e.target.value)} />
            </div>
            <p style={{ fontSize: '9px', color: 'var(--spotify-subtext)' }}>Set to "transparent" to hide lines.</p>
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

      <div id="props-panel" className={isLocked ? 'hidden' : ''}>
        <div id="props-header">
          Properties
          <span id="props-selected-name">
            {selectedType === EDIT_TYPES.HEADLINE && 'Headline Text'}
            {selectedType === EDIT_TYPES.SUBHEAD && 'Subheadline Text'}
            {selectedType === EDIT_TYPES.ADDRESS && 'Address / Tagline'}
            {selectedType === EDIT_TYPES.FOOTER && 'Footer Text'}
            {selectedType?.includes('TITLE') && 'Section Title'}
            {selectedType?.includes('TEXT') && 'Section Body Text'}
            {selectedType === EDIT_TYPES.QR_CODE && 'QR Code'}
            {selectedType === 'group' && 'Group'}
            {selectedType === 'multi' && 'Multiple'}
          </span>
        </div>

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
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
              </svg>
              <p>Click an element on the canvas to change its properties.</p>
            </div>
          )}

          {selectedType === EDIT_TYPES.HEADLINE && (
            <div id="props-fields">
              <div className="pf-section">
                <div className="pf-section-title">Headline Properties</div>
                <div className="pf-row">
                  <label>Font Family</label>
                  <select value={headF} onChange={(e) => setHeadF(e.target.value)}>{GOOGLE_FONTS.map(f => <option key={f} value={f}>{f}</option>)}</select>
                </div>
                <div className="pf-row">
                  <label>Font Weight</label>
                  <select value={headW} onChange={(e) => setHeadW(e.target.value)}>
                    <option value="300">Light (300)</option><option value="400">Regular (400)</option><option value="600">Semi-Bold (600)</option><option value="700">Bold (700)</option><option value="900">Black (900)</option>
                  </select>
                </div>
                <div className="pf-row">
                  <label>Font Size</label>
                  <div className="pf-range-row"><input type="range" min="12" max="150" value={headS} onChange={(e) => setHeadS(Number(e.target.value))} /><span className="pf-range-val">{headS}px</span></div>
                </div>
                <div className="pf-row">
                  <label>Color</label>
                  <div className="pf-color-row"><input type="color" value={headC} onChange={(e) => setHeadC(e.target.value)} /><input type="text" value={headC} onChange={(e) => setHeadC(e.target.value)} /></div>
                </div>
              </div>
            </div>
          )}

          {selectedType === EDIT_TYPES.SUBHEAD && (
            <div id="props-fields">
              <div className="pf-section">
                <div className="pf-section-title">Subheadline Properties</div>
                <div className="pf-row">
                  <label>Font Family</label>
                  <select value={subF} onChange={(e) => setSubF(e.target.value)}>{GOOGLE_FONTS.map(f => <option key={f} value={f}>{f}</option>)}</select>
                </div>
                <div className="pf-row">
                  <label>Font Weight</label>
                  <select value={subW} onChange={(e) => setSubW(e.target.value)}>
                    <option value="300">Light (300)</option><option value="400">Regular (400)</option><option value="600">Semi-Bold (600)</option><option value="700">Bold (700)</option><option value="900">Black (900)</option>
                  </select>
                </div>
                <div className="pf-row">
                  <label>Font Size</label>
                  <div className="pf-range-row"><input type="range" min="8" max="72" value={subS} onChange={(e) => setSubS(Number(e.target.value))} /><span className="pf-range-val">{subS}px</span></div>
                </div>
                <div className="pf-row">
                  <label>Color</label>
                  <div className="pf-color-row"><input type="color" value={subC} onChange={(e) => setSubC(e.target.value)} /><input type="text" value={subC} onChange={(e) => setSubC(e.target.value)} /></div>
                </div>
              </div>
            </div>
          )}

          {selectedType === EDIT_TYPES.ADDRESS && (
            <div id="props-fields">
              <div className="pf-section">
                <div className="pf-section-title">Address/Tagline Properties</div>
                <div className="pf-row">
                  <label>Font Family</label>
                  <select value={subF} onChange={(e) => setSubF(e.target.value)}>{GOOGLE_FONTS.map(f => <option key={f} value={f}>{f}</option>)}</select>
                </div>
                <div className="pf-row">
                  <label>Color</label>
                  <div className="pf-color-row"><input type="color" value={subC} onChange={(e) => setSubC(e.target.value)} /><input type="text" value={subC} onChange={(e) => setSubC(e.target.value)} /></div>
                </div>
              </div>
            </div>
          )}

          {selectedType?.includes('TITLE') && (
            <div id="props-fields">
              <div className="pf-section">
                <div className="pf-section-title">Section Title Properties</div>
                <div className="pf-row">
                  <label>Font Family</label>
                  <select value={bodyTitleF} onChange={(e) => setBodyTitleF(e.target.value)}>{GOOGLE_FONTS.map(f => <option key={f} value={f}>{f}</option>)}</select>
                </div>
                <div className="pf-row">
                  <label>Font Weight</label>
                  <select value={bodyTitleW} onChange={(e) => setBodyTitleW(e.target.value)}>
                    <option value="300">Light (300)</option><option value="400">Regular (400)</option><option value="600">Semi-Bold (600)</option><option value="700">Bold (700)</option><option value="900">Black (900)</option>
                  </select>
                </div>
                <div className="pf-row">
                  <label>Font Size</label>
                  <div className="pf-range-row"><input type="range" min="6" max="48" value={bodyTitleS} onChange={(e) => setBodyTitleS(Number(e.target.value))} /><span className="pf-range-val">{bodyTitleS}px</span></div>
                </div>
                <div className="pf-row">
                  <label>Color</label>
                  <div className="pf-color-row"><input type="color" value={bodyTitleC} onChange={(e) => setBodyTitleC(e.target.value)} /><input type="text" value={bodyTitleC} onChange={(e) => setBodyTitleC(e.target.value)} /></div>
                </div>
                <p style={{ fontSize: '9px', color: 'var(--accent)', marginTop: '8px' }}>Changes apply to all section titles for layout consistency.</p>
              </div>
            </div>
          )}

          {selectedType?.includes('TEXT') && (
            <div id="props-fields">
              <div className="pf-section">
                <div className="pf-section-title">Section Body Properties</div>
                <div className="pf-row">
                  <label>Font Family</label>
                  <select value={bodyTextF} onChange={(e) => setBodyTextF(e.target.value)}>{GOOGLE_FONTS.map(f => <option key={f} value={f}>{f}</option>)}</select>
                </div>
                <div className="pf-row">
                  <label>Font Weight</label>
                  <select value={bodyTextW} onChange={(e) => setBodyTextW(e.target.value)}>
                    <option value="300">Light (300)</option><option value="400">Regular (400)</option><option value="600">Semi-Bold (600)</option><option value="700">Bold (700)</option><option value="900">Black (900)</option>
                  </select>
                </div>
                <div className="pf-row">
                  <label>Font Size</label>
                  <div className="pf-range-row"><input type="range" min="6" max="36" value={bodyTextS} onChange={(e) => setBodyTextS(Number(e.target.value))} /><span className="pf-range-val">{bodyTextS}px</span></div>
                </div>
                <div className="pf-row">
                  <label>Color</label>
                  <div className="pf-color-row"><input type="color" value={bodyTextC} onChange={(e) => setBodyTextC(e.target.value)} /><input type="text" value={bodyTextC} onChange={(e) => setBodyTextC(e.target.value)} /></div>
                </div>
                <p style={{ fontSize: '9px', color: 'var(--accent)', marginTop: '8px' }}>Changes apply to all section body texts for layout consistency.</p>
              </div>
            </div>
          )}

          {selectedType === EDIT_TYPES.FOOTER && (
            <div id="props-fields">
              <div className="pf-section">
                <div className="pf-section-title">Footer Properties</div>
                <div className="pf-row">
                  <label>Font Family</label>
                  <select value={footF} onChange={(e) => setFootF(e.target.value)}>{GOOGLE_FONTS.map(f => <option key={f} value={f}>{f}</option>)}</select>
                </div>
                <div className="pf-row">
                  <label>Font Weight</label>
                  <select value={footW} onChange={(e) => setFootW(e.target.value)}>
                    <option value="300">Light (300)</option><option value="400">Regular (400)</option><option value="600">Semi-Bold (600)</option><option value="700">Bold (700)</option><option value="900">Black (900)</option>
                  </select>
                </div>
                <div className="pf-row">
                  <label>Font Size</label>
                  <div className="pf-range-row"><input type="range" min="8" max="72" value={footS} onChange={(e) => setFootS(Number(e.target.value))} /><span className="pf-range-val">{footS}px</span></div>
                </div>
                <div className="pf-row">
                  <label>Color</label>
                  <div className="pf-color-row"><input type="color" value={footC} onChange={(e) => setFootC(e.target.value)} /><input type="text" value={footC} onChange={(e) => setFootC(e.target.value)} /></div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      <div className="air-toast" style={{ position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%) translateY(20px)', background: 'var(--accent)', color: '#000', padding: '10px 20px', borderRadius: '24px', fontSize: '13px', fontWeight: 600, opacity: 0, transition: 'all 0.3s', zIndex: 9999, pointerEvents: 'none' }}>Done</div>
    </div>
  );
}
