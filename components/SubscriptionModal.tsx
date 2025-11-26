
import React, { useState, useEffect } from 'react';
import { Check, Star, X, Shield, Users, BarChart3, CreditCard, Lock, Loader2, CheckCircle, Music, Sparkles, Palette } from 'lucide-react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, onUpgrade }) => {
  const [step, setStep] = useState<'BENEFITS' | 'PAYMENT' | 'PROCESSING' | 'SUCCESS'>('BENEFITS');
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    expiry: '',
    cvc: '',
    name: ''
  });

  // Reset step when opening
  useEffect(() => {
    if(isOpen) setStep('BENEFITS');
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('PROCESSING');
    
    // Simulate Payment Gateway Steps
    setTimeout(() => {
        setStep('SUCCESS');
        setTimeout(() => {
            onUpgrade();
        }, 1500);
    }, 3000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPaymentDetails(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-[70] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-stone-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative max-h-[90vh] overflow-y-auto no-scrollbar">
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
          <h2 className="text-2xl font-serif font-bold mb-2 relative z-10">Premium Sanctuary</h2>
          <p className="text-stone-300 text-sm relative z-10">Elevate your spiritual practice.</p>
        </div>

        {step === 'BENEFITS' && (
            <div className="p-8 space-y-6 animate-in slide-in-from-right-4">
            <div className="space-y-4">
                <div className="flex items-start gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg mt-1">
                    <Users size={18} />
                </div>
                <div>
                    <p className="font-bold text-stone-800 dark:text-stone-100">Unlimited Community</p>
                    <p className="text-xs text-stone-500 dark:text-stone-400">Create unlimited groups and accept unlimited members.</p>
                </div>
                </div>

                <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg mt-1">
                    <BarChart3 size={18} />
                </div>
                <div>
                    <p className="font-bold text-stone-800 dark:text-stone-100">Deep Analytics</p>
                    <p className="text-xs text-stone-500 dark:text-stone-400">Export data to CSV and view advanced trend charts.</p>
                </div>
                </div>

                <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg mt-1">
                    <Music size={18} />
                </div>
                <div>
                    <p className="font-bold text-stone-800 dark:text-stone-100">Ambient Soundscapes</p>
                    <p className="text-xs text-stone-500 dark:text-stone-400">Chant with background Om, rain, or temple sounds.</p>
                </div>
                </div>
                
                <div className="flex items-start gap-3">
                <div className="p-2 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-lg mt-1">
                    <Palette size={18} />
                </div>
                <div>
                    <p className="font-bold text-stone-800 dark:text-stone-100">Custom Themes</p>
                    <p className="text-xs text-stone-500 dark:text-stone-400">Personalize your background with sacred imagery.</p>
                </div>
                </div>

                <div className="flex items-start gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg mt-1">
                    <Sparkles size={18} />
                </div>
                <div>
                    <p className="font-bold text-stone-800 dark:text-stone-100">Priority AI Insight</p>
                    <p className="text-xs text-stone-500 dark:text-stone-400">Extended context and faster responses from AI guide.</p>
                </div>
                </div>
            </div>

            <div className="pt-6 border-t border-stone-100 dark:border-stone-800">
                <div className="flex justify-between items-end mb-6">
                <div>
                    <p className="text-sm text-stone-500 line-through">$9.99</p>
                    <p className="text-3xl font-bold text-stone-900 dark:text-stone-100">$4.99<span className="text-sm font-normal text-stone-500">/mo</span></p>
                </div>
                <span className="bg-saffron-100 text-saffron-700 dark:bg-saffron-900/30 dark:text-saffron-300 px-3 py-1 rounded-full text-xs font-bold">
                    Save 50%
                </span>
                </div>

                <button 
                onClick={() => setStep('PAYMENT')}
                className="w-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 py-4 rounded-xl font-bold text-lg hover:bg-stone-800 dark:hover:bg-stone-200 shadow-lg shadow-stone-200 dark:shadow-none transition-transform active:scale-[0.98] flex items-center justify-center gap-2"
                >
                Upgrade Now <Check size={20} />
                </button>
                <p className="text-center text-xs text-stone-400 mt-4">Cancel anytime. Secure payment.</p>
            </div>
            </div>
        )}

        {step === 'PAYMENT' && (
            <div className="p-8 animate-in slide-in-from-right-4">
                <div className="flex items-center gap-2 mb-6 text-stone-500 cursor-pointer hover:text-stone-800 dark:hover:text-stone-300" onClick={() => setStep('BENEFITS')}>
                    <span className="text-xs font-bold">← Back to Plan</span>
                </div>
                
                <h3 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-4 flex items-center gap-2">
                    <CreditCard size={20} /> Secure Checkout
                </h3>

                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-stone-500 uppercase ml-1">Cardholder Name</label>
                        <input 
                            type="text"
                            name="name"
                            value={paymentDetails.name}
                            onChange={handleInputChange}
                            placeholder="Name on card"
                            required
                            className="w-full p-3 rounded-xl border border-stone-200 dark:border-stone-700 focus:ring-2 focus:ring-stone-400 focus:outline-none transition-shadow bg-white dark:bg-stone-800 text-stone-900 dark:text-white"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-stone-500 uppercase ml-1">Card Number</label>
                        <div className="relative">
                            <CreditCard className="absolute left-3 top-3 text-stone-400" size={18} />
                            <input 
                                type="text"
                                name="cardNumber"
                                value={paymentDetails.cardNumber}
                                onChange={handleInputChange}
                                placeholder="0000 0000 0000 0000"
                                maxLength={19}
                                required
                                className="w-full pl-10 p-3 rounded-xl border border-stone-200 dark:border-stone-700 focus:ring-2 focus:ring-stone-400 focus:outline-none transition-shadow font-mono bg-white dark:bg-stone-800 text-stone-900 dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="space-y-1 flex-1">
                            <label className="text-xs font-bold text-stone-500 uppercase ml-1">Expiry</label>
                            <input 
                                type="text"
                                name="expiry"
                                value={paymentDetails.expiry}
                                onChange={handleInputChange}
                                placeholder="MM/YY"
                                maxLength={5}
                                required
                                className="w-full p-3 rounded-xl border border-stone-200 dark:border-stone-700 focus:ring-2 focus:ring-stone-400 focus:outline-none transition-shadow font-mono text-center bg-white dark:bg-stone-800 text-stone-900 dark:text-white"
                            />
                        </div>
                        <div className="space-y-1 flex-1">
                            <label className="text-xs font-bold text-stone-500 uppercase ml-1">CVC</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 text-stone-400" size={16} />
                                <input 
                                    type="text"
                                    name="cvc"
                                    value={paymentDetails.cvc}
                                    onChange={handleInputChange}
                                    placeholder="123"
                                    maxLength={4}
                                    required
                                    className="w-full pl-9 p-3 rounded-xl border border-stone-200 dark:border-stone-700 focus:ring-2 focus:ring-stone-400 focus:outline-none transition-shadow font-mono bg-white dark:bg-stone-800 text-stone-900 dark:text-white"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-stone-50 dark:bg-stone-800 p-3 rounded-lg flex justify-between items-center text-sm text-stone-600 dark:text-stone-300 mt-4">
                        <span>Total due:</span>
                        <span className="font-bold text-stone-900 dark:text-stone-100">$4.99</span>
                    </div>

                    <button 
                        type="submit"
                        className="w-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 py-4 rounded-xl font-bold text-lg hover:bg-stone-800 dark:hover:bg-stone-200 shadow-lg shadow-stone-200 dark:shadow-none transition-transform active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
                    >
                         Pay $4.99
                    </button>
                    
                    <div className="flex items-center justify-center gap-2 text-xs text-stone-400">
                        <Lock size={10} /> Payments secured by 256-bit SSL
                    </div>
                </form>
            </div>
        )}

        {step === 'PROCESSING' && (
            <div className="p-8 h-80 flex flex-col items-center justify-center text-center animate-in fade-in">
                <Loader2 className="animate-spin text-saffron-500 mb-6" size={48} />
                <h3 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-2">Processing Payment...</h3>
                <p className="text-stone-500 text-sm">Please do not close this window.</p>
            </div>
        )}

        {step === 'SUCCESS' && (
            <div className="p-8 h-80 flex flex-col items-center justify-center text-center animate-in zoom-in">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 mb-6">
                    <CheckCircle size={32} />
                </div>
                <h3 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-2">Payment Successful!</h3>
                <p className="text-stone-500 text-sm">Welcome to OmCounter Premium.</p>
            </div>
        )}

      </div>
    </div>
  );
};

export default SubscriptionModal;
