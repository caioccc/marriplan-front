//eslint-disable @typescript-eslint/no-explicit-any
//eslint-disable @typescript-eslint/no-unused-vars
//eslint-disable react-hooks/exhaustive-deps
import {useEffect, useState} from 'react';
import {Button, Group, Loader, Modal, Overlay, Stack, Switch, Tabs, Text} from '@mantine/core';
import {LanguagePicker} from "@/components/LanguagePicker/LanguagePicker";
import {deleteAllSessions, updateSettings} from "@/services/settings";
import {ColorSchemeToggle} from "@/components/ColorSchemeToggle/ColorSchemeToggle";
import {useSettings} from "@/contexts/SettingsContext";
import {Enable2FAModal} from "@/components/Enable2FAModal";
import {useTranslation} from "react-i18next";
import {disable2FA} from "@/services/2fa";
import {useAuth} from "@/contexts/AuthContext";

const defaultLanguage = 'pt-BR';


export function SettingsModal({
                                  opened,
                                  onClose,
                              }: {
    opened: boolean;
    onClose: () => void;
}) {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [idioma, setIdioma] = useState('pt-BR');
    const [twoFA, setTwoFA] = useState(false);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [twoFAModalOpen, setTwoFAModalOpen] = useState(false);
    const [disable2FAModalOpen, setDisable2FAModalOpen] = useState(false);


    const [isLoading, setIsLoading] = useState(false);

    const {settings} = useSettings();
    const {user, refreshUser} = useAuth();
    const {i18n} = useTranslation();

    useEffect(() => {
        refreshUser();
        if (opened) {
            setTimeout(() => {
                setLoading(true);
                setIdioma(settings?.language ?? defaultLanguage);
                setTwoFA(!!user?.is_2fa_enabled);
                setLoading(false);
            }, 500);
        }
    }, [opened]);

    const handleDisable2FA = async () => {
        setLoading(true);
        try {
            await disable2FA();
            setTwoFA(false);
            setDisable2FAModalOpen(false);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        const newLanguage = i18n.language.includes('pt') ? 'pt' : i18n.language.includes('en') ? 'en' : 'es';

        try {
            await updateSettings({language: newLanguage});
            setIsLoading(true);
            setTimeout(() => {
                window.location.reload();
            }, 500);
            onClose();
        } finally {
            setSaving(false);
        }
    };

    const handleExcluirChats = async () => {
        setDeleting(true);
        try {
            await deleteAllSessions();
            setConfirmDeleteOpen(false);
            setIsLoading(true);
            setTimeout(() => {
                window.location.reload();
            }, 500);
            onClose();
        } finally {
            setDeleting(false);
        }
    };

    return (
        <>
            {isLoading && (
                <Overlay
                    fixed
                    zIndex={9999}
                    color="#fff"
                    opacity={0.7}
                    blur={2}
                    style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}
                >
                    <Loader size="xl" color="blue"/>
                </Overlay>
            )}

            <Modal
                opened={opened}
                onClose={onClose}
                title="Configurações"
                size="xl"
                centered
            >
                {loading ? (
                    <Group justify="center" py="xl">
                        <Loader/>
                    </Group>
                ) : (
                    <Tabs defaultValue="geral">
                        <Tabs.List>
                            <Tabs.Tab value="geral">Geral</Tabs.Tab>
                            <Tabs.Tab value="seguranca">Segurança</Tabs.Tab>
                        </Tabs.List>
                        <Tabs.Panel value="geral" pt="md">
                            <Stack gap="lg">
                                <LanguagePicker/>
                                <div>
                                    <Text size="sm" fw={500} mb={4}>
                                        Tema
                                    </Text>
                                    <ColorSchemeToggle/>
                                </div>
                                <Group justify="flex-end" mt="md">
                                    <Button onClick={handleSave} loading={saving}>
                                        Salvar
                                    </Button>
                                </Group>
                            </Stack>
                        </Tabs.Panel>
                        <Tabs.Panel value="seguranca" pt="md">
                            <Stack gap="lg">
                                <div>
                                    <Text size="sm" fw={500} mb={4}>
                                        Autenticação em duas etapas (2FA)
                                    </Text>

                                    <Switch
                                        label="Ativar 2FA"
                                        checked={twoFA}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setTwoFAModalOpen(true);
                                            } else {
                                                setDisable2FAModalOpen(true);
                                            }
                                        }}
                                    />

                                    <Enable2FAModal
                                        opened={twoFAModalOpen}
                                        onClose={() => setTwoFAModalOpen(false)}
                                        onEnabled={() => {
                                            setTwoFA(true);
                                            setTwoFAModalOpen(false);
                                        }}
                                    />
                                </div>
                                <div>
                                    <Text size="sm" fw={500} mt="md" mb={4}>
                                        Excluir todos os chats
                                    </Text>
                                    <Button
                                        color="red"
                                        mt={0}
                                        onClick={() => setConfirmDeleteOpen(true)}
                                    >
                                        Excluir todos os chats
                                    </Button>
                                </div>
                            </Stack>
                        </Tabs.Panel>
                    </Tabs>
                )}
            </Modal>

            <Modal
                opened={disable2FAModalOpen}
                onClose={() => setDisable2FAModalOpen(false)}
                title="Desabilitar 2FA"
                centered
            >
                <Text>Tem certeza que deseja desabilitar a autenticação em duas etapas?</Text>
                <Group justify="flex-end" mt="md">
                    <Button variant="default" onClick={() => setDisable2FAModalOpen(false)}>
                        Cancelar
                    </Button>
                    <Button color="red" onClick={handleDisable2FA} loading={loading}>
                        Desabilitar
                    </Button>
                </Group>
            </Modal>

            <Modal
                opened={confirmDeleteOpen}
                onClose={() => setConfirmDeleteOpen(false)}
                title="Confirmar exclusão"
                centered
                withCloseButton={!deleting}
                closeOnClickOutside={!deleting}
                closeOnEscape={!deleting}
            >
                <Text mb="md" c="red" fw={500}>
                    Tem certeza que deseja excluir todos os chats? <br/>
                    <b>Esta ação é irreversível e não poderá ser desfeita.</b>
                </Text>
                <Group justify="flex-end">
                    <Button variant="default" onClick={() => setConfirmDeleteOpen(false)} disabled={deleting}>
                        Cancelar
                    </Button>
                    <Button color="red" onClick={handleExcluirChats} loading={deleting}>
                        Excluir
                    </Button>
                </Group>
            </Modal>
        </>
    );
}