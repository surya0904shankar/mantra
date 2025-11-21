
import React from 'react';
import { Group } from '../types';
import { Trophy, Lock, TrendingUp, Calendar } from 'lucide-react';

interface GroupAnalyticsProps {
  group: Group;
  isPremium: boolean;
  onUpgradeClick: () => void;
  onClose: () => void;
}

const GroupAnalytics: React.FC<GroupAnalyticsProps> = ({ group, isPremium, onUpgradeClick, onClose }) => {
  // Sort members by count for leaderboard
  const sortedMembers = [...group.members].sort((a, b) => b.count - a.count);

  return (
    <div className="fixed inset-0 bg-white z-40 overflow-y-auto animate-in slide-in-from-bottom-10 duration-300">
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8 sticky top-0 bg-white/95 backdrop-blur-sm py-4 z-10 border-b border-stone-100">
          <div>
            <h2 className="text-2xl font-serif font-bold text-stone-800">{group.name} Insights</h2>
            <p className="text-sm text-stone-500">Detailed performance and community stats</p>
          </div>
          <button onClick={onClose} className="bg-stone-100 hover:bg-stone-200 text-stone-600 px-4 py-2 rounded-xl font-medium transition-colors">
            Close
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-indigo-50 p-5 rounded-2xl border border-indigo-100">
            <p className="text-indigo-600 text-sm font-medium mb-1">Total Chants</p>
            <p className="text-3xl font-bold text-indigo-900">{group.totalGroupCount.toLocaleString()}</p>
          </div>
          <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100">
            <p className="text-emerald-600 text-sm font-medium mb-1">Active Members</p>
            <p className="text-3xl font-bold text-emerald-900">{group.members.length}</p>
          </div>
          <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100">
            <p className="text-amber-600 text-sm font-medium mb-1">Avg per Member</p>
            <p className="text-3xl font-bold text-amber-900">
              {Math.round(group.totalGroupCount / Math.max(group.members.length, 1)).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Leaderboard Section */}
        <div className="relative">
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-yellow-100 p-2 rounded-lg text-yellow-700">
              <Trophy size={20} />
            </div>
            <h3 className="text-xl font-bold text-stone-800">Leaderboard</h3>
          </div>

          {/* Premium Gate Overlay */}
          {!isPremium && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-center p-6 border border-stone-100 rounded-3xl mt-12">
              <div className="w-16 h-16 bg-stone-900 rounded-full flex items-center justify-center mb-4 shadow-lg text-saffron-400">
                <Lock size={32} />
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-2">Detailed Stats Locked</h3>
              <p className="text-stone-500 mb-6 max-w-sm">
                Upgrade to Premium to view individual member progress, consistency scores, and the full community leaderboard.
              </p>
              <button 
                onClick={onUpgradeClick}
                className="bg-gradient-to-r from-saffron-500 to-orange-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all active:scale-95"
              >
                Unlock Insights
              </button>
            </div>
          )}

          {/* Table Content (Blurred if not premium) */}
          <div className={`bg-white border border-stone-200 rounded-2xl overflow-hidden ${!isPremium ? 'filter blur-sm select-none opacity-50' : ''}`}>
            <table className="w-full text-left">
              <thead className="bg-stone-50 border-b border-stone-200">
                <tr>
                  <th className="p-4 text-sm font-semibold text-stone-500 w-16">Rank</th>
                  <th className="p-4 text-sm font-semibold text-stone-500">Member</th>
                  <th className="p-4 text-sm font-semibold text-stone-500 text-right">Chants</th>
                  <th className="p-4 text-sm font-semibold text-stone-500 text-right hidden sm:table-cell">Last Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {sortedMembers.map((member, index) => (
                  <tr key={member.id} className="hover:bg-stone-50 transition-colors">
                    <td className="p-4">
                      {index === 0 && <span className="text-xl">🥇</span>}
                      {index === 1 && <span className="text-xl">🥈</span>}
                      {index === 2 && <span className="text-xl">🥉</span>}
                      {index > 2 && <span className="font-mono text-stone-400 font-bold ml-1">#{index + 1}</span>}
                    </td>
                    <td className="p-4 font-medium text-stone-800 flex items-center gap-2">
                      <div className="w-8 h-8 bg-stone-200 rounded-full flex items-center justify-center text-xs font-bold text-stone-600">
                        {member.name.charAt(0)}
                      </div>
                      {member.name}
                      {member.id === 'current-user' && <span className="text-[10px] bg-stone-100 px-2 py-0.5 rounded text-stone-500">You</span>}
                    </td>
                    <td className="p-4 text-right font-mono font-bold text-stone-700">
                      {member.count.toLocaleString()}
                    </td>
                    <td className="p-4 text-right text-sm text-stone-400 hidden sm:table-cell">
                      {new Date(member.lastActive).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {/* Add dummy rows to look full if free */}
                {!isPremium && Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`dummy-${i}`}>
                     <td className="p-4"><span className="font-mono text-stone-400">#{i + 4}</span></td>
                     <td className="p-4 flex items-center gap-2">
                       <div className="w-8 h-8 bg-stone-100 rounded-full"></div>
                       <div className="h-4 w-24 bg-stone-100 rounded"></div>
                     </td>
                     <td className="p-4 text-right"><div className="h-4 w-12 bg-stone-100 rounded ml-auto"></div></td>
                     <td className="p-4 hidden sm:table-cell"><div className="h-4 w-20 bg-stone-100 rounded ml-auto"></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupAnalytics;
