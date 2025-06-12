// src/components/SessionDeleteModal.tsx
import {Button, Group, Modal, Text} from '@mantine/core';

interface SessionDeleteModalProps {
    opened: boolean;
    onClose: () => void;
    onConfirm: () => void;
    loading?: boolean;
}

export default function SessionDeleteModal({
                                               opened,
                                               onClose,
                                               onConfirm,
                                               loading = false,
                                           }: SessionDeleteModalProps) {
    return (
        <Modal
            opened={opened}
            onClose={onClose}
            title="Excluir sessão?"
            centered
        >
            <Text mb="md">
                Tem certeza que deseja excluir esta sessão?<br/>
                <b>Não será possível resgatar o histórico desta conversa.</b>
            </Text>
            <Group justify="flex-end">
                <Button variant="default" onClick={onClose} disabled={loading}>
                    Cancelar
                </Button>
                <Button color="red" onClick={onConfirm} loading={loading}>
                    Excluir
                </Button>
            </Group>
        </Modal>
    );
}