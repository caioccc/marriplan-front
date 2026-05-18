//eslint-disable @typescript-eslint/no-explicit-any
//eslint-disable @typescript-eslint/no-unused-vars
//eslint-disable react-hooks/exhaustive-deps
import {Button, Group, Modal, TextInput} from '@mantine/core';
import {useForm} from '@mantine/form';
import {useEffect} from 'react';

interface SessionEditModalProps {
    opened: boolean;
    onClose: () => void;
    onConfirm: (value: string) => void;
    value: string;
    loading?: boolean;
}

export default function SessionEditModal({
                                             opened,
                                             onClose,
                                             onConfirm,
                                             value,
                                             loading = false,
                                         }: SessionEditModalProps) {
    const form = useForm({
        initialValues: {title: value},
        validate: {
            title: (val) =>
                !val.trim()
                    ? 'O título é obrigatório'
                    : val.length < 3
                        ? 'Mínimo de 3 caracteres'
                        : val.length > 50
                            ? 'Máximo de 50 caracteres'
                            : null,
        },
    });

    // Atualiza o valor inicial se o modal for reaberto para outra sessão
    useEffect(() => {
        form.setValues({title: value});
        form.resetDirty();
    }, [value, opened]);

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title="Editar título da sessão"
            centered
        >
            <form
                onSubmit={form.onSubmit(({title}) => onConfirm(title))}
                autoComplete="off"
            >
                <TextInput
                    label="Novo título"
                    {...form.getInputProps('title')}
                    autoFocus
                    disabled={loading}
                    required
                    maxLength={50}
                />
                <Group justify="flex-end" mt="md">
                    <Button variant="default" onClick={onClose} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button
                        color="blue"
                        type="submit"
                        loading={loading}
                        disabled={!form.isValid()}
                    >
                        Salvar
                    </Button>
                </Group>
            </form>
        </Modal>
    );
}