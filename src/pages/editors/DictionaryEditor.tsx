import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const DEFAULT_PRESETS: Record<string, any> = {
  name: { word: "Emily", phonetic: "/ˈem.ə.li/", partOfSpeech: "[noun]", definitions: ["1. A person who brings light into every room they enter.", "2. Capable of surviving entirely on iced coffee and good vibes.", "3. The best friend anyone could ask for."], footer: "See also: sunshine, loyal, unstoppable." },
  developer: { word: "Developer", phonetic: "/dɪˈvel.ə.pər/", partOfSpeech: "[noun]", definitions: ["1. An organism that turns coffee into code.", "2. Someone who spends hours fixing a bug that they created.", "3. A professional Googler."], footer: "Synonyms: wizard, hacker, tired." },
  mom: { word: "Mom", phonetic: "/mɒm/", partOfSpeech: "[noun]", definitions: ["1. The woman who loves you unconditionally from birth.", "2. A superhero in disguise who can find anything you've lost.", "3. The glue that holds the entire family together."], footer: "Synonyms: superwoman, angel, best friend." },
  dad: { word: "Dad", phonetic: "/dæd/", partOfSpeech: "[noun]", definitions: ["1. The man with the best (and worst) jokes.", "2. Personal ATM, spider killer, and ultimate protector.", "3. Someone who gives the best advice when you need it most."], footer: "Synonyms: hero, fixer, legend." },
  family: { word: "Family", phonetic: "/ˈfæm.əl.i/", partOfSpeech: "[noun]", definitions: ["1. Life's greatest blessing. A group that dreams, laughs, plays and loves together.", "2. Those whom you can always count on.", "3. Not always connected by blood, but always by heart."], footer: "See also: home, love, forever." },
  siblings: { word: "Siblings", phonetic: "/ˈsɪb.lɪŋz/", partOfSpeech: "[noun]", definitions: ["1. Your only enemy you can't live without.", "2. People who teach you about fairness, cooperation, and how to fight.", "3. Partners in crime since day one."], footer: "Synonyms: best friends, rivals, blood." },
  legal_18: { word: "Eighteen", phonetic: "/ˌeɪˈtiːn/", partOfSpeech: "[noun]", definitions: ["1. The age where you are legally an adult but still feel like a kid.", "2. Officially old enough to know better, but young enough to do it anyway.", "3. The beginning of the best chapter."], footer: "See also: freedom, responsibilities, adulthood." },
  thirty: { word: "Thirty", phonetic: "/ˈθɜː.ti/", partOfSpeech: "[noun]", definitions: ["1. When your back starts hurting for no reason.", "2. The age you realize your parents were right about everything.", "3. Twenty, but with money and wisdom."], footer: "Synonyms: dirty thirty, thriving, tired." },
  retirement: { word: "Retirement", phonetic: "/rɪˈtaɪə.mənt/", partOfSpeech: "[noun]", definitions: ["1. The world's longest coffee break.", "2. When you stop living at work and start working at living.", "3. Goodbye tension, hello pension."], footer: "See also: freedom, vacation, golf." },
  sobriety: { word: "Sobriety", phonetic: "/səˈbraɪ.ə.ti/", partOfSpeech: "[noun]", definitions: ["1. The state of being awake, aware, and fully alive.", "2. Taking life one day at a time.", "3. The hardest but most rewarding journey of a lifetime."], footer: "Synonyms: clarity, strength, rebirth." },
  expat: { word: "Expat", phonetic: "/ˈek.spæt/", partOfSpeech: "[noun]", definitions: ["1. Someone brave enough to leave their comfort zone.", "2. A person whose heart belongs to two different countries.", "3. Living a life full of hellos and goodbyes."], footer: "See also: adventurer, brave, wanderlust." },
  rescue: { word: "Rescue", phonetic: "/ˈres.kjuː/", partOfSpeech: "[noun]", definitions: ["1. Saving a life, only to find out they saved yours.", "2. A breed of dog/cat that is purely made of love.", "3. The best decision you'll ever make."], footer: "Synonyms: adopted, loved, family." },
  values: { word: "Core Values", phonetic: "/kɔːr ˈvæl.juːz/", partOfSpeech: "[noun]", definitions: ["1. The fundamental beliefs of an organization.", "2. What we stand for even when nobody is watching.", "3. The guiding principles that dictate our behavior and action."], footer: "See also: integrity, excellence, teamwork." },
  teacher: { word: "Teacher", phonetic: "/ˈtiː.tʃər/", partOfSpeech: "[noun]", definitions: ["1. A person who helps you solve problems you'd never have without them.", "2. A multi-tasking educational rockstar who lives on coffee.", "3. Someone who inspires you to be better."], footer: "Synonyms: mentor, hero, guide." },
  chef: { word: "Chef", phonetic: "/ʃef/", partOfSpeech: "[noun]", definitions: ["1. An artist whose medium is food.", "2. Someone who feeds the soul as well as the stomach.", "3. A master of fire, knives, and shouting 'Yes Chef!'"], footer: "Synonyms: culinary artist, boss, creator." },
  astrology: { word: "Scorpio", phonetic: "/ˈskɔː.pi.əʊ/", partOfSpeech: "[noun]", definitions: ["1. Passionate, independent, and unafraid to blaze their own trail.", "2. Excellent at keeping secrets and holding grudges.", "3. The most intense sign of the zodiac."], footer: "See also: water sign, loyal, mysterious." },
  inside_joke: { word: "Inside Joke", phonetic: "/ɪnˈsaɪd dʒəʊk/", partOfSpeech: "[noun]", definitions: ["1. A joke that is only understood by a specific group of people.", "2. Something that makes you laugh uncontrollably in public.", "3. 'You had to be there.'"], footer: "Synonyms: shared memory, best friends." },
  manifesto: { word: "Hustle", phonetic: "/ˈhʌs.əl/", partOfSpeech: "[verb]", definitions: ["1. To work relentlessly toward a goal.", "2. Pushing through when everyone else has given up.", "3. Making things happen instead of waiting for them to happen."], footer: "See also: grind, dedication, success." }
};

