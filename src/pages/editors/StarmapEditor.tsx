import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function StarmapEditor() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const presetKey = searchParams.get('preset') || '';
  const [title, setTitle] = useState(presetKey ? presetKey.replace(/-/g, ' ').toUpperCase() : 'THE NIGHT WE MET');
  const [subtitle, setSubtitle] = useState('NEW YORK, NY - OCT 14, 2022');
  
  const containerRef = useRef<HTMLDivElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@400;500;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';
    const canvasEl = document.createElement('canvas');
    canvasEl.width = 400;
    canvasEl.height = 600;
    containerRef.current.appendChild(canvasEl);

    fabricRef.current = new fabric.Canvas(canvasEl, { width: 400, height: 600, backgroundColor: '#0a192f' });
    render();
    setTimeout(render, 500);
    return () => fabricRef.current?.dispose();
  }, []);

  const render = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.clear();
    
    const bg = new fabric.Rect({ left: 0, top: 0, width: 400, height: 600, fill: '#0a192f', selectable: false });
    canvas.add(bg);

    const circle = new fabric.Circle({ left: 200, top: 220, radius: 140, originX: 'center', originY: 'center', fill: '#020c1b', stroke: '#fff', strokeWidth: 1, selectable: false });
    canvas.add(circle);
    
    // Draw pseudo-random stars based on a fixed seed (using simple math)
    for(let i=0; i<120; i++) {
       const r = (Math.sin(i * 12.3) * 0.5 + 0.5) * 135;
       const theta = (Math.cos(i * 3.4) * 0.5 + 0.5) * 2 * Math.PI;
       const x = 200 + r * Math.cos(theta);
       const y = 220 + r * Math.sin(theta);
       canvas.add(new fabric.Circle({ left: x, top: y, radius: Math.random()*1.2 + 0.3, fill: '#fff', originX: 'center', originY: 'center', selectable: false }));
    }

    const tText = new fabric.Textbox(title, { left: 200, top: 420, fontSize: 20, fontFamily: 'Playfair Display, serif', fill: '#fff', originX: 'center', textAlign: 'center', width: 360, charSpacing: 100 });
    const sText = new fabric.Textbox(subtitle, { left: 200, top: 460, fontSize: 12, fontFamily: 'Inter, sans-serif', fill: '#8892b0', originX: 'center', textAlign: 'center', width: 360, charSpacing: 100 });
    
    canvas.add(tText, sText);
    canvas.renderAll();
  };

  useEffect(() => { render(); }, [title, subtitle]);

  const handleDownload = () => {
    if (!fabricRef.current) return;
    const a = document.createElement('a');
    a.href = fabricRef.current.toDataURL({ format: 'png', multiplier: 3 });
    a.download = 'starmap.png';
    a.click();
  };

  return (
    <div className="min-h-screen flex bg-[#0a0a0a] text-white">
      <div className="w-80 p-6 bg-neutral-900 border-r border-neutral-800 space-y-4 overflow-y-auto">
        <h2 className="text-xl font-bold">Starmap Editor</h2>
        <div><label className="text-xs text-neutral-500 uppercase">Title</label><input className="w-full mt-1 p-2 bg-black border border-neutral-800 rounded" value={title} onChange={e=>setTitle(e.target.value)} /></div>
        <div><label className="text-xs text-neutral-500 uppercase">Location & Date</label><input className="w-full mt-1 p-2 bg-black border border-neutral-800 rounded" value={subtitle} onChange={e=>setSubtitle(e.target.value)} /></div>
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
