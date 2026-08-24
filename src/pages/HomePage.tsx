import { useNavigate } from 'react-router-dom';
import { 
  AudioWaveform, FileText, BookA, MapPin, Star, 
  Disc, Keyboard, Camera, FileBadge, Palette, 
  Newspaper, Heart, Home, Baby 
} from 'lucide-react';

const THEME_CATEGORIES = [
  {
    title: 'Soundwave Art',
    description: 'Perfect for first heartbeats, baby cries, vows, and favorite song quotes.',
    icon: <AudioWaveform className="w-6 h-6 text-emerald-400" />,
    route: '/trend-posters/soundwave',
    presets: [
      { id: 'first-heartbeat', title: 'First Heartbeat', label: 'Family' },
      { id: 'first-cry', title: 'First Cry', label: 'Family' },
      { id: 'first-word', title: 'First Word', label: 'Family' },
      { id: 'first-laugh', title: 'First Laugh', label: 'Family' },
      { id: 'welcome-home-adoption', title: 'Welcome Home', label: 'Family' },
      { id: 'mothers-day-audio', title: 'Mother\'s Day Message', label: 'Family' },
      { id: 'fathers-day-audio', title: 'Father\'s Day Message', label: 'Family' },
      { id: 'wedding-vows-audio', title: 'Wedding Vows', label: 'Love' },
      { id: 'proposal-audio', title: 'The Proposal', label: 'Love' },
      { id: 'wedding-dance-audio', title: 'First Dance', label: 'Love' },
      { id: 'i-love-you-audio', title: 'I Love You Message', label: 'Love' },
      { id: 'late-night-memo', title: 'Late Night Memo', label: 'Love' },
      { id: 'apology-memo', title: 'Apology Voice Memo', label: 'Love' },
      { id: 'grandmas-voicemail', title: 'Grandma\'s Voicemail', label: 'Tribute' },
      { id: 'in-loving-memory', title: 'In Loving Memory', label: 'Tribute' },
      { id: 'pet-memorial-audio', title: 'Pet Memorial', label: 'Pets' },
      { id: 'pet-adoption-audio', title: 'Gotcha Day', label: 'Pets' },
      { id: 'song-chorus', title: 'Iconic Song Chorus', label: 'Culture' },
      { id: 'movie-quote-audio', title: 'Movie Quote', label: 'Culture' },
      { id: 'poem-recital-audio', title: 'Poem Recital', label: 'Culture' },
      { id: 'stand-up-comedy-audio', title: 'Stand-Up Laughs', label: 'Culture' },
      { id: 'car-engine-roar', title: 'Car Engine Roar', label: 'Hobbies' },
      { id: 'esports-ggwp', title: 'Esports Call', label: 'Hobbies' },
      { id: 'graduation-speech', title: 'Graduation Speech', label: 'Milestones' },
      { id: 'retirement-farewell-audio', title: 'Retirement Farewell', label: 'Milestones' },
      { id: 'military-deployment-audio', title: 'Military Deployment', label: 'Milestones' },
      { id: 'inside-joke-audio', title: 'Inside Joke', label: 'Milestones' },
      { id: 'time-capsule-audio', title: 'Time Capsule', label: 'Milestones' }
    ]
  },
  {
    title: 'Vintage Receipt',
    description: 'Transform memories, milestones, and lists into a retro supermarket receipt.',
    icon: <FileText className="w-6 h-6 text-amber-400" />,
    route: '/trend-posters/receipt',
    presets: [
      { id: 'love-invoice', title: 'Love Invoice', label: 'Love' },
      { id: 'anniversary-bill', title: 'Anniversary Bill', label: 'Love' },
      { id: 'marathon-finisher', title: 'Marathon Finisher', label: 'Sports' },
      { id: 'weight-loss-journey', title: 'Weight Loss Transformation', label: 'Health' },
      { id: 'bodybuilding-stats', title: 'Lifting Records', label: 'Health' },
      { id: 'championship-win', title: 'Championship Win', label: 'Sports' },
      { id: 'gamer-match-stats', title: 'Match Statistics', label: 'Hobbies' },
      { id: 'cafe-bistro', title: 'Cafe Menu', label: 'Business' },
      { id: 'creator-milestones', title: 'Creator Milestones', label: 'Business' },
      { id: 'first-business', title: 'Startup Costs', label: 'Business' },
      { id: 'bucket-list-traveler', title: 'Travel Bucket List', label: 'Travel' },
      { id: 'birthday-invoice-18', title: '18th Birthday Invoice', label: 'Milestones' },
      { id: 'birthday-invoice-30', title: '30th Birthday Invoice', label: 'Milestones' },
      { id: 'roommate-rules-receipt', title: 'Roommate Rules', label: 'Home' },
      { id: 'graduation-costs', title: 'Graduation Costs', label: 'Milestones' }
    ]
  },
  {
    title: 'Typography & Quotes',
    description: 'Clean, typography-focused layouts describing people, roles, or inside jokes.',
    icon: <BookA className="w-6 h-6 text-blue-400" />,
    route: '/trend-posters/typography',
    presets: [
      { id: 'stoic-wisdom', title: 'Stoic Wisdom', label: 'Inspiration' },
      { id: 'personal-manifesto', title: 'Personal Manifesto', label: 'Inspiration' },
      { id: 'motivational-quote', title: 'Motivational Quote', label: 'Inspiration' },
      { id: 'sobriety-manifesto', title: 'Sobriety Milestone', label: 'Health' },
      { id: 'company-core-values', title: 'Company Core Values', label: 'Corporate' },
      { id: 'work-anniversary', title: 'Work Anniversary', label: 'Corporate' },
      { id: 'dog-house-rules', title: 'Dog Rules', label: 'Pets' },
      { id: 'cat-house-rules', title: 'Cat Rules', label: 'Pets' },
      { id: 'martial-arts-dojo', title: 'Dojo Discipline', label: 'Sports' },
      { id: 'mountaineering-summit', title: 'Summit Rules', label: 'Sports' },
      { id: 'chef-kitchen-rules', title: 'Kitchen Rules', label: 'Hobbies' },
      { id: 'airbnb-welcome-guide', title: 'AirBNB Guide', label: 'Home' },
      { id: 'home-office-rules', title: 'Home Office Rules', label: 'Home' },
      { id: 'cinema-monologue', title: 'Cinema Monologue', label: 'Culture' },
      { id: 'literature-extract', title: 'Literature Extract', label: 'Culture' },
      { id: 'stand-up-comedy-text', title: 'Stand-Up Joke', label: 'Culture' }
    ]
  },
  {
    title: 'Coordinates Map',
    description: 'Mark the exact location of a special moment.',
    icon: <MapPin className="w-6 h-6 text-red-400" />,
    route: '/trend-posters/coordinates',
    presets: [
      { id: 'first-home', title: 'Our First Home', label: 'Home' },
      { id: 'realtor-closing', title: 'Realtor Closing Gift', label: 'Corporate' },
      { id: 'where-we-met', title: 'Where We Met', label: 'Love' },
      { id: 'the-proposal-spot', title: 'The Proposal Spot', label: 'Love' },
      { id: 'first-kiss-location', title: 'First Kiss Location', label: 'Love' },
      { id: 'long-distance-map', title: 'Long Distance Map', label: 'Love' },
      { id: 'honeymoon-travel', title: 'Honeymoon Memory', label: 'Travel' },
      { id: 'favorite-vacation', title: 'Favorite Vacation Spot', label: 'Travel' },
      { id: 'mountain-summit-map', title: 'Summit Reached', label: 'Sports' },
      { id: 'moving-abroad', title: 'Moving Abroad', label: 'Milestones' },
      { id: 'hometown-pride', title: 'Hometown Pride', label: 'Milestones' }
    ]
  },
  {
    title: 'Starmap (Night Sky)',
    description: 'The exact alignment of the stars on your special night.',
    icon: <Star className="w-6 h-6 text-purple-400" />,
    route: '/trend-posters/starmap',
    presets: [
      { id: 'night-we-met-stars', title: 'The Night We Met', label: 'Love' },
      { id: 'born-under-stars', title: 'Born Under The Stars', label: 'Family' },
      { id: 'wedding-night-stars', title: 'Our Wedding Night', label: 'Love' },
      { id: 'the-night-you-said-yes', title: 'The Night You Said Yes', label: 'Love' },
      { id: 'first-kiss-sky', title: 'First Kiss Sky', label: 'Love' },
      { id: 'anniversary-sky', title: 'Anniversary Sky', label: 'Love' },
      { id: 'zodiac-constellation', title: 'Zodiac Constellation', label: 'Astrology' },
      { id: 'new-years-eve-sky', title: 'New Years Eve Sky', label: 'Milestones' },
      { id: 'graduation-night-stars', title: 'Graduation Night', label: 'Milestones' },
      { id: 'adopted-day-sky', title: 'Adoption Day Sky', label: 'Family' },
      { id: 'memorial-night-sky', title: 'Memorial Night Sky', label: 'Tribute' }
    ]
  },
  {
    title: 'Retro Cassette',
    description: 'Vintage cassette tape designs for your favorite playlists.',
    icon: <Disc className="w-6 h-6 text-orange-400" />,
    route: '/trend-posters/cassette',
    presets: [
      { id: 'synthwave-80s', title: '80s Synthwave', label: 'Music' },
      { id: 'vintage-acoustic', title: 'Vintage Acoustic', label: 'Music' },
      { id: 'lofi-sunset', title: 'Lo-Fi Sunset', label: 'Music' },
      { id: 'road-trip-mixtape', title: 'Road Trip Mixtape', label: 'Travel' },
      { id: 'workout-playlist', title: 'Workout Playlist', label: 'Health' },
      { id: 'first-dance-mixtape', title: 'First Dance Mixtape', label: 'Love' },
      { id: 'breakup-songs', title: 'Breakup Songs', label: 'Love' },
      { id: 'summer-vibes', title: 'Summer Vibes', label: 'Culture' },
      { id: 'stand-up-special-tape', title: 'Stand-Up Special', label: 'Culture' },
      { id: 'hip-hop-90s', title: '90s Hip Hop', label: 'Music' },
      { id: 'jazz-classics', title: 'Jazz Classics', label: 'Music' }
    ]
  },
  {
    title: 'Typewriter Letter',
    description: 'Classic typewriter text style for letters, vows, and poems.',
    icon: <Keyboard className="w-6 h-6 text-gray-400" />,
    route: '/trend-posters/typewriter',
    presets: [
      { id: 'love-letter-vintage', title: 'Vintage Love Letter', label: 'Love' },
      { id: 'wedding-vows-letter', title: 'Wedding Vows', label: 'Love' },
      { id: 'sincere-apology-letter', title: 'Sincere Apology', label: 'Love' },
      { id: 'anniversary-letter', title: 'Anniversary Letter', label: 'Love' },
      { id: 'poem-recital-letter', title: 'Poem Recital', label: 'Culture' },
      { id: 'baptism-blessing-letter', title: 'Baptism Blessing', label: 'Family' },
      { id: 'teacher-thank-you-letter', title: 'Teacher Thank You', label: 'Education' },
      { id: 'secret-capsule-letter', title: 'Time Capsule Letter', label: 'Milestones' },
      { id: 'letters-to-child', title: 'Letters To My Child', label: 'Family' },
      { id: 'mothers-day-letter', title: 'Mother\'s Day Letter', label: 'Family' },
      { id: 'fathers-day-letter', title: 'Father\'s Day Letter', label: 'Family' }
    ]
  },
  {
    title: 'Polaroid Gallery',
    description: 'A grid of beautiful polaroid-style photos with captions.',
    icon: <Camera className="w-6 h-6 text-teal-400" />,
    route: '/trend-posters/polaroid',
    presets: [
      { id: 'sweet-trio', title: 'Sweet Trio', label: 'Photography' },
      { id: 'minimalist-duo', title: 'Minimalist Duo', label: 'Photography' },
      { id: 'sibling-bond-photos', title: 'Sibling Bond', label: 'Family' },
      { id: 'baby-first-year', title: 'Baby\'s First Year', label: 'Family' },
      { id: 'first-date-memories', title: 'First Date Memories', label: 'Love' },
      { id: 'wedding-day-snaps', title: 'Wedding Day Snaps', label: 'Love' },
      { id: 'travel-highlights', title: 'Travel Highlights', label: 'Travel' },
      { id: 'honeymoon-snaps', title: 'Honeymoon Snaps', label: 'Travel' },
      { id: 'pet-memories', title: 'Pet Memories', label: 'Pets' },
      { id: 'graduation-day', title: 'Graduation Day', label: 'Milestones' },
      { id: 'best-friends-forever', title: 'Best Friends Forever', label: 'Culture' }
    ]
  },
  {
    title: 'Patent Blueprints',
    description: 'Technical drawing aesthetics for hobbies and inventions.',
    icon: <FileBadge className="w-6 h-6 text-blue-300" />,
    route: '/trend-posters/patent',
    presets: [
      { id: 'electric-guitar', title: 'Electric Guitar', label: 'Hobbies' },
      { id: 'arcade-game-controller', title: 'Arcade Game Controller', label: 'Hobbies' },
      { id: 'vinyl-record-player', title: 'Vinyl Record Player', label: 'Hobbies' },
      { id: 'chef-knife-blueprint', title: 'Chef\'s Knife', label: 'Hobbies' },
      { id: 'espresso-machine', title: 'Espresso Machine', label: 'Hobbies' },
      { id: 'equestrian-saddle', title: 'Equestrian Saddle', label: 'Hobbies' },
      { id: 'classic-sports-car', title: 'Classic Sports Car', label: 'Hobbies' },
      { id: 'mechanical-keyboard', title: 'Mechanical Keyboard', label: 'Hobbies' },
      { id: 'vintage-camera', title: 'Vintage Camera', label: 'Hobbies' },
      { id: 'bicycle-frame', title: 'Bicycle Frame', label: 'Hobbies' },
      { id: 'sneaker-design', title: 'Sneaker Design', label: 'Sports' }
    ]
  },
  {
    title: 'Pantone Color',
    description: 'Minimalist color swatch cards for special moments.',
    icon: <Palette className="w-6 h-6 text-pink-400" />,
    route: '/trend-posters/pantone',
    presets: [
      { id: 'sunset-date', title: 'Sunset Date', label: 'Love' },
      { id: 'wedding-bouquet', title: 'Wedding Bouquet', label: 'Love' },
      { id: 'baby-nursery-palette', title: 'Nursery Palette', label: 'Family' },
      { id: 'ocean-wanderer', title: 'Ocean Wanderer', label: 'Travel' },
      { id: 'city-lights', title: 'City Lights', label: 'Travel' },
      { id: 'desert-safari', title: 'Desert Safari', label: 'Travel' },
      { id: 'autumn-vibes', title: 'Autumn Vibes', label: 'Culture' },
      { id: 'spring-blossom', title: 'Spring Blossom', label: 'Culture' },
      { id: 'winter-wonderland', title: 'Winter Wonderland', label: 'Culture' },
      { id: 'pet-fur-tones', title: 'Pet Fur Tones', label: 'Pets' },
      { id: 'first-home-colors', title: 'First Home Colors', label: 'Home' }
    ]
  },
  {
    title: 'Vintage Newspaper',
    description: 'Classic front-page newspaper announcement layouts.',
    icon: <Newspaper className="w-6 h-6 text-stone-400" />,
    route: '/trend-posters/newspaper',
    presets: [
      { id: 'birthday-legend-18', title: '18th Birthday Legend', label: 'Milestones' },
      { id: 'birthday-legend-30', title: '30th Birthday Legend', label: 'Milestones' },
      { id: 'birthday-legend-50', title: '50th Birthday Legend', label: 'Milestones' },
      { id: 'anniversary-headline', title: 'Anniversary Headline', label: 'Love' },
      { id: 'wedding-announcement', title: 'Wedding Announcement', label: 'Love' },
      { id: 'engagement-news', title: 'Engagement News', label: 'Love' },
      { id: 'new-baby-announcement', title: 'New Baby Announcement', label: 'Family' },
      { id: 'graduation-headline', title: 'Graduation Headline', label: 'Milestones' },
      { id: 'retirement-news', title: 'Retirement News', label: 'Milestones' },
      { id: 'championship-headline', title: 'Championship Victory', label: 'Sports' },
      { id: 'startup-headline', title: 'Startup Launch', label: 'Business' }
    ]
  },
  {
    title: 'Heart Typography',
    description: 'Words, lyrics, or names beautifully shaped into a heart.',
    icon: <Heart className="w-6 h-6 text-rose-500" />,
    route: '/trend-posters/heart',
    presets: [
      { id: 'unconditional-vows', title: 'Unconditional Vows', label: 'Love' },
      { id: 'first-dance-heart', title: 'First Dance Lyrics', label: 'Love' },
      { id: 'anniversary-letter-heart', title: 'Anniversary Letter', label: 'Love' },
      { id: 'a-mothers-love', title: 'A Mother\'s Love', label: 'Family' },
      { id: 'fathers-day-tribute', title: 'Father\'s Day Tribute', label: 'Family' },
      { id: 'grandparents-love', title: 'Grandparents Love', label: 'Family' },
      { id: 'sibling-bond-heart', title: 'Sibling Bond', label: 'Family' },
      { id: 'teacher-thank-you-heart', title: 'Teacher Thank You', label: 'Education' },
      { id: 'best-friends-forever-heart', title: 'Best Friends Forever', label: 'Culture' },
      { id: 'pet-tribute-heart', title: 'Pet Tribute', label: 'Pets' },
      { id: 'song-lyrics-heart', title: 'Song Lyrics', label: 'Music' }
    ]
  },
  {
    title: 'AirBNB Guides',
    description: 'Stylish house rule and welcome guides for properties.',
    icon: <Home className="w-6 h-6 text-indigo-400" />,
    route: '/trend-posters/airbnb',
    presets: [
      { id: 'cozy-beach-retreat', title: 'Cozy Beach Retreat', label: 'Home' },
      { id: 'urban-industrial-loft', title: 'Urban Industrial Loft', label: 'Home' },
      { id: 'alpine-mountain-cabin', title: 'Alpine Mountain Cabin', label: 'Home' },
      { id: 'desert-oasis-guide', title: 'Desert Oasis Guide', label: 'Home' },
      { id: 'lake-house-rules', title: 'Lake House Rules', label: 'Home' },
      { id: 'city-center-apartment', title: 'City Center Apartment', label: 'Home' },
      { id: 'forest-treehouse', title: 'Forest Treehouse', label: 'Home' },
      { id: 'luxury-villa-guide', title: 'Luxury Villa Guide', label: 'Home' },
      { id: 'vintage-cottage', title: 'Vintage Cottage', label: 'Home' },
      { id: 'tropical-resort', title: 'Tropical Resort', label: 'Home' },
      { id: 'family-guest-house', title: 'Family Guest House', label: 'Home' }
    ]
  },
  {
    title: 'Toddler & Kids',
    description: 'Playful and cute designs for children\'s rooms and nurseries.',
    icon: <Baby className="w-6 h-6 text-fuchsia-400" />,
    route: '/trend-posters/toddler',
    presets: [
      { id: 'sweet-wildflower', title: 'Sweet Wildflower', label: 'Family' },
      { id: 'little-astronaut', title: 'Little Astronaut', label: 'Family' },
      { id: 'forest-explorer', title: 'Forest Explorer', label: 'Family' },
      { id: 'ocean-voyager', title: 'Ocean Voyager', label: 'Family' },
      { id: 'dinosaur-adventure', title: 'Dinosaur Adventure', label: 'Family' },
      { id: 'rainbow-unicorn', title: 'Rainbow Unicorn', label: 'Family' },
      { id: 'safari-animals', title: 'Safari Animals', label: 'Family' },
      { id: 'little-princess', title: 'Little Princess', label: 'Family' },
      { id: 'construction-vehicles', title: 'Construction Vehicles', label: 'Family' },
      { id: 'fairy-tale-castle', title: 'Fairy Tale Castle', label: 'Family' },
      { id: 'magic-garden', title: 'Magic Garden', label: 'Family' }
    ]
  }
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#050505]">
      <header className="border-b border-neutral-900 bg-black sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="font-bold text-xl tracking-tight text-white cursor-pointer" onClick={() => navigate('/')}>MusicPoster<span className="text-neutral-500">.shop</span></div>
          <div className="flex gap-6 text-sm font-medium text-neutral-400">
            <button onClick={() => navigate('/claim')} className="hover:text-white transition-colors">Claim Order</button>
            <button onClick={() => navigate('/admin-portal')} className="hover:text-white transition-colors">Admin</button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="mb-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-white">Poster Themes & Layouts</h1>
          <p className="text-neutral-400 text-lg max-w-2xl">
            Select a typographic layout to transform any specific memory, achievement, or inside joke into a stunning piece of wall art.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {THEME_CATEGORIES.map((category) => (
          <div key={category.title} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 flex flex-col">
            <div className="w-12 h-12 bg-neutral-950 border border-neutral-800 rounded-xl flex items-center justify-center mb-6">
              {category.icon}
            </div>
            <h2 className="text-2xl font-bold mb-2 text-white">{category.title}</h2>
            <p className="text-neutral-400 mb-8 flex-1">{category.description}</p>
            
            <div className="space-y-3">
              <h3 className="text-xs font-bold tracking-widest text-neutral-500 uppercase mb-4">Themes ({category.presets.length})</h3>
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {category.presets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => navigate(`${category.route}?preset=${preset.id}`)}
                    className="w-full flex items-center justify-between p-4 bg-neutral-950 border border-neutral-800 rounded-xl hover:border-neutral-600 transition-colors text-left group"
                  >
                    <div>
                      <div className="font-semibold text-neutral-200 group-hover:text-white">{preset.title}</div>
                      <div className="text-xs text-neutral-500 mt-1">{preset.label}</div>
                    </div>
                    <span className="text-neutral-600 group-hover:text-white transition-colors">→</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
        </div>
      </main>
    </div>
  );
}
