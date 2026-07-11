import React, { useState, useEffect, useRef } from 'react';
import * as fabric from 'fabric';
import jsPDF from 'jspdf';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  MessageSquare, 
  Settings, 
  LogOut, 
  Lock, 
  Check, 
  RefreshCw, 
  Download, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  Clock, 
  ChevronRight, 
  FileText,
  Search,
  Eye
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Order {
  id: string;
  created_at: string;
  status: string;
  design_state: any;
  download_started_at?: string;
}

interface Ticket {
  id: string;
  created_at: string;
  order_id: string;
  message: string;
  status: string;
}

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
  { value: '18x24', border: '18" x 24"' },
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

export default function AdminPortal() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [usernameInput, setUsernameInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [loginError, setTokenError] = useState<string>('');

  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'support' | 'editor'>('dashboard');
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loadingOrders, setLoadingOrders] = useState<boolean>(true);
  const [loadingTickets, setLoadingTickets] = useState<boolean>(true);

  const [searchOrderId, setSearchOrderId] = useState<string>('');
  const [editorOrderId, setEditorOrderId] = useState<string>('');
  const [loadedDesignState, setLoadedDesignState] = useState<any>(null);
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [editorMessage, setEditorMessage] = useState<string>('');

  const sandboxCanvasElRef = useRef<HTMLCanvasElement | null>(null);
  const sandboxFabricRef = useRef<fabric.Canvas | null>(null);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const { data, error } = await supabase
        .from('etsy_orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchTickets = async () => {
    setLoadingTickets(true);
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) setTickets(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
      fetchTickets();
    }
  }, [isAuthenticated]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameInput === 'SerkanPN' && passwordInput === 'SerkanPN') {
      setIsAuthenticated(true);
      setTokenError('');
    } else {
      setTokenError('Invalid username or password credentials.');
    }
  };

  const handleResolveTicket = async (ticketId: string) => {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ status: 'resolved' })
        .eq('id', ticketId);

      if (!error) {
        setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: 'resolved' } : t));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLoadDesignForEditor = async (orderId: string) => {
    setEditorOrderId(orderId);
    setEditorMessage('Fetching design details from database...');
    setActiveTab('editor');
    setLoadedDesignState(null);

    try {
      const { data, error } = await supabase
        .from('etsy_orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (error || !data || !data.design_state) {
        setEditorMessage('Design record is empty or expired for this order.');
        return;
      }

      setLoadedDesignState(data.design_state);
      setEditorMessage('');
    } catch (err) {
      setEditorMessage('Database communication failure.');
    }
  };

  useEffect(() => {
    if (activeTab !== 'editor' || !loadedDesignState || !sandboxCanvasElRef.current) return;

    if (sandboxFabricRef.current) {
      sandboxFabricRef.current.dispose();
      sandboxFabricRef.current = null;
    }

    const ds = loadedDesignState;
    const baseW = 600;
    const baseH = 800;
    const [wVal, hVal] = (ds.canvasSize || '30x40').split('x').map(Number);
    const useWidth = ds.orientation === 'landscape' ? Math.max(wVal, hVal) : Math.min(wVal, hVal);
    const useHeight = ds.orientation === 'landscape' ? Math.min(wVal, hVal) : Math.max(wVal, hVal);
    const aspect = useWidth / useHeight;

    let targetW = baseW;
    let targetH = targetW / aspect;
    if (targetH > baseH) {
      targetH = baseH;
      targetW = targetH * aspect;
    }

    const canvas = new fabric.Canvas(sandboxCanvasElRef.current, {
      width: targetW,
      height: targetH,
      backgroundColor: ds.bgColor || '#fbfbfb',
      preserveObjectStacking: true,
      selection: false
    });
    sandboxFabricRef.current = canvas;

    const bgRect = new fabric.Rect({
      left: 0,
      top: 0,
      width: targetW,
      height: targetH,
      fill: ds.bgColor || '#fbfbfb',
      selectable: false,
      evented: false,
    });
    canvas.add(bgRect);

    const cy = targetH / 2;
    const cw = targetW;
    const qrSize = ds.qrSize || 25;
    const yOffset = ds.showQR ? -(qrSize + 15) : 0;

    const topLeft = new fabric.IText(ds.topLeftText || '', {
      left: cw * 0.08,
      top: targetH * 0.08,
      fontSize: 12,
      fontFamily: ds.topLeftFontFamily || 'Montserrat, sans-serif',
      fontWeight: ds.topLeftFontWeight || '700',
      fontStyle: ds.topLeftFontStyle || 'normal',
      fill: ds.topLeftColor || '#000000',
      charSpacing: ds.topLeftCharSpacing || 100,
      selectable: false
    });
    canvas.add(topLeft);

    const topRight = new fabric.IText(ds.topRightText || '', {
      left: cw * 0.92,
      top: targetH * 0.08,
      originX: 'right',
      fontSize: 12,
      fontFamily: ds.topRightFontFamily || 'Montserrat, sans-serif',
      fontWeight: ds.topRightFontWeight || '700',
      fontStyle: ds.topRightFontStyle || 'normal',
      fill: ds.topRightColor || '#000000',
      charSpacing: ds.topRightCharSpacing || 100,
      selectable: false
    });
    canvas.add(topRight);

    const mainTitle = new fabric.Textbox(ds.mainTitleText || '', {
      left: cw / 2,
      top: cy + 100 + yOffset,
      width: cw * 0.8,
      originX: 'center',
      textAlign: 'center',
      fontSize: ds.mainTitleFontSize || 24,
      fontFamily: ds.mainTitleFontFamily || 'Montserrat, sans-serif',
      fontWeight: ds.mainTitleFontWeight || '700',
      fontStyle: ds.mainTitleFontStyle || 'normal',
      fill: ds.mainTitleColor || '#000000',
      charSpacing: ds.mainTitleCharSpacing || 150,
      selectable: false
    });
    canvas.add(mainTitle);

    const subTitle = new fabric.Textbox(ds.subTitleText || '', {
      left: cw / 2,
      top: cy + 130 + yOffset,
      width: cw * 0.8,
      originX: 'center',
      textAlign: 'center',
      fontSize: ds.subTitleFontSize || 12,
      fontFamily: ds.subTitleFontFamily || 'Montserrat, sans-serif',
      fontWeight: ds.subTitleFontWeight || '400',
      fontStyle: ds.subTitleFontStyle || 'normal',
      fill: ds.subTitleColor || '#333333',
      charSpacing: ds.subTitleCharSpacing || 200,
      selectable: false
    });
    canvas.add(subTitle);

    const divider = new fabric.Line([cw * 0.35, cy + 155 + yOffset, cw * 0.65, cy + 155 + yOffset], {
      stroke: ds.dividerColor || '#999999',
      strokeWidth: 1,
      selectable: false
    });
    canvas.add(divider);

    const bottom1 = new fabric.Textbox(ds.bottom1Text || '', {
      left: cw / 2,
      top: cy + 175 + yOffset,
      width: cw * 0.8,
      originX: 'center',
      textAlign: 'center',
      fontSize: ds.bottom1FontSize || 9,
      fontFamily: ds.bottom1FontFamily || 'Montserrat, sans-serif',
      fontWeight: ds.bottom1FontWeight || '600',
      fontStyle: ds.bottom1FontStyle || 'normal',
      fill: ds.bottom1Color || '#333333',
      charSpacing: ds.bottom1CharSpacing || 100,
      selectable: false
    });
    canvas.add(bottom1);

    const bottom2 = new fabric.Textbox(ds.bottom2Text || '', {
      left: cw / 2,
      top: cy + 195 + yOffset,
      width: cw * 0.8,
      originX: 'center',
      textAlign: 'center',
      fontSize: ds.bottom2FontSize || 9,
      fontFamily: ds.bottom2FontFamily || 'Montserrat, sans-serif',
      fontWeight: ds.bottom2FontWeight || '600',
      fontStyle: ds.bottom2FontStyle || 'normal',
      fill: ds.bottom2Color || '#333333',
      charSpacing: ds.bottom2CharSpacing || 100,
      selectable: false
    });
    canvas.add(bottom2);

    const density = ds.waveDensity || 240;
    const waveWidthScale = ds.waveWidthScale || 80;
    const waveHeightScale = ds.waveHeightScale || 50;
    const waveThickness = ds.waveThickness || 1.5;

    const totalWidth = targetW * (waveWidthScale / 100);
    const step = totalWidth / density;
    const startX = 0;
    const maxHeight = targetH * (waveHeightScale / 100);

    const peaks = generateAestheticPeaks(density);
    let pathString = '';
    for (let i = 0; i < density; i++) {
      const x = startX + i * step;
      const h = peaks[i] * maxHeight;
      pathString += `M ${x} ${-h/2} L ${x} ${h/2} `;
    }

    const wavePath = new fabric.Path(pathString, {
      strokeWidth: waveThickness,
      fill: '',
      strokeLineCap: 'round',
      strokeLineJoin: 'round',
      originX: 'center',
      originY: 'center',
      left: targetW / 2,
      top: targetH * 0.40,
      objectCaching: false,
      selectable: false
    });

    if (ds.waveFillType === 'solid') {
      wavePath.set({ stroke: ds.waveSolidColor || '#008000' });
    } else {
      const bound = wavePath.getBoundingRect();
      const rad = ((ds.waveGradientAngle || 0) * Math.PI) / 180;
      const x1 = (bound.width / 2) - Math.cos(rad) * (bound.width / 2);
      const y1 = (bound.height / 2) - Math.sin(rad) * (bound.height / 2);
      const x2 = (bound.width / 2) + Math.cos(rad) * (bound.width / 2);
      const y2 = (bound.height / 2) + Math.sin(rad) * (bound.height / 2);

      const activeColors = (ds.waveGradientColors || []).slice(0, ds.waveGradientStops || 3);
      const colorStops = activeColors.map((color: string, idx: number) => ({
        offset: idx / (activeColors.length - 1),
        color: color
      }));

      wavePath.set({
        stroke: new fabric.Gradient({
          type: 'linear',
          coords: { x1, y1, x2, y2 },
          colorStops
        })
      });
    }
    canvas.add(wavePath);

    if (ds.showQR && ds.qrLink) {
      const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(ds.qrLink)}`;
      fabric.Image.fromURL(apiUrl, { crossOrigin: 'anonymous' }).then((img) => {
        img.set({
          left: targetW / 2,
          top: (targetH / 2) + 195,
          originX: 'center',
          originY: 'center',
          scaleX: qrSize / img.width!,
          scaleY: qrSize / img.height!,
          selectable: false
        });
        canvas.add(img);
        canvas.requestRenderAll();
      });
    }

    canvas.requestRenderAll();
  }, [activeTab, loadedDesignState]);

  const handleAdminDownload = async (format: 'png' | 'pdf' | 'svg') => {
    const canvas = sandboxFabricRef.current;
    if (!canvas || !loadedDesignState) return;

    setIsRendering(true);
    const ds = loadedDesignState;

    setTimeout(() => {
      try {
        const [wVal, hVal] = (ds.canvasSize || '30x40').split('x').map(Number);
        const useWidth = ds.orientation === 'landscape' ? Math.max(wVal, hVal) : Math.min(wVal, hVal);
        const useHeight = ds.orientation === 'landscape' ? Math.min(wVal, hVal) : Math.max(wVal, hVal);

        const currentCanvasWidth = canvas.getWidth();
        const multiplier = (useWidth * DPI) / currentCanvasWidth;

        if (format === 'png') {
          const dataUrl = canvas.toDataURL({ format: 'png', multiplier });
          const a = document.createElement('a');
          a.href = dataUrl;
          a.download = `soundwave-admin-${editorOrderId}.png`;
          a.click();
        } else if (format === 'pdf') {
          const dataUrl = canvas.toDataURL({ format: 'png', multiplier });
          const pdf = new jsPDF({
            orientation: useWidth > useHeight ? 'landscape' : 'portrait',
            unit: 'in',
            format: [useWidth, useHeight],
          });
          pdf.addImage(dataUrl, 'PNG', 0, 0, useWidth, useHeight);
          pdf.save(`soundwave-admin-${editorOrderId}.pdf`);
        } else if (format === 'svg') {
          const svg = canvas.toSVG();
          const blob = new Blob([svg], { type: 'image/svg+xml' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `soundwave-admin-${editorOrderId}.svg`;
          a.click();
          URL.revokeObjectURL(url);
        }
        showToast('File downloaded successfully.');
      } catch (err) {
        showToast('Renderer execution failed.');
      } finally {
        setIsRendering(false);
      }
    }, 200);
  };

  const handleDirectSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchOrderId.trim()) {
      handleLoadDesignForEditor(searchOrderId.trim());
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6 font-sans">
        <form onSubmit={handleLoginSubmit} className="max-w-sm w-full bg-zinc-900 border border-zinc-800 p-8 rounded-3xl shadow-2xl">
          <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20 mb-6 mx-auto">
            <Lock className="w-6 h-6 text-indigo-400" />
          </div>
          <h1 className="text-xl font-black text-center uppercase tracking-tight mb-2">Admin Portal</h1>
          <p className="text-zinc-500 text-xs text-center leading-relaxed mb-6 font-medium">Access is strictly restricted to SerkanPN personnel.</p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase text-zinc-500 mb-1.5 tracking-wider">Username</label>
              <input 
                type="text" 
                value={usernameInput} 
                onChange={(e) => setUsernameInput(e.target.value)} 
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-indigo-500 transition-colors"
                required 
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-zinc-500 mb-1.5 tracking-wider">Password</label>
              <input 
                type="password" 
                value={passwordInput} 
                onChange={(e) => setPasswordInput(e.target.value)} 
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-indigo-500 transition-colors"
                required 
              />
            </div>
          </div>

          {loginError && <p className="text-red-500 text-xs font-bold mt-4 text-center">{loginError}</p>}

          <button type="submit" className="w-full btn btn-primary py-3.5 rounded-xl font-bold uppercase tracking-wider text-xs mt-6">
            Unlock Portal
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex font-sans">
      
      <div className="w-64 border-r border-zinc-900 bg-zinc-900/40 shrink-0 flex flex-col justify-between">
        <div>
          <div className="p-6 border-b border-zinc-900 flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20">
              <Settings className="w-4 h-4 text-indigo-400" />
            </div>
            <span className="font-black text-xs uppercase tracking-widest text-zinc-300">Admin Control</span>
          </div>

          <div className="p-4 space-y-1">
            <button 
              onClick={() => setActiveTab('dashboard')} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'}`}
            >
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('orders')} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'orders' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'}`}
            >
              <ShoppingBag className="w-4 h-4" /> Orders Queue
            </button>
            <button 
              onClick={() => setActiveTab('support')} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'support' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'}`}
            >
              <MessageSquare className="w-4 h-4" /> Support Tickets
            </button>
            <button 
              onClick={() => setActiveTab('editor')} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'editor' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'}`}
            >
              <RefreshCw className="w-4 h-4" /> Re-Generator Tool
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-zinc-900">
          <button onClick={() => setIsAuthenticated(false)} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-red-400 hover:text-white hover:bg-red-950/20 transition-all">
            <LogOut className="w-4 h-4" /> Exit Session
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col h-screen overflow-y-auto bg-zinc-950/90 relative z-10">
        
        {activeTab === 'dashboard' && (
          <div className="p-8 space-y-8">
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tight text-white">Dashboard Overview</h1>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mt-1">Real-time Etsy integration metrics</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-zinc-900/50 border border-zinc-900 p-6 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">Total Claims</span>
                  <h3 className="text-3xl font-black mt-1">{orders.length}</h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-indigo-400" />
                </div>
              </div>
              <div className="bg-zinc-900/50 border border-zinc-900 p-6 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">Active Designs</span>
                  <h3 className="text-3xl font-black mt-1">{orders.filter(o => o.status === 'completed').length}</h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
              <div className="bg-zinc-900/50 border border-zinc-900 p-6 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">Pending Support</span>
                  <h3 className="text-3xl font-black mt-1">{tickets.filter(t => t.status === 'pending').length}</h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
              </div>
              <div className="bg-zinc-900/50 border border-zinc-900 p-6 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">System Status</span>
                  <h3 className="text-sm font-black mt-2 text-emerald-400 flex items-center gap-1.5"><Check className="w-4 h-4" /> ONLINE</h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-indigo-400" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-zinc-900/30 border border-zinc-900 p-6 rounded-2xl md:col-span-2 space-y-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-zinc-400">Direct Search & Bypass</h3>
                <form onSubmit={handleDirectSearchSubmit} className="flex gap-2">
                  <div className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 flex items-center gap-2">
                    <Search className="w-4 h-4 text-zinc-500" />
                    <input 
                      type="text" 
                      placeholder="Input Etsy Order ID / Token..." 
                      value={searchOrderId}
                      onChange={(e) => setSearchOrderId(e.target.value)}
                      className="bg-transparent text-xs font-bold outline-none w-full text-zinc-200 placeholder-zinc-600"
                    />
                  </div>
                  <button type="submit" className="btn btn-primary px-6 rounded-xl text-xs font-bold uppercase tracking-wider">
                    Fetch Design
                  </button>
                </form>
              </div>

              <div className="bg-zinc-900/30 border border-zinc-900 p-6 rounded-2xl space-y-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-zinc-400">System Information</h3>
                <div className="text-xs space-y-2 font-bold text-zinc-500">
                  <div className="flex justify-between border-b border-zinc-900 pb-2"><span>Database</span><span className="text-white">Supabase Connected</span></div>
                  <div className="flex justify-between border-b border-zinc-900 pb-2"><span>Etsy API Status</span><span className="text-white">Sandbox Mock Mode</span></div>
                  <div className="flex justify-between"><span>Region</span><span className="text-white">East US</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="p-8 space-y-6">
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tight text-white">Orders Queue</h1>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mt-1">Manage completed designs and generate assets</p>
            </div>

            <div className="bg-zinc-900/30 border border-zinc-900 rounded-2xl overflow-hidden">
              {loadingOrders ? (
                <div className="p-12 flex justify-center"><div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-900 bg-zinc-900/20 text-[10px] font-black uppercase tracking-wider text-zinc-500">
                      <th className="p-4">Order ID / Token</th>
                      <th className="p-4">Created At</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Download Started</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs font-bold text-zinc-300">
                    {orders.map(order => (
                      <tr key={order.id} className="border-b border-zinc-900 hover:bg-zinc-900/10">
                        <td className="p-4 font-mono text-[11px] text-zinc-400">{order.id}</td>
                        <td className="p-4 text-zinc-500">{new Date(order.created_at).toLocaleString()}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-md text-[9px] uppercase tracking-wider font-black ${order.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="p-4 text-zinc-500">{order.download_started_at ? new Date(order.download_started_at).toLocaleString() : 'Never'}</td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => handleLoadDesignForEditor(order.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-[10px] uppercase tracking-wider cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" /> View Design
                          </button>
                        </td>
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr><td colSpan={5} className="p-8 text-center text-zinc-500 uppercase tracking-wider">No design orders found in database</td></tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {activeTab === 'support' && (
          <div className="p-8 space-y-6">
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tight text-white">Support Tickets</h1>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mt-1">Resolve locked-design revision requests</p>
            </div>

            <div className="bg-zinc-900/30 border border-zinc-900 rounded-2xl overflow-hidden">
              {loadingTickets ? (
                <div className="p-12 flex justify-center"><div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-900 bg-zinc-900/20 text-[10px] font-black uppercase tracking-wider text-zinc-500">
                      <th className="p-4">Created At</th>
                      <th className="p-4">Order ID</th>
                      <th className="p-4">Request Message</th>
                      <th className="p-4">Ticket Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs font-bold text-zinc-300">
                    {tickets.map(ticket => (
                      <tr key={ticket.id} className="border-b border-zinc-900 hover:bg-zinc-900/10">
                        <td className="p-4 text-zinc-500">{new Date(ticket.created_at).toLocaleString()}</td>
                        <td className="p-4 font-mono text-[11px] text-zinc-400">{ticket.order_id}</td>
                        <td className="p-4 max-w-sm truncate text-zinc-200" title={ticket.message}>{ticket.message}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-md text-[9px] uppercase tracking-wider font-black ${ticket.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                            {ticket.status}
                          </span>
                        </td>
                        <td className="p-4 text-right flex justify-end gap-2">
                          <button 
                            onClick={() => handleLoadDesignForEditor(ticket.order_id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-[10px] uppercase tracking-wider cursor-pointer"
                          >
                            Load Design
                          </button>
                          {ticket.status === 'pending' && (
                            <button 
                              onClick={() => handleResolveTicket(ticket.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-900/40 rounded-lg text-[10px] text-emerald-400 uppercase tracking-wider cursor-pointer"
                            >
                              Resolve
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {tickets.length === 0 && (
                      <tr><td colSpan={5} className="p-8 text-center text-zinc-500 uppercase tracking-wider">No support tickets found in database</td></tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {activeTab === 'editor' && (
          <div className="p-8 space-y-6">
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tight text-white">Re-Generator Workspace</h1>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mt-1">Render and export completed customer files</p>
            </div>

            <div className="bg-zinc-900/30 border border-zinc-900 p-6 rounded-2xl space-y-6">
              {editorMessage ? (
                <div className="p-12 text-center text-zinc-500 uppercase font-bold tracking-wider">{editorMessage}</div>
              ) : (
                <>
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
                    <div>
                      <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Active Workspace</span>
                      <h2 className="text-lg font-bold text-white mt-0.5">Order ID: {editorOrderId}</h2>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        disabled={isRendering || !loadedDesignState}
                        onClick={() => handleAdminDownload('pdf')}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer ${isRendering ? 'bg-zinc-800 text-zinc-600' : 'bg-indigo-600 text-white hover:bg-indigo-500'}`}
                      >
                        <Download className="w-4 h-4" /> Download PDF
                      </button>
                      <button 
                        disabled={isRendering || !loadedDesignState}
                        onClick={() => handleAdminDownload('png')}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer"
                      >
                        PNG
                      </button>
                      <button 
                        disabled={isRendering || !loadedDesignState}
                        onClick={() => handleAdminDownload('svg')}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer"
                      >
                        SVG
                      </button>
                    </div>
                  </div>

                  {isRendering && (
                    <div className="p-6 bg-indigo-950/10 border border-indigo-900/20 rounded-xl text-indigo-400 text-xs font-bold text-center animate-pulse">
                      High-resolution render engine executing... Please do not close this browser tab.
                    </div>
                  )}

                  <div className="flex justify-center py-6 bg-zinc-950/60 border border-zinc-900 rounded-2xl">
                    <div style={{ transform: 'scale(0.8)', transformOrigin: 'center center' }}>
                      <canvas ref={sandboxCanvasElRef} />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

      </div>

      <div id="toast" className={toast ? 'show' : ''}>&#10003; {toast || 'Done'}</div>
    </div>
  );
}
