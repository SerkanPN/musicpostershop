import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import jsPDF from 'jspdf';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ModernStudioLayout, { PresetItem } from '../../components/ModernStudioLayout';
import { POSTER_PRESETS } from '../../lib/presets';
import { Sparkles, Home, Wifi, Check, Palette, Type } from 'lucide-react';

const AIRBNB_PRESETS_DATA: Record<string, any> = {
  'cozy-beach-house': {
    houseName: 'THE DRIFTWOOD VILLA',
    location: 'MALIBU, CALIFORNIA',
    wifiNetwork: 'Driftwood_Guest_5G',
    wifiPassword: 'oceanbreeze2026',
    checkInOut: 'CHECK-IN: 3:00 PM  •  CHECK-OUT: 11:00 AM',
    houseRules: '1. NO SMOKING INDOORS\n2. QUIET HOURS AFTER 10:00 PM\n3. RINSE SAND AT OUTDOOR SHOWER\n4. MAKE YOURSELF AT HOME & ENJOY THE SUNSET',
    emergencyContact: 'HOST: SARAH (+1 310-555-0199)',
    bgColor: '#faf8f5',
    textColor: '#1c1917',
    subColor: '#78716c',
    badgeColor: '#0284c7'
  }
};

export default function AirbnbEditor() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const presetParam = searchParams.get('preset') || 'cozy-beach-house';

  const [activePreset, setActivePreset] = useState<string>(presetParam);
  const initial = AIRBNB_PRESETS_DATA[presetParam] || AIRBNB_PRESETS_DATA['cozy-beach-house'];

  const [houseName, setHouseName] = useState(initial.houseName);
  const [location, setLocation] = useState(initial.location);
  const [wifiNetwork, setWifiNetwork] = useState(initial.wifiNetwork);
  const [wifiPassword, setWifiPassword] = useState(initial.wifiPassword);
  const [checkInOut, setCheckInOut] = useState(initial.checkInOut);
  const [houseRules, setHouseRules] = useState(initial.houseRules);
  const [emergencyContact, setEmergencyContact] = useState(initial.emergencyContact);

  const [bgColor, setBgColor] = useState(initial.bgColor);
  const [textColor, setTextColor] = useState(initial.textColor);
  const [subColor, setSubColor] = useState(initial.subColor);
  const [badgeColor, setBadgeColor] = useState(initial.badgeColor);

  const [zoom, setZoom] = useState(1);
  const [printSize, setPrintSize] = useState('18x24');
  const [isExporting, setIsExporting] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Inter:wght@400;600;700;800&family=Space+Mono:wght@400;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  const handlePresetSelect = (id: string) => {
    setActivePreset(id);
    const data = AIRBNB_PRESETS_DATA[id];
    if (data) {
      setHouseName(data.houseName);
      setLocation(data.location);
      setWifiNetwork(data.wifiNetwork);
      setWifiPassword(data.wifiPassword);
      setCheckInOut(data.checkInOut);
      setHouseRules(data.houseRules);
      setEmergencyContact(data.emergencyContact);
      setBgColor(data.bgColor);
      setTextColor(data.textColor);
      setSubColor(data.subColor);
      setBadgeColor(data.badgeColor);
    } else {
      const general = (POSTER_PRESETS.AIRBNB as any[]).find(p => p.id === id);
      if (general) {
        setHouseName(general.label.toUpperCase());
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

    // Background
    canvas.add(new fabric.Rect({
      left: 0, top: 0, width: w, height: h, fill: bgColor, selectable: false
    }));

    // Inset Margin Border
    canvas.add(new fabric.Rect({
      left: 36, top: 36, width: w - 72, height: h - 72, fill: 'transparent',
      stroke: textColor, strokeWidth: 0.5, opacity: 0.2, selectable: false
    }));

    let curY = 60;

    // Header Tag
    canvas.add(new fabric.Textbox('WELCOME TO OUR RETREAT', {
      left: w / 2, top: curY, width: w - 100, originX: 'center', textAlign: 'center',
      fontSize: 9.5, fontWeight: 700, fill: subColor, fontFamily: 'Inter, sans-serif',
      charSpacing: 220, selectable: false
    }));
    curY += 24;

    const houseEl = new fabric.Textbox(houseName.toUpperCase(), {
      left: w / 2, top: curY, width: w - 100, originX: 'center', textAlign: 'center',
      fontSize: 28, fontWeight: 700, fill: textColor, fontFamily: 'Playfair Display, serif',
      charSpacing: 80, selectable: false
    });
    canvas.add(houseEl);
    curY += houseEl.height + 4;

    canvas.add(new fabric.Textbox(location.toUpperCase(), {
      left: w / 2, top: curY, width: w - 100, originX: 'center', textAlign: 'center',
      fontSize: 10, fontWeight: 600, fill: subColor, fontFamily: 'Inter, sans-serif',
      charSpacing: 160, selectable: false
    }));
    curY += 28;

    // Wi-Fi Box Card
    const cardW = 460;
    const cardH = 110;
    const cardX = (w - cardW) / 2;

    canvas.add(new fabric.Rect({
      left: cardX, top: curY, width: cardW, height: cardH, rx: 12, ry: 12,
      fill: '#f3f4f6', stroke: '#e5e7eb', strokeWidth: 1, selectable: false
    }));

    canvas.add(new fabric.Textbox('FAST WI-FI ACCESS', {
      left: cardX + 24, top: curY + 18, fontSize: 10, fontWeight: 800,
      fill: badgeColor, fontFamily: 'Inter, sans-serif', charSpacing: 140, selectable: false
    }));

    canvas.add(new fabric.Textbox(`NETWORK:  ${wifiNetwork}`, {
      left: cardX + 24, top: curY + 44, fontSize: 13, fontWeight: 700,
      fill: '#111827', fontFamily: 'Space Mono, monospace', selectable: false
    }));

    canvas.add(new fabric.Textbox(`PASSWORD: ${wifiPassword}`, {
      left: cardX + 24, top: curY + 70, fontSize: 13, fontWeight: 700,
      fill: '#111827', fontFamily: 'Space Mono, monospace', selectable: false
    }));

    curY += cardH + 28;

    // Check-in / Out Banner
    canvas.add(new fabric.Textbox(checkInOut.toUpperCase(), {
      left: w / 2, top: curY, width: w - 100, originX: 'center', textAlign: 'center',
      fontSize: 9.5, fontWeight: 700, fill: textColor, fontFamily: 'Inter, sans-serif',
      charSpacing: 100, selectable: false
    }));
    curY += 24;

    canvas.add(new fabric.Line([45, curY, w - 45, curY], {
      stroke: textColor, strokeWidth: 0.5, opacity: 0.25, selectable: false
    }));
    curY += 20;

    // House Rules Section
    canvas.add(new fabric.Textbox('HOUSE GUIDELINES & COURTESY', {
      left: 65, top: curY, fontSize: 10, fontWeight: 800, fill: subColor,
      fontFamily: 'Inter, sans-serif', charSpacing: 140, selectable: false
    }));
    curY += 24;

    const rulesEl = new fabric.Textbox(houseRules, {
      left: 65, top: curY, width: w - 130, fontSize: 11, lineHeight: 1.6,
      fill: textColor, fontFamily: 'Inter, sans-serif', selectable: false
    });
    canvas.add(rulesEl);
    curY += rulesEl.height + 32;

    // Footer Emergency Contact
    canvas.add(new fabric.Textbox(emergencyContact.toUpperCase(), {
      left: w / 2, top: curY, width: w - 100, originX: 'center', textAlign: 'center',
      fontSize: 9.5, fontWeight: 700, fill: subColor, fontFamily: 'Inter, sans-serif',
      charSpacing: 120, selectable: false
    }));

    canvas.renderAll();
  };

  useEffect(() => {
    renderCanvas();
  }, [houseName, location, wifiNetwork, wifiPassword, checkInOut, houseRules, emergencyContact, bgColor, textColor, subColor, badgeColor]);

  const handleDownloadPNG = () => {
    if (!fabricRef.current) return;
    setIsExporting(true);
    const dataUrl = fabricRef.current.toDataURL({ format: 'png', multiplier: 3 });
    const link = document.createElement('a');
    link.download = `airbnb-poster-${activePreset}.png`;
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
    pdf.save(`airbnb-poster-300dpi-${activePreset}.pdf`);
    setIsExporting(false);
  };

  const airbnbPresetsList: PresetItem[] = (POSTER_PRESETS.AIRBNB as any[]).map(p => ({
    id: p.id,
    title: p.label,
    label: p.category
  }));

  const sidebar = (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
        <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          Choose Villa Preset ({airbnbPresetsList.length})
        </label>
        <select
          value={activePreset}
          onChange={e => handlePresetSelect(e.target.value)}
          className="w-full bg-[#18191c] border border-neutral-700 rounded-lg px-3 py-2.5 text-xs text-white focus:border-blue-500 outline-none"
        >
          {airbnbPresetsList.map(p => (
            <option key={p.id} value={p.id}>
              {p.title} ({p.label})
            </option>
          ))}
        </select>
      </div>

      <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
        <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
          <Home className="w-3.5 h-3.5 text-emerald-400" />
          Villa & Wi-Fi Details
        </label>

        <div>
          <span className="text-[10px] text-neutral-500 uppercase font-semibold">House / Retreat Name</span>
          <input
            type="text"
            value={houseName}
            onChange={e => setHouseName(e.target.value)}
            className="w-full bg-[#18191c] border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white font-semibold focus:border-blue-500 outline-none mt-1"
          />
        </div>

        <div>
          <span className="text-[10px] text-neutral-500 uppercase font-semibold">Wi-Fi Network Name</span>
          <input
            type="text"
            value={wifiNetwork}
            onChange={e => setWifiNetwork(e.target.value)}
            className="w-full bg-[#18191c] border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-blue-500 outline-none mt-1"
          />
        </div>

        <div>
          <span className="text-[10px] text-neutral-500 uppercase font-semibold">Wi-Fi Password</span>
          <input
            type="text"
            value={wifiPassword}
            onChange={e => setWifiPassword(e.target.value)}
            className="w-full bg-[#18191c] border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white font-mono focus:border-blue-500 outline-none mt-1"
          />
        </div>

        <div>
          <span className="text-[10px] text-neutral-500 uppercase font-semibold">House Rules</span>
          <textarea
            value={houseRules}
            onChange={e => setHouseRules(e.target.value)}
            rows={4}
            className="w-full bg-[#18191c] border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:border-blue-500 outline-none mt-1 resize-none"
          />
        </div>
      </div>
    </div>
  );

  return (
    <ModernStudioLayout
      title="Villa & Airbnb Welcome Studio"
      category="Hospitality Art"
      onBack={() => navigate('/')}
      onDownloadPNG={handleDownloadPNG}
      onDownloadPDF={handleDownloadPDF}
      isExporting={isExporting}
      presets={airbnbPresetsList}
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
