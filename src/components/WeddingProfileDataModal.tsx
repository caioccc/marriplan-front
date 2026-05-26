import { MobileFullscreenModal } from "@/components/MobileFullscreenModal";
import { Modal } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import WeddingProfileOnboardingForm from "./WeddingProfileOnboardingForm";

type WeddingProfileDataModalProps = {
  opened: boolean;
  onClose: () => void;
  onComplete: () => void;
  disableClose?: boolean;
};

export default function WeddingProfileDataModal({
  opened,
  onClose,
  onComplete,
  disableClose = false,
}: WeddingProfileDataModalProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");

  if (isMobile) {
    return (
      <MobileFullscreenModal opened={opened} onClose={onClose} title="Meus dados">
        <WeddingProfileOnboardingForm onComplete={onComplete} />
      </MobileFullscreenModal>
    );
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Meus dados"
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