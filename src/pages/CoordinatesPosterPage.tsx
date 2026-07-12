import React from 'react';

interface CoordinatesPosterPageProps {
  navigate: (path: string) => void;
}

export default function CoordinatesPosterPage({ navigate }: CoordinatesPosterPageProps) {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6 font-sans">
      <div className="text-center max-w-md bg-zinc-900 border border-zinc-800 p-8 rounded-3xl shadow-2xl">
        <h1 className="text-2xl font-black uppercase mb-2 tracking-wider text-indigo-400">Map Coordinates</h1>
        <p className="text-zinc-400 text-xs mb-6 leading-relaxed">
          Minimalist map pins and precise GPS coordinates of your special locations. Editor setup coming soon.
        </p>
        <button onClick={() => navigate('/trend-posters')} className="w-full bg-indigo-600 hover:bg-indigo-500 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer">
          Back to Selection
        </button>
      </div>
    </div>
  );
}
