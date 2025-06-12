import BaseLayout from '@/components/Layout/_BaseLayout';
import { Card, Title, Text, Box, Timeline } from '@mantine/core';
import { IconEdit, IconCheck, IconWorld } from '@tabler/icons-react';

export default function HistoricoSite() {
  return (
    <BaseLayout title="Histórico de Atualizações do Site">
      <Box p="md">
        <Title order={2} mb="md">Histórico de Atualizações do Site</Title>
        <Card shadow="md" p="lg" radius="md" withBorder>
          <Timeline active={1} bulletSize={24} lineWidth={2}>
            <Timeline.Item bullet={<IconEdit size={16} />} title="Editado">
              <Text color="dimmed" size="sm">Título da seção alterado</Text>
              <Text size="xs" mt={4}>10/06/2025 18:00</Text>
            </Timeline.Item>
            <Timeline.Item bullet={<IconCheck size={16} />} title="Publicado">
              <Text color="dimmed" size="sm">Site publicado</Text>
              <Text size="xs" mt={4}>09/06/2025 14:30</Text>
            </Timeline.Item>
            <Timeline.Item bullet={<IconWorld size={16} />} title="Criado">
              <Text color="dimmed" size="sm">Site criado</Text>
              <Text size="xs" mt={4}>08/06/2025 10:00</Text>
            </Timeline.Item>
          </Timeline>
        </Card>
      </Box>
    </BaseLayout>
  );
}
