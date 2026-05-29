import { MobileFullscreenModal } from '@/components/MobileFullscreenModal';
import { PixGiftStepper } from '@/components/gifts/pix/PixGiftStepper';
import { getPublicPixSettings, PublicPixSettingsRecord } from '@/services/pixService';
import { Modal, Skeleton } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useEffect, useState } from 'react';

type PixPublicModalProps = {
  opened: boolean;
  onClose: () => void;
  shareHash?: string;
  coupleName: string;
};

export function PixPublicModal({ opened, onClose, shareHash, coupleName }: PixPublicModalProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<PublicPixSettingsRecord | null>(null);

  useEffect(() => {
    if (!opened || !shareHash) return;

    let mounted = true;
    setLoading(true);
    setSettings(null);

    getPublicPixSettings(shareHash)
      .then((response) => {
        if (mounted) setSettings(response);
      })
      .catch(() => {
        if (!mounted) return;
        notifications.show({
          color: 'red',
          message: 'Não foi possível carregar as configurações públicas do PIX.',
        });
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [opened, shareHash]);

  const content = shareHash ? (
    <PixGiftStepper shareHash={shareHash} coupleName={coupleName} initialSettings={settings} />
  ) : null;

  if (isMobile) {
    return (
      <MobileFullscreenModal opened={opened} onClose={onClose} title="Receber Presente via PIX">
        {loading || !settings ? <Skeleton height={520} radius="xl" /> : content}
      </MobileFullscreenModal>
    );
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Receber Presente via PIX" size="xl" centered>
      {loading || !settings ? <Skeleton height={560} radius="xl" /> : content}
    </Modal>
  );
}