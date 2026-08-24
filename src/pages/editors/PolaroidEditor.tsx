import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function PolaroidEditor() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const presetKey = searchParams.get('preset') || '';
  const [caption, setCaption] = useState(presetKey ? presetKey.replace(/-/g, ' ') : 'Summer of 2024');
  
  const containerRef = useRef<HTMLDivElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Caveat:wght@600&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';
    const canvasEl = document.createElement('canvas');
    canvasEl.width = 400;
    canvasEl.height = 600;
    containerRef.current.appendChild(canvasEl);

    fabricRef.current = new fabric.Canvas(canvasEl, { width: 400, height: 600, backgroundColor: '#e0e0e0' });
    render();
    setTimeout(render, 500);
    return () => fabricRef.current?.dispose();
  }, []);

  const render = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.clear();
    
    const bg = new fabric.Rect({ left: 0, top: 0, width: 400, height: 600, fill: '#e0e0e0', selectable: false });
    canvas.add(bg);

    const frame = new fabric.Rect({ left: 200, top: 300, width: 340, height: 440, fill: '#fff', originX: 'center', originY: 'center', shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.15)', blur: 15, offsetY: 10 }) });
    const photo = new fabric.Rect({ left: 200, top: 250, width: 300, height: 320, fill: '#ccc', originX: 'center', originY: 'center' });
    const pText = new fabric.Textbox("UPLOAD PHOTO\n(Demo Placeholder)", { left: 200, top: 250, fontSize: 16, fontFamily: 'sans-serif', fill: '#666', originX: 'center', originY: 'center', textAlign: 'center' });
    
    const cText = new fabric.Textbox(caption, { left: 200, top: 450, fontSize: 36, fontFamily: 'Caveat, cursive', fill: '#222', originX: 'center', textAlign: 'center', width: 300 });
    
    canvas.add(frame, photo, pText, cText);
    canvas.renderAll();
  };

  useEffect(() => { render(); }, [caption]);

  const handleDownload = () => {
    if (!fabricRef.current) return;
    const a = document.createElement('a');
    a.href = fabricRef.current.toDataURL({ format: 'png', multiplier: 3 });
    a.download = 'polaroid.png';
    a.click();
  };

  return (
    <div className="min-h-screen flex bg-[#0a0a0a] text-white">
      <div className="w-80 p-6 bg-neutral-900 border-r border-neutral-800 space-y-4 overflow-y-auto">
        <h2 className="text-xl font-bold">Polaroid Editor</h2>
        <div><label className="text-xs text-neutral-500 uppercase">Caption</label><input className="w-full mt-1 p-2 bg-black border border-neutral-800 rounded" value={caption} onChange={e=>setCaption(e.target.value)} /></div>
        <div className="text-xs text-neutral-400 p-3 bg-neutral-800 rounded">Note: Image uploading will replace the grey box in the final version.</div>
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
