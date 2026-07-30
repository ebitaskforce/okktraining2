import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Navbar } from '../../components/common/Navbar';
import { Footer } from '../../components/common/Footer';
import { Shield, Lock, Mail, ArrowRight } from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const { loginAdmin } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide administrative email and password.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const adminUser = await loginAdmin(email, password);
      showToast(`Admin Authenticated: ${adminUser.full_name}`, 'success');
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Access Denied: Invalid credentials or non-admin account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-md bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl p-8 animate-fade-in">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 mx-auto flex items-center justify-center mb-3">
              <Shield className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-extrabold text-white">Administrator Portal</h2>
            <p className="text-xs text-slate-400 mt-1">
              Restricted management access for authorized training administrators
            </p>
          </div>

          {/* Admin Demo Credentials Hint */}
          <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700 mb-6 text-xs text-slate-300">
            <p className="font-bold text-blue-400 mb-1">Admin Demo Credentials:</p>
            <p>• Email: <code className="bg-slate-900 px-1 rounded text-blue-300 font-mono">admin@gov.my</code> (pass: any)</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Admin Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@gov.my"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-700 bg-slate-950 text-white focus:ring-2 focus:ring-blue-500 outline-none text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-700 bg-slate-950 text-white focus:ring-2 focus:ring-blue-500 outline-none text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
            >
              {isSubmitting ? 'Authenticating Admin...' : 'Authenticate & Enter Portal'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Regular staff member?{' '}
            <Link to="/login" className="font-bold text-blue-400 hover:underline">
              Switch to User Login
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
