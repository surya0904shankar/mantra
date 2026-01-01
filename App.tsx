
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

const NavButton = ({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) => (
  <button 
    onClick={onClick}
    aria-label={label}
    className={`flex md:w-full flex-col md:items-center lg:flex-row lg:justify-start lg:gap-3 p-2 md:py-4 lg:px-4 rounded-xl transition-all duration-200 group ${
      active 
        ? 'text-saffron-600 dark:text-saffron-400 bg-saffron-50 dark:bg-saffron-900/20 font-bold' 
        : 'text-stone-400 dark:text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-800'
    }`}
  >
    <div className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
      {icon}
    </div>
    <span className={`text-[10px] md:hidden lg:block lg:text-sm font-medium lg:font-semibold mt-1 lg:mt-0 ${active ? '' : 'font-normal'}`}>{label}</span>
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

  // Reminder Logic
  const [reminder, setReminder] = useState<ReminderSettings>({ enabled: false, time: '07:00' });
  const [tempReminderTime, setTempReminderTime] = useState('07:00');
  const lastReminderTriggered = useRef<string>('');

  const [personalMantras, setPersonalMantras] = useState<Mantra[]>([
    { id: 'pm-1', text: 'Om Namah Shivaya', targetCount: 108, meaning: 'I bow to Shiva.' },
    { id: 'pm-2', text: 'Om Mani Padme Hum', targetCount: 108, meaning: 'The jewel is in the lotus.' },
    { id: 'pm-3', text: 'Gayatri Mantra', targetCount: 108, meaning: 'Meditation on the divine creator.' },
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

  // Audio Context for Reminder Bell
  const audioCtx = useRef<AudioContext | null>(null);
  const playBell = () => {
    try {
      if (!audioCtx.current) audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.current.createOscillator();
      const gain = audioCtx.current.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, audioCtx.current.currentTime); // C5
      gain.gain.setValueAtTime(0.5, audioCtx.current.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.current.currentTime + 3);
      osc.connect(gain);
      gain.connect(audioCtx.current.destination);
      osc.start();
      osc.stop(audioCtx.current.currentTime + 3);
    } catch (e) { console.error("Sound failed", e); }
  };

  // REFINED REMINDER LOOP
  useEffect(() => {
    const checkReminder = () => {
      if (!reminder.enabled || !reminder.time) return;
      
      const now = new Date();
      const hhmm = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      if (hhmm === reminder.time && lastReminderTriggered.current !== hhmm) {
        lastReminderTriggered.current = hhmm;
        
        // 1. Buzz (Haptic)
        if (navigator.vibrate) {
          navigator.vibrate([300, 100, 300, 100, 300]);
        }

        // 2. Sound
        playBell();

        // 3. Browser Notification
        if (Notification.permission === 'granted') {
           new Notification("OmCounter Practice", {
             body: "It is time for your sacred chant session.",
             icon: "/favicon.ico"
           });
        }

        // 4. In-App Overlay
        setShowActiveReminder(true);
      }
    };

    const interval = setInterval(checkReminder, 10000); // Check every 10 seconds
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
      <SubscriptionModal isOpen={showSubscriptionModal} onClose={() => setShowSubscriptionModal(false)} onUpgrade={() => setUserStats(p => ({...p, isPremium: true}))} />
      
      {showActiveReminder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-stone-950/80 backdrop-blur-md animate-in fade-in">
           <div className="bg-white dark:bg-stone-900 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border border-saffron-200 dark:border-stone-800 animate-in zoom-in">
              <div className="w-20 h-20 bg-saffron-100 dark:bg-saffron-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                 <Bell size={40} className="text-saffron-600 animate-bounce" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-stone-800 dark:text-stone-100 mb-2">Sacred Time</h2>
              <p className="text-stone-500 dark:text-stone-400 mb-8 font-serif">Your scheduled reminder for mantra practice is active. Let the journey begin.</p>
              <button 
                onClick={() => { setShowActiveReminder(false); setCurrentView(View.COUNTER); }}
                className="w-full bg-saffron-500 hover:bg-saffron-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-saffron-200 dark:shadow-none transition-all"
              >
                Go to Practice
              </button>
              <button onClick={() => setShowActiveReminder(false)} className="mt-4 text-sm text-stone-400 font-medium">Dismiss</button>
           </div>
        </div>
      )}

      {showSettings && (
        <div className="fixed inset-0 bg-stone-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#1c1917] dark:bg-stone-900 rounded-[2rem] w-full max-w-sm p-8 relative border border-stone-800 shadow-2xl overflow-hidden">
             <button onClick={() => setShowSettings(false)} className="absolute top-6 right-6 text-stone-400 hover:text-white transition-colors"><X size={24}/></button>
             
             <div className="flex items-center gap-2 mb-8 text-white font-display text-xl">
                <Settings size={22} className="text-stone-400" />
                <span>Settings</span>
             </div>
             
             <div className="space-y-4">
                {/* User Profile Card */}
                <div className="bg-[#292524] dark:bg-stone-800/60 p-5 rounded-2xl border border-stone-700/50 flex items-center gap-4">
                   <div className="w-12 h-12 bg-mystic-300 dark:bg-mystic-900/50 rounded-full flex items-center justify-center text-mystic-950 dark:text-mystic-200 font-bold text-xl">
                      {currentUser?.name?.charAt(0) || 'M'}
                   </div>
                   <div className="overflow-hidden">
                      <p className="font-bold text-white truncate">{currentUser?.name}</p>
                      <p className="text-stone-400 text-sm truncate">{currentUser?.email}</p>
                   </div>
                </div>

                {/* Plan Status Card */}
                <div className="bg-[#292524] dark:bg-stone-800/60 p-5 rounded-2xl border border-stone-700/50 flex items-center justify-between">
                   <div>
                      <p className="font-bold text-white">Plan Status</p>
                      <p className="text-stone-400 text-sm">{userStats.isPremium ? 'Sacred Sanctuary' : 'Free Tier'}</p>
                   </div>
                   {!userStats.isPremium && (
                      <button 
                        onClick={() => { setShowSettings(false); setShowSubscriptionModal(true); }}
                        className="bg-saffron-500 hover:bg-saffron-600 text-white px-5 py-2 rounded-full font-bold shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all hover:scale-105"
                      >
                        Upgrade
                      </button>
                   )}
                </div>

                {/* Settings Controls */}
                <div className="space-y-4 pt-4">
                   <div className="bg-[#292524] dark:bg-stone-800/60 p-5 rounded-2xl border border-stone-700/50">
                       <div className="flex items-center gap-2 mb-4">
                           <Bell size={18} className="text-saffron-500"/>
                           <p className="font-bold text-stone-200 text-sm">Practice Reminder</p>
                       </div>
                       <div className="flex gap-2">
                           <input type="time" value={tempReminderTime} onChange={e => setTempReminderTime(e.target.value)} className="flex-1 p-3 rounded-xl border border-stone-700 bg-stone-900 text-white font-bold outline-none focus:ring-1 focus:ring-saffron-500"/>
                           {reminder.enabled && reminder.time === tempReminderTime ? (
                               <button onClick={handleDisableReminder} className="bg-stone-700 text-stone-400 px-4 rounded-xl text-xs font-bold">OFF</button>
                           ) : (
                               <button onClick={handleSetReminder} className="bg-white text-stone-900 px-4 rounded-xl text-xs font-bold hover:bg-stone-200">SET</button>
                           )}
                       </div>
                   </div>

                   <div className="flex items-center justify-between px-3">
                       <p className="font-medium text-stone-300">Dark Theme</p>
                       <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className={`w-12 h-6 rounded-full relative transition-colors ${theme === 'dark' ? 'bg-mystic-600' : 'bg-stone-700'}`}>
                           <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${theme === 'dark' ? 'left-7' : 'left-1'}`}>
                             {theme === 'dark' ? <Moon size={10} className="text-mystic-600 m-auto translate-y-[2px]"/> : <Sun size={10} className="text-orange-400 m-auto translate-y-[2px]"/>}
                           </div>
                       </button>
                   </div>

                   <button onClick={async () => { await authService.logout(); window.location.reload(); }} className="w-full text-left flex items-center gap-3 text-red-400 p-4 rounded-2xl hover:bg-red-900/10 font-bold transition-colors mt-4">
                      <LogOut size={18} /> 
                      <span>Sign Out</span>
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}

      <nav className="bg-white dark:bg-stone-900 md:w-20 lg:w-64 md:border-r border-t md:border-t-0 border-stone-200 dark:border-stone-800 flex md:flex-col justify-between z-10 fixed bottom-0 w-full md:relative md:h-screen shadow-lg">
        <div className="flex md:flex-col justify-around md:justify-start w-full md:space-y-2 md:p-4">
          <div className="hidden md:flex items-center lg:gap-3 lg:px-4 py-6 mb-4">
            <SacredLogo size="md" />
            <span className="font-display font-bold text-xl text-stone-800 dark:text-stone-100 hidden lg:block">OmCounter</span>
          </div>
          <NavButton active={currentView === View.DASHBOARD} onClick={() => setCurrentView(View.DASHBOARD)} icon={<LayoutDashboard size={24} />} label="Stats" />
          <NavButton active={currentView === View.GROUPS} onClick={() => setCurrentView(View.GROUPS)} icon={<Users size={24} />} label="Sanghas" />
          <NavButton active={currentView === View.COUNTER} onClick={() => { setActiveGroup(null); setCurrentView(View.COUNTER); }} icon={<Flower2 size={24} />} label="Practice" />
          <NavButton active={showSettings} onClick={() => setShowSettings(true)} icon={<Settings size={24} />} label="Settings" />
        </div>
      </nav>

      <main className="flex-1 h-screen overflow-y-auto pb-24 md:pb-0">
         <div className="max-w-5xl mx-auto p-4 md:p-8 pt-8 md:pt-12">{renderContent()}</div>
      </main>
    </div>
  );
};

export default App;
