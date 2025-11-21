
import React, { useState, useRef } from 'react';
import { Play, Plus, RotateCcw, BookOpen, Loader2, Edit2, Check, ChevronDown, Save } from 'lucide-react';
import { Group, Mantra } from '../types';
import { getMantraInsight } from '../services/geminiService';

interface MantraCounterProps {
  activeGroup: Group | null;
  personalMantras: Mantra[];
  onUpdateCount: (increment: number, groupId: string | null, mantraText: string) => void;
  onAddPersonalMantra: (text: string, target: number) => void;
}

const MantraCounter: React.FC<MantraCounterProps> = ({ activeGroup, personalMantras, onUpdateCount, onAddPersonalMantra }) => {
  const [sessionCount, setSessionCount] = useState(0);
  const [insight, setInsight] = useState<string | null>(null);
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);
  const [manualInput, setManualInput] = useState<string>('');
  const [isManualMode, setIsManualMode] = useState(false);
  
  // Personal Mantra Selection State
  const [selectedPersonalMantraId, setSelectedPersonalMantraId] = useState<string>(personalMantras[0]?.id || '');
  const [isCreatingMantra, setIsCreatingMantra] = useState(false);
  const [newMantraText, setNewMantraText] = useState('');
  
  // Animation state for commit
  const [isCommitting, setIsCommitting] = useState(false);

  const activeMantra = activeGroup 
    ? activeGroup.mantra 
    : personalMantras.find(m => m.id === selectedPersonalMantraId) || { text: 'Om Namah Shivaya', targetCount: 108, meaning: '' };

  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleTap = () => {
    setSessionCount(prev => prev + 1);
    // We still update global state incrementally so data isn't lost if they close app
    onUpdateCount(1, activeGroup?.id || null, activeMantra.text);
    
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
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
    
    // Visual effect of offering/saving
    setTimeout(() => {
      setSessionCount(0);
      setIsCommitting(false);
    }, 1500);
  };

  const fetchInsight = async () => {
    setIsLoadingInsight(true);
    const text = await getMantraInsight(activeMantra.text);
    setInsight(text);
    setIsLoadingInsight(false);
  };

  const handleCreateMantra = () => {
    if (newMantraText.trim()) {
      onAddPersonalMantra(newMantraText, 108);
      setNewMantraText('');
      setIsCreatingMantra(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto w-full py-6 animate-in zoom-in-95 duration-500">
      
      {/* Header Info */}
      <div className="text-center mb-6 w-full">
        <span className="px-4 py-1.5 bg-mystic-100 text-mystic-800 rounded-full text-xs font-bold uppercase tracking-widest mb-6 inline-block shadow-sm font-serif">
          {activeGroup ? activeGroup.name : "Personal Sadhana"}
        </span>

        {/* Context Switching (Only if not in group) */}
        {!activeGroup && (
           <div className="mb-4 relative inline-block w-full max-w-xs">
              {isCreatingMantra ? (
                <div className="flex gap-2 animate-in fade-in">
                  <input 
                    type="text" 
                    value={newMantraText}
                    onChange={(e) => setNewMantraText(e.target.value)}
                    placeholder="Enter new mantra..."
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-saffron-400"
                    autoFocus
                  />
                  <button onClick={handleCreateMantra} className="bg-stone-900 text-white px-3 rounded-lg text-xs font-bold">OK</button>
                  <button onClick={() => setIsCreatingMantra(false)} className="bg-stone-200 text-stone-600 px-3 rounded-lg text-xs">X</button>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 relative group">
                   <select 
                    value={selectedPersonalMantraId}
                    onChange={(e) => {
                      if (e.target.value === 'add_new') {
                        setIsCreatingMantra(true);
                      } else {
                        setSelectedPersonalMantraId(e.target.value);
                        setSessionCount(0); 
                      }
                    }}
                    className="appearance-none bg-transparent text-2xl md:text-3xl font-display font-bold text-stone-800 text-center focus:outline-none cursor-pointer hover:text-saffron-600 transition-colors w-full pr-6 truncate"
                   >
                     {personalMantras.map(m => (
                       <option key={m.id} value={m.id}>{m.text}</option>
                     ))}
                     <option value="add_new" className="text-saffron-600 font-bold">+ Add New Mantra</option>
                   </select>
                   <ChevronDown size={20} className="text-stone-400 pointer-events-none absolute right-0 top-1/2 -translate-y-1/2" />
                </div>
              )}
           </div>
        )}

        {activeGroup && (
            <h1 className="text-2xl md:text-3xl font-display font-bold text-stone-800 mt-2 leading-snug px-4">
              {activeMantra.text}
            </h1>
        )}
        
        {/* Meaning/Translation Subtitle */}
        {activeMantra.meaning && (
          <p className="text-stone-500 text-sm italic font-serif mt-2 max-w-sm mx-auto px-4">
            "{activeMantra.meaning}"
          </p>
        )}

        <button 
          onClick={() => insight ? setInsight(null) : fetchInsight()}
          className="mt-4 text-saffron-600 hover:text-saffron-700 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1 mx-auto transition-colors"
        >
          {isLoadingInsight ? <Loader2 size={14} className="animate-spin"/> : <BookOpen size={14} />}
          {insight ? "Hide Wisdom" : "Unlock Wisdom"}
        </button>
      </div>

      {/* AI Insight Card */}
      {insight && (
        <div className="bg-gradient-to-br from-saffron-50 to-orange-50 border border-saffron-100 p-5 rounded-2xl mb-6 text-stone-700 text-sm leading-relaxed max-w-sm text-center shadow-md shadow-saffron-100 animate-in fade-in slide-in-from-top-2 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-saffron-300 to-orange-400"></div>
          <p className="font-serif">{insight}</p>
        </div>
      )}

      {/* Main Counter Display */}
      <div className="relative mb-8 group">
        <div className="absolute inset-0 bg-gradient-to-tr from-saffron-200 to-mystic-200 rounded-full blur-3xl opacity-30 group-hover:opacity-40 transition-opacity duration-700 animate-pulse"></div>
        <div className="relative w-72 h-72 bg-white/80 backdrop-blur-sm rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-[6px] border-stone-50 flex flex-col items-center justify-center transition-all duration-200 active:scale-[0.98]">
           {isCommitting ? (
             <div className="flex flex-col items-center animate-in zoom-in duration-500">
                <Check size={64} className="text-green-500 mb-2" />
                <span className="text-stone-500 font-serif">Offering Accepted</span>
             </div>
           ) : (
             <>
               <div className="text-7xl font-bold text-stone-800 font-display tracking-tighter">
                 {sessionCount}
               </div>
               <div className="text-stone-400 text-sm mt-2 font-medium font-serif">
                 / {activeMantra.targetCount}
               </div>
             </>
           )}
        </div>
      </div>

      {/* Controls */}
      <div className="w-full space-y-4 px-4">
        
        {/* Tap Button */}
        <button
          ref={buttonRef}
          onClick={handleTap}
          disabled={isCommitting}
          className="w-full bg-stone-900 hover:bg-stone-800 active:bg-black text-white rounded-2xl py-5 text-xl font-medium shadow-xl shadow-stone-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 font-serif"
        >
          <Plus size={24} />
          Chant
        </button>

        {/* Secondary Actions */}
        <div className="flex gap-3">
           {/* Manual Input */}
           {!isManualMode ? (
             <button 
                onClick={() => setIsManualMode(true)}
                disabled={isCommitting}
                className="flex-1 bg-white border border-stone-200 hover:bg-stone-50 text-stone-600 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 font-serif"
             >
               <Edit2 size={16} /> Add Bulk
             </button>
           ) : (
             <div className="flex-1 flex gap-2 animate-in fade-in">
               <input 
                 type="number" 
                 value={manualInput}
                 onChange={(e) => setManualInput(e.target.value)}
                 placeholder="Qty"
                 className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-saffron-400 focus:outline-none font-serif"
                 autoFocus
               />
               <button 
                 onClick={handleManualSubmit}
                 className="bg-saffron-500 hover:bg-saffron-600 text-white px-4 rounded-xl"
               >
                 <Check size={20} />
               </button>
               <button 
                 onClick={() => setIsManualMode(false)}
                 className="bg-stone-200 text-stone-600 px-4 rounded-xl"
               >
                 X
               </button>
             </div>
           )}

           {/* Commit / Finish Session Button */}
           <button 
              onClick={handleFinishSession}
              disabled={sessionCount === 0 || isCommitting}
              className="flex-1 bg-gradient-to-r from-mystic-600 to-mystic-700 hover:from-mystic-700 hover:to-mystic-800 text-white py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-mystic-200 font-serif"
              title="Finish session and add to total"
           >
             <Save size={18} /> Finish
           </button>

           {/* Reset (hidden behind Finish mainly, but kept for errors) */}
           <button 
              onClick={() => setSessionCount(0)}
              disabled={isCommitting}
              className="w-12 bg-white border border-stone-200 hover:bg-red-50 text-stone-400 hover:text-red-500 py-3 rounded-xl font-medium transition-colors flex items-center justify-center"
              title="Reset Session to 0 (Discard)"
           >
             <RotateCcw size={18} />
           </button>
        </div>
      </div>
    </div>
  );
};

export default MantraCounter;