import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { X, Mail, Lock, ArrowRight, HeartHandshake, Truck } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: User) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('DONOR');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // SIMULATED FIREBASE AUTHENTICATION
    setTimeout(() => {
      const mockUser: User = {
        uid: 'user_' + Math.random().toString(36).substr(2, 9),
        email: email,
        displayName: email.split('@')[0],
        role: role,
      };
      onLogin(mockUser);
      setLoading(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100 border border-slate-200">
        <div className="p-6 bg-slate-900 text-white flex justify-between items-center border-b border-slate-800">
          <div>
             <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
               {isLogin ? 'Welcome Back' : 'Join Food Matrix'}
             </h2>
             <p className="text-slate-400 text-xs mt-1">Enter the distribution network</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          {/* Role Selection (Only visible on Sign Up) */}
          {!isLogin && (
            <div className="grid grid-cols-2 gap-4 mb-2">
              <button
                type="button"
                onClick={() => setRole('DONOR')}
                className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center space-y-2 transition-all ${
                  role === 'DONOR' 
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900' 
                    : 'border-slate-200 text-slate-500 hover:border-emerald-300'
                }`}
              >
                <HeartHandshake size={24} className={role === 'DONOR' ? 'text-emerald-600' : ''} />
                <span className="font-semibold text-sm">Donor</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('NGO')}
                className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center space-y-2 transition-all ${
                  role === 'NGO' 
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900' 
                    : 'border-slate-200 text-slate-500 hover:border-emerald-300'
                }`}
              >
                <Truck size={24} className={role === 'NGO' ? 'text-emerald-600' : ''} />
                <span className="font-semibold text-sm">NGO / Receiver</span>
              </button>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 block w-full rounded-xl border-slate-300 bg-slate-50 border focus:ring-emerald-500 focus:border-emerald-500 py-3 text-slate-900 transition-all"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 block w-full rounded-xl border-slate-300 bg-slate-50 border focus:ring-emerald-500 focus:border-emerald-500 py-3 text-slate-900 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-semibold shadow-lg shadow-slate-300 transition-all active:scale-[0.98]"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {isLogin ? 'Log In' : 'Create Account'}
                <ArrowRight size={18} className="ml-2" />
              </>
            )}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-emerald-600 font-medium hover:text-emerald-700"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;
