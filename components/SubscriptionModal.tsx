
import React from 'react';
import { Check, Star, X, Shield, Users, BarChart3 } from 'lucide-react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, onUpgrade }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 bg-stone-100 rounded-full flex items-center justify-center text-stone-500 hover:bg-stone-200 transition-colors"
        >
          <X size={16} />
        </button>

        <div className="bg-gradient-to-br from-stone-900 to-stone-800 p-8 text-center text-white">
          <div className="w-16 h-16 bg-saffron-500 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-saffron-500/20">
            <Star size={32} className="text-white" fill="currentColor" />
          </div>
          <h2 className="text-2xl font-serif font-bold mb-2">Upgrade to Premium</h2>
          <p className="text-stone-300 text-sm">Unlock the full power of your spiritual community.</p>
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-100 text-green-600 rounded-lg mt-1">
                <Users size={18} />
              </div>
              <div>
                <p className="font-bold text-stone-800">Unlimited Members</p>
                <p className="text-xs text-stone-500">Add more than 20 members to your groups.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg mt-1">
                <Shield size={18} />
              </div>
              <div>
                <p className="font-bold text-stone-800">Unlimited Groups</p>
                <p className="text-xs text-stone-500">Create as many chanting circles as you need.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-100 text-purple-600 rounded-lg mt-1">
                <BarChart3 size={18} />
              </div>
              <div>
                <p className="font-bold text-stone-800">Detailed Analytics</p>
                <p className="text-xs text-stone-500">Access leaderboards, member consistency stats, and deep insights.</p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-stone-100">
            <div className="flex justify-between items-end mb-6">
              <div>
                <p className="text-sm text-stone-500 line-through">$9.99</p>
                <p className="text-3xl font-bold text-stone-900">$4.99<span className="text-sm font-normal text-stone-500">/mo</span></p>
              </div>
              <span className="bg-saffron-100 text-saffron-700 px-3 py-1 rounded-full text-xs font-bold">
                Save 50%
              </span>
            </div>

            <button 
              onClick={onUpgrade}
              className="w-full bg-stone-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-stone-800 shadow-lg shadow-stone-200 transition-transform active:scale-[0.98] flex items-center justify-center gap-2"
            >
              Upgrade Now <Check size={20} />
            </button>
            <p className="text-center text-xs text-stone-400 mt-4">Cancel anytime. Secure payment.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;
