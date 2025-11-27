import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Heart, Share2, MoreHorizontal, Info, Search, Menu, X, ArrowRight, Disc } from 'lucide-react';
import { Track, PlayerState, PlayerStatus } from './types';
import Visualizer from './components/Visualizer';
import GeminiBadge from './components/GeminiBadge';
import { analyzeVibe } from './services/geminiService';

const SUSPENSE_LYRICS = `[Chorus]
I don't wanna be in suspense
Wasn't ever making sense
Had to lower my defense
Oh, oh
This is not a lease extension
Ease up on the apprehension
Missing all the intervention
Oh, oh

[Verse 1]
Yeah, look
Bottles popping in the lobby (pop)
Tell me is this love or a hobby? (is it?)
Body language reading sloppy
You're an original, never a copy (nah)
Cashed out, lashed out, hit the road
Heavy heart, yeah, carrying a load
Zip code changing, switching up the mode
Story that was never told (yeah)

[Verse 2]
Wait a minute, get it how you live it
Ten toes down but the trust is pivoted
Limitless, yeah we pushing past the limit
Ticket to the ride, yeah we gotta win it (gotta win it)
Fade away, shot looking like a fade away
Praying for a better day, a getaway
Blue faces in the safe, let 'em stay
Nothing else left to say

[Chorus]
I don't wanna be in suspense
Wasn't ever making sense
Had to lower my defense
Oh, oh
This is not a lease extension
Ease up on the apprehension
Missing all the intervention
Oh, oh

[Outro]
Suspense (yeah)
Defense (no)
Oh, oh
Just making sense`;

const MOCK_PLAYLIST: Track[] = [
  {
    id: '1',
    title: 'Suspense',
    artist: 'Akadion',
    url: 'https://files.catbox.moe/ypggqy.wav',
    cover: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop',
    duration: '2:15',
    lyrics: SUSPENSE_LYRICS
  }
];

