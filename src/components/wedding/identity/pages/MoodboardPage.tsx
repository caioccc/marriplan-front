import { DRESS_CODE_OPTIONS, WEDDING_STYLES } from '@/constants/weddingIdentityData';
import { PaletteColor } from '@/types/weddingIdentity';
import { Badge, Card, Group, SimpleGrid, Stack, Text } from '@mantine/core';
import React from 'react';
import PageSectionHeader from '@/components/PageSectionHeader';
import EmptyState from '../EmptyState';
import Icon from '../Icon';

interface MoodboardPageProps {
  selectedStyle: string;
  palette: PaletteColor[];
  dressCode: string;
}

const MoodboardPage: React.FC<MoodboardPageProps> = ({ selectedStyle, palette, dressCode }) => {
  const styleData = WEDDING_STYLES.find((s) => s.id === selectedStyle);
  const dressData = DRESS_CODE_OPTIONS.find((d) => d.id === dressCode);

  const moodColors = [
    'linear-gradient(135deg,#f5e8e0,#ecddd4)',
    'linear-gradient(135deg,#e8f0e8,#d8e8d8)',
    'linear-gradient(135deg,#f5f0e0,#ece5c8)',
    'linear-gradient(135deg,#f0e8f0,#e4d8e4)',
  ];

  return (
    <div className="wi-page">
      <PageSectionHeader
        eyebrow="Identidade do Casamento"
        title="Moodboard Final"
        description="A sintese visual completa do seu casamento. Compartilhe com seus fornecedores para alinhar expectativas."
        actions={
          <Group gap="sm" wrap="wrap">
            <Badge color="yellow" variant="light">{palette.length} cores</Badge>
            <button className="btn-primary"><Icon name="download" size={14} color="#fff" /> Exportar PDF</button>
            <button className="btn-secondary"><Icon name="share" size={14} /> Compartilhar com Fornecedores</button>
          </Group>
        }
      />

      {(!selectedStyle && palette.length === 0) ? (
        <EmptyState icon="✦" title="Seu moodboard esta em branco" message="Complete as secoes de Paleta, Estilo e Dress Code para gerar seu moodboard final." action={<span style={{ fontSize: 13, color: 'var(--marriplan-muted)' }}>Navegue pelas secoes no menu lateral</span>} />
      ) : (
        <>
          <Card withBorder radius="xl" padding={36} mb={28} style={{ background: 'linear-gradient(135deg,#2c1a0e,#5a3a1a)', color: '#fff', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -20, right: -20, fontSize: 120, opacity: 0.06 }}>✦</div>
            <Stack gap="sm">
              <Text size="xs" fw={700} tt="uppercase" style={{ letterSpacing: 2, opacity: 0.6 }}>Moodboard</Text>
              <Text fw={700} size="h3">Ana & Rafael</Text>
              <Text size="sm" style={{ opacity: 0.7 }}>Identidade visual completa do casamento</Text>
              <Group gap="sm" wrap="wrap">
                {styleData && <Badge variant="light" color="gray">✦ {styleData.label}</Badge>}
                {dressData && <Badge variant="light" color="gray">👗 {dressData.label}</Badge>}
                <Badge variant="light" color="gray">🎨 {palette.length} Cores</Badge>
              </Group>
            </Stack>
          </Card>

          <div className="moodboard-grid" style={{ marginBottom: 28 }}>
            <div className="moodboard-hero" style={{ background: 'linear-gradient(135deg,#f5e5d8,#ecddd0)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300, fontSize: 60 }}>🌸</div>
            {moodColors.map((c, i) => (
              <div key={i} className="moodboard-cell" style={{ background: c, minHeight: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>
                {['🕯️', '💌', '🍽️', '🌿'][i]}
              </div>
            ))}
          </div>

          <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
            <Card withBorder radius="lg" padding="lg">
              <Text size="sm" c="dimmed" tt="uppercase" fw={700} style={{ letterSpacing: 1.5, marginBottom: 12 }}>Paleta de Cores</Text>
              <div style={{ display: 'flex', gap: 8 }}>
                {palette.map((c) => (
                  <div key={c.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ aspectRatio: '1', borderRadius: 10, background: c.hex }} />
                    <div style={{ fontSize: 9, color: 'var(--marriplan-muted)', textAlign: 'center' }}>{c.hex}</div>
                  </div>
                ))}
              </div>
            </Card>

            <Card withBorder radius="lg" padding="lg">
              <Text size="sm" c="dimmed" tt="uppercase" fw={700} style={{ letterSpacing: 1.5, marginBottom: 12 }}>Estilo & Dress Code</Text>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={{ fontSize: 20 }}>{styleData?.emoji || '✦'}</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{styleData?.label || 'A definir'}</div>
                    <div style={{ fontSize: 11, color: 'var(--marriplan-muted)' }}>{styleData?.subtitle || ''}</div>
                  </div>
                </div>
                <div style={{ height: 1, background: 'var(--marriplan-border)' }} />
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={{ fontSize: 20 }}>👗</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{dressData?.label || 'A definir'}</div>
                    <div style={{ fontSize: 11, color: 'var(--marriplan-muted)' }}>{dressData?.desc?.slice(0, 40) || ''}...</div>
                  </div>
                </div>
              </div>
            </Card>

            <Card withBorder radius="lg" padding="lg">
              <Text size="sm" c="dimmed" tt="uppercase" fw={700} style={{ letterSpacing: 1.5, marginBottom: 12 }}>Inspiracoes Favoritas</Text>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} style={{ aspectRatio: '1', borderRadius: 10, background: moodColors[i], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                    {['🌸', '🌹', '🍽️', '💌'][i]}
                  </div>
                ))}
              </div>
            </Card>
          </SimpleGrid>

          <div className="export-card" style={{ marginTop: 28 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', opacity: 0.6, marginBottom: 8 }}>Compartilhar</div>
              <h3 style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Envie para seus Fornecedores</h3>
              <p style={{ fontSize: 13, opacity: 0.7, maxWidth: 380 }}>Gere um link exclusivo ou PDF com toda a identidade visual do casamento para compartilhar com fornecedores.</p>
            </div>
            <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
              <button style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 10, padding: '12px 20px', color: '#fff', fontFamily: 'Manrope, sans-serif', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon name="share" size={14} color="#fff" /> Gerar Link
              </button>
              <button style={{ background: '#fff', borderRadius: 10, padding: '12px 20px', color: '#2c1a0e', fontFamily: 'Manrope, sans-serif', fontSize: 13, fontWeight: 700, cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icon name="download" size={14} /> Exportar PDF
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MoodboardPage;
