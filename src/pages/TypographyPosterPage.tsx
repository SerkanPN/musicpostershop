import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as fabric from 'fabric';
import jsPDF from 'jspdf';
import { AlertTriangle, Lock, MessageCircle, X, CheckCircle, BookOpen, AlignLeft, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';

const GOOGLE_FONTS = [
  "Playfair Display", "Cinzel", "Prata", "Lora", "Merriweather", "Crimson Text",
  "Montserrat", "Inter", "Roboto", "Open Sans", "Oswald", "Bebas Neue", "Space Mono",
  "Courier Prime", "Josefin Sans", "Dancing Script", "Caveat", "Abril Fatface"
];

const PRINT_SIZES = [
  { value: '5.83x8.27', label: 'A5 (5.83" x 8.27")' },
  { value: '8.27x11.69', label: 'A4 (8.27" x 11.69")' },
  { value: '11.69x16.54', label: 'A3 (11.69" x 16.54")' },
  { value: '16.54x23.39', label: 'A2 (16.54" x 23.39")' },
  { value: '23.39x33.11', label: 'A1 (23.39" x 33.11")' },
  { value: '5x7', label: '5" x 7"' },
  { value: '6x8', label: '6" x 8"' },
  { value: '8x10', label: '8" x 10"' },
  { value: '9x11', label: '9" x 11"' },
  { value: '11x14', label: '11" x 14"' },
  { value: '11x17', label: '11" x 17"' },
  { value: '11.7x16.5', label: '11.7" x 16.5"' },
  { value: '12x16', label: '12" x 16"' },
  { value: '12x18', label: '12" x 18"' },
  { value: '16x20', label: '16" x 20"' },
  { value: '16x24', label: '16" x 24"' },
  { value: '16.5x23.4', label: '16.5" x 23.4"' },
  { value: '18x24', label: '18" x 24"' },
  { value: '20x30', label: '20" x 30"' },
  { value: '22x34', label: '22" x 34"' },
  { value: '23.4x33.1', label: '23.4" x 33.1"' },
  { value: '24x32', label: '24" x 32"' },
  { value: '24x36', label: '24" x 36"' },
  { value: '26x36', label: '26" x 36"' },
  { value: '28x40', label: '28" x 40"' },
  { value: '30x40', label: '30" x 40"' },
  { value: '40x50', label: '40" x 50"' },
  { value: '50x60', label: '50" x 60"' },
  { value: '60x80', label: '60" x 80"' },
  { value: '68x80', label: '68" x 80"' },
  { value: '88x104', label: '88" x 104"' },
];

const PRESETS: Record<string, {
  label: string;
  category: string;
  mode: 'dictionary' | 'manifesto';
  word: string;
  phonetic: string;
  partOfSpeech: string;
  definition1: string;
  definition2: string;
  definition3: string;
  synonyms: string;
  quote: string;
  author: string;
  bg: string;
  text: string;
  accent: string;
  font: string;
}> = {
  'dictionary-mom': {
    label: 'Mom Definition', category: 'Family', mode: 'dictionary',
    word: 'mom', phonetic: '/mɒm/', partOfSpeech: 'noun',
    definition1: '1. One who loves unconditionally and knows where everything is.',
    definition2: '2. Master of multitasking, emotional healer, chef, and protector.',
    definition3: '3. The anchor of the family whose hugs make everything better.',
    synonyms: 'superhero, best friend, unconditional love, heart of gold',
    quote: '"A mother is she who can take the place of all others but whose place no one else can take."',
    author: 'CARDINAL MERMILLOD',
    bg: '#fdfbf7', text: '#1c1917', accent: '#b45309', font: 'Playfair Display'
  },
  'dictionary-dad': {
    label: 'Dad Definition', category: 'Family', mode: 'dictionary',
    word: 'dad', phonetic: '/dæd/', partOfSpeech: 'noun',
    definition1: '1. Master of terrible jokes, barbecue king, and life consultant.',
    definition2: '2. A real-life hero who can fix almost anything with duct tape and patience.',
    definition3: '3. A daughter\'s first love and a son\'s first superhero.',
    synonyms: 'legend, protector, role model, mentor, anchor',
    quote: '"My father didn\'t tell me how to live; he lived, and let me watch him do it."',
    author: 'CLARENCE BUDINGTON KELLAND',
    bg: '#f8fafc', text: '#0f172a', accent: '#2563eb', font: 'Playfair Display'
  },
  'dictionary-developer': {
    label: 'Developer Definition', category: 'Corporate', mode: 'dictionary',
    word: 'developer', phonetic: '/dɪˈvɛləpər/', partOfSpeech: 'noun',
    definition1: '1. An organism that converts caffeine and pizza into clean software.',
    definition2: '2. A person who solves problems you didn\'t know you had in ways you don\'t understand.',
    definition3: '3. Someone who spends hours fixing a bug only to find a missing semicolon.',
    synonyms: 'code wizard, engineer, debugger, architect, keyboard warrior',
    quote: '"Talk is cheap. Show me the code."',
    author: 'LINUS TORVALDS',
    bg: '#09090b', text: '#f4f4f5', accent: '#10b981', font: 'Space Mono'
  },
  'dictionary-siblings': {
    label: 'Siblings Definition', category: 'Family', mode: 'dictionary',
    word: 'siblings', phonetic: '/ˈsɪblɪŋz/', partOfSpeech: 'noun, plural',
    definition1: '1. Partners in crime and keepers of the funniest childhood secrets.',
    definition2: '2. People you fight with for no reason, but would defend against the world.',
    definition3: '3. A built-in best friend who will never let you take yourself too seriously.',
    synonyms: 'allies, confidants, lifelong friends, family',
    quote: '"Having lots of siblings is like having built-in best friends."',
    author: 'KIM KARDASHIAN',
    bg: '#fff7ed', text: '#431407', accent: '#ea580c', font: 'Playfair Display'
  },
  'dictionary-legal-18': {
    label: 'Eighteen Definition', category: 'Milestones', mode: 'dictionary',
    word: 'eighteen', phonetic: '/eɪˈtiːn/', partOfSpeech: 'noun & adjective',
    definition1: '1. Officially an adult, capable of making your own decisions (and mistakes).',
    definition2: '2. The magic threshold where childhood turns into limitless possibility.',
    definition3: '3. Old enough to know better, young enough to do it anyway.',
    synonyms: 'freedom, independence, adulthood, adventure, new chapter',
    quote: '"The future belongs to those who believe in the beauty of their dreams."',
    author: 'ELEANOR ROOSEVELT',
    bg: '#faf5ff', text: '#3b0764', accent: '#9333ea', font: 'Cinzel'
  },
  'dictionary-expat': {
    label: 'Expat Definition', category: 'Travel', mode: 'dictionary',
    word: 'expat', phonetic: '/ɛksˈpæt/', partOfSpeech: 'noun',
    definition1: '1. A brave soul who packs their life in two suitcases to build a home anywhere.',
    definition2: '2. Fluent in multiple currencies, timezones, and bittersweet farewells.',
    definition3: '3. Someone with a home in multiple places and a heart in all of them.',
    synonyms: 'globetrotter, wanderer, world citizen, pioneer',
    quote: '"You will never be completely at home again, because part of your heart will always be elsewhere."',
    author: 'MIRIAM ADENEY',
    bg: '#f0fdf4', text: '#052e16', accent: '#16a34a', font: 'Playfair Display'
  },
  'dictionary-rescue': {
    label: 'Rescue Pet Definition', category: 'Pets', mode: 'dictionary',
    word: 'rescue pet', phonetic: '/ˈrɛskjuː pɛt/', partOfSpeech: 'noun',
    definition1: '1. Who rescued who? An endless bundle of gratitude, wet noses, and loyalty.',
    definition2: '2. A four-legged family member who found their forever home and never lets you forget it.',
    definition3: '3. Proof that love has four paws and a wagging tail.',
    synonyms: 'soulmate, best boy, fur baby, faithful companion',
    quote: '"Saving one dog will not change the world, but surely for that one dog, the world will change forever."',
    author: 'KAREN DAVISON',
    bg: '#fefce8', text: '#422006', accent: '#ca8a04', font: 'Playfair Display'
  },
  'dictionary-astrology': {
    label: 'Zodiac Sign Definition', category: 'Culture', mode: 'dictionary',
    word: 'celestial', phonetic: '/sɪˈlɛstʃəl/', partOfSpeech: 'adjective',
    definition1: '1. Belonging or relating to heaven or the cosmic space of stars.',
    definition2: '2. Written in the constellations before you took your first breath.',
    definition3: '3. A cosmic blueprint of your intuition, passions, and inner fire.',
    synonyms: 'heavenly, cosmic, astral, divine, starry',
    quote: '"The cosmos is within us. We are made of star-stuff."',
    author: 'CARL SAGAN',
    bg: '#020617', text: '#f8fafc', accent: '#38bdf8', font: 'Cinzel'
  },
  'stoic-wisdom': {
    label: 'Stoic Wisdom', category: 'Inspiration', mode: 'manifesto',
    word: 'MEMENTO MORI', phonetic: 'AMOR FATI', partOfSpeech: 'STOIC CREED',
    definition1: 'You have power over your mind - not outside events. Realize this, and you will find strength.',
    definition2: 'Waste no more time arguing what a good man should be. Be one.',
    definition3: 'The happiness of your life depends upon the quality of your thoughts.',
    synonyms: 'clarity, discipline, virtue, resilience, inner peace',
    quote: '"It is not what happens to you, but how you react to it that matters."',
    author: 'MARCUS AURELIUS & EPICTETUS',
    bg: '#18181b', text: '#fafafa', accent: '#e4e4e7', font: 'Cinzel'
  },
  'personal-manifesto': {
    label: 'Personal Manifesto', category: 'Inspiration', mode: 'manifesto',
    word: 'THE MANIFESTO', phonetic: 'EST. 2026', partOfSpeech: 'DAILY PRINCIPLES',
    definition1: '1. Create more than you consume. Show up even when you don\'t feel like it.',
    definition2: '2. Embrace uncertainty with relentless curiosity and quiet courage.',
    definition3: '3. Live with purpose, speak with truth, and love without hesitation.',
    synonyms: 'courage, authenticity, vision, relentless growth',
    quote: '"The only person you are destined to become is the person you decide to be."',
    author: 'RALPH WALDO EMERSON',
    bg: '#fafafa', text: '#18181b', accent: '#71717a', font: 'Montserrat'
  }
};

const DPI = 300;
const BASE_MAX_W = 600;
const BASE_MAX_H = 800;

function parseAndOrientSize(value: string, orientation: 'portrait' | 'landscape') {
  const [w, h] = value.split('x').map(Number);
  if (orientation === 'landscape') {
    return { w: Math.max(w, h), h: Math.min(w, h) };
  }
  return { w: Math.min(w, h), h: Math.max(w, h) };
}

function fitContain(wIn: number, hIn: number, maxW: number, maxH: number) {
  const aspect = wIn / hIn;
  let width = maxW;
  let height = width / aspect;
  if (height > maxH) {
    height = maxH;
    width = height * aspect;
  }
  return { width: Math.round(width), height: Math.round(height) };
}

export default function TypographyPosterPage({ navigate }: { navigate: (path: string) => void }) {
  const canvasElRef = useRef<HTMLCanvasElement | null>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const bgRectRef = useRef<fabric.Rect | null>(null);

  const token = window.location.pathname.split('/').filter(Boolean).pop() || '';

  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [isCheckingToken, setIsCheckingToken] = useState<boolean>(true);
  const [tokenError, setTokenError] = useState<string>('');

  const [showReviewModal, setShowReviewModal] = useState<boolean>(false);
  const [userConfirmed, setUserConfirmed] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string>('');

  const [showSupportModal, setShowSupportModal] = useState<boolean>(false);
  const [supportMessage, setSupportMessage] = useState<string>('');
  const [sendingTicket, setSendingTicket] = useState<boolean>(false);
  const [ticketSubmitted, setTicketSubmitted] = useState<boolean>(false);
  const [isGeneratingFile, setIsGeneratingFile] = useState<boolean>(false);

  const [activePreset, setActivePreset] = useState<string>('dictionary-mom');
  const [canvasSize, setCanvasSize] = useState<string>('12x18');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [zoom, setZoom] = useState<number>(1);

  // Content State
  const [layoutMode, setLayoutMode] = useState<'dictionary' | 'manifesto'>('dictionary');
  const [word, setWord] = useState('mom');
  const [phonetic, setPhonetic] = useState('/mɒm/');
  const [partOfSpeech, setPartOfSpeech] = useState('noun');
  const [definition1, setDefinition1] = useState('1. One who loves unconditionally and knows where everything is.');
  const [definition2, setDefinition2] = useState('2. Master of multitasking, emotional healer, chef, and protector.');
  const [definition3, setDefinition3] = useState('3. The anchor of the family whose hugs make everything better.');
  const [synonyms, setSynonyms] = useState('superhero, best friend, unconditional love, heart of gold');
  const [quote, setQuote] = useState('"A mother is she who can take the place of all others but whose place no one else can take."');
  const [author, setAuthor] = useState('CARDINAL MERMILLOD');

  // Styling
  const [bgColor, setBgColor] = useState('#fdfbf7');
  const [textColor, setTextColor] = useState('#1c1917');
  const [accentColor, setAccentColor] = useState('#b45309');
  const [fontFamily, setFontFamily] = useState('Playfair Display');
  const [fontSizeTitle, setFontSizeTitle] = useState(48);
  const [cornerLabel, setCornerLabel] = useState('THE DICTIONARY OF LIFE');

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    presets: true,
    size: false,
    content: true,
    styling: false
  });

  const toggleAccordion = (key: string) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const applyPreset = (presetId: string) => {
    setActivePreset(presetId);
    const p = PRESETS[presetId];
    if (!p) return;

    setLayoutMode(p.mode);
    setWord(p.word);
    setPhonetic(p.phonetic);
    setPartOfSpeech(p.partOfSpeech);
    setDefinition1(p.definition1);
    setDefinition2(p.definition2);
    setDefinition3(p.definition3);
    setSynonyms(p.synonyms);
    setQuote(p.quote);
    setAuthor(p.author);
    setBgColor(p.bg);
    setTextColor(p.text);
    setAccentColor(p.accent);
    setFontFamily(p.font);
  };

  // Auth & Token check
  useEffect(() => {
    const checkToken = async () => {
      const hostname = window.location.hostname;
      const isAdmin = hostname.startsWith('serkan1881.') || localStorage.getItem('admin_session') === 'active';

      if (isAdmin) {
        setIsLocked(false);
        if (!token || token === 'demo-token' || token === 'typography' || token.length < 10) {
          setIsCheckingToken(false);
          return;
        }
      } else {
        if (!token || token === 'demo-token') {
          setTokenError('Invalid or expired design link.');
          setIsCheckingToken(false);
          return;
        }
      }

      try {
        const { data, error } = await supabase.from('etsy_orders').select('*').eq('id', token).single();
        if (error || !data) {
          if (isAdmin) return setIsCheckingToken(false);
          setTokenError('Invalid or expired design link.');
          return setIsCheckingToken(false);
        }

        if (data.status === 'completed') setIsLocked(!isAdmin);
        if (data.design_state) {
          const ds = data.design_state;
          if (ds.word) setWord(ds.word);
          if (ds.phonetic) setPhonetic(ds.phonetic);
          if (ds.partOfSpeech) setPartOfSpeech(ds.partOfSpeech);
          if (ds.definition1) setDefinition1(ds.definition1);
          if (ds.definition2) setDefinition2(ds.definition2);
          if (ds.definition3) setDefinition3(ds.definition3);
          if (ds.synonyms) setSynonyms(ds.synonyms);
          if (ds.quote) setQuote(ds.quote);
          if (ds.author) setAuthor(ds.author);
          if (ds.bgColor) setBgColor(ds.bgColor);
          if (ds.textColor) setTextColor(ds.textColor);
          if (ds.accentColor) setAccentColor(ds.accentColor);
          if (ds.fontFamily) setFontFamily(ds.fontFamily);
          if (ds.canvasSize) setCanvasSize(ds.canvasSize);
          if (ds.orientation) setOrientation(ds.orientation);
        }
      } catch (err) {
        if (!isAdmin) setTokenError('Connection error. Please reload.');
      } finally {
        setIsCheckingToken(false);
      }
    };

    checkToken();
  }, [token]);

  // Render Canvas
  const renderCanvas = useCallback(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    canvas.clear();

    const { w, h } = parseAndOrientSize(canvasSize, orientation);
    const dims = fitContain(w, h, BASE_MAX_W, BASE_MAX_H);

    canvas.setWidth(dims.width * zoom);
    canvas.setHeight(dims.height * zoom);
    canvas.setZoom(zoom);

    // Background
    const bg = new fabric.Rect({
      left: 0,
      top: 0,
      width: dims.width,
      height: dims.height,
      fill: bgColor,
      selectable: false,
      evented: false,
    });
    canvas.add(bg);
    bgRectRef.current = bg;

    const cw = dims.width;
    const ch = dims.height;
    const marginX = cw * 0.1;
    const usableW = cw * 0.8;

    // Top Header Label
    const topLabel = new fabric.IText(cornerLabel.toUpperCase(), {
      left: marginX,
      top: ch * 0.08,
      fontSize: 10,
      fontFamily: 'Montserrat',
      fontWeight: '700',
      fill: textColor,
      opacity: 0.5,
      charSpacing: 180,
      selectable: !isLocked,
    });
    canvas.add(topLabel);

    // Top Right Edition
    const topEdition = new fabric.IText('VOL. 01 / DEFINITIONS', {
      left: cw - marginX,
      top: ch * 0.08,
      originX: 'right',
      fontSize: 9,
      fontFamily: 'Space Mono',
      fontWeight: '600',
      fill: textColor,
      opacity: 0.4,
      charSpacing: 100,
      selectable: !isLocked,
    });
    canvas.add(topEdition);

    // Top subtle divider line
    const topLine = new fabric.Line([marginX, ch * 0.11, cw - marginX, ch * 0.11], {
      stroke: textColor,
      strokeWidth: 0.8,
      opacity: 0.15,
      selectable: false,
      evented: false
    });
    canvas.add(topLine);

    if (layoutMode === 'dictionary') {
      // Main Word / Title
      const wordText = new fabric.IText(word.toLowerCase(), {
        left: marginX,
        top: ch * 0.22,
        fontSize: fontSizeTitle,
        fontFamily: fontFamily,
        fontWeight: '700',
        fill: textColor,
        charSpacing: 30,
        selectable: !isLocked,
      });
      canvas.add(wordText);

      // Phonetics & Part of speech
      const subHeader = new fabric.IText(`${phonetic}  •  ${partOfSpeech}`, {
        left: marginX,
        top: ch * 0.32,
        fontSize: 14,
        fontFamily: 'Montserrat',
        fontWeight: '400',
        fontStyle: 'italic',
        fill: accentColor,
        charSpacing: 40,
        selectable: !isLocked,
      });
      canvas.add(subHeader);

      // Accent Divider Rule
      const accentLine = new fabric.Line([marginX, ch * 0.37, cw - marginX, ch * 0.37], {
        stroke: accentColor,
        strokeWidth: 2,
        selectable: false,
        evented: false
      });
      canvas.add(accentLine);

      // Definitions Box
      let defY = ch * 0.42;
      const defs = [definition1, definition2, definition3].filter(Boolean);
      defs.forEach((d) => {
        const defObj = new fabric.Textbox(d, {
          left: marginX,
          top: defY,
          width: usableW,
          fontSize: 13,
          fontFamily: fontFamily,
          lineHeight: 1.5,
          fill: textColor,
          opacity: 0.9,
          selectable: !isLocked,
        });
        canvas.add(defObj);
        defY += defObj.height! + 18;
      });

      // Synonyms section
      if (synonyms) {
        const synLabel = new fabric.IText('SYNONYMS & ATTRIBUTES', {
          left: marginX,
          top: ch * 0.72,
          fontSize: 9,
          fontFamily: 'Montserrat',
          fontWeight: '700',
          fill: textColor,
          opacity: 0.5,
          charSpacing: 140,
          selectable: !isLocked,
        });
        canvas.add(synLabel);

        const synText = new fabric.Textbox(synonyms, {
          left: marginX,
          top: ch * 0.75,
          width: usableW,
          fontSize: 11,
          fontFamily: 'Space Mono',
          fontStyle: 'italic',
          lineHeight: 1.4,
          fill: accentColor,
          selectable: !isLocked,
        });
        canvas.add(synText);
      }

      // Bottom Quote & Author
      if (quote) {
        const bottomLine = new fabric.Line([marginX, ch * 0.85, cw - marginX, ch * 0.85], {
          stroke: textColor,
          strokeWidth: 0.8,
          opacity: 0.15,
          selectable: false,
          evented: false
        });
        canvas.add(bottomLine);

        const quoteObj = new fabric.Textbox(quote, {
          left: marginX,
          top: ch * 0.87,
          width: usableW * 0.75,
          fontSize: 10,
          fontFamily: 'Lora',
          fontStyle: 'italic',
          lineHeight: 1.4,
          fill: textColor,
          opacity: 0.75,
          selectable: !isLocked,
        });
        canvas.add(quoteObj);

        if (author) {
          const authObj = new fabric.IText(`— ${author.toUpperCase()}`, {
            left: cw - marginX,
            top: ch * 0.92,
            originX: 'right',
            fontSize: 9,
            fontFamily: 'Montserrat',
            fontWeight: '700',
            fill: textColor,
            opacity: 0.6,
            charSpacing: 100,
            selectable: !isLocked,
          });
          canvas.add(authObj);
        }
      }
    } else {
      // Manifesto / Hero Quote layout
      const heroWord = new fabric.IText(word.toUpperCase(), {
        left: marginX,
        top: ch * 0.2,
        fontSize: fontSizeTitle * 0.8,
        fontFamily: fontFamily,
        fontWeight: '900',
        fill: textColor,
        charSpacing: 60,
        selectable: !isLocked,
      });
      canvas.add(heroWord);

      const subHero = new fabric.IText(`${phonetic} • ${partOfSpeech}`, {
        left: marginX,
        top: ch * 0.28,
        fontSize: 12,
        fontFamily: 'Montserrat',
        fontWeight: '700',
        fill: accentColor,
        charSpacing: 100,
        selectable: !isLocked,
      });
      canvas.add(subHero);

      const accentLine = new fabric.Line([marginX, ch * 0.33, cw - marginX, ch * 0.33], {
        stroke: accentColor,
        strokeWidth: 2,
        selectable: false,
        evented: false
      });
      canvas.add(accentLine);

      // Large Quotes Body
      let my = ch * 0.38;
      [definition1, definition2, definition3].filter(Boolean).forEach((line) => {
        const mObj = new fabric.Textbox(line, {
          left: marginX,
          top: my,
          width: usableW,
          fontSize: 16,
          fontFamily: fontFamily,
          fontWeight: '500',
          lineHeight: 1.5,
          fill: textColor,
          selectable: !isLocked,
        });
        canvas.add(mObj);
        my += mObj.height! + 24;
      });

      if (quote) {
        const qObj = new fabric.Textbox(quote, {
          left: marginX,
          top: ch * 0.82,
          width: usableW,
          fontSize: 13,
          fontFamily: fontFamily,
          fontStyle: 'italic',
          lineHeight: 1.4,
          fill: accentColor,
          selectable: !isLocked,
        });
        canvas.add(qObj);
      }

      if (author) {
        const authObj = new fabric.IText(`— ${author.toUpperCase()}`, {
          left: cw - marginX,
          top: ch * 0.92,
          originX: 'right',
          fontSize: 10,
          fontFamily: 'Montserrat',
          fontWeight: '700',
          fill: textColor,
          opacity: 0.7,
          charSpacing: 120,
          selectable: !isLocked,
        });
        canvas.add(authObj);
      }
    }

    canvas.renderAll();
  }, [
    canvasSize, orientation, zoom, layoutMode, word, phonetic, partOfSpeech,
    definition1, definition2, definition3, synonyms, quote, author,
    bgColor, textColor, accentColor, fontFamily, fontSizeTitle, cornerLabel, isLocked
  ]);

  useEffect(() => {
    if (isCheckingToken || tokenError || !canvasElRef.current) return;

    const { w, h } = parseAndOrientSize(canvasSize, orientation);
    const dims = fitContain(w, h, BASE_MAX_W, BASE_MAX_H);

    const canvas = new fabric.Canvas(canvasElRef.current, {
      width: dims.width,
      height: dims.height,
      backgroundColor: bgColor,
      preserveObjectStacking: true,
      selection: !isLocked,
    });
    fabricRef.current = canvas;

    renderCanvas();

    return () => {
      canvas.dispose();
    };
  }, [isCheckingToken, tokenError]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  const getMultiplier = () => {
    const { w, h } = parseAndOrientSize(canvasSize, orientation);
    const dims = fitContain(w, h, BASE_MAX_W, BASE_MAX_H);
    return (w * DPI) / dims.width;
  };

  const triggerDownloadAction = async (format: 'png' | 'pdf' | 'svg') => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    setIsGeneratingFile(true);

    setTimeout(async () => {
      try {
        canvas.discardActiveObject();
        canvas.renderAll();

        const multiplier = getMultiplier();
        const { w, h } = parseAndOrientSize(canvasSize, orientation);

        if (format === 'png') {
          const dataUrl = canvas.toDataURL({ format: 'png', multiplier });
          const a = document.createElement('a'); a.href = dataUrl; a.download = `${word}-poster.png`; a.click();
        } else if (format === 'pdf') {
          const dataUrl = canvas.toDataURL({ format: 'png', multiplier });
          const pdf = new jsPDF({ orientation: w > h ? 'landscape' : 'portrait', unit: 'in', format: [w, h] });
          pdf.addImage(dataUrl, 'PNG', 0, 0, w, h); pdf.save(`${word}-poster.pdf`);
        } else if (format === 'svg') {
          const svg = canvas.toSVG();
          const blob = new Blob([svg], { type: 'image/svg+xml' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a'); a.href = url; a.download = `${word}-poster.svg`; a.click();
          URL.revokeObjectURL(url);
        }

        if (token && token !== 'demo-token') {
          const currentState = {
            canvasSize, orientation, word, phonetic, partOfSpeech,
            definition1, definition2, definition3, synonyms, quote, author,
            bgColor, textColor, accentColor, fontFamily, fontSizeTitle, layoutMode
          };
          await supabase.from('etsy_orders').update({
            status: 'completed', design_state: currentState, download_started_at: new Date().toISOString()
          }).eq('id', token);
        }

        setShowReviewModal(false);
        setIsLocked(true);
      } catch (err) {
        alert('Export failed. Please try again.');
      } finally {
        setIsGeneratingFile(false);
      }
    }, 100);
  };

  const handleDownloadMasterpieceClick = () => {
    const canvas = fabricRef.current;
    if (canvas) {
      canvas.discardActiveObject();
      canvas.requestRenderAll();
      try {
        const dataUrl = canvas.toDataURL({ format: 'png', multiplier: 2.0 });
        setPreviewImage(dataUrl);
      } catch (err) {
        setPreviewImage('');
      }
    }
    setShowReviewModal(true);
  };

  const submitSupportTicket = async () => {
    if (!supportMessage.trim()) return;
    setSendingTicket(true);
    try {
      const { error } = await supabase.from('support_tickets').insert({ order_id: token, message: supportMessage.trim() });
      if (error) throw error;
      setTicketSubmitted(true);
    } catch (err) {
      alert('Failed to send message. Try again.');
    } finally {
      setSendingTicket(false);
    }
  };

  if (isCheckingToken) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center font-sans">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (tokenError) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6 font-sans">
        <div className="text-center max-w-md bg-zinc-900 border border-zinc-800 p-8 rounded-3xl shadow-2xl">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-black uppercase mb-2">Access Denied</h1>
          <p className="text-zinc-400 text-sm mb-6 leading-relaxed">{tokenError}</p>
        </div>
      </div>
    );
  }

  const { w, h } = parseAndOrientSize(canvasSize, orientation);
  const dims = fitContain(w, h, BASE_MAX_W, BASE_MAX_H);

  return (
    <div className={`poster-engine-page ${isLocked ? 'locked-mode' : ''}`}>
      <style>{`
        .poster-engine-page {
          --panel-bg: #0d0d0d;
          --panel-border: #1e1e1e;
          --spotify-text: #ffffff;
          --spotify-subtext: #8a8a8a;
          --accent: #1DB954;
          --input-bg: #161616;
          --input-border: #262626;
          display: flex; height: 100vh; width: 100%; background: #000;
          color: var(--spotify-text); font-family: 'DM Sans', sans-serif; overflow: hidden;
        }
        .poster-engine-page.locked-mode #panel, .poster-engine-page.locked-mode #props-panel { display: none; }
        .poster-engine-page.locked-mode #canvas-area { padding-top: 100px; }
        
        .poster-engine-page #panel {
          width: 320px; min-width: 320px; background: var(--panel-bg); border-right: 1px solid var(--panel-border);
          overflow-y: auto; display: flex; flex-direction: column;
        }
        .poster-engine-page #panel::-webkit-scrollbar { width: 3px; }
        .poster-engine-page #panel::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
        
        .poster-engine-page .panel-header { display: flex; align-items: center; justify-content: space-between; padding: 16px; border-bottom: 1px solid var(--panel-border); flex-shrink: 0; }
        .poster-engine-page .title-group h1 { font-size: 13px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; margin: 0; }
        .poster-engine-page .back-btn { background: none; border: 1px solid var(--panel-border); color: var(--spotify-subtext); font-size: 11px; padding: 6px 10px; border-radius: 6px; cursor: pointer; }

        .poster-engine-page .form-row { padding: 0 16px 12px; }
        .poster-engine-page .form-row label { display: block; font-size: 10px; color: var(--spotify-subtext); margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600; }
        .poster-engine-page .form-row input[type=text], .poster-engine-page .form-row select, .poster-engine-page .form-row textarea {
          width: 100%; background: var(--input-bg); border: 1px solid var(--input-border); border-radius: 6px; color: var(--spotify-text); padding: 8px 10px; font-size: 12px; outline: none; box-sizing: border-box;
        }
        .poster-engine-page .form-row input:focus, .poster-engine-page .form-row select:focus, .poster-engine-page .form-row textarea:focus { border-color: var(--accent); }
        
        .poster-engine-page .color-row { display: flex; gap: 8px; align-items: center; padding: 0 16px 12px; }
        .poster-engine-page .color-row input[type=color] { width: 34px; height: 30px; border: none; border-radius: 6px; padding: 2px; background: var(--input-bg); cursor: pointer; flex-shrink: 0; }
        .poster-engine-page .color-row input[type=text] { flex: 1; background: var(--input-bg); border: 1px solid var(--input-border); border-radius: 6px; color: var(--spotify-text); padding: 6px 8px; font-size: 11px; }

        .poster-engine-page .range-row { display: flex; align-items: center; gap: 8px; padding: 0 16px 12px; }
        .poster-engine-page .range-row input[type=range] { flex: 1; accent-color: var(--accent); cursor: pointer; }
        .poster-engine-page .range-val { font-size: 10px; color: var(--accent); font-weight: 600; min-width: 34px; text-align: right; }

        .poster-engine-page .btn { border: none; border-radius: 6px; padding: 9px 14px; font-size: 12px; font-weight: 600; cursor: pointer; }
        .poster-engine-page .btn-primary { background: var(--accent); color: #000; }
        .poster-engine-page .btn-secondary { background: var(--input-bg); color: var(--spotify-text); border: 1px solid var(--input-border); flex: 1; }

        .poster-engine-page .canvas-header-actions { display: flex; gap: 8px; margin-bottom: 24px; z-index: 50; position: relative; }
        .poster-engine-page .btn-masterpiece { background: linear-gradient(to right, #4f46e5, #9333ea); color: white; padding: 12px 32px; font-size: 14px; border-radius: 30px; text-transform: uppercase; letter-spacing: 0.1em; box-shadow: 0 10px 25px rgba(79, 70, 229, 0.4); cursor: pointer; }

        .poster-engine-page #canvas-area { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; background: #0d0d0d; padding: 30px; overflow: auto; position: relative; }
        .poster-engine-page #canvas-area::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse at center, #1a1a1a 0%, #0d0d0d 70%); pointer-events: none; }
        .poster-engine-page #poster-wrapper { position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; gap: 20px; padding: 40px; }
        .poster-engine-page #poster-container { position: relative; overflow: hidden; box-shadow: 0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05); border-radius: 4px; }

        .poster-engine-page .accordion-btn { width: 100%; background: none; border: none; color: var(--spotify-subtext); font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; text-align: left; padding: 16px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--panel-border); }
        .poster-engine-page .accordion-btn.open .arrow { transform: rotate(180deg); }
        .poster-engine-page .accordion-content { display: none; padding: 14px 0; border-bottom: 1px solid var(--panel-border); }
        .poster-engine-page .accordion-content.open { display: block; }

        .review-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.95); backdrop-filter: blur(15px); display: flex; align-items: flex-start; justify-content: center; z-index: 9999; overflow-y: auto; padding: 40px 20px; }
        .review-modal-content { max-width: 900px; width: 100%; display: flex; flex-direction: column; align-items: center; gap: 30px; }
        .review-warning-box { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); padding: 16px 24px; border-radius: 12px; display: flex; gap: 16px; align-items: center; width: 100%; }
        .review-preview-img { width: auto; max-height: 75vh; object-fit: contain; box-shadow: 0 20px 60px rgba(0,0,0,0.8); border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; }
        .review-action-area { width: 100%; display: flex; flex-direction: column; align-items: center; gap: 24px; }
        .review-checkbox-wrapper { display: flex; align-items: center; gap: 12px; cursor: pointer; background: #1a1a1a; padding: 16px 24px; border-radius: 12px; border: 1px solid #333; width: 100%; justify-content: center; }
        .review-checkbox-wrapper input[type=checkbox] { width: 24px; height: 24px; accent-color: var(--accent); cursor: pointer; }
        .review-btn-grid { display: flex; gap: 12px; width: 100%; justify-content: center; flex-wrap: wrap; }
        .review-btn-grid button { padding: 16px 32px; border-radius: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; font-size: 14px; min-width: 240px; }

        .readonly-banner { position: fixed; top: 24px; left: 50%; transform: translateX(-50%); background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); color: #fca5a5; padding: 16px 24px; border-radius: 16px; display: flex; align-items: center; justify-content: space-between; max-width: 800px; width: 90%; box-shadow: 0 10px 30px rgba(0,0,0,0.8); z-index: 1000; backdrop-filter: blur(10px); }
        .file-generator-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(10px); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 10000; }
      `}</style>

      {isGeneratingFile && (
        <div className="file-generator-overlay">
          <div className="text-center bg-zinc-900 border border-zinc-800 p-8 rounded-3xl max-w-md shadow-2xl flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
            <h3 className="text-lg font-black uppercase text-white mb-2 tracking-wider">Generating File</h3>
            <p className="text-zinc-400 text-xs leading-relaxed">Your high-resolution file is being generated... Please wait.</p>
          </div>
        </div>
      )}

      {isLocked && (
        <div className="readonly-banner">
          <div>
            <div className="flex items-center gap-2 text-red-200 font-bold mb-1"><Lock className="w-4 h-4" /> Design Locked (Read-Only Mode)</div>
            <p className="text-xs text-red-300/80">Your design has been finalized. If you made a mistake, please contact support.</p>
          </div>
          <button onClick={() => setShowSupportModal(true)} className="flex items-center gap-2 bg-red-950 border border-red-900 text-red-200 px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-900 cursor-pointer">
            <MessageCircle className="w-4 h-4" /> Open Support Ticket
          </button>
        </div>
      )}

      {showReviewModal && (
        <div className="review-modal-overlay">
          <div className="review-modal-content">
            <div className="review-warning-box">
              <AlertTriangle className="w-8 h-8 text-red-400 shrink-0" />
              <div>
                <h3 className="text-red-400 font-black uppercase tracking-wider mb-1">Final Review</h3>
                <p className="text-red-200/80 text-sm leading-relaxed">Please review your definitions and spelling carefully.</p>
              </div>
            </div>
            {previewImage && <img src={previewImage} alt="Preview" className="review-preview-img" />}
            <div className="review-action-area">
              <label className="review-checkbox-wrapper">
                <input type="checkbox" checked={userConfirmed} onChange={(e) => setUserConfirmed(e.target.checked)} />
                <span className="text-sm text-zinc-300 font-medium"><strong className="text-white block mb-1">I approve my design.</strong> All texts are spelled correctly and ready to print.</span>
              </label>
              <div className="review-btn-grid">
                <button className={`btn ${userConfirmed ? 'btn-primary' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border-none'}`} disabled={!userConfirmed} onClick={() => triggerDownloadAction('pdf')}>Download PDF (Print)</button>
                <button className={`btn ${userConfirmed ? 'btn-secondary' : 'bg-zinc-900 text-zinc-600 border-zinc-800 cursor-not-allowed'}`} disabled={!userConfirmed} onClick={() => triggerDownloadAction('png')}>Download PNG</button>
                <button className={`btn ${userConfirmed ? 'btn-secondary' : 'bg-zinc-900 text-zinc-600 border-zinc-800 cursor-not-allowed'}`} disabled={!userConfirmed} onClick={() => triggerDownloadAction('svg')}>Download SVG</button>
              </div>
              <button className="mt-4 text-zinc-500 hover:text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2" onClick={() => setShowReviewModal(false)}>
                <X className="w-4 h-4" /> Cancel & Go Back to Editing
              </button>
            </div>
          </div>
        </div>
      )}

      {showSupportModal && (
        <div className="review-modal-overlay">
          <div className="review-modal-content" style={{ maxWidth: '500px' }}>
            <div style={{ width: '100%' }}>
              {ticketSubmitted ? (
                <div className="text-center py-6">
                  <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-black uppercase text-white mb-2">Ticket Submitted</h2>
                  <p className="text-zinc-400 text-xs mb-6">Your message has been sent. We will respond within 24 hours.</p>
                  <button onClick={() => { setShowSupportModal(false); setTicketSubmitted(false); setSupportMessage(''); }} className="btn btn-primary w-full">Close Window</button>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-black uppercase text-white mb-4">Open Support Ticket</h2>
                  <div className="form-row" style={{ padding: 0, marginBottom: '20px' }}>
                    <label>Your Message</label>
                    <textarea value={supportMessage} onChange={(e) => setSupportMessage(e.target.value)} placeholder="Describe the changes you need..." style={{ width: '100%', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '8px', color: 'var(--spotify-text)', padding: '12px', fontSize: '12px', minHeight: '120px' }} />
                  </div>
                  <div className="flex gap-3">
                    <button disabled={sendingTicket || !supportMessage.trim()} onClick={submitSupportTicket} className="btn btn-primary flex-1">{sendingTicket ? 'Sending...' : 'Send Message'}</button>
                    <button disabled={sendingTicket} onClick={() => { setShowSupportModal(false); setSupportMessage(''); }} className="btn btn-secondary flex-1">Cancel</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <div id="panel" className={isLocked ? 'hidden' : ''}>
        <div className="panel-header">
          <div className="title-group flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <h1>Dictionary & Typography</h1>
          </div>
          <button className="back-btn" onClick={() => navigate('/trend-posters')}>&#10229; Back</button>
        </div>

        <button className={`accordion-btn ${openSections.presets ? 'open' : ''}`} onClick={() => toggleAccordion('presets')}>
          <span>&#127912; Themes & Presets</span> <span className="arrow">&#9660;</span>
        </button>
        <div className={`accordion-content ${openSections.presets ? 'open' : ''}`}>
          <div className="form-row">
            <label>Choose Concept</label>
            <select value={activePreset} onChange={(e) => applyPreset(e.target.value)}>
              {Object.entries(PRESETS).map(([id, p]) => (
                <option key={id} value={id}>{p.label}</option>
              ))}
            </select>
          </div>
        </div>

        <button className={`accordion-btn ${openSections.size ? 'open' : ''}`} onClick={() => toggleAccordion('size')}>
          <span>&#128208; Canvas & Size</span> <span className="arrow">&#9660;</span>
        </button>
        <div className={`accordion-content ${openSections.size ? 'open' : ''}`}>
          <div className="form-row">
            <label>Print Dimensions</label>
            <select value={canvasSize} onChange={(e) => setCanvasSize(e.target.value)}>
              {PRINT_SIZES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <div className="flex gap-2 mt-2">
              <button className={`btn ${orientation === 'portrait' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setOrientation('portrait')}>Portrait</button>
              <button className={`btn ${orientation === 'landscape' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setOrientation('landscape')}>Landscape</button>
            </div>
          </div>
        </div>

        <button className={`accordion-btn ${openSections.content ? 'open' : ''}`} onClick={() => toggleAccordion('content')}>
          <span>&#9997; Word & Definitions</span> <span className="arrow">&#9660;</span>
        </button>
        <div className={`accordion-content ${openSections.content ? 'open' : ''}`}>
          <div className="form-row">
            <label>Layout Mode</label>
            <select value={layoutMode} onChange={(e) => setLayoutMode(e.target.value as any)}>
              <option value="dictionary">Dictionary Definition</option>
              <option value="manifesto">Manifesto & Creed</option>
            </select>
          </div>
          <div className="form-row">
            <label>Word / Title</label>
            <input type="text" value={word} onChange={(e) => setWord(e.target.value)} />
          </div>
          <div className="form-row">
            <label>Phonetics (Pronunciation)</label>
            <input type="text" value={phonetic} onChange={(e) => setPhonetic(e.target.value)} />
          </div>
          <div className="form-row">
            <label>Part of Speech</label>
            <input type="text" value={partOfSpeech} onChange={(e) => setPartOfSpeech(e.target.value)} />
          </div>
          <div className="form-row">
            <label>Definition 1</label>
            <textarea value={definition1} onChange={(e) => setDefinition1(e.target.value)} rows={2} />
          </div>
          <div className="form-row">
            <label>Definition 2</label>
            <textarea value={definition2} onChange={(e) => setDefinition2(e.target.value)} rows={2} />
          </div>
          <div className="form-row">
            <label>Definition 3</label>
            <textarea value={definition3} onChange={(e) => setDefinition3(e.target.value)} rows={2} />
          </div>
          <div className="form-row">
            <label>Synonyms / Attributes</label>
            <input type="text" value={synonyms} onChange={(e) => setSynonyms(e.target.value)} />
          </div>
          <div className="form-row">
            <label>Footer Quote</label>
            <textarea value={quote} onChange={(e) => setQuote(e.target.value)} rows={2} />
          </div>
          <div className="form-row">
            <label>Author Attribution</label>
            <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} />
          </div>
        </div>

        <button className={`accordion-btn ${openSections.styling ? 'open' : ''}`} onClick={() => toggleAccordion('styling')}>
          <span>&#127912; Styling & Colors</span> <span className="arrow">&#9660;</span>
        </button>
        <div className={`accordion-content ${openSections.styling ? 'open' : ''}`}>
          <div className="form-row">
            <label>Font Family</label>
            <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)}>
              {GOOGLE_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div className="form-row">
            <label>Title Size</label>
            <div className="range-row" style={{ padding: 0 }}>
              <input type="range" min="24" max="72" value={fontSizeTitle} onChange={(e) => setFontSizeTitle(Number(e.target.value))} />
              <span className="range-val">{fontSizeTitle}px</span>
            </div>
          </div>
          <div className="color-row">
            <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} />
            <input type="text" value={bgColor} onChange={(e) => setBgColor(e.target.value)} />
            <label style={{ fontSize: '10px', color: '#888' }}>Background</label>
          </div>
          <div className="color-row">
            <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} />
            <input type="text" value={textColor} onChange={(e) => setTextColor(e.target.value)} />
            <label style={{ fontSize: '10px', color: '#888' }}>Main Text</label>
          </div>
          <div className="color-row">
            <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} />
            <input type="text" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} />
            <label style={{ fontSize: '10px', color: '#888' }}>Accent</label>
          </div>
        </div>
      </div>

      <div id="canvas-area" className={isLocked ? 'locked-mode' : ''}>
        {!isLocked && (
          <div className="canvas-header-actions">
            <button className="btn btn-masterpiece" onClick={handleDownloadMasterpieceClick}>Download Masterpiece</button>
          </div>
        )}
        <div id="poster-wrapper">
          <div id="poster-container" style={{ width: dims.width * zoom, height: dims.height * zoom }}>
            <canvas ref={canvasElRef} />
          </div>
        </div>
      </div>
    </div>
  );
}
