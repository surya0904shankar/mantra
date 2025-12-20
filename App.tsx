
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { View, Group, UserStats, ReminderSettings, Mantra, UserProfile } from './types';
import SacredLogo from './components/SacredLogo';

// Lazy load components to improve initial load performance
const StatsDashboard = lazy(() => import('./components/StatsDashboard'));
const MantraCounter = lazy(() => import('./components/MantraCounter'));
const GroupAdmin = lazy(() => import('./components/GroupAdmin'));
const SubscriptionModal = lazy(() => import('./components/SubscriptionModal'));
const AuthScreen = lazy(() => import('./components/AuthScreen'));

import { authService } from './services/auth';
import { supabase } from './lib/supabaseClient';
import { LayoutDashboard, Flower2, Users, Settings, X, Star, LogOut, Moon, Sun, Bell, Check, Clock, Loader2 } from 'lucide-react';

// Loading Fallback Component
const PageLoader = () => (
  <div className="flex h-full w-full items-center justify-center min-h-[50vh] animate-in fade-in">
    <Loader2 className="w-8 h-8 text-saffron-500 animate-spin" />
  </div>
);

// Navigation Button Component for Sidebar
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
  // --- Auth State ---
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // --- App State ---
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [groups, setGroups] = useState<Group[]>([]);
  const [activeGroup, setActiveGroup] = useState<Group | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  
  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('om_theme') as 'light' | 'dark') || 'light';
  });

  // Reminder Settings
  const [reminder, setReminder] = useState<ReminderSettings>({
    enabled: false,
    time: '07:00'
  });
  const [tempReminderTime, setTempReminderTime] = useState('07:00');

  // Personal Mantras Library
  const [personalMantras, setPersonalMantras] = useState<Mantra[]>([
    { id: 'pm-1', text: 'Om Namah Shivaya', targetCount: 108, meaning: 'I bow to Shiva, the supreme reality.' },
    { id: 'pm-2', text: 'Om Mani Padme Hum', targetCount: 108, meaning: 'The jewel is in the lotus.' },
    { id: 'pm-3', text: 'Gayatri Mantra', targetCount: 108, meaning: 'We meditate on the glory of the Creator.' },
    { id: 'pm-4', text: 'Om Gam Ganapataye Namaha', targetCount: 108, meaning: 'Salutations to Ganesha, remover of obstacles.' },
    { id: 'pm-5', text: 'Maha Mrityunjaya Mantra', targetCount: 108, meaning: 'Victory over spiritual death.' },
    { id: 'pm-6', text: 'Hare Krishna Hare Rama', targetCount: 108, meaning: 'Salutations to the energy of the Lord.' },
    { id: 'pm-7', text: 'Om Namo Narayanaya', targetCount: 108, meaning: 'I bow to Narayana, the sustainer of life.' },
    { id: 'pm-8', text: 'Om Shanti Shanti Shanti', targetCount: 21, meaning: 'Peace in body, speech, and mind.' },
    { id: 'pm-9', text: 'Lokah Samastah Sukhino Bhavantu', targetCount: 108, meaning: 'May all beings everywhere be happy and free.' },
    { id: 'pm-10', text: 'Om Dum Durgaye Namaha', targetCount: 108, meaning: 'Salutations to Durga, the protective mother.' },
    { id: 'pm-11', text: 'So Hum', targetCount: 108, meaning: 'I am That.' },
  ]);

  // User Stats
  const [userStats, setUserStats] = useState<UserStats>({
    totalChants: 0,
    streakDays: 0,
    lastChantedDate: null,
    mantraBreakdown: [], 
    isPremium: false
  });

  // Theme Effect
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('om_theme', theme);
  }, [theme]);

  // Reminder Logic Loop
  useEffect(() => {
    let lastTriggeredTime = '';
    const checkReminder = () => {
      if (!reminder.enabled || !reminder.time) return;
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const currentTime = `${hours}:${minutes}`;

      if (currentTime === reminder.time && currentTime !== lastTriggeredTime) {
        lastTriggeredTime = currentTime;
        if (Notification.permission === 'granted') {
           try {
             new Notification("OmCounter Reminder", {
                body: `It is ${currentTime}. Time for your spiritual practice.`,
                icon: '/vite.svg'
             });
           } catch (e) {
             console.error("Notification failed", e);
           }
        }
      }
    };
    const intervalId = setInterval(checkReminder, 1000);
    return () => clearInterval(intervalId);
  }, [reminder]);
  
  // Check session
  useEffect(() => {
    const initAuth = async () => {
        try {
            const user = await authService.getCurrentUser();
            setCurrentUser(user);
        } catch (error) {
            console.error("Auth initialization error:", error);
        } finally {
            setIsAuthChecking(false);
        }
    };
    initAuth();
  }, []);

  // Sync Data
  useEffect(() => {
    if (currentUser) {
      const savedReminder = localStorage.getItem(`om_reminder_${currentUser.id}`);
      if(savedReminder) {
        const parsed = JSON.parse(savedReminder);
        setReminder(parsed);
        setTempReminderTime(parsed.time);
      }

      const loadUserStats = async () => {
        try {
            let { data: profile } = await supabase.from('profiles').select('*').eq('id', currentUser.id).single();
            if (!profile) {
                const { data: newProfile } = await supabase.from('profiles').insert({
                    id: currentUser.id,
                    name: currentUser.name,
                    email: currentUser.email,
                    total_global_chants: 0,
                    is_premium: false,
                    mantra_stats: [],
                    streak_days: 0,
                    last_chanted_date: null
                }).select().single();
                profile = newProfile;
            }
            if (profile) {
                let breakdown = typeof profile.mantra_stats === 'string' ? JSON.parse(profile.mantra_stats) : profile.mantra_stats || [];
                const calculatedTotal = breakdown.reduce((acc: number, curr: any) => acc + (curr.totalCount || 0), 0);
                setUserStats(prev => ({
                    ...prev,
                    isPremium: profile.is_premium,
                    totalChants: calculatedTotal, 
                    mantraBreakdown: breakdown,
                    streakDays: profile.streak_days || 0,
                    lastChantedDate: profile.last_chanted_date || null
                }));
            }
        } catch (err) { console.error("Error syncing stats:", err); }
      };
      loadUserStats();

      const loadGroups = async () => {
        try {
            const { data: myMemberships } = await supabase.from('group_members').select('group_id').eq('user_id', currentUser.id);
            if (!myMemberships?.length) { setGroups([]); return; }
            const groupIds = myMemberships.map(m => m.group_id);
            const { data: groupsData } = await supabase.from('groups').select('*').in('id', groupIds);
            const { data: allMembers } = await supabase.from('group_members').select('*, profiles(name)').in('group_id', groupIds);
            const mappedGroups: Group[] = groupsData?.map(g => ({
                id: g.id,
                name: g.name,
                description: g.description,
                mantra: { id: g.id + '_mantra', text: g.mantra_text, meaning: g.mantra_meaning, targetCount: g.mantra_target || 108 },
                adminId: g.admin_id,
                totalGroupCount: g.total_group_chants || 0,
                isPremium: g.is_premium,
                announcements: [], 
                members: allMembers?.filter(m => m.group_id === g.id).map(m => ({
                    id: m.user_id,
                    name: m.profiles?.name || 'Meditator',
                    count: m.count,
                    lastActive: m.last_active || new Date().toISOString(),
                    history: m.history ? (typeof m.history === 'string' ? JSON.parse(m.history) : m.history) : []
                })) || []
            })) || [];
            setGroups(mappedGroups);
        } catch (err) { console.error("Error loading groups:", err); }
      };
      loadGroups();
    }
  }, [currentUser]);

  const handleCreateGroup = async (newGroup: Group) => {
    if (!currentUser) return;
    const groupWithStatus = { ...newGroup, isPremium: userStats.isPremium };
    setGroups(prev => [...prev, groupWithStatus]);
    try {
        await supabase.from('groups').insert({
            id: newGroup.id, name: newGroup.name, description: newGroup.description,
            mantra_text: newGroup.mantra.text, mantra_meaning: newGroup.mantra.meaning,
            mantra_target: newGroup.mantra.targetCount, admin_id: currentUser.id,
            is_premium: userStats.isPremium, total_group_chants: 0
        });
        await supabase.from('group_members').insert({ group_id: newGroup.id, user_id: currentUser.id, count: 0, last_active: new Date().toISOString() });
    } catch (err) { console.error("Error creating group:", err); }
  };

  const handleJoinGroup = async (groupId: string) => {
    if (!currentUser) return;
    try {
        const { data: groupData } = await supabase.from('groups').select('*').eq('id', groupId).maybeSingle();
        if (!groupData) { alert("Group not found."); return; }
        const { data: existingMember } = await supabase.from('group_members').select('*').eq('group_id', groupId).eq('user_id', currentUser.id).maybeSingle();
        if (existingMember) { alert("Already in this group."); return; }
        await supabase.from('group_members').insert({ group_id: groupId, user_id: currentUser.id, count: 0, last_active: new Date().toISOString() });
        window.location.reload(); 
    } catch (err) { console.error("Error joining group:", err); }
  };

  const handleAddAnnouncement = (groupId: string, text: string) => {
    if(!currentUser) return;
    setGroups(prev => prev.map(g => g.id === groupId ? { ...g, announcements: [{ id: crypto.randomUUID(), text, date: new Date().toISOString(), authorName: currentUser.name }, ...(g.announcements || [])] } : g));
  };

  const handleSelectGroupForPractice = (group: Group) => { setActiveGroup(group); setCurrentView(View.COUNTER); };
  const handleAddPersonalMantra = (text: string, target: number) => { const newMantra: Mantra = { id: `pm-${Date.now()}`, text, targetCount: target }; setPersonalMantras([...personalMantras, newMantra]); };

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleUpdateCount = async (increment: number, groupId: string | null, mantraText: string) => {
    if (!currentUser) return;
    const today = new Date();
    const todayStr = formatDate(today);
    const nowISO = today.toISOString();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = formatDate(yesterday);

    let updatedStreak = userStats.streakDays;
    let updatedLastDate = userStats.lastChantedDate;
    if (updatedLastDate !== todayStr) {
        updatedStreak = updatedLastDate === yesterdayStr ? updatedStreak + 1 : 1;
    } else if (updatedStreak === 0) { updatedStreak = 1; }
    updatedLastDate = todayStr;

    let updatedBreakdown = [...userStats.mantraBreakdown];
    const existing = updatedBreakdown.find(m => m.mantraText === mantraText);
    if (existing) {
        updatedBreakdown = updatedBreakdown.map(m => m.mantraText === mantraText ? { ...m, totalCount: m.totalCount + increment } : m);
    } else {
        updatedBreakdown.push({ mantraText, totalCount: increment });
    }
    const newTotal = updatedBreakdown.reduce((acc, curr) => acc + curr.totalCount, 0);

    setUserStats(prev => ({ ...prev, totalChants: newTotal, streakDays: updatedStreak, lastChantedDate: updatedLastDate, mantraBreakdown: updatedBreakdown }));

    try {
        await supabase.from('profiles').update({ total_global_chants: newTotal, mantra_stats: updatedBreakdown, streak_days: updatedStreak, last_chanted_date: updatedLastDate }).eq('id', currentUser.id);
    } catch(err) { console.error("Sync error:", err); }

    if (groupId) {
        setGroups(prev => prev.map(g => {
            if (g.id === groupId) {
                const updatedMembers = g.members.map(m => m.id === currentUser.id ? { ...m, count: m.count + increment, lastActive: nowISO, history: [{ date: nowISO, count: increment }, ...(m.history || [])] } : m);
                return { ...g, totalGroupCount: g.totalGroupCount + increment, members: updatedMembers };
            }
            return g;
        }));
        try {
            const { data: memberData } = await supabase.from('group_members').select('count, history').eq('group_id', groupId).eq('user_id', currentUser.id).single();
            if (memberData) {
                const oldHistory = memberData.history ? (typeof memberData.history === 'string' ? JSON.parse(memberData.history) : memberData.history) : [];
                await supabase.from('group_members').update({ count: (memberData.count || 0) + increment, history: [{ date: nowISO, count: increment }, ...oldHistory], last_active: nowISO }).eq('group_id', groupId).eq('user_id', currentUser.id);
                const { data: gData } = await supabase.from('groups').select('total_group_chants').eq('id', groupId).single();
                if (gData) await supabase.from('groups').update({ total_group_chants: gData.total_group_chants + increment }).eq('id', groupId);
            }
        } catch (err) { console.error("Group sync error:", err); }
    }
  };

  const handleSetReminder = () => {
    if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                const newSettings = { enabled: true, time: tempReminderTime };
                setReminder(newSettings);
                if(currentUser) localStorage.setItem(`om_reminder_${currentUser.id}`, JSON.stringify(newSettings));
            } else { alert("Enable notifications to set reminders."); }
        });
    }
  };
  const handleDisableReminder = () => { const newSettings = { enabled: false, time: tempReminderTime }; setReminder(newSettings); if(currentUser) localStorage.setItem(`om_reminder_${currentUser.id}`, JSON.stringify(newSettings)); };
  const handleUpgrade = () => { setUserStats(prev => ({ ...prev, isPremium: true })); setShowSubscriptionModal(false); };
  const handleLogout = async () => { await authService.logout(); setCurrentUser(null); setShowSettings(false); setCurrentView(View.DASHBOARD); };
  const toggleTheme = () => { setTheme(prev => prev === 'light' ? 'dark' : 'light'); };

  if (isAuthChecking) return <div className="h-screen flex items-center justify-center bg-stone-50 text-stone-400 font-serif dark:bg-stone-950 dark:text-stone-500">
    <div className="flex flex-col items-center gap-4">
      <SacredLogo size="xl" />
      <p className="font-serif">Loading Sacred Space...</p>
    </div>
  </div>;

  if (!currentUser) return <Suspense fallback={<PageLoader />}><AuthScreen onAuthSuccess={setCurrentUser} /></Suspense>;

  const renderContent = () => (
    <Suspense fallback={<PageLoader />}>
      {currentView === View.DASHBOARD && <StatsDashboard userStats={userStats} groups={groups} currentUser={currentUser} onUpgradeClick={() => setShowSubscriptionModal(true)} />}
      {(currentView === View.GROUPS || currentView === View.CREATE_GROUP) && <GroupAdmin groups={groups} onCreateGroup={handleCreateGroup} onJoinGroup={handleJoinGroup} onSelectGroup={handleSelectGroupForPractice} isPremium={userStats.isPremium} onTriggerUpgrade={() => setShowSubscriptionModal(true)} currentUserId={currentUser.id} currentUserName={currentUser.name} onAddAnnouncement={handleAddAnnouncement} />}
      {currentView === View.COUNTER && <MantraCounter activeGroup={activeGroup} personalMantras={personalMantras} onUpdateCount={handleUpdateCount} onAddPersonalMantra={handleAddPersonalMantra} />}
    </Suspense>
  );

  return (
    <div className="min-h-screen bg-sacred-pattern text-stone-900 dark:text-stone-100 flex flex-col md:flex-row overflow-hidden font-sans relative transition-colors duration-300">
      <Suspense fallback={null}><SubscriptionModal isOpen={showSubscriptionModal} onClose={() => setShowSubscriptionModal(false)} onUpgrade={handleUpgrade} /></Suspense>
      {showSettings && (
        <div className="fixed inset-0 bg-mystic-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-stone-900 rounded-2xl w-full max-w-sm shadow-2xl p-6 relative border border-stone-100 dark:border-stone-800">
             <button onClick={() => setShowSettings(false)} className="absolute top-4 right-4 text-stone-400 hover:text-stone-800 dark:hover:text-stone-200"><X size={20} /></button>
             <h3 className="text-xl font-serif font-bold text-stone-800 dark:text-white mb-6 flex items-center gap-2 text-display"><Settings size={20} /> Settings</h3>
             <div className="space-y-6">
                <div className="flex items-center gap-3 p-3 bg-stone-50 dark:bg-stone-800 rounded-xl">
                   <div className="w-10 h-10 bg-gradient-to-br from-mystic-200 to-mystic-300 rounded-full flex items-center justify-center font-bold text-mystic-800 font-serif">{currentUser.name.charAt(0)}</div>
                   <div><p className="font-bold text-stone-800 dark:text-stone-100 font-serif">{currentUser.name}</p><p className="text-xs text-stone-500 dark:text-stone-400">{currentUser.email}</p></div>
                </div>
                <div className="bg-stone-50 dark:bg-stone-800 p-4 rounded-xl border border-stone-100 dark:border-stone-700 flex items-center justify-between">
                    <div><p className="font-bold text-stone-800 dark:text-stone-100 font-serif">Plan Status</p><p className="text-xs text-stone-500 dark:text-stone-400">{userStats.isPremium ? 'Premium Member' : 'Free Tier'}</p></div>
                    {!userStats.isPremium && <button onClick={() => { setShowSettings(false); setShowSubscriptionModal(true); }} className="text-xs bg-saffron-500 text-white px-3 py-1 rounded-full font-bold shadow-lg shadow-saffron-200">Upgrade</button>}
                    {userStats.isPremium && <Star size={16} className="text-saffron-500" fill="currentColor"/>}
                </div>
                <div className="bg-stone-50 dark:bg-stone-800 p-4 rounded-xl border border-stone-100 dark:border-stone-700">
                    <div className="flex items-center justify-between mb-3"><div className="flex items-center gap-2"><Bell size={18} className="text-stone-600 dark:text-stone-300"/><p className="font-medium text-stone-800 dark:text-stone-200">Daily Reminder</p></div>{reminder.enabled && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">ON</span>}</div>
                    <div className="flex flex-col gap-3">
                        <div className="relative flex-1"><Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"/><input type="time" value={tempReminderTime} onChange={(e) => setTempReminderTime(e.target.value)} className="w-full pl-9 px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-stone-900 dark:text-white text-sm font-bold focus:ring-2 focus:ring-saffron-400 focus:outline-none"/></div>
                        {reminder.enabled && reminder.time === tempReminderTime ? <button onClick={handleDisableReminder} className="bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300 px-4 py-2 rounded-lg text-sm font-bold hover:bg-stone-300 dark:hover:bg-stone-600 transition-colors w-full">Disable Reminder</button> : <button onClick={handleSetReminder} className="bg-saffron-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-saffron-600 shadow-md shadow-saffron-200 dark:shadow-none flex items-center justify-center gap-2 transition-colors w-full">Set Reminder <Check size={14} /></button>}
                    </div>
                </div>
                <div className="flex items-center justify-between px-2"><div><p className="font-medium text-stone-800 dark:text-stone-200">Dark Mode</p></div><button onClick={toggleTheme} className={`w-12 h-6 rounded-full transition-colors relative ${theme === 'dark' ? 'bg-mystic-600' : 'bg-stone-200'}`}><div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all flex items-center justify-center ${theme === 'dark' ? 'left-7' : 'left-1'}`}>{theme === 'dark' ? <Moon size={10} className="text-mystic-600"/> : <Sun size={10} className="text-orange-400"/>}</div></button></div>
                <button onClick={handleLogout} className="w-full text-left flex items-center gap-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-3 rounded-xl transition-colors font-medium"><LogOut size={18} /> Log Out</button>
                <div className="pt-4 border-t border-stone-100 dark:border-stone-700"><p className="text-xs text-center text-stone-400 font-serif">OmCounter v1.5</p></div>
             </div>
          </div>
        </div>
      )}

      <nav className="bg-white dark:bg-stone-900 md:w-20 lg:w-64 md:border-r border-t md:border-t-0 border-stone-200 dark:border-stone-800 flex md:flex-col justify-between z-10 fixed bottom-0 w-full md:relative md:h-screen pb-safe shadow-[0_0_20px_rgba(0,0,0,0.03)] transition-colors duration-300">
        <div className="flex md:flex-col justify-around md:justify-start w-full md:space-y-2 md:p-4">
          <div className="hidden md:flex items-center justify-center lg:justify-start lg:gap-3 px-0 lg:px-4 py-6 mb-4">
            <SacredLogo size="md" />
            <span className="font-display font-bold text-xl text-stone-800 dark:text-stone-100 tracking-tight hidden lg:block">OmCounter</span>
          </div>
          <NavButton active={currentView === View.DASHBOARD} onClick={() => setCurrentView(View.DASHBOARD)} icon={<LayoutDashboard size={24} />} label="Dashboard" />
          <NavButton active={currentView === View.GROUPS} onClick={() => setCurrentView(View.GROUPS)} icon={<Users size={24} />} label="Sanghas" />
          <NavButton active={currentView === View.COUNTER} onClick={() => { setActiveGroup(null); setCurrentView(View.COUNTER); }} icon={<Flower2 size={24} />} label="Practice" />
          <NavButton active={showSettings} onClick={() => setShowSettings(true)} icon={<Settings size={24} />} label="Settings" />
        </div>
      </nav>

      <main className="flex-1 h-screen overflow-y-auto overflow-x-hidden relative pb-24 md:pb-0">
         <div className="max-w-5xl mx-auto p-4 md:p-8 pt-8 md:pt-12">{renderContent()}</div>
      </main>
    </div>
  );
};

export default App;
