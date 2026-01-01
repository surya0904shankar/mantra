
import React, { useState, useRef, useEffect } from 'react';
import { Plus, RotateCcw, BookOpen, Loader2, Check, ChevronDown, Save, X, Maximize2, Minimize2, Settings2, Volume2, Zap, Moon, Sun, Wind, Activity, Sparkles, CloudRain, Play, Square, Pause, Waves, Bird } from 'lucide-react';
import { Group, Mantra, PracticePreferences } from '../types';
import { getMantraInsight } from '../services/geminiService';

interface MantraCounterProps {
  activeGroup: Group | null;
  personalMantras: Mantra[];
  onUpdateCount: (increment: number, groupId: string | null, mantraText: string) => void;
  onAddPersonalMantra: (text: string, target: number) => void;
  isPremium: boolean;
  onUpgradeClick: () => void;
}

const MantraCounter: React.FC<MantraCounterProps> = ({ 
  activeGroup, 
  personalMantras, 
  onUpdateCount, 
  onAddPersonalMantra,
  isPremium,
  onUpgradeClick
}) => {
  const [sessionCount, setSessionCount] = useState(0);
  const [insight, setInsight] = useState<string | null>(null);
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);
  const [manualInput, setManualInput] = useState<string>('');
  const [isManualMode, setIsManualMode] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isAmbiancePlaying, setIsAmbiancePlaying] = useState(false);
  
  const [prefs, setPrefs] = useState<PracticePreferences>(() => {
    const saved = localStorage.getItem('om_practice_prefs');
    return saved ? JSON.parse(saved) : {
      sound: 'TEMPLE_BELL',
      ambianceSound: 'DEEP_OM',
      hapticStrength: 'SOFT',
      lowLightMode: false
    };
  });

  const audioCtx = useRef<AudioContext | null>(null);
  const ambianceNodes = useRef<{
    sources: (AudioBufferSourceNode | OscillatorNode)[];
    gain: GainNode | null;
  }>({ sources: [], gain: null });

  useEffect(() => {
    localStorage.setItem('om_practice_prefs', JSON.stringify(prefs));
  }, [prefs]);

  useEffect(() => {
    return () => {
      stopAmbiance();
    };
  }, []);

  const [selectedPersonalMantraId, setSelectedPersonalMantraId] = useState<string>(personalMantras[0]?.id || '');
  const [isCreatingMantra, setIsCreatingMantra] = useState(false);
  const [newMantraText, setNewMantraText] = useState('');
  const [isCommitting, setIsCommitting] = useState(false);

  const activeMantra = activeGroup 
    ? activeGroup.mantra 
    : personalMantras.find(m => m.id === selectedPersonalMantraId) || { text: 'Om Namah Shivaya', targetCount: 108, meaning: '' };

  const ensureAudioContext = () => {
    if (!audioCtx.current) {
      audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtx.current.state === 'suspended') {
      audioCtx.current.resume();
    }
    return audioCtx.current;
  };

  const stopAmbiance = () => {
    if (ambianceNodes.current.gain && audioCtx.current) {
      const now = audioCtx.current.currentTime;
      ambianceNodes.current.gain.gain.exponentialRampToValueAtTime(0.001, now + 1);
      setTimeout(() => {
        ambianceNodes.current.sources.forEach(source => {
          try {
            source.stop();
            source.disconnect();
          } catch (e) {}
        });
        ambianceNodes.current.sources = [];
        ambianceNodes.current.gain = null;
      }, 1100);
    }
    setIsAmbiancePlaying(false);
  };

  const startAmbiance = () => {
    const ctx = ensureAudioContext();
    const now = ctx.currentTime;
    const gainNode = ctx.createGain();
    
    // Deep Om is louder than other backgrounds as requested
    const targetVolume = prefs.ambianceSound === 'DEEP_OM' ? 0.15 : 0.08;
    
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(targetVolume, now + 2);
    gainNode.connect(ctx.destination);
    
    const activeSources: (AudioBufferSourceNode | OscillatorNode)[] = [];

    if (prefs.ambianceSound === 'DEEP_OM') {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(136.1, now); // Earth Year Om frequency
      
      const subOsc = ctx.createOscillator();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(68.05, now);
      
      const richOsc = ctx.createOscillator();
      richOsc.type = 'sine';
      richOsc.frequency.setValueAtTime(272.2, now); // Harmonic
      
      osc.connect(gainNode);
      subOsc.connect(gainNode);
      richOsc.connect(gainNode);
      
      osc.start();
      subOsc.start();
      richOsc.start();
      activeSources.push(osc, subOsc, richOsc);
    } else {
      const bufferSize = ctx.sampleRate * 2; // 2 second loop
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      
      if (prefs.ambianceSound === 'MORNING_BIRDS') {
        // Synthesis of wind and birds
        let lastOut = 0;
        // 1. Gentle Wind (Brownian Noise)
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          lastOut = (lastOut + (0.02 * white)) / 1.02;
          data[i] = lastOut * 2.5; 
        }
        // 2. Add high-frequency chirps at random intervals
        const addChirp = (startTime: number, freq: number, volume: number) => {
          const startIdx = Math.floor(startTime * ctx.sampleRate);
          const duration = Math.floor(0.12 * ctx.sampleRate);
          for (let i = 0; i < duration; i++) {
            if (startIdx + i < bufferSize) {
              const t = i / ctx.sampleRate;
              const fade = 1 - (i / duration);
              // Quick frequency slide for realism
              const currentFreq = freq + (Math.sin(t * 50) * 200);
              data[startIdx + i] += Math.sin(2 * Math.PI * currentFreq * t) * volume * fade;
            }
          }
        };
        addChirp(0.1, 3800, 0.2);
        addChirp(0.15, 4200, 0.15);
        addChirp(0.8, 3500, 0.18);
        addChirp(1.4, 4000, 0.22);
      } else if (prefs.ambianceSound === 'FOREST_WIND') {
        let lastOut = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          lastOut = (lastOut + (0.015 * white)) / 1.015;
          data[i] = lastOut * 8;
        }
      }

      const bufSource = ctx.createBufferSource();
      bufSource.buffer = buffer;
      bufSource.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = prefs.ambianceSound === 'MORNING_BIRDS' ? 2500 : 800;
      
      bufSource.connect(filter);
      filter.connect(gainNode);
      bufSource.start();
      activeSources.push(bufSource);
    }

    ambianceNodes.current = { sources: activeSources, gain: gainNode };
    setIsAmbiancePlaying(true);
  };

  const toggleAmbiance = () => {
    if (!isPremium) {
      onUpgradeClick();
      return;
    }
    if (isAmbiancePlaying) {
      stopAmbiance();
    } else {
      startAmbiance();
    }
  };

  const playChantSound = () => {
    if (prefs.sound === 'SILENCE') return;
    try {
      const ctx = ensureAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      if (prefs.sound === 'TEMPLE_BELL') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(660, ctx.currentTime);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 1.2);
      } else if (prefs.sound === 'WOODEN_MALA') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(180, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } else if (prefs.sound === 'RAIN_FALL') {
        const noiseBufferSize = ctx.sampleRate * 0.1;
        const noiseBuffer = ctx.createBuffer(1, noiseBufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < noiseBufferSize; i++) output[i] = Math.random() * 2 - 1;
        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2500, ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        whiteNoise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        whiteNoise.start();
      }
    } catch (e) {
      console.warn("Audio Context error", e);
    }
  };

  const handleVibration = () => {
    if (prefs.hapticStrength === 'OFF') return;
    if (navigator.vibrate) {
      const patterns = { SOFT: [15], MEDIUM: [35], STRONG: [60] };
      navigator.vibrate(patterns[prefs.hapticStrength]);
    }
  };

  const handleTap = () => {
    setSessionCount(prev => prev + 1);
    onUpdateCount(1, activeGroup?.id || null, activeMantra.text);
    handleVibration();
    playChantSound();
  };

  const handleManualSubmit = () => {
    const count = parseInt(manualInput, 10);
    if (!isNaN(count) && count > 0) {
      onUpdateCount(count, activeGroup?.id || null, activeMantra.text);
      setSessionCount(prev => prev + count);
      setManualInput('');
      setIsManualMode(false);
      handleVibration();
      playChantSound();
    }
  };

  const handleFinishSession = () => {
    if (sessionCount === 0) return;
    setIsCommitting(true);
    setTimeout(() => {
      setSessionCount(0);
      setIsCommitting(false);
      if (isZenMode) setIsZenMode(false);
    }, 1500);
  };

  const fetchInsight = async () => {
    setIsLoadingInsight(true);
    const text = await getMantraInsight(activeMantra.text);
    setInsight(text);
    setIsLoadingInsight(false);
  };

  const toggleZenMode = () => {
    if (!isPremium) {
      onUpgradeClick();
      return;
    }
    setIsZenMode(!isZenMode);
  };

  return (
    <div className={`flex flex-col items-center justify-center transition-all duration-700 ${isZenMode ? 'fixed inset-0 z-[100] bg-stone-950 p-6' : 'h-full max-w-md mx-auto w-full py-6'} ${prefs.lowLightMode || isZenMode ? 'dark' : ''}`}>
      
      {isZenMode && (
        <div className="absolute top-10 inset-x-10 flex justify-between items-center animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="flex items-center gap-2 text-stone-500">
            {prefs.ambianceSound === 'MORNING_BIRDS' ? <Bird size={20} className="text-saffron-500 animate-pulse" /> : <Wind size={20} className="animate-pulse text-saffron-500" />}
            <span className="text-xs font-bold uppercase tracking-[0.3em] font-serif">Zen Focus</span>
          </div>
          <div className="flex items-center gap-3">
             <button 
                onClick={toggleAmbiance}
                className={`p-3 rounded-full transition-all flex items-center gap-2 ${isAmbiancePlaying ? 'bg-saffron-500 text-white shadow-lg shadow-saffron-500/20' : 'bg-white/10 text-stone-400 hover:bg-white/20'}`}
                title={isAmbiancePlaying ? "Pause Soundscape" : "Play Soundscape"}
             >
                {isAmbiancePlaying ? <Pause size={20} /> : <Play size={20} />}
             </button>
             <button 
                onClick={() => setIsZenMode(false)}
                className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-stone-400 transition-all active:scale-90"
             >
                <Minimize2 size={24} />
             </button>
          </div>
        </div>
      )}

      <div className={`text-center mb-8 w-full ${isZenMode ? 'mt-auto' : 'animate-in zoom-in-95 duration-500'}`}>
        {!isZenMode && (
          <div className="flex justify-between items-center mb-6 px-2">
            <span className="px-4 py-1.5 bg-mystic-50 text-mystic-700 dark:bg-stone-800 dark:text-stone-300 rounded-full text-[10px] font-bold uppercase tracking-widest font-serif shadow-sm">
              {activeGroup ? activeGroup.name : "Personal Sadhana"}
            </span>
            <div className="flex gap-2">
               <button onClick={toggleZenMode} className={`p-2 transition-all flex items-center gap-1.5 ${isPremium ? 'text-saffron-500 hover:text-saffron-600' : 'text-stone-300'} active:scale-90`} title="Zen Mode">
                <Maximize2 size={18} />
                <span className="text-[10px] font-bold uppercase tracking-tighter">Zen Mode</span>
               </button>
               <button onClick={() => setShowSettings(!showSettings)} className={`p-2 transition-colors ${showSettings ? 'text-saffron-500' : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-200'}`}>
                <Settings2 size={18} />
               </button>
            </div>
          </div>
        )}

        {showSettings && !isZenMode && (
          <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-[2.5rem] p-8 shadow-2xl mb-8 text-left animate-in slide-in-from-top-2 border-b-8 border-b-saffron-400 max-h-[70vh] overflow-y-auto no-scrollbar">
             <div className="flex items-center justify-between mb-8">
                <div>
                  <h4 className="text-xs font-black text-stone-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-1">
                    <Sparkles size={14} className="text-saffron-500" /> Practice Lab
                  </h4>
                  <p className="text-[10px] text-stone-500 font-serif italic">Fine-tune your sensory experience.</p>
                </div>
                {!isPremium && (
                  <button onClick={onUpgradeClick} className="text-[10px] bg-saffron-500 text-white px-3 py-1 rounded-full font-bold shadow-lg shadow-saffron-200 animate-bounce">PRO</button>
                )}
             </div>
             
             <div className="space-y-8">
                {/* Ambiance Selection */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-stone-400">
                      <Waves size={14} />
                      <p className="text-[10px] font-bold uppercase tracking-widest">Zen Ambiance</p>
                    </div>
                    <button 
                      onClick={toggleAmbiance}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-black transition-all ${isAmbiancePlaying ? 'bg-mystic-600 text-white shadow-md' : 'bg-stone-100 dark:bg-stone-800 text-stone-500 hover:bg-stone-200'}`}
                    >
                      {isAmbiancePlaying ? <><Pause size={10} /> STOP</> : <><Play size={10} /> START</>}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {(['DEEP_OM', 'MORNING_BIRDS', 'FOREST_WIND', 'OFF'] as const).map(a => (
                      <button 
                        key={a}
                        disabled={!isPremium && a !== 'OFF'}
                        onClick={() => {
                          if (isAmbiancePlaying) stopAmbiance();
                          setPrefs({...prefs, ambianceSound: a});
                        }}
                        className={`py-3 text-[9px] font-black rounded-xl border-2 transition-all ${
                          prefs.ambianceSound === a 
                            ? 'bg-stone-950 text-white border-stone-950 dark:bg-white dark:text-stone-950' 
                            : 'bg-stone-50 dark:bg-stone-800 border-stone-100 dark:border-stone-800 text-stone-400'
                        } ${!isPremium && a !== 'OFF' ? 'opacity-20 grayscale cursor-not-allowed' : 'hover:border-saffron-300'}`}
                      >
                        {a === 'MORNING_BIRDS' ? 'Birdsong' : a.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-stone-400">
                    <Volume2 size={14} />
                    <p className="text-[10px] font-bold uppercase tracking-widest">Resonant Tap</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {(['TEMPLE_BELL', 'WOODEN_MALA', 'RAIN_FALL', 'SILENCE'] as const).map(s => (
                      <button 
                        key={s}
                        disabled={!isPremium && (s === 'WOODEN_MALA' || s === 'RAIN_FALL')}
                        onClick={() => { setPrefs({...prefs, sound: s}); playChantSound(); }}
                        className={`py-3 text-[9px] font-black rounded-xl border-2 transition-all ${
                          prefs.sound === s 
                            ? 'bg-stone-950 text-white border-stone-950 dark:bg-white dark:text-stone-950' 
                            : 'bg-stone-50 dark:bg-stone-800 border-stone-100 dark:border-stone-800 text-stone-400'
                        }`}
                      >
                        {s.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-stone-400">
                    <Activity size={14} />
                    <p className="text-[10px] font-bold uppercase tracking-widest">Haptic Mala Pulse</p>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {(['SOFT', 'MEDIUM', 'STRONG', 'OFF'] as const).map(h => (
                      <button 
                        key={h}
                        disabled={!isPremium && (h === 'MEDIUM' || h === 'STRONG')}
                        onClick={() => { setPrefs({...prefs, hapticStrength: h}); handleVibration(); }}
                        className={`py-3 text-[9px] font-black rounded-xl border-2 transition-all ${
                          prefs.hapticStrength === h 
                            ? 'bg-mystic-600 text-white border-mystic-600' 
                            : 'bg-stone-50 dark:bg-stone-800 border-stone-100 dark:border-stone-800 text-stone-400'
                        }`}
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     <Moon size={14} className="text-mystic-400" />
                     <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Sadhana Glow Mode</p>
                   </div>
                   <button 
                    disabled={!isPremium}
                    onClick={() => setPrefs({...prefs, lowLightMode: !prefs.lowLightMode})}
                    className={`w-12 h-6 rounded-full transition-all relative ${prefs.lowLightMode ? 'bg-saffron-500' : 'bg-stone-200 dark:bg-stone-700'} ${!isPremium ? 'opacity-30' : ''}`}
                   >
                     <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all shadow-sm ${prefs.lowLightMode ? 'left-7' : 'left-1'}`} />
                   </button>
                </div>
             </div>
          </div>
        )}

        {!activeGroup && !isZenMode && (
           <div className="mb-6 relative inline-block w-full max-w-xs animate-in fade-in duration-700">
              {isCreatingMantra ? (
                <div className="flex gap-2 animate-in slide-in-from-right-2">
                  <input type="text" value={newMantraText} onChange={(e) => setNewMantraText(e.target.value)} placeholder="New mantra..." className="w-full px-5 py-3 text-sm border-2 border-stone-200 dark:border-stone-700 rounded-2xl bg-white text-black outline-none focus:border-saffron-400" autoFocus />
                  <button onClick={() => { if(newMantraText) onAddPersonalMantra(newMantraText, 108); setIsCreatingMantra(false); }} className="bg-stone-900 text-white px-5 rounded-2xl text-xs font-bold">OK</button>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 relative group">
                   <select value={selectedPersonalMantraId} onChange={(e) => e.target.value === 'add_new' ? setIsCreatingMantra(true) : setSelectedPersonalMantraId(e.target.value)} className="appearance-none bg-transparent text-2xl md:text-3xl font-display font-bold text-stone-800 dark:text-stone-100 text-center focus:outline-none cursor-pointer w-full pr-8 truncate hover:text-saffron-600 transition-colors">
                     {personalMantras.map(m => <option key={m.id} value={m.id}>{m.text}</option>)}
                     <option value="add_new" className="text-saffron-600 font-bold">+ New Sankalpa</option>
                   </select>
                   <ChevronDown size={20} className="text-stone-300 pointer-events-none absolute right-0 group-hover:text-stone-500" />
                </div>
              )}
           </div>
        )}

        {(activeGroup || isZenMode) && (
            <h1 className={`${isZenMode ? 'text-4xl md:text-6xl text-white' : 'text-2xl md:text-3xl text-stone-800 dark:text-stone-100'} font-display font-bold mt-2 leading-tight px-6 drop-shadow-sm`}>
              {activeMantra.text}
            </h1>
        )}
        
        {activeMantra.meaning && !isZenMode && (
          <p className="text-stone-500 dark:text-stone-400 text-xs italic font-serif mt-3 px-8 opacity-70 leading-relaxed max-w-xs mx-auto">"{activeMantra.meaning}"</p>
        )}

        {!isZenMode && (
          <button onClick={() => insight ? setInsight(null) : fetchInsight()} className="mt-8 text-saffron-600 dark:text-saffron-400 text-[10px] font-black uppercase tracking-[0.25em] flex items-center justify-center gap-2 mx-auto px-6 py-2.5 bg-saffron-50 dark:bg-saffron-900/10 rounded-full hover:bg-saffron-100 dark:hover:bg-saffron-900/20 transition-all">
            {isLoadingInsight ? <Loader2 size={12} className="animate-spin"/> : <BookOpen size={12} />}
            {insight ? "Close Wisdom" : "Deep Insights"}
          </button>
        )}
      </div>

      <div className="relative mb-16 group cursor-pointer" onClick={isZenMode ? handleTap : undefined}>
        {isZenMode && (
          <>
            <div className="absolute inset-[-60px] border-2 border-saffron-500/20 rounded-full animate-breath"></div>
            <div className="absolute inset-[-100px] border border-saffron-500/10 rounded-full animate-breath [animation-delay:2s]"></div>
            <div className="absolute inset-[-140px] border border-saffron-500/5 rounded-full animate-breath [animation-delay:4s]"></div>
          </>
        )}
        <div className={`relative ${isZenMode ? 'w-80 h-80 bg-stone-900/20 border-white/10 shadow-[0_0_80px_rgba(245,158,11,0.15)]' : 'w-72 h-72 bg-white/95 dark:bg-stone-900/95 border-stone-50 dark:border-stone-800 shadow-3xl'} backdrop-blur-xl rounded-full border-[8px] flex flex-col items-center justify-center transition-all duration-500 active:scale-[0.96]`}>
           {isCommitting ? (
             <div className="flex flex-col items-center animate-in zoom-in duration-500">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                  <Check size={40} className="text-green-600 dark:text-green-400" />
                </div>
                <span className="text-stone-500 dark:text-stone-400 font-serif font-bold text-sm">Deep Gratitude</span>
             </div>
           ) : (
             <>
               <div className={`${isZenMode ? 'text-9xl text-white' : 'text-7xl text-stone-800 dark:text-stone-100'} font-bold font-display tracking-tighter drop-shadow-xl`}>
                 {sessionCount}
               </div>
               <div className="text-stone-400 dark:text-stone-500 text-[10px] mt-4 font-black uppercase tracking-[0.3em] opacity-60">Sankalpa: {activeMantra.targetCount}</div>
             </>
           )}
        </div>
      </div>

      <div className={`w-full max-w-sm space-y-5 px-6 ${isZenMode ? 'mb-auto' : ''}`}>
        {!isZenMode && (
          <button onClick={handleTap} className={`w-full bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-950 py-6 rounded-3xl font-black text-xl shadow-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-3 ${isManualMode ? 'hidden' : 'block'} hover:bg-stone-800 dark:hover:bg-white`}>
            <Plus size={28} strokeWidth={3} /> TAP TO CHANT
          </button>
        )}

        <div className="flex items-center justify-center gap-4">
          {!isZenMode && (
            <button onClick={() => setIsManualMode(!isManualMode)} className="p-6 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-500 rounded-2xl hover:bg-stone-50 transition-all shadow-sm active:scale-90" title="Manual Batch Add">
              <Zap size={22} className={isPremium ? 'text-saffron-500 fill-saffron-500' : ''} />
            </button>
          )}
          <button onClick={handleFinishSession} disabled={sessionCount === 0} className={`flex-1 ${isZenMode ? 'bg-white/5 text-stone-300 border border-white/10 backdrop-blur-md' : 'bg-mystic-600 text-white'} py-6 px-8 rounded-2xl font-black shadow-xl disabled:opacity-30 transition-all flex items-center justify-center gap-3 group active:scale-[0.97]`}>
            <Save size={20} className="group-hover:scale-110 transition-transform" /> 
            <span className="uppercase tracking-[0.2em] text-[11px]">End Session</span>
          </button>
        </div>
      </div>

      {insight && !isZenMode && (
        <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-md z-[120] flex items-end justify-center p-4 animate-in fade-in duration-300">
           <div className="bg-white dark:bg-stone-900 w-full max-w-lg rounded-t-[3rem] p-10 pb-16 shadow-3xl animate-in slide-in-from-bottom-10 border-t border-saffron-200 dark:border-stone-800">
              <div className="w-12 h-1.5 bg-stone-200 dark:bg-stone-800 rounded-full mx-auto mb-8"></div>
              <h4 className="font-display font-bold text-2xl text-stone-800 dark:text-stone-100 mb-6 text-center">Spiritual Origin</h4>
              <p className="text-stone-700 dark:text-stone-300 font-serif leading-loose text-lg text-center italic">"{insight}"</p>
              <button onClick={() => setInsight(null)} className="mt-12 w-full py-4 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-2xl font-bold uppercase tracking-widest text-sm shadow-xl active:scale-95 transition-all">
                Return to Sadhana
              </button>
           </div>
        </div>
      )}

      {isManualMode && (
         <div className="fixed inset-0 bg-stone-950/90 backdrop-blur-2xl z-[130] flex items-center justify-center p-8 animate-in fade-in duration-400">
            <div className="bg-white dark:bg-stone-900 p-12 rounded-[3.5rem] w-full max-w-sm shadow-3xl animate-in zoom-in-95 border border-stone-100 dark:border-stone-800">
               <div className="flex justify-between items-center mb-10">
                  <h4 className="font-display font-bold text-3xl text-stone-800 dark:text-stone-100">Batch Entry</h4>
                  <button onClick={() => setIsManualMode(false)} className="text-stone-400 hover:text-stone-900 transition-colors"><X size={28} /></button>
               </div>
               <p className="text-sm text-stone-500 mb-6 font-serif leading-relaxed">Enter counts from your physical Mala or digital assistant.</p>
               <input type="number" value={manualInput} onChange={(e) => setManualInput(e.target.value)} className="w-full p-6 text-5xl font-bold text-center border-b-4 border-saffron-500 rounded-t-3xl mb-12 bg-white text-black outline-none transition-all placeholder:text-stone-200" placeholder="0" autoFocus />
               <button onClick={handleManualSubmit} className="w-full py-5 bg-saffron-500 text-white font-black rounded-3xl shadow-2xl hover:bg-saffron-600 transition-all active:scale-95 text-lg uppercase tracking-widest">
                 APPLY COUNTS
               </button>
            </div>
         </div>
      )}
    </div>
  );
};

export default MantraCounter;
