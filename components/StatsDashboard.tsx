
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { UserStats, Group } from '../types';
import { Activity, Flame, Users, Sparkles, Loader2 } from 'lucide-react';
import { analyzeChantingHabits } from '../services/geminiService';

interface StatsDashboardProps {
  userStats: UserStats;
  groups: Group[];
  currentUserId: string;
}

const StatsDashboard: React.FC<StatsDashboardProps> = ({ userStats, groups, currentUserId }) => {
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  // Data for Group Chart - Filtered by Current User ID
  const groupData = groups.map(g => ({
    name: g.name,
    count: g.members.find(m => m.id === currentUserId)?.count || 0,
  }));

  // Data for Mantra Breakdown (Pie Chart)
  const mantraData = userStats.mantraBreakdown.map(m => ({
    name: m.mantraText.length > 15 ? m.mantraText.substring(0, 15) + '...' : m.mantraText,
    value: m.totalCount
  })).filter(d => d.value > 0);

  const COLORS = ['#f59e0b', '#14b8a6', '#8b5cf6', '#ec4899', '#3b82f6'];

  const handleGetAdvice = async () => {
    setIsLoadingAi(true);
    const advice = await analyzeChantingHabits(userStats);
    setAiAdvice(advice);
    setIsLoadingAi(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-serif font-bold text-stone-800">Namaste, Sadhaka</h2>
          <p className="text-stone-500 mt-1">Here is your spiritual progress today.</p>
        </div>
        <button 
          onClick={handleGetAdvice}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-xl shadow-md flex items-center gap-2 text-sm font-medium hover:opacity-90 transition-opacity"
        >
          {isLoadingAi ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
          {aiAdvice ? "Refresh Guidance" : "Ask AI Coach"}
        </button>
      </header>

      {/* AI Advice Section */}
      {aiAdvice && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 p-6 rounded-2xl relative overflow-hidden animate-in slide-in-from-top-4">
          <div className="absolute top-0 right-0 p-4 opacity-10">
             <Sparkles size={100} className="text-indigo-500" />
          </div>
          <h3 className="text-indigo-900 font-bold font-serif mb-2 flex items-center gap-2">
            <Sparkles size={18} /> Spiritual Insight
          </h3>
          <p className="text-indigo-800 leading-relaxed italic">"{aiAdvice}"</p>
        </div>
      )}

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex items-center space-x-4">
          <div className="p-3 bg-saffron-100 rounded-full text-saffron-700">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-sm text-stone-500 font-medium">Total Chants</p>
            <p className="text-2xl font-bold text-stone-800">{userStats.totalChants.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex items-center space-x-4">
          <div className="p-3 bg-orange-100 rounded-full text-orange-600">
            <Flame size={24} />
          </div>
          <div>
            <p className="text-sm text-stone-500 font-medium">Day Streak</p>
            <p className="text-2xl font-bold text-stone-800">{userStats.streakDays} Days</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex items-center space-x-4">
          <div className="p-3 bg-teal-100 rounded-full text-teal-700">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm text-stone-500 font-medium">Active Groups</p>
            <p className="text-2xl font-bold text-stone-800">{groups.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Chart Section: By Group */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
          <h3 className="text-lg font-semibold text-stone-800 mb-6">Activity by Group</h3>
          <div className="h-64 w-full">
            {groupData.length > 0 && groupData.some(g => g.count > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={groupData}>
                  <XAxis dataKey="name" tick={{ fill: '#78716c', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#78716c', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{ fill: '#f5f5f4' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {groupData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#f59e0b' : '#d97706'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-stone-400 text-sm">
                No group activity yet.
              </div>
            )}
          </div>
        </div>

        {/* Chart Section: By Mantra */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
          <h3 className="text-lg font-semibold text-stone-800 mb-6">Mantra Distribution</h3>
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
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                  <Legend iconType="circle" layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{fontSize: '12px'}} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
               <div className="h-full flex items-center justify-center text-stone-400 text-sm">
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
