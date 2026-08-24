import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const DEFAULT_PRESETS: Record<string, any> = {
  heartbeat: { topLeft: "BABY BOY", topRight: "14.05.2024", mainTitle: "FIRST HEARTBEAT", subtitle: "142 BPM", bottom1: "ULTRASOUND RECORDING", bottom2: "MEMORIAL HOSPITAL" },
  vows: { topLeft: "SARAH & JOHN", topRight: "OUR WEDDING DAY", mainTitle: "THE VOWS", subtitle: "A PROMISE FOREVER", bottom1: "RECORDED LIVE", bottom2: "24.08.2024" },
  first_dance: { topLeft: "SARAH & JOHN", topRight: "24.08.2024", mainTitle: "OUR FIRST DANCE", subtitle: "PERFECT BY ED SHEERAN", bottom1: "FOREVER AND ALWAYS", bottom2: "WEDDING NIGHT" },
  proposal: { topLeft: "SHE SAID YES", topRight: "24.08.2024", mainTitle: "WILL YOU MARRY ME?", subtitle: "THE PROPOSAL", bottom1: "HIDDEN AUDIO RECORDING", bottom2: "CENTRAL PARK, NY" },
  apology: { topLeft: "FROM ALEX", topRight: "TO SOPHIA", mainTitle: "I AM SO SORRY", subtitle: "PLEASE FORGIVE ME", bottom1: "A LATE NIGHT VOICE MESSAGE", bottom2: "DISTANCE MEANS NOTHING" },
  first_word: { topLeft: "EMMA'S FIRST WORD", topRight: "9 MONTHS OLD", mainTitle: "\"MAMA\"", subtitle: "RECORDED AT HOME", bottom1: "A MOMENT TO REMEMBER", bottom2: "12.10.2025" },
  memorial: { topLeft: "GRANDPA GEORGE", topRight: "1940 - 2024", mainTitle: "\"I AM ALWAYS WITH YOU\"", subtitle: "A SAVED VOICEMAIL", bottom1: "IN LOVING MEMORY", bottom2: "FOREVER IN OUR HEARTS" },
  pet_memorial: { topLeft: "CHARLIE THE GOLDEN", topRight: "2012 - 2025", mainTitle: "HAPPY BARKS", subtitle: "THE BEST BOY", bottom1: "THE SOUND OF HOME", bottom2: "WE WILL MISS YOU" },
  movie_quote: { topLeft: "MATTHEW MCCONAUGHEY", topRight: "2014", mainTitle: "INTERSTELLAR", subtitle: "\"LOVE IS THE ONE THING WE'RE CAPABLE OF PERCEIVING...\"", bottom1: "DIRECTED BY CHRISTOPHER NOLAN", bottom2: "HANS ZIMMER SCORE" },
  stand_up: { topLeft: "DAVE CHAPPELLE", topRight: "2023", mainTitle: "LAUGH OUT LOUD", subtitle: "THE CLOSER", bottom1: "COMEDY SPECIAL", bottom2: "NETFLIX" },
  time_capsule: { topLeft: "TOP SECRET", topRight: "OPEN IN 2035", mainTitle: "TIME CAPSULE", subtitle: "A MESSAGE TO MY FUTURE SELF", bottom1: "RECORDED ON JAN 1ST, 2024", bottom2: "ENCRYPTED AUDIO" }
};

