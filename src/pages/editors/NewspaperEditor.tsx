import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function NewspaperEditor() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const presetKey = searchParams.get('preset') || '';
  const [headline, setHeadline] = useState(presetKey ? presetKey.replace(/-/g, ' ').toUpperCase() : 'THE LEGEND IS BORN');
  const [subheadline, setSubheadline] = useState('AN EXTRAORDINARY DAY IN HISTORY');
  const [date, setDate] = useState('OCTOBER 24, 1994');
  
  const containerRef = useRef<HTMLDivElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Inter:wght@400;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';
    const canvasEl = document.createElement('canvas');
    canvasEl.width = 400;
    canvasEl.height = 600;
    containerRef.current.appendChild(canvasEl);
    
    fabricRef.current = new fabric.Canvas(canvasEl, { width: 400, height: 600, backgroundColor: '#f8f5ed' });
    render();
    setTimeout(render, 500);
    return () => fabricRef.current?.dispose();
  }, []);

  const render = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.clear();
    
    const bg = new fabric.Rect({ left: 0, top: 0, width: 400, height: 600, fill: '#f8f5ed', selectable: false });
    canvas.add(bg);

    const header = new fabric.Textbox("THE DAILY POST", { left: 200, top: 30, fontSize: 36, fontFamily: 'Playfair Display, serif', fill: '#111', originX: 'center', textAlign: 'center', width: 380, fontWeight: 900 });
    const line1 = new fabric.Line([20, 75, 380, 75], { stroke: '#111', strokeWidth: 2 });
    const dateLine = new fabric.Textbox(`Vol. 1 No. 1  •  ${date}  •  10 CENTS`, { left: 200, top: 85, fontSize: 10, fontFamily: 'Inter, sans-serif', fill: '#333', originX: 'center', textAlign: 'center', width: 380 });
    const line2 = new fabric.Line([20, 105, 380, 105], { stroke: '#111', strokeWidth: 1 });
    
    const hl = new fabric.Textbox(headline, { left: 200, top: 130, fontSize: 44, fontFamily: 'Playfair Display, serif', fill: '#111', originX: 'center', textAlign: 'center', width: 360, fontWeight: 'bold', lineHeight: 1 });
    
    const sh = new fabric.Textbox(subheadline, { left: 200, top: hl.top + hl.height + 20, fontSize: 14, fontFamily: 'Inter, sans-serif', fill: '#444', originX: 'center', textAlign: 'center', width: 360, fontWeight: 'bold' });
    
    const photo = new fabric.Rect({ left: 200, top: sh.top + sh.height + 100, width: 240, height: 160, fill: '#e0e0e0', originX: 'center', originY: 'center', stroke: '#111', strokeWidth: 1 });
    const pText = new fabric.Textbox("UPLOAD PHOTO", { left: 200, top: sh.top + sh.height + 100, fontSize: 14, fontFamily: 'Inter, sans-serif', fill: '#666', originX: 'center', originY: 'center', textAlign: 'center' });

    canvas.add(header, line1, dateLine, line2, hl, sh, photo, pText);
    canvas.renderAll();
  };

  useEffect(() => { render(); }, [headline, subheadline, date]);

  const handleDownload = () => {
    if (!fabricRef.current) return;
    const a = document.createElement('a');
    a.href = fabricRef.current.toDataURL({ format: 'png', multiplier: 3 });
    a.download = 'newspaper.png';
    a.click();
  };

  return (
    <div className="min-h-screen flex bg-[#0a0a0a] text-white">
      <div className="w-80 p-6 bg-neutral-900 border-r border-neutral-800 space-y-4 overflow-y-auto">
        <h2 className="text-xl font-bold">Newspaper Editor</h2>
        <div><label className="text-xs text-neutral-500 uppercase">Headline</label><input className="w-full mt-1 p-2 bg-black border border-neutral-800 rounded" value={headline} onChange={e=>setHeadline(e.target.value)} /></div>
        <div><label className="text-xs text-neutral-500 uppercase">Subheadline</label><input className="w-full mt-1 p-2 bg-black border border-neutral-800 rounded" value={subheadline} onChange={e=>setSubheadline(e.target.value)} /></div>
        <div><label className="text-xs text-neutral-500 uppercase">Date</label><input className="w-full mt-1 p-2 bg-black border border-neutral-800 rounded" value={date} onChange={e=>setDate(e.target.value)} /></div>
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
