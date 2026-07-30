import React, { createContext, useContext, useState, useEffect } from 'react';
import { OrganizationSettings } from '../types';
import { dataService } from '../services/dataService';

interface ThemeContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
  orgSettings: OrganizationSettings;
  updateOrgSettings: (newSettings: OrganizationSettings) => Promise<void>;
  reloadSettings: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('okk_dark_mode');
    if (saved !== null) return JSON.parse(saved);
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [orgSettings, setOrgSettings] = useState<OrganizationSettings>({
    id: 1,
    organization_name: 'GovTech Training Academy',
    website_name: 'Training Portal',
    logo_url: 'https://images.unsplash.com/photo-1542744094-3a317272018a?w=150&auto=format&fit=crop&q=80',
    banner_url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&auto=format&fit=crop&q=80',
    primary_color: '#2563eb',
    secondary_color: '#4f46e5',
    footer_text: '© 2026 GovTech Training Academy. All Rights Reserved.',
    contact_email: 'support@training.gov.my',
    phone: '+60 3-8000 8000',
    address: 'Level 5, Block B, Federal Government Administrative Centre, Putrajaya, Malaysia'
  });

  const reloadSettings = async () => {
    try {
      const settings = await dataService.getOrgSettings();
      if (settings) {
        setOrgSettings(settings);
        applyColorVariables(settings.primary_color, settings.secondary_color);
      }
    } catch (e) {
      console.error('Error loading org settings:', e);
    }
  };

  const applyColorVariables = (primary: string, secondary: string) => {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', primary);
    root.style.setProperty('--color-secondary', secondary);
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('okk_dark_mode', JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    reloadSettings();
  }, []);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  const updateOrgSettings = async (newSettings: OrganizationSettings) => {
    const updated = await dataService.updateOrgSettings(newSettings);
    setOrgSettings(updated);
    applyColorVariables(updated.primary_color, updated.secondary_color);
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode, orgSettings, updateOrgSettings, reloadSettings }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
