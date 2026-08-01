import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useNotification } from '../../context/NotificationContext';
import { OrganizationSettings } from '../../types';
import { Navbar } from '../../components/common/Navbar';
import { Sidebar } from '../../components/common/Sidebar';
import { Footer } from '../../components/common/Footer';
import { Settings, Save, Palette, Image as ImageIcon, Building, Type, Upload } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { orgSettings, updateOrgSettings } = useTheme();
  const { showToast } = useNotification();

  const [formData, setFormData] = useState<OrganizationSettings>(orgSettings);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFormData(orgSettings);
  }, [orgSettings]);

  const handleBannerFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        showToast('Image file size should be less than 3MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          banner_url: reader.result as string
        }));
        showToast('New banner image loaded!', 'info');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('Logo file size should be less than 2MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          logo_url: reader.result as string
        }));
        showToast('New logo image loaded!', 'info');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateOrgSettings(formData);
      showToast('Organization Settings, Hero Banner & Wordings updated successfully!', 'success');
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
            <h1 className="text-2xl font-extrabold text-white">Organization & Hero Banner Settings</h1>
            <p className="text-xs text-slate-400 mt-1">
              Customize portal theme colors, hero background banner picture, landing page wordings, logo, and contact info
            </p>
          </div>

          <form onSubmit={handleSubmit} className="max-w-4xl space-y-6 text-xs">
            
            {/* Hero Banner Picture & Editable Wordings */}
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <ImageIcon className="w-4 h-4 text-purple-400" />
                Hero Banner Picture & Editable Landing Wordings
              </h3>

              {/* Banner Background Image Preview */}
              <div>
                <label className="block font-semibold text-slate-300 mb-2">Banner Background Image Preview</label>
                <div 
                  className="relative h-40 w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center bg-cover bg-center"
                  style={{ backgroundImage: `url(${formData.banner_url || orgSettings.banner_url})` }}
                >
                  <div className="absolute inset-0 bg-slate-950/70" />
                  <div className="relative z-10 text-center p-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/30 text-blue-300 border border-blue-400/30 mb-2 inline-block">
                      {formData.hero_badge_text || 'Badge Text Preview'}
                    </span>
                    <h4 className="text-sm font-extrabold text-white line-clamp-1">
                      {formData.hero_title || 'Hero Title Preview'}
                    </h4>
                  </div>
                </div>
              </div>

              {/* Banner Image URL / Upload Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Upload New Banner Image File</label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBannerFileUpload}
                      className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer bg-slate-950 rounded-lg border border-slate-800 p-1"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Supports JPG, PNG, WebP (Max 3MB)</p>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Or Enter Banner Image URL</label>
                  <input
                    type="text"
                    value={formData.banner_url}
                    onChange={e => setFormData({ ...formData, banner_url: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-800 bg-slate-950 text-white outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Editable Hero Wordings */}
              <div className="space-y-4 pt-2 border-t border-slate-800/80">
                <h4 className="font-semibold text-slate-200 text-xs flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5 text-blue-400" />
                  Hero Section Text / Wordings
                </h4>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Hero Top Badge Text</label>
                  <input
                    type="text"
                    value={formData.hero_badge_text || ''}
                    onChange={e => setFormData({ ...formData, hero_badge_text: e.target.value })}
                    placeholder="e.g. Official Government Training & Capacity Building Platform"
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-800 bg-slate-950 text-white outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Hero Main Title Wording</label>
                  <input
                    type="text"
                    value={formData.hero_title || ''}
                    onChange={e => setFormData({ ...formData, hero_title: e.target.value })}
                    placeholder="e.g. Empowering Excellence Through Specialized Training"
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-800 bg-slate-950 text-white outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Hero Description / Subtitle Wording</label>
                  <textarea
                    rows={3}
                    value={formData.hero_subtitle || ''}
                    onChange={e => setFormData({ ...formData, hero_subtitle: e.target.value })}
                    placeholder="Welcome message or main portal description..."
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-800 bg-slate-950 text-white outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

            </div>

            {/* Branding & Visuals */}
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <Palette className="w-4 h-4 text-blue-400" />
                Organization Name & Logo Settings
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
                  <label className="block font-semibold text-slate-300 mb-1">Upload Organization Logo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoFileUpload}
                    className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer bg-slate-950 rounded-lg border border-slate-800 p-1"
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
