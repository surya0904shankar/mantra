
import React, { useState } from 'react';
import { Group, Mantra } from '../types';
import { Plus, Users, Search, Sparkles, Copy, Check, ArrowRight, BarChart3, Lock, Bell, Crown, User, Star, AlignLeft, Info } from 'lucide-react';
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
  groups, onCreateGroup, onJoinGroup, onSelectGroup, isPremium, onTriggerUpgrade, currentUserId, currentUserName, onAddAnnouncement
}) => {
  const [mode, setMode] = useState<'LIST' | 'CREATE' | 'JOIN'>('LIST');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [analyzingGroup, setAnalyzingGroup] = useState<Group | null>(null);
  const [noticeBoardGroup, setNoticeBoardGroup] = useState<Group | null>(null);

  const [newGroupName, setNewGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [joinId, setJoinId] = useState('');

  const myGroups = groups.filter(g => 
    g.adminId === currentUserId || (Array.isArray(g.members) && g.members.some(m => m.id === currentUserId))
  );

  const myCreatedGroups = groups.filter(g => g.adminId === currentUserId);
  const canCreateMore = isPremium || myCreatedGroups.length < 2;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName || !description) return;
    if (!canCreateMore) {
       onTriggerUpgrade();
       return;
    }
    const id = crypto.randomUUID();
    onCreateGroup({
      id,
      name: newGroupName,
      description: description,
      adminId: currentUserId,
      totalGroupCount: 0,
      announcements: [],
      mantra: { 
        id: id + '-m', 
        text: newGroupName,
        targetCount: 108, 
        meaning: description
      },
      members: [{ id: currentUserId, name: currentUserName, count: 0, lastActive: new Date().toISOString() }],
      isPremium: isPremium // Group inherits premium status from its creator
    });
    setNewGroupName('');
    setDescription('');
    setMode('LIST');
  };

  const copyToClipboard = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="animate-in fade-in duration-500 relative">
      {analyzingGroup && <GroupAnalytics group={analyzingGroup} currentUserId={currentUserId} isPremium={isPremium} onUpgradeClick={onTriggerUpgrade} onClose={() => setAnalyzingGroup(null)} />}
      {noticeBoardGroup && <NoticeBoardModal isOpen={!!noticeBoardGroup} onClose={() => setNoticeBoardGroup(null)} announcements={noticeBoardGroup.announcements || []} onAddAnnouncement={(text) => onAddAnnouncement(noticeBoardGroup.id, text)} isPremium={isPremium} groupName={noticeBoardGroup.name} />}

      {mode === 'LIST' && (
        <>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <div>
              <h2 className="text-2xl font-display font-bold text-stone-800 dark:text-stone-100 uppercase tracking-tight">Your Sanghas</h2>
              <p className="text-stone-500 dark:text-stone-400 text-sm font-serif">Manage your circles and shared practices.</p>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <button onClick={() => setMode('JOIN')} className="flex-1 sm:flex-none px-5 py-2.5 bg-white dark:bg-stone-900 border rounded-xl flex items-center justify-center gap-2 transition-all hover:bg-stone-50 dark:hover:bg-stone-800"><Search size={18} /> Join</button>
              <button 
                onClick={() => canCreateMore ? setMode('CREATE') : onTriggerUpgrade()} 
                className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg ${canCreateMore ? 'bg-stone-900 text-white hover:bg-stone-800' : 'bg-stone-100 text-stone-400 border border-stone-200'}`}
              >
                {!canCreateMore && <Lock size={16} />}
                <Plus size={18} /> Create
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myGroups.map(group => {
              const isAdmin = group.adminId === currentUserId;
              const cardBg = isAdmin ? 'bg-orange-50/50 dark:bg-orange-900/20 border-orange-200' : 'bg-indigo-50/40 dark:bg-indigo-900/20 border-indigo-200';
              const badge = isAdmin ? 'bg-orange-100 text-orange-800' : 'bg-indigo-100 text-indigo-800';
              const memberCount = group.members?.length || 0;

              return (
                <div key={group.id} className={`p-5 rounded-2xl border shadow-sm relative flex flex-col justify-between h-full group ${cardBg}`}>
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-display font-bold text-xl text-stone-800 dark:text-stone-100 uppercase tracking-tight">{group.name}</h3>
                          <span className={`${badge} text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1`}>
                            {isAdmin ? <Crown size={10} /> : <User size={10} />} {isAdmin ? 'CREATOR' : 'MEMBER'}
                          </span>
                        </div>
                        <p className="text-[10px] text-stone-400 font-mono">ID: {group.id}</p>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => setNoticeBoardGroup(group)} className="p-2 hover:bg-white dark:hover:bg-stone-800 rounded-lg text-stone-400 transition-colors"><Bell size={16} /></button>
                        <button onClick={() => copyToClipboard(group.id)} className="p-2 hover:bg-white dark:hover:bg-stone-800 rounded-lg text-stone-400 transition-colors">{copiedId === group.id ? <Check size={16} className="text-green-600"/> : <Copy size={16} />}</button>
                      </div>
                    </div>
                    <div className="mb-4 bg-white/60 dark:bg-stone-900/60 p-4 rounded-xl border border-white dark:border-stone-800 min-h-[60px] flex items-start gap-3">
                      <AlignLeft size={16} className="text-stone-400 shrink-0 mt-1" />
                      <p className="text-sm text-stone-600 dark:text-stone-300 font-serif leading-relaxed line-clamp-3 italic">
                        {group.description || 'No description provided.'}
                      </p>
                    </div>
                    <div className="mb-4 flex items-center gap-2 text-[10px] text-stone-400 font-bold uppercase tracking-wider">
                       <Users size={12} /> 
                       {isAdmin 
                        ? `${memberCount} / ${group.isPremium ? 'Unlimited Capacity' : '25 Members Max'}`
                        : `${memberCount} ${memberCount === 1 ? 'Member' : 'Members'}`
                       }
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setAnalyzingGroup(group)} className="flex-1 bg-white dark:bg-stone-800 border py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-1 hover:bg-stone-50 transition-colors"><BarChart3 size={16} /> Stats</button>
                    <button onClick={() => onSelectGroup(group)} className="flex-1 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 py-2.5 rounded-xl font-medium flex items-center justify-center gap-1 hover:opacity-90 transition-opacity">Practice <ArrowRight size={16} /></button>
                  </div>
                </div>
              );
            })}
            
            {myGroups.length === 0 && (
              <div className="md:col-span-2 py-20 text-center border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-[2rem]">
                 <Users className="mx-auto mb-4 text-stone-300" size={48} />
                 <p className="text-stone-500 font-serif italic mb-6">You haven't joined any Sanghas yet.</p>
                 <button onClick={() => canCreateMore ? setMode('CREATE') : onTriggerUpgrade()} className="px-6 py-3 bg-stone-950 text-white rounded-2xl font-bold flex items-center gap-2 mx-auto">
                   <Plus size={20} /> Create Your First Circle
                 </button>
              </div>
            )}
          </div>
        </>
      )}

      {mode === 'CREATE' && (
        <div className="max-w-md mx-auto animate-in slide-in-from-bottom-4 duration-500 pt-10">
          <header className="text-center mb-10">
            <h2 className="text-3xl font-display font-bold text-stone-800 dark:text-stone-100 mb-2 uppercase tracking-tight">New Sangha</h2>
            <p className="text-stone-500 font-serif">Form a sacred practice community.</p>
            {!isPremium && (
               <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-4 py-2 rounded-full font-bold">
                 <Info size={14} /> Basic Limit: 2 Sanghas, 25 members each. Premium creators have no limits.
               </div>
            )}
          </header>

          <form onSubmit={handleCreateSubmit} className="space-y-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] ml-4">Sangha Name</label>
              <input 
                type="text" 
                value={newGroupName} 
                onChange={e => setNewGroupName(e.target.value)} 
                placeholder="e.g. Morning Meditation Circle" 
                className="w-full p-5 border-2 border-stone-100 focus:border-black dark:border-stone-800 dark:focus:border-stone-400 rounded-[2rem] bg-white dark:bg-stone-900 text-lg font-bold outline-none transition-all placeholder:font-normal placeholder:text-stone-300 text-black dark:text-white" 
                required 
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] ml-4">Group Description</label>
              <textarea 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                placeholder="What is the purpose of this sangha?" 
                className="w-full p-5 border-2 border-stone-100 focus:border-black dark:border-stone-800 dark:focus:border-stone-400 rounded-[2rem] bg-white dark:bg-stone-900 text-base font-medium outline-none transition-all h-32 resize-none placeholder:text-stone-300 text-black dark:text-white"
                required
              />
            </div>
            
            <div className="flex gap-4 pt-4">
              <button 
                type="button" 
                onClick={() => setMode('LIST')} 
                className="flex-1 py-5 text-stone-500 font-black uppercase tracking-widest text-xs hover:text-stone-800 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={!newGroupName || !description} 
                className="flex-1 py-5 bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-950 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] disabled:opacity-30 shadow-xl active:scale-95 transition-all"
              >
                Create Circle
              </button>
            </div>
          </form>
        </div>
      )}

      {mode === 'JOIN' && (
        <div className="max-w-md mx-auto pt-10 animate-in slide-in-from-bottom-4 duration-500">
          <header className="text-center mb-10">
            <h2 className="text-3xl font-display font-bold text-stone-800 dark:text-stone-100 mb-2 uppercase tracking-tight">Join Circle</h2>
            <p className="text-stone-500 font-serif">Enter a unique ID to enter a sangha.</p>
          </header>
          
          <div className="space-y-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] ml-4">Sangha ID</label>
              <input 
                type="text" 
                value={joinId} 
                onChange={e => setJoinId(e.target.value)} 
                placeholder="Enter 36-digit ID" 
                className="w-full p-5 border-2 border-stone-100 focus:border-black dark:border-stone-800 dark:focus:border-stone-400 rounded-[2rem] bg-white dark:bg-stone-900 font-mono text-sm outline-none transition-all placeholder:font-sans placeholder:text-stone-300 text-black dark:text-white" 
              />
            </div>
            
            <div className="flex gap-4 pt-4">
              <button 
                onClick={() => setMode('LIST')} 
                className="flex-1 py-5 text-stone-500 font-black uppercase tracking-widest text-xs hover:text-stone-800 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => { onJoinGroup(joinId); setMode('LIST'); }} 
                disabled={!joinId}
                className="flex-1 py-5 bg-mystic-600 text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-xl disabled:opacity-30 active:scale-95 transition-all"
              >
                Join Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupAdmin;