export default function SoundwaveEditor() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const presetKey = searchParams.get('preset') || 'heartbeat';
  const initialData = DEFAULT_PRESETS[presetKey] || DEFAULT_PRESETS.heartbeat;

  const containerRef = useRef<HTMLDivElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);

  const [topLeft, setTopLeft] = useState(initialData.topLeft);
  const [topRight, setTopRight] = useState(initialData.topRight);
  const [mainTitle, setMainTitle] = useState(initialData.mainTitle);
  const [subtitle, setSubtitle] = useState(initialData.subtitle);
  const [bottom1, setBottom1] = useState(initialData.bottom1);
  const [bottom2, setBottom2] = useState(initialData.bottom2);
  
  const [bgColor, setBgColor] = useState('#111111');
  const [waveColor, setWaveColor] = useState('#ffffff');
  const [textColor, setTextColor] = useState('#ffffff');
  const [waveDensity, setWaveDensity] = useState(120);

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  const generateWavePath = (w: number, h: number, density: number) => {
    let path = '';
    const cy = h / 2;
    const step = w / density;
    
    for (let i = 0; i < density; i++) {
      const x = i * step;
      // create a bell curve envelope
      const normalizedX = (i / density) * 2 - 1; 
      const envelope = Math.exp(-Math.pow(normalizedX * 2, 2)); 
      
      const noise = Math.random();
      const amplitude = h * 0.4 * envelope * noise;
      
      if (amplitude > 2) {
        path += `M ${x} ${cy - amplitude} L ${x} ${cy + amplitude} `;
      }
    }
    return path;
  };

  const renderCanvas = () => {
    if (!fabricRef.current) return;
    const canvas = fabricRef.current;
    canvas.clear();

    const w = 600;
    const h = 800;
    
    const bg = new fabric.Rect({
      left: 0, top: 0, width: w, height: h, fill: bgColor, selectable: false
    });
    canvas.add(bg);

    const fontSettings = {
      fontFamily: 'Inter, sans-serif',
      fill: textColor,
      selectable: true,
    };

    // Top texts
    canvas.add(new fabric.Textbox(topLeft, {
      ...fontSettings, left: 40, top: 40, fontSize: 14, fontWeight: 600, width: 200
    }));
    
    canvas.add(new fabric.Textbox(topRight, {
      ...fontSettings, left: w - 240, top: 40, fontSize: 14, fontWeight: 600, width: 200, textAlign: 'right'
    }));

    // Center Texts
    const title = new fabric.Textbox(mainTitle, {
      ...fontSettings, left: w/2, top: h * 0.2, fontSize: 36, fontWeight: 800, width: w - 80, originX: 'center', textAlign: 'center', charSpacing: 100
    });
    canvas.add(title);

    const sub = new fabric.Textbox(subtitle, {
      ...fontSettings, left: w/2, top: h * 0.2 + 50, fontSize: 16, fontWeight: 400, width: w - 80, originX: 'center', textAlign: 'center', charSpacing: 200
    });
    canvas.add(sub);

    // Soundwave Path
    const pathString = generateWavePath(w - 120, h * 0.3, waveDensity);
    const wave = new fabric.Path(pathString, {
      left: w/2, top: h/2, originX: 'center', originY: 'center',
      fill: '', stroke: waveColor, strokeWidth: 1.5, strokeLineCap: 'round', selectable: false
    });
    canvas.add(wave);

    // Bottom Texts
    const b1 = new fabric.Textbox(bottom1, {
      ...fontSettings, left: w/2, top: h * 0.85, fontSize: 14, fontWeight: 600, width: w - 80, originX: 'center', textAlign: 'center', charSpacing: 100
    });
    canvas.add(b1);

    const b2 = new fabric.Textbox(bottom2, {
      ...fontSettings, left: w/2, top: h * 0.85 + 25, fontSize: 12, fontWeight: 400, fill: textColor, opacity: 0.7, width: w - 80, originX: 'center', textAlign: 'center', charSpacing: 50
    });
    canvas.add(b2);

    canvas.renderAll();
  };

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';
    const canvasEl = document.createElement('canvas');
    canvasEl.width = 600;
    canvasEl.height = 800;
    containerRef.current.appendChild(canvasEl);

    fabricRef.current = new fabric.Canvas(canvasEl, {
      width: 600, height: 800, backgroundColor: bgColor
    });
    renderCanvas();
    setTimeout(renderCanvas, 300);
    return () => { fabricRef.current?.dispose(); };
  }, []);

  useEffect(() => {
    renderCanvas();
  }, [topLeft, topRight, mainTitle, subtitle, bottom1, bottom2, bgColor, waveColor, textColor, waveDensity]);

  const handleDownload = () => {
    if (!fabricRef.current) return;
    const dataUrl = fabricRef.current.toDataURL({ format: 'png', multiplier: 2 });
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = 'soundwave-poster.png';
    a.click();
  };

  return (
    <div className="min-h-screen flex bg-[#0a0a0a] text-white">
      <div className="w-80 bg-neutral-900 border-r border-neutral-800 p-6 overflow-y-auto">
        <h2 className="text-xl font-bold mb-6">Soundwave Editor</h2>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-xs font-bold text-neutral-500 uppercase mb-2">Top Left</label>
              <input type="text" value={topLeft} onChange={e => setTopLeft(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm focus:border-white outline-none" />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-neutral-500 uppercase mb-2">Top Right</label>
              <input type="text" value={topRight} onChange={e => setTopRight(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm focus:border-white outline-none" />
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-800">
            <label className="block text-xs font-bold text-neutral-500 uppercase mb-2">Main Title</label>
            <input type="text" value={mainTitle} onChange={e => setMainTitle(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm focus:border-white outline-none mb-3" />
            
            <label className="block text-xs font-bold text-neutral-500 uppercase mb-2">Subtitle</label>
            <input type="text" value={subtitle} onChange={e => setSubtitle(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm focus:border-white outline-none" />
          </div>

          <div className="pt-4 border-t border-neutral-800">
            <label className="block text-xs font-bold text-neutral-500 uppercase mb-2">Bottom Line 1</label>
            <input type="text" value={bottom1} onChange={e => setBottom1(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm focus:border-white outline-none mb-3" />
            
            <label className="block text-xs font-bold text-neutral-500 uppercase mb-2">Bottom Line 2</label>
            <input type="text" value={bottom2} onChange={e => setBottom2(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm focus:border-white outline-none" />
          </div>

          <div className="pt-4 border-t border-neutral-800">
            <label className="block text-xs font-bold text-neutral-500 uppercase mb-2">Colors</label>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">Background</span>
              <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="w-8 h-8 rounded bg-transparent cursor-pointer" />
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">Wave</span>
              <input type="color" value={waveColor} onChange={e => setWaveColor(e.target.value)} className="w-8 h-8 rounded bg-transparent cursor-pointer" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Text</span>
              <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} className="w-8 h-8 rounded bg-transparent cursor-pointer" />
            </div>
          </div>
          
          <div className="pt-4 border-t border-neutral-800">
            <label className="block text-xs font-bold text-neutral-500 uppercase mb-2">Wave Density</label>
            <input type="range" min="30" max="300" value={waveDensity} onChange={e => setWaveDensity(Number(e.target.value))} className="w-full accent-white" />
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-neutral-950 overflow-y-auto">
        <div className="mb-6 flex gap-4 w-full max-w-[600px]">
          <button onClick={() => navigate('/')} className="flex items-center justify-center gap-2 bg-neutral-800 text-white font-semibold py-3 px-6 rounded-xl hover:bg-neutral-700 transition-colors">
            <ArrowLeft className="w-5 h-5" /> Back
          </button>
          <button onClick={handleDownload} className="flex-1 bg-white text-black font-semibold py-3 rounded-xl hover:bg-neutral-200 transition-colors">
            Download PNG
          </button>
        </div>
        <div ref={containerRef} className="shadow-2xl rounded-sm overflow-hidden flex-shrink-0" style={{ width: 600, height: 800 }} />
      </div>
    </div>
  );
}
