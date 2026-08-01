import React, { createContext, useContext, useState, useEffect } from 'react';
import { OrganizationSettings } from '../types';
import { dataService } from '../services/dataService';
import { mockStorage } from '../services/mockDataService';

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

  const [orgSettings, setOrgSettings] = useState<OrganizationSettings>(() => {
    return mockStorage.getOrgSettings();
  });

  const reloadSettings = async () => {
    try {
      const settings = await dataService.getOrgSettings();
      if (settings) {
        setOrgSettings(settings);
        mockStorage.setOrgSettings(settings);
        applyColorVariables(settings.primary_color, settings.secondary_color);
      }
    } catch (e) {
      console.error('Error loading org settings:', e);
    }
  };

  const applyColorVariables = (primary: string, secondary: string) => {
    if (!primary || !secondary) return;
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
    mockStorage.setOrgSettings(newSettings);
    setOrgSettings(newSettings);
    applyColorVariables(newSettings.primary_color, newSettings.secondary_color);
    try {
      const updated = await dataService.updateOrgSettings(newSettings);
      if (updated) {
        setOrgSettings(updated);
        mockStorage.setOrgSettings(updated);
      }
    } catch (err) {
      console.warn('Supabase org settings update warning:', err);
    }
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
