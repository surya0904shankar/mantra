
import React, { useState } from 'react';
import { Group, Mantra } from '../types';
import { Plus, Users, Search, Sparkles, Copy, Check, ArrowRight, BarChart3, Lock } from 'lucide-react';
import { getMantraSuggestions } from '../services/geminiService';
import GroupAnalytics from './GroupAnalytics';

interface GroupAdminProps {
  groups: Group[];
  onCreateGroup: (group: Group) => void;
  onJoinGroup: (groupId: string) => void;
  onSelectGroup: (group: Group) => void;
  isPremium: boolean;
  onTriggerUpgrade: () => void;
  currentUserId: string;
  currentUserName: string;
}

const GroupAdmin: React.FC<GroupAdminProps> = ({ groups, onCreateGroup, onJoinGroup, onSelectGroup, isPremium, onTriggerUpgrade, currentUserId, currentUserName }) => {
  const [mode, setMode] = useState<'LIST' | 'CREATE' | 'JOIN'>('LIST');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [analyzingGroup, setAnalyzingGroup] = useState<Group | null>(null);

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
      totalGroupCount: 0
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

  if (analyzingGroup) {
    return (
      <GroupAnalytics 
        group={analyzingGroup} 
        isPremium={isPremium} 
        onUpgradeClick={onTriggerUpgrade} 
        onClose={() => setAnalyzingGroup(null)}
      />
    );
  }

  if (mode === 'CREATE') {
    return (
      <div className="max-w-lg mx-auto animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-serif font-bold text-stone-800">Create Sankalpa Group</h2>
          <button onClick={() => setMode('LIST')} className="text-sm text-stone-500 hover:text-stone-800">Cancel</button>
        </div>

        <form onSubmit={handleCreateSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Group Name</label>
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="e.g., Morning Peace Circle"
              className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-saffron-400 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Intention (for Mantra AI)</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={intention}
                onChange={(e) => setIntention(e.target.value)}
                placeholder="e.g., Healing, Focus, Prosperity"
                className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-saffron-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleGenerateMantras}
                disabled={isGenerating || !intention}
                className="bg-saffron-100 text-saffron-700 px-4 rounded-xl hover:bg-saffron-200 disabled:opacity-50 whitespace-nowrap flex items-center gap-2 font-medium"
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
                      ? 'border-saffron-500 bg-saffron-50' 
                      : 'border-stone-200 hover:border-saffron-300'
                  }`}
                >
                  <p className="font-serif font-medium text-stone-800">{s.text}</p>
                  <p className="text-xs text-stone-500 mt-1 line-clamp-2">{s.meaning}</p>
                  <div className="mt-2 flex items-center gap-2 text-xs text-stone-400">
                     <span className="bg-white px-2 py-0.5 rounded border border-stone-100">Target: {s.targetCount}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            type="submit"
            disabled={!newGroupName || !selectedSuggestion}
            className="w-full bg-stone-900 text-white py-4 rounded-xl font-medium hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Create Group
          </button>
        </form>
      </div>
    );
  }

  if (mode === 'JOIN') {
    return (
      <div className="max-w-md mx-auto animate-in slide-in-from-bottom-4 duration-300 pt-10">
        <h2 className="text-2xl font-serif font-bold text-stone-800 mb-6 text-center">Join a Circle</h2>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100">
            <label className="block text-sm font-medium text-stone-700 mb-2">Enter Group ID</label>
            <input
              type="text"
              value={joinId}
              onChange={(e) => setJoinId(e.target.value)}
              placeholder="Paste ID here..."
              className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-teal-500 focus:outline-none mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => setMode('LIST')} className="flex-1 py-3 text-stone-500 font-medium hover:bg-stone-50 rounded-xl">
                Back
              </button>
              <button 
                onClick={() => { onJoinGroup(joinId); setMode('LIST'); setJoinId(''); }}
                disabled={!joinId}
                className="flex-1 bg-teal-700 hover:bg-teal-800 text-white py-3 rounded-xl font-medium disabled:opacity-50 transition-colors"
              >
                Join Now
              </button>
            </div>
        </div>
      </div>
    );
  }

  // LIST MODE
  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-stone-800">Your Groups</h2>
          <p className="text-stone-500 text-sm">Manage your circles and shared practices.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button 
            onClick={() => setMode('JOIN')}
            className="flex-1 sm:flex-none px-5 py-2.5 bg-white border border-stone-200 text-stone-700 rounded-xl font-medium hover:bg-stone-50 transition-colors flex items-center justify-center gap-2"
          >
            <Search size={18} /> Join
          </button>
          <button 
            onClick={handleCreateClick}
            className="flex-1 sm:flex-none px-5 py-2.5 bg-stone-900 text-white rounded-xl font-medium hover:bg-stone-800 transition-colors flex items-center justify-center gap-2 relative overflow-hidden"
          >
            <Plus size={18} /> Create
            {!canCreateGroup && (
              <div className="absolute inset-0 bg-stone-900/80 flex items-center justify-center text-white/90 text-xs font-bold backdrop-blur-[1px]">
                <Lock size={12} className="mr-1" /> Limit Reached
              </div>
            )}
          </button>
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="text-center py-20 bg-stone-50 border-2 border-dashed border-stone-200 rounded-2xl">
          <Users className="mx-auto text-stone-300 mb-4" size={48} />
          <p className="text-stone-500 font-medium">You haven't joined any groups yet.</p>
          <p className="text-stone-400 text-sm mt-1">Create one or join a friend's circle.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groups.map(group => (
            <div key={group.id} className="bg-white p-5 rounded-2xl shadow-sm border border-stone-100 hover:shadow-md transition-shadow group relative flex flex-col justify-between h-full">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-serif font-bold text-lg text-stone-800">{group.name}</h3>
                    <p className="text-xs text-stone-500 font-mono bg-stone-100 inline-block px-2 py-0.5 rounded mt-1">ID: {group.id}</p>
                  </div>
                  <button 
                    onClick={() => copyToClipboard(group.id)}
                    className="text-stone-400 hover:text-teal-600 transition-colors p-2"
                    title="Copy ID to share"
                  >
                    {copiedId === group.id ? <Check size={16} className="text-green-600"/> : <Copy size={16} />}
                  </button>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-stone-600 italic">"{group.mantra.text}"</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-stone-50 flex flex-col gap-3">
                 <div className="flex items-center gap-2 text-xs text-stone-500">
                    <Users size={14} />
                    <span>{group.members.length} members</span>
                    <span className="mx-1">•</span>
                    <span>{group.totalGroupCount} total chants</span>
                  </div>

                  <div className="flex gap-2">
                     <button
                       onClick={() => setAnalyzingGroup(group)}
                       className="flex-1 bg-stone-50 text-stone-600 text-sm font-medium py-2 rounded-lg hover:bg-stone-100 transition-colors flex items-center justify-center gap-1"
                     >
                       <BarChart3 size={14} /> Insights
                     </button>
                     <button 
                      onClick={() => onSelectGroup(group)}
                      className="flex-1 bg-stone-900 text-white font-medium text-sm py-2 rounded-lg flex items-center justify-center gap-1 hover:bg-stone-800 transition-all"
                    >
                      Practice <ArrowRight size={14} />
                    </button>
                  </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GroupAdmin;
