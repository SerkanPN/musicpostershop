import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as fabric from 'fabric';
import jsPDF from 'jspdf';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  MessageSquare, 
  RefreshCw, 
  Download, 
  Search, 
  CheckCircle, 
  Lock, 
  Unlock, 
  AlertTriangle, 
  LogOut, 
  Eye, 
  ArrowRight,
  TrendingUp,
  Activity,
  FileText
} from 'lucide-react';
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

const BASE_MAX_W = 600;
const BASE_MAX_H = 800;

interface EtsyOrder {
  id: string;
  status: string;
  design_state: any;
  created_at: string;
  download_started_at: string | null;
}

interface SupportTicket {
  id: string;
  order_id: string;
  message: string;
  status: string;
  reply: string | null;
  created_at: string;
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

function generateAestheticPeaks(count: number): number[] {
  const peaks: number[] = [];
  for (let i = 0; i < count; i++) {
    const x = i / (count - 1);
    let envelope = Math.sin(x * Math.PI); 
    envelope = Math.pow(envelope, 0.6); 
    const noise1 = Math.random();
    const noise2 = Math.random() * Math.random(); 
    const spike = Math.random() > 0.92 ? Math.random() : 0;
    let val = (noise1 * 0.3 + noise2 * 0.6 + spike * 0.4) * envelope;
    val = Math.max(0.02, Math.min(1, val));
    peaks.push(val);
  }
  return peaks;
}

export default function AdminPortal() {
  const [isAuth, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('admin_session') === 'active';
  });
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');

  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'tickets' | 'reconstructor'>('dashboard');

