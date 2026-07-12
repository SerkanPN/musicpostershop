import { Link } from 'react-router-dom';
import { 
  Activity, 
  AlignLeft, 
  MapPin, 
  ScrollText, 
  Star, 
  Mic, 
  FileText, 
  Camera,
  Compass,
  Palette,
  Newspaper,
  Heart,
  Home,
  Baby
} from 'lucide-react';

export default function TrendPostersSelection() {
  const templates = [
    {
      id: 'soundwave',
      title: 'Soundwave Art',
      desc: 'Visualize real audio files or voice messages into aesthetic soundwave posters.',
      icon: Activity,
      path: '/trend-posters/soundwave',
      active: true
    },
    {
      id: 'receipt',
      title: 'Vintage Receipt',
      desc: 'Turn memories, playlists, or marathon stats into retro supermarket receipts.',
      icon: ScrollText,
      path: '/trend-posters/receipt',
      active: true
    },
    {
      id: 'typography',
      title: 'Modern Typography',
      desc: 'Swiss-style minimalist text layouts for quotes and personal manifestos.',
      icon: AlignLeft,
      path: '/trend-posters/typography',
      active: true
    },
    {
      id: 'coordinates',
      title: 'Map Coordinates',
      desc: 'Minimalist map pins and precise GPS coordinates of your special locations.',
      icon: MapPin,
      path: '/trend-posters/coordinates',
      active: true
    },
    {
      id: 'starmap',
      title: 'Astronomy Star Map',
      desc: 'Accurate constellations of the night sky based on a specific date and place.',
      icon: Star,
      path: '/trend-posters/starmap',
      active: true
    },
    {
      id: 'cassette',
      title: 'Retro Cassette Tape',
      desc: 'Nostalgic 80s mixtape designs customized with your own text and colors.',
      icon: Mic,
      path: '/trend-posters/cassette',
      active: true
    },
    {
      id: 'typewriter',
      title: 'Typewriter Letter',
      desc: 'Classic typed letters on aged paper backgrounds for vows and poetry.',
      icon: FileText,
      path: '/trend-posters/typewriter',
      active: true
    },
    {
      id: 'polaroid',
      title: 'Polaroid Gallery',
      desc: 'Photo collage templates styled like vintage polaroid films with captions.',
      icon: Camera,
      path: '/trend-posters/polaroid',
      active: true
    },
    {
      id: 'patent',
      title: 'Patent & Blueprint',
      desc: 'Technical schematics and patent blueprints of iconic cars, objects, or instruments.',
      icon: Compass,
      path: '/trend-posters/patent',
      active: true
    },
    {
      id: 'pantone',
      title: 'Pantone Color Swatch',
      desc: 'Minimalist color palette swatches analyzed and extracted directly from your photos.',
      icon: Palette,
      path: '/trend-posters/pantone',
      active: true
    },
    {
      id: 'newspaper',
      title: 'Newspaper Front Page',
      desc: 'Vintage front-page newspapers customized with your headlines, articles, and photos.',
      icon: Newspaper,
      path: '/trend-posters/newspaper',
      active: true
    },
    {
      id: 'heart',
      title: 'Heart Typography',
      desc: 'Transform wedding vows, letters, or song lyrics into a beautiful heart-shaped layout.',
      icon: Heart,
      path: '/trend-posters/heart',
      active: true
    },
    {
      id: 'airbnb',
      title: 'AirBNB Welcome Guide',
      desc: 'Beautiful check-out guidelines, wifi details, and custom rules for vacation rentals.',
      icon: Home,
      path: '/trend-posters/airbnb',
      active: true
    },
    {
      id: 'toddler',
      title: 'Toddler Milestone Panel',
      desc: 'A charming growth record tracking height, weight, first words, and favorite toys.',
      icon: Baby,
      path: '/trend-posters/toddler',
      active: true
    }
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col relative overflow-hidden font-sans">
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[10%] right-[10%] w-[600px] h-[600px] bg-purple-500/5 blur-[150px] rounded-full" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 relative z-10 w-full max-w-7xl mx-auto">
        <div className="text-center mb-16 mt-8">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-2">
            Choose Poster Style
          </h1>
          <p className="text-zinc-400 text-sm font-medium">
            Select a template concept to start designing your personalized artwork.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">
          {templates.map((tpl) => (
            <Link 
              key={tpl.id}
              to={tpl.path}
              className={`group flex flex-col items-center text-center p-8 rounded-2xl border transition-all duration-300
                ${tpl.active 
                  ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800/80 cursor-pointer' 
                  : 'bg-zinc-900/50 border-zinc-800/50 opacity-60 cursor-not-allowed'
                }
              `}
              onClick={(e) => {
                if (!tpl.active) e.preventDefault();
              }}
            >
              <div className={`w-32 h-32 mb-8 rounded-xl flex items-center justify-center
                ${tpl.active ? 'bg-zinc-100 text-zinc-950' : 'bg-zinc-800 text-zinc-600'}
              `}>
                <tpl.icon className="w-16 h-16 stroke-[1.5]" />
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight mb-3">
                {tpl.title}
              </h3>
              <p className="text-zinc-400 text-xs leading-relaxed font-medium">
                {tpl.desc}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
