import React, { useState } from 'react';
import { 
  ArrowLeft, Download, FileDown, ZoomIn, ZoomOut, Maximize2, 
  Sparkles, Layers, Palette, Type, Sliders, Image as ImageIcon,
  Check, ChevronDown, ChevronRight, Eye, Grid, RefreshCw
} from 'lucide-react';

export interface PresetItem {
  id: string;
  title: string;
  label?: string;
}

export interface ModernStudioLayoutProps {
  title: string;
  category: string;
  onBack: () => void;
  onDownloadPNG: () => void;
  onDownloadPDF: () => void;
  isExporting?: boolean;
  presets?: PresetItem[];
  activePreset?: string;
  onSelectPreset?: (id: string) => void;
  zoom: number;
  setZoom: (fn: (prev: number) => number) => void;
  printSize: string;
  setPrintSize: (size: string) => void;
  sidebarContent: React.ReactNode;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  canvasWidth?: number;
  canvasHeight?: number;
}

export const PRINT_SIZE_OPTIONS = [
  { id: 'A4', label: 'A4 (21x29.7cm)', ratio: '1:1.41' },
  { id: 'A3', label: 'A3 (29.7x42cm)', ratio: '1:1.41' },
  { id: 'A2', label: 'A2 (42x59.4cm)', ratio: '1:1.41' },
  { id: '8x10', label: '8" x 10"', ratio: '4:5' },
  { id: '11x14', label: '11" x 14"', ratio: '11:14' },
  { id: '12x18', label: '12" x 18"', ratio: '2:3' },
  { id: '16x20', label: '16" x 20"', ratio: '4:5' },
  { id: '18x24', label: '18" x 24"', ratio: '3:4' },
  { id: '24x36', label: '24" x 36"', ratio: '2:3' },
  { id: 'square', label: 'Square (1:1)', ratio: '1:1' },
];

