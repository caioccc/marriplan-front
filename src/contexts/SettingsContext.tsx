import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { getSettings, updateSettings } from "@/services/settings";
import { useAuth } from "@/contexts/AuthContext";

type Settings = {
  language: string;
  theme: "light" | "dark";
  twoFA: boolean;
};

const defaultSettings: Settings = {
  language: "pt-BR",
  theme: "light",
  twoFA: false,
};

type SettingsContextType = {
  settings: Settings | null;
  loading: boolean;
  saveSettings: (data: Partial<Settings>) => Promise<void>;
  refreshSettings: () => Promise<void>;
};

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();

  const fetchSettings = async (currentUser?: { is_2fa_enabled?: boolean } | null) => {
    setLoading(true);
    try {
      const data = await getSettings();

      const settingsData = data ?? {};

      setSettings({
        language:
          typeof settingsData.language === "string"
            ? settingsData.language
            : defaultSettings.language,
        theme:
          settingsData.theme === "light" || settingsData.theme === "dark"
            ? settingsData.theme
            : defaultSettings.theme,
        twoFA: !!currentUser?.is_2fa_enabled,
      });
    } catch (error) {
      console.error("Erro ao buscar configurações:", error);
      setSettings({
        ...defaultSettings,
        twoFA: !!currentUser?.is_2fa_enabled,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      setSettings(defaultSettings);
      setLoading(false);
      return;
    } else {
      void fetchSettings(user);
    }
  }, [user]);

  const saveSettings = async (data: Partial<Settings>) => {
    setLoading(true);
    try {
      await updateSettings(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        saveSettings,
        refreshSettings: () => fetchSettings(user),
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx)
    throw new Error("useSettings deve ser usado dentro do SettingsProvider");
  return ctx;
}
