import { actionIconDangerStyles, actionIconEditStyles } from '@/styles';
import { TimelineMoment } from '@/types/timeline';
import { ActionIcon, Card, Group, Stack, Text } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconEdit, IconTrash } from '@tabler/icons-react';

type TimelineItemProps = {
  moment: TimelineMoment;
  onEdit: (moment: TimelineMoment) => void;
  onDelete: (moment: TimelineMoment) => void;
};

function formatTime(time: string) {
  return time?.slice(0, 5) || '--:--';
}

export function TimelineItem({ moment, onEdit, onDelete }: TimelineItemProps) {
  const isDesktop = useMediaQuery('(min-width: 640px)');

  return (
    <div
      style={{
        display: 'grid',
        // SOLUÇÃO AQUI: Altera dinamicamente as colunas do grid
        gridTemplateColumns: isDesktop ? '92px 28px 1fr' : '92px 1fr',
        gap: 0,
        alignItems: 'stretch',
      }}
    >
      <Stack gap={2} align="flex-end" pt={isDesktop ? 24 : 24} pr={isDesktop ? 4 : 16} style={{ flexShrink: 0 }}>
        <Text fw={800} size="sm" c="var(--marriplan-text)">
          {formatTime(moment.time)}
        </Text>
        <Text size="xs" c="dimmed">
          Ordem {moment.order}
        </Text>
      </Stack>

      {isDesktop && (
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            flexShrink: 0,
            marginTop: 6,
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
            minHeight: '100%',
          }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: 'rgba(181, 139, 122, 0.25)',
              boxShadow: '0 0 0 4px var(--marriplan-surface)',
              position: 'relative',
              zIndex: 10,
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: 12,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 1,
              height: 'calc(100% + 48px)',
              background:
                'linear-gradient(180deg, rgba(181,139,122,0.20) 0%, rgba(181,139,122,0.05) 100%)',
            }}
          />
        </div>
      )}

      <Card
        radius="xl"
        withBorder
        p="lg"
        style={{
          background: 'linear-gradient(135deg, #fffdf9 0%, #f7f1ea 100%)',
          border: '1px solid var(--marriplan-border)',
          position: 'relative',
          width: '100%', // Garante que o card ocupe o espaço disponível da coluna
        }}
        styles={{
          root: {
            '&:hover .timeline-actions': {
              opacity: 1,
              transform: 'translateY(0)',
            },
          },
        }}
      >
        <Stack gap="sm">
          <Group justify="space-between" align="flex-start" wrap="nowrap" gap="sm">
            <Stack gap={4} style={{ flex: 1 }}>
              <Text fw={800} size="md" c="var(--marriplan-text)">
                {moment.title}
              </Text>
              {moment.description ? (
                <Text c="dimmed" size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                  {moment.description}
                </Text>
              ) : (
                <Text c="dimmed" size="sm" fs="italic">
                  Sem descrição
                </Text>
              )}
            </Stack>

            <Group
              className="timeline-actions"
              gap={6}
              style={{
                // Dica extra: em telas touch (mobile), o hover não funciona bem, 
                // então deixamos os botões um pouco mais visíveis por padrão (0.85) ou 1.0 no mobile.
                opacity: isDesktop ? 0.72 : 1,
                transform: isDesktop ? 'translateY(2px)' : 'translateY(0)',
                transition: 'all 180ms ease',
              }}
            >
              <ActionIcon
                variant="subtle"
                aria-label="Editar momento"
                onClick={() => onEdit(moment)}
                styles={actionIconEditStyles}
              >
                <IconEdit size={16} />
              </ActionIcon>
              <ActionIcon
                variant="subtle"
                aria-label="Remover momento"
                onClick={() => onDelete(moment)}
                styles={actionIconDangerStyles}
              >
                <IconTrash size={16} />
              </ActionIcon>
            </Group>
          </Group>
        </Stack>
      </Card>
    </div>
  );
}