export default function ModernStudioLayout({
  title,
  category,
  onBack,
  onDownloadPNG,
  onDownloadPDF,
  isExporting = false,
  presets = [],
  activePreset,
  onSelectPreset,
  zoom,
  setZoom,
  printSize,
  setPrintSize,
  sidebarContent,
  canvasRef,
  canvasWidth = 600,
  canvasHeight = 800,
}: ModernStudioLayoutProps) {
  const [showPresetMenu, setShowPresetMenu] = useState(false);
  const [showSizeMenu, setShowSizeMenu] = useState(false);
  const [showGrid, setShowGrid] = useState(false);

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0c0d0e] text-neutral-100 overflow-hidden font-sans select-none">
      {/* TOP APP BAR */}
      <header className="h-14 border-b border-neutral-800 bg-[#121316] px-4 flex items-center justify-between shrink-0 z-30 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-neutral-200 hover:text-white transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Templates</span>
          </button>

          <div className="h-4 w-px bg-neutral-800 hidden sm:block" />

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white tracking-tight">{title}</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                {category}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Presets Dropdown */}
        <div className="flex items-center gap-3">
          {presets.length > 0 && onSelectPreset && (
            <div className="relative">
              <button
                onClick={() => setShowPresetMenu(!showPresetMenu)}
                className="hidden md:flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Preset: {presets.find(p => p.id === activePreset)?.title || 'Custom'}</span>
                <ChevronDown className="w-3 h-3 text-neutral-500" />
              </button>

              {showPresetMenu && (
                <div className="absolute right-0 top-full mt-2 w-64 max-h-80 overflow-y-auto bg-[#18191c] border border-neutral-800 rounded-xl shadow-2xl p-1.5 z-50">
                  <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider px-2 py-1.5">
                    Choose Theme / Preset
                  </div>
                  {presets.map(p => (
                    <button
                      key={p.id}
                      onClick={() => {
                        onSelectPreset(p.id);
                        setShowPresetMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-left transition-colors ${
                        activePreset === p.id 
                          ? 'bg-rose-600 text-white font-semibold' 
                          : 'text-neutral-300 hover:bg-neutral-800/60'
                      }`}
                    >
                      <div>
                        <div>{p.title}</div>
                        {p.label && <div className="text-[10px] opacity-60">{p.label}</div>}
                      </div>
                      {activePreset === p.id && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Download Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onDownloadPNG}
              disabled={isExporting}
              className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white transition-all disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span> PNG
            </button>

            <button
              onClick={onDownloadPDF}
              disabled={isExporting}
              className="flex items-center gap-1.5 text-xs font-bold px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20 transition-all disabled:opacity-50"
            >
              <FileDown className="w-4 h-4" />
              <span>300 DPI PDF</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN SPLIT-SCREEN WORKSPACE */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* LEFT SIDEBAR CONTROLS (420px) */}
        <aside className="w-full sm:w-[420px] lg:w-[440px] bg-[#121316] border-r border-neutral-800/80 flex flex-col shrink-0 z-20 overflow-hidden shadow-xl">
          <div className="p-4 px-5 border-b border-neutral-800/60 bg-[#15161a] flex items-center justify-between shrink-0">
            <div>
              <h2 className="font-bold text-sm text-white tracking-tight">Customize Design</h2>
              <p className="text-[11px] text-neutral-400 mt-0.5">Edit typography, artwork and layout</p>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Live Preview Active" />
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-5">
            {sidebarContent}
          </div>
        </aside>

        {/* RIGHT CENTER CANVAS STAGE */}
        <main className="flex-1 bg-[#09090b] relative flex flex-col items-center justify-center p-6 overflow-hidden">
          {/* Subtle Grid Background */}
          <div 
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)',
              backgroundSize: '24px 24px'
            }}
          />

          {/* The Poster Presentation Stage */}
          <div 
            className="relative flex items-center justify-center transition-transform duration-150 ease-out"
            style={{ transform: `scale(${zoom})` }}
          >
            {/* Realistic Print Drop-Shadow & Frame */}
            <div className="relative p-2 rounded-xl bg-neutral-900/60 border border-neutral-800/80 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] ring-1 ring-white/5">
              <div 
                ref={canvasRef} 
                className="overflow-hidden rounded-sm bg-white"
                style={{ width: canvasWidth, height: canvasHeight }}
              />
              
              {/* Optional Print Safe Margin Grid */}
              {showGrid && (
                <div 
                  className="absolute inset-4 border border-dashed border-rose-500/50 pointer-events-none flex items-center justify-center"
                >
                  <span className="text-[9px] text-rose-400 bg-black/80 px-2 py-0.5 rounded font-mono">
                    Safe Print Area (3mm bleed)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* FLOATING BOTTOM TOOLBAR */}
          <div className="absolute bottom-6 z-20 flex items-center gap-1.5 p-1.5 px-3 rounded-full bg-[#18191c]/90 backdrop-blur-md border border-neutral-700/60 shadow-2xl text-neutral-300">
            {/* Zoom Controls */}
            <button
              onClick={() => setZoom(z => Math.max(0.4, Number((z - 0.1).toFixed(1))))}
              className="p-1.5 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <span className="text-xs font-mono font-medium px-1 min-w-[45px] text-center">
              {Math.round(zoom * 100)}%
            </span>

            <button
              onClick={() => setZoom(z => Math.min(1.6, Number((z + 0.1).toFixed(1))))}
              className="p-1.5 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            <button
              onClick={() => setZoom(() => 1)}
              className="text-[11px] font-semibold px-2 py-1 rounded-md hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
              title="Reset Zoom"
            >
              Fit
            </button>

            <div className="h-4 w-px bg-neutral-700/60 mx-1" />

            {/* Print Size Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSizeMenu(!showSizeMenu)}
                className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md bg-neutral-800 hover:bg-neutral-700 text-white"
              >
                <span>{printSize}</span>
                <ChevronDown className="w-3 h-3 text-neutral-400" />
              </button>

              {showSizeMenu && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-[#1a1b1e] border border-neutral-700 rounded-xl shadow-2xl p-1.5 z-50">
                  <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider px-2 py-1">
                    Print Size (Ratio)
                  </div>
                  {PRINT_SIZE_OPTIONS.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setPrintSize(opt.id);
                        setShowSizeMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-left transition-colors ${
                        printSize === opt.id 
                          ? 'bg-rose-600 text-white font-semibold' 
                          : 'text-neutral-300 hover:bg-neutral-800'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {printSize === opt.id && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="h-4 w-px bg-neutral-700/60 mx-1" />

            {/* Grid Toggle */}
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`p-1.5 rounded-full transition-colors ${
                showGrid ? 'bg-rose-600 text-white' : 'hover:bg-neutral-800 text-neutral-400 hover:text-white'
              }`}
              title="Toggle Safe Margins"
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
