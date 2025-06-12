import {IconMoon, IconSun} from '@tabler/icons-react';
import {Button, Group, useComputedColorScheme, useMantineColorScheme} from '@mantine/core';
import {useSettings} from '@/contexts/SettingsContext';

export function ColorSchemeToggle() {
    const {setColorScheme} = useMantineColorScheme();
    const computedColorScheme = useComputedColorScheme('light', {getInitialValueInEffect: true});
    const {saveSettings} = useSettings();

    const handleToggle = async () => {
        const newTheme = computedColorScheme === 'light' ? 'dark' : 'light';
        setColorScheme(newTheme);
        try {
            await saveSettings({theme: newTheme});
        } catch (error) {
            console.error('Erro ao atualizar tema:', error);
        }
    };

    return (
        <Group>
            <Button
                onClick={handleToggle}
                leftSection={computedColorScheme === 'light' ? <IconMoon size={18}/> : <IconSun size={18}/>}
                variant="default"
                size="md"
            >
                {computedColorScheme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}
            </Button>
        </Group>
    );
}