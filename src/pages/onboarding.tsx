import BaseLayout from '@/components/Layout/_BaseLayout';
import WeddingProfileOnboardingForm from '@/components/WeddingProfileOnboardingForm';
import { Box, Card, Container, Text, Title } from '@mantine/core';
import { useRouter } from 'next/router';
import React from 'react';

const OnboardingPage: React.FC = () => {
  const router = useRouter();

  return (
    <BaseLayout>
      <Container size="md" py="xl">
        <Box mb="md">
          <Title order={2}>Complete o perfil do casal</Title>
          <Text c="dimmed" mt="xs">
            Precisamos dessas informacoes para liberar a sua dashboard.
          </Text>
        </Box>

        <Card radius="lg" p="xl" withBorder>
          <WeddingProfileOnboardingForm onComplete={() => router.push('/dashboard')} />
        </Card>
      </Container>
    </BaseLayout>
  );
};

export default OnboardingPage;
