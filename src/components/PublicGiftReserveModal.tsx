import { Button, Group, Modal, Textarea, TextInput } from "@mantine/core";
import { useEffect, useState } from "react";
import { useMediaQuery } from "@mantine/hooks";
import { inputStyles, primaryButtonStyles, softButtonStyles } from "@/styles";
import { MobileFullscreenModal } from "@/components/MobileFullscreenModal";

type PublicGiftReserveModalProps = {
  opened: boolean;
  giftName?: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (payload: {
    reserver_name: string;
    message: string;
  }) => Promise<void> | void;
};

export default function PublicGiftReserveModal({
  opened,
  giftName,
  loading = false,
  onClose,
  onConfirm,
}: PublicGiftReserveModalProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [reserverName, setReserverName] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (opened) {
      setReserverName("");
      setMessage("");
    }
  }, [opened]);

  const content = (
    <>
      <TextInput
        label="Seu nome"
        placeholder="Como você quer ser identificado"
        value={reserverName}
        onChange={(event) => setReserverName(event.currentTarget.value)}
        mb="sm"
        styles={inputStyles}
      />
      <Textarea
        label="Mensagem para os noivos"
        placeholder="Escreva uma mensagem opcional junto da reserva"
        value={message}
        onChange={(event) => setMessage(event.currentTarget.value)}
        minRows={4}
        mb="md"
        styles={inputStyles}
      />
    </>
  );

  const footer = (
    <Group grow>
      <Button variant="default" onClick={onClose} styles={softButtonStyles} fullWidth>
        Cancelar
      </Button>
      <Button
        onClick={() => onConfirm({ reserver_name: reserverName, message })}
        loading={loading}
        disabled={loading}
        styles={primaryButtonStyles}
        fullWidth
      >
        Confirmar reserva
      </Button>
    </Group>
  );

  if (isMobile) {
    return (
      <MobileFullscreenModal
        opened={opened}
        onClose={onClose}
        title={`Reservar ${giftName || "presente"}`}
        footer={footer}
      >
        {content}
      </MobileFullscreenModal>
    );
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`Reservar ${giftName || "presente"}`}
      centered
    >
      {content}
      <Group justify="flex-end">
        <Button variant="default" onClick={onClose} styles={softButtonStyles}>
          Cancelar
        </Button>
        <Button
          onClick={() => onConfirm({ reserver_name: reserverName, message })}
          loading={loading}
          disabled={loading}
          styles={primaryButtonStyles}
        >
          Confirmar reserva
        </Button>
      </Group>
    </Modal>
  );
}
