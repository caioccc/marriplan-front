import { Button, Group, Modal, Textarea, TextInput } from '@mantine/core';
import { useEffect, useState } from 'react';

type PublicGiftReserveModalProps = {
  opened: boolean;
  giftName?: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (payload: { reserver_name: string; message: string }) => Promise<void> | void;
};

export default function PublicGiftReserveModal({
  opened,
  giftName,
  loading = false,
  onClose,
  onConfirm,
}: PublicGiftReserveModalProps) {
  const [reserverName, setReserverName] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (opened) {
      setReserverName('');
      setMessage('');
    }
  }, [opened]);

  return (
    <Modal opened={opened} onClose={onClose} title={`Reservar ${giftName || 'presente'}`} centered>
      <TextInput
        label="Seu nome"
        placeholder="Como você quer ser identificado"
        value={reserverName}
        onChange={(event) => setReserverName(event.currentTarget.value)}
        mb="sm"
      />
      <Textarea
        label="Mensagem para os noivos"
        placeholder="Escreva uma mensagem opcional junto da reserva"
        value={message}
        onChange={(event) => setMessage(event.currentTarget.value)}
        minRows={4}
        mb="md"
      />
      <Group justify="flex-end">
        <Button variant="default" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          onClick={() => onConfirm({ reserver_name: reserverName, message })}
          loading={loading}
          disabled={loading}
        >
          Confirmar reserva
        </Button>
      </Group>
    </Modal>
  );
}