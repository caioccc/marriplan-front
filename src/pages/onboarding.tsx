import BaseLayout from "@/components/Layout/_BaseLayout";
import WeddingProfileOnboardingSimpleForm from "@/components/WeddingProfileOnboardingSimpleForm";
import { Box, Card, Container, Text, Title } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useRouter } from "next/router";
import React from "react";

const OnboardingPage: React.FC = () => {
  const router = useRouter();

  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <BaseLayout>
      <Container size="md" py={isMobile ? "" : "xl"}>
        <Box mb="md">
          <Title order={2}>Complete os dados iniciais</Title>
          <Text c="dimmed" mt="xs">
            Precisamos apenas das informacoes essenciais para liberar a sua dashboard.
          </Text>
        </Box>

        <Card radius="lg" py={isMobile ? "" : "xl"} withBorder>
          <WeddingProfileOnboardingSimpleForm
            onComplete={() => router.push("/dashboard")}
          />
        </Card>
      </Container>
    </BaseLayout>
  );
};

export default OnboardingPage;
