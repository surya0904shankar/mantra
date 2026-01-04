
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { UserStats, Group, UserProfile } from '../types';
import { Activity, Flame, Users, Sparkles, Loader2, Download, Lock } from 'lucide-react';
import { analyzeChantingHabits } from '../services/geminiService';

interface StatsDashboardProps {
  userStats: UserStats;
  groups: Group[];
  currentUser: UserProfile;
  onUpgradeClick: () => void;
}

const StatsDashboard: React.FC<StatsDashboardProps> = ({ userStats, groups, currentUser, onUpgradeClick }) => {
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  const firstName = currentUser?.name ? currentUser.name.split(' ')[0] : 'Meditator';

  // Strictly filter for sanghas the user is a member of
  const myGroups = groups.filter(g => currentUser?.id && g.members.some(m => m.id === currentUser.id));

  // Individual counts for each mantra
  const displaySadhanaData = userStats.mantraBreakdown.map(m => ({
    name: m.mantraText,
    count: m.totalCount
  }))
  .filter(d => d.count > 0)
  .sort((a, b) => b.count - a.count);

  // Group activity: Shows exactly what the user contributed to each group
  const groupData = myGroups.map(g => {
    const userInGroup = g.members.find(m => m.id === currentUser?.id);
    return {
      name: g.name,
      count: userInGroup ? userInGroup.count : 0,
    };
  }).filter(d => d.count >= 0); // Include groups with 0 counts to show presence

  const handleGetAdvice = async () => {
    setIsLoadingAi(true);
    const advice = await analyzeChantingHabits(userStats);
    setAiAdvice(advice);
    setIsLoadingAi(false);
  };

  const downloadCSV = () => {
    if (!userStats.isPremium) { onUpgradeClick(); return; }
    const now = new Date();
    const csvContent = "data:text/csv;charset=utf-8," 
        + "Mantra,Count\n" 
        + userStats.mantraBreakdown.map(m => `${m.mantraText},${m.totalCount}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "chants_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-600 drop-shadow-sm">
            Namaste, {firstName}
          </h2>
          <p className="text-stone-500 mt-1 font-serif">Accurate insights from your sacred database.</p>
        </div>
        <div className="flex gap-2">
             <button 
                onClick={downloadCSV}
                className={`px-4 py-2 rounded-xl shadow-sm flex items-center gap-2 text-sm font-medium transition-all border ${userStats.isPremium ? 'bg-white hover:bg-stone-50 text-stone-700 border-stone-200' : 'bg-stone-100 text-stone-500'}`}
             >
               {userStats.isPremium ? <Download size={16} /> : <Lock size={16} />}
               <span className="hidden sm:inline">Export CSV</span>
             </button>

            <button 
              onClick={handleGetAdvice}
              className="bg-stone-900 text-white px-4 py-2 rounded-xl shadow-md flex items-center gap-2 text-sm font-medium hover:opacity-90 transition-opacity font-serif"
            >
              {isLoadingAi ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              AI Guide
            </button>
        </div>
      </header>

      {aiAdvice && (
        <div className="bg-mystic-50 border border-mystic-100 p-6 rounded-2xl animate-in slide-in-from-top-4 shadow-sm dark:bg-stone-900">
          <h3 className="text-mystic-900 font-bold font-serif mb-2 flex items-center gap-2 text-lg">
            <Sparkles size={18} /> Spiritual Insight
          </h3>
          <p className="text-mystic-800 leading-relaxed italic font-serif">"{aiAdvice}"</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-800">
          <p className="text-sm text-stone-500 font-bold uppercase tracking-wider font-serif">Total Chants</p>
          <p className="text-3xl font-display font-bold text-stone-800 dark:text-stone-100">{userStats.totalChants.toLocaleString()}</p>
        </div>

        <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-800">
          <p className="text-sm text-stone-500 font-bold uppercase tracking-wider font-serif">Day Streak</p>
          <p className="text-3xl font-display font-bold text-stone-800 dark:text-stone-100">{userStats.streakDays} Days</p>
        </div>

        <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-800">
          <p className="text-sm text-stone-500 font-bold uppercase tracking-wider font-serif">Active Sanghas</p>
          <p className="text-3xl font-display font-bold text-stone-800 dark:text-stone-100">{myGroups.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-800">
          <h3 className="text-lg font-serif font-bold text-stone-800 dark:text-stone-100 mb-6">Activity by Group</h3>
          <div className="h-64 w-full">
            {groupData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={groupData}>
                  <XAxis dataKey="name" tick={{ fill: '#78716c', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#78716c', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: '#f5f5f4' }} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {groupData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#f59e0b' : '#d97706'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-stone-400 text-sm font-serif italic">
                No group chants recorded.
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-800 flex flex-col h-96">
          <h3 className="text-lg font-serif font-bold text-stone-800 dark:text-stone-100 mb-4">Total Sadhanas</h3>
          <div className="flex-1 overflow-y-auto space-y-3 no-scrollbar">
            {displaySadhanaData.length > 0 ? (
              displaySadhanaData.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-stone-50 dark:bg-stone-800/50 rounded-xl">
                  <p className="font-bold text-stone-800 dark:text-stone-200 text-sm">{item.name}</p>
                  <span className="font-display font-bold text-lg text-saffron-600">{item.count.toLocaleString()}</span>
                </div>
              ))
            ) : (
               <div className="h-full flex items-center justify-center text-stone-400 text-sm italic">
                No chants in history.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsDashboard;
