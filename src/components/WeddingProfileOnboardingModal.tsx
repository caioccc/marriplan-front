import { Modal } from "@mantine/core";
import WeddingProfileOnboardingForm from "./WeddingProfileOnboardingForm";
import { useMediaQuery } from "@mantine/hooks";
import { MobileFullscreenModal } from "@/components/MobileFullscreenModal";

type WeddingProfileOnboardingModalProps = {
  opened: boolean;
  onClose: () => void;
  onComplete: () => void;
  disableClose?: boolean;
};

export default function WeddingProfileOnboardingModal({
  opened,
  onClose,
  onComplete,
  disableClose = false,
}: WeddingProfileOnboardingModalProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  if (isMobile) {
    return (
      <MobileFullscreenModal
        opened={opened}
        onClose={onClose}
        title="Complete seu perfil de casamento"
      >
        <WeddingProfileOnboardingForm onComplete={onComplete} />
      </MobileFullscreenModal>
    );
  }

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
