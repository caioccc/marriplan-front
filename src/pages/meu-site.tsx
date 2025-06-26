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
import { IconEdit, IconEye, IconHome, IconShare, IconWorldWww } from '@tabler/icons-react';
import { useRouter } from 'next/router';
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

  const [loadingSite, setLoadingSite] = useState(false);

  const { user } = useAuth();

  const router = useRouter();

  useEffect(() => {
    async function fetchSite() {
      setLoading(true);
      setLoadingSite(true);
      const data = await getWeddingSite();
      if (!data) {
        setDataSite({});
        setLoading(false);
        setLoadingSite(false);
        return;
      } else {
        setDataSite(data);
        setLoadingSite(false);
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
    // Remove campos com objetos/elementos não serializáveis (ex: arquivos, HTMLInputElement)
    // cover_photo é um campo especial que pode conter uma imagm, ou seja, enviar apenas o id
    if (formData.cover_photo && formData.cover_photo.id) {
      formData.cover_photo = formData.cover_photo.id;
    }

    if (formData.gallery && Array.isArray(formData.gallery)) {
      formData.gallery = formData.gallery.map((item: any) => item.id || item);
    }

    const cleanFormData = JSON.parse(JSON.stringify(formData, (key, value) => {
      if (
        value instanceof File ||
        (typeof window !== 'undefined' && value instanceof window.File) ||
        (value && typeof value === 'object' && value.nodeType === 1)
      ) {
        return undefined;
      }
      return value;
    }));
    const site = await getWeddingSite();
    let response = null;
    if (!site) {
      response = await createWeddingSite(cleanFormData);

    } else {
      response = await updateWeddingSite(cleanFormData);
    }
    setDataSite(response);
    setLoading(false);
  };

  const handlePublish = async (formData: any) => {
    setLoading(true);
    await handleSave({
      ...formData,
      status: 'published'
    });
    const updatedSite = await getWeddingSite();
    setDataSite(updatedSite);
    setUltimaAtualizacao(updatedSite?.last_edited_at ? new Date(updatedSite.last_edited_at).toLocaleString() : '');
    setVisitas(updatedSite.visits || 0);
    setTaxaRSVP(updatedSite.rsvp_conversion || 0);
    setUltimaVisita(updatedSite.last_visitor ? `${updatedSite.last_visitor} (${updatedSite.last_visitor_at ? new Date(updatedSite.last_visitor_at).toLocaleDateString() : ''})` : '');
    setStatus(true);
    setLoading(false);
  };

  const handleUnpublish = async () => {
    setLoading(true);
    await unpublishWeddingSite();
    const updatedSite = await getWeddingSite();
    setDataSite(updatedSite);
    setStatus(false);
    setLoading(false);
  };

  return (
    <BaseLayout>
      <Box p="md">
        <Group mb="md" align="center">
          <IconWorldWww size={28} style={{ marginRight: 8 }} />
          <Title order={2}>Meu Site de Casamento</Title>
        </Group>
        {user?.wedding_profile && user?.wedding_site && (
          <Card shadow="md" p="lg" radius="md" withBorder mb="xl">
            <Group justify="space-between" align="center">
              <Group>
                <IconHome size={32} />
                <div>
                  <Text fw={700} size="lg">Status do Site</Text>
                  <Text size="sm" c="dimmed">Última atualização: {ultimaAtualizacao}</Text>
                  {
                    dataSite.status === 'published' && (
                      <Text size="sm" mt={4}>
                        Endereço:{" "}
                        <a
                          href={`${window.location.origin}/site/${dataSite.url_slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "#228be6", textDecoration: "underline" }}
                        >
                          {`${window.location.origin}/site/${dataSite.url_slug}`}
                        </a>
                      </Text>
                    )
                  }

                </div>
              </Group>
              <Switch checked={status} onChange={status ? handleUnpublish : handlePublish} color={status ? 'green' : 'red'} size="lg" label={status ? 'Ativo' : 'Inativo'} />
            </Group>
            {
              dataSite.status === 'published' && (
                <>
                  <Group mt="md" gap="xl">
                    <Badge color="blue" size="lg">Visitas: {visitas.toLocaleString()}</Badge>
                    <Badge color="teal" size="lg">RSVP: {taxaRSVP}%</Badge>
                    <Badge color="gray" size="lg">Última visita: {ultimaVisita}</Badge>
                  </Group>
                  <Group mt="md" gap="md">
                    <Button leftSection={<IconEye size={18} />} color="blue" onClick={() => {
                      window.open(`${window.location.origin}/site/${dataSite.url_slug}`, '_blank');
                    }}>Visualizar Site</Button>
                    {/* <Button leftSection={<IconShare size={18} />} color="green" variant="outline">Compartilhar</Button> */}
                  </Group>
                </>
              )
            }

          </Card>
        )}

        {
          loadingSite ? (
            <Text>Carregando site...</Text>
          ) : (
            <Card shadow="sm" p="lg" radius="md" withBorder mb="xl">
              <Title order={4} mb="sm">Configuração do Site</Title>
              <SiteConfigStepper
                initialData={dataSite}
                onSave={handleSave}
                onPublish={handlePublish}
                loading={loading}
              />
            </Card>
          )
        }

        <Modal opened={previewOpen} onClose={() => setPreviewOpen(false)} title="Prévia do Site" size="xl">
          <Box style={{ height: 500, background: '#f8f9fa', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Text c="dimmed">Aqui será exibida a prévia do site do casamento com o template selecionado.</Text>
          </Box>
        </Modal>
      </Box>
    </BaseLayout>
  );
}
