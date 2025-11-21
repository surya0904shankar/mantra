
import React from 'react';
import { Group } from '../types';
import { Trophy, Lock, Calendar, Clock, User, Users } from 'lucide-react';

interface GroupAnalyticsProps {
  group: Group;
  currentUserId: string;
  isPremium: boolean;
  onUpgradeClick: () => void;
  onClose: () => void;
}

const GroupAnalytics: React.FC<GroupAnalyticsProps> = ({ group, currentUserId, isPremium, onUpgradeClick, onClose }) => {
  const isCreator = group.adminId === currentUserId;
  
  // Sort members by count for leaderboard (Only visible to Admin)
  const sortedMembers = [...group.members].sort((a, b) => b.count - a.count);

  // Current User Stats (Visible to User)
  const myMemberData = group.members.find(m => m.id === currentUserId);
  const lastActiveDate = myMemberData ? new Date(myMemberData.lastActive) : new Date();

  return (
    <div className="fixed inset-0 bg-white dark:bg-stone-950 z-40 overflow-y-auto animate-in slide-in-from-bottom-10 duration-300">
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8 sticky top-0 bg-white/95 dark:bg-stone-950/95 backdrop-blur-sm py-4 z-10 border-b border-stone-100 dark:border-stone-800">
          <div>
            <h2 className="text-2xl font-serif font-bold text-stone-800 dark:text-stone-100">{group.name} Insights</h2>
            <p className="text-sm text-stone-500 dark:text-stone-400">
               Stats for {isCreator ? 'Group Creator' : 'Member'}
            </p>
          </div>
          <button onClick={onClose} className="bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 px-4 py-2 rounded-xl font-medium transition-colors">
            Close
          </button>
        </div>

        {/* 2 BOX LAYOUT: VISIBLE TO EVERYONE (Creator & Member) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
           
           {/* BOX 1: User Stats */}
           <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm relative overflow-hidden flex flex-col h-[320px]">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <User size={100} className="text-stone-900 dark:text-stone-100" />
              </div>
              <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100 mb-4 flex items-center gap-2 flex-shrink-0">
                <User size={20} className="text-saffron-500" /> My Stats
              </h3>
              
              <div className="mb-4 flex-shrink-0">
                 <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">My Total Counts</p>
                 <p className="text-3xl font-display font-bold text-stone-900 dark:text-stone-100">{myMemberData?.count.toLocaleString() || 0}</p>
              </div>
              
              <div className="flex-1 overflow-hidden flex flex-col">
                 <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2 flex-shrink-0">History Log</p>
                 <div className="flex-1 overflow-y-auto pr-2 space-y-2 no-scrollbar bg-stone-50 dark:bg-stone-800/50 rounded-lg p-2 border border-stone-100 dark:border-stone-800">
                    {myMemberData?.history && myMemberData.history.length > 0 ? (
                        myMemberData.history.map((entry, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm p-2 bg-white dark:bg-stone-800 rounded border border-stone-100 dark:border-stone-700 shadow-sm">
                                <div className="flex flex-col">
                                    <span className="font-medium text-stone-700 dark:text-stone-300">{new Date(entry.date).toLocaleDateString()}</span>
                                    <span className="text-[10px] text-stone-400">{new Date(entry.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                </div>
                                <span className="font-mono font-bold text-saffron-600 dark:text-saffron-400">+{entry.count}</span>
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-stone-400 text-xs py-4 italic">No history recorded yet.</div>
                    )}
                 </div>
              </div>
           </div>

           {/* BOX 2: Group Stats */}
           <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm relative overflow-hidden flex flex-col h-[320px]">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Users size={100} className="text-mystic-900 dark:text-mystic-100" />
              </div>
              <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100 mb-4 flex items-center gap-2">
                <Users size={20} className="text-mystic-600" /> Group Overview
              </h3>

              <div className="space-y-4">
                 <div>
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Total Group Chants</p>
                    <p className="text-3xl font-display font-bold text-stone-900 dark:text-stone-100">{group.totalGroupCount.toLocaleString()}</p>
                 </div>

                 <div className="pt-4 border-t border-stone-100 dark:border-stone-800">
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Community Size</p>
                    <div className="flex items-center gap-2">
                        <div className="text-2xl font-bold text-stone-800 dark:text-stone-200">{group.members.length}</div>
                        <span className="text-sm text-stone-500">active practitioners</span>
                    </div>
                 </div>

                 <div className="pt-4 border-t border-stone-100 dark:border-stone-800 mt-auto">
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Recent Activity</p>
                    <div className="bg-stone-50 dark:bg-stone-800 p-3 rounded-lg flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400">
                        <Clock size={14} /> 
                        <span>Last chant: {lastActiveDate.toLocaleDateString()}</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* VISIBILITY: CREATOR sees EXTRA Detailed Insights */}
        {isCreator && (
            <div className="animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center gap-2 mb-6 mt-8 border-t border-stone-100 dark:border-stone-800 pt-8">
                    <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-lg text-yellow-700 dark:text-yellow-400">
                    <Trophy size={20} />
                    </div>
                    <h3 className="text-xl font-bold text-stone-800 dark:text-stone-100">Detailed Group Insights (Admin)</h3>
                </div>

                {/* Premium Gate Overlay */}
                {!isPremium && (
                    <div className="relative p-6 border border-stone-100 dark:border-stone-800 rounded-3xl bg-stone-50 dark:bg-stone-900 overflow-hidden">
                         <div className="absolute inset-0 bg-white/60 dark:bg-stone-950/70 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-center p-6">
                            <div className="w-16 h-16 bg-stone-900 dark:bg-stone-800 rounded-full flex items-center justify-center mb-4 shadow-lg text-saffron-400">
                                <Lock size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-2">Leaderboard Locked</h3>
                            <p className="text-stone-500 dark:text-stone-400 mb-6 max-w-sm">
                                Upgrade to Premium to view individual member progress, consistency scores, and the full community leaderboard.
                            </p>
                            <button 
                                onClick={onUpgradeClick}
                                className="bg-gradient-to-r from-saffron-500 to-orange-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all active:scale-95"
                            >
                                Unlock Insights
                            </button>
                        </div>
                        {/* Fake table for background visual */}
                        <div className="opacity-20 filter blur-sm pointer-events-none">
                            {[1,2,3].map(i => <div key={i} className="h-12 bg-stone-200 dark:bg-stone-700 mb-2 rounded-lg"></div>)}
                        </div>
                    </div>
                )}

                {/* Table Content (Visible if premium) */}
                {isPremium && (
                    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden">
                        <table className="w-full text-left">
                        <thead className="bg-stone-50 dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700">
                            <tr>
                            <th className="p-4 text-sm font-semibold text-stone-500 dark:text-stone-400 w-16">Rank</th>
                            <th className="p-4 text-sm font-semibold text-stone-500 dark:text-stone-400">Member</th>
                            <th className="p-4 text-sm font-semibold text-stone-500 dark:text-stone-400 text-right">Chants</th>
                            <th className="p-4 text-sm font-semibold text-stone-500 dark:text-stone-400 text-right hidden sm:table-cell">Last Active</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                            {sortedMembers.map((member, index) => (
                            <tr key={member.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
                                <td className="p-4 text-stone-800 dark:text-stone-200">
                                {index === 0 && <span className="text-xl">🥇</span>}
                                {index === 1 && <span className="text-xl">🥈</span>}
                                {index === 2 && <span className="text-xl">🥉</span>}
                                {index > 2 && <span className="font-mono text-stone-400 font-bold ml-1">#{index + 1}</span>}
                                </td>
                                <td className="p-4 font-medium text-stone-800 dark:text-stone-200 flex items-center gap-2">
                                <div className="w-8 h-8 bg-stone-200 dark:bg-stone-700 rounded-full flex items-center justify-center text-xs font-bold text-stone-600 dark:text-stone-300">
                                    {member.name.charAt(0)}
                                </div>
                                {member.name}
                                {member.id === currentUserId && <span className="text-[10px] bg-stone-100 dark:bg-stone-700 px-2 py-0.5 rounded text-stone-500 dark:text-stone-400">You</span>}
                                </td>
                                <td className="p-4 text-right font-mono font-bold text-stone-700 dark:text-stone-300">
                                {member.count.toLocaleString()}
                                </td>
                                <td className="p-4 text-right text-sm text-stone-400 hidden sm:table-cell">
                                {new Date(member.lastActive).toLocaleDateString()} {new Date(member.lastActive).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </td>
                            </tr>
                            ))}
                        </tbody>
                        </table>
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default GroupAnalytics;
