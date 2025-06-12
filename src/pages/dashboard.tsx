import BaseLayout from '@/components/Layout/_BaseLayout';
import { Title, Text, Container, Paper } from '@mantine/core';
import { NextPage } from 'next';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import WeddingProfileOnboardingModal from '@/components/WeddingProfileOnboardingModal';

const Dashboard: NextPage = () => {
  const { user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Detecta perfil incompleto (campos obrigatórios)
    if (!user?.wedding_profile) {
      setShowOnboarding(true);
    } else {
      const p = user.wedding_profile;
      if (!p.nome_noivo || !p.nome_noiva || !p.data_casamento || !p.hora_casamento || !p.local) {
      setShowOnboarding(true);
      }
    }
  }, [user]);

  return (
    <BaseLayout title={"Inicio"}>
      <WeddingProfileOnboardingModal
        opened={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={() => setShowOnboarding(false)}
      />
      <Container size="md" py="xl">
        <Paper shadow="md" p="xl" radius="md" withBorder>
          <Title order={2} mb="md">Bem-vindo ao Marriplan!</Title>
          <Text size="lg">
            Este é o seu painel inicial do planejador de casamentos. Em breve você poderá organizar tarefas, convidados, fornecedores e muito mais!
          </Text>
        </Paper>
      </Container>

    </BaseLayout>
  );
};

export default Dashboard;
