import Head from 'next/head';
import { GetServerSideProps, NextPage } from 'next';
import { Box, Container, Stack, Text, Title } from '@mantine/core';

import { PublicPixSettingsRecord } from '@/services/pixService';
import { PixGiftStepper } from '@/components/gifts/pix/PixGiftStepper';

type PixPublicPageProps = {
  pixSettings: PublicPixSettingsRecord;
  hash: string;
};

const PixPublicPage: NextPage<PixPublicPageProps> = ({ pixSettings, hash }) => {
  return (
    <>
      <Head>
        <title>Presente via PIX | Marriplan</title>
        <meta
          name="description"
          content={`Presenteie ${pixSettings.recipient_name} via PIX. Copie o código, escaneie o QR Code e contribua com qualquer valor.`}
        />
        <meta property="og:title" content={`Presenteie ${pixSettings.recipient_name} via PIX`} />
        <meta
          property="og:description"
          content={`Contribua com qualquer valor via PIX para ${pixSettings.recipient_name}.`}
        />
      </Head>

      <Box
        style={{
          minHeight: '100dvh',
          background: 'radial-gradient(circle at top, rgba(255, 243, 236, 0.95) 0%, rgba(248, 241, 234, 0.96) 42%, rgba(255, 255, 255, 1) 100%)',
          padding: '32px 0',
        }}
      >
        <Container size="lg">
          <Stack gap="lg">
            <Stack gap={8} ta="center" align="center">
              <Text size="xs" tt="uppercase" fw={700} c="dimmed" style={{ letterSpacing: 1.4 }}>
                Presente compartilhável
              </Text>
              <Title order={1}>Receber Presente via PIX</Title>
              <Text c="dimmed" maw={720}>
                Faça seu presente chegar de forma elegante, rápida e sem etapas intermediárias.
              </Text>
            </Stack>

            <PixGiftStepper shareHash={hash} coupleName={pixSettings.recipient_name} initialSettings={pixSettings} />

            <Text size="xs" c="dimmed" ta="center">
              Hash público: {hash}
            </Text>
          </Stack>
        </Container>
      </Box>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<PixPublicPageProps> = async (context) => {
  const hash = String(context.params?.hash || '').trim();
  if (!hash) {
    return { notFound: true };
  }

  const backendBaseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8000').replace(/\/$/, '');
  const response = await fetch(`${backendBaseUrl}/api/pix-settings/public/${hash}/`);

  if (!response.ok) {
    return { notFound: true };
  }

  const pixSettings = (await response.json()) as PublicPixSettingsRecord;

  return {
    props: {
      pixSettings,
      hash,
    },
  };
};

export default PixPublicPage;