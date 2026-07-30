import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Navbar } from '../../components/common/Navbar';
import { Footer } from '../../components/common/Footer';
import { LogIn, Lock, Mail, ArrowRight, Shield } from 'lucide-react';

export const Login: React.FC = () => {
  const { loginUser } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email address and password.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const user = await loginUser(email, password);
      showToast(`Welcome back, ${user.full_name}!`, 'success');
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl p-8 animate-fade-in">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center mb-3">
              <LogIn className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">User Portal Login</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Sign in to book training sessions and manage your tickets
            </p>
          </div>

          {/* Quick Demo Login Credentials Hint */}
          <div className="bg-blue-50/70 dark:bg-blue-950/40 p-3 rounded-lg border border-blue-100 dark:border-blue-900/60 mb-6 text-xs text-slate-700 dark:text-slate-300">
            <p className="font-bold text-blue-700 dark:text-blue-300 mb-1">Quick Demo Credentials:</p>
            <p>• User: <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded text-blue-900 dark:text-blue-100 font-mono">user@gov.my</code> (pass: any)</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="user@gov.my"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-xs"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700 dark:text-slate-200">Password</label>
                <Link to="/reset-password" className="text-blue-600 dark:text-blue-400 hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-slate-600 dark:text-slate-400">Remember Me</span>
              </label>

              <Link to="/admin/login" className="text-slate-500 hover:text-blue-600 flex items-center gap-1 font-semibold">
                <Shield className="w-3.5 h-3.5" />
                Admin Login
              </Link>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? 'Signing in...' : 'Login to Account'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Footer Register Link */}
          <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
            First time user?{' '}
            <Link to="/register" className="font-bold text-blue-600 dark:text-blue-400 hover:underline">
              Create New Account
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
