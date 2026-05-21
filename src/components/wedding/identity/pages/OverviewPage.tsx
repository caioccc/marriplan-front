import { DRESS_CODE_OPTIONS, WEDDING_STYLES } from '@/constants/weddingIdentityData';
import { PaletteColor } from '@/types/weddingIdentity';
import { buildCompletionItems, completionPercent } from '@/utils/weddingIdentityUtils';
import { Badge, Card, Group, SimpleGrid, Stack, Text } from '@mantine/core';
import React from 'react';
import PageSectionHeader from '@/components/PageSectionHeader';
import Icon from '../Icon';
import ProgressRing from '../ProgressRing';

interface OverviewPageProps {
  selectedStyle: string;
  palette: PaletteColor[];
  dressCode: string;
}

const OverviewPage: React.FC<OverviewPageProps> = ({ selectedStyle, palette, dressCode }) => {
  const completionItems = buildCompletionItems(selectedStyle, palette, dressCode);
  const pct = completionPercent(completionItems);

  return (
    <div className="wi-page">
      <PageSectionHeader
        eyebrow="Identidade do Casamento"
        title="Visão Geral"
        description="Construa a estetica perfeita do seu grande dia. Cada detalhe conta para criar uma experiencia inesquecivel."
        actions={
          <Group gap="sm" wrap="wrap">
            <Badge color="yellow" variant="light">{pct}% concluido</Badge>
            <button className="btn-primary"><Icon name="sparkles" size={14} color="#fff" /> Gerar Moodboard</button>
            <button className="btn-secondary"><Icon name="share" size={14} /> Compartilhar</button>
          </Group>
        }
      />

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md" mb={28}>
        <Card withBorder radius="lg" padding="lg">
          <Text size="sm" c="dimmed" tt="uppercase" fw={700} style={{ letterSpacing: 1.2 }}>Paleta Definida</Text>
          <Text fw={700} size="xl" mt={8}>{palette.length}</Text>
          <Text size="sm" c="dimmed">cores selecionadas</Text>
          <div className="palette-bar" style={{ marginTop: 10 }}>
            {palette.map((c) => <div key={c.id} className="palette-bar-segment" style={{ background: c.hex }} />)}
          </div>
        </Card>
        <Card withBorder radius="lg" padding="lg">
          <Text size="sm" c="dimmed" tt="uppercase" fw={700} style={{ letterSpacing: 1.2 }}>Estilo Selecionado</Text>
          <Text fw={700} size="md" mt={8}>{selectedStyle ? WEDDING_STYLES.find((s) => s.id === selectedStyle)?.label : '—'}</Text>
          <Text size="sm" c="dimmed">{selectedStyle ? 'estilo confirmado' : 'a definir'}</Text>
        </Card>
        <Card withBorder radius="lg" padding="lg">
          <Text size="sm" c="dimmed" tt="uppercase" fw={700} style={{ letterSpacing: 1.2 }}>Dress Code</Text>
          <Text fw={700} size="md" mt={8}>{dressCode ? DRESS_CODE_OPTIONS.find((d) => d.id === dressCode)?.label : '—'}</Text>
          <Text size="sm" c="dimmed">{dressCode ? 'codigo definido' : 'a definir'}</Text>
        </Card>
        <Card withBorder radius="lg" padding="lg">
          <Text size="sm" c="dimmed" tt="uppercase" fw={700} style={{ letterSpacing: 1.2 }}>Inspiracoes Salvas</Text>
          <Text fw={700} size="xl" mt={8}>8</Text>
          <Text size="sm" c="dimmed">referencias visuais</Text>
        </Card>
      </SimpleGrid>

      <div className="wi-grid-2" style={{ gap: 24 }}>
        <Card withBorder radius="lg" padding="lg">
          <Stack gap="md">
            <Text size="sm" c="dimmed" tt="uppercase" fw={700} style={{ letterSpacing: 1.2 }}>Progresso do Módulo</Text>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {completionItems.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, background: item.done ? '#f8fff5' : 'var(--marriplan-surface-muted)', border: `1px solid ${item.done ? '#d0ead0' : 'var(--marriplan-border)'}` }}>
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: item.done ? '#3a7a3a' : 'var(--marriplan-text)' }}>{item.label}</span>
                {item.done
                  ? <span style={{ color: '#4CAF50' }}><Icon name="check" size={16} color="#4CAF50" /></span>
                  : <span style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid var(--marriplan-border)', display: 'inline-block' }} />}
              </div>
            ))}
          </div>
          </Stack>
        </Card>

        <div>
          <Card withBorder radius="lg" padding="lg" mb={20}>
            <Stack gap="md">
              <Text size="sm" c="dimmed" tt="uppercase" fw={700} style={{ letterSpacing: 1.2 }}>Prévia da Paleta</Text>
            <div style={{ display: 'flex', gap: 10 }}>
              {palette.map((c) => (
                <div key={c.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: '100%', aspectRatio: '1', borderRadius: 12, background: c.hex, boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }} />
                  <span style={{ fontSize: 9, color: 'var(--marriplan-muted)', textAlign: 'center', fontWeight: 600 }}>{c.hex}</span>
                </div>
              ))}
            </div>
            </Stack>
          </Card>

          <Card withBorder radius="lg" padding="lg">
            <Stack gap="md">
              <Text size="sm" c="dimmed" tt="uppercase" fw={700} style={{ letterSpacing: 1.2 }}>Próximas Etapas</Text>
            {completionItems.filter((i) => !i.done).slice(0, 3).map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < 2 ? '1px solid var(--marriplan-border)' : 'none' }}>
                <span style={{ fontSize: 14 }}>{item.icon}</span>
                <span style={{ fontSize: 13, color: 'var(--marriplan-muted)' }}>{item.label}</span>
                <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--marriplan-gold)', fontWeight: 600 }}>Pendente</span>
              </div>
            ))}
            </Stack>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OverviewPage;
