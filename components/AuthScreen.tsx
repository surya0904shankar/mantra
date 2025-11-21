
import React, { useState } from 'react';
import { authService } from '../services/auth';
import { UserProfile } from '../types';
import { Loader2, ArrowRight, Mail, Lock, User } from 'lucide-react';

interface AuthScreenProps {
  onAuthSuccess: (user: UserProfile) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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
      let user;
      if (isLogin) {
        user = await authService.login(formData.email, formData.password);
      } else {
        if (!formData.name) throw new Error("Name is required");
        user = await authService.register(formData.name, formData.email, formData.password);
      }
      onAuthSuccess(user);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex items-center justify-center p-4 transition-colors duration-300">
      <div className="bg-white dark:bg-stone-900 w-full max-w-md rounded-3xl shadow-xl overflow-hidden border border-stone-100 dark:border-stone-800 animate-in fade-in zoom-in-95 duration-500">
        
        {/* Header */}
        <div className="bg-gradient-to-br from-saffron-400 to-saffron-600 p-10 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent scale-150"></div>
          <h1 className="font-serif font-bold text-4xl mb-2 relative z-10">OmCounter</h1>
          <p className="text-saffron-50 font-medium relative z-10">Your Spiritual Journey Begins Here</p>
        </div>

        <div className="p-8">
          <div className="flex gap-4 mb-8 bg-stone-100 dark:bg-stone-800 p-1 rounded-xl">
            <button 
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${isLogin ? 'bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-100 shadow-sm' : 'text-stone-500 dark:text-stone-400 hover:text-stone-700'}`}
            >
              Log In
            </button>
            <button 
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${!isLogin ? 'bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-100 shadow-sm' : 'text-stone-500 dark:text-stone-400 hover:text-stone-700'}`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-500 uppercase ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-stone-400" size={18} />
                  <input 
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 focus:ring-2 focus:ring-saffron-400 focus:outline-none transition-shadow bg-white dark:bg-stone-800 text-stone-900 dark:text-white"
                    placeholder="Enter your name"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-500 uppercase ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-stone-400" size={18} />
                <input 
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 focus:ring-2 focus:ring-saffron-400 focus:outline-none transition-shadow bg-white dark:bg-stone-800 text-stone-900 dark:text-white"
                  placeholder="hello@example.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-500 uppercase ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-stone-400" size={18} />
                <input 
                  type="password"
                  required
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 focus:ring-2 focus:ring-saffron-400 focus:outline-none transition-shadow bg-white dark:bg-stone-800 text-stone-900 dark:text-white"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 text-sm rounded-lg text-center">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 py-4 rounded-xl font-bold text-lg hover:bg-stone-800 dark:hover:bg-stone-200 shadow-lg shadow-stone-200 dark:shadow-none transition-transform active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
            >
              {isLoading ? <Loader2 className="animate-spin" /> : (
                <>
                  {isLogin ? 'Welcome Back' : 'Create Account'} <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>
        </div>
        
        <div className="bg-stone-50 dark:bg-stone-900 p-4 text-center text-xs text-stone-400 border-t border-stone-100 dark:border-stone-800">
          OmCounter v1.2 • Mindfulness made simple
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
