
import React, { useState, useRef, useEffect } from 'react';
import { Plus, Check, ChevronDown, Save, Maximize2, Minimize2, Settings2, Play, Pause, Sparkles, Wind, Moon, ChevronRight, Volume2, CloudRain, Bird, Waves, Lock, BellRing } from 'lucide-react';
import { Group, Mantra, PracticePreferences } from '../types';

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
  const [manualInput, setManualInput] = useState<string>('');
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
    if (isAmbiancePlaying) {
      stopAmbiance();
      startAmbiance();
    }
  }, [prefs]);

  useEffect(() => {
    return () => {
      stopAmbiance();
    };
  }, []);

  const [selectedPersonalMantraId, setSelectedPersonalMantraId] = useState<string>(personalMantras[0]?.id || '');
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
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.7, now + 2);
    gainNode.connect(ctx.destination);
    const activeSources: (AudioBufferSourceNode | OscillatorNode)[] = [];

    if (prefs.ambianceSound === 'DEEP_OM') {
      const frequencies = [136.1, 68.05, 272.2];
      frequencies.forEach(f => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now);
        osc.connect(gainNode);
        osc.start();
        activeSources.push(osc);
      });
    } else if (prefs.ambianceSound === 'BELL_CLINGING') {
       const bellFreqs = [1200, 2400, 3600];
       bellFreqs.forEach((f, idx) => {
         const osc = ctx.createOscillator();
         const loopGain = ctx.createGain();
         osc.type = 'sine';
         osc.frequency.setValueAtTime(f, now);
         loopGain.gain.setValueAtTime(0, now);
         const rhythm = 3.0;
         for(let i=0; i<60; i++) {
           loopGain.gain.setValueAtTime(0.1 / (idx+1), now + (i * rhythm));
           loopGain.gain.exponentialRampToValueAtTime(0.0001, now + (i * rhythm) + 2.5);
         }
         osc.connect(loopGain);
         loopGain.connect(gainNode);
         osc.start();
         activeSources.push(osc);
       });
    } else if (prefs.ambianceSound === 'WATERFALL') {
      const bufferSize = ctx.sampleRate * 5;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        lastOut = (lastOut + (0.1 * white)) / 1.02;
        data[i] = lastOut;
      }
      const bufSource = ctx.createBufferSource();
      bufSource.buffer = buffer;
      bufSource.loop = true;
      bufSource.connect(gainNode);
      bufSource.start();
      activeSources.push(bufSource);
    } else {
      const bufferSize = ctx.sampleRate * 3;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        const filterCoeff = prefs.ambianceSound === 'RAIN_FALL' ? 1.05 : 1.5;
        lastOut = (lastOut + (0.02 * white)) / filterCoeff;
        data[i] = lastOut * (prefs.ambianceSound === 'MORNING_BIRDS' ? Math.sin(i * 0.001) : 1);
      }
      const bufSource = ctx.createBufferSource();
      bufSource.buffer = buffer;
      bufSource.loop = true;
      bufSource.connect(gainNode);
      bufSource.start();
      activeSources.push(bufSource);
    }
    ambianceNodes.current = { sources: activeSources, gain: gainNode };
    setIsAmbiancePlaying(true);
  };

  const toggleAmbiance = () => {
    if (!isPremium) { onUpgradeClick(); return; }
    if (isAmbiancePlaying) stopAmbiance(); else startAmbiance();
  };

  const playChantSound = () => {
    if (prefs.sound === 'SILENCE') return;
    try {
      const ctx = ensureAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = prefs.sound === 'TEMPLE_BELL' ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(prefs.sound === 'TEMPLE_BELL' ? 660 : 180, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {}
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

  return (
    <div className={`flex flex-col items-center justify-center transition-all duration-700 ${isZenMode ? 'fixed inset-0 z-[100] bg-stone-950 p-6' : 'h-full max-w-md mx-auto w-full py-6'} ${prefs.lowLightMode || isZenMode ? 'dark' : ''}`}>
      
      {isZenMode && (
        <div className="absolute top-10 inset-x-10 flex justify-between items-center animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-stone-500">
              <Wind size={20} className="animate-pulse text-saffron-500" />
              <span className="text-xs font-bold uppercase tracking-[0.3em] font-serif">Zen Focus</span>
            </div>
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/10">
               {(['DEEP_OM', 'MORNING_BIRDS', 'WATERFALL', 'RAIN_FALL', 'BELL_CLINGING'] as const).map(sound => (
                 <button 
                  key={sound}
                  onClick={() => setPrefs({...prefs, ambianceSound: sound})}
                  className={`p-2 rounded-full transition-all ${prefs.ambianceSound === sound ? 'bg-saffron-500 text-white' : 'text-stone-500 hover:text-stone-300'}`}
                 >
                   {sound === 'DEEP_OM' && <Volume2 size={14} />}
                   {sound === 'MORNING_BIRDS' && <Bird size={14} />}
                   {sound === 'WATERFALL' && <Waves size={14} />}
                   {sound === 'RAIN_FALL' && <CloudRain size={14} />}
                   {sound === 'BELL_CLINGING' && <BellRing size={14} />}
                 </button>
               ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={toggleAmbiance} className={`p-3 rounded-full transition-all ${isAmbiancePlaying ? 'bg-saffron-500 text-white shadow-lg' : 'bg-white/10 text-stone-400'}`}>
                {isAmbiancePlaying ? <Pause size={20} /> : <Play size={20} />}
             </button>
             <button onClick={() => setIsZenMode(false)} className="flex items-center gap-3 px-5 py-3 bg-white/5 hover:bg-white/10 rounded-full text-stone-400 hover:text-white transition-all border border-white/10 shadow-lg">
                <span className="text-[10px] font-black tracking-widest uppercase">Exit Zen</span>
                <Minimize2 size={20} />
             </button>
          </div>
        </div>
      )}

      <div className={`text-center mb-8 w-full ${isZenMode ? 'mt-auto' : 'animate-in zoom-in-95 duration-500'}`}>
        {!isZenMode && (
          <div className="flex justify-between items-center mb-6 px-2">
            <span className="px-4 py-1.5 bg-mystic-50 text-mystic-700 dark:bg-stone-800 dark:text-stone-300 rounded-full text-[10px] font-bold uppercase tracking-widest font-serif shadow-sm">
              {activeGroup ? "Sangha Circle" : "Personal Sadhana"}
            </span>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => { if(isPremium) setIsZenMode(true); else onUpgradeClick(); }} 
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all border active:scale-95 group shadow-sm ${isPremium ? 'bg-stone-50 dark:bg-stone-800 text-stone-500 hover:text-saffron-500 border-stone-100 dark:border-stone-700' : 'bg-stone-100 dark:bg-stone-900 text-stone-400 border-stone-200 dark:border-stone-800'}`}
              >
                {!isPremium && <Lock size={12} className="text-stone-400" />}
                <span className="text-[10px] font-black uppercase tracking-widest">Zen Mode</span>
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => setShowSettings(!showSettings)} 
                className={`p-2 transition-colors ${showSettings ? 'text-saffron-500' : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-200'}`}
              >
                <Settings2 size={18} />
              </button>
            </div>
          </div>
        )}

        {showSettings && !isZenMode && (
          <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-[2.5rem] p-8 shadow-2xl mb-8 text-left animate-in slide-in-from-top-2 border-b-8 border-b-saffron-400 relative overflow-hidden">
             <div className="flex items-center justify-between mb-8">
                <div>
                  <h4 className="text-xs font-black text-stone-400 uppercase tracking-[0.2em] flex items-center gap-2 mb-1">
                    <Sparkles size={14} className="text-saffron-500" /> Practice Lab
                  </h4>
                </div>
                {!isPremium && <span className="text-[10px] bg-saffron-500 text-white px-3 py-1 rounded-full font-bold">PREMIUM</span>}
             </div>
             
             {isPremium ? (
               <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-2">
                      {(['TEMPLE_BELL', 'WOODEN_MALA', 'RAIN_FALL', 'SILENCE'] as const).map(s => (
                        <button 
                          key={s}
                          onClick={() => { setPrefs({...prefs, sound: s}); playChantSound(); }}
                          className={`py-3 text-[9px] font-black rounded-xl border-2 transition-all ${prefs.sound === s ? 'bg-stone-950 text-white border-stone-950' : 'bg-stone-50 text-stone-400'}`}
                        >
                          {s.replace('_', ' ')}
                        </button>
                      ))}
                  </div>
                  <div className="flex items-center justify-between px-4 py-2 bg-stone-50 dark:bg-stone-800/50 rounded-2xl">
                      <div className="flex items-center gap-3">
                          <Moon size={14} className="text-mystic-400" />
                          <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Low Light Mode</p>
                      </div>
                      <button onClick={() => setPrefs({...prefs, lowLightMode: !prefs.lowLightMode})} className={`w-12 h-6 rounded-full relative ${prefs.lowLightMode ? 'bg-saffron-500' : 'bg-stone-200'}`}>
                          <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${prefs.lowLightMode ? 'left-7' : 'left-1'}`} />
                      </button>
                  </div>
               </div>
             ) : (
               <div className="flex flex-col items-center justify-center py-6 text-center">
                  <div className="w-12 h-12 bg-saffron-50 rounded-full flex items-center justify-center mb-4 text-saffron-500">
                    <Lock size={20} />
                  </div>
                  <p className="text-sm font-bold text-stone-800 dark:text-stone-100 mb-1">Custom Practice Locked</p>
                  <p className="text-xs text-stone-500 mb-6 max-w-[200px]">Upgrade to customize sounds, haptics, and interface themes.</p>
                  <button onClick={onUpgradeClick} className="bg-stone-900 text-white px-6 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg">Unlock Now</button>
               </div>
             )}
          </div>
        )}

        {!activeGroup && !isZenMode && (
           <div className="mb-6 relative inline-block w-full max-w-xs animate-in fade-in duration-700">
              <div className="flex items-center justify-center gap-2 relative group">
                 <select value={selectedPersonalMantraId} onChange={(e) => setSelectedPersonalMantraId(e.target.value)} className="appearance-none bg-transparent text-2xl md:text-3xl font-display font-bold text-stone-800 dark:text-stone-100 text-center focus:outline-none cursor-pointer w-full pr-8 truncate">
                   {personalMantras.map(m => <option key={m.id} value={m.id}>{m.text}</option>)}
                 </select>
                 <ChevronDown size={20} className="text-stone-300 pointer-events-none absolute right-0" />
              </div>
           </div>
        )}

        {(activeGroup || isZenMode) && (
            <h1 className={`${isZenMode ? 'text-4xl md:text-6xl text-white' : 'text-2xl md:text-3xl text-stone-800 dark:text-stone-100'} font-display font-bold mt-2 leading-tight px-6 uppercase tracking-tight`}>
              {activeGroup ? activeGroup.name : activeMantra.text}
            </h1>
        )}
      </div>

      <div className="relative mb-12 group cursor-pointer" onClick={isZenMode ? handleTap : undefined}>
        {isZenMode && <div className="absolute inset-[-60px] border-2 border-saffron-500/20 rounded-full animate-breath"></div>}
        <div 
          onClick={!isZenMode ? handleTap : undefined}
          className={`relative ${isZenMode ? 'w-80 h-80 bg-stone-900/20 border-white/10' : 'w-72 h-72 bg-white/95 dark:bg-stone-900/95 border-stone-50 dark:border-stone-800 shadow-3xl'} backdrop-blur-xl rounded-full border-[8px] flex flex-col items-center justify-center transition-all duration-500 active:scale-[0.96] cursor-pointer`}
        >
           {isCommitting ? (
             <div className="flex flex-col items-center animate-in zoom-in duration-500">
                <Check size={40} className="text-green-600 mb-2" />
                <span className="text-stone-500 font-serif font-bold text-sm">Sacred Update</span>
             </div>
           ) : (
             <>
               <div className={`${isZenMode ? 'text-9xl text-white' : 'text-7xl text-stone-800 dark:text-stone-100'} font-bold font-display tracking-tighter`}>{sessionCount}</div>
               <div className="text-stone-400 text-[10px] mt-2 font-black uppercase tracking-[0.3em]">Goal: {activeMantra.targetCount}</div>
             </>
           )}
        </div>
      </div>

      <div className={`w-full max-w-sm space-y-4 px-6 ${isZenMode ? 'mb-auto' : ''}`}>
        {!isZenMode && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex-1 border-[4px] border-black rounded-[2rem] overflow-hidden bg-white shadow-2xl focus-within:ring-4 focus-within:ring-saffron-400 transition-all flex items-center">
                <input 
                    type="text" 
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={manualInput} 
                    onChange={(e) => setManualInput(e.target.value.replace(/\D/g, ''))} 
                    className="w-full px-8 py-5 bg-white text-3xl font-black outline-none placeholder:text-black placeholder:font-bold text-black !text-black placeholder:text-lg"
                    placeholder="Enter Bulk Count"
                    style={{ color: 'black' }}
                />
              </div>
              <button 
                  onClick={handleManualSubmit}
                  disabled={!manualInput}
                  className="bg-saffron-500 text-white h-[76px] px-8 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] hover:bg-saffron-600 transition-all active:scale-95 disabled:opacity-30 shadow-xl shadow-saffron-500/20"
              >
                  Add
              </button>
            </div>
            
            <button onClick={handleTap} className="w-full bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-950 py-4 rounded-[2rem] font-bold shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                <Plus size={18} strokeWidth={3} />
                <span className="uppercase tracking-[0.2em] text-[11px]">TAP TO CHANT</span>
            </button>
          </div>
        )}

        <button onClick={handleFinishSession} disabled={sessionCount === 0} className={`w-full ${isZenMode ? 'bg-white/5 text-stone-300 border border-white/10' : 'bg-mystic-600 text-white'} py-4 rounded-[2rem] font-bold shadow-xl disabled:opacity-30 transition-all flex items-center justify-center gap-3 group active:scale-95`}>
            <Save size={18} /> 
            <span className="uppercase tracking-[0.2em] text-[11px]">End Session</span>
        </button>
      </div>
    </div>
  );
};

export default MantraCounter;
