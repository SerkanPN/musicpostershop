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
    id: 'modern-minimalist',
    label: 'Modern Minimalist',
    desc: 'Clean, sans-serif look. High contrast black & white with a pop of teal.',
    texts: {
      headline: 'WELCOME TO LOFT NUMBER SEVEN',
      host: 'YOUR HOSTS: ALEX & MARCUS',
      checkin: 'CHECK-IN: 3:00 PM  |  CHECK-OUT: 10:00 AM',
      wifiSsid: 'LOFT_7_FIBER',
      wifiPass: 'disruptthecity',
      rules: '• NO PARTYING OR LOUD MUSIC ALLOWED.\n\n• CHUTE TRASH DOWN THE HALLWAY DAILY.\n\n• KEEP FRONT GATE LOCKED AT ALL TIMES.\n\n• MAKE YOURSELF AT HOME!',
      footer: 'POLICE: DIAL 999  |  AC UNIT CODE: *404#'
    },
    styles: {
      bg: '#ffffff',
      divider: '#e5e5e5',
      boxBorder: '#0d9488',
      boxBg: '#ffffff',
      headline: { c: '#09090b', f: 'Montserrat', s: 24, w: '900', ls: 50 },
      host: { c: '#52525b', f: 'Montserrat', s: 10, w: '600', ls: 200 },
      checkin: { c: '#09090b', f: 'Inter', s: 10, w: '700', ls: 100 },
      wifiSsid: { c: '#09090b', f: 'Inter', s: 14, w: '800', ls: 50 },
      wifiPass: { c: '#09090b', f: 'Inter', s: 14, w: '800', ls: 50 },
      rules: { c: '#27272a', f: 'Inter', s: 11, w: '500', ls: 50 },
      footer: { c: '#09090b', f: 'Montserrat', s: 9, w: '800', ls: 100 }
    }
  },
  {
    id: 'cozy-cabin',
    label: 'Cozy Alpine Cabin',
    desc: 'Warm earthy tones and classic serif typography for mountain retreats.',
    texts: {
      headline: 'THE PINEWOOD CABIN',
      host: 'HOSTED BY: MOUNTAIN LODGES LTD.',
      checkin: 'CHECK-IN: 14:00  •  CHECK-OUT: 11:00',
      wifiSsid: 'PINEWOOD_WIFI',
      wifiPass: 'forestharmony',
      rules: '• DO NOT LEAVE THE FIREPLACE UNATTENDED.\n\n• LOCK ALL DOORS TO PREVENT WILDLIFE ENTRY.\n\n• USE THE MUDROOM FOR SNOW GEAR.\n\n• BREATHE THE FRESH MOUNTAIN AIR!',
      footer: 'RESCUE SERVICES: DIAL 112  •  WOOD SHED KEY: BOX A'
    },
    styles: {
      bg: '#f4f6f0',
      divider: '#3f4e2b',
      boxBorder: '#4d6232',
      boxBg: '#e8ece1',
      headline: { c: '#1e2515', f: 'Playfair Display', s: 26, w: '700', ls: 50 },
      host: { c: '#3f4e2b', f: 'Inter', s: 9, w: '600', ls: 150 },
      checkin: { c: '#1e2515', f: 'Inter', s: 10, w: '700', ls: 50 },
      wifiSsid: { c: '#1e2515', f: 'Playfair Display', s: 14, w: '800', ls: 50 },
      wifiPass: { c: '#1e2515', f: 'Playfair Display', s: 14, w: '800', ls: 50 },
      rules: { c: '#2f3b20', f: 'Inter', s: 11, w: '500', ls: 0 },
      footer: { c: '#1e2515', f: 'Inter', s: 9, w: '700', ls: 100 }
    }
  },
  {
    id: 'boutique-villa',
    label: 'Boutique Luxury Villa',
    desc: 'High-end serif typography with soft beige and charcoal tones for luxury rentals.',
    texts: {
      headline: 'WELCOME TO THE VILLA',
      host: 'HOSTED BY: THE KAYA FAMILY (+90 555 123 4567)',
      checkin: 'CHECK-IN: 15:00  •  CHECK-OUT: 11:00',
      wifiSsid: 'VILLA_GUEST_5G',
      wifiPass: 'oceanbreeze2026',
      rules: '• PLEASE RESPECT QUIET HOURS AFTER 10:00 PM.\n\n• NO SMOKING OR VAPING INSIDE THE PROPERTY.\n\n• PLEASE SHAKE OFF SAND BEFORE ENTERING.\n\n• ENJOY THE COMPLIMENTARY COFFEE BAR.',
      footer: 'EMERGENCY: DIAL 112  •  NEAREST PHARMACY: 2 KM AWAY'
    },
    styles: {
      bg: '#fffdfa',
      divider: '#1c1917',
      boxBorder: '#b45309',
      boxBg: '#fffdfa',
      headline: { c: '#1c1917', f: 'Prata', s: 24, w: '400', ls: 250 },
      host: { c: '#44403c', f: 'Inter', s: 9, w: '600', ls: 100 },
      checkin: { c: '#1c1917', f: 'Inter', s: 10, w: '700', ls: 150 },
      wifiSsid: { c: '#1c1917', f: 'Prata', s: 15, w: '400', ls: 50 },
      wifiPass: { c: '#1c1917', f: 'Prata', s: 15, w: '400', ls: 50 },
      rules: { c: '#292524', f: 'Lora', s: 11, w: '400', ls: 0 },
      footer: { c: '#1c1917', f: 'Inter', s: 8, w: '700', ls: 100 }
    }
  }
];

const DPI = 300;
const BASE_MAX_W = 600;
const BASE_MAX_H = 800;

