
import React, { useState } from 'react';
import { Announcement } from '../types';
import { X, Bell, Send, User, Clock } from 'lucide-react';

interface NoticeBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  announcements: Announcement[];
  onAddAnnouncement: (text: string) => void;
  isPremium: boolean;
  groupName: string;
}

const NoticeBoardModal: React.FC<NoticeBoardModalProps> = ({ isOpen, onClose, announcements, onAddAnnouncement, isPremium, groupName }) => {
  const [newAnnouncement, setNewAnnouncement] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAnnouncement.trim()) {
      onAddAnnouncement(newAnnouncement);
      setNewAnnouncement('');
    }
  };

  return (
    <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-gradient-to-r from-mystic-50 to-white">
          <div className="flex items-center gap-3">
            <div className="bg-mystic-100 p-2 rounded-lg text-mystic-700">
              <Bell size={20} />
            </div>
            <div>
              <h3 className="font-serif font-bold text-stone-800">Sangha Notice Board</h3>
              <p className="text-xs text-stone-500">{groupName}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-800">
            <X size={20} />
          </button>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50/50">
          {announcements && announcements.length > 0 ? (
            announcements.map((a) => (
              <div key={a.id} className="bg-white p-4 rounded-xl shadow-sm border border-stone-100">
                <p className="text-stone-800 font-serif text-sm leading-relaxed whitespace-pre-wrap">{a.text}</p>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-stone-50 text-xs text-stone-400">
                   <div className="flex items-center gap-1">
                     <User size={12} /> <span>{a.authorName}</span>
                   </div>
                   <div className="flex items-center gap-1">
                     <Clock size={12} /> <span>{new Date(a.date).toLocaleDateString()}</span>
                   </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-stone-400">
              <Bell className="mx-auto mb-2 opacity-20" size={48} />
              <p className="text-sm font-serif italic">Silence in the hall. No announcements yet.</p>
            </div>
          )}
        </div>

        {/* Input Area (Premium Only) */}
        <div className="p-4 bg-white border-t border-stone-100">
          {isPremium ? (
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input 
                type="text" 
                value={newAnnouncement}
                onChange={(e) => setNewAnnouncement(e.target.value)}
                placeholder="Share a message with the sangha..."
                className="flex-1 px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-mystic-400 text-sm"
              />
              <button 
                type="submit"
                disabled={!newAnnouncement.trim()}
                className="bg-mystic-600 hover:bg-mystic-700 text-white px-4 rounded-xl disabled:opacity-50 transition-colors"
              >
                <Send size={18} />
              </button>
            </form>
          ) : (
            <div className="text-center p-2 bg-stone-50 rounded-xl border border-stone-100 border-dashed">
               <p className="text-xs text-stone-500">Only Premium members can post announcements.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default NoticeBoardModal;