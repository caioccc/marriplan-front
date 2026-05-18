//eslint-disable @typescript-eslint/no-explicit-any
//eslint-disable @typescript-eslint/no-unused-vars
//eslint-disable react-hooks/exhaustive-deps
import {Button, Group, Modal, TextInput} from '@mantine/core';
import {isNotEmpty, useForm} from '@mantine/form';
import {useEffect, useState} from 'react';
import {updateProfile} from '@/services/user';
import {useAuth} from '@/contexts/AuthContext';
import {useTranslation} from "react-i18next";
import {useToast} from "@/hooks/use-toast";

export function ProfileModal({opened, onClose}: { opened: boolean, onClose: () => void }) {
    const {user, setUser} = useAuth();
    const [loading, setLoading] = useState(false);
    const {t} = useTranslation();

    const {toast} = useToast();

    const form = useForm({
        initialValues: {username: '', name: '', email: ''},
        validate: {
            name: (value) => isNotEmpty(t('Nome é obrigatório'))(value),
            username: (value) => isNotEmpty(t('Usuário é obrigatório'))(value),
        },
    });

    useEffect(() => {
        if (user) {
            form.setValues({name: user.name || '', email: user.email || '', username: user.username || ''});
        }
    }, [user, opened]);

    const handleSubmit = async (values: { name: string; email: string }) => {
        setLoading(true);
        try {
            const data = await updateProfile({name: values.name, username: values.username});
            const newUser = {
                ...user,
                name: values.name,
                username: values.username,
            }
            localStorage.setItem('user', JSON.stringify(newUser));
            setUser(newUser);
            toast({
                title: t('Perfil atualizado com sucesso'),
                description: t('Suas informações foram salvas.'),
            })
            onClose();
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal opened={opened} onClose={onClose} title="Meu Perfil" centered>
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <TextInput
                    label="Usuário"
                    {...form.getInputProps('username')}
                    required
                    mb="md"
                />
                <TextInput
                    label="Nome"
                    {...form.getInputProps('name')}
                    required
                    mb="md"
                />
                <TextInput
                    label="Email"
                    value={form.values.email}
                    disabled
                    mb="md"
                />
                <Group justify="flex-end" mt="md">
                    <Button variant="default" onClick={onClose} disabled={loading}>
                        Voltar
                    </Button>
                    <Button type="submit" loading={loading}>
                        Salvar
                    </Button>
                </Group>
            </form>
        </Modal>
    );
}