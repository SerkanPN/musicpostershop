import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function AirbnbEditor() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const presetKey = searchParams.get('preset') || '';
  const [title, setTitle] = useState(presetKey ? `WELCOME TO ${presetKey.replace(/-/g, ' ').toUpperCase()}` : 'WELCOME TO THE VILLA');
  const [wifi, setWifi] = useState('Guest_Network_5G');
  const [pass, setPass] = useState('relax123');
  
  const containerRef = useRef<HTMLDivElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';
    const canvasEl = document.createElement('canvas');
    canvasEl.width = 400;
    canvasEl.height = 600;
    containerRef.current.appendChild(canvasEl);
    
    fabricRef.current = new fabric.Canvas(canvasEl, { width: 400, height: 600, backgroundColor: '#ffffff' });
    render();
    return () => fabricRef.current?.dispose();
  }, []);

  const render = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.clear();
    
    const bg = new fabric.Rect({ left: 0, top: 0, width: 400, height: 600, fill: '#fff', selectable: false });
    canvas.add(bg);

    const tText = new fabric.Textbox(title, { left: 200, top: 70, fontSize: 26, fontFamily: 'sans-serif', fontWeight: 'bold', fill: '#111', originX: 'center', textAlign: 'center', width: 360 });
    const line = new fabric.Line([40, 130, 360, 130], { stroke: '#eee', strokeWidth: 2 });
    
    const wifiText = new fabric.Textbox(`📶 WiFi Network: ${wifi}\n🔑 Password: ${pass}`, { left: 40, top: 180, fontSize: 16, fontFamily: 'sans-serif', fill: '#333', width: 320, lineHeight: 1.5 });
    
    const rulesTitle = new fabric.Textbox("HOUSE RULES", { left: 40, top: 280, fontSize: 18, fontFamily: 'sans-serif', fontWeight: 'bold', fill: '#111', width: 320 });
    const rule1 = new fabric.Textbox("🚭 No Smoking Inside\n🕰 Check-out by 11:00 AM\n🗑 Please take out trash\n🤫 Quiet hours after 10PM", { left: 40, top: 320, fontSize: 15, fontFamily: 'sans-serif', fill: '#444', width: 320, lineHeight: 1.8 });
    
    canvas.add(tText, line, wifiText, rulesTitle, rule1);
    canvas.renderAll();
  };

  useEffect(() => { render(); }, [title, wifi, pass]);

  const handleDownload = () => {
    if (!fabricRef.current) return;
    const a = document.createElement('a');
    a.href = fabricRef.current.toDataURL({ format: 'png', multiplier: 3 });
    a.download = 'airbnb.png';
    a.click();
  };

  return (
    <div className="min-h-screen flex bg-[#0a0a0a] text-white">
      <div className="w-80 p-6 bg-neutral-900 border-r border-neutral-800 space-y-4 overflow-y-auto">
        <h2 className="text-xl font-bold">AirBNB Editor</h2>
        <div><label className="text-xs text-neutral-500 uppercase">Title</label><input className="w-full mt-1 p-2 bg-black border border-neutral-800 rounded" value={title} onChange={e=>setTitle(e.target.value)} /></div>
        <div><label className="text-xs text-neutral-500 uppercase">WiFi Network</label><input className="w-full mt-1 p-2 bg-black border border-neutral-800 rounded" value={wifi} onChange={e=>setWifi(e.target.value)} /></div>
        <div><label className="text-xs text-neutral-500 uppercase">WiFi Password</label><input className="w-full mt-1 p-2 bg-black border border-neutral-800 rounded" value={pass} onChange={e=>setPass(e.target.value)} /></div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-neutral-950 overflow-y-auto">
        <div className="mb-6 flex gap-4 w-full max-w-[400px]">
          <button onClick={() => navigate('/')} className="flex items-center justify-center gap-2 bg-neutral-800 text-white font-semibold py-3 px-6 rounded-xl hover:bg-neutral-700 transition-colors">
            <ArrowLeft className="w-5 h-5" /> Back
          </button>
          <button onClick={handleDownload} className="flex-1 bg-white text-black font-semibold py-3 rounded-xl hover:bg-neutral-200 transition-colors">
            Download PNG
          </button>
        </div>
        <div ref={containerRef} className="shadow-2xl rounded-sm overflow-hidden flex-shrink-0" style={{ width: 400, height: 600 }} />
      </div>
    </div>
  );
}
