/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { 
  Music, 
  Search, 
  Sparkles, 
  Download, 
  Play, 
  Pause, 
  Volume2, 
  Info, 
  Film, 
  Zap, 
  Wind, 
  Moon, 
  Sun,
  Loader2,
  ExternalLink,
  ChevronRight,
  Settings2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Track {
  title: string;
  artist: string;
  genre: string;
  mood: string;
  description: string;
  downloadUrl: string;
  platform: string;
}

export default function App() {
  const [sceneDescription, setSceneDescription] = useState('');
  const [mood, setMood] = useState('Cinematic');
  const [energy, setEnergy] = useState(50);
  const [pace, setPace] = useState(50);
  const [loading, setLoading] = useState(false);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [error, setError] = useState<string | null>(null);

  const moods = ['Cinematic', 'Lo-fi', 'Upbeat', 'Dark', 'Ethereal', 'Minimalist', 'Epic', 'Chill'];

  const generateRecommendations = async () => {
    if (!sceneDescription.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `I need royalty-free music recommendations for a scene with these parameters:
        Scene Description: ${sceneDescription}
        Mood: ${mood}
        Energy Level: ${energy}/100
        Pace: ${pace}/100
        
        Please provide 4-5 specific, real tracks that are available for free download (e.g., from Pixabay Music, Free Music Archive, YouTube Audio Library, or similar). 
        For each track, include:
        1. Title
        2. Artist
        3. Genre
        4. Mood
        5. A brief description of why it fits the scene
        6. A direct or search URL for the track on a free platform.
        
        Format the output as a JSON array of objects.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                artist: { type: Type.STRING },
                genre: { type: Type.STRING },
                mood: { type: Type.STRING },
                description: { type: Type.STRING },
                downloadUrl: { type: Type.STRING },
                platform: { type: Type.STRING },
              },
              required: ["title", "artist", "genre", "mood", "description", "downloadUrl", "platform"]
            }
          },
          tools: [{ googleSearch: {} }]
        }
      });

      const result = JSON.parse(response.text || '[]');
      setTracks(result);
    } catch (err) {
      console.error(err);
      setError("Failed to generate recommendations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Header */}
      <header className="h-16 border-b border-white/10 flex items-center px-6 justify-between glass sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center glow-accent">
            <Music className="w-5 h-5 text-black" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">VibeSync</h1>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-sm text-zinc-400 hover:text-white transition-colors">Documentation</button>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            AI ENGINE ACTIVE
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Sidebar - Controls */}
        <aside className="w-full lg:w-96 border-r border-white/10 p-6 overflow-y-auto bg-zinc-950/50">
          <div className="space-y-8">
            <section>
              <label className="flex items-center gap-2 text-xs font-mono text-zinc-500 uppercase tracking-widest mb-3">
                <Film className="w-3 h-3" /> Scene Description
              </label>
              <textarea
                value={sceneDescription}
                onChange={(e) => setSceneDescription(e.target.value)}
                placeholder="Describe your scene... (e.g., A lone traveler walking through a neon-lit Tokyo street in the rain)"
                className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all resize-none placeholder:text-zinc-600"
              />
            </section>

            <section>
              <label className="flex items-center gap-2 text-xs font-mono text-zinc-500 uppercase tracking-widest mb-4">
                <Zap className="w-3 h-3" /> Vibe Parameters
              </label>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-zinc-400">Mood</span>
                    <span className="text-emerald-500 font-medium">{mood}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {moods.map((m) => (
                      <button
                        key={m}
                        onClick={() => setMood(m)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-xs border transition-all",
                          mood === m 
                            ? "bg-emerald-500 border-emerald-500 text-black font-semibold" 
                            : "bg-white/5 border-white/10 text-zinc-400 hover:border-white/30"
                        )}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-zinc-400">Energy</span>
                    <span className="text-zinc-200">{energy}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={energy}
                    onChange={(e) => setEnergy(parseInt(e.target.value))}
                    className="w-full accent-emerald-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-zinc-400">Pace</span>
                    <span className="text-zinc-200">{pace}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={pace}
                    onChange={(e) => setPace(parseInt(e.target.value))}
                    className="w-full accent-emerald-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </section>

            <button
              onClick={generateRecommendations}
              disabled={loading || !sceneDescription.trim()}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-500 text-black font-bold rounded-xl transition-all flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Generate Soundtrack
                </>
              )}
            </button>
          </div>
        </aside>

        {/* Main Content - Results */}
        <section className="flex-1 p-8 overflow-y-auto relative">
          <AnimatePresence mode="wait">
            {!tracks.length && !loading && !error ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto"
              >
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                  <Music className="w-10 h-10 text-zinc-600" />
                </div>
                <h2 className="text-2xl font-serif italic mb-3">Ready for your scene?</h2>
                <p className="text-zinc-500 text-sm leading-relaxed">
                  Describe your scene on the left and our AI will find the perfect royalty-free tracks to match the vibe.
                </p>
              </motion.div>
            ) : loading ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center"
              >
                <div className="relative">
                  <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
                  <div className="absolute inset-0 blur-xl bg-emerald-500/20 animate-pulse" />
                </div>
                <p className="mt-6 text-sm font-mono text-zinc-500 animate-pulse">ANALYZING SCENE DYNAMICS...</p>
              </motion.div>
            ) : error ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center text-red-400"
              >
                <Info className="w-10 h-10 mb-4" />
                <p>{error}</p>
                <button 
                  onClick={generateRecommendations}
                  className="mt-4 text-sm underline hover:text-white"
                >
                  Try again
                </button>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 xl:grid-cols-2 gap-6"
              >
                {tracks.map((track, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="group relative bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/[0.08] hover:border-white/20 transition-all"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-[10px] font-mono text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase tracking-wider mb-2 inline-block">
                          {track.genre}
                        </span>
                        <h3 className="text-lg font-bold leading-tight group-hover:text-emerald-400 transition-colors">
                          {track.title}
                        </h3>
                        <p className="text-sm text-zinc-400">by {track.artist}</p>
                      </div>
                      <div className="flex gap-2">
                        <a 
                          href={track.downloadUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-emerald-500 hover:text-black transition-all"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    </div>

                    <p className="text-sm text-zinc-500 line-clamp-3 mb-6 italic">
                      "{track.description}"
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <div className="flex items-center gap-2 text-xs text-zinc-500">
                        <Moon className="w-3 h-3" />
                        <span>Mood: {track.mood}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-600">
                        VIA {track.platform.toUpperCase()}
                        <ExternalLink className="w-2 h-2" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      {/* Footer */}
      <footer className="h-10 border-t border-white/10 flex items-center px-6 justify-between text-[10px] text-zinc-600 font-mono">
        <div className="flex gap-4">
          <span>LATENCY: 142ms</span>
          <span>SAMPLES: 4.2k</span>
        </div>
        <div>VIBESYNC v1.0.4 - POWERED BY GEMINI 3 FLASH</div>
      </footer>
    </div>
  );
}
