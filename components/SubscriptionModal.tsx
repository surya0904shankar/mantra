
import React, { useState, useEffect } from 'react';
import { Check, Star, X, Users, BarChart3, CreditCard, Lock, Loader2, CheckCircle, Bell, Sparkles, Maximize2, Zap, MessageSquare } from 'lucide-react';
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
    setStep('PROCESSING');
    initializeRazorpay(user, () => {
        setStep('SUCCESS');
        setTimeout(() => { onUpgrade(); onClose(); }, 2000);
      }, () => setStep('BENEFITS')
    );
  };

  const Feature = ({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) => (
    <div className="flex items-start gap-4">
      <div className="p-2 bg-saffron-50 dark:bg-saffron-900/20 text-saffron-600 dark:text-saffron-400 rounded-lg mt-1 shrink-0">
        <Icon size={20} />
      </div>
      <div>
        <p className="font-bold text-stone-800 dark:text-stone-100 text-sm">{title}</p>
        <p className="text-[10px] text-stone-500 dark:text-stone-400">{desc}</p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-[70] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-stone-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative max-h-[90vh] border border-stone-100 dark:border-stone-800">
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center text-stone-500 z-10"><X size={16} /></button>

        <div className="bg-gradient-to-br from-stone-900 to-stone-800 p-8 text-center text-white relative">
          <div className="w-16 h-16 bg-saffron-500 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg"><Star size={32} className="text-white" fill="currentColor" /></div>
          <h2 className="text-2xl font-serif font-bold mb-2">Sacred Sanctuary</h2>
          <p className="text-stone-300 text-sm">Elevate your spiritual discipline.</p>
        </div>

        {step === 'BENEFITS' && (
            <div className="p-8 space-y-6 animate-in slide-in-from-right-4 overflow-y-auto max-h-[60vh] no-scrollbar">
              <div className="space-y-4">
                <Feature icon={Maximize2} title="Zen Focus Mode" desc="Distraction-free interface with soft haptics and breath pacing animation." />
                <Feature icon={Zap} title="Experience & Customization" desc="Choose premium bell sounds, Mala sounds, and adjust vibration patterns." />
                <Feature icon={MessageSquare} title="Sangha Notice Board" desc="Lead your community with announcements in any Sangha you manage." />
                <Feature icon={Users} title="Unlimited Sanghas" desc="Create or join circles without any member or group limits." />
                <Feature icon={BarChart3} title="Deep Insights" desc="Export detailed CSV logs and view historical practice analytics." />
                <Feature icon={Sparkles} title="AI Guide Pro" desc="Personalized deeper recommendations and historical mantra context." />
              </div>

              <div className="pt-6 border-t border-stone-100 dark:border-stone-800">
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <p className="text-sm text-stone-500 line-through">₹299</p>
                    <p className="text-3xl font-display font-bold text-stone-900 dark:text-stone-100">₹100<span className="text-sm font-normal text-stone-500">/mo</span></p>
                  </div>
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Early Disciple Offer</span>
                </div>
                <button onClick={handleStartPayment} className="w-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 py-4 rounded-xl font-bold text-lg hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2">Secure Checkout <CreditCard size={20} /></button>
                <div className="flex items-center justify-center gap-2 text-[10px] text-stone-400 mt-4 uppercase tracking-widest font-bold"><Lock size={10} /> Secure SSL Encrypted Payment</div>
              </div>
            </div>
        )}

        {step === 'PROCESSING' && (
            <div className="p-12 h-80 flex flex-col items-center justify-center text-center"><Loader2 className="animate-spin text-saffron-500 mb-6" size={48} /><h3 className="text-xl font-serif font-bold text-stone-800 mb-2">Preparing Sacred Space...</h3></div>
        )}

        {step === 'SUCCESS' && (
            <div className="p-12 h-80 flex flex-col items-center justify-center text-center"><div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6"><CheckCircle size={32} /></div><h3 className="text-xl font-serif font-bold text-stone-800 mb-2">Journey Unlocked</h3><p className="text-stone-500 text-sm font-serif italic">"Your path is now illuminated with deeper insights."</p></div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionModal;