export default function DictionaryEditor() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const presetKey = searchParams.get('preset') || 'name';
  // Use 'name' as a fallback if the presetKey isn't in DEFAULT_PRESETS
  const initialData = DEFAULT_PRESETS[presetKey] || DEFAULT_PRESETS.name;

  const containerRef = useRef<HTMLDivElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);

  const [word, setWord] = useState(initialData.word);
  const [phonetic, setPhonetic] = useState(initialData.phonetic);
  const [partOfSpeech, setPartOfSpeech] = useState(initialData.partOfSpeech);
  const [definitions, setDefinitions] = useState(initialData.definitions);
  const [footer, setFooter] = useState(initialData.footer);

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@400;500&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  const renderCanvas = () => {
    if (!fabricRef.current) return;
    const canvas = fabricRef.current;
    canvas.clear();

    const w = 480;
    const h = 640;
    
    const bg = new fabric.Rect({
      left: 0, top: 0, width: w, height: h, fill: '#fbfbfb', selectable: false
    });
    canvas.add(bg);

    let yOffset = 100;
    const padding = 60;
    const textColor = '#111111';

    // Word
    const wordText = new fabric.Textbox(word.toLowerCase(), {
      fontFamily: 'Playfair Display, serif',
      fill: textColor, left: padding, top: yOffset,
      fontSize: 56, fontWeight: 700, width: w - padding * 2,
      selectable: true
    });
    canvas.add(wordText);
    yOffset += wordText.height + 15;

    // Phonetic & Part of speech
    const subText = new fabric.Textbox(`${phonetic}  ${partOfSpeech}`, {
      fontFamily: 'Inter, sans-serif',
      fill: '#555555', left: padding, top: yOffset,
      fontSize: 16, width: w - padding * 2,
      selectable: true
    });
    canvas.add(subText);
    yOffset += subText.height + 40;

    // Definitions
    definitions.forEach((def: string) => {
      const defText = new fabric.Textbox(def, {
        fontFamily: 'Playfair Display, serif',
        fill: textColor, left: padding, top: yOffset,
        fontSize: 18, width: w - padding * 2,
        lineHeight: 1.4, selectable: true
      });
      canvas.add(defText);
      yOffset += defText.height + 20;
    });

    // Footer
    if (footer) {
      yOffset += 20;
      const footerText = new fabric.Textbox(footer, {
        fontFamily: 'Inter, sans-serif',
        fontStyle: 'italic',
        fill: '#666666', left: padding, top: yOffset,
        fontSize: 14, width: w - padding * 2,
        selectable: true
      });
      canvas.add(footerText);
    }

    canvas.renderAll();
  };

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';
    const canvasEl = document.createElement('canvas');
    canvasEl.width = 480;
    canvasEl.height = 640;
    containerRef.current.appendChild(canvasEl);

    fabricRef.current = new fabric.Canvas(canvasEl, {
      width: 480, height: 640, backgroundColor: '#fbfbfb'
    });
    renderCanvas();
    setTimeout(renderCanvas, 600);
    return () => { fabricRef.current?.dispose(); };
  }, []);

  useEffect(() => {
    renderCanvas();
  }, [word, phonetic, partOfSpeech, definitions, footer]);

  const handleDownload = () => {
    if (!fabricRef.current) return;
    const dataUrl = fabricRef.current.toDataURL({ format: 'png', multiplier: 3 });
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = 'dictionary-poster.png';
    a.click();
  };

  return (
    <div className="min-h-screen flex bg-[#0a0a0a] text-white">
      <div className="w-80 bg-neutral-900 border-r border-neutral-800 p-6 overflow-y-auto">
        <h2 className="text-xl font-bold mb-6">Dictionary Editor</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-neutral-500 uppercase mb-2">Word</label>
            <input type="text" value={word} onChange={e => setWord(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm focus:border-white outline-none" />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-xs font-bold text-neutral-500 uppercase mb-2">Phonetic</label>
              <input type="text" value={phonetic} onChange={e => setPhonetic(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm focus:border-white outline-none" />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-neutral-500 uppercase mb-2">Type</label>
              <input type="text" value={partOfSpeech} onChange={e => setPartOfSpeech(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm focus:border-white outline-none" />
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-800 space-y-3">
            <label className="block text-xs font-bold text-neutral-500 uppercase mb-2">Definitions</label>
            {definitions.map((def: string, i: number) => (
              <textarea
                key={i}
                value={def}
                onChange={e => {
                  const newDefs = [...definitions];
                  newDefs[i] = e.target.value;
                  setDefinitions(newDefs);
                }}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm focus:border-white outline-none min-h-[60px]"
              />
            ))}
          </div>

          <div className="pt-4 border-t border-neutral-800">
            <label className="block text-xs font-bold text-neutral-500 uppercase mb-2">Footer / See Also</label>
            <input type="text" value={footer} onChange={e => setFooter(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm focus:border-white outline-none" />
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-neutral-950 overflow-y-auto">
        <div className="mb-6 flex gap-4 w-full max-w-[480px]">
          <button onClick={() => navigate('/')} className="flex items-center justify-center gap-2 bg-neutral-800 text-white font-semibold py-3 px-6 rounded-xl hover:bg-neutral-700 transition-colors">
            <ArrowLeft className="w-5 h-5" /> Back
          </button>
          <button onClick={handleDownload} className="flex-1 bg-white text-black font-semibold py-3 rounded-xl hover:bg-neutral-200 transition-colors">
            Download PNG
          </button>
        </div>
        <div ref={containerRef} className="shadow-2xl rounded-sm overflow-hidden flex-shrink-0" style={{ width: 480, height: 640 }} />
      </div>
    </div>
  );
}