const App: React.FC = () => {
  const [hasEntered, setHasEntered] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playerState, setPlayerState] = useState<PlayerState>({
    currentTrack: MOCK_PLAYLIST[0],
    status: PlayerStatus.PAUSED,
    volume: 0.7,
    currentTime: 0,
    duration: 0,
    isMuted: false
  });
  const [geminiAnalysis, setGeminiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);

  // Audio Event Listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      setPlayerState(prev => ({ ...prev, currentTime: audio.currentTime }));
    };

    const updateDuration = () => {
      setPlayerState(prev => ({ ...prev, duration: audio.duration }));
    };

    const handleEnded = () => {
      setPlayerState(prev => ({ ...prev, status: PlayerStatus.PAUSED, currentTime: 0 }));
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  // Sync Play/Pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playerState.status === PlayerStatus.PLAYING) {
      audio.play().catch(e => {
        console.error("Autoplay prevented:", e);
        setPlayerState(prev => ({ ...prev, status: PlayerStatus.PAUSED }));
      });
    } else {
      audio.pause();
    }
  }, [playerState.status]);

  // Sync Volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = playerState.isMuted ? 0 : playerState.volume;
    }
  }, [playerState.volume, playerState.isMuted]);

  // Handlers
  const togglePlay = () => {
    setPlayerState(prev => ({
      ...prev,
      status: prev.status === PlayerStatus.PLAYING ? PlayerStatus.PAUSED : PlayerStatus.PLAYING
    }));
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (audioRef.current) audioRef.current.currentTime = time;
    setPlayerState(prev => ({ ...prev, currentTime: time }));
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlayerState(prev => ({ ...prev, volume: Number(e.target.value), isMuted: false }));
  };

  const handleGeminiAnalysis = async () => {
    if (!playerState.currentTrack) return;
    setIsAnalyzing(true);
    const result = await analyzeVibe(playerState.currentTrack.title);
    setGeminiAnalysis(result);
    setIsAnalyzing(false);
  };

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return '0:00';
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  // Welcome Screen
  if (!hasEntered) {
    return (
      <div className="h-screen w-full bg-[#020617] flex items-center justify-center relative overflow-hidden">
        {/* Abstract Background */}
        <div className="absolute top-[-20%] left-[-20%] w-[800px] h-[800px] bg-purple-900/30 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-20%] right-[-20%] w-[600px] h-[600px] bg-red-900/20 rounded-full blur-[100px] animate-pulse-slow" style={{animationDelay: '1.5s'}}></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        
        <div className="z-10 text-center space-y-12 p-8 animate-fade-in backdrop-blur-3xl bg-white/5 border border-white/10 p-12 rounded-3xl shadow-2xl">
          <div className="space-y-4">
             <div className="inline-block px-3 py-1 rounded-full border border-red-500/30 bg-red-500/10 mb-4">
                <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Demo Beta Experience</span>
             </div>
             <h1 className="text-7xl md:text-9xl font-display font-bold text-white tracking-tighter">
              ALLFINES<span className="text-red-500">.</span>
            </h1>
            <p className="text-xs md:text-sm text-slate-400 uppercase tracking-[0.3em] font-medium">
              Premium Audio Architecture
            </p>
          </div>
          
          <button 
            onClick={() => setHasEntered(true)}
            className="group relative inline-flex items-center justify-center px-10 py-5 bg-white text-black overflow-hidden transition-all hover:bg-slate-200 rounded-full"
          >
            <span className="relative flex items-center gap-3 font-display uppercase tracking-widest text-xs font-bold">
              Enter Session <ArrowRight size={16} />
            </span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col overflow-hidden selection:bg-red-500/30 selection:text-white">
      {/* Hidden Audio Element */}
      <audio 
        ref={audioRef} 
        src={playerState.currentTrack?.url} 
        crossOrigin="anonymous" 
      />

      {/* Floating Topbar */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 w-[92%] max-w-7xl h-16 rounded-2xl border border-white/10 bg-black/60 backdrop-blur-xl z-50 px-6 flex items-center justify-between shadow-lg shadow-black/50">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <h1 className="text-xl font-display font-bold text-white tracking-tighter">
              ALLFINES
            </h1>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white cursor-pointer hover:text-red-400 transition-colors">Studio</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 cursor-not-allowed">Discovery</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 cursor-not-allowed">Agency</span>
          </nav>
        </div>

        <div className="flex items-center gap-4">
           <div className="hidden md:block">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest mr-4">v 0.9 Beta</span>
           </div>
          <GeminiBadge />
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative scroll-smooth no-scrollbar">
        
        {/* Dynamic Background */}
        <div className="fixed inset-0 z-0 pointer-events-none">
            <div className="absolute top-[-10%] left-[20%] w-[60vw] h-[60vw] bg-purple-600/20 rounded-full blur-[150px] opacity-40"></div>
            <div className="absolute bottom-[10%] right-[10%] w-[40vw] h-[40vw] bg-red-600/20 rounded-full blur-[150px] opacity-30"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
        </div>

        {/* Hero Content */}
        <section className="relative w-full min-h-[85vh] flex flex-col items-center justify-center pt-20 pb-10 px-6">
           <div className="relative z-10 w-full max-w-5xl mx-auto text-center space-y-8">
              
              {/* Cover Art (Decorative) */}
              <div className="relative w-64 h-64 md:w-80 md:h-80 mx-auto mb-12 group perspective-1000">
                  <div className={`w-full h-full rounded-2xl bg-gradient-to-br from-purple-500 to-red-500 p-1 shadow-2xl shadow-purple-900/50 transition-transform duration-700 ${playerState.status === PlayerStatus.PLAYING ? 'scale-105' : 'scale-100'}`}>
                       <img 
                         src={playerState.currentTrack?.cover} 
                         alt="Cover" 
                         className="w-full h-full object-cover rounded-xl opacity-90 filter contrast-125"
                       />
                  </div>
                  {/* Glow effect */}
                  <div className={`absolute -inset-4 bg-gradient-to-br from-purple-600 to-red-600 rounded-full blur-2xl opacity-40 -z-10 transition-opacity duration-1000 ${playerState.status === PlayerStatus.PLAYING ? 'opacity-60' : 'opacity-20'}`}></div>
              </div>

              <div className="space-y-2 animate-fade-in">
                 <div className="flex items-center justify-center gap-3 mb-4">
                    <span className="px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-[9px] font-bold text-slate-300 uppercase tracking-widest">
                        Single Release
                    </span>
                    <span className="px-3 py-1 rounded-full border border-red-500/20 bg-red-500/5 backdrop-blur-sm text-[9px] font-bold text-red-400 uppercase tracking-widest">
                        Demo / Recording Only
                    </span>
                 </div>
                 
                 <h1 className="text-5xl md:text-8xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 tracking-tighter">
                   {playerState.currentTrack?.title}
                 </h1>
                 
                 <p className="text-lg md:text-xl text-slate-400 font-light tracking-wide">
                   Written by <span className="text-white font-medium border-b border-red-500/50 pb-0.5">Akadion</span>
                 </p>
              </div>

              <div className="flex items-center justify-center gap-6 animate-fade-in pt-6">
                <button 
                  onClick={togglePlay}
                  className="h-16 px-10 bg-white text-black rounded-full font-bold text-xs uppercase tracking-widest hover:bg-slate-200 transition-all hover:scale-105 flex items-center gap-3 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
                >
                  {playerState.status === PlayerStatus.PLAYING ? <Pause size={20} /> : <Play size={20} fill="currentColor" />}
                  {playerState.status === PlayerStatus.PLAYING ? 'Pause Playback' : 'Start Listening'}
                </button>
                <button 
                   onClick={() => setShowLyrics(!showLyrics)}
                   className={`h-16 w-16 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-all ${showLyrics ? 'bg-white/10 border-white/40' : ''}`}
                   title="Lyrics"
                >
                  <MoreHorizontal size={20} />
                </button>
             </div>
           </div>
        </section>

        {/* Details Section */}
        <section className="relative z-10 w-full max-w-4xl mx-auto px-6 pb-40">
           
           {/* Visualizer Container */}
           <div className="mb-16 bg-black/40 border border-white/5 backdrop-blur-md rounded-2xl p-8 shadow-2xl">
               <div className="flex justify-between items-center mb-6">
                   <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Realtime Frequency</h3>
                   <div className="flex gap-1">
                      <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                      <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                   </div>
               </div>
               <Visualizer audioRef={audioRef} isPlaying={playerState.status === PlayerStatus.PLAYING} />
               
               {/* AI Vibe Check */}
               <div className="mt-8 pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
                  <p className="text-sm text-slate-400 max-w-md">
                     {geminiAnalysis || "Ask Gemini AI to analyze the sonic signature of this track."}
                  </p>
                  <button 
                    onClick={handleGeminiAnalysis}
                    disabled={isAnalyzing}
                    className="shrink-0 px-4 py-2 border border-purple-500/30 text-purple-400 text-[10px] font-bold uppercase tracking-widest rounded hover:bg-purple-500/10 transition-colors"
                  >
                     {isAnalyzing ? 'Analyzing...' : 'Generate AI Analysis'}
                  </button>
               </div>
           </div>

           {/* Lyrics */}
           {showLyrics && playerState.currentTrack?.lyrics && (
               <div className="animate-fade-in bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-8 md:p-12">
                   <h3 className="text-center text-2xl font-display font-bold text-white mb-8">Verse Data</h3>
                   <div className="text-center space-y-6 text-slate-300 font-light leading-relaxed text-lg tracking-wide">
                      <pre className="font-sans whitespace-pre-wrap">{playerState.currentTrack.lyrics}</pre>
                   </div>
                   <div className="mt-12 text-center">
                      <p className="text-[10px] text-slate-600 uppercase tracking-widest">© 2024 Akadion Records. All Rights Reserved.</p>
                   </div>
               </div>
           )}

        </section>
      </main>

      {/* Floating Player Control */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-3xl h-20 bg-black/80 backdrop-blur-xl border border-white/10 rounded-full px-8 flex items-center justify-between z-50 shadow-2xl">
           
           <div className="flex items-center gap-4 w-1/3">
               <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-red-500 flex items-center justify-center shadow-lg ${playerState.status === PlayerStatus.PLAYING ? 'animate-spin' : ''} [animation-duration:8s]`}>
                   <Disc size={20} className="text-white opacity-80" />
               </div>
               <div className="hidden sm:block overflow-hidden">
                   <h4 className="text-xs font-bold text-white truncate">{playerState.currentTrack?.title}</h4>
                   <p className="text-[9px] text-slate-400 uppercase tracking-wider truncate">Akadion</p>
               </div>
           </div>

           <div className="flex-1 max-w-xs flex flex-col items-center gap-1">
               <div className="flex items-center gap-6">
                  <button className="text-slate-500 hover:text-white transition-colors"><SkipBack size={16} /></button>
                  <button onClick={togglePlay} className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                      {playerState.status === PlayerStatus.PLAYING ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
                  </button>
                  <button className="text-slate-500 hover:text-white transition-colors"><SkipForward size={16} /></button>
               </div>
               <div className="w-full h-1 bg-white/10 rounded-full mt-1 relative group cursor-pointer">
                    <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-red-500 rounded-full" style={{width: `${(playerState.currentTime / (playerState.duration || 1)) * 100}%`}}></div>
                    <input 
                        type="range" 
                        min={0} 
                        max={playerState.duration || 100} 
                        value={playerState.currentTime}
                        onChange={handleSeek}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
               </div>
           </div>

           <div className="flex items-center justify-end gap-3 w-1/3">
               <div className="hidden sm:flex items-center gap-2 w-20 group">
                   <Volume2 size={14} className="text-slate-500 group-hover:text-white transition-colors" />
                   <div className="flex-1 h-1 bg-white/10 rounded-full relative">
                      <div className="absolute top-0 left-0 h-full bg-slate-400 rounded-full" style={{width: `${playerState.volume * 100}%`}}></div>
                      <input 
                        type="range" 
                        min={0} 
                        max={1} 
                        step={0.01}
                        value={playerState.isMuted ? 0 : playerState.volume}
                        onChange={handleVolume}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                   </div>
               </div>
               <button className="text-slate-500 hover:text-red-500 transition-colors"><Heart size={16} /></button>
           </div>
      </div>

    </div>
  );
};

export default App;