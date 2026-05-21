import { PALETTE_PRESET_COLORS } from '@/constants/weddingIdentityData';
import { PaletteColor } from '@/types/weddingIdentity';
import { canAddPaletteColor, isDuplicatedPaletteColor } from '@/validators/weddingIdentityValidators';
import { Badge, Card, Group, SimpleGrid, Stack, Text } from '@mantine/core';
import React, { useState } from 'react';
import PageSectionHeader from '@/components/PageSectionHeader';
import Icon from '../Icon';

interface PalettePageProps {
  palette: PaletteColor[];
  setPalette: React.Dispatch<React.SetStateAction<PaletteColor[]>>;
}

const PalettePage: React.FC<PalettePageProps> = ({ palette, setPalette }) => {
  const [showModal, setShowModal] = useState(false);
  const [newColor, setNewColor] = useState('#E3C1B5');
  const [newName, setNewName] = useState('');

  const livePreview = [
    { emoji: '💌', label: 'Convite', bg: palette[0]?.hex || '#E3C1B5' },
    { emoji: '🌸', label: 'Flores', bg: palette[1]?.hex || '#F7E7C8' },
    { emoji: '🍽️', label: 'Mesa', bg: palette[2]?.hex || '#FFFDF5' },
    { emoji: '💡', label: 'Iluminacao', bg: palette[3]?.hex || '#E5E1D1' },
    { emoji: '👗', label: 'Madrinhas', bg: palette[4]?.hex || '#BDA88D' },
    { emoji: '🎂', label: 'Bolo', bg: palette[0]?.hex || '#E3C1B5' },
  ];

  const addColor = () => {
    if (!canAddPaletteColor(palette)) return;
    setPalette((p) => [...p, { id: Date.now(), hex: newColor, name: newName || newColor, isPrimary: p.length < 2 }]);
    setShowModal(false);
    setNewName('');
  };

  return (
    <div className="wi-page">
      <PageSectionHeader
        eyebrow="Identidade do Casamento"
        title="Paleta de Cores"
        description="Defina as cores que vao guiar toda a estetica do seu casamento. Escolha ate 5 cores que representam o seu estilo."
        actions={<Badge color="yellow" variant="light">{palette.length}/5 cores</Badge>}
        filters={
          <Group gap="sm" wrap="wrap">
            <button className="btn-primary" onClick={() => setShowModal(true)}><Icon name="plus" size={14} color="#fff" /> Adicionar Cor</button>
            <button className="btn-secondary"><Icon name="download" size={14} /> Exportar Paleta</button>
          </Group>
        }
      />

      <div className="palette-layout">
        <div>
          <Card withBorder radius="lg" padding="lg" mb={20}>
            <Stack gap="md">
              <Text fw={700} size="sm" tt="uppercase" c="dimmed" style={{ letterSpacing: 1.2 }}>Suas Cores ({palette.length}/5)</Text>
            <div className="color-picker-grid" style={{ marginBottom: 20 }}>
              {palette.map((c) => (
                <div key={c.id} style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
                  <div style={{ width: '100%', aspectRatio: '1', borderRadius: 14, background: c.hex, boxShadow: '0 4px 14px rgba(0,0,0,0.12)', cursor: 'pointer', position: 'relative' }}>
                    {c.isPrimary && <span style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(255,255,255,0.9)', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>★</span>}
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--marriplan-text)' }}>{c.hex}</div>
                    <div style={{ fontSize: 10, color: 'var(--marriplan-muted)' }}>{c.name}</div>
                  </div>
                  <button className="btn-ghost" style={{ fontSize: 10, padding: '4px 8px' }} onClick={() => setPalette((p) => p.filter((x) => x.id !== c.id))}>Remover</button>
                </div>
              ))}
              {palette.length < 5 && (
                <div
                  onClick={() => setShowModal(true)}
                  style={{ aspectRatio: '1', borderRadius: 14, border: '2px dashed var(--marriplan-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--marriplan-muted)', fontSize: 24, transition: 'all 0.15s' }}
                  onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--marriplan-gold)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--marriplan-border)'; }}
                >
                  +
                </div>
              )}
            </div>

              <div style={{ marginTop: 16 }}>
                <Text fw={700} size="sm" tt="uppercase" c="dimmed" style={{ letterSpacing: 1.2 }}>Cores Sugeridas</Text>
                <SimpleGrid cols={5} spacing={8} mt={8}>
                  {PALETTE_PRESET_COLORS.map((c) => (
                    <div
                      key={c.hex}
                      title={c.name}
                      onClick={() => {
                        if (canAddPaletteColor(palette) && !isDuplicatedPaletteColor(palette, c.hex)) {
                          setPalette((p) => [...p, { id: Date.now(), hex: c.hex, name: c.name, isPrimary: p.length < 2 }]);
                        }
                      }}
                      style={{ aspectRatio: '1', borderRadius: 10, background: c.hex, cursor: 'pointer', border: palette.find((p) => p.hex === c.hex) ? '2px solid var(--marriplan-text)' : '2px solid transparent', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', transition: 'all 0.15s' }}
                      onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.08)'; }}
                      onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                    />
                  ))}
                </SimpleGrid>
              </div>
            </Stack>
          </Card>
        </div>

        <Card withBorder radius="lg" padding="lg">
          <Stack gap="md">
            <Text fw={700} size="sm" tt="uppercase" c="dimmed" style={{ letterSpacing: 1.2 }}>Previa ao Vivo</Text>
          <div className="live-preview-grid">
            {livePreview.map((item, i) => (
              <div key={i} className="live-preview-img" style={{ background: item.bg }}>
                <span style={{ fontSize: 28 }}>{item.emoji}</span>
                <p>{item.label}</p>
              </div>
            ))}
          </div>
            <div style={{ marginTop: 20, padding: 16, background: 'var(--marriplan-surface-muted)', borderRadius: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--marriplan-muted)', marginBottom: 10 }}>GRADIENTE DA PALETA</div>
              <div style={{ height: 32, borderRadius: 20, background: palette.length > 1 ? `linear-gradient(135deg, ${palette.map((c) => c.hex).join(', ')})` : 'var(--marriplan-border)' }} />
            </div>
          </Stack>
        </Card>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">Adicionar Nova Cor</div>
            <div className="modal-sub">Escolha uma cor personalizada para sua paleta</div>
            <div className="form-group">
              <label className="form-label">Cor</label>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <input type="color" value={newColor} onChange={(e) => setNewColor(e.target.value)} style={{ width: 52, height: 52, border: 'none', borderRadius: 10, cursor: 'pointer', padding: 0 }} />
                <input className="wi-input" value={newColor} onChange={(e) => setNewColor(e.target.value)} placeholder="#E3C1B5" style={{ fontFamily: 'monospace' }} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Nome da Cor</label>
              <input className="wi-input" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Ex: Rose Antigo" />
            </div>
            <div style={{ width: '100%', height: 60, borderRadius: 12, background: newColor, marginBottom: 20 }} />
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn-primary" onClick={addColor}><Icon name="plus" size={14} color="#fff" /> Adicionar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PalettePage;
