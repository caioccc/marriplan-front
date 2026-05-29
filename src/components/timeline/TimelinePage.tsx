import BaseLayout from '@/components/Layout/_BaseLayout';
import PageSectionHeader from '@/components/PageSectionHeader';
import { TimelineActions } from '@/components/timeline/TimelineActions';
import { TimelineEmptyState } from '@/components/timeline/TimelineEmptyState';
import { TimelineList } from '@/components/timeline/TimelineList';
import { TimelineMomentModal } from '@/components/timeline/TimelineMomentModal';
import { useAuth } from '@/contexts/AuthContext';
import { primaryButtonStyles, softButtonStyles } from '@/styles';
import { TimelineMoment, TimelineMomentPayload } from '@/types/timeline';
import { timelineService } from '@/services/timelineService';
import {
  Button,
  Card,
  Group,
  Modal,
  Stack,
  Text,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCalendarTime, IconTrash } from '@tabler/icons-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

export function TimelinePage() {
  const { user } = useAuth();
  const [moments, setMoments] = useState<TimelineMoment[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMoment, setEditingMoment] = useState<TimelineMoment | null>(null);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [generatingDefault, setGeneratingDefault] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TimelineMoment | null>(null);

  const coupleName = useMemo(() => {
    if (!user?.wedding_profile) {
      return 'Noivos';
    }

    const names = [user.wedding_profile.nome_noivo, user.wedding_profile.nome_noiva]
      .filter((value) => Boolean(value && value.trim()))
      .map((value) => String(value).trim());

    if (!names.length) {
      return 'Noivos';
    }

    return names.join(' & ');
  }, [user?.wedding_profile]);

  const loadMoments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await timelineService.listTimelineMoments();
      setMoments(Array.isArray(data) ? data : []);
    } catch {
      notifications.show({
        color: 'red',
        title: 'Não foi possível carregar o cronograma',
        message: 'Tente novamente em instantes.',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMoments();
  }, [loadMoments]);

  const handleCreate = () => {
    setEditingMoment(null);
    setModalOpen(true);
  };

  const handleEdit = (moment: TimelineMoment) => {
    setEditingMoment(moment);
    setModalOpen(true);
  };

  const handleDeleteRequest = (moment: TimelineMoment) => {
    setDeleteTarget(moment);
  };

  const handleSaveMoment = async (payload: TimelineMomentPayload) => {
    try {
      if (editingMoment) {
        const updated = await timelineService.updateTimelineMoment(editingMoment.id, payload);
        setMoments((current) =>
          [...current.filter((item) => item.id !== updated.id), updated].sort(
            (left, right) => left.time.localeCompare(right.time) || left.order - right.order,
          ),
        );
        notifications.show({
          color: 'green',
          title: 'Momento atualizado',
          message: 'O cronograma foi reorganizado automaticamente.',
        });
      } else {
        const created = await timelineService.createTimelineMoment(payload);
        setMoments((current) =>
          [...current, created].sort(
            (left, right) => left.time.localeCompare(right.time) || left.order - right.order,
          ),
        );
        notifications.show({
          color: 'green',
          title: 'Momento criado',
          message: 'O novo momento entrou na timeline.',
        });
      }
      setModalOpen(false);
      setEditingMoment(null);
    } catch {
      notifications.show({
        color: 'red',
        title: 'Erro ao salvar momento',
        message: 'Verifique os dados e tente novamente.',
      });
    }
  };

  const handleDeleteMoment = async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      await timelineService.deleteTimelineMoment(deleteTarget.id);
      setMoments((current) => current.filter((item) => item.id !== deleteTarget.id));
      notifications.show({
        color: 'green',
        title: 'Momento removido',
        message: 'A timeline foi atualizada.',
      });
      setDeleteTarget(null);
    } catch {
      notifications.show({
        color: 'red',
        title: 'Não foi possível remover',
        message: 'Tente novamente em instantes.',
      });
    }
  };

  const handleGenerateDefault = async () => {
    setGeneratingDefault(true);
    try {
      const result = await timelineService.generateDefaultTimeline();
      if (result?.created > 0) {
        await loadMoments();
        notifications.show({
          color: 'green',
          title: 'Timeline padrão gerada',
          message: 'Os momentos foram adicionados automaticamente.',
        });
        return;
      }

      notifications.show({
        color: 'blue',
        title: 'Timeline já existente',
        message: 'Nenhum novo momento foi criado.',
      });
    } catch {
      notifications.show({
        color: 'red',
        title: 'Erro ao gerar timeline padrão',
        message: 'Tente novamente em instantes.',
      });
    } finally {
      setGeneratingDefault(false);
    }
  };

  const handleExportPdf = async () => {
    setExportingPdf(true);
    try {
      const blob = await timelineService.exportTimelinePDF();
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = 'cronograma_casamento.pdf';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      notifications.show({
        color: 'green',
        title: 'PDF exportado',
        message: 'O cronograma está pronto para impressão e compartilhamento.',
      });
    } catch {
      notifications.show({
        color: 'red',
        title: 'Erro ao exportar PDF',
        message: 'Não foi possível gerar o arquivo.',
      });
    } finally {
      setExportingPdf(false);
    }
  };

  return (
    <BaseLayout>
      <Stack gap="lg">
        <PageSectionHeader
          eyebrow="Timeline"
          title="Cronograma do dia"
          description="Monte o roteiro hora a hora do casamento."
          actions={
            <TimelineActions
              onCreate={handleCreate}
              onExportPdf={handleExportPdf}
              onGenerateDefault={handleGenerateDefault}
              exportingPdf={exportingPdf}
              generatingDefault={generatingDefault}
            />
          }
        />

        <Card
          radius="lg"
          withBorder
          p="lg"
          style={{
            background: 'var(--marriplan-surface)',
            border: '1px solid var(--marriplan-border)',
          }}
        >
          <Group justify="space-between" align="center" wrap="wrap">
            <Group gap="xs">
              <IconCalendarTime size={18} color="var(--marriplan-rose)" />
              <Text fw={700}>Casal: {coupleName}</Text>
            </Group>
            <Text c="dimmed" size="sm">
              {moments.length} momento(s) organizados automaticamente por horário.
            </Text>
          </Group>
        </Card>

        {moments.length === 0 && !loading ? (
          <TimelineEmptyState
            onCreateFirstMoment={handleCreate}
            onGenerateDefault={handleGenerateDefault}
          />
        ) : (
          <TimelineList
            moments={moments}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDeleteRequest}
          />
        )}
      </Stack>

      <TimelineMomentModal
        opened={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingMoment(null);
        }}
        onSave={handleSaveMoment}
        initialMoment={editingMoment}
      />

      <Modal
        opened={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Remover momento"
        centered
        radius="lg"
      >
        <Stack gap="sm">
          <Text>
            Deseja remover este momento?
          </Text>
          {deleteTarget ? (
            <Card withBorder radius="lg" p="md" style={{ background: 'var(--marriplan-surface-muted)' }}>
              <Stack gap={2}>
                <Text fw={700}>{deleteTarget.time.slice(0, 5)} - {deleteTarget.title}</Text>
                {deleteTarget.description ? <Text c="dimmed" size="sm">{deleteTarget.description}</Text> : null}
              </Stack>
            </Card>
          ) : null}
          <Group grow mt="sm">
            <Button variant="default" onClick={() => setDeleteTarget(null)} styles={softButtonStyles}>
              Cancelar
            </Button>
            <Button color="red" onClick={handleDeleteMoment} styles={primaryButtonStyles} leftSection={<IconTrash size={16} />}>
              Remover
            </Button>
          </Group>
        </Stack>
      </Modal>
    </BaseLayout>
  );
}
