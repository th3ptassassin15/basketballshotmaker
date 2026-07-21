import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { DEFAULT_SETTINGS, getSettings, saveSettings } from '@/services/settings';
import type { AppSettings } from '@/types';

interface SettingsContextValue {
  settings: AppSettings;
  loaded: boolean;
  updateSettings: (updates: Partial<AppSettings>) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getSettings().then((loadedSettings) => {
      setSettings(loadedSettings);
      setLoaded(true);
    });
  }, []);

  function updateSettings(updates: Partial<AppSettings>) {
    setSettings((prev) => {
      const next = { ...prev, ...updates };
      saveSettings(next);
      return next;
    });
  }

  const value = useMemo(() => ({ settings, loaded, updateSettings }), [settings, loaded]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
