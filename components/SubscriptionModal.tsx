
import React, { useState, useEffect } from 'react';
import { Check, Star, X, Users, BarChart3, CreditCard, Lock, Loader2, CheckCircle, Bell, Sparkles } from 'lucide-react';
import { initializeRazorpay } from '../services/paymentService';
import { authService } from '../services/auth';
import { UserProfile } from '../types';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, onUpgrade }) => {
  const [step, setStep] = useState<'BENEFITS' | 'PROCESSING' | 'SUCCESS'>('BENEFITS');
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStep('BENEFITS');
      authService.getCurrentUser().then(setUser);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartPayment = () => {
    if (!user) return;
    
    // Switch to processing state while user interacts with Razorpay
    setStep('PROCESSING');
    
    initializeRazorpay(
      user,
      (paymentId) => {
        // Success Handler
        setStep('SUCCESS');
        setTimeout(() => {
          onUpgrade(); // This updates the app state
          onClose();
        }, 2000);
      },
      () => {
        // Cancel/Dismiss Handler
        setStep('BENEFITS');
      }
    );
  };

  return (
    <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-[70] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-stone-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative max-h-[90vh] border border-stone-100 dark:border-stone-800">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center text-stone-500 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors z-10"
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="bg-gradient-to-br from-stone-900 to-stone-800 dark:from-stone-950 dark:to-stone-900 p-8 text-center text-white relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent scale-150"></div>
          <div className="w-16 h-16 bg-saffron-500 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-saffron-500/20 relative z-10">
            <Star size={32} className="text-white" fill="currentColor" />
          </div>
          <h2 className="text-2xl font-serif font-bold mb-2 relative z-10">Sacred Sanctuary</h2>
          <p className="text-stone-300 text-sm relative z-10">Unlimited growth for your spiritual journey.</p>
        </div>

        {step === 'BENEFITS' && (
            <div className="p-8 space-y-6 animate-in slide-in-from-right-4">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-saffron-50 dark:bg-saffron-900/20 text-saffron-600 dark:text-saffron-400 rounded-lg mt-1">
                    <Users size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-stone-800 dark:text-stone-100">Unlimited Sanghas</p>
                    <p className="text-xs text-stone-500 dark:text-stone-400">Join and create as many circles as your heart desires.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2 bg-mystic-50 dark:bg-mystic-900/20 text-mystic-600 dark:text-mystic-400 rounded-lg mt-1">
                    <BarChart3 size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-stone-800 dark:text-stone-100">Advanced Analytics</p>
                    <p className="text-xs text-stone-500 dark:text-stone-400">Detailed CSV exports and historical trend mapping.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg mt-1">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-stone-800 dark:text-stone-100">Inform Members</p>
                    <p className="text-xs text-stone-500 dark:text-stone-400">Access to post in Sangha Notice Board.</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-stone-100 dark:border-stone-800">
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <p className="text-sm text-stone-500 line-through">₹299</p>
                    <p className="text-3xl font-display font-bold text-stone-900 dark:text-stone-100">₹100<span className="text-sm font-normal text-stone-500">/mo</span></p>
                  </div>
                  <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-3 py-1 rounded-full text-xs font-bold">
                    66% Off Today
                  </span>
                </div>

                <button 
                  onClick={handleStartPayment}
                  className="w-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 py-4 rounded-xl font-bold text-lg hover:bg-stone-800 dark:hover:bg-stone-200 shadow-lg shadow-stone-200 dark:shadow-none transition-transform active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  Checkout with Razorpay <CreditCard size={20} />
                </button>
                <div className="flex items-center justify-center gap-2 text-[10px] text-stone-400 mt-4 uppercase tracking-widest font-bold">
                  <Lock size={10} /> Secure SSL Encrypted Payment
                </div>
              </div>
            </div>
        )}

        {step === 'PROCESSING' && (
            <div className="p-12 h-80 flex flex-col items-center justify-center text-center animate-in fade-in">
                <Loader2 className="animate-spin text-saffron-500 mb-6" size={48} />
                <h3 className="text-xl font-serif font-bold text-stone-800 dark:text-stone-100 mb-2">Awaiting Offering...</h3>
                <p className="text-stone-500 text-sm font-serif">Secure payment window is active. Please complete the transaction in the Razorpay popup.</p>
            </div>
        )}

        {step === 'SUCCESS' && (
            <div className="p-12 h-80 flex flex-col items-center justify-center text-center animate-in zoom-in">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 mb-6">
                    <CheckCircle size={32} />
                </div>
                <h3 className="text-xl font-serif font-bold text-stone-800 dark:text-stone-100 mb-2">Sacred Space Unlocked</h3>
                <p className="text-stone-500 text-sm font-serif italic">"Your path is now illuminated with deeper insights."</p>
            </div>
        )}

      </div>
    </div>
  );
};

export default SubscriptionModal;
