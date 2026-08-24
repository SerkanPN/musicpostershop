import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function PatentEditor() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const presetKey = searchParams.get('preset') || '';
  const [title, setTitle] = useState(presetKey ? presetKey.replace(/-/g, ' ').toUpperCase() : 'CONTROLLER');
  const [number, setNumber] = useState('US 1,234,567 B1');
  const [date, setDate] = useState('Jan. 1, 2024');
  
  const containerRef = useRef<HTMLDivElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';
    const canvasEl = document.createElement('canvas');
    canvasEl.width = 400;
    canvasEl.height = 600;
    containerRef.current.appendChild(canvasEl);

    fabricRef.current = new fabric.Canvas(canvasEl, { width: 400, height: 600, backgroundColor: '#1a3c63' });
    render();
    return () => fabricRef.current?.dispose();
  }, []);

  const render = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.clear();
    
    const bg = new fabric.Rect({ left: 0, top: 0, width: 400, height: 600, fill: '#1a3c63', selectable: false });
    canvas.add(bg);

    const fontSet = { fontFamily: 'Courier New, monospace', fill: '#fff', textAlign: 'center' as const };
    
    const headText = new fabric.Textbox(`U.S. Patent\n${date}\n${number}`, { ...fontSet, left: 200, top: 40, fontSize: 14, originX: 'center', width: 360 });
    const tText = new fabric.Textbox(title, { ...fontSet, left: 200, top: 120, fontSize: 24, originX: 'center', width: 360, fontWeight: 'bold' });
    
    // Abstract lines mimicking blueprint
    const l1 = new fabric.Line([50, 100, 350, 100], { stroke: '#fff', strokeWidth: 1 });
    const box = new fabric.Rect({ left: 200, top: 320, width: 220, height: 220, fill: 'transparent', stroke: '#fff', strokeWidth: 2, originX: 'center', originY: 'center', strokeDashArray: [5, 5] });
    
    const fText = new fabric.Textbox("FIG. 1", { ...fontSet, left: 200, top: 460, fontSize: 18, originX: 'center', width: 360 });
    
    canvas.add(headText, l1, tText, box, fText);
    canvas.renderAll();
  };

  useEffect(() => { render(); }, [title, number, date]);

  const handleDownload = () => {
    if (!fabricRef.current) return;
    const a = document.createElement('a');
    a.href = fabricRef.current.toDataURL({ format: 'png', multiplier: 3 });
    a.download = 'patent.png';
    a.click();
  };

  return (
    <div className="min-h-screen flex bg-[#0a0a0a] text-white">
      <div className="w-80 p-6 bg-neutral-900 border-r border-neutral-800 space-y-4 overflow-y-auto">
        <h2 className="text-xl font-bold">Patent Editor</h2>
        <div><label className="text-xs text-neutral-500 uppercase">Patent Title</label><input className="w-full mt-1 p-2 bg-black border border-neutral-800 rounded" value={title} onChange={e=>setTitle(e.target.value)} /></div>
        <div><label className="text-xs text-neutral-500 uppercase">Patent No.</label><input className="w-full mt-1 p-2 bg-black border border-neutral-800 rounded" value={number} onChange={e=>setNumber(e.target.value)} /></div>
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
