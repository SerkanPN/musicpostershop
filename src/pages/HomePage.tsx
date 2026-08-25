import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  POSTER_CATEGORIES, POSTER_PRESETS, getCategoryPresetCount, 
  CATEGORY_META, PosterCategory 
} from '../lib/presets';
import { 
  Sparkles, Search, Layers, ArrowRight, Disc, Music, 
  Heart, MapPin, Moon, Receipt, FileText, Check, ShieldCheck, 
  Download, Eye, Star
} from 'lucide-react';

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Featured Hero Templates (lyricsposter.com grade)
  const FEATURED_HEROES = [
    {
      title: 'Custom Vinyl Record Lyrics Print',
      category: 'Vinyl Spiral Wall Art',
      desc: 'Turn your wedding dance, anniversary song, or favorite track into a circular vinyl record print with spiral lyrics.',
      link: '/editor/vinyl',
      badge: 'Bestseller',
      bgGradient: 'from-amber-500/10 via-rose-500/10 to-purple-500/10',
      borderColor: 'border-rose-500/30'
    },
    {
      title: 'Photo Arch Song Lyrics Print',
      category: 'Editorial Wall Art',
      desc: 'Minimalist arched photo frame paired with two balanced columns of lyrics in luxury serif typography.',
      link: '/editor/lyrics',
      badge: 'Trending',
      bgGradient: 'from-blue-500/10 via-indigo-500/10 to-rose-500/10',
      borderColor: 'border-blue-500/30'
    },
    {
      title: 'Wedding Vows Spiral Keepsake',
      category: 'Wedding Keepsake',
      desc: 'Your sacred vows radiating in an unbroken spiral toward your names and wedding date.',
      link: '/editor/vows',
      badge: 'New Design',
      bgGradient: 'from-rose-500/10 via-pink-500/10 to-amber-500/10',
      borderColor: 'border-pink-500/30'
    }
  ];

  const categories = Object.values(POSTER_CATEGORIES) as PosterCategory[];

  const allPresets = categories.flatMap(cat => {
    const list = POSTER_PRESETS[cat] || [];
    const meta = CATEGORY_META[cat];
    return list.map(p => ({
      ...p,
      categoryKey: cat,
      editorRoute: meta.editorRoute,
      categoryName: meta.name
    }));
  });

  const filteredPresets = allPresets.filter(p => {
    const matchesCat = selectedCategory === 'ALL' || p.categoryKey === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      p.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.categoryName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#09090b] text-neutral-100 font-sans selection:bg-rose-500 selection:text-white">
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 px-4 py-2 text-center text-xs font-semibold text-white tracking-wide shadow-md">
        <span>✨ Over 180+ Luxury Wall Art Presets • 300 DPI Print-Ready Vector PDF & PNG Downloads</span>
      </div>

      {/* Navigation */}
      <header className="border-b border-neutral-800/80 bg-[#121316]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
              <Disc className="w-5 h-5 text-white animate-spin-slow" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-white">MUSIC POSTER</span>
              <span className="text-rose-500 font-bold text-lg ml-1">STUDIO</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-300">
            <Link to="/editor/vinyl" className="hover:text-rose-400 transition-colors flex items-center gap-1.5">
              <Disc className="w-4 h-4 text-rose-400" /> Vinyl Spiral
            </Link>
            <Link to="/editor/lyrics" className="hover:text-blue-400 transition-colors flex items-center gap-1.5">
              <Music className="w-4 h-4 text-blue-400" /> Photo Lyrics
            </Link>
            <Link to="/editor/receipt" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
              <Receipt className="w-4 h-4 text-amber-400" /> Vintage Receipt
            </Link>
            <Link to="/editor/soundwave" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400" /> Soundwave
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link 
              to="/editor/vinyl"
              className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Create Poster</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 border-b border-neutral-800/60 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-[#09090b] to-[#09090b]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Gen Personalized Wall Art Studio</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.08] max-w-5xl mx-auto">
            Design <span className="bg-gradient-to-r from-rose-500 via-amber-400 to-purple-500 bg-clip-text text-transparent">Museum-Grade</span> Personalized Wall Art
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-neutral-400 max-w-3xl mx-auto leading-relaxed">
            Choose from over 180+ bespoke presets. From Vinyl Spiral Lyrics and Vintage Receipts to Soundwave Horizons and Night Sky StarMaps.
          </p>

          {/* FEATURED 3 CARDS */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {FEATURED_HEROES.map((feat, idx) => (
              <Link
                key={idx}
                to={feat.link}
                className={`group p-6 rounded-2xl bg-gradient-to-b ${feat.bgGradient} bg-[#121316] border ${feat.borderColor} hover:border-white/40 shadow-xl transition-all duration-200 hover:-translate-y-1`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full bg-white/10 text-white border border-white/10">
                    {feat.badge}
                  </span>
                  <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="font-bold text-lg text-white mb-2 group-hover:text-rose-400 transition-colors">
                  {feat.title}
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                  {feat.desc}
                </p>
                <div className="text-xs font-bold text-rose-400 flex items-center gap-1">
                  Open Studio & Customize &rarr;
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FILTER & SEARCH BAR */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b border-neutral-800/80">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">Explore 180+ Presets Gallery</h2>
            <p className="text-xs text-neutral-400 mt-1">Select any category or search by theme name</p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              placeholder="Search wedding, marathon, stoic, vinyl..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-[#15161a] border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-neutral-500 focus:border-rose-500 outline-none shadow-inner"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto py-4 custom-scrollbar">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === 'ALL'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
            }`}
          >
            All Presets ({allPresets.length})
          </button>

          {categories.map(cat => {
            const meta = CATEGORY_META[cat];
            const count = getCategoryPresetCount(cat);
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                  isSelected
                    ? 'bg-white text-neutral-950 font-bold shadow-lg'
                    : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
                }`}
              >
                <span>{meta.icon}</span>
                <span>{meta.name}</span>
                <span className="text-[10px] opacity-60 font-mono">({count})</span>
              </button>
            );
          })}
        </div>

        {/* PRESETS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-6">
          {filteredPresets.map((preset, idx) => (
            <Link
              key={idx}
              to={`${preset.editorRoute}?preset=${preset.id}`}
              className="group p-4 rounded-xl bg-[#121316] border border-neutral-800/80 hover:border-neutral-700 hover:bg-[#16171b] transition-all flex flex-col justify-between shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-400 group-hover:text-white">
                    {preset.category}
                  </span>
                  <span className="text-[10px] text-neutral-500 font-medium">
                    {preset.categoryName}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-white group-hover:text-rose-400 transition-colors">
                  {preset.label}
                </h4>
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-800/60 flex items-center justify-between text-xs text-neutral-400 group-hover:text-white">
                <span>Customize Design</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-800 mt-20 py-10 bg-[#0c0d0e] text-center text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 space-y-3">
          <div className="font-bold text-neutral-300">MUSIC POSTER STUDIO</div>
          <p>© 2026 Music Poster Studio. All rights reserved. High Resolution 300 DPI Export Engine.</p>
        </div>
      </footer>
    </div>
  );
}