  const [orders, setOrders] = useState<EtsyOrder[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    completedOrders: 0,
    activeTickets: 0,
    lockedOrders: 0
  });

  const [ordersSearch, setOrdersSearch] = useState<string>('');
  const [ticketsSearch, setTicketsSearch] = useState<string>('');

  const [selectedOrderJSON, setSelectedOrderJSON] = useState<any>(null);
  const [replyTicketId, setReplyTicketId] = useState<string | null>(null);
  const [ticketReplyText, setSupportReplyText] = useState<string>('');
  const [submittingReply, setSubmittingTicketReply] = useState<boolean>(false);

  const [reconstructToken, setReconstructToken] = useState<string>('');
  const [reconstructedState, setReconstructedState] = useState<any>(null);
  const [reconstructLoading, setReconstructLoading] = useState<boolean>(false);

  const [zoom, setZoom] = useState<number>(1);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('landscape');
  const [canvasSize, setCanvasSize] = useState<string>('30x40');
  const [containerDims, setContainerDims] = useState({ width: 400, height: 300 });

  const canvasElRef = useRef<HTMLCanvasElement | null>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const bgRectRef = useRef<fabric.Rect | null>(null);
  const wavePathRef = useRef<fabric.Path | null>(null);
  const qrCodeRef = useRef<fabric.Image | null>(null);

  const [toast, setToast] = useState<string>('');

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2200);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'SerkanPN' && password === 'SerkanPN') {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_session', 'active');
      setAuthError('');
    } else {
      setAuthError('Invalid credentials');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_session');
  };

  const fetchData = async () => {
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from('etsy_orders')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: ticketsData, error: ticketsError } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;
      if (ticketsError) throw ticketsError;

      setOrders(ordersData || []);
      setTickets(ticketsData || []);

      const activeT = (ticketsData || []).filter(t => t.status !== 'resolved').length;
      const completedO = (ordersData || []).filter(o => o.status === 'completed').length;
      const lockedO = (ordersData || []).filter(o => o.status === 'completed').length;

      setStats({
        totalOrders: ordersData?.length || 0,
        completedOrders: completedO,
        activeTickets: activeT,
        lockedOrders: lockedO
      });

    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isAuth) {
      fetchData();
    }
  }, [isAuth]);

  const handleUnlockOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('etsy_orders')
        .update({ status: 'pending', download_started_at: null })
        .eq('id', orderId);

      if (error) throw error;
      showToast('Order unlocked successfully');
      fetchData();
    } catch (err) {
      showToast('Unlock action failed');
    }
  };

  const handleReplySubmit = async () => {
    if (!replyTicketId || !ticketReplyText.trim()) return;
    setSubmittingTicketReply(true);
    
    const targetId = isNaN(Number(replyTicketId)) ? replyTicketId : Number(replyTicketId);

    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({
          status: 'resolved',
          reply: ticketReplyText.trim()
        })
        .eq('id', targetId);

      if (error) throw error;

      showToast('Reply submitted and ticket marked resolved');
      setReplyTicketId(null);
      setSupportReplyText('');
      fetchData();
    } catch (err) {
      showToast('Reply submission failed');
    } finally {
      setSubmittingTicketReply(false);
    }
  };

  const loadReconstructState = async () => {
    if (!reconstructToken.trim()) return;
    setReconstructLoading(true);
    try {
      const { data, error } = await supabase
        .from('etsy_orders')
        .select('*')
        .eq('id', reconstructToken.trim())
        .single();

      if (error || !data) {
        showToast('Design not found for this token.');
        setReconstructedState(null);
        return;
      }

      if (!data.design_state) {
        showToast('No saved layout inside this order.');
        setReconstructedState(null);
        return;
      }

      setReconstructedState(data.design_state);
      setCanvasSize(data.design_state.canvasSize || '30x40');
      setOrientation(data.design_state.orientation || 'landscape');
      
      const { w, h } = parseAndOrientSize(data.design_state.canvasSize || '30x40', data.design_state.orientation || 'landscape');
      setContainerDims(fitContain(w, h, BASE_MAX_W, BASE_MAX_H));
      showToast('Layout state loaded.');
    } catch (err) {
      showToast('Fetch error.');
    } finally {
      setReconstructLoading(false);
    }
  };

  const getGradient = (width: number, height: number, ds: any) => {
    const rad = (ds.waveGradientAngle * Math.PI) / 180;
    const x1 = (width / 2) - Math.cos(rad) * (width / 2);
    const y1 = (height / 2) - Math.sin(rad) * (height / 2);
    const x2 = (width / 2) + Math.cos(rad) * (width / 2);
    const y2 = (height / 2) + Math.sin(rad) * (height / 2);

    const activeColors = ds.waveGradientColors.slice(0, ds.waveGradientStops);
    const colorStops = activeColors.map((color: string, i: number) => ({
      offset: i / (activeColors.length - 1),
      color: color
    }));

    return new fabric.Gradient({
      type: 'linear',
      coords: { x1, y1, x2, y2 },
      colorStops
    });
  };

  const renderReconstructionOnCanvas = () => {
    if (!canvasElRef.current || !reconstructedState) return;

    const ds = reconstructedState;
    const dims = containerDims;

    const canvas = new fabric.Canvas(canvasElRef.current, {
      width: dims.width,
      height: dims.height,
      backgroundColor: ds.bgColor,
      selection: false,
    });
    fabricRef.current = canvas;

    const bgRect = new fabric.Rect({
      left: 0,
      top: 0,
      width: dims.width,
      height: dims.height,
      fill: ds.bgColor,
      selectable: false,
      evented: false,
    });
    canvas.add(bgRect);
    bgRectRef.current = bgRect;

    const cy = dims.height / 2;
    const cw = dims.width;
    const yOffset = ds.showQR ? -(ds.qrSize + 15) : 0;

    const topLeft = new fabric.IText(ds.topLeftText, {
      left: cw * 0.08,
      top: dims.height * 0.08,
      fontSize: 12,
      fontFamily: ds.topLeftFontFamily,
      fontWeight: ds.topLeftFontWeight,
      fontStyle: ds.topLeftFontStyle,
      fill: ds.topLeftColor,
      charSpacing: ds.topLeftCharSpacing,
      selectable: false
    });
    canvas.add(topLeft);

    const topRight = new fabric.IText(ds.topRightText, {
      left: cw * 0.92,
      top: dims.height * 0.08,
      originX: 'right',
      fontSize: 12,
      fontFamily: ds.topRightFontFamily,
      fontWeight: ds.topRightFontWeight,
      fontStyle: ds.topRightFontStyle,
      fill: ds.topRightColor,
      charSpacing: ds.topRightCharSpacing,
      selectable: false
    });
    canvas.add(topRight);

    const mainTitle = new fabric.Textbox(ds.mainTitleText, {
      left: cw / 2,
      top: cy + 100 + yOffset,
      width: cw * 0.8,
      originX: 'center',
      textAlign: 'center',
      fontSize: ds.mainTitleFontSize,
      fontFamily: ds.mainTitleFontFamily,
      fontWeight: ds.mainTitleFontWeight,
      fontStyle: ds.mainTitleFontStyle,
      fill: ds.mainTitleColor,
      charSpacing: ds.mainTitleCharSpacing,
      selectable: false
    });
    canvas.add(mainTitle);

    const subTitle = new fabric.Textbox(ds.subTitleText, {
      left: cw / 2,
      top: cy + 130 + yOffset,
      width: cw * 0.8,
      originX: 'center',
      textAlign: 'center',
      fontSize: ds.subTitleFontSize,
      fontFamily: ds.subTitleFontFamily,
      fontWeight: ds.subTitleFontWeight,
      fontStyle: ds.subTitleFontStyle,
      fill: ds.subTitleColor,
      charSpacing: ds.subTitleCharSpacing,
      selectable: false
    });
    canvas.add(subTitle);

    const divider = new fabric.Line([cw * 0.35, cy + 155 + yOffset, cw * 0.65, cy + 155 + yOffset], {
      stroke: ds.dividerColor,
      strokeWidth: 1,
      selectable: false
    });
    canvas.add(divider);

    const bottom1 = new fabric.Textbox(ds.bottom1Text, {
      left: cw / 2,
      top: cy + 175 + yOffset,
      width: cw * 0.8,
      originX: 'center',
      textAlign: 'center',
      fontSize: ds.bottom1FontSize,
      fontFamily: ds.bottom1FontFamily,
      fontWeight: ds.bottom1FontWeight,
      fontStyle: ds.bottom1FontStyle,
      fill: ds.bottom1Color,
      charSpacing: ds.bottom1CharSpacing,
      selectable: false
    });
    canvas.add(bottom1);

    const bottom2 = new fabric.Textbox(ds.bottom2Text, {
      left: cw / 2,
      top: cy + 195 + yOffset,
      width: cw * 0.8,
      originX: 'center',
      textAlign: 'center',
      fontSize: ds.bottom2FontSize,
      fontFamily: ds.bottom2FontFamily,
      fontWeight: ds.bottom2FontWeight,
      fontStyle: ds.bottom2FontStyle,
      fill: ds.bottom2Color,
      charSpacing: ds.bottom2CharSpacing,
      selectable: false
    });
    canvas.add(bottom2);

    const peaks = generateAestheticPeaks(ds.waveDensity);
    const totalWidth = dims.width * (ds.waveWidthScale / 100);
    const step = totalWidth / ds.waveDensity;
    const maxHeight = dims.height * (ds.waveHeightScale / 100);

    let pathString = '';
    for(let i=0; i<ds.waveDensity; i++) {
        const x = i * step;
        const h = peaks[i] * maxHeight;
        pathString += `M ${x} ${-h/2} L ${x} ${h/2} `;
    }

    const wavePath = new fabric.Path(pathString, {
        strokeWidth: ds.waveThickness,
        fill: '',
        strokeLineCap: 'round',
        strokeLineJoin: 'round',
        originX: 'center',
        originY: 'center',
        left: dims.width / 2,
        top: dims.height * 0.40, 
        objectCaching: false,
        selectable: false
    });

    if (ds.waveFillType === 'solid') {
      wavePath.set({ stroke: ds.waveSolidColor });
    } else {
      const bound = wavePath.getBoundingRect();
      wavePath.set({ stroke: getGradient(bound.width, bound.height, ds) });
    }
    
    canvas.add(wavePath);
    wavePathRef.current = wavePath;

    if (ds.showQR && ds.qrLink) {
      const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(ds.qrLink)}`;
      fabric.Image.fromURL(apiUrl, { crossOrigin: 'anonymous' }).then((img) => {
        img.set({
          left: dims.width / 2,
          top: (dims.height / 2) + 195,
          originX: 'center',
          originY: 'center',
          scaleX: ds.qrSize / img.width!,
          scaleY: ds.qrSize / img.height!,
          selectable: false
        });
        canvas.add(img);
        qrCodeRef.current = img;
        canvas.renderAll();
      });
    }

    canvas.renderAll();
  };

  useEffect(() => {
    if (activeTab === 'reconstructor' && reconstructedState) {
      renderReconstructionOnCanvas();
    }
  }, [activeTab, reconstructedState, containerDims]);

  const downloadReconstructedPoster = (format: 'png' | 'pdf' | 'svg') => {
    const canvas = fabricRef.current;
    if (!canvas || !reconstructedState) return;

    const multiplier = getMultiplier();
    const { w, h } = parseAndOrientSize(canvasSize, orientation);

    if (format === 'png') {
      const dataUrl = canvas.toDataURL({ format: 'png', multiplier });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `soundwave-poster-${reconstructToken}.png`;
      a.click();
    } else if (format === 'pdf') {
      const dataUrl = canvas.toDataURL({ format: 'png', multiplier });
      const pdf = new jsPDF({ orientation: w > h ? 'landscape' : 'portrait', unit: 'in', format: [w, h] });
      pdf.addImage(dataUrl, 'PNG', 0, 0, w, h);
      pdf.save(`soundwave-poster-${reconstructToken}.pdf`);
    } else if (format === 'svg') {
      const svg = canvas.toSVG();
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `soundwave-poster-${reconstructToken}.svg`;
      a.click();
      URL.revokeObjectURL(url);
    }
    showToast('Download complete');
  };

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(ordersSearch.toLowerCase()) ||
    (o.design_state?.mainTitleText || '').toLowerCase().includes(ordersSearch.toLowerCase())
  );

  const filteredTickets = tickets.filter(t => 
    t.order_id.toLowerCase().includes(ticketsSearch.toLowerCase()) ||
    t.message.toLowerCase().includes(ticketsSearch.toLowerCase())
  );

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6 font-sans">
        <form onSubmit={handleLogin} className="w-full max-w-md bg-zinc-900 border border-zinc-800 p-8 rounded-3xl shadow-2xl flex flex-col gap-6">
          <div className="text-center">
            <h1 className="text-2xl font-black uppercase tracking-tight text-white mb-1">Admin Portal</h1>
            <p className="text-zinc-500 text-xs">Enter credentials to unlock operations dashboard</p>
          </div>
          {authError && (
            <div className="bg-red-950/30 border border-red-900 text-red-400 p-3 rounded-xl text-xs font-semibold text-center">
              {authError}
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">Username</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs outline-none text-zinc-100"
              required 
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs outline-none text-zinc-100"
              required 
            />
          </div>
          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer mt-2">
            Unlock Dashboard
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans flex">
      <style>{`
        .admin-sidebar {
          width: 240px; min-width: 240px; background: #0c0c0e; border-right: 1px solid #1a1a1e;
        }
        .admin-content {
          flex: 1; overflow-y: auto; padding: 40px;
        }
        .sidebar-link {
          display: flex; align-items: center; gap: 12px; padding: 12px 20px; font-size: 13px; font-weight: 700;
          color: #a1a1aa; border-left: 3px solid transparent; transition: all 0.2s; cursor: pointer;
        }
        .sidebar-link:hover, .sidebar-link.active {
          color: #fff; background: #18181b; border-left-color: #6366f1;
        }
        .admin-card {
          background: #111115; border: 1px solid #1e1e24; border-radius: 20px; padding: 24px;
        }
        .admin-table {
          width: 100%; border-collapse: collapse; text-align: left; font-size: 13px;
        }
        .admin-table th {
          padding: 14px; border-bottom: 1px solid #1a1a1e; color: #a1a1aa; font-weight: 800; font-size: 10px; text-transform: uppercase; tracking-wider;
        }
        .admin-table td {
          padding: 14px; border-bottom: 1px solid #16161a;
        }
        .status-pill {
          display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 999px; font-size: 10px; font-weight: 900; text-transform: uppercase;
        }
        .status-pill.completed { background: rgba(16,185,129,0.1); color: #10b981; border: 1px solid rgba(16,185,129,0.2); }
        .status-pill.pending { background: rgba(245,158,11,0.1); color: #f59e0b; border: 1px solid rgba(245,158,11,0.2); }
        .status-pill.resolved { background: rgba(59,130,246,0.1); color: #3b82f6; border: 1px solid rgba(59,130,246,0.2); }
        .status-pill.open { background: rgba(239,68,68,0.1); color: #ef4444; border: 1px solid rgba(239,68,68,0.2); }

        .json-modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(10px);
          display: flex; align-items: center; justify-content: center; z-index: 1000; p: 20px;
        }
        .json-modal-content {
          background: #111115; border: 1px solid #1e1e24; border-radius: 24px; max-width: 600px; width: 100%; max-height: 80vh; display: flex; flex-direction: column; overflow: hidden;
        }
        .sw-toast {
          position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%) translateY(20px);
          background: #6366f1; color: #fff; padding: 10px 20px; border-radius: 24px;
          font-size: 13px; font-weight: 600; opacity: 0; transition: all 0.3s; z-index: 9999; pointer-events: none;
        }
        .sw-toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
      `}</style>

      {/* SIDEBAR NAVIGATION */}
      <div className="admin-sidebar flex flex-col justify-between py-8">
        <div>
          <div className="px-6 mb-10 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Lock className="w-4 h-4 text-indigo-400" />
            </div>
            <span className="font-black text-sm uppercase tracking-wider">Console</span>
          </div>

          <div className="flex flex-col">
            <div 
              onClick={() => setActiveTab('dashboard')} 
              className={`sidebar-link ${activeTab === 'dashboard' ? 'active' : ''}`}
            >
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </div>
            <div 
              onClick={() => setActiveTab('orders')} 
              className={`sidebar-link ${activeTab === 'orders' ? 'active' : ''}`}
            >
              <ShoppingBag className="w-4 h-4" /> Etsy Orders
            </div>
            <div 
              onClick={() => setActiveTab('tickets')} 
              className={`sidebar-link ${activeTab === 'tickets' ? 'active' : ''}`}
            >
              <MessageSquare className="w-4 h-4" /> Support Tickets
            </div>
            <div 
              onClick={() => setActiveTab('reconstructor')} 
              className={`sidebar-link ${activeTab === 'reconstructor' ? 'active' : ''}`}
            >
              <RefreshCw className="w-4 h-4" /> Reconstructor
            </div>
          </div>
        </div>

        <div className="px-6">
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white py-3 rounded-xl text-xs font-bold uppercase transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </div>

      {/* CORE PAGES CONTAINER */}
      <div className="admin-content">
        
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="flex flex-col gap-10">
            <div>
              <h1 className="text-3xl font-black uppercase mb-1">System Overview</h1>
              <p className="text-zinc-500 text-xs font-bold uppercase">Real-time stats from musicposters.shop database</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="admin-card flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Total Etsy Orders</span>
                  <span className="text-3xl font-black">{stats.totalOrders}</span>
                </div>
                <ShoppingBag className="w-8 h-8 text-indigo-500/50" />
              </div>
              <div className="admin-card flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Finalized Designs</span>
                  <span className="text-3xl font-black text-emerald-400">{stats.completedOrders}</span>
                </div>
                <CheckCircle className="w-8 h-8 text-emerald-500/50" />
              </div>
              <div className="admin-card flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Locked Posters</span>
                  <span className="text-3xl font-black text-red-400">{stats.lockedOrders}</span>
                </div>
                <Lock className="w-8 h-8 text-red-500/50" />
              </div>
              <div className="admin-card flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Active Tickets</span>
                  <span className="text-3xl font-black text-amber-400">{stats.activeTickets}</span>
                </div>
                <MessageSquare className="w-8 h-8 text-amber-500/50" />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="admin-card">
                <h3 className="text-sm font-black uppercase mb-6 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-400" /> Recent Activity Log
                </h3>
                <div className="flex flex-col gap-4">
                  {orders.slice(0, 5).map(o => (
                    <div key={o.id} className="flex items-center justify-between border-b border-zinc-900 pb-3 text-xs">
                      <div>
                        <span className="font-bold text-zinc-200">Sipariş {o.id}</span>
                        <span className="text-zinc-500 block">Created: {new Date(o.created_at).toLocaleString()}</span>
                      </div>
                      <span className={`status-pill ${o.status}`}>{o.status}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="admin-card">
                <h3 className="text-sm font-black uppercase mb-6 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-amber-400" /> Urgent Tickets
                </h3>
                <div className="flex flex-col gap-4">
                  {tickets.filter(t => t.status !== 'resolved').slice(0, 5).map(t => (
                    <div key={t.id} className="flex items-start justify-between border-b border-zinc-900 pb-3 text-xs">
                      <div>
                        <span className="font-bold text-zinc-200">Sipariş {t.order_id}</span>
                        <p className="text-zinc-400 mt-1 max-w-sm truncate">{t.message}</p>
                      </div>
                      <button 
                        onClick={() => { setActiveTab('tickets'); setTicketsSearch(t.order_id); }}
                        className="flex items-center gap-1 text-indigo-400 hover:text-white transition-colors cursor-pointer"
                      >
                        Reply <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {tickets.filter(t => t.status !== 'resolved').length === 0 && (
                    <p className="text-xs text-zinc-500 text-center py-6">All support tickets have been resolved.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-black uppercase mb-1">Etsy Orders</h1>
                <p className="text-zinc-500 text-xs font-bold uppercase">View order statuses, inspect JSON states, and unlock designs</p>
              </div>

              <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 items-center gap-2 w-64">
                <Search className="w-4 h-4 text-zinc-500" />
                <input 
                  type="text" 
                  placeholder="Search orders..." 
                  value={ordersSearch}
                  onChange={(e) => setOrdersSearch(e.target.value)}
                  className="bg-transparent text-xs font-bold outline-none w-full text-zinc-300" 
                />
              </div>
            </div>

            <div className="admin-card overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID / Token</th>
                    <th>Created At</th>
                    <th>Status</th>
                    <th>Download Started</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(o => (
                    <tr key={o.id}>
                      <td className="font-mono text-xs font-bold text-white">{o.id}</td>
                      <td className="text-zinc-400">{new Date(o.created_at).toLocaleString()}</td>
                      <td>
                        <span className={`status-pill ${o.status}`}>{o.status}</span>
                      </td>
                      <td className="text-zinc-500">
                        {o.download_started_at ? new Date(o.download_started_at).toLocaleString() : 'Not downloaded'}
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setSelectedOrderJSON(o.design_state)}
                            disabled={!o.design_state}
                            className={`p-2 rounded-lg border text-zinc-300 hover:text-white transition-colors cursor-pointer ${!o.design_state ? 'opacity-30 cursor-not-allowed border-zinc-900' : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800'}`}
                            title="Inspect JSON Data"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => { setReconstructToken(o.id); setActiveTab('reconstructor'); loadReconstructState(); }}
                            disabled={!o.design_state}
                            className={`p-2 rounded-lg border text-zinc-300 hover:text-white transition-colors cursor-pointer ${!o.design_state ? 'opacity-30 cursor-not-allowed border-zinc-900' : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800'}`}
                            title="Load to Reconstructor"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                          {o.status === 'completed' && (
                            <button 
                              onClick={() => handleUnlockOrder(o.id)}
                              className="p-2 rounded-lg bg-red-950/20 border border-red-900/40 text-red-400 hover:text-white hover:bg-red-900/40 transition-all cursor-pointer"
                              title="Unlock Design (Allow Editing)"
                            >
                              <Unlock className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center text-zinc-500 py-10">No orders found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TICKETS TAB */}
        {activeTab === 'tickets' && (
          <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-black uppercase mb-1">Support Tickets</h1>
                <p className="text-zinc-500 text-xs font-bold uppercase">Answer messages from customers with locked designs</p>
              </div>

              <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 items-center gap-2 w-64">
                <Search className="w-4 h-4 text-zinc-500" />
                <input 
                  type="text" 
                  placeholder="Search tickets..." 
                  value={ticketsSearch}
                  onChange={(e) => setTicketsSearch(e.target.value)}
                  className="bg-transparent text-xs font-bold outline-none w-full text-zinc-300" 
                />
              </div>
            </div>

            <div className="admin-card overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Ticket ID</th>
                    <th>Order ID / Token</th>
                    <th>Message</th>
                    <th>Status</th>
                    <th>Created At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.map(t => (
                    <tr key={t.id}>
                      <td className="font-mono text-xs font-bold text-zinc-400">{t.id}</td>
                      <td className="font-mono text-xs font-bold text-white">{t.order_id}</td>
                      <td className="max-w-xs truncate text-zinc-300" title={t.message}>{t.message}</td>
                      <td>
                        <span className={`status-pill ${t.status}`}>{t.status}</span>
                      </td>
                      <td className="text-zinc-500">{new Date(t.created_at).toLocaleString()}</td>
                      <td>
                        {t.status !== 'resolved' ? (
                          <button 
                            onClick={() => { setReplyTicketId(t.id); setSupportReplyText(''); }}
                            className="flex items-center gap-1.5 bg-indigo-650 hover:bg-indigo-500 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all cursor-pointer"
                          >
                            <MessageSquare className="w-4 h-4" /> Reply
                          </button>
                        ) : (
                          <span className="text-xs text-zinc-600 font-bold uppercase">No Action</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredTickets.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center text-zinc-500 py-10">No support tickets found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* RECONSTRUCTOR TAB */}
        {activeTab === 'reconstructor' && (
          <div className="flex flex-col gap-8">
            <div>
              <h1 className="text-3xl font-black uppercase mb-1">Poster Reconstructor</h1>
              <p className="text-zinc-500 text-xs font-bold uppercase">Fetch design parameters and automatically generate output files</p>
            </div>

            <div className="admin-card flex flex-col md:flex-row gap-6 items-end">
              <div className="flex-1 flex flex-col gap-1.5 w-full">
                <label className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">Order ID / Token</label>
                <input 
                  type="text" 
                  value={reconstructToken}
                  onChange={(e) => setReconstructToken(e.target.value)}
                  placeholder="e.g. 5m2x1p3"
                  className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs outline-none text-zinc-100 font-mono" 
                />
              </div>
              <button 
                disabled={reconstructLoading}
                onClick={loadReconstructState}
                className="bg-indigo-600 hover:bg-indigo-500 px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer w-full md:w-auto h-[42px]"
              >
                {reconstructLoading ? 'Loading...' : 'Load Design State'}
              </button>
            </div>

            {reconstructedState && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                <div className="lg:col-span-2 admin-card flex flex-col items-center justify-center p-8 bg-zinc-950 relative overflow-hidden" style={{ minHeight: '500px' }}>
                  <div id="poster-container" style={{ 
                    width: containerDims.width * zoom, 
                    height: containerDims.height * zoom
                  }}>
                    <canvas ref={canvasElRef} />
                  </div>
                </div>

                <div className="flex flex-col gap-6">
                  <div className="admin-card flex flex-col gap-4">
                    <h3 className="text-sm font-black uppercase text-white flex items-center gap-2">
                      <Download className="w-4 h-4 text-indigo-400" /> Export Actions
                    </h3>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                      Download high-resolution print files bypasses all client-side restriction timers.
                    </p>
                    <div className="flex flex-col gap-2">
                      <button onClick={() => downloadReconstructedPoster('pdf')} className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer border border-zinc-800">
                        <FileText className="w-4 h-4" /> Download Print PDF
                      </button>
                      <button onClick={() => downloadReconstructedPoster('png')} className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer border border-zinc-800">
                        <Download className="w-4 h-4" /> Download PNG Image
                      </button>
                      <button onClick={() => downloadReconstructedPoster('svg')} className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer border border-zinc-800">
                        <RefreshCw className="w-4 h-4" /> Download SVG Vector
                      </button>
                    </div>
                  </div>

                  <div className="admin-card flex flex-col gap-3">
                    <h3 className="text-sm font-black uppercase text-white">Metadata Summary</h3>
                    <div className="text-xs flex flex-col gap-2 text-zinc-400 font-mono">
                      <div><strong className="text-zinc-500">Size:</strong> {canvasSize} ({orientation})</div>
                      <div><strong className="text-zinc-500">Bg Color:</strong> {bgColor}</div>
                      <div><strong className="text-zinc-500">Title:</strong> {mainTitleText}</div>
                      <div><strong className="text-zinc-500">Wave Color:</strong> {waveFillType === 'solid' ? waveSolidColor : 'Gradient'}</div>
                      <div><strong className="text-zinc-500">QR:</strong> {showQR ? 'Enabled' : 'Disabled'}</div>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

      </div>

      {/* JSON DATA MODAL */}
      {selectedOrderJSON && (
        <div className="json-modal-overlay" onClick={() => setSelectedOrderJSON(null)}>
          <div className="json-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
              <h3 className="text-sm font-black uppercase text-white">Design State Parameters JSON</h3>
              <button onClick={() => setSelectedOrderJSON(null)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto" style={{ maxHeight: '60vh' }}>
              <pre className="bg-zinc-950 p-4 rounded-xl text-xs font-mono text-emerald-400 overflow-x-auto">
                {JSON.stringify(selectedOrderJSON, null, 2)}
              </pre>
            </div>
            <div className="p-6 border-t border-zinc-800 flex justify-end">
              <button onClick={() => setSelectedOrderJSON(null)} className="bg-zinc-900 hover:bg-zinc-800 px-6 py-2.5 rounded-xl text-xs font-bold uppercase cursor-pointer">
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUPPORT REPLY MODAL */}
      {replyTicketId && (
        <div className="json-modal-overlay">
          <div className="json-modal-content" style={{ maxWidth: '500px' }}>
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
              <h3 className="text-sm font-black uppercase text-white">Submit Support Response</h3>
              <button onClick={() => { setReplyTicketId(null); setSupportReplyText(''); }} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div className="bg-zinc-950 p-4 rounded-xl text-xs font-mono border border-zinc-900">
                <strong className="text-zinc-500 block mb-1">User Original Ticket Message:</strong>
                <p className="text-zinc-300 leading-relaxed">
                  {tickets.find(t => t.id === replyTicketId)?.message}
                </p>
              </div>
              <div className="form-row" style={{ padding: 0 }}>
                <label className="text-[10px] uppercase font-bold text-zinc-500 mb-1.5 block">Reply Message</label>
                <textarea 
                  value={ticketReplyText}
                  onChange={(e) => setSupportReplyText(e.target.value)}
                  placeholder="e.g. Design unlocked successfully. You can now edit..."
                  style={{
                    width: '100%', background: 'var(--input-bg)', border: '1px solid var(--input-border)',
                    borderRadius: '8px', color: 'var(--spotify-text)', padding: '12px', fontSize: '12px',
                    fontFamily: 'inherit', minHeight: '120px', resize: 'vertical', outline: 'none'
                  }}
                />
              </div>
            </div>
            <div className="p-6 border-t border-zinc-800 flex gap-3">
              <button 
                disabled={submittingReply || !ticketReplyText.trim()}
                onClick={handleReplySubmit}
                className={`btn ${submittingReply || !ticketReplyText.trim() ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'btn-primary'}`}
                style={{ flex: 1, padding: '12px 0' }}
              >
                {submittingReply ? 'Submitting...' : 'Send Response & Resolve'}
              </button>
              <button 
                disabled={submittingReply}
                onClick={() => { setReplyTicketId(null); setSupportReplyText(''); }}
                className="btn btn-secondary"
                style={{ flex: 1, padding: '12px 0' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={`sw-toast ${toast ? 'show' : ''}`}>&#10003; {toast}</div>
    </div>
  );
}
