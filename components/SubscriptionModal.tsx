
import React, { useState, useEffect } from 'react';
import { Check, Star, X, Shield, Users, BarChart3, CreditCard, Lock, Loader2, CheckCircle } from 'lucide-react';

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
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative max-h-[90vh] overflow-y-auto no-scrollbar">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 bg-stone-100 rounded-full flex items-center justify-center text-stone-500 hover:bg-stone-200 transition-colors z-10"
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="bg-gradient-to-br from-stone-900 to-stone-800 p-8 text-center text-white relative overflow-hidden">
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
                <div className="p-2 bg-green-100 text-green-600 rounded-lg mt-1">
                    <Users size={18} />
                </div>
                <div>
                    <p className="font-bold text-stone-800">Unlimited Members</p>
                    <p className="text-xs text-stone-500">Break the 25-member limit in your groups.</p>
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
                    <p className="font-bold text-stone-800">Deep Analytics</p>
                    <p className="text-xs text-stone-500">Export data to CSV and view advanced charts.</p>
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
                onClick={() => setStep('PAYMENT')}
                className="w-full bg-stone-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-stone-800 shadow-lg shadow-stone-200 transition-transform active:scale-[0.98] flex items-center justify-center gap-2"
                >
                Upgrade Now <Check size={20} />
                </button>
                <p className="text-center text-xs text-stone-400 mt-4">Cancel anytime. Secure payment.</p>
            </div>
            </div>
        )}

        {step === 'PAYMENT' && (
            <div className="p-8 animate-in slide-in-from-right-4">
                <div className="flex items-center gap-2 mb-6 text-stone-500 cursor-pointer hover:text-stone-800" onClick={() => setStep('BENEFITS')}>
                    <span className="text-xs font-bold">← Back to Plan</span>
                </div>
                
                <h3 className="text-xl font-bold text-stone-800 mb-4 flex items-center gap-2">
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
                            className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-400 focus:outline-none transition-shadow"
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
                                className="w-full pl-10 p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-400 focus:outline-none transition-shadow font-mono"
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
                                className="w-full p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-400 focus:outline-none transition-shadow font-mono text-center"
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
                                    className="w-full pl-9 p-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-400 focus:outline-none transition-shadow font-mono"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-stone-50 p-3 rounded-lg flex justify-between items-center text-sm text-stone-600 mt-4">
                        <span>Total due:</span>
                        <span className="font-bold text-stone-900">$4.99</span>
                    </div>

                    <button 
                        type="submit"
                        className="w-full bg-stone-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-stone-800 shadow-lg shadow-stone-200 transition-transform active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
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
                <h3 className="text-xl font-bold text-stone-800 mb-2">Processing Payment...</h3>
                <p className="text-stone-500 text-sm">Please do not close this window.</p>
            </div>
        )}

        {step === 'SUCCESS' && (
            <div className="p-8 h-80 flex flex-col items-center justify-center text-center animate-in zoom-in">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6">
                    <CheckCircle size={32} />
                </div>
                <h3 className="text-xl font-bold text-stone-800 mb-2">Payment Successful!</h3>
                <p className="text-stone-500 text-sm">Welcome to OmCounter Premium.</p>
            </div>
        )}

      </div>
    </div>
  );
};

export default SubscriptionModal;
