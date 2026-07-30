import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Mail, Phone, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  const { orgSettings } = useTheme();

  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 text-xs py-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Org Info */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            {orgSettings.logo_url && (
              <img src={orgSettings.logo_url} alt="Logo" className="w-8 h-8 rounded object-cover" />
            )}
            <span className="font-bold text-white text-base">{orgSettings.organization_name}</span>
          </div>
          <p className="text-slate-400 leading-relaxed max-w-sm">
            Empowering staff and public officers with state-of-the-art professional development and continuous training programs.
          </p>
        </div>

        {/* Contact info */}
        <div className="space-y-2.5">
          <h4 className="font-semibold text-white text-sm">Contact Support</h4>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-blue-400" />
            <span>{orgSettings.contact_email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-emerald-400" />
            <span>{orgSettings.phone}</span>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-rose-400 mt-0.5" />
            <span>{orgSettings.address}</span>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-2">
          <h4 className="font-semibold text-white text-sm">Quick Links</h4>
          <p className="text-slate-400">{orgSettings.footer_text}</p>
          <p className="text-[11px] text-slate-500 pt-2">
            Privacy Policy • Terms of Service • Security & RLS Enforced
          </p>
        </div>
      </div>
    </footer>
  );
};
