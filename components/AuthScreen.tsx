
import React, { useState } from 'react';
import { authService } from '../services/auth';
import { UserProfile } from '../types';
import { Loader2, ArrowRight, Mail, Lock, User, CheckCircle } from 'lucide-react';
import SacredLogo from './SacredLogo';

interface AuthScreenProps {
  onAuthSuccess: (user: UserProfile) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        const user = await authService.login(formData.email, formData.password);
        if (user) onAuthSuccess(user);
      } else {
        if (!formData.name) throw new Error("Name is required");
        const user = await authService.register(formData.name, formData.email, formData.password);
        if (user) onAuthSuccess(user);
        else setVerificationSent(true);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setIsLoading(true);
    try {
      await authService.loginWithGoogle();
    } catch (err: any) {
      setError(err.message || "Google login failed");
      setIsLoading(false);
    }
  };

  if (verificationSent) {
      return (
        <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex items-center justify-center p-4 transition-colors duration-300">
          <div className="bg-white dark:bg-stone-900 w-full max-w-md rounded-3xl shadow-xl overflow-hidden border border-stone-100 dark:border-stone-800 animate-in fade-in zoom-in-95 duration-500 p-10 text-center">
             <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 dark:text-green-400">
                <CheckCircle size={32} />
             </div>
             <h2 className="text-2xl font-serif font-bold text-stone-800 dark:text-stone-100 mb-2">Check your Inbox</h2>
             <p className="text-stone-500 dark:text-stone-400 mb-8">
                We have sent a verification link to <span className="font-bold text-stone-700 dark:text-stone-300">{formData.email}</span>. Please verify your email to unlock your sacred space.
             </p>
             <button 
                onClick={() => { setVerificationSent(false); setIsLogin(true); }}
                className="w-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 py-3 rounded-xl font-bold hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors"
             >
                Return to Login
             </button>
          </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex items-center justify-center p-4 transition-colors duration-300">
      <div className="bg-white dark:bg-stone-900 w-full max-w-md rounded-3xl shadow-xl overflow-hidden border border-stone-100 dark:border-stone-800 animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-gradient-to-br from-saffron-400 to-saffron-600 p-10 text-center text-white relative overflow-hidden flex flex-col items-center">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent scale-150"></div>
          <SacredLogo size="xl" className="mb-4 relative z-10" />
          <h1 className="font-serif font-bold text-4xl mb-2 relative z-10">OmCounter</h1>
          <p className="text-saffron-50 font-medium relative z-10">Your Spiritual Journey Begins Here</p>
        </div>
        <div className="p-8">
          <button type="button" onClick={handleGoogleLogin} disabled={isLoading} className="w-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-200 py-3 rounded-xl font-bold hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors flex items-center justify-center gap-3 mb-2 shadow-sm">
            <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </button>
          <div className="flex items-center gap-4 mb-6"><div className="h-px bg-stone-200 dark:bg-stone-700 flex-1"></div><span className="text-xs text-stone-400 font-medium uppercase">or email</span><div className="h-px bg-stone-200 dark:bg-stone-700 flex-1"></div></div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-500 uppercase ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-stone-400" size={18} />
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 focus:ring-2 focus:ring-saffron-400 focus:outline-none transition-shadow bg-white text-black" placeholder="Enter your name" />
                </div>
              </div>
            )}
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-500 uppercase ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-stone-400" size={18} />
                <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 focus:ring-2 focus:ring-saffron-400 focus:outline-none transition-shadow bg-white text-black" placeholder="hello@example.com" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-500 uppercase ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-stone-400" size={18} />
                <input type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 focus:ring-2 focus:ring-saffron-400 focus:outline-none transition-shadow bg-white text-black" placeholder="••••••••" />
              </div>
            </div>
            {error && <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 text-sm rounded-lg text-center">{error}</div>}
            <button type="submit" disabled={isLoading} className="w-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 py-4 rounded-xl font-bold text-lg hover:bg-stone-800 dark:hover:bg-stone-200 shadow-lg shadow-stone-200 dark:shadow-none transition-transform active:scale-[0.98] flex items-center justify-center gap-2 mt-4">
              {isLoading ? <Loader2 className="animate-spin" /> : <>{isLogin ? 'Log In' : 'Create Account'} <ArrowRight size={20} /></>}
            </button>
          </form>
          <div className="mt-6 text-center"><button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="text-stone-500 dark:text-stone-400 text-sm hover:text-saffron-600 dark:hover:text-saffron-400 font-medium">{isLogin ? "Don't have an account? Sign Up" : "Already have an account? Log In"}</button></div>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
