
import React, { useState, useEffect } from 'react';
import { View, Group, UserStats, ReminderSettings, Mantra, UserProfile } from './types';
import StatsDashboard from './components/StatsDashboard';
import MantraCounter from './components/MantraCounter';
import GroupAdmin from './components/GroupAdmin';
import SubscriptionModal from './components/SubscriptionModal';
import AuthScreen from './components/AuthScreen';
import { authService } from './services/auth';
import { LayoutDashboard, Flower2, Users, Settings, X, Star, LogOut, Moon, Sun, Bell, Check, Clock } from 'lucide-react';

// Navigation Button Component for Sidebar
// UPDATED: Adjusted flex classes for responsive behavior. 
// Mobile: Column (Icon top, text bottom)
// Tablet (md): Column (Icon only, text hidden to fit w-20)
// Desktop (lg): Row (Icon left, text right)
const NavButton = ({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) => (
  <button 
    onClick={onClick}
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

  // Personal Mantras Library (Expanded)
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
    streakDays: 1,
    lastChantedDate: new Date().toDateString(),
    mantraBreakdown: [], 
    isPremium: false
  });

  // --- Initialization & Data Persistence ---

  // Theme Effect
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('om_theme', theme);
  }, [theme]);
  
  // Check for existing session
  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    setIsAuthChecking(false);
  }, []);

  // Load User Data when currentUser changes
  useEffect(() => {
    if (currentUser) {
      // 1. Load Global Groups (Shared across "backend")
      const savedGroups = localStorage.getItem('om_groups');
      if (savedGroups) {
        setGroups(JSON.parse(savedGroups));
      } else {
        // Default groups if none exist
         const demoGroup: Group = {
            id: 'demo-123',
            name: 'Global Peace Circle',
            description: 'Chanting for universal harmony',
            mantra: {
                id: 'm-1',
                text: 'Lokah Samastah Sukhino Bhavantu',
                meaning: 'May all beings everywhere be happy and free...',
                targetCount: 108
            },
            adminId: 'system',
            members: [
                { id: 'u2', name: 'Alice', count: 1200, lastActive: new Date().toISOString() },
                { id: 'u3', name: 'Bob', count: 890, lastActive: new Date().toISOString() }
            ],
            totalGroupCount: 2090,
            announcements: [
                { id: 'a1', text: 'Welcome to the Global Peace Circle! Let us chant for harmony.', date: new Date().toISOString(), authorName: 'System' }
            ],
            isPremium: true // System group is premium
        };
        // Add current user to demo group if not there
        if (!demoGroup.members.find(m => m.id === currentUser.id)) {
            demoGroup.members.push({ id: currentUser.id, name: currentUser.name, count: 0, lastActive: new Date().toISOString() });
        }
        setGroups([demoGroup]);
      }

      // 2. Load Personal Stats
      const savedStats = localStorage.getItem(`om_stats_${currentUser.id}`);
      if (savedStats) {
        setUserStats(JSON.parse(savedStats));
      } else {
        // Reset to default for new user
        setUserStats({
            totalChants: 0,
            streakDays: 1,
            lastChantedDate: new Date().toDateString(),
            mantraBreakdown: [],
            isPremium: false
        });
      }

      // 3. Load Reminder Settings
      const savedReminder = localStorage.getItem(`om_reminder_${currentUser.id}`);
      if(savedReminder) {
        const parsed = JSON.parse(savedReminder);
        setReminder(parsed);
        setTempReminderTime(parsed.time);
      }
    }
  }, [currentUser]);

  // Save Stats whenever they change
  useEffect(() => {
    if (currentUser) {
        localStorage.setItem(`om_stats_${currentUser.id}`, JSON.stringify(userStats));
    }
  }, [userStats, currentUser]);

  // Save Groups whenever they change
  useEffect(() => {
    if (groups.length > 0) {
        localStorage.setItem('om_groups', JSON.stringify(groups));
    }
  }, [groups]);

  // --- Handlers ---

  const handleCreateGroup = (newGroup: Group) => {
    // Attach creator's premium status to the group
    const groupWithStatus = {
        ...newGroup,
        isPremium: userStats.isPremium
    };
    setGroups(prev => [...prev, groupWithStatus]);
  };

  const handleJoinGroup = (groupId: string) => {
    if (!currentUser) return;
    const existing = groups.find(g => g.id === groupId);
    
    if (existing) {
        // Add user to existing group if not present
        if (existing.members.some(m => m.id === currentUser.id)) {
             alert("You are already in this group.");
             return;
        }

        // Check 25 member limit for free groups
        if (!existing.isPremium && existing.members.length >= 25) {
             alert("This circle has reached its 25 member limit. The creator must upgrade to Premium to accept more members.");
             return;
        }

        setGroups(prev => prev.map(g => {
            if (g.id === groupId) {
                return {
                    ...g,
                    members: [...g.members, { id: currentUser.id, name: currentUser.name, count: 0, lastActive: new Date().toISOString() }]
                };
            }
            return g;
        }));
        alert(`Joined group: ${existing.name}`);
    } else {
        alert("Group not found. Please check the ID.");
    }
  };

  const handleAddAnnouncement = (groupId: string, text: string) => {
    if(!currentUser) return;
    setGroups(prev => prev.map(g => {
        if(g.id === groupId) {
            return {
                ...g,
                announcements: [
                    { id: crypto.randomUUID(), text, date: new Date().toISOString(), authorName: currentUser.name },
                    ...(g.announcements || [])
                ]
            }
        }
        return g;
    }));
  };

  const handleSelectGroupForPractice = (group: Group) => {
    setActiveGroup(group);
    setCurrentView(View.COUNTER);
  };

  const handleAddPersonalMantra = (text: string, target: number) => {
    const newMantra: Mantra = {
        id: `pm-${Date.now()}`,
        text,
        targetCount: target
    };
    setPersonalMantras([...personalMantras, newMantra]);
  };

  const handleUpdateCount = (increment: number, groupId: string | null, mantraText: string) => {
    if (!currentUser) return;

    // Update User Total and Breakdown
    setUserStats(prev => {
        const existingMantraStats = prev.mantraBreakdown.find(m => m.mantraText === mantraText);
        let newBreakdown = [...prev.mantraBreakdown];

        if (existingMantraStats) {
            newBreakdown = newBreakdown.map(m => 
                m.mantraText === mantraText ? { ...m, totalCount: m.totalCount + increment } : m
            );
        } else {
            newBreakdown.push({ mantraText, totalCount: increment });
        }

        return {
            ...prev,
            totalChants: prev.totalChants + increment,
            mantraBreakdown: newBreakdown
        };
    });

    // Update Group Stats if applicable
    if (groupId) {
        setGroups(prevGroups => prevGroups.map(g => {
            if (g.id === groupId) {
                const updatedMembers = g.members.map(m => {
                    if (m.id === currentUser.id) {
                        const now = new Date().toISOString();
                        // Add to history (prepend new entry)
                        const newHistoryEntry = { date: now, count: increment };
                        // Ensure history exists
                        const currentHistory = m.history || [];
                        const updatedHistory = [newHistoryEntry, ...currentHistory];
                        
                        return { 
                          ...m, 
                          count: m.count + increment, 
                          lastActive: now,
                          history: updatedHistory
                        };
                    }
                    return m;
                });
                return {
                    ...g,
                    totalGroupCount: g.totalGroupCount + increment,
                    members: updatedMembers
                };
            }
            return g;
        }));
    }
  };

  const handleSetReminder = () => {
    if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                const newSettings = { enabled: true, time: tempReminderTime };
                setReminder(newSettings);
                if(currentUser) {
                    localStorage.setItem(`om_reminder_${currentUser.id}`, JSON.stringify(newSettings));
                }
                alert(`Reminder set for ${tempReminderTime} daily.`);
            } else {
                alert("Please enable notifications in your browser to set reminders.");
            }
        });
    } else {
        alert("Notifications are not supported in this browser.");
    }
  };

  const handleDisableReminder = () => {
      const newSettings = { enabled: false, time: tempReminderTime };
      setReminder(newSettings);
      if(currentUser) {
        localStorage.setItem(`om_reminder_${currentUser.id}`, JSON.stringify(newSettings));
      }
  };

  const handleUpgrade = () => {
    setUserStats(prev => ({ ...prev, isPremium: true }));
    setShowSubscriptionModal(false);
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setShowSettings(false);
    setCurrentView(View.DASHBOARD);
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // --- Conditional Rendering ---

  if (isAuthChecking) return <div className="h-screen flex items-center justify-center bg-stone-50 text-stone-400 font-serif dark:bg-stone-950 dark:text-stone-500">Loading Sacred Space...</div>;

  if (!currentUser) {
    return <AuthScreen onAuthSuccess={setCurrentUser} />;
  }

  const renderContent = () => {
    switch (currentView) {
      case View.DASHBOARD:
        return <StatsDashboard userStats={userStats} groups={groups} currentUser={currentUser} />;
      case View.GROUPS:
      case View.CREATE_GROUP:
        return (
          <GroupAdmin 
            groups={groups} 
            onCreateGroup={handleCreateGroup} 
            onJoinGroup={handleJoinGroup}
            onSelectGroup={handleSelectGroupForPractice}
            isPremium={userStats.isPremium}
            onTriggerUpgrade={() => setShowSubscriptionModal(true)}
            currentUserId={currentUser.id}
            currentUserName={currentUser.name}
            onAddAnnouncement={handleAddAnnouncement}
          />
        );
      case View.COUNTER:
        return (
          <MantraCounter 
            activeGroup={activeGroup} 
            personalMantras={personalMantras}
            onUpdateCount={handleUpdateCount} 
            onAddPersonalMantra={handleAddPersonalMantra}
          />
        );
      default:
        return <StatsDashboard userStats={userStats} groups={groups} currentUser={currentUser} />;
    }
  };

  return (
    <div className="min-h-screen bg-sacred-pattern text-stone-900 dark:text-stone-100 flex flex-col md:flex-row overflow-hidden font-sans relative transition-colors duration-300">
      
      <SubscriptionModal 
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        onUpgrade={handleUpgrade}
      />

      {/* Settings Modal Overlay */}
      {showSettings && (
        <div className="fixed inset-0 bg-mystic-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-stone-900 rounded-2xl w-full max-w-sm shadow-2xl p-6 relative border border-stone-100 dark:border-stone-800">
             <button 
                onClick={() => setShowSettings(false)}
                className="absolute top-4 right-4 text-stone-400 hover:text-stone-800 dark:hover:text-stone-200"
             >
                <X size={20} />
             </button>
             <h3 className="text-xl font-serif font-bold text-stone-800 dark:text-white mb-6 flex items-center gap-2 text-display">
                <Settings size={20} /> Settings
             </h3>

             <div className="space-y-6">
                <div className="flex items-center gap-3 p-3 bg-stone-50 dark:bg-stone-800 rounded-xl">
                   <div className="w-10 h-10 bg-gradient-to-br from-mystic-200 to-mystic-300 rounded-full flex items-center justify-center font-bold text-mystic-800 font-serif">
                      {currentUser.name.charAt(0)}
                   </div>
                   <div>
                      <p className="font-bold text-stone-800 dark:text-stone-100 font-serif">{currentUser.name}</p>
                      <p className="text-xs text-stone-500 dark:text-stone-400">{currentUser.email}</p>
                   </div>
                </div>

                <div className="bg-stone-50 dark:bg-stone-800 p-4 rounded-xl border border-stone-100 dark:border-stone-700 flex items-center justify-between">
                    <div>
                        <p className="font-bold text-stone-800 dark:text-stone-100 font-serif">Plan Status</p>
                        <p className="text-xs text-stone-500 dark:text-stone-400">{userStats.isPremium ? 'Premium Member' : 'Free Tier'}</p>
                    </div>
                    {!userStats.isPremium && (
                        <button onClick={() => { setShowSettings(false); setShowSubscriptionModal(true); }} className="text-xs bg-saffron-500 text-white px-3 py-1 rounded-full font-bold shadow-lg shadow-saffron-200">
                            Upgrade
                        </button>
                    )}
                    {userStats.isPremium && <Star size={16} className="text-saffron-500" fill="currentColor"/>}
                </div>

                {/* Reminder Section - Enhanced */}
                <div className="bg-stone-50 dark:bg-stone-800 p-4 rounded-xl border border-stone-100 dark:border-stone-700">
                    <div className="flex items-center justify-between mb-3">
                         <div className="flex items-center gap-2">
                            <Bell size={18} className="text-stone-600 dark:text-stone-300"/>
                            <p className="font-medium text-stone-800 dark:text-stone-200">Daily Reminder</p>
                         </div>
                         {reminder.enabled && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">ON</span>}
                    </div>
                    
                    <div className="flex flex-col gap-3">
                        <div className="relative flex-1">
                             <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"/>
                             <input 
                                type="time"
                                value={tempReminderTime}
                                onChange={(e) => setTempReminderTime(e.target.value)}
                                className="w-full pl-9 px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-900 text-stone-900 dark:text-white text-sm font-bold focus:ring-2 focus:ring-saffron-400 focus:outline-none"
                            />
                        </div>
                        {reminder.enabled && reminder.time === tempReminderTime ? (
                             <button 
                                onClick={handleDisableReminder}
                                className="bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300 px-4 py-2 rounded-lg text-sm font-bold hover:bg-stone-300 dark:hover:bg-stone-600 transition-colors w-full"
                             >
                                Disable Reminder
                             </button>
                        ) : (
                             <button 
                                onClick={handleSetReminder}
                                className="bg-saffron-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-saffron-600 shadow-md shadow-saffron-200 dark:shadow-none flex items-center justify-center gap-2 transition-colors w-full"
                             >
                                Set Reminder <Check size={14} />
                             </button>
                        )}
                    </div>
                    <p className="text-[10px] text-stone-400 mt-2 text-center">You will receive a browser notification at this time.</p>
                </div>

                <div className="flex items-center justify-between px-2">
                    <div>
                        <p className="font-medium text-stone-800 dark:text-stone-200">Dark Mode</p>
                        <p className="text-xs text-stone-500 dark:text-stone-400">Toggle visual theme.</p>
                    </div>
                    <button 
                      onClick={toggleTheme}
                      className={`w-12 h-6 rounded-full transition-colors relative ${theme === 'dark' ? 'bg-mystic-600' : 'bg-stone-200'}`}
                    >
                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all flex items-center justify-center ${theme === 'dark' ? 'left-7' : 'left-1'}`}>
                            {theme === 'dark' ? <Moon size={10} className="text-mystic-600"/> : <Sun size={10} className="text-orange-400"/>}
                        </div>
                    </button>
                </div>

                <button 
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-3 rounded-xl transition-colors font-medium"
                >
                    <LogOut size={18} /> Log Out
                </button>
                
                <div className="pt-4 border-t border-stone-100 dark:border-stone-700">
                    <p className="text-xs text-center text-stone-400 font-serif">OmCounter v1.3</p>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Sidebar Navigation */}
      {/* Responsive adjustments: 
          - md:w-20 (tablet): Thin sidebar, hidden labels
          - lg:w-64 (desktop): Wide sidebar, visible labels
      */}
      <nav className="bg-white dark:bg-stone-900 md:w-20 lg:w-64 md:border-r border-t md:border-t-0 border-stone-200 dark:border-stone-800 flex md:flex-col justify-between z-10 fixed bottom-0 w-full md:relative md:h-screen pb-safe shadow-[0_0_20px_rgba(0,0,0,0.03)] transition-colors duration-300">
        
        <div className="flex md:flex-col justify-around md:justify-start w-full md:space-y-2 md:p-4">
          
          {/* Logo Area - Desktop */}
          <div className="hidden md:flex items-center justify-center lg:justify-start lg:gap-3 px-0 lg:px-4 py-6 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-saffron-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200 dark:shadow-none text-white font-display font-bold text-xl flex-shrink-0">
              OM
            </div>
            <span className="font-display font-bold text-xl text-stone-800 dark:text-stone-100 tracking-tight hidden lg:block">OmCounter</span>
          </div>

          {/* Nav Items */}
          <NavButton 
             active={currentView === View.DASHBOARD} 
             onClick={() => setCurrentView(View.DASHBOARD)}
             icon={<LayoutDashboard size={24} />}
             label="Dashboard"
          />
          <NavButton 
             active={currentView === View.GROUPS || currentView === View.CREATE_GROUP} 
             onClick={() => setCurrentView(View.GROUPS)}
             icon={<Users size={24} />}
             label="Sanghas"
          />
           <NavButton 
             active={currentView === View.COUNTER} 
             onClick={() => setCurrentView(View.COUNTER)}
             icon={<Flower2 size={24} />}
             label="Practice"
          />
           <NavButton 
             active={showSettings} 
             onClick={() => setShowSettings(true)}
             icon={<Settings size={24} />}
             label="Settings"
          />
        </div>

        {/* Upgrade Widget - Only Visible on Large Screens to prevent cut-off on tablets/mobile */}
        {!userStats.isPremium && (
            <div className="hidden lg:block p-4 m-4 rounded-2xl bg-gradient-to-br from-saffron-50 to-orange-50 dark:from-stone-800 dark:to-stone-800 border border-saffron-100 dark:border-stone-700 relative overflow-hidden group cursor-pointer" onClick={() => setShowSubscriptionModal(true)}>
                <div className="absolute -right-2 -top-2 w-12 h-12 bg-saffron-100 dark:bg-stone-700 rounded-full opacity-50 group-hover:scale-150 transition-transform"></div>
                <h4 className="font-bold text-stone-800 dark:text-stone-100 font-serif relative z-10 mb-1">Go Premium</h4>
                <p className="text-xs text-stone-500 dark:text-stone-400 relative z-10 mb-3">Unlock stats & unlimited groups.</p>
                <button className="text-xs font-bold bg-saffron-500 text-white px-3 py-2 rounded-lg w-full shadow-md shadow-saffron-200 dark:shadow-none hover:bg-saffron-600 transition-colors relative z-10">Upgrade Now</button>
            </div>
        )}
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 h-screen overflow-y-auto overflow-x-hidden relative pb-24 md:pb-0">
         <div className="max-w-5xl mx-auto p-4 md:p-8 pt-8 md:pt-12">
            {renderContent()}
         </div>
      </main>
    </div>
  );
};

export default App;
