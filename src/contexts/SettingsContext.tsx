import {createContext, useContext, useEffect, useState, ReactNode} from 'react';
import {getSettings, updateSettings} from '@/services/settings';
import {useAuth} from "@/contexts/AuthContext";

type Settings = {
    language: string;
    theme: 'light' | 'dark';
    twoFA: boolean;
};

type SettingsContextType = {
    settings: Settings | null;
    loading: boolean;
    saveSettings: (data: Partial<Settings>) => Promise<void>;
    refreshSettings: () => Promise<void>;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({children}: { children: ReactNode }) {
    const [settings, setSettings] = useState<Settings | null>(null);
    const [loading, setLoading] = useState(true);

    const {user} = useAuth()

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const data = await getSettings();
            setSettings({
                language: data.language,
                theme: data.theme,
                twoFA: user.is_2fa_enabled,
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user) {
            setSettings(null);
            setLoading(false);
            return;
        }
        fetchSettings();
    }, [user]);

    const saveSettings = async (data: Partial<Settings>) => {
        setLoading(true);
        try {
            const saveSetsResponse = await updateSettings(data);
            console.log('Settings saved Context:', saveSetsResponse);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SettingsContext.Provider value={{
            settings,
            loading,
            saveSettings,
            refreshSettings: fetchSettings,
        }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const ctx = useContext(SettingsContext);
    if (!ctx) throw new Error('useSettings deve ser usado dentro do SettingsProvider');
    return ctx;
}