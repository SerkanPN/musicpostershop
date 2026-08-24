import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function CassetteEditor() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const presetKey = searchParams.get('preset') || '';
  const [title, setTitle] = useState(presetKey ? presetKey.replace(/-/g, ' ').toUpperCase() : 'AWESOME MIX VOL. 1');
  const [subtitle, setSubtitle] = useState('SIDE A');
  const [bgColor, setBgColor] = useState('#f4d03f');
  
  const containerRef = useRef<HTMLDivElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';
    const canvasEl = document.createElement('canvas');
    canvasEl.width = 400;
    canvasEl.height = 600;
    containerRef.current.appendChild(canvasEl);

    fabricRef.current = new fabric.Canvas(canvasEl, { width: 400, height: 600, backgroundColor: bgColor });
    render();
    return () => fabricRef.current?.dispose();
  }, []);

  const render = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.clear();
    
    const bg = new fabric.Rect({ left: 0, top: 0, width: 400, height: 600, fill: bgColor, selectable: false });
    canvas.add(bg);

    // Cassette Body
    const tape = new fabric.Rect({ left: 200, top: 300, width: 340, height: 220, rx: 15, ry: 15, originX: 'center', originY: 'center', fill: '#222', selectable: false });
    const labelBg = new fabric.Rect({ left: 200, top: 280, width: 280, height: 140, rx: 8, ry: 8, originX: 'center', originY: 'center', fill: '#fff', selectable: false });
    const hole1 = new fabric.Circle({ left: 130, top: 280, radius: 25, originX: 'center', originY: 'center', fill: bgColor, selectable: false });
    const hole2 = new fabric.Circle({ left: 270, top: 280, radius: 25, originX: 'center', originY: 'center', fill: bgColor, selectable: false });
    const bottomCutout = new fabric.Rect({ left: 200, top: 380, width: 200, height: 40, rx: 5, ry: 5, originX: 'center', originY: 'center', fill: '#111', selectable: false });
    
    canvas.add(tape, labelBg, hole1, hole2, bottomCutout);

    const tText = new fabric.Textbox(title, { left: 200, top: 230, fontSize: 24, fontFamily: 'Courier New, monospace', fontWeight: 'bold', fill: '#d32f2f', originX: 'center', textAlign: 'center', width: 260 });
    const sText = new fabric.Textbox(subtitle, { left: 200, top: 330, fontSize: 16, fontFamily: 'sans-serif', fill: '#333', originX: 'center', textAlign: 'center', width: 260 });
    
    canvas.add(tText, sText);
    canvas.renderAll();
  };

  useEffect(() => { render(); }, [title, subtitle, bgColor]);

  const handleDownload = () => {
    if (!fabricRef.current) return;
    const a = document.createElement('a');
    a.href = fabricRef.current.toDataURL({ format: 'png', multiplier: 3 });
    a.download = 'cassette.png';
    a.click();
  };

  return (
    <div className="min-h-screen flex bg-[#0a0a0a] text-white">
      <div className="w-80 p-6 bg-neutral-900 border-r border-neutral-800 space-y-4 overflow-y-auto">
        <h2 className="text-xl font-bold">Cassette Editor</h2>
        <div><label className="text-xs text-neutral-500 uppercase">Tape Title</label><input className="w-full mt-1 p-2 bg-black border border-neutral-800 rounded" value={title} onChange={e=>setTitle(e.target.value)} /></div>
        <div><label className="text-xs text-neutral-500 uppercase">Subtext</label><input className="w-full mt-1 p-2 bg-black border border-neutral-800 rounded" value={subtitle} onChange={e=>setSubtitle(e.target.value)} /></div>
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
