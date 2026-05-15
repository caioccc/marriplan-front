import { Modal } from '@mantine/core';
import WeddingProfileOnboardingForm from './WeddingProfileOnboardingForm';

type WeddingProfileOnboardingModalProps = {
  opened: boolean;
  onClose: () => void;
  onComplete: () => void;
  disableClose?: boolean;
}

export default function WeddingProfileOnboardingModal({
  opened,
  onClose,
  onComplete,
  disableClose = false,
}: WeddingProfileOnboardingModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Complete seu perfil de casamento"
      size="xl"
      centered
      withCloseButton={!disableClose}
      closeOnClickOutside={!disableClose}
      closeOnEscape={!disableClose}
    >
      <WeddingProfileOnboardingForm onComplete={onComplete} />
    </Modal>
  );
}
