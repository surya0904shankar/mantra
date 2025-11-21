
import React, { useState } from 'react';
import { Group, Mantra } from '../types';
import { Plus, Users, Search, Sparkles, Copy, Check, ArrowRight, BarChart3, Lock, Bell, Crown, User, Star } from 'lucide-react';
import { getMantraSuggestions } from '../services/geminiService';
import GroupAnalytics from './GroupAnalytics';
import NoticeBoardModal from './NoticeBoardModal';

interface GroupAdminProps {
  groups: Group[];
  onCreateGroup: (group: Group) => void;
  onJoinGroup: (groupId: string) => void;
  onSelectGroup: (group: Group) => void;
  isPremium: boolean;
  onTriggerUpgrade: () => void;
  currentUserId: string;
  currentUserName: string;
  onAddAnnouncement: (groupId: string, text: string) => void;
}

const GroupAdmin: React.FC<GroupAdminProps> = ({ 
  groups, 
  onCreateGroup, 
  onJoinGroup, 
  onSelectGroup, 
  isPremium, 
  onTriggerUpgrade, 
  currentUserId, 
  currentUserName,
  onAddAnnouncement
}) => {
  const [mode, setMode] = useState<'LIST' | 'CREATE' | 'JOIN'>('LIST');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [analyzingGroup, setAnalyzingGroup] = useState<Group | null>(null);
  const [noticeBoardGroup, setNoticeBoardGroup] = useState<Group | null>(null);

  // Create Form State
  const [newGroupName, setNewGroupName] = useState('');
  const [intention, setIntention] = useState('');
  const [suggestions, setSuggestions] = useState<Partial<Mantra>[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<Partial<Mantra> | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Join Form State
  const [joinId, setJoinId] = useState('');

  // Limits - Check using dynamic ID
  const MAX_FREE_GROUPS = 2;
  const createdGroupsCount = groups.filter(g => g.adminId === currentUserId).length;
  const canCreateGroup = isPremium || createdGroupsCount < MAX_FREE_GROUPS;

  const handleGenerateMantras = async () => {
    if (!intention) return;
    setIsGenerating(true);
    const results = await getMantraSuggestions(intention);
    setSuggestions(results);
    setIsGenerating(false);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCreateGroup) {
      onTriggerUpgrade();
      return;
    }
    if (!newGroupName || !selectedSuggestion?.text) return;

    const newGroup: Group = {
      id: crypto.randomUUID().slice(0, 8),
      name: newGroupName,
      description: intention,
      mantra: {
        id: crypto.randomUUID(),
        text: selectedSuggestion.text!,
        meaning: selectedSuggestion.meaning,
        targetCount: selectedSuggestion.targetCount || 108
      },
      adminId: currentUserId,
      members: [{ id: currentUserId, name: currentUserName, count: 0, lastActive: new Date().toISOString() }],
      totalGroupCount: 0,
      announcements: [],
      isPremium: isPremium // Set initial group status based on creator
    };

    onCreateGroup(newGroup);
    setMode('LIST');
    // Reset form
    setNewGroupName('');
    setIntention('');
    setSuggestions([]);
    setSelectedSuggestion(null);
  };

  const copyToClipboard = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateClick = () => {
    if (!canCreateGroup) {
      onTriggerUpgrade();
    } else {
      setMode('CREATE');
    }
  };

  return (
    <div className="animate-in fade-in duration-500 relative">
      
      {/* Sub-Screens & Modals */}
      {analyzingGroup && (
        <GroupAnalytics 
          group={analyzingGroup} 
          currentUserId={currentUserId}
          isPremium={isPremium} 
          onUpgradeClick={onTriggerUpgrade} 
          onClose={() => setAnalyzingGroup(null)}
        />
      )}

      {noticeBoardGroup && (
        <NoticeBoardModal 
          isOpen={!!noticeBoardGroup}
          onClose={() => setNoticeBoardGroup(null)}
          announcements={noticeBoardGroup.announcements || []}
          onAddAnnouncement={(text) => onAddAnnouncement(noticeBoardGroup.id, text)}
          isPremium={isPremium}
          groupName={noticeBoardGroup.name}
        />
      )}

      {mode === 'CREATE' && (
        <div className="max-w-lg mx-auto animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-display font-bold text-stone-800 dark:text-stone-100">Create Sankalpa Group</h2>
            <button onClick={() => setMode('LIST')} className="text-sm text-stone-500 hover:text-stone-800 dark:hover:text-stone-300 font-medium">Cancel</button>
          </div>

          <form onSubmit={handleCreateSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-stone-600 dark:text-stone-400 mb-2 uppercase tracking-wider">Group Name</label>
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="e.g., Morning Peace Circle"
                className="w-full p-3 rounded-xl border border-stone-300 dark:border-stone-600 focus:ring-2 focus:ring-saffron-400 focus:outline-none font-serif bg-white dark:bg-stone-800 text-stone-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-stone-600 dark:text-stone-400 mb-2 uppercase tracking-wider">Intention</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={intention}
                  onChange={(e) => setIntention(e.target.value)}
                  placeholder="e.g., Healing, Focus, Prosperity"
                  className="w-full p-3 rounded-xl border border-stone-300 dark:border-stone-600 focus:ring-2 focus:ring-saffron-400 focus:outline-none font-serif bg-white dark:bg-stone-800 text-stone-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={handleGenerateMantras}
                  disabled={isGenerating || !intention}
                  className="bg-saffron-100 text-saffron-700 dark:bg-saffron-900/30 dark:text-saffron-300 px-4 rounded-xl hover:bg-saffron-200 dark:hover:bg-saffron-900/50 disabled:opacity-50 whitespace-nowrap flex items-center gap-2 font-medium"
                >
                  {isGenerating ? <span className="animate-spin">✨</span> : <Sparkles size={18} />}
                  AI Suggest
                </button>
              </div>
            </div>

            {suggestions.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Select a Mantra</p>
                {suggestions.map((s, idx) => (
                  <div 
                    key={idx}
                    onClick={() => setSelectedSuggestion(s)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedSuggestion === s 
                        ? 'border-saffron-500 bg-saffron-50 dark:bg-saffron-900/20 shadow-md' 
                        : 'border-stone-200 dark:border-stone-700 hover:border-saffron-300 hover:bg-stone-50 dark:hover:bg-stone-800'
                    }`}
                  >
                    <p className="font-display font-bold text-stone-800 dark:text-stone-100 text-lg">{s.text}</p>
                    <p className="text-sm text-stone-500 dark:text-stone-400 mt-1 italic font-serif">"{s.meaning}"</p>
                  </div>
                ))}
              </div>
            )}

            <button
              type="submit"
              disabled={!newGroupName || !selectedSuggestion}
              className="w-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 py-4 rounded-xl font-medium hover:bg-stone-800 dark:hover:bg-stone-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-display text-lg"
            >
              Create Circle
            </button>
          </form>
        </div>
      )}

      {mode === 'JOIN' && (
        <div className="max-w-md mx-auto animate-in slide-in-from-bottom-4 duration-300 pt-10">
          <h2 className="text-2xl font-display font-bold text-stone-800 dark:text-stone-100 mb-6 text-center">Join a Circle</h2>
          <div className="bg-white dark:bg-stone-900 p-8 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-800">
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">Enter Group ID</label>
              <input
                type="text"
                value={joinId}
                onChange={(e) => setJoinId(e.target.value)}
                placeholder="Paste ID here..."
                className="w-full p-3 rounded-xl border border-stone-300 dark:border-stone-600 focus:ring-2 focus:ring-mystic-500 focus:outline-none mb-4 bg-white dark:bg-stone-800 text-stone-900 dark:text-white"
              />
              <div className="flex gap-3">
                <button onClick={() => setMode('LIST')} className="flex-1 py-3 text-stone-500 hover:bg-stone-50 dark:hover:bg-stone-800 rounded-xl font-medium">
                  Back
                </button>
                <button 
                  onClick={() => { onJoinGroup(joinId); setMode('LIST'); setJoinId(''); }}
                  disabled={!joinId}
                  className="flex-1 bg-mystic-700 hover:bg-mystic-800 text-white py-3 rounded-xl font-medium disabled:opacity-50 transition-colors"
                >
                  Join Now
                </button>
              </div>
          </div>
        </div>
      )}

      {/* LIST MODE */}
      {mode === 'LIST' && (
        <>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <div>
              <h2 className="text-2xl font-display font-bold text-stone-800 dark:text-stone-100">Your Sanghas</h2>
              <p className="text-stone-500 dark:text-stone-400 text-sm font-serif">Manage your circles and shared practices.</p>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <button 
                onClick={() => setMode('JOIN')}
                className="flex-1 sm:flex-none px-5 py-2.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 rounded-xl font-medium hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors flex items-center justify-center gap-2"
              >
                <Search size={18} /> Join
              </button>
              <button 
                onClick={handleCreateClick}
                className="flex-1 sm:flex-none px-5 py-2.5 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-xl font-medium hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors flex items-center justify-center gap-2 relative overflow-hidden shadow-lg shadow-stone-200 dark:shadow-none"
              >
                <Plus size={18} /> Create
                {!canCreateGroup && (
                  <div className="absolute inset-0 bg-stone-900/90 flex items-center justify-center text-white/90 text-xs font-bold backdrop-blur-[1px]">
                    <Lock size={12} className="mr-1" /> Limit Reached
                  </div>
                )}
              </button>
            </div>
          </div>

          {groups.length === 0 ? (
            <div className="text-center py-20 bg-stone-50 dark:bg-stone-900 border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-2xl">
              <Users className="mx-auto text-stone-300 dark:text-stone-600 mb-4" size={48} />
              <p className="text-stone-500 dark:text-stone-400 font-medium font-serif">You haven't joined any groups yet.</p>
              <p className="text-stone-400 dark:text-stone-500 text-sm mt-1">Create one or join a friend's circle.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groups.map(group => {
                const isAdmin = group.adminId === currentUserId;
                const isNearLimit = !group.isPremium && group.members.length >= 20;
                const isFull = !group.isPremium && group.members.length >= 25;

                // Distinct styling for Admin vs Member groups
                const cardBgClass = isAdmin ? 'bg-orange-50/50 dark:bg-orange-900/20' : 'bg-indigo-50/40 dark:bg-indigo-900/20';
                const cardBorderClass = isAdmin ? 'border-orange-200 dark:border-orange-800' : 'border-indigo-200 dark:border-indigo-800';
                const badgeClass = isAdmin 
                    ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200' 
                    : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200';

                return (
                  <div 
                    key={group.id} 
                    className={`p-5 rounded-2xl shadow-sm border hover:shadow-md transition-shadow relative flex flex-col justify-between h-full ${cardBgClass} ${cardBorderClass}`}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-display font-bold text-xl text-stone-800 dark:text-stone-100 leading-tight">{group.name}</h3>
                            <span className={`${badgeClass} text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1`}>
                                {isAdmin ? <><Crown size={10} /> CREATOR</> : <><User size={10} /> MEMBER</>}
                            </span>
                            {group.isPremium && (
                                <span className="bg-saffron-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <Star size={10} fill="currentColor" /> PRO
                                </span>
                            )}
                          </div>
                          <p className="text-[10px] text-stone-400 font-mono flex items-center gap-1">
                            ID: {group.id}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <button 
                            onClick={() => setNoticeBoardGroup(group)}
                            className="text-stone-400 hover:text-mystic-600 transition-colors p-2 rounded-lg hover:bg-white dark:hover:bg-stone-800 relative"
                            title="Notice Board"
                          >
                            <Bell size={16} />
                            {group.announcements && group.announcements.length > 0 && (
                               <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-stone-900"></span>
                            )}
                          </button>
                          <button 
                            onClick={() => copyToClipboard(group.id)}
                            className="text-stone-400 hover:text-teal-600 transition-colors p-2 rounded-lg hover:bg-white dark:hover:bg-stone-800"
                            title="Copy ID to share"
                          >
                            {copiedId === group.id ? <Check size={16} className="text-green-600"/> : <Copy size={16} />}
                          </button>
                        </div>
                      </div>
                      
                      <div className="mb-4 bg-white/60 dark:bg-stone-900/60 p-3 rounded-lg border border-white dark:border-stone-800">
                        <p className="text-sm text-stone-700 dark:text-stone-300 italic font-serif">"{group.mantra.text}"</p>
                      </div>
                    </div>

                    <div className="mt-2 flex flex-col gap-3">
                      <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                          <div className="flex items-center gap-2">
                            <Users size={14} />
                            <span>
                              {group.members.length}
                              {!group.isPremium && <span className="text-stone-400">/25</span>} members
                            </span>
                          </div>
                          {isFull && <span className="text-red-500 font-bold">FULL</span>}
                      </div>
                      
                      {/* Progress bar for member limit */}
                      {!group.isPremium && (
                        <div className="w-full h-1 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${isFull ? 'bg-red-400' : isNearLimit ? 'bg-orange-400' : 'bg-stone-400'}`}
                            style={{ width: `${(group.members.length / 25) * 100}%` }}
                          ></div>
                        </div>
                      )}

                        <div className="flex gap-2 mt-1">
                          <button
                            onClick={() => setAnalyzingGroup(group)}
                            className="flex-1 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 text-sm font-medium py-2.5 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors flex items-center justify-center gap-1"
                          >
                            <BarChart3 size={16} /> Stats
                          </button>
                          <button 
                            onClick={() => onSelectGroup(group)}
                            className="flex-1 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-medium text-sm py-2.5 rounded-xl flex items-center justify-center gap-1 hover:bg-stone-800 dark:hover:bg-stone-200 transition-all shadow-md shadow-stone-200 dark:shadow-none"
                          >
                            Practice <ArrowRight size={16} />
                          </button>
                        </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GroupAdmin;