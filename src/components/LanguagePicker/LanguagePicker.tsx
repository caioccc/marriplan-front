import {useState} from 'react';
import {IconChevronDown} from '@tabler/icons-react';
import {useTranslation} from 'react-i18next';
import {Group, Menu, UnstyledButton, Text} from '@mantine/core';
import classes from './LanguagePicker.module.css';

export function LanguagePicker() {
    const {t, i18n} = useTranslation();

    const setLanguage = (option: MenuOption) => {
        i18n.changeLanguage(option.key);
        setSelected(option);
    };

    const langMenu: Array<MenuOption> = [
        {
            key: 'pt-BR',
            label: 'general.language.portuguese',
            onClick: setLanguage
        },
        {
            key: 'en',
            label: 'general.language.english',
            onClick: setLanguage
        },
        {
            key: 'es',
            label: 'general.language.spanish',
            onClick: setLanguage
        }
    ];

    const [opened, setOpened] = useState(false);
    const [selected, setSelected] = useState<MenuOption>(
        langMenu.find((item) => item.key === i18n.language) || langMenu[0]
    );
    const items = langMenu.map((item) => (
        <Menu.Item
            key={item.key}
            onClick={() => {
                item.onClick(item);
            }}
        >
            {t(item.label)}
        </Menu.Item>
    ));

    interface MenuOption {
        key: string;
        label: string;
        onClick: (option: MenuOption) => void;
    }

    return (
        <div>
            <Text size="sm" fw={500} mb={4}>
                {t('Idioma')}
            </Text>
            <Menu
                onOpen={() => setOpened(true)}
                onClose={() => setOpened(false)}
                radius="md"
                width="target"
                withinPortal
            >
                <Menu.Target>
                    <UnstyledButton className={classes.control} data-expanded={opened || undefined}>
                        <Group gap="xs">
                            <span className={classes.label}>{t(selected.label)}</span>
                        </Group>
                        <IconChevronDown size={16} className={classes.icon} stroke={1.5}/>
                    </UnstyledButton>
                </Menu.Target>
                <Menu.Dropdown>{items}</Menu.Dropdown>
            </Menu>
        </div>
    );
}