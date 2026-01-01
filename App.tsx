
import React, { useState, useEffect, Suspense, lazy, useRef } from 'react';
import { View, Group, UserStats, ReminderSettings, Mantra, UserProfile } from './types';
import SacredLogo from './components/SacredLogo';

// Lazy load components
const StatsDashboard = lazy(() => import('./components/StatsDashboard'));
const MantraCounter = lazy(() => import('./components/MantraCounter'));
const GroupAdmin = lazy(() => import('./components/GroupAdmin'));
const SubscriptionModal = lazy(() => import('./components/SubscriptionModal'));
const AuthScreen = lazy(() => import('./components/AuthScreen'));

import { authService } from './services/auth';
import { supabase } from './lib/supabaseClient';
import { LayoutDashboard, Flower2, Users, Settings, X, Star, LogOut, Moon, Sun, Bell, Check, Clock, Loader2, AlertCircle } from 'lucide-react';

const PageLoader = () => (
  <div className="flex h-full w-full items-center justify-center min-h-[50vh] animate-in fade-in">
    <Loader2 className="w-8 h-8 text-saffron-500 animate-spin" />
  </div>
);

const NavButton = ({ 
  active, 
  onClick, 
  icon, 
  label, 
  description 
}: { 
  active: boolean; 
  onClick: () => void; 
  icon: React.ReactNode; 
  label: string;
  description: string;
}) => (
  <button 
    onClick={onClick}
    aria-label={label}
    className={`flex md:w-full flex-col md:items-center lg:flex-row lg:justify-start lg:gap-4 p-2 md:py-4 lg:px-4 rounded-xl transition-all duration-200 group ${
      active 
        ? 'text-saffron-600 dark:text-saffron-400 bg-saffron-50 dark:bg-saffron-900/20 font-bold' 
        : 'text-stone-400 dark:text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800'
    }`}
  >
    <div className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
      {icon}
    </div>
    <div className="flex flex-col items-start text-left overflow-hidden">
      <span className={`text-[10px] md:hidden lg:block lg:text-sm font-medium lg:font-semibold mt-1 lg:mt-0 ${active ? '' : 'font-normal'}`}>
        {label}
      </span>
      <span className="hidden lg:block text-[10px] text-stone-400 dark:text-stone-500 font-serif font-normal leading-tight truncate w-full">
        {description}
      </span>
    </div>
  </button>
);

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [groups, setGroups] = useState<Group[]>([]);
  const [activeGroup, setActiveGroup] = useState<Group | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showActiveReminder, setShowActiveReminder] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('om_theme') as 'light' | 'dark') || 'light');

  const [reminder, setReminder] = useState<ReminderSettings>({ enabled: false, time: '07:00' });
  const [tempReminderTime, setTempReminderTime] = useState('07:00');
  const lastReminderTriggered = useRef<string>('');

  const [personalMantras, setPersonalMantras] = useState<Mantra[]>([
    { id: 'pm-1', text: 'Om Namah Shivaya', targetCount: 108, meaning: 'I bow to the Inner Self.' },
    { id: 'pm-2', text: 'Om Mani Padme Hum', targetCount: 108, meaning: 'The jewel is in the lotus.' },
    { id: 'pm-3', text: 'Gayatri Mantra', targetCount: 24, meaning: 'Meditation on the divine creator.' },
    { id: 'pm-4', text: 'Hare Krishna Maha Mantra', targetCount: 108, meaning: 'The great mantra of liberation.' },
    { id: 'pm-5', text: 'Om Namo Narayanaya', targetCount: 108, meaning: 'I bow to the Divine Preserver.' },
    { id: 'pm-6', text: 'Om Gam Ganapataye Namaha', targetCount: 108, meaning: 'Salutations to the Remover of Obstacles.' },
    { id: 'pm-7', text: 'Om Sri Ramaya Namaha', targetCount: 108, meaning: 'Victory to the Divine Ram.' },
    { id: 'pm-8', text: 'Maha Mrityunjaya Mantra', targetCount: 11, meaning: 'Great victory over death.' },
    { id: 'pm-9', text: 'Om Shanti Shanti Shanti', targetCount: 3, meaning: 'Peace for all realms.' },
    { id: 'pm-10', text: 'So Hum', targetCount: 108, meaning: 'I am that.' },
  ]);

  const [userStats, setUserStats] = useState<UserStats>({
    totalChants: 0,
    streakDays: 0,
    lastChantedDate: null,
    mantraBreakdown: [], 
    isPremium: false
  });

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('om_theme', theme);
  }, [theme]);

  const audioCtx = useRef<AudioContext | null>(null);
  const playBell = () => {
    try {
      if (!audioCtx.current) audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.current.createOscillator();
      const gain = audioCtx.current.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, audioCtx.current.currentTime);
      gain.gain.setValueAtTime(0.5, audioCtx.current.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.current.currentTime + 3);
      osc.connect(gain);
      gain.connect(audioCtx.current.destination);
      osc.start();
      osc.stop(audioCtx.current.currentTime + 3);
    } catch (e) { console.error("Sound failed", e); }
  };

  useEffect(() => {
    const checkReminder = () => {
      if (!reminder.enabled || !reminder.time) return;
      const now = new Date();
      const hhmm = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      if (hhmm === reminder.time && lastReminderTriggered.current !== hhmm) {
        lastReminderTriggered.current = hhmm;
        if (navigator.vibrate) navigator.vibrate([300, 100, 300, 100, 300]);
        playBell();
        if (Notification.permission === 'granted') {
           new Notification("OmCounter Practice", { body: "It is time for your sacred chant session.", icon: "/favicon.ico" });
        }
        setShowActiveReminder(true);
      }
    };
    const interval = setInterval(checkReminder, 10000);
    return () => clearInterval(interval);
  }, [reminder]);

  useEffect(() => {
    const initAuth = async () => {
      try {
          const user = await authService.getCurrentUser();
          setCurrentUser(user);
      } catch (e) { console.error(e); } 
      finally { setIsAuthChecking(false); }
    };
    initAuth();
  }, []);

  useEffect(() => {
    if (currentUser) {
      const savedReminder = localStorage.getItem(`om_reminder_${currentUser.id}`);
      if(savedReminder) {
        const parsed = JSON.parse(savedReminder);
        setReminder(parsed);
        setTempReminderTime(parsed.time);
      }
      const loadData = async () => {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', currentUser.id).single();
        if (profile) {
          let breakdown = typeof profile.mantra_stats === 'string' ? JSON.parse(profile.mantra_stats) : profile.mantra_stats || [];
          setUserStats(prev => ({
            ...prev,
            isPremium: profile.is_premium,
            totalChants: profile.total_global_chants || 0, 
            mantraBreakdown: breakdown,
            streakDays: profile.streak_days || 0,
            lastChantedDate: profile.last_chanted_date || null
          }));
        }
      };
      loadData();
    }
  }, [currentUser]);

  const handleUpdateCount = async (increment: number, groupId: string | null, mantraText: string) => {
    if (!currentUser) return;
    const newTotal = userStats.totalChants + increment;
    setUserStats(prev => ({ ...prev, totalChants: newTotal }));
    await supabase.from('profiles').update({ total_global_chants: newTotal }).eq('id', currentUser.id);
  };

  const handlePremiumUpgrade = async () => {
    if (!currentUser) return;
    try {
      const { error } = await supabase.from('profiles').update({ is_premium: true }).eq('id', currentUser.id);
      if (error) throw error;
      setUserStats(prev => ({ ...prev, isPremium: true }));
    } catch (e) {
      console.error("Failed to persist premium status", e);
      setUserStats(prev => ({ ...prev, isPremium: true }));
    }
  };

  const handleSetReminder = async () => {
    const permission = await Notification.requestPermission();
    const settings = { enabled: true, time: tempReminderTime };
    setReminder(settings);
    localStorage.setItem(`om_reminder_${currentUser?.id}`, JSON.stringify(settings));
    if (permission !== 'granted') {
      alert("Note: Browser notifications are blocked, but OmCounter will still alert you with sound and vibration while the app is open.");
    }
  };

  const handleDisableReminder = () => {
    const settings = { enabled: false, time: tempReminderTime };
    setReminder(settings);
    localStorage.setItem(`om_reminder_${currentUser?.id}`, JSON.stringify(settings));
  };

  const renderContent = () => (
    <Suspense fallback={<PageLoader />}>
      {currentView === View.DASHBOARD && <StatsDashboard userStats={userStats} groups={groups} currentUser={currentUser!} onUpgradeClick={() => setShowSubscriptionModal(true)} />}
      {currentView === View.GROUPS && <GroupAdmin groups={groups} onCreateGroup={() => {}} onJoinGroup={() => {}} onSelectGroup={(g) => { setActiveGroup(g); setCurrentView(View.COUNTER); }} isPremium={userStats.isPremium} onTriggerUpgrade={() => setShowSubscriptionModal(true)} currentUserId={currentUser!.id} currentUserName={currentUser!.name} onAddAnnouncement={() => {}} />}
      {currentView === View.COUNTER && <MantraCounter activeGroup={activeGroup} personalMantras={personalMantras} onUpdateCount={handleUpdateCount} onAddPersonalMantra={(t, tar) => setPersonalMantras([...personalMantras, {id: Date.now().toString(), text: t, targetCount: tar}])} isPremium={userStats.isPremium} onUpgradeClick={() => setShowSubscriptionModal(true)} />}
    </Suspense>
  );

  if (isAuthChecking) return <div className="h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950"><SacredLogo size="xl" /></div>;
  if (!currentUser) return <AuthScreen onAuthSuccess={setCurrentUser} />;

  return (
    <div className="min-h-screen bg-sacred-pattern text-stone-900 dark:text-stone-100 flex flex-col md:flex-row overflow-hidden relative">
      <SubscriptionModal isOpen={showSubscriptionModal} onClose={() => setShowSubscriptionModal(false)} onUpgrade={handlePremiumUpgrade} />
      
      {showActiveReminder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-stone-950/80 backdrop-blur-md animate-in fade-in">
           <div className="bg-white dark:bg-stone-900 rounded-[3rem] p-10 max-w-sm w-full text-center shadow-2xl border border-saffron-200 dark:border-stone-800 animate-in zoom-in">
              <div className="w-24 h-24 bg-saffron-100 dark:bg-saffron-900/30 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                 <Bell size={48} className="text-saffron-600 animate-bounce" />
              </div>
              <h2 className="text-3xl font-serif font-bold text-stone-800 dark:text-stone-100 mb-3">Sacred Time</h2>
              <p className="text-stone-500 dark:text-stone-400 mb-10 font-serif leading-relaxed italic">"The silence is calling you. Your daily practice session is scheduled now."</p>
              <button 
                onClick={() => { setShowActiveReminder(false); setCurrentView(View.COUNTER); }}
                className="w-full bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-950 py-5 rounded-2xl font-black text-lg shadow-xl shadow-saffron-200/20 dark:shadow-none transition-all active:scale-95"
              >
                Enter Practice
              </button>
              <button onClick={() => setShowActiveReminder(false)} className="mt-6 text-sm text-stone-400 font-bold uppercase tracking-widest hover:text-stone-600">Maybe Later</button>
           </div>
        </div>
      )}

      {showSettings && (
        <div className="fixed inset-0 bg-stone-950/60 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in">
          <div className="bg-[#1c1917] dark:bg-stone-900 rounded-[3rem] w-full max-w-md p-10 relative border border-stone-800/50 shadow-3xl overflow-hidden">
             <button onClick={() => setShowSettings(false)} className="absolute top-8 right-8 text-stone-500 hover:text-white transition-colors bg-white/5 p-2 rounded-full"><X size={24}/></button>
             
             <div className="flex items-center gap-3 mb-10 text-white font-display text-2xl">
                <div className="p-2 bg-saffron-500 rounded-xl shadow-lg shadow-saffron-500/20">
                  <Settings size={24} className="text-white" />
                </div>
                <span>Sanctuary Settings</span>
             </div>
             
             <div className="space-y-5">
                <div className="bg-[#292524] p-6 rounded-[2rem] border border-stone-700/40 flex items-center gap-5 shadow-inner">
                   <div className="w-14 h-14 bg-mystic-400 rounded-full flex items-center justify-center text-stone-950 font-black text-2xl shadow-lg">
                      {currentUser?.name?.charAt(0) || 'M'}
                   </div>
                   <div className="overflow-hidden">
                      <p className="font-bold text-white text-lg truncate leading-tight">{currentUser?.name}</p>
                      <p className="text-stone-400 text-sm truncate opacity-70">{currentUser?.email}</p>
                   </div>
                </div>

                <div className="bg-[#292524] p-6 rounded-[2rem] border border-stone-700/40 flex items-center justify-between shadow-inner">
                   <div>
                      <p className="font-bold text-white mb-0.5">Sanctuary Access</p>
                      <p className={`text-sm font-medium ${userStats.isPremium ? 'text-saffron-400' : 'text-stone-500'}`}>
                        {userStats.isPremium ? 'Premium Sanctuary' : 'Basic Sadhana'}
                      </p>
                   </div>
                   {!userStats.isPremium && (
                      <button 
                        onClick={() => { setShowSettings(false); setShowSubscriptionModal(true); }}
                        className="bg-saffron-500 hover:bg-saffron-600 text-white px-6 py-2.5 rounded-full font-black text-sm shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all hover:scale-105 active:scale-95"
                      >
                        Upgrade
                      </button>
                   )}
                </div>

                <div className="space-y-6 pt-6">
                   <div className="bg-[#292524] p-6 rounded-[2rem] border border-stone-700/40">
                       <div className="flex items-center gap-3 mb-4">
                           <div className="p-2 bg-saffron-500/10 rounded-lg">
                            <Bell size={18} className="text-saffron-500"/>
                           </div>
                           <p className="font-bold text-stone-100 text-sm">Practice Bell</p>
                       </div>
                       <div className="flex gap-2">
                           <input type="time" value={tempReminderTime} onChange={e => setTempReminderTime(e.target.value)} className="flex-1 p-4 rounded-2xl border border-stone-700 bg-[#1c1917] text-white font-black outline-none focus:ring-2 focus:ring-saffron-500 transition-all"/>
                           {reminder.enabled && reminder.time === tempReminderTime ? (
                               <button onClick={handleDisableReminder} className="bg-stone-700 text-stone-400 px-6 rounded-2xl text-xs font-black tracking-widest uppercase hover:bg-red-900/20 hover:text-red-400 transition-all">OFF</button>
                           ) : (
                               <button onClick={handleSetReminder} className="bg-white text-stone-900 px-6 rounded-2xl text-xs font-black tracking-widest uppercase hover:bg-stone-200 transition-all">SET</button>
                           )}
                       </div>
                   </div>

                   <div className="flex items-center justify-between px-4 py-2 bg-stone-800/30 rounded-2xl">
                       <div className="flex items-center gap-3">
                         {theme === 'dark' ? <Moon size={18} className="text-mystic-400" /> : <Sun size={18} className="text-orange-400" />}
                         <p className="font-bold text-stone-300 text-sm">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</p>
                       </div>
                       <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className={`w-14 h-7 rounded-full relative transition-all duration-500 ${theme === 'dark' ? 'bg-mystic-600' : 'bg-stone-700'}`}>
                           <div className={`w-5 h-5 bg-white rounded-full absolute top-1 shadow-md transition-all ${theme === 'dark' ? 'left-8' : 'left-1'}`} />
                       </button>
                   </div>

                   <button onClick={async () => { await authService.logout(); window.location.reload(); }} className="w-full text-left flex items-center justify-center gap-3 text-red-400/80 p-5 rounded-2xl hover:bg-red-900/10 hover:text-red-400 font-black text-sm uppercase tracking-widest transition-all mt-6 border border-red-900/20">
                      <LogOut size={18} /> 
                      <span>Logout</span>
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}

      <nav className="bg-white dark:bg-stone-900 md:w-20 lg:w-72 md:border-r border-t md:border-t-0 border-stone-200 dark:border-stone-800 flex md:flex-col justify-between z-10 fixed bottom-0 w-full md:relative md:h-screen shadow-2xl">
        <div className="flex md:flex-col justify-around md:justify-start w-full md:space-y-3 md:p-6">
          <div className="hidden md:flex items-center lg:gap-4 lg:px-4 py-8 mb-6">
            <SacredLogo size="lg" />
            <span className="font-display font-black text-2xl text-stone-900 dark:text-stone-100 hidden lg:block tracking-tight">OmCounter</span>
          </div>
          <NavButton 
            active={currentView === View.DASHBOARD} 
            onClick={() => setCurrentView(View.DASHBOARD)} 
            icon={<LayoutDashboard size={26} />} 
            label="Stats" 
            description="Journey Insights"
          />
          <NavButton 
            active={currentView === View.GROUPS} 
            onClick={() => setCurrentView(View.GROUPS)} 
            icon={<Users size={26} />} 
            label="Sanghas" 
            description="Practice Circles"
          />
          <NavButton 
            active={currentView === View.COUNTER} 
            onClick={() => { setActiveGroup(null); setCurrentView(View.COUNTER); }} 
            icon={<Flower2 size={26} />} 
            label="Practice" 
            description="Sacred Session"
          />
          <NavButton 
            active={showSettings} 
            onClick={() => setShowSettings(true)} 
            icon={<Settings size={26} />} 
            label="Settings" 
            description="Sanctuary Config"
          />
        </div>
      </nav>

      <main className="flex-1 h-screen overflow-y-auto pb-28 md:pb-0">
         <div className="max-w-6xl mx-auto p-6 md:p-12 pt-10 md:pt-16">{renderContent()}</div>
      </main>
    </div>
  );
};

export default App;
