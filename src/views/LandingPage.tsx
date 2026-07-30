import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { dataService } from '../services/dataService';
import type { TrainingSession } from '../types';
import { SessionCard } from '../components/sessions/SessionCard';
import { SessionDetailsModal } from '../components/sessions/SessionDetailsModal';
import { Footer } from '../components/common/Footer';
import { Navbar } from '../components/common/Navbar';
import { 
  ShieldCheck, 
  Shield,
  Calendar, 
  Award, 
  ArrowRight, 
  Sparkles
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { orgSettings } = useTheme();
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<TrainingSession | null>(null);

  useEffect(() => {
    dataService.getSessions().then(data => setSessions(data.slice(0, 3)));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
      <Navbar />

      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-slate-900 text-white py-20 lg:py-28">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-overlay"
          style={{ backgroundImage: `url(${orgSettings.banner_url})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-blue-950/80" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 border border-blue-400/30 text-blue-300 mb-6 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            Official Government Training & Capacity Building Platform
          </span>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight max-w-4xl mb-6">
            Empowering Excellence Through Specialized Training
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mb-10 leading-relaxed">
            Welcome to {orgSettings.organization_name}. Browse upcoming professional development courses, register for morning or afternoon slots, and track your booking approvals seamlessly.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            {isAuthenticated ? (
              <button
                onClick={() => navigate(isAdmin ? '/admin/dashboard' : '/dashboard')}
                className="px-7 py-3.5 rounded-xl font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-xl transition-all flex items-center gap-2 text-sm"
              >
                Go to {isAdmin ? 'Admin Dashboard' : 'My Dashboard'}
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <Link
                  to="/register"
                  className="px-7 py-3.5 rounded-xl font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-xl transition-all flex items-center gap-2 text-sm"
                >
                  Register Account
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/login"
                  className="px-7 py-3.5 rounded-xl font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 shadow-md transition-all text-sm"
                >
                  User Login
                </Link>
                <Link
                  to="/admin/login"
                  className="px-7 py-3.5 rounded-xl font-bold bg-blue-900/60 hover:bg-blue-800/80 text-blue-200 border border-blue-700/50 shadow-md transition-all text-sm flex items-center gap-2"
                >
                  <Shield className="w-4 h-4 text-blue-400" />
                  Admin Portal
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Live Statistics Counters */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10 w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl">
          <div className="text-center p-2">
            <p className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-blue-400">120+</p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">Annual Sessions</p>
          </div>
          <div className="text-center p-2 border-l border-slate-200 dark:border-slate-700">
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">98%</p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">Approval Rate</p>
          </div>
          <div className="text-center p-2 border-l border-slate-200 dark:border-slate-700">
            <p className="text-2xl sm:text-3xl font-extrabold text-purple-600 dark:text-purple-400">1,400+</p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">Registered Officers</p>
          </div>
          <div className="text-center p-2 border-l border-slate-200 dark:border-slate-700">
            <p className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400">100%</p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">Certified Trainers</p>
          </div>
        </div>
      </section>

      {/* Featured Upcoming Sessions */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Scheduled Courses</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
              Featured Training Sessions
            </h2>
          </div>
          <Link
            to={isAuthenticated ? "/dashboard/sessions" : "/login"}
            className="mt-4 md:mt-0 text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            View All Courses
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sessions.map(s => (
            <SessionCard
              key={s.id}
              session={s}
              onSelect={sess => setSelectedSession(sess)}
              onBook={() => navigate('/login')}
            />
          ))}
        </div>
      </section>

      {/* Key System Features */}
      <section className="bg-slate-100 dark:bg-slate-800/50 py-16 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Built For Enterprise & Government Standards
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Automated seat management, waitlists, QR check-ins, and multi-level admin approvals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 flex items-center justify-center font-bold">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Flexible Slot Scheduling</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Configure Morning and Afternoon session slots with strict seat limits and venue conflict prevention.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Admin Approval Workflow</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Administrators maintain full control over booking validation, seat allocation, and automated waitlist promotion.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400 flex items-center justify-center font-bold">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">QR Code Check-in Ticket</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Approved participants automatically receive encrypted QR passes for instant attendance verification.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <div className="mt-auto">
        <Footer />
      </div>

      <SessionDetailsModal
        isOpen={Boolean(selectedSession)}
        onClose={() => setSelectedSession(null)}
        session={selectedSession}
        onBook={() => navigate('/login')}
      />
    </div>
  );
};
