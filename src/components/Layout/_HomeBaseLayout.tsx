import Image from "next/image";
import { Box, Paper, Stack, Text, Title } from "@mantine/core";
import React from "react";

interface HomeBaseLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

const HomeBaseLayout = ({ children, title, description }: HomeBaseLayoutProps) => {
  return (
    <div
      className="flex min-h-screen items-center justify-center px-4 py-10"
      style={{
        background:
          "radial-gradient(circle at top left, rgba(242, 230, 216, 0.72), transparent 28%), radial-gradient(circle at bottom right, rgba(181, 139, 122, 0.12), transparent 34%), linear-gradient(180deg, #faf7f2 0%, #f6f1ea 55%, #ffffff 100%)",
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'linear-gradient(135deg, rgba(255,255,255,0.24) 0%, transparent 30%, transparent 70%, rgba(255,255,255,0.16) 100%)',
        }}
      />
      <Box
        style={{
          position: 'absolute',
          top: -120,
          left: -80,
          width: 260,
          height: 260,
          borderRadius: '999px',
          background: 'rgba(242, 230, 216, 0.45)',
          filter: 'blur(32px)',
          pointerEvents: 'none',
        }}
      />
      <Box
        style={{
          position: 'absolute',
          right: -120,
          bottom: -120,
          width: 320,
          height: 320,
          borderRadius: '999px',
          background: 'rgba(181, 139, 122, 0.14)',
          filter: 'blur(48px)',
          pointerEvents: 'none',
        }}
      />
      <Paper
        radius="xl"
        p="xl"
        withBorder
        className="marriplan-fade-in w-full max-w-md"
        style={{
          position: 'relative',
          zIndex: 1,
          background: 'rgba(255, 250, 246, 0.92)',
          borderColor: 'var(--marriplan-border)',
          boxShadow: 'var(--marriplan-shadow)',
          backdropFilter: 'blur(14px)',
        }}
      >
        <Stack gap="lg">
          <Stack gap={10} align="center">
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 14px',
                borderRadius: 999,
                background: 'var(--marriplan-champagne)',
                border: '1px solid var(--marriplan-border)',
              }}
            >
              <Image
                src="/logo-marri.png"
                alt="Logo Marriplan"
                width={24}
                height={24}
                style={{ borderRadius: 8, boxShadow: '0 8px 18px rgba(70, 56, 43, 0.12)' }}
              />
              <Text size="xs" fw={700} tt="uppercase" style={{ letterSpacing: '0.18em', color: 'var(--marriplan-muted)' }}>
                Marriplan
              </Text>
            </div>

            {title && (
              <Title order={2} ta="center" className="marriplan-heading">
                {title}
              </Title>
            )}

            {description && (
              <Text size="sm" ta="center" style={{ color: 'var(--marriplan-muted)', maxWidth: 360, margin: '0 auto' }}>
                {description}
              </Text>
            )}
          </Stack>

          {children}
        </Stack>
      </Paper>
    </div>
  );
};

export default HomeBaseLayout;
