import {
  Box,
  CloseButton,
  Group,
  Modal,
  ScrollArea,
  Stack,
  Text,
} from "@mantine/core";
import type { ReactNode } from "react";

type MobileFullscreenModalProps = {
  opened: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  progress?: {
    active: number;
    total: number;
  };
};

export function MobileFullscreenModal({
  opened,
  onClose,
  title,
  children,
  footer,
  progress,
}: MobileFullscreenModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      fullScreen
      withCloseButton={false}
      centered={false}
      padding={0}
      styles={{
        content: { height: "100dvh" },
        body: { height: "100%", padding: 0 },
      }}
    >
      <Stack gap={0} h="100%" style={{ overflow: "hidden" }}>
        <Box
          px="md"
          py="sm"
          style={{
            background: "var(--marriplan-surface)",
            borderBottom: "1px solid var(--marriplan-border)",
          }}
        >
          <Group justify="space-between" align="flex-start" gap="sm">
            <Stack gap={2} style={{ minWidth: 0 }}>
              <Text fw={700} size="lg" c="var(--marriplan-text)">
                {title}
              </Text>
            </Stack>
            <CloseButton onClick={onClose} />
          </Group>

          {progress ? (
            <Group justify="center" gap={6} mt="sm">
              {Array.from({ length: progress.total }).map((_, index) => {
                const isActive = index === progress.active;
                return (
                  <Box
                    key={index}
                    w={isActive ? 14 : 6}
                    h={6}
                    style={{
                      borderRadius: 999,
                      backgroundColor: isActive
                        ? "var(--marriplan-rose)"
                        : "rgba(181, 139, 122, 0.22)",
                      transition: "all 160ms ease",
                    }}
                  />
                );
              })}
            </Group>
          ) : null}
        </Box>

        <ScrollArea style={{ flex: 1 }} type="auto" offsetScrollbars>
          <Box px="md" py="md">
            {children}
          </Box>
        </ScrollArea>

        {footer ? (
          <Box
            px="md"
            py="md"
            style={{
              background: "var(--marriplan-surface)",
              borderTop: "1px solid var(--marriplan-border)",
            }}
          >
            {footer}
          </Box>
        ) : null}
      </Stack>
    </Modal>
  );
}
