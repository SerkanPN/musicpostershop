import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function CoordinatesEditor() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const presetKey = searchParams.get('preset') || '';
  const [title, setTitle] = useState(presetKey ? presetKey.replace(/-/g, ' ').toUpperCase() : 'OUR FIRST HOME');
  const [coords, setCoords] = useState('40° 42\' 46" N  74° 0\' 21" W');
  const [subtitle, setSubtitle] = useState('NEW YORK CITY, NY');
  
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
    
    fabricRef.current = new fabric.Canvas(canvasEl, { width: 400, height: 600, backgroundColor: '#ffffff' });
    render();
    setTimeout(render, 500);
    return () => fabricRef.current?.dispose();
  }, []);

  const render = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.clear();
    
    const bg = new fabric.Rect({ left: 0, top: 0, width: 400, height: 600, fill: '#fff', selectable: false });
    canvas.add(bg);

    const cText = new fabric.Textbox(coords, { left: 200, top: 250, fontSize: 28, fontFamily: 'Playfair Display, serif', fill: '#111', originX: 'center', textAlign: 'center', width: 360 });
    const line = new fabric.Line([160, 320, 240, 320], { stroke: '#111', strokeWidth: 1, selectable: false });
    const tText = new fabric.Textbox(title, { left: 200, top: 350, fontSize: 16, fontFamily: 'Inter, sans-serif', fontWeight: 700, fill: '#111', originX: 'center', textAlign: 'center', width: 360, charSpacing: 200 });
    const sText = new fabric.Textbox(subtitle, { left: 200, top: 380, fontSize: 12, fontFamily: 'Inter, sans-serif', fill: '#666', originX: 'center', textAlign: 'center', width: 360, charSpacing: 100 });
    
    canvas.add(cText, line, tText, sText);
    canvas.renderAll();
  };

  useEffect(() => { render(); }, [title, coords, subtitle]);

  const handleDownload = () => {
    if (!fabricRef.current) return;
    const a = document.createElement('a');
    a.href = fabricRef.current.toDataURL({ format: 'png', multiplier: 3 });
    a.download = 'coordinates.png';
    a.click();
  };

  return (
    <div className="min-h-screen flex bg-[#0a0a0a] text-white">
      <div className="w-80 p-6 bg-neutral-900 border-r border-neutral-800 space-y-4 overflow-y-auto">
        <h2 className="text-xl font-bold">Coordinates Editor</h2>
        <div><label className="text-xs text-neutral-500 uppercase">Coordinates</label><input className="w-full mt-1 p-2 bg-black border border-neutral-800 rounded" value={coords} onChange={e=>setCoords(e.target.value)} /></div>
        <div><label className="text-xs text-neutral-500 uppercase">Title</label><input className="w-full mt-1 p-2 bg-black border border-neutral-800 rounded" value={title} onChange={e=>setTitle(e.target.value)} /></div>
        <div><label className="text-xs text-neutral-500 uppercase">Location</label><input className="w-full mt-1 p-2 bg-black border border-neutral-800 rounded" value={subtitle} onChange={e=>setSubtitle(e.target.value)} /></div>
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
