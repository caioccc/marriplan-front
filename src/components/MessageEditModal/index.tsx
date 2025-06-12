import {Modal, TextInput, Button, Group} from '@mantine/core';
import {useForm} from '@mantine/form';
import {useEffect} from 'react';

interface MessageEditModalProps {
    opened: boolean;
    initialValue: string;
    loading?: boolean;
    onClose: () => void;
    onConfirm: (value: string) => void;
}

export default function MessageEditModal({
                                             opened,
                                             initialValue,
                                             loading = false,
                                             onClose,
                                             onConfirm,
                                         }: MessageEditModalProps) {
    const form = useForm({
        initialValues: {content: initialValue},
        validate: {
            content: (value) =>
                value.trim().length === 0
                    ? 'Mensagem não pode ser vazia'
                    : null,
        },
    });

    // Atualiza valor inicial ao abrir o modal
    useEffect(() => {
        form.setValues({content: initialValue});
        form.resetDirty();
    }, [initialValue, opened]);

    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title="Editar mensagem"
            centered
        >
            <form
                onSubmit={form.onSubmit(({content}) => onConfirm(content))}
                autoComplete="off"
            >
                <TextInput
                    label="Mensagem"
                    {...form.getInputProps('content')}
                    autoFocus
                    disabled={loading}
                    required
                />
                <Group mt="md" justify="flex-end">
                    <Button variant="default" onClick={onClose} disabled={loading}>
                        Voltar
                    </Button>
                    <Button
                        type="submit"
                        color="blue"
                        disabled={
                            !form.isValid() ||
                            form.values.content === initialValue ||
                            loading
                        }
                        loading={loading}
                    >
                        Enviar
                    </Button>
                </Group>
            </form>
        </Modal>
    );
}