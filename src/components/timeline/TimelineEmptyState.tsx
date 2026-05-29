import { primaryButtonStyles, softButtonStyles } from '@/styles';
import { Button, Card, Stack, Text, Title, Group } from '@mantine/core';

type TimelineEmptyStateProps = {
  onCreateFirstMoment: () => void;
  onGenerateDefault: () => void;
};

export function TimelineEmptyState({
  onCreateFirstMoment,
  onGenerateDefault,
}: TimelineEmptyStateProps) {
  return (
    <Card
      radius="xl"
      withBorder
      p="xl"
      style={{
        position: 'relative',
        overflow: 'hidden',
        background:
          'linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(246,238,228,0.92) 100%)',
        border: '1px solid var(--marriplan-border)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 'auto -36px -36px auto',
          width: 180,
          height: 180,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(181,139,122,0.18), transparent 68%)',
          pointerEvents: 'none',
        }}
      />
      <Stack gap="md" align="center" style={{ position: 'relative' }}>
        <div
          style={{
            width: 92,
            height: 92,
            borderRadius: 28,
            background: 'linear-gradient(135deg, #f7efe7 0%, #ead7ca 100%)',
            display: 'grid',
            placeItems: 'center',
            boxShadow: 'inset 0 0 0 1px rgba(181, 139, 122, 0.16)',
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: '50%',
              border: '2px solid rgba(181,139,122,0.55)',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: 6,
                width: 2,
                height: 14,
                transform: 'translateX(-50%)',
                background: 'var(--marriplan-rose)',
                borderRadius: 999,
              }}
            />
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: 11,
                height: 2,
                transform: 'translate(-5px, -1px)',
                background: 'var(--marriplan-rose)',
                borderRadius: 999,
              }}
            />
          </div>
        </div>

        <Stack gap={4} align="center" ta="center" maw={520}>
          <Title order={3}>Seu cronograma ainda está vazio</Title>
          <Text c="dimmed">
            Crie o primeiro momento para organizar o roteiro hora a hora do casamento.
          </Text>
        </Stack>

        <Group justify="center" wrap="wrap">
          <Button onClick={onCreateFirstMoment} styles={primaryButtonStyles}>
            Criar primeiro momento
          </Button>
          <Button variant="default" onClick={onGenerateDefault} styles={softButtonStyles}>
            Gerar timeline padrão
          </Button>
        </Group>
      </Stack>
    </Card>
  );
}