const EDIT_TYPES = {
  HEADLINE: 'ab-headline',
  HOST: 'ab-host',
  CHECKIN: 'ab-checkin',
  WIFI_SSID: 'ab-wifi-ssid',
  WIFI_PASS: 'ab-wifi-pass',
  RULES: 'ab-rules',
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

interface AirbnbPosterPageProps {
  navigate: (path: string) => void;
}

export default function AirbnbPosterPage({ navigate }: AirbnbPosterPageProps) {
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
    presets: true,
    size: false,
    textFields: false,
    qrcode: false,
    background: false
  });

  const [activePreset, setActivePreset] = useState<string>('modern-minimalist');

  const [canvasSize, setCanvasSize] = useState<string>('8.27x11.69');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [containerDims, setContainerDims] = useState(() => {
    const { w, h } = parseAndOrientSize('8.27x11.69', 'portrait');
    return fitContain(w, h, BASE_MAX_W, BASE_MAX_H);
  });
  const [zoom, setZoom] = useState<number>(1); 

  const [bgColor, setBgColor] = useState('#ffffff');
  const [dividerColor, setDividerColor] = useState('#e5e5e5');
  const [boxBorderColor, setBoxBorderColor] = useState('#0d9488');
  const [boxBgColor, setBoxBgColor] = useState('#ffffff');

  const [headlineText, setHeadlineText] = useState('WELCOME TO LOFT NUMBER SEVEN');
  const [headlineColor, setHeadlineColor] = useState('#09090b');
  const [headlineFontFamily, setHeadlineFontFamily] = useState('Montserrat');
  const [headlineFontSize, setHeadlineFontSize] = useState(24);
  const [headlineCharSpacing, setHeadlineCharSpacing] = useState(50);
  const [headlineFontWeight, setHeadlineFontWeight] = useState('900');
  const [headlineFontStyle, setHeadlineFontStyle] = useState('normal');

  const [hostText, setHostText] = useState('YOUR HOSTS: ALEX & MARCUS');
  const [hostColor, setHostColor] = useState('#52525b');
  const [hostFontFamily, setHostFontFamily] = useState('Montserrat');
  const [hostFontSize, setHostFontSize] = useState(10);
  const [hostCharSpacing, setHostCharSpacing] = useState(200);
  const [hostFontWeight, setHostFontWeight] = useState('600');
  const [hostFontStyle, setHostFontStyle] = useState('normal');

  const [checkinText, setCheckinText] = useState('CHECK-IN: 3:00 PM  |  CHECK-OUT: 10:00 AM');
  const [checkinColor, setCheckinColor] = useState('#09090b');
  const [checkinFontFamily, setCheckinFontFamily] = useState('Inter');
  const [checkinFontSize, setCheckinFontSize] = useState(10);
  const [checkinCharSpacing, setCheckinCharSpacing] = useState(100);
  const [checkinFontWeight, setCheckinFontWeight] = useState('700');
  const [checkinFontStyle, setCheckinFontStyle] = useState('normal');

  const [wifiSsidText, setWifiSsidText] = useState('LOFT_7_FIBER');
  const [wifiSsidColor, setWifiSsidColor] = useState('#09090b');
  const [wifiSsidFontFamily, setWifiSsidFontFamily] = useState('Inter');
  const [wifiSsidFontSize, setWifiSsidFontSize] = useState(14);
  const [wifiSsidCharSpacing, setWifiSsidCharSpacing] = useState(50);
  const [wifiSsidFontWeight, setWifiSsidFontWeight] = useState('800');
  const [wifiSsidFontStyle, setWifiSsidFontStyle] = useState('normal');

  const [wifiPassText, setWifiPassText] = useState('disruptthecity');
  const [wifiPassColor, setWifiPassColor] = useState('#09090b');
  const [wifiPassFontFamily, setWifiPassFontFamily] = useState('Inter');
  const [wifiPassFontSize, setWifiPassFontSize] = useState(14);
  const [wifiPassCharSpacing, setWifiPassCharSpacing] = useState(50);
  const [wifiPassFontWeight, setWifiPassFontWeight] = useState('800');
  const [wifiPassFontStyle, setWifiPassFontStyle] = useState('normal');

  const [rulesText, setRulesText] = useState('• NO PARTYING OR LOUD MUSIC ALLOWED.\n\n• CHUTE TRASH DOWN THE HALLWAY DAILY.\n\n• KEEP FRONT GATE LOCKED AT ALL TIMES.\n\n• MAKE YOURSELF AT HOME!');
  const [rulesColor, setRulesColor] = useState('#27272a');
  const [rulesFontFamily, setRulesFontFamily] = useState('Inter');
  const [rulesFontSize, setRulesFontSize] = useState(11);
  const [rulesCharSpacing, setRulesCharSpacing] = useState(50);
  const [rulesFontWeight, setRulesFontWeight] = useState('500');
  const [rulesFontStyle, setRulesFontStyle] = useState('normal');

  const [footerText, setFooterText] = useState('POLICE: DIAL 999  |  AC UNIT CODE: *404#');
  const [footerColor, setFooterColor] = useState('#09090b');
  const [footerFontFamily, setFooterFontFamily] = useState('Montserrat');
  const [footerFontSize, setFooterFontSize] = useState(9);
  const [footerCharSpacing, setFooterCharSpacing] = useState(100);
  const [footerFontWeight, setFooterFontWeight] = useState('800');
  const [footerFontStyle, setFooterFontStyle] = useState('normal');

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

    const preset = PRESETS.find(p => p.id === presetId);
    if (!preset) return;

    setHeadlineText(preset.texts.headline);
    setHostText(preset.texts.host);
    setCheckinText(preset.texts.checkin);
    setWifiSsidText(preset.texts.wifiSsid);
    setWifiPassText(preset.texts.wifiPass);
    setRulesText(preset.texts.rules);
    setFooterText(preset.texts.footer);

    setBgColor(preset.styles.bg);
    setDividerColor(preset.styles.divider);
    setBoxBorderColor(preset.styles.boxBorder);
    setBoxBgColor(preset.styles.boxBg);

    setHeadlineColor(preset.styles.headline.c);
    setHeadlineFontFamily(preset.styles.headline.f);
    setHeadlineFontSize(preset.styles.headline.s);
    setHeadlineFontWeight(preset.styles.headline.w);
    setHeadlineCharSpacing(preset.styles.headline.ls);

    setHostColor(preset.styles.host.c);
    setHostFontFamily(preset.styles.host.f);
    setHostFontSize(preset.styles.host.s);
    setHostFontWeight(preset.styles.host.w);
    setHostCharSpacing(preset.styles.host.ls);

    setCheckinColor(preset.styles.checkin.c);
    setCheckinFontFamily(preset.styles.checkin.f);
    setCheckinFontSize(preset.styles.checkin.s);
    setCheckinFontWeight(preset.styles.checkin.w);
    setCheckinCharSpacing(preset.styles.checkin.ls);

    setWifiSsidColor(preset.styles.wifiSsid.c);
    setWifiSsidFontFamily(preset.styles.wifiSsid.f);
    setWifiSsidFontSize(preset.styles.wifiSsid.s);
    setWifiSsidFontWeight(preset.styles.wifiSsid.w);
    setWifiSsidCharSpacing(preset.styles.wifiSsid.ls);

    setWifiPassColor(preset.styles.wifiPass.c);
    setWifiPassFontFamily(preset.styles.wifiPass.f);
    setWifiPassFontSize(preset.styles.wifiPass.s);
    setWifiPassFontWeight(preset.styles.wifiPass.w);
    setWifiPassCharSpacing(preset.styles.wifiPass.ls);

    setRulesColor(preset.styles.rules.c);
    setRulesFontFamily(preset.styles.rules.f);
    setRulesFontSize(preset.styles.rules.s);
    setRulesFontWeight(preset.styles.rules.w);
    setRulesCharSpacing(preset.styles.rules.ls);

    setFooterColor(preset.styles.footer.c);
    setFooterFontFamily(preset.styles.footer.f);
    setFooterFontSize(preset.styles.footer.s);
    setFooterFontWeight(preset.styles.footer.w);
    setFooterCharSpacing(preset.styles.footer.ls);

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
          setBgColor(ds.bgColor || '#ffffff');
          setDividerColor(ds.dividerColor || '#e5e5e5');
          setBoxBorderColor(ds.boxBorderColor || '#0d9488');
          setBoxBgColor(ds.boxBgColor || '#ffffff');

          setHeadlineText(ds.headlineText || '');
          setHeadlineColor(ds.headlineColor || '#09090b');
          setHeadlineFontFamily(ds.headlineFontFamily || 'Montserrat');
          setHeadlineFontSize(ds.headlineFontSize || 24);
          setHeadlineCharSpacing(ds.headlineCharSpacing || 50);
          setHeadlineFontWeight(ds.headlineFontWeight || '900');
          setHeadlineFontStyle(ds.headlineFontStyle || 'normal');

          setHostText(ds.hostText || '');
          setHostColor(ds.hostColor || '#52525b');
          setHostFontFamily(ds.hostFontFamily || 'Montserrat');
          setHostFontSize(ds.hostFontSize || 10);
          setHostCharSpacing(ds.hostCharSpacing || 200);
          setHostFontWeight(ds.hostFontWeight || '600');
          setHostFontStyle(ds.hostFontStyle || 'normal');

          setCheckinText(ds.checkinText || '');
          setCheckinColor(ds.checkinColor || '#09090b');
          setCheckinFontFamily(ds.checkinFontFamily || 'Inter');
          setCheckinFontSize(ds.checkinFontSize || 10);
          setCheckinCharSpacing(ds.checkinCharSpacing || 100);
          setCheckinFontWeight(ds.checkinFontWeight || '700');
          setCheckinFontStyle(ds.checkinFontStyle || 'normal');

          setWifiSsidText(ds.wifiSsidText || '');
          setWifiSsidColor(ds.wifiSsidColor || '#09090b');
          setWifiSsidFontFamily(ds.wifiSsidFontFamily || 'Inter');
          setWifiSsidFontSize(ds.wifiSsidFontSize || 14);
          setWifiSsidCharSpacing(ds.wifiSsidCharSpacing || 50);
          setWifiSsidFontWeight(ds.wifiSsidFontWeight || '800');
          setWifiSsidFontStyle(ds.wifiSsidFontStyle || 'normal');

          setWifiPassText(ds.wifiPassText || '');
          setWifiPassColor(ds.wifiPassColor || '#09090b');
          setWifiPassFontFamily(ds.wifiPassFontFamily || 'Inter');
          setWifiPassFontSize(ds.wifiPassFontSize || 14);
          setWifiPassCharSpacing(ds.wifiPassCharSpacing || 50);
          setWifiPassFontWeight(ds.wifiPassFontWeight || '800');
          setWifiPassFontStyle(ds.wifiPassFontStyle || 'normal');

          setRulesText(ds.rulesText || '');
          setRulesColor(ds.rulesColor || '#27272a');
          setRulesFontFamily(ds.rulesFontFamily || 'Inter');
          setRulesFontSize(ds.rulesFontSize || 11);
          setRulesCharSpacing(ds.rulesCharSpacing || 50);
          setRulesFontWeight(ds.rulesFontWeight || '500');
          setRulesFontStyle(ds.rulesFontStyle || 'normal');

          setFooterText(ds.footerText || '');
          setFooterColor(ds.footerColor || '#09090b');
          setFooterFontFamily(ds.footerFontFamily || 'Montserrat');
          setFooterFontSize(ds.footerFontSize || 9);
          setFooterCharSpacing(ds.footerCharSpacing || 100);
          setFooterFontWeight(ds.footerFontWeight || '800');
          setFooterFontStyle(ds.footerFontStyle || 'normal');

          setShowQR(ds.showQR || false);
          setQrLink(ds.qrLink || 'https://wifi.login');
          setQrSize(ds.qrSize || 60);
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

    rebuildStructuralLayout();

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
          case EDIT_TYPES.HEADLINE: setHeadlineText(v); break;
          case EDIT_TYPES.HOST: setHostText(v); break;
          case EDIT_TYPES.CHECKIN: setCheckinText(v); break;
          case EDIT_TYPES.WIFI_SSID: setWifiSsidText(v); break;
          case EDIT_TYPES.WIFI_PASS: setWifiPassText(v); break;
          case EDIT_TYPES.RULES: setRulesText(v); break;
          case EDIT_TYPES.FOOTER: setFooterText(v); break;
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

  const rebuildStructuralLayout = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    isRebuildingRef.current = true;

    const cw = containerDims.width;
    const ch = containerDims.height;
    const paddingX = cw * 0.1;
    const contentW = cw - (paddingX * 2);

    const existingObjs = canvas.getObjects().filter(o => o !== bgRectRef.current);
    existingObjs.forEach(o => canvas.remove(o));

    let currentY = ch * 0.1;

    const headline = new fabric.Textbox(headlineText, {
      left: cw / 2, top: currentY, width: contentW, originX: 'center', textAlign: 'center',
      fontSize: headlineFontSize, fontFamily: headlineFontFamily, fontWeight: headlineFontWeight,
      fontStyle: headlineFontStyle, fill: headlineColor, charSpacing: headlineCharSpacing,
      data: { edType: EDIT_TYPES.HEADLINE }
    });
    canvas.add(headline);
    currentY += headline.getBoundingRect().height + 15;

    const host = new fabric.Textbox(hostText, {
      left: cw / 2, top: currentY, width: contentW, originX: 'center', textAlign: 'center',
      fontSize: hostFontSize, fontFamily: hostFontFamily, fontWeight: hostFontWeight,
      fontStyle: hostFontStyle, fill: hostColor, charSpacing: hostCharSpacing,
      data: { edType: EDIT_TYPES.HOST }
    });
    canvas.add(host);
    currentY += host.getBoundingRect().height + 20;

    const div1 = new fabric.Line([paddingX, currentY, cw - paddingX, currentY], {
      stroke: dividerColor, strokeWidth: 2, selectable: false, evented: false
    });
    canvas.add(div1);
    currentY += 15;

    const checkin = new fabric.Textbox(checkinText, {
      left: cw / 2, top: currentY, width: contentW, originX: 'center', textAlign: 'center',
      fontSize: checkinFontSize, fontFamily: checkinFontFamily, fontWeight: checkinFontWeight,
      fontStyle: checkinFontStyle, fill: checkinColor, charSpacing: checkinCharSpacing,
      data: { edType: EDIT_TYPES.CHECKIN }
    });
    canvas.add(checkin);
    currentY += checkin.getBoundingRect().height + 15;

    const div2 = new fabric.Line([paddingX, currentY, cw - paddingX, currentY], {
      stroke: dividerColor, strokeWidth: 1, selectable: false, evented: false
    });
    canvas.add(div2);
    currentY += 25;

    const boxW = (contentW / 2) - 10;
    const boxH = Math.max(100, ch * 0.15);

    const wifiBg = new fabric.Rect({
      left: paddingX, top: currentY, width: boxW, height: boxH, rx: 8, ry: 8,
      fill: boxBgColor, stroke: boxBorderColor, strokeWidth: 1.5, selectable: false, evented: false
    });
    canvas.add(wifiBg);

    const wifiLabel1 = new fabric.Text('WI-FI NETWORK', {
      left: paddingX + 15, top: currentY + 15, fontSize: 8, fontFamily: wifiSsidFontFamily, fontWeight: '800', fill: boxBorderColor, selectable: false, evented: false
    });
    const wifiSsid = new fabric.IText(wifiSsidText, {
      left: paddingX + 15, top: currentY + 30, fontSize: wifiSsidFontSize, fontFamily: wifiSsidFontFamily, fontWeight: wifiSsidFontWeight, fontStyle: wifiSsidFontStyle, fill: wifiSsidColor, charSpacing: wifiSsidCharSpacing, data: { edType: EDIT_TYPES.WIFI_SSID }
    });
    const wifiLabel2 = new fabric.Text('PASSWORD', {
      left: paddingX + 15, top: currentY + 65, fontSize: 8, fontFamily: wifiPassFontFamily, fontWeight: '800', fill: boxBorderColor, selectable: false, evented: false
    });
    const wifiPass = new fabric.IText(wifiPassText, {
      left: paddingX + 15, top: currentY + 80, fontSize: wifiPassFontSize, fontFamily: wifiPassFontFamily, fontWeight: wifiPassFontWeight, fontStyle: wifiPassFontStyle, fill: wifiPassColor, charSpacing: wifiPassCharSpacing, data: { edType: EDIT_TYPES.WIFI_PASS }
    });
    canvas.add(wifiLabel1, wifiSsid, wifiLabel2, wifiPass);

    const infoBg = new fabric.Rect({
      left: cw - paddingX - boxW, top: currentY, width: boxW, height: boxH, rx: 8, ry: 8,
      fill: 'transparent', stroke: dividerColor, strokeWidth: 1.5, selectable: false, evented: false
    });
    canvas.add(infoBg);

    if (showQR && qrLink.trim()) {
      const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrLink)}&color=${boxBorderColor.replace('#', '')}&bgcolor=${bgColor.replace('#', '')}`;
      fabric.Image.fromURL(apiUrl, { crossOrigin: 'anonymous' }).then((img) => {
        img.set({
          left: (cw - paddingX - boxW) + (boxW / 2),
          top: currentY + (boxH / 2),
          originX: 'center', originY: 'center',
          scaleX: qrSize / img.width!, scaleY: qrSize / img.height!,
          selectable: !isLocked, data: { edType: EDIT_TYPES.QR_CODE }
        });
        canvas.add(img);
        qrCodeRef.current = img;
        canvas.requestRenderAll();
      }).catch(() => {});
    } else {
      const infoLabel = new fabric.Text('HOUSE RULES & GUIDE', {
        left: cw - paddingX - boxW + 15, top: currentY + 15, fontSize: 8, fontFamily: rulesFontFamily, fontWeight: '800', fill: boxBorderColor, selectable: false, evented: false
      });
      canvas.add(infoLabel);
    }

    currentY += boxH + 25;

    const rulesTitle = new fabric.Text('HOUSE RULES & RESPONSIBILITIES', {
      left: paddingX, top: currentY, fontSize: 10, fontFamily: rulesFontFamily, fontWeight: '800', fill: rulesColor, selectable: false, evented: false
    });
    canvas.add(rulesTitle);
    currentY += 20;

    const rulesObj = new fabric.Textbox(rulesText, {
      left: paddingX, top: currentY, width: contentW,
      fontSize: rulesFontSize, fontFamily: rulesFontFamily, fontWeight: rulesFontWeight,
      fontStyle: rulesFontStyle, fill: rulesColor, charSpacing: rulesCharSpacing,
      lineHeight: 1.6,
      data: { edType: EDIT_TYPES.RULES }
    });
    canvas.add(rulesObj);

    const bottomY = ch - (ch * 0.08);

    const div3 = new fabric.Line([paddingX, bottomY - 20, cw - paddingX, bottomY - 20], {
      stroke: dividerColor, strokeWidth: 2, selectable: false, evented: false
    });
    canvas.add(div3);

    const footer = new fabric.Textbox(footerText, {
      left: cw / 2, top: bottomY, width: contentW, originX: 'center', textAlign: 'center',
      fontSize: footerFontSize, fontFamily: footerFontFamily, fontWeight: footerFontWeight,
      fontStyle: footerFontStyle, fill: footerColor, charSpacing: footerCharSpacing,
      data: { edType: EDIT_TYPES.FOOTER }
    });
    canvas.add(footer);

    (canvas as any).headlineRef = headline;
    (canvas as any).hostRef = host;
    (canvas as any).checkinRef = checkin;
    (canvas as any).wifiSsidRef = wifiSsid;
    (canvas as any).wifiPassRef = wifiPass;
    (canvas as any).rulesRef = rulesObj;
    (canvas as any).footerRef = footer;

    canvas.requestRenderAll();
    isRebuildingRef.current = false;
  }, [
    containerDims, headlineText, headlineFontSize, headlineFontFamily, headlineFontWeight, headlineFontStyle, headlineColor, headlineCharSpacing,
    hostText, hostFontSize, hostFontFamily, hostFontWeight, hostFontStyle, hostColor, hostCharSpacing,
    checkinText, checkinFontSize, checkinFontFamily, checkinFontWeight, checkinFontStyle, checkinColor, checkinCharSpacing,
    wifiSsidText, wifiSsidFontSize, wifiSsidFontFamily, wifiSsidFontWeight, wifiSsidFontStyle, wifiSsidColor, wifiSsidCharSpacing,
    wifiPassText, wifiPassFontSize, wifiPassFontFamily, wifiPassFontWeight, wifiPassFontStyle, wifiPassColor, wifiPassCharSpacing,
    rulesText, rulesFontSize, rulesFontFamily, rulesFontWeight, rulesFontStyle, rulesColor, rulesCharSpacing,
    footerText, footerFontSize, footerFontFamily, footerFontWeight, footerFontStyle, footerColor, footerCharSpacing,
    bgColor, dividerColor, boxBorderColor, boxBgColor, showQR, qrLink, qrSize, isLocked
  ]);

  useEffect(() => {
    if (!isCheckingToken && !tokenError && fabricRef.current) {
      rebuildStructuralLayout();
    }
  }, [rebuildStructuralLayout, isCheckingToken, tokenError]);

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
    if (!activeObj) {
      return;
    }

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
    if (!activeObj || activeObj.type !== 'activeSelection') {
      return;
    }
    
    (activeObj as fabric.ActiveSelection).toGroup();
    canvas.requestRenderAll();
    
    const newGroup = canvas.getActiveObject();
    if (newGroup) {
      newGroup.set({
        data: { edType: 'group' }
      });
    }
    setSelectedType('group');
  };

  const handleUngroup = () => {
    if(isLocked) return;
    const canvas = fabricRef.current;
    if (!canvas) return;
    const activeObj = canvas.getActiveObject();
    if (!activeObj || activeObj.type !== 'group') {
      return;
    }
    
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
          a.download = `airbnb-guide.png`;
          a.click();
        } else if (format === 'pdf') {
          const dataUrl = canvas.toDataURL({ format: 'png', multiplier });
          const pdf = new jsPDF({ orientation: w > h ? 'landscape' : 'portrait', unit: 'in', format: [w, h] });
          pdf.addImage(dataUrl, 'PNG', 0, 0, w, h);
          pdf.save(`airbnb-guide.pdf`);
        } else if (format === 'svg') {
          const svg = canvas.toSVG();
          const blob = new Blob([svg], { type: 'image/svg+xml' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `airbnb-guide.svg`;
          a.click();
          URL.revokeObjectURL(url);
        }

        const designStateJSON = {
          canvasSize, orientation, bgColor, dividerColor, boxBorderColor, boxBgColor,
          headlineText, headlineColor, headlineFontFamily, headlineFontSize, headlineCharSpacing, headlineFontWeight, headlineFontStyle,
          hostText, hostColor, hostFontFamily, hostFontSize, hostCharSpacing, hostFontWeight, hostFontStyle,
          checkinText, checkinColor, checkinFontFamily, checkinFontSize, checkinCharSpacing, checkinFontWeight, checkinFontStyle,
          wifiSsidText, wifiSsidColor, wifiSsidFontFamily, wifiSsidFontSize, wifiSsidCharSpacing, wifiSsidFontWeight, wifiSsidFontStyle,
          wifiPassText, wifiPassColor, wifiPassFontFamily, wifiPassFontSize, wifiPassCharSpacing, wifiPassFontWeight, wifiPassFontStyle,
          rulesText, rulesColor, rulesFontFamily, rulesFontSize, rulesCharSpacing, rulesFontWeight, rulesFontStyle,
          footerText, footerColor, footerFontFamily, footerFontSize, footerCharSpacing, footerFontWeight, footerFontStyle,
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
        .soundwave-poster-page #props-panel {
          width: 260px; min-width: 260px; background: var(--panel-bg); border-left: 1px solid var(--panel-border);
          overflow-y: auto; flex-shrink: 0; display: flex; flex-direction: column;
        }
        .soundwave-poster-page #props-panel::-webkit-scrollbar { width: 3px; }
        .soundwave-poster-page #props-panel::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
        .soundwave-poster-page #props-header {
          padding: 14px 16px 10px; border-bottom: 1px solid var(--panel-border); font-size: 10px;
          font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--spotify-subtext);
          display: flex; align-items: center; justify-content: space-between; flex-shrink: 0;
        }
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
        .soundwave-poster-page .pf-row select {
          width: 100%; background: var(--input-bg); border: 1px solid var(--input-border); border-radius: 5px;
          color: var(--spotify-text); padding: 5px 8px; font-size: 11px; font-family: 'DM Sans', sans-serif; outline: none;
          transition: border-color 0.15s;
        }
        .soundwave-poster-page .pf-row input:focus, .soundwave-poster-page .pf-row select:focus { border-color: var(--accent); }
        .soundwave-poster-page .pf-row select option { background: #1a1a1a; }
        .soundwave-poster-page .pf-row input[type=range] { width: 100%; accent-color: var(--accent); cursor: pointer; }
        .soundwave-poster-page .pf-row input[type=color] { width: 30px; height: 26px; border: none; border-radius: 4px; cursor: pointer; padding: 2px; background: var(--input-bg); }
        .soundwave-poster-page .pf-color-row { display: flex; gap: 6px; align-items: center; }
        .soundwave-poster-page .pf-color-row input[type=text] { flex: 1; }
        .soundwave-poster-page .pf-range-row { display: flex; align-items: center; gap: 6px; }
        .soundwave-poster-page .pf-range-val { font-size: 10px; color: var(--accent); font-weight: 600; min-width: 32px; text-align: right; }
        .soundwave-poster-page .global-tools-panel {
          padding: 14px 16px;
          border-bottom: 1px solid var(--panel-border);
          background: #0f0f0f;
          flex-shrink: 0;
        }
        .soundwave-poster-page .gt-section-title {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--spotify-subtext);
          margin-bottom: 8px;
        }
        .soundwave-poster-page .gt-align-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 4px;
          margin-bottom: 8px;
        }
        .soundwave-poster-page .gt-align-btn {
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--input-bg);
          border: 1px solid var(--input-border);
          color: var(--spotify-subtext);
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s;
        }
        .soundwave-poster-page .gt-align-btn:hover {
          background: #1a1a1a;
          border-color: var(--accent);
          color: var(--spotify-text);
        }
        .soundwave-poster-page .gt-align-btn svg { width: 14px; height: 14px; }
        .soundwave-poster-page .gt-group-row { display: flex; gap: 6px; margin-bottom: 12px; }
        .soundwave-poster-page .gt-group-btn {
          flex: 1; height: 28px; font-size: 10px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase;
          background: var(--input-bg); border: 1px solid var(--input-border); color: var(--spotify-text); border-radius: 6px;
          cursor: pointer; transition: all 0.15s;
        }
        .soundwave-poster-page .gt-group-btn:hover { background: var(--accent); color: #000; border-color: var(--accent); }
        .soundwave-poster-page .gt-zoom-row { display: flex; align-items: center; gap: 8px; }
        .soundwave-poster-page .gt-zoom-row input[type=range] { flex: 1; accent-color: var(--accent); cursor: pointer; }
        .soundwave-poster-page .gt-zoom-val { font-size: 11px; font-weight: 600; color: var(--accent); min-width: 32px; text-align: right; }
        .soundwave-poster-page .gt-zoom-reset {
          background: #222; border: 1px solid #333; color: #fff; font-size: 9px; padding: 2px 6px; border-radius: 4px; cursor: pointer;
        }
        .soundwave-poster-page .gt-zoom-reset:hover { background: #333; }
        .orient-group { display: flex; gap: 8px; margin-top: 8px; }
        .pf-checkbox-row { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; cursor: pointer; }
        .pf-checkbox-row input[type=checkbox] { width: 16px; height: 16px; cursor: pointer; accent-color: var(--accent); }
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
        .review-action-area { width: 100%; display: flex; flex-direction: column; align-items: center; gap: 24px; }
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
        .sw-toast {
          position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%) translateY(20px);
          background: var(--accent); color: #000; padding: 10px 20px; border-radius: 24px;
          font-size: 13px; font-weight: 600; opacity: 0; transition: all 0.3s; z-index: 9999; pointer-events: none;
        }
        .sw-toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
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
                    Your message has been sent successfully. We will respond to your request within 24 hours.
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
                    Need to make changes to your locked design? Describe your request below, and our team will update it for you.
                  </p>
                  <div className="form-row" style={{ padding: 0, marginBottom: '20px' }}>
                    <label>Your Message</label>
                    <textarea 
                      value={supportMessage}
                      onChange={(e) => setSupportMessage(e.target.value)}
                      placeholder="Describe the changes you want (e.g., date correction)..."
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
          &#128294; Guide Information<span className="arrow">&#9660;</span>
        </button>
        <div className={`accordion-content${openSections.textFields ? ' open' : ''}`}>
          <div className="form-row">
            <label>Welcome Headline</label>
            <input type="text" value={headlineText} onChange={(e) => setHeadlineText(e.target.value)} />
          </div>
          <div className="form-row">
            <label>Host Name / Contact</label>
            <input type="text" value={hostText} onChange={(e) => setHostText(e.target.value)} />
          </div>
          <div className="form-row">
            <label>Check-in / Check-out Times</label>
            <input type="text" value={checkinText} onChange={(e) => setCheckinText(e.target.value)} />
          </div>
          <div className="form-row">
            <label>Wi-Fi Network Name</label>
            <input type="text" value={wifiSsidText} onChange={(e) => setWifiSsidText(e.target.value)} />
          </div>
          <div className="form-row">
            <label>Wi-Fi Password</label>
            <input type="text" value={wifiPassText} onChange={(e) => setWifiPassText(e.target.value)} />
          </div>
          <div className="form-row">
            <label>House Rules List</label>
            <textarea value={rulesText} onChange={(e) => setRulesText(e.target.value)}
              style={{
                width: '100%', background: 'var(--input-bg)', border: '1px solid var(--input-border)',
                borderRadius: '6px', color: 'var(--spotify-text)', padding: '8px 10px', fontSize: '11px',
                fontFamily: 'inherit', minHeight: '90px', resize: 'vertical', outline: 'none'
              }}
            />
          </div>
          <div className="form-row">
            <label>Emergency details / Footer</label>
            <input type="text" value={footerText} onChange={(e) => setFooterText(e.target.value)} />
          </div>
        </div>

        <button className={`accordion-btn${openSections.qrcode ? ' open' : ''}`} onClick={() => toggleAccordion('qrcode')}>
          &#128241; QR Code Settings<span className="arrow">&#9660;</span>
        </button>
        <div className={`accordion-content${openSections.qrcode ? ' open' : ''}`}>
          <label className="pf-checkbox-row" style={{ padding: '0 16px' }}>
            <input type="checkbox" checked={showQR} onChange={(e) => setShowQR(e.target.checked)} />
            <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Show QR Code</span>
          </label>

          {showQR && (
            <>
              <div className="form-row">
                <label>QR Link / Audio URL</label>
                <input type="text" value={qrLink} placeholder="https://..." onChange={(e) => setQrLink(e.target.value)} />
              </div>
              <div className="form-row">
                <label>QR Size</label>
                <div className="pf-range-row">
                  <input type="range" min="15" max="150" value={qrSize} onChange={(e) => setQrSize(Number(e.target.value))} />
                  <span className="pf-range-val">{qrSize}px</span>
                </div>
              </div>
            </>
          )}
        </div>

        <button className={`accordion-btn${openSections.background ? ' open' : ''}`} onClick={() => toggleAccordion('background')}>
          &#128444;&#65039; Background & Boxes<span className="arrow">&#9660;</span>
        </button>
        <div className={`accordion-content${openSections.background ? ' open' : ''}`}>
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
          </div>
          <div className="form-row">
            <label>Box Border Color</label>
            <div className="color-row">
              <input type="color" value={boxBorderColor} onChange={(e) => setBoxBorderColor(e.target.value)} />
              <input type="text" value={boxBorderColor} onChange={(e) => setBoxBorderColor(e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <label>Box Background Color</label>
            <div className="color-row">
              <input type="color" value={boxBgColor} onChange={(e) => setBoxBgColor(e.target.value)} />
              <input type="text" value={boxBgColor} onChange={(e) => setBoxBgColor(e.target.value)} />
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

      <div id="props-panel" className={isLocked ? 'hidden' : ''}>
        <div id="props-header">
          Properties
          <span id="props-selected-name">
            {selectedType === EDIT_TYPES.HEADLINE && 'Headline'}
            {selectedType === EDIT_TYPES.HOST && 'Host'}
            {selectedType === EDIT_TYPES.CHECKIN && 'Check-in'}
            {selectedType === EDIT_TYPES.WIFI_SSID && 'Wi-Fi Name'}
            {selectedType === EDIT_TYPES.WIFI_PASS && 'Wi-Fi Password'}
            {selectedType === EDIT_TYPES.RULES && 'House Rules'}
            {selectedType === EDIT_TYPES.FOOTER && 'Emergency / Footer'}
            {selectedType === EDIT_TYPES.QR_CODE && 'QR Code'}
            {selectedType === 'group' && 'Group'}
            {selectedType === 'multi' && 'Multiple'}
          </span>
        </div>

        <div className="global-tools-panel">
          <div className="gt-section-title">ALIGNMENT</div>
          <div className="gt-align-grid">
            <button className="gt-align-btn" onClick={() => handleAlign('left')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="3" x2="3" y2="21" strokeWidth="2.5" /><rect x="5" y="8" width="8" height="3" rx="1" /><rect x="5" y="13" width="13" height="3" rx="1" />
              </svg>
            </button>
            <button className="gt-align-btn" onClick={() => handleAlign('cx')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="3" x2="12" y2="21" strokeWidth="2.5" /><rect x="6" y="8" width="12" height="3" rx="1" /><rect x="4" y="13" width="16" height="3" rx="1" />
              </svg>
            </button>
            <button className="gt-align-btn" onClick={() => handleAlign('right')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="21" y1="3" x2="21" y2="21" strokeWidth="2.5" /><rect x="11" y="8" width="8" height="3" rx="1" /><rect x="6" y="13" width="13" height="3" rx="1" />
              </svg>
            </button>
            <button className="gt-align-btn" onClick={() => edDistribute('h')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="3" x2="3" y2="21" /><line x1="21" y1="3" x2="21" y2="21" /><rect x="9" y="8" width="6" height="8" rx="1" />
              </svg>
            </button>
            <button className="gt-align-btn" onClick={() => handleAlign('top')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="3" x2="21" y2="3" strokeWidth="2.5" /><rect x="8" y="5" width="3" height="8" rx="1" /><rect x="13" y="5" width="3" height="13" rx="1" />
              </svg>
            </button>
            <button className="gt-align-btn" onClick={() => handleAlign('cy')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12" strokeWidth="2.5" /><rect x="8" y="4" width="3" height="16" rx="1" /><rect x="13" y="6" width="3" height="12" rx="1" />
              </svg>
            </button>
            <button className="gt-align-btn" onClick={() => handleAlign('bottom')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="21" x2="21" y2="21" strokeWidth="2.5" /><rect x="8" y="11" width="3" height="8" rx="1" /><rect x="13" y="6" width="13" height="3" rx="1" />
              </svg>
            </button>
            <button className="gt-align-btn" onClick={() => edDistribute('v')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="3" x2="21" y2="3" /><line x1="3" y1="21" x2="21" y2="21" /><rect x="8" y="9" width="8" height="6" rx="1" />
              </svg>
            </button>
          </div>

          <div className="gt-section-title" style={{ marginTop: '10px' }}>GROUPING</div>
          <div className="gt-group-row">
            <button className="gt-group-btn" onClick={handleGroup}>Group</button>
            <button className="gt-group-btn" onClick={handleUngroup}>Ungroup</button>
          </div>

          <div className="gt-section-title">ZOOM</div>
          <div className="gt-zoom-row">
            <input 
              type="range" 
              min="0.5" 
              max="10" 
              step="0.1" 
              value={zoom} 
              onChange={(e) => setZoom(Number(e.target.value))} 
            />
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
                <div className="pf-section-title">Headline</div>
                <div className="pf-row">
                  <label>Text</label>
                  <input type="text" value={headlineText}
                    onChange={(e) => setHeadlineText(e.target.value)} />
                </div>
                <div className="pf-row">
                  <label>Font Family</label>
                  <select value={headlineFontFamily} onChange={(e) => setHeadlineFontFamily(e.target.value)}>
                    {GOOGLE_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div className="pf-row">
                  <label>Font Style</label>
                  <FontStyleSelector weight={headlineFontWeight} style={headlineFontStyle} onChange={(w, s) => { setHeadlineFontWeight(w); setHeadlineFontStyle(s); }} />
                </div>
                <div className="pf-row">
                  <label>Font Size</label>
                  <div className="pf-range-row">
                    <input type="range" min="8" max="72" value={headlineFontSize} onChange={(e) => setHeadlineFontSize(Number(e.target.value))} />
                    <span className="pf-range-val">{headlineFontSize}px</span>
                  </div>
                </div>
                <div className="pf-row">
                  <label>Letter Spacing</label>
                  <div className="pf-range-row">
                    <input type="range" min="0" max="800" step="10" value={headlineCharSpacing} onChange={(e) => setHeadlineCharSpacing(Number(e.target.value))} />
                    <span className="pf-range-val">{headlineCharSpacing}</span>
                  </div>
                </div>
                <div className="pf-row">
                  <label>Color</label>
                  <div className="pf-color-row">
                    <input type="color" value={headlineColor}
                      onChange={(e) => setHeadlineColor(e.target.value)} />
                    <input type="text" value={headlineColor}
                      onChange={(e) => setHeadlineColor(e.target.value)} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedType === EDIT_TYPES.HOST && (
            <div id="props-fields">
              <div className="pf-section">
                <div className="pf-section-title">Host Information</div>
                <div className="pf-row">
                  <label>Text</label>
                  <input type="text" value={hostText}
                    onChange={(e) => setHostText(e.target.value)} />
                </div>
                <div className="pf-row">
                  <label>Font Family</label>
                  <select value={hostFontFamily} onChange={(e) => setHostFontFamily(e.target.value)}>
                    {GOOGLE_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div className="pf-row">
                  <label>Font Style</label>
                  <FontStyleSelector weight={hostFontWeight} style={hostFontStyle} onChange={(w, s) => { setHostFontWeight(w); setHostFontStyle(s); }} />
                </div>
                <div className="pf-row">
                  <label>Font Size</label>
                  <div className="pf-range-row">
                    <input type="range" min="8" max="72" value={hostFontSize} onChange={(e) => setHostFontSize(Number(e.target.value))} />
                    <span className="pf-range-val">{hostFontSize}px</span>
                  </div>
                </div>
                <div className="pf-row">
                  <label>Letter Spacing</label>
                  <div className="pf-range-row">
                    <input type="range" min="0" max="800" step="10" value={hostCharSpacing} onChange={(e) => setHostCharSpacing(Number(e.target.value))} />
                    <span className="pf-range-val">{hostCharSpacing}</span>
                  </div>
                </div>
                <div className="pf-row">
                  <label>Color</label>
                  <div className="pf-color-row">
                    <input type="color" value={hostColor}
                      onChange={(e) => setHostColor(e.target.value)} />
                    <input type="text" value={hostColor}
                      onChange={(e) => setHostColor(e.target.value)} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedType === EDIT_TYPES.CHECKIN && (
            <div id="props-fields">
              <div className="pf-section">
                <div className="pf-section-title">Check-In / Out</div>
                <div className="pf-row">
                  <label>Text</label>
                  <input type="text" value={checkinText}
                    onChange={(e) => setCheckinText(e.target.value)} />
                </div>
                <div className="pf-row">
                  <label>Font Family</label>
                  <select value={checkinFontFamily} onChange={(e) => setCheckinFontFamily(e.target.value)}>
                    {GOOGLE_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div className="pf-row">
                  <label>Font Style</label>
                  <FontStyleSelector weight={checkinFontWeight} style={checkinFontStyle} onChange={(w, s) => { setCheckinFontWeight(w); setCheckinFontStyle(s); }} />
                </div>
                <div className="pf-row">
                  <label>Font Size</label>
                  <div className="pf-range-row">
                    <input type="range" min="8" max="72" value={checkinFontSize} onChange={(e) => setCheckinFontSize(Number(e.target.value))} />
                    <span className="pf-range-val">{checkinFontSize}px</span>
                  </div>
                </div>
                <div className="pf-row">
                  <label>Letter Spacing</label>
                  <div className="pf-range-row">
                    <input type="range" min="0" max="800" step="10" value={checkinCharSpacing} onChange={(e) => setCheckinCharSpacing(Number(e.target.value))} />
                    <span className="pf-range-val">{checkinCharSpacing}</span>
                  </div>
                </div>
                <div className="pf-row">
                  <label>Color</label>
                  <div className="pf-color-row">
                    <input type="color" value={checkinColor}
                      onChange={(e) => setCheckinColor(e.target.value)} />
                    <input type="text" value={checkinColor}
                      onChange={(e) => setCheckinColor(e.target.value)} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedType === EDIT_TYPES.WIFI_SSID && (
            <div id="props-fields">
              <div className="pf-section">
                <div className="pf-section-title">Wi-Fi Name</div>
                <div className="pf-row">
                  <label>Text</label>
                  <input type="text" value={wifiSsidText}
                    onChange={(e) => setWifiSsidText(e.target.value)} />
                </div>
                <div className="pf-row">
                  <label>Font Family</label>
                  <select value={wifiSsidFontFamily} onChange={(e) => setWifiSsidFontFamily(e.target.value)}>
                    {GOOGLE_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div className="pf-row">
                  <label>Font Style</label>
                  <FontStyleSelector weight={wifiSsidFontWeight} style={wifiSsidFontStyle} onChange={(w, s) => { setWifiSsidFontWeight(w); setWifiSsidFontStyle(s); }} />
                </div>
                <div className="pf-row">
                  <label>Font Size</label>
                  <div className="pf-range-row">
                    <input type="range" min="8" max="72" value={wifiSsidFontSize} onChange={(e) => setWifiSsidFontSize(Number(e.target.value))} />
                    <span className="pf-range-val">{wifiSsidFontSize}px</span>
                  </div>
                </div>
                <div className="pf-row">
                  <label>Letter Spacing</label>
                  <div className="pf-range-row">
                    <input type="range" min="0" max="800" step="10" value={wifiSsidCharSpacing} onChange={(e) => setWifiSsidCharSpacing(Number(e.target.value))} />
                    <span className="pf-range-val">{wifiSsidCharSpacing}</span>
                  </div>
                </div>
                <div className="pf-row">
                  <label>Color</label>
                  <div className="pf-color-row">
                    <input type="color" value={wifiSsidColor}
                      onChange={(e) => setWifiSsidColor(e.target.value)} />
                    <input type="text" value={wifiSsidColor}
                      onChange={(e) => setWifiSsidColor(e.target.value)} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedType === EDIT_TYPES.WIFI_PASS && (
            <div id="props-fields">
              <div className="pf-section">
                <div className="pf-section-title">Wi-Fi Password</div>
                <div className="pf-row">
                  <label>Text</label>
                  <input type="text" value={wifiPassText}
                    onChange={(e) => setWifiPassText(e.target.value)} />
                </div>
                <div className="pf-row">
                  <label>Font Family</label>
                  <select value={wifiPassFontFamily} onChange={(e) => setWifiPassFontFamily(e.target.value)}>
                    {GOOGLE_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div className="pf-row">
                  <label>Font Style</label>
                  <FontStyleSelector weight={wifiPassFontWeight} style={wifiPassFontStyle} onChange={(w, s) => { setWifiPassFontWeight(w); setWifiPassFontStyle(s); }} />
                </div>
                <div className="pf-row">
                  <label>Font Size</label>
                  <div className="pf-range-row">
                    <input type="range" min="8" max="72" value={wifiPassFontSize} onChange={(e) => setWifiPassFontSize(Number(e.target.value))} />
                    <span className="pf-range-val">{wifiPassFontSize}px</span>
                  </div>
                </div>
                <div className="pf-row">
                  <label>Letter Spacing</label>
                  <div className="pf-range-row">
                    <input type="range" min="0" max="800" step="10" value={wifiPassCharSpacing} onChange={(e) => setWifiPassCharSpacing(Number(e.target.value))} />
                    <span className="pf-range-val">{wifiPassCharSpacing}</span>
                  </div>
                </div>
                <div className="pf-row">
                  <label>Color</label>
                  <div className="pf-color-row">
                    <input type="color" value={wifiPassColor}
                      onChange={(e) => setWifiPassColor(e.target.value)} />
                    <input type="text" value={wifiPassColor}
                      onChange={(e) => setWifiPassColor(e.target.value)} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedType === EDIT_TYPES.RULES && (
            <div id="props-fields">
              <div className="pf-section">
                <div className="pf-section-title">Rules Text</div>
                <div className="pf-row">
                  <label>Text</label>
                  <textarea value={rulesText} onChange={(e) => setRulesText(e.target.value)}
                    style={{
                      width: '100%', background: 'var(--input-bg)', border: '1px solid var(--input-border)',
                      borderRadius: '5px', color: 'var(--spotify-text)', padding: '5px 8px', fontSize: '11px',
                      fontFamily: 'inherit', minHeight: '90px', resize: 'vertical', outline: 'none'
                    }}
                  />
                </div>
                <div className="pf-row">
                  <label>Font Family</label>
                  <select value={rulesFontFamily} onChange={(e) => setRulesFontFamily(e.target.value)}>
                    {GOOGLE_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div className="pf-row">
                  <label>Font Style</label>
                  <FontStyleSelector weight={rulesFontWeight} style={rulesFontStyle} onChange={(w, s) => { setRulesFontWeight(w); setRulesFontStyle(s); }} />
                </div>
                <div className="pf-row">
                  <label>Font Size</label>
                  <div className="pf-range-row">
                    <input type="range" min="8" max="72" value={rulesFontSize} onChange={(e) => setRulesFontSize(Number(e.target.value))} />
                    <span className="pf-range-val">{rulesFontSize}px</span>
                  </div>
                </div>
                <div className="pf-row">
                  <label>Letter Spacing</label>
                  <div className="pf-range-row">
                    <input type="range" min="0" max="800" step="10" value={rulesCharSpacing} onChange={(e) => setRulesCharSpacing(Number(e.target.value))} />
                    <span className="pf-range-val">{rulesCharSpacing}</span>
                  </div>
                </div>
                <div className="pf-row">
                  <label>Color</label>
                  <div className="pf-color-row">
                    <input type="color" value={rulesColor}
                      onChange={(e) => setRulesColor(e.target.value)} />
                    <input type="text" value={rulesColor}
                      onChange={(e) => setRulesColor(e.target.value)} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedType === EDIT_TYPES.FOOTER && (
            <div id="props-fields">
              <div className="pf-section">
                <div className="pf-section-title">Emergency / Footer</div>
                <div className="pf-row">
                  <label>Text</label>
                  <input type="text" value={footerText}
                    onChange={(e) => setFooterText(e.target.value)} />
                </div>
                <div className="pf-row">
                  <label>Font Family</label>
                  <select value={footerFontFamily} onChange={(e) => setFooterFontFamily(e.target.value)}>
                    {GOOGLE_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div className="pf-row">
                  <label>Font Style</label>
                  <FontStyleSelector weight={footerFontWeight} style={footerFontStyle} onChange={(w, s) => { setFooterFontWeight(w); setFooterFontStyle(s); }} />
                </div>
                <div className="pf-row">
                  <label>Font Size</label>
                  <div className="pf-range-row">
                    <input type="range" min="8" max="72" value={footerFontSize} onChange={(e) => setFooterFontSize(Number(e.target.value))} />
                    <span className="pf-range-val">{footerFontSize}px</span>
                  </div>
                </div>
                <div className="pf-row">
                  <label>Letter Spacing</label>
                  <div className="pf-range-row">
                    <input type="range" min="0" max="800" step="10" value={footerCharSpacing} onChange={(e) => setFooterCharSpacing(Number(e.target.value))} />
                    <span className="pf-range-val">{footerCharSpacing}</span>
                  </div>
                </div>
                <div className="pf-row">
                  <label>Color</label>
                  <div className="pf-color-row">
                    <input type="color" value={footerColor}
                      onChange={(e) => setFooterColor(e.target.value)} />
                    <input type="text" value={footerColor}
                      onChange={(e) => setFooterColor(e.target.value)} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedType === 'group' && (
            <div id="props-fields">
              <div className="pf-section">
                <div className="pf-section-title">Group Properties</div>
              </div>
            </div>
          )}

          {selectedType === 'multi' && (
            <div id="props-fields">
              <div className="pf-section">
                <div className="pf-section-title">Multiple Selection</div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="sw-toast">Done</div>
    </div>
  );
}
