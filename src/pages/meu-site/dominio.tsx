import BaseLayout from '@/components/Layout/_BaseLayout';
import { Card, Title, Text, Box, Button, TextInput } from '@mantine/core';
import { IconWorld } from '@tabler/icons-react';

export default function DominioSite() {
  return (
    <BaseLayout title="Configuração de Domínio do Site">
      <Box p="md">
        <Title order={2} mb="md">Domínio Personalizado</Title>
        <Card shadow="md" p="lg" radius="md" withBorder>
          <Text mb="md">Em breve você poderá conectar um domínio personalizado ao seu site do casamento!</Text>
          <TextInput label="Seu domínio" placeholder="ex: seucasamento.com" disabled mb="md" leftSection={<IconWorld size={18} />} />
          <Button disabled>Conectar Domínio</Button>
        </Card>
      </Box>
    </BaseLayout>
  );
}
