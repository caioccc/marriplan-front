import { DECORATION_CATEGORIES } from '@/constants/weddingIdentityData';
import { Badge, Card, Group, SimpleGrid, Stack, Text } from '@mantine/core';
import React, { useState } from 'react';
import PageSectionHeader from '@/components/PageSectionHeader';
import Icon from '../Icon';

const DecorationPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('Todas');
  const [favorites, setFavorites] = useState(new Set([0, 3]));

  const decoItems = [
    { emoji: '🌸', name: 'Arranjo de Peonia', cat: 'Flores', desc: 'Volumoso e romantico' },
    { emoji: '🕯️', name: 'Velas Flutuantes', cat: 'Velas', desc: 'Iluminacao sutil' },
    { emoji: '💡', name: 'Fadinhas Suspensas', cat: 'Iluminação', desc: 'Efeito magico noturno' },
    { emoji: '🌿', name: 'Eucalipto e Flores', cat: 'Altar', desc: 'Arco natural elegante' },
    { emoji: '🍽️', name: 'Mesa Provençal', cat: 'Mesas', desc: 'Longo e intimista' },
    { emoji: '🛋️', name: 'Lounge de Veludo', cat: 'Lounges', desc: 'Conforto sofisticado' },
    { emoji: '🌺', name: 'Centro de Mesa Alto', cat: 'Arranjos', desc: 'Impacto visual' },
    { emoji: '🔆', name: 'Candelabros Dourados', cat: 'Velas', desc: 'Toque de luxo' },
    { emoji: '🌻', name: 'Parede de Flores', cat: 'Decoração', desc: 'Backdrop perfeito' },
  ];

  const filtered = activeCategory === 'Todas' ? decoItems : decoItems.filter((d) => d.cat === activeCategory);

  const toggleFav = (i: number) => setFavorites((s) => {
    const n = new Set(s);
    n.has(i) ? n.delete(i) : n.add(i);
    return n;
  });

  const catColors: Record<string, string> = {
    Flores: 'linear-gradient(135deg,#f5e8e8,#f0d8d8)',
    Velas: 'linear-gradient(135deg,#faf0dc,#f5e5c0)',
    Iluminação: 'linear-gradient(135deg,#fffff0,#f5f0d8)',
    Altar: 'linear-gradient(135deg,#e8f5e8,#d8f0d8)',
    Mesas: 'linear-gradient(135deg,#e8edf5,#d8e5f0)',
    Lounges: 'linear-gradient(135deg,#f0e8f5,#e5d8f0)',
    Arranjos: 'linear-gradient(135deg,#f5ece8,#f0e0d8)',
    Decoração: 'linear-gradient(135deg,#f5e8f0,#f0d8e8)',
  };

  return (
    <div className="wi-page">
      <PageSectionHeader
        eyebrow="Identidade do Casamento"
        title="Decoração"
        description="Explore e salve inspiracoes de decoracao para cada ambiente do seu casamento. Organize por categoria."
        actions={<Badge color="yellow" variant="light">{filtered.length} inspirações</Badge>}
        filters={<button className="btn-primary"><Icon name="plus" size={14} color="#fff" /> Adicionar Inspiração</button>}
      />

      <Group gap={8} wrap="wrap" mb={24}>
        {['Todas', ...DECORATION_CATEGORIES].map((cat) => (
          <button key={cat} className={`pill ${activeCategory === cat ? 'selected' : ''}`} onClick={() => setActiveCategory(cat)}>{cat}</button>
        ))}
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
        {filtered.map((item, i) => (
          <Card key={i} className={`deco-card ${favorites.has(i) ? 'selected' : ''}`} withBorder radius="lg" padding={0}>
            <div className="deco-card-img" style={{ background: catColors[item.cat] || 'var(--marriplan-surface-muted)' }}>
              <span style={{ fontSize: 40 }}>{item.emoji}</span>
            </div>
            <div className="deco-card-footer">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4>{item.name}</h4>
                  <p>{item.desc}</p>
                </div>
                <button className={`fav-btn ${favorites.has(i) ? 'active' : ''}`} style={{ position: 'relative', top: 'auto', right: 'auto', marginTop: -4 }} onClick={() => toggleFav(i)}>
                  {favorites.has(i) ? '❤️' : '🤍'}
                </button>
              </div>
              <span className="badge badge-neutral" style={{ marginTop: 8 }}>{item.cat}</span>
            </div>
          </Card>
        ))}
      </SimpleGrid>
    </div>
  );
};

export default DecorationPage;
