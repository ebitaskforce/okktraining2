import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Navbar } from '../../components/common/Navbar';
import { Footer } from '../../components/common/Footer';
import { KeyRound, Mail, ArrowLeft, CheckCircle } from 'lucide-react';

export const ResetPassword: React.FC = () => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await resetPassword(email);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Error sending password reset request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl p-8 animate-fade-in">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center mb-3">
              <KeyRound className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Reset Account Password</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Enter your registered staff email address to receive password reset instructions
            </p>
          </div>

          {submitted ? (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-3">
              <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Reset Link Sent!</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Instructions have been sent to <strong>{email}</strong>. Please check your inbox.
              </p>
              <Link to="/login" className="inline-block pt-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
                Return to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {error && (
                <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 font-medium">
                  {error}
                </div>
              )}

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

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Sending Request...' : 'Send Reset Instructions'}
              </button>

              <div className="pt-2 text-center">
                <Link to="/login" className="inline-flex items-center gap-1 font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};
