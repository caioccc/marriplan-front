import {
  Button,
  Group,
  Modal,
  Select,
  Switch,
  TextInput
} from "@mantine/core";
import { useState } from "react";
import { useMediaQuery } from "@mantine/hooks";
import { MobileFullscreenModal } from "@/components/MobileFullscreenModal";

interface MarkAsPurchasedModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: (purchasedBy: string) => void;
  guests?: { id: string; name: string }[];
}

export function MarkAsPurchasedModal({
  opened,
  onClose,
  onConfirm,
  guests = [],
}: MarkAsPurchasedModalProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [useCustomName, setUseCustomName] = useState(false);
  const [customName, setCustomName] = useState("");
  const [selectedGuest, setSelectedGuest] = useState<string | null>(null);

  const handleConfirm = () => {
    if (useCustomName && customName) {
      onConfirm(customName);
      onClose();
    } else if (!useCustomName && selectedGuest) {
      const guest = guests.find((g) => g.id == selectedGuest);
      onConfirm(guest?.name || "");
      onClose();
    }
  };

  const content = (
    <>
      <Group mb="md">
        <Switch
          label="Preencher nome manualmente"
          checked={useCustomName}
          onChange={(e) => setUseCustomName(e.currentTarget.checked)}
        />
      </Group>
      {useCustomName ? (
        <TextInput
          label="Nome de quem comprou"
          value={customName}
          onChange={(e) => setCustomName(e.currentTarget.value)}
          required
          mb="md"
        />
      ) : (
        <Select
          label="Selecione o convidado"
          data={guests.map((g) => ({ value: String(g.id), label: g.name }))}
          value={selectedGuest}
          onChange={setSelectedGuest}
          required
          mb="md"
        />
      )}
    </>
  );

  const footer = (
    <Group grow>
      <Button variant="default" onClick={onClose} fullWidth>
        Cancelar
      </Button>
      <Button
        onClick={handleConfirm}
        disabled={useCustomName ? !customName : !selectedGuest}
        fullWidth
      >
        Confirmar
      </Button>
    </Group>
  );

  if (isMobile) {
    return (
      <MobileFullscreenModal
        opened={opened}
        onClose={onClose}
        title="Marcar como comprado"
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
      title="Marcar como comprado"
      centered
    >
      {content}
      <Group justify="flex-end">
        <Button variant="default" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={useCustomName ? !customName : !selectedGuest}
        >
          Confirmar
        </Button>
      </Group>
    </Modal>
  );
}
