import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function ToddlerEditor() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const presetKey = searchParams.get('preset') || '';
  const [name, setName] = useState(presetKey ? presetKey.replace(/-/g, ' ') : 'Little Explorer');
  const [subtitle, setSubtitle] = useState('Dream Big, Little One');
  const [bgColor, setBgColor] = useState('#fff4e6');
  
  const containerRef = useRef<HTMLDivElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Caveat:wght@700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';
    const canvasEl = document.createElement('canvas');
    canvasEl.width = 400;
    canvasEl.height = 600;
    containerRef.current.appendChild(canvasEl);
    
    fabricRef.current = new fabric.Canvas(canvasEl, { width: 400, height: 600, backgroundColor: bgColor });
    render();
    setTimeout(render, 500);
    return () => fabricRef.current?.dispose();
  }, []);

  const render = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.clear();
    
    const bg = new fabric.Rect({ left: 0, top: 0, width: 400, height: 600, fill: bgColor, selectable: false });
    canvas.add(bg);

    // Decor shapes
    const c1 = new fabric.Circle({ left: 80, top: 100, radius: 40, fill: '#ffd54f', selectable: false });
    const c2 = new fabric.Circle({ left: 320, top: 480, radius: 60, fill: '#ba68c8', selectable: false });
    const c3 = new fabric.Circle({ left: 200, top: 450, radius: 30, fill: '#81c784', originX: 'center', selectable: false });
    canvas.add(c1, c2, c3);

    const tText = new fabric.Textbox(name, { left: 200, top: 220, fontSize: 44, fontFamily: 'Caveat, cursive', fill: '#ff8a65', originX: 'center', textAlign: 'center', width: 360, fontWeight: 'bold' });
    const sText = new fabric.Textbox(subtitle, { left: 200, top: 320, fontSize: 18, fontFamily: 'sans-serif', fill: '#4dd0e1', originX: 'center', textAlign: 'center', width: 360, fontWeight: 'bold' });
    
    canvas.add(tText, sText);
    canvas.renderAll();
  };

  useEffect(() => { render(); }, [name, subtitle, bgColor]);

  const handleDownload = () => {
    if (!fabricRef.current) return;
    const a = document.createElement('a');
    a.href = fabricRef.current.toDataURL({ format: 'png', multiplier: 3 });
    a.download = 'toddler.png';
    a.click();
  };

  return (
    <div className="min-h-screen flex bg-[#0a0a0a] text-white">
      <div className="w-80 p-6 bg-neutral-900 border-r border-neutral-800 space-y-4 overflow-y-auto">
        <h2 className="text-xl font-bold">Toddler Editor</h2>
        <div><label className="text-xs text-neutral-500 uppercase">Name / Theme</label><input className="w-full mt-1 p-2 bg-black border border-neutral-800 rounded" value={name} onChange={e=>setName(e.target.value)} /></div>
        <div><label className="text-xs text-neutral-500 uppercase">Subtitle</label><input className="w-full mt-1 p-2 bg-black border border-neutral-800 rounded" value={subtitle} onChange={e=>setSubtitle(e.target.value)} /></div>
        <div><label className="text-xs text-neutral-500 uppercase">Background Color</label><input type="color" className="w-full h-10 mt-1 p-1 bg-black border border-neutral-800 rounded" value={bgColor} onChange={e=>setBgColor(e.target.value)} /></div>
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
