import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function PantoneEditor() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const presetKey = searchParams.get('preset') || '';
  const [color, setColor] = useState('#ff7f50');
  const [title, setTitle] = useState(presetKey ? presetKey.replace(/-/g, ' ').toUpperCase() : 'SUNSET DATE');
  const [code, setCode] = useState('16-1543 TPX');
  
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

    const block = new fabric.Rect({ left: 20, top: 20, width: 360, height: 420, fill: color, selectable: false });
    const tText = new fabric.Textbox(title, { left: 30, top: 470, fontSize: 28, fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 'bold', fill: '#111', width: 340 });
    const cText = new fabric.Textbox(code, { left: 30, top: 510, fontSize: 16, fontFamily: 'Helvetica, Arial, sans-serif', fill: '#666', width: 340 });
    
    canvas.add(block, tText, cText);
    canvas.renderAll();
  };

  useEffect(() => { render(); }, [title, code, color]);

  const handleDownload = () => {
    if (!fabricRef.current) return;
    const a = document.createElement('a');
    a.href = fabricRef.current.toDataURL({ format: 'png', multiplier: 3 });
    a.download = 'pantone.png';
    a.click();
  };

  return (
    <div className="min-h-screen flex bg-[#0a0a0a] text-white">
      <div className="w-80 p-6 bg-neutral-900 border-r border-neutral-800 space-y-4 overflow-y-auto">
        <h2 className="text-xl font-bold">Pantone Editor</h2>
        <div><label className="text-xs text-neutral-500 uppercase">Color Name</label><input className="w-full mt-1 p-2 bg-black border border-neutral-800 rounded" value={title} onChange={e=>setTitle(e.target.value)} /></div>
        <div><label className="text-xs text-neutral-500 uppercase">Color Code / Hex</label><input className="w-full mt-1 p-2 bg-black border border-neutral-800 rounded" value={code} onChange={e=>setCode(e.target.value)} /></div>
        <div><label className="text-xs text-neutral-500 uppercase">Picker</label><input type="color" className="w-full h-10 mt-1 p-1 bg-black border border-neutral-800 rounded" value={color} onChange={e=>setColor(e.target.value)} /></div>
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
