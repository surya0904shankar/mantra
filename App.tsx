
import React, { useState, useEffect } from 'react';
import { View, Group, UserStats, ReminderSettings, Mantra, UserProfile, Announcement } from './types';
import StatsDashboard from './components/StatsDashboard';
import MantraCounter from './components/MantraCounter';
import GroupAdmin from './components/GroupAdmin';
import SubscriptionModal from './components/SubscriptionModal';
import AuthScreen from './components/AuthScreen';
import { authService } from './services/auth';
import { LayoutDashboard, Flower2, Users, Settings, Bell, X, Star, LogOut } from 'lucide-react';

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
  
  // Reminder Settings
  const [reminder, setReminder] = useState<ReminderSettings>({
    enabled: false,
    time: '07:00'
  });

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
                        return { ...m, count: m.count + increment, lastActive: new Date().toISOString() };
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

  const toggleReminder = () => {
    setReminder(prev => {
        const newState = { ...prev, enabled: !prev.enabled };
        if (newState.enabled) {
            if ('Notification' in window) {
                Notification.requestPermission();
            }
        }
        return newState;
    });
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

  // --- Conditional Rendering ---

  if (isAuthChecking) return <div className="h-screen flex items-center justify-center bg-stone-50 text-stone-400 font-serif">Loading Sacred Space...</div>;

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
    <div className="min-h-screen bg-sacred-pattern text-stone-900 flex flex-col md:flex-row overflow-hidden font-sans relative">
      
      <SubscriptionModal 
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        onUpgrade={handleUpgrade}
      />

      {/* Settings Modal Overlay */}
      {showSettings && (
        <div className="fixed inset-0 bg-mystic-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 relative border border-stone-100">
             <button 
                onClick={() => setShowSettings(false)}
                className="absolute top-4 right-4 text-stone-400 hover:text-stone-800"
             >
                <X size={20} />
             </button>
             <h3 className="text-xl font-serif font-bold text-stone-800 mb-6 flex items-center gap-2 text-display">
                <Settings size={20} /> Settings
             </h3>

             <div className="space-y-6">
                <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl">
                   <div className="w-10 h-10 bg-gradient-to-br from-mystic-200 to-mystic-300 rounded-full flex items-center justify-center font-bold text-mystic-800 font-serif">
                      {currentUser.name.charAt(0)}
                   </div>
                   <div>
                      <p className="font-bold text-stone-800 font-serif">{currentUser.name}</p>
                      <p className="text-xs text-stone-500">{currentUser.email}</p>
                   </div>
                </div>

                <div className="bg-stone-50 p-4 rounded-xl border border-stone-100 flex items-center justify-between">
                    <div>
                        <p className="font-bold text-stone-800 font-serif">Plan Status</p>
                        <p className="text-xs text-stone-500">{userStats.isPremium ? 'Premium Member' : 'Free Tier'}</p>
                    </div>
                    {!userStats.isPremium && (
                        <button onClick={() => { setShowSettings(false); setShowSubscriptionModal(true); }} className="text-xs bg-saffron-500 text-white px-3 py-1 rounded-full font-bold shadow-lg shadow-saffron-200">
                            Upgrade
                        </button>
                    )}
                    {userStats.isPremium && <Star size={16} className="text-saffron-500" fill="currentColor"/>}
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium text-stone-800">Daily Reminders</p>
                        <p className="text-xs text-stone-500">Get notified to chant.</p>
                    </div>
                    <button 
                      onClick={toggleReminder}
                      className={`w-12 h-6 rounded-full transition-colors relative ${reminder.enabled ? 'bg-saffron-500' : 'bg-stone-200'}`}
                    >
                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${reminder.enabled ? 'left-7' : 'left-1'}`}></div>
                    </button>
                </div>

                <button 
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-3 text-red-500 hover:bg-red-50 p-3 rounded-xl transition-colors font-medium"
                >
                    <LogOut size={18} /> Log Out
                </button>
                
                <div className="pt-4 border-t border-stone-100">
                    <p className="text-xs text-center text-stone-400 font-serif">OmCounter v1.3</p>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Sidebar Navigation */}
      <nav className="bg-white md:w-20 lg:w-64 md:border-r border-t md:border-t-0 border-stone-200 flex md:flex-col justify-between z-10 fixed bottom-0 w-full md:relative md:h-screen pb-safe shadow-[0_0_20px_rgba(0,0,0,0.03)]">
        
        <div className="flex md:flex-col justify-around md:justify-start w-full md:space-y-2 md:p-4">
          
          <div className="hidden md:flex items-center gap-3 px-4 py-6 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-saffron-400 to-lotus-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-saffron-200 font-display text-xl">
              Om
            </div>
            <span className="font-display font-bold text-xl text-stone-800 lg:block hidden">OmCounter</span>
          </div>

          <button 
            onClick={() => setCurrentView(View.DASHBOARD)}
            className={`flex flex-col md:flex-row items-center md:gap-3 p-3 md:px-4 md:py-3 rounded-xl transition-all duration-300 ${currentView === View.DASHBOARD ? 'text-mystic-800 bg-mystic-50 shadow-inner' : 'text-stone-500 hover:bg-stone-50 hover:text-stone-700'}`}
          >
            <LayoutDashboard size={24} strokeWidth={currentView === View.DASHBOARD ? 2.5 : 1.5} />
            <span className="text-[10px] md:text-sm font-medium mt-1 md:mt-0 lg:block hidden font-serif tracking-wide">Dashboard</span>
          </button>

          <button 
            onClick={() => { setActiveGroup(null); setCurrentView(View.COUNTER); }}
            className={`flex flex-col md:flex-row items-center md:gap-3 p-3 md:px-4 md:py-3 rounded-xl transition-all duration-300 ${currentView === View.COUNTER ? 'text-mystic-800 bg-mystic-50 shadow-inner' : 'text-stone-500 hover:bg-stone-50 hover:text-stone-700'}`}
          >
            <Flower2 size={24} strokeWidth={currentView === View.COUNTER ? 2.5 : 1.5} />
            <span className="text-[10px] md:text-sm font-medium mt-1 md:mt-0 lg:block hidden font-serif tracking-wide">Practice</span>
          </button>

          <button 
            onClick={() => setCurrentView(View.GROUPS)}
            className={`flex flex-col md:flex-row items-center md:gap-3 p-3 md:px-4 md:py-3 rounded-xl transition-all duration-300 ${currentView === View.GROUPS ? 'text-mystic-800 bg-mystic-50 shadow-inner' : 'text-stone-500 hover:bg-stone-50 hover:text-stone-700'}`}
          >
            <Users size={24} strokeWidth={currentView === View.GROUPS ? 2.5 : 1.5} />
            <span className="text-[10px] md:text-sm font-medium mt-1 md:mt-0 lg:block hidden font-serif tracking-wide">Sangha</span>
          </button>

           {/* Mobile Settings Button (In Bottom Nav Footer) */}
           <button 
            onClick={() => setShowSettings(true)}
            className="md:hidden flex flex-col items-center p-3 rounded-xl text-stone-500 hover:bg-stone-50 transition-colors"
          >
            <Settings size={24} strokeWidth={1.5} />
            <span className="text-[10px] font-medium mt-1 font-serif">Settings</span>
          </button>

        </div>

        {/* Desktop Settings (Sidebar Footer) */}
        <div className="hidden md:block p-4 border-t border-stone-100 space-y-2">
            {!userStats.isPremium && (
                <div className="mb-4 p-4 bg-gradient-to-br from-mystic-900 to-stone-900 rounded-xl text-center shadow-xl shadow-mystic-900/20 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                    <p className="text-white font-bold text-sm mb-2 font-serif relative z-10">Go Premium</p>
                    <p className="text-mystic-200 text-xs mb-3 relative z-10">Unlock downloads & notice board</p>
                    <button 
                        onClick={() => setShowSubscriptionModal(true)}
                        className="w-full bg-white text-stone-900 text-xs font-bold py-2 rounded-lg hover:bg-mystic-50 transition-colors relative z-10"
                    >
                        Upgrade
                    </button>
                </div>
            )}
            <button 
                onClick={() => setShowSettings(true)}
                className="w-full flex items-center gap-3 p-3 rounded-xl text-stone-500 hover:bg-stone-50 transition-colors"
            >
                <Settings size={20} strokeWidth={1.5} />
                <span className="text-sm font-medium lg:block hidden font-serif">Settings</span>
            </button>
        </div>

      </nav>

      {/* Main Content Area */}
      <main className="flex-1 h-screen overflow-y-auto no-scrollbar p-4 pb-24 md:p-8 lg:p-12 w-full">
        <div className="max-w-5xl mx-auto h-full">
           {renderContent()}
        </div>
      </main>

    </div>
  );
};

export default App;
