import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { dataService } from '../../services/dataService';
import { Trainer } from '../../types';
import { Navbar } from '../../components/common/Navbar';
import { Sidebar } from '../../components/common/Sidebar';
import { Footer } from '../../components/common/Footer';
import { Modal } from '../../components/common/Modal';
import { UserCheck, Plus, Mail, Phone, Award } from 'lucide-react';

export const TrainerManagementPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useNotification();

  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [bio, setBio] = useState('');

  const loadTrainers = async () => {
    const data = await dataService.getTrainers();
    setTrainers(data);
  };

  useEffect(() => {
    loadTrainers();
  }, []);

  const handleAddTrainer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !specialty) return;

    try {
      await dataService.createTrainer({
        name,
        email,
        phone,
        specialty,
        bio,
        avatar_url: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000)}?w=150&auto=format&fit=crop&q=80`
      });

      showToast(`Added trainer profile for ${name}`, 'success');
      setName('');
      setEmail('');
      setPhone('');
      setSpecialty('');
      setBio('');
      setIsModalOpen(false);
      loadTrainers();
    } catch (err: any) {
      showToast(err.message || 'Failed to add trainer', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-8 space-y-6 overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <h1 className="text-2xl font-extrabold text-white">Trainer Profile & Assignment Registry</h1>
              <p className="text-xs text-slate-400 mt-1">
                Maintain accredited trainer profiles, contact details, and core technical specialties
              </p>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Trainer Profile
            </button>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {trainers.map(tr => (
              <div key={tr.id} className="bg-slate-900 rounded-xl p-5 border border-slate-800 shadow-md space-y-4">
                <div className="flex items-center gap-3">
                  <img src={tr.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} alt={tr.name} className="w-12 h-12 rounded-full object-cover border border-slate-700" />
                  <div>
                    <h3 className="font-bold text-white text-sm">{tr.name}</h3>
                    <span className="text-[11px] font-semibold text-blue-400 block">{tr.specialty}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">{tr.bio}</p>

                <div className="pt-3 border-t border-slate-800/80 text-xs text-slate-400 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-blue-400" />
                    <span>{tr.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{tr.phone || 'N/A'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      <Footer />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Accredited Trainer Profile" maxWidth="md">
        <form onSubmit={handleAddTrainer} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">Trainer Full Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Prof. Jason Vance"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="jason@academy.org"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+60 12-345 6789"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">Core Specialty / Expertise *</label>
            <input
              type="text"
              required
              value={specialty}
              onChange={e => setSpecialty(e.target.value)}
              placeholder="e.g. Cybersecurity & AI Policy"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">Professional Bio</label>
            <textarea
              rows={3}
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Summary of qualifications, experience, and certifications..."
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md"
            >
              Save Trainer Profile
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
