
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { UserStats, Group, UserProfile } from '../types';
import { Activity, Flame, Users, Sparkles, Loader2, Download, Lock } from 'lucide-react';
import { analyzeChantingHabits } from '../services/geminiService';

interface StatsDashboardProps {
  userStats: UserStats;
  groups: Group[];
  currentUser: UserProfile;
}

const StatsDashboard: React.FC<StatsDashboardProps> = ({ userStats, groups, currentUser }) => {
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  // Data for Group Chart - Filtered by Current User ID
  const groupData = groups.map(g => ({
    name: g.name,
    count: g.members.find(m => m.id === currentUser.id)?.count || 0,
  }));

  // Data for Mantra Breakdown (Pie Chart)
  const mantraData = userStats.mantraBreakdown.map(m => ({
    name: m.mantraText.length > 15 ? m.mantraText.substring(0, 15) + '...' : m.mantraText,
    value: m.totalCount
  })).filter(d => d.value > 0);

  const COLORS = ['#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#3b82f6'];

  const handleGetAdvice = async () => {
    setIsLoadingAi(true);
    const advice = await analyzeChantingHabits(userStats);
    setAiAdvice(advice);
    setIsLoadingAi(false);
  };

  const downloadCSV = () => {
    if (!userStats.isPremium) return;

    const now = new Date();
    
    // Metadata section with requested details
    const metaRows = [
      ['OMCOUNTER REPORT', ''],
      ['Generated At', now.toLocaleString()],
      ['User Name', currentUser.name],
      ['User Email', currentUser.email],
      ['Last Login Time', currentUser.lastLogin ? new Date(currentUser.lastLogin).toLocaleString() : 'Current Session'],
      ['Plan', 'Premium'],
      [],
      ['CHANTS LOG', '', '', '']
    ];

    const headers = ['Date', 'Mantra', 'Total Count', 'Streak Days'];
    
    // Simulating row data based on current stats
    // In a real app, this would come from a comprehensive history log
    const rows = userStats.mantraBreakdown.map(m => [
      now.toLocaleDateString(), // Using current date as this is a snapshot
      m.mantraText,
      m.totalCount,
      userStats.streakDays
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
        + metaRows.map(e => e.join(",")).join("\n") + "\n"
        + headers.join(",") + "\n" 
        + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `omcounter_stats_${currentUser.name.replace(/\s+/g, '_')}_${now.toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-stone-800">Namaste, {currentUser.name.split(' ')[0]}</h2>
          <p className="text-stone-500 mt-1 font-serif">Here is your spiritual progress today.</p>
        </div>
        <div className="flex gap-2">
             <button 
                onClick={downloadCSV}
                className={`px-4 py-2 rounded-xl shadow-sm flex items-center gap-2 text-sm font-medium transition-all border ${userStats.isPremium ? 'bg-white hover:bg-stone-50 text-stone-700 border-stone-200' : 'bg-stone-100 text-stone-400 cursor-not-allowed border-transparent'}`}
                title={userStats.isPremium ? "Download Report" : "Upgrade to download stats"}
             >
               {userStats.isPremium ? <Download size={16} /> : <Lock size={16} />}
               <span className="hidden sm:inline">Export CSV</span>
             </button>

            <button 
              onClick={handleGetAdvice}
              className="bg-gradient-to-r from-mystic-600 to-mystic-800 text-white px-4 py-2 rounded-xl shadow-md shadow-mystic-200 flex items-center gap-2 text-sm font-medium hover:opacity-90 transition-opacity font-serif"
            >
              {isLoadingAi ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              {aiAdvice ? "Refresh Guidance" : "Ask AI Coach"}
            </button>
        </div>
      </header>

      {/* AI Advice Section */}
      {aiAdvice && (
        <div className="bg-gradient-to-r from-mystic-50 to-white border border-mystic-100 p-6 rounded-2xl relative overflow-hidden animate-in slide-in-from-top-4 shadow-sm">
          <div className="absolute top-0 right-0 p-4 opacity-5">
             <Sparkles size={100} className="text-mystic-900" />
          </div>
          <h3 className="text-mystic-900 font-bold font-serif mb-2 flex items-center gap-2 text-lg">
            <Sparkles size={18} /> Spiritual Insight
          </h3>
          <p className="text-mystic-800 leading-relaxed italic font-serif">"{aiAdvice}"</p>
        </div>
      )}

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex items-center space-x-4 relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-saffron-50 rounded-bl-full -mr-4 -mt-4 opacity-50 group-hover:scale-110 transition-transform"></div>
          <div className="p-3 bg-saffron-100 rounded-full text-saffron-700 relative z-10">
            <Activity size={24} />
          </div>
          <div className="relative z-10">
            <p className="text-sm text-stone-500 font-bold uppercase tracking-wider font-serif">Total Chants</p>
            <p className="text-3xl font-display font-bold text-stone-800">{userStats.totalChants.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex items-center space-x-4 relative overflow-hidden group">
           <div className="absolute right-0 top-0 w-24 h-24 bg-orange-50 rounded-bl-full -mr-4 -mt-4 opacity-50 group-hover:scale-110 transition-transform"></div>
          <div className="p-3 bg-orange-100 rounded-full text-orange-600 relative z-10">
            <Flame size={24} />
          </div>
          <div className="relative z-10">
            <p className="text-sm text-stone-500 font-bold uppercase tracking-wider font-serif">Day Streak</p>
            <p className="text-3xl font-display font-bold text-stone-800">{userStats.streakDays} Days</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex items-center space-x-4 relative overflow-hidden group">
           <div className="absolute right-0 top-0 w-24 h-24 bg-mystic-50 rounded-bl-full -mr-4 -mt-4 opacity-50 group-hover:scale-110 transition-transform"></div>
          <div className="p-3 bg-mystic-100 rounded-full text-mystic-700 relative z-10">
            <Users size={24} />
          </div>
          <div className="relative z-10">
            <p className="text-sm text-stone-500 font-bold uppercase tracking-wider font-serif">Sangha</p>
            <p className="text-3xl font-display font-bold text-stone-800">{groups.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Chart Section: By Group */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
          <h3 className="text-lg font-serif font-bold text-stone-800 mb-6">Activity by Group</h3>
          <div className="h-64 w-full">
            {groupData.length > 0 && groupData.some(g => g.count > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={groupData}>
                  <XAxis dataKey="name" tick={{ fill: '#78716c', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#78716c', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{ fill: '#f5f5f4' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontFamily: 'Karma' }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {groupData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#f59e0b' : '#d97706'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-stone-400 text-sm font-serif italic">
                No group activity yet.
              </div>
            )}
          </div>
        </div>

        {/* Chart Section: By Mantra */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
          <h3 className="text-lg font-serif font-bold text-stone-800 mb-6">Mantra Distribution</h3>
          <div className="h-64 w-full">
            {mantraData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mantraData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {mantraData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontFamily: 'Karma' }} />
                  <Legend iconType="circle" layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{fontSize: '12px', fontFamily: 'Inter'}} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
               <div className="h-full flex items-center justify-center text-stone-400 text-sm font-serif italic">
                No chants recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsDashboard;
