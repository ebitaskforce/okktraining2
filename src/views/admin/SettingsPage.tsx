import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useNotification } from '../../context/NotificationContext';
import { OrganizationSettings } from '../../types';
import { Navbar } from '../../components/common/Navbar';
import { Sidebar } from '../../components/common/Sidebar';
import { Footer } from '../../components/common/Footer';
import { Settings, Save, Palette, Image as ImageIcon, Building, Mail, Phone, MapPin } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { orgSettings, updateOrgSettings } = useTheme();
  const { showToast } = useNotification();

  const [formData, setFormData] = useState<OrganizationSettings>(orgSettings);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFormData(orgSettings);
  }, [orgSettings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateOrgSettings(formData);
      showToast('Organization Settings & Theme updated successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-8 space-y-6 overflow-y-auto">
          {/* Header */}
          <div className="border-b border-slate-800 pb-6">
            <h1 className="text-2xl font-extrabold text-white">Organization & System Branding Settings</h1>
            <p className="text-xs text-slate-400 mt-1">
              Customize portal theme colors, organization branding, banners, logo, and public contact information stored in database
            </p>
          </div>

          <form onSubmit={handleSubmit} className="max-w-4xl space-y-6 text-xs">
            {/* Branding & Visuals */}
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <Palette className="w-4 h-4 text-blue-400" />
                Branding & Theme Colors
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Organization Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.organization_name}
                    onChange={e => setFormData({ ...formData, organization_name: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-800 bg-slate-950 text-white outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Website Portal Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.website_name}
                    onChange={e => setFormData({ ...formData, website_name: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-800 bg-slate-950 text-white outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Primary Theme Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.primary_color}
                      onChange={e => setFormData({ ...formData, primary_color: e.target.value })}
                      className="w-10 h-10 rounded border-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.primary_color}
                      onChange={e => setFormData({ ...formData, primary_color: e.target.value })}
                      className="flex-1 px-3 py-2.5 rounded-lg border border-slate-800 bg-slate-950 text-white font-mono outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Secondary Theme Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.secondary_color}
                      onChange={e => setFormData({ ...formData, secondary_color: e.target.value })}
                      className="w-10 h-10 rounded border-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.secondary_color}
                      onChange={e => setFormData({ ...formData, secondary_color: e.target.value })}
                      className="flex-1 px-3 py-2.5 rounded-lg border border-slate-800 bg-slate-950 text-white font-mono outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Organization Logo Image URL</label>
                  <input
                    type="text"
                    value={formData.logo_url}
                    onChange={e => setFormData({ ...formData, logo_url: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-800 bg-slate-950 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Landing Page Hero Banner Image URL</label>
                  <input
                    type="text"
                    value={formData.banner_url}
                    onChange={e => setFormData({ ...formData, banner_url: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-800 bg-slate-950 text-white outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Contact & Footer Details */}
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <Building className="w-4 h-4 text-emerald-400" />
                Contact Info & Footer Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Contact Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.contact_email}
                    onChange={e => setFormData({ ...formData, contact_email: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-800 bg-slate-950 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-800 bg-slate-950 text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Physical Address</label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-800 bg-slate-950 text-white outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Footer Copyright Text</label>
                <input
                  type="text"
                  value={formData.footer_text}
                  onChange={e => setFormData({ ...formData, footer_text: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-800 bg-slate-950 text-white outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg transition-all flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving Settings...' : 'Save Organization Settings'}
              </button>
            </div>
          </form>
        </main>
      </div>

      <Footer />
    </div>
  );
};
