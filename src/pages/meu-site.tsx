import BaseLayout from '@/components/Layout/_BaseLayout';
import SiteConfigStepper from '@/components/SiteConfigStepper';
import { useAuth } from '@/contexts/AuthContext';
import {
  createWeddingSite,
  getWeddingSite,
  getWeddingSiteMetrics,
  publishWeddingSite,
  unpublishWeddingSite,
  updateWeddingSite
} from '@/services/weddingSite';
import { Badge, Box, Button, Card, Group, Modal, Switch, Text, Title } from '@mantine/core';
import { IconEdit, IconEye, IconHome, IconShare } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

const templates = [
  { value: 'classico', label: 'Clássico' },
  { value: 'moderninho', label: 'Moderninho' },
  { value: 'rustico', label: 'Rústico' },
];

export default function MeuSitePage() {
  const [status, setStatus] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [visitas, setVisitas] = useState(0);
  const [taxaRSVP, setTaxaRSVP] = useState(0);
  const [ultimaVisita, setUltimaVisita] = useState('');
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState('');
  const [loading, setLoading] = useState(false);
  const [dataSite, setDataSite] = useState<any>({});

  const { user } = useAuth();

  useEffect(() => {
    async function fetchSite() {
      setLoading(true);
      const data = await getWeddingSite();
      if (!data) {
        setDataSite({});
        setLoading(false);
        return;
      } else {
        setDataSite(data);
      }
      setStatus(data?.status === 'published');
      setUltimaAtualizacao(data?.last_edited_at ? new Date(data.last_edited_at).toLocaleString() : '');
      setLoading(false);
    }
    async function fetchMetrics() {
      const metrics = await getWeddingSiteMetrics();
      setVisitas(metrics.visits || 0);
      setTaxaRSVP(metrics.rsvp_conversion || 0);
      setUltimaVisita(metrics.last_visitor ? `${metrics.last_visitor} (${metrics.last_visitor_at ? new Date(metrics.last_visitor_at).toLocaleDateString() : ''})` : '');
    }
    fetchSite();
    fetchMetrics();
  }, []);

  const handleSave = async (formData: any) => {
    setLoading(true);
    const site = await getWeddingSite();
    if (!site) {
      await createWeddingSite(formData);
    } else {
      await updateWeddingSite(formData);
    }
    setLoading(false);
  };

  const handlePublish = async () => {
    setLoading(true);
    await publishWeddingSite();
    setStatus(true);
    setLoading(false);
  };

  const handleUnpublish = async () => {
    setLoading(true);
    await unpublishWeddingSite();
    setStatus(false);
    setLoading(false);
  };

  return (
    <BaseLayout title="Meu Site do Casamento">
      <Box p="md">
        <Title order={2} mb="md">Meu Site do Casamento</Title>
        {user?.wedding_profile && user?.wedding_site && (
          <Card shadow="md" p="lg" radius="md" withBorder mb="xl">
            <Group justify="space-between" align="center">
              <Group>
                <IconHome size={32} />
                <div>
                  <Text fw={700} size="lg">Status do Site</Text>
                  <Text size="sm" c="dimmed">Última atualização: {ultimaAtualizacao}</Text>
                </div>
              </Group>
              <Switch checked={status} onChange={status ? handleUnpublish : handlePublish} color={status ? 'green' : 'red'} size="lg" label={status ? 'Ativo' : 'Inativo'} />
            </Group>
            <Group mt="md" gap="xl">
              <Badge color="blue" size="lg">Visitas: {visitas.toLocaleString()}</Badge>
              <Badge color="teal" size="lg">RSVP: {taxaRSVP}%</Badge>
              <Badge color="gray" size="lg">Última visita: {ultimaVisita}</Badge>
            </Group>
            <Group mt="md" gap="md">
              <Button leftSection={<IconEye size={18} />} color="blue" onClick={() => setPreviewOpen(true)}>Visualizar Site</Button>
              <Button leftSection={<IconShare size={18} />} color="green" variant="outline">Compartilhar</Button>
            </Group>
          </Card>
        )}

        <Card shadow="sm" p="lg" radius="md" withBorder mb="xl">
          <Title order={4} mb="sm">Configuração do Site</Title>
          <SiteConfigStepper
            initialData={dataSite}
            onSave={handleSave}
            onPublish={handlePublish}
            loading={loading}
          />
        </Card>
        <Modal opened={previewOpen} onClose={() => setPreviewOpen(false)} title="Prévia do Site" size="xl">
          <Box style={{ height: 500, background: '#f8f9fa', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Text c="dimmed">Aqui será exibida a prévia do site do casamento com o template selecionado.</Text>
          </Box>
        </Modal>
      </Box>
    </BaseLayout>
  );
}
