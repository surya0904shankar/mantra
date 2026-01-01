
import React, { useState, useRef, useEffect } from 'react';
import { Plus, RotateCcw, BookOpen, Loader2, Check, ChevronDown, Save, X, Maximize2, Minimize2, Settings2, Volume2, Zap, Moon, Sun } from 'lucide-react';
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
  
  // Practice Preferences
  const [prefs, setPrefs] = useState<PracticePreferences>({
    sound: 'TEMPLE_BELL',
    hapticStrength: 'SOFT',
    lowLightMode: false
  });

  // Selection State
  const [selectedPersonalMantraId, setSelectedPersonalMantraId] = useState<string>(personalMantras[0]?.id || '');
  const [isCreatingMantra, setIsCreatingMantra] = useState(false);
  const [newMantraText, setNewMantraText] = useState('');
  const [isCommitting, setIsCommitting] = useState(false);

  const activeMantra = activeGroup 
    ? activeGroup.mantra 
    : personalMantras.find(m => m.id === selectedPersonalMantraId) || { text: 'Om Namah Shivaya', targetCount: 108, meaning: '' };

  // Audio Context for premium sounds
  const audioCtx = useRef<AudioContext | null>(null);

  const playChantSound = () => {
    if (prefs.sound === 'SILENCE') return;
    
    if (!audioCtx.current) {
      audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    const osc = audioCtx.current.createOscillator();
    const gain = audioCtx.current.createGain();
    
    if (prefs.sound === 'TEMPLE_BELL') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(660, audioCtx.current.currentTime);
      gain.gain.setValueAtTime(0.2, audioCtx.current.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.current.currentTime + 1.2);
      osc.connect(gain);
      gain.connect(audioCtx.current.destination);
      osc.start();
      osc.stop(audioCtx.current.currentTime + 1.2);
    } else if (prefs.sound === 'WOODEN_MALA') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, audioCtx.current.currentTime);
      gain.gain.setValueAtTime(0.1, audioCtx.current.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.current.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(audioCtx.current.destination);
      osc.start();
      osc.stop(audioCtx.current.currentTime + 0.1);
    }
  };

  const handleVibration = () => {
    if (prefs.hapticStrength === 'OFF') return;
    if (navigator.vibrate) {
      const patterns = {
        SOFT: [15],
        MEDIUM: [35],
        STRONG: [60]
      };
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
    const val = parseInt(manualInput, 10);
    if (!isNaN(val) && val > 0) {
      setSessionCount(prev => prev + val);
      onUpdateCount(val, activeGroup?.id || null, activeMantra.text);
      setManualInput('');
      setIsManualMode(false);
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
      
      {/* Zen Mode Close & Settings */}
      {isZenMode && (
        <button 
          onClick={() => setIsZenMode(false)}
          className="absolute top-10 right-10 p-4 bg-white/5 hover:bg-white/10 rounded-full text-stone-400 transition-colors"
        >
          <Minimize2 size={24} />
        </button>
      )}

      {/* Header Info */}
      <div className={`text-center mb-8 w-full ${isZenMode ? 'mt-auto' : 'animate-in zoom-in-95 duration-500'}`}>
        {!isZenMode && (
          <div className="flex justify-between items-center mb-6">
            <span className="px-4 py-1.5 bg-mystic-50 text-mystic-700 dark:bg-stone-800 dark:text-stone-300 rounded-full text-xs font-bold uppercase tracking-widest font-serif shadow-sm">
              {activeGroup ? activeGroup.name : "Personal Sadhana"}
            </span>
            <div className="flex gap-2">
               <button 
                onClick={toggleZenMode}
                className={`p-2 transition-colors ${isPremium ? 'text-saffron-500 hover:text-saffron-600' : 'text-stone-300'}`}
                title="Zen Mode"
               >
                <Maximize2 size={18} />
               </button>
               <button 
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors"
               >
                <Settings2 size={18} />
               </button>
            </div>
          </div>
        )}

        {/* Practice Settings Popover */}
        {showSettings && !isZenMode && (
          <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-2xl p-5 shadow-2xl mb-6 text-left animate-in slide-in-from-top-2">
             <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest flex items-center gap-2">
                  <Zap size={14} className="text-saffron-500" /> Practice Experience
                </h4>
                {!isPremium && <span className="text-[10px] bg-saffron-500 text-white px-2 py-0.5 rounded font-bold">PREMIUM</span>}
             </div>
             
             <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-stone-500 uppercase">Bell Sound</p>
                  <div className="flex gap-1.5">
                    {(['TEMPLE_BELL', 'WOODEN_MALA', 'SILENCE'] as const).map(s => (
                      <button 
                        key={s}
                        disabled={!isPremium && s !== 'TEMPLE_BELL'}
                        onClick={() => setPrefs({...prefs, sound: s})}
                        className={`flex-1 py-2 text-[10px] font-bold rounded-lg border transition-all ${prefs.sound === s ? 'bg-stone-900 text-white border-stone-900' : 'bg-stone-50 dark:bg-stone-800 border-stone-100 dark:border-stone-700 text-stone-600'}`}
                      >
                        {s.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-stone-500 uppercase">Haptic Strength</p>
                  <div className="flex gap-1.5">
                    {(['SOFT', 'MEDIUM', 'STRONG', 'OFF'] as const).map(h => (
                      <button 
                        key={h}
                        disabled={!isPremium && h !== 'SOFT'}
                        onClick={() => setPrefs({...prefs, hapticStrength: h})}
                        className={`flex-1 py-2 text-[10px] font-bold rounded-lg border transition-all ${prefs.hapticStrength === h ? 'bg-mystic-600 text-white border-mystic-600' : 'bg-stone-50 dark:bg-stone-800 border-stone-100 dark:border-stone-700 text-stone-600'}`}
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                   <p className="text-[10px] font-bold text-stone-500 uppercase">Low Light Chanting</p>
                   <button 
                    disabled={!isPremium}
                    onClick={() => setPrefs({...prefs, lowLightMode: !prefs.lowLightMode})}
                    className={`w-10 h-5 rounded-full transition-colors relative ${prefs.lowLightMode ? 'bg-saffron-500' : 'bg-stone-200'}`}
                   >
                     <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${prefs.lowLightMode ? 'left-6' : 'left-1'}`} />
                   </button>
                </div>
             </div>
          </div>
        )}

        {/* Mantra Header */}
        {!activeGroup && !isZenMode && (
           <div className="mb-4 relative inline-block w-full max-w-xs">
              {isCreatingMantra ? (
                <div className="flex gap-2 animate-in fade-in">
                  <input 
                    type="text" 
                    value={newMantraText}
                    onChange={(e) => setNewMantraText(e.target.value)}
                    placeholder="New mantra..."
                    className="w-full px-3 py-2 text-sm border border-stone-300 dark:border-stone-700 rounded-lg bg-white dark:bg-stone-800 text-stone-900 dark:text-white"
                    autoFocus
                  />
                  <button onClick={() => { if(newMantraText) onAddPersonalMantra(newMantraText, 108); setIsCreatingMantra(false); }} className="bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 px-3 rounded-lg text-xs font-bold">OK</button>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 relative">
                   <select 
                    value={selectedPersonalMantraId}
                    onChange={(e) => e.target.value === 'add_new' ? setIsCreatingMantra(true) : setSelectedPersonalMantraId(e.target.value)}
                    className="appearance-none bg-transparent text-2xl md:text-3xl font-display font-bold text-stone-800 dark:text-stone-100 text-center focus:outline-none cursor-pointer w-full pr-6 truncate"
                   >
                     {personalMantras.map(m => (
                       <option key={m.id} value={m.id}>{m.text}</option>
                     ))}
                     <option value="add_new" className="text-saffron-600 font-bold">+ Create New</option>
                   </select>
                   <ChevronDown size={20} className="text-stone-300 pointer-events-none absolute right-0" />
                </div>
              )}
           </div>
        )}

        {(activeGroup || isZenMode) && (
            <h1 className={`${isZenMode ? 'text-4xl md:text-5xl text-stone-100' : 'text-2xl md:text-3xl text-stone-800 dark:text-stone-100'} font-display font-bold mt-2 leading-tight px-6`}>
              {activeMantra.text}
            </h1>
        )}
        
        {activeMantra.meaning && !isZenMode && (
          <p className="text-stone-500 dark:text-stone-400 text-sm italic font-serif mt-2 px-6">"{activeMantra.meaning}"</p>
        )}

        {!isZenMode && (
          <button 
            onClick={() => insight ? setInsight(null) : fetchInsight()}
            className="mt-5 text-saffron-600 dark:text-saffron-400 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1 mx-auto"
          >
            {isLoadingInsight ? <Loader2 size={14} className="animate-spin"/> : <BookOpen size={14} />}
            {insight ? "Hide Wisdom" : "Unlock Wisdom"}
          </button>
        )}
      </div>

      {/* Main Counter Display */}
      <div 
        className="relative mb-10 group cursor-pointer"
        onClick={isZenMode ? handleTap : undefined}
      >
        {/* Breath Pacing Ring (Zen Mode Only) */}
        {isZenMode && (
          <div className="absolute inset-[-60px] border-2 border-white/10 rounded-full animate-breath"></div>
        )}
        
        <div className={`relative ${isZenMode ? 'w-80 h-80 bg-white/5 border-white/10' : 'w-72 h-72 bg-white/90 dark:bg-stone-900/90 border-stone-50 dark:border-stone-800'} backdrop-blur-md rounded-full shadow-2xl border-[6px] flex flex-col items-center justify-center transition-all duration-300 active:scale-[0.97]`}>
           {isCommitting ? (
             <div className="flex flex-col items-center animate-in zoom-in duration-500">
                <Check size={64} className="text-green-500 mb-2" />
                <span className="text-stone-500 font-serif">Accepted</span>
             </div>
           ) : (
             <>
               <div className={`${isZenMode ? 'text-8xl text-stone-100' : 'text-7xl text-stone-800 dark:text-stone-100'} font-bold font-display tracking-tight`}>
                 {sessionCount}
               </div>
               <div className="text-stone-400 text-sm mt-2 font-serif">/ {activeMantra.targetCount}</div>
             </>
           )}
        </div>
      </div>

      {/* Controls */}
      <div className={`w-full max-w-sm space-y-4 px-6 ${isZenMode ? 'mb-auto' : ''}`}>
        {!isZenMode && (
          <button
            onClick={handleTap}
            className={`w-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 py-5 rounded-2xl font-bold text-lg shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${isManualMode ? 'hidden' : 'block'}`}
          >
            <Plus size={24} /> Chant
          </button>
        )}

        <div className="flex items-center justify-center gap-3">
          {!isZenMode && (
            <button 
              onClick={() => setIsManualMode(!isManualMode)}
              className="p-4 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-500 rounded-xl hover:bg-stone-50 transition-colors"
            >
              <Zap size={20} className={isPremium ? 'text-saffron-500' : ''} />
            </button>
          )}
          
          <button 
            onClick={handleFinishSession}
            disabled={sessionCount === 0}
            className={`flex-1 ${isZenMode ? 'bg-white/10 text-stone-300 border border-white/5' : 'bg-mystic-600 text-white'} py-4 px-6 rounded-xl font-bold shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2`}
          >
            <Save size={18} /> Finish Session
          </button>
        </div>
      </div>

      {/* Manual Input Overlay */}
      {isManualMode && (
         <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-6">
            <div className="bg-white dark:bg-stone-900 p-8 rounded-3xl w-full max-w-xs shadow-2xl animate-in zoom-in-95">
               <h4 className="font-serif font-bold text-xl text-stone-800 dark:text-stone-100 mb-4">Manual Entry</h4>
               <input 
                 type="number" 
                 value={manualInput}
                 onChange={(e) => setManualInput(e.target.value)}
                 className="w-full p-4 text-2xl font-bold text-center border-2 border-saffron-400 rounded-2xl mb-6 bg-white dark:bg-stone-800 text-stone-900 dark:text-white"
                 placeholder="0"
                 autoFocus
               />
               <div className="flex gap-2">
                 <button onClick={() => setIsManualMode(false)} className="flex-1 py-3 bg-stone-100 dark:bg-stone-800 text-stone-600 font-bold rounded-xl">Cancel</button>
                 <button onClick={handleManualSubmit} className="flex-1 py-3 bg-saffron-500 text-white font-bold rounded-xl">Apply</button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default MantraCounter;
