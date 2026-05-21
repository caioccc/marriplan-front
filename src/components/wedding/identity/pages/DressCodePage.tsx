import { DRESS_CODE_OPTIONS } from '@/constants/weddingIdentityData';
import { Badge, Card, Group, SimpleGrid, Stack, Text } from '@mantine/core';
import React from 'react';
import PageSectionHeader from '@/components/PageSectionHeader';
import EmptyState from '../EmptyState';
import FakeImage from '../FakeImage';

type ColorGuide = {
  name: string;
  hex?: string;
};

const DRESS_CODE_COLOR_MAP: Record<string, {
  title: string;
  description: string;
  suggestedColors: ColorGuide[];
  forbiddenColors: ColorGuide[];
}> = {
  'black-tie': {
    title: 'Black Tie / Gala',
    description: 'O ápice do formalismo. Cores sóbrias, profundas e extremamente elegantes.',
    suggestedColors: [
      { name: 'Preto', hex: '#000000' },
      { name: 'Azul Meia-Noite / Midnight Blue', hex: '#191970' },
      { name: 'Verde Esmeralda Escuro', hex: '#0A5C36' },
      { name: 'Borgonha / Vinho Profundo', hex: '#4A0E17' },
      { name: 'Chumbo / Grafite', hex: '#3A3A3A' },
    ],
    forbiddenColors: [
      { name: 'Branco (Exclusivo da Noiva)', hex: '#FFFFFF' },
      { name: 'Off-White / Marfim', hex: '#FDFFFA' },
      { name: 'Cores Neon / Fluorescentes', hex: '#2CFF05' },
      { name: 'Estampas chamativas ou excessivamente coloridas', hex: '#8A00C4' },
    ],
  },
  social: {
    title: 'Social / Passeio Completo',
    description: 'Formal e tradicional, permitindo uma variedade maior de tons elegantes, mas ainda discretos.',
    suggestedColors: [
      { name: 'Azul Marinho', hex: '#002060' },
      { name: 'Cinza Escuro / Charcoal', hex: '#4F4F4F' },
      { name: 'Tons de Rosé / Marsala', hex: '#B76E79' },
      { name: 'Verde Oliva / Musgo', hex: '#556B2F' },
      { name: 'Azul Petróleo', hex: '#004953' },
    ],
    forbiddenColors: [
      { name: 'Branco (Exclusivo da Noiva)', hex: '#FFFFFF' },
      { name: 'Off-White', hex: '#FDFFFA' },
      { name: 'Cores excessivamente berrantes (Laranja/Amarelo marca-texto)', hex: '#FF5C00' },
      { name: 'Preto (Para madrinhas/padrinhos, a menos que explicitamente solicitado pelos noivos)', hex: '#000000' },
    ],
  },
  'esporte-fino': {
    title: 'Esporte Fino / Passeio',
    description: 'Equilíbrio entre o formal e o casual. Cores mais vivas e tons médios são muito bem-vindos.',
    suggestedColors: [
      { name: 'Azul Indigo / Royal', hex: '#4169E1' },
      { name: 'Tons de Areia / Bege', hex: '#F5F5DC' },
      { name: 'Terracota / Tijolo', hex: '#C46210' },
      { name: 'Verde Sálvia', hex: '#87A96B' },
      { name: 'Rosa Chá / Tons Pastéis', hex: '#FFF0F5' },
    ],
    forbiddenColors: [
      { name: 'Branco (Exclusivo da Noiva)', hex: '#FFFFFF' },
      { name: 'Off-White', hex: '#FDFFFA' },
      { name: 'Preto total em trajes diurnos (passa uma impressão muito pesada)', hex: '#000000' },
    ],
  },
  'casual-chic': {
    title: 'Casual Chic',
    description: 'Despojado com sofisticação para casamentos íntimos. Liberdade para tons claros e texturas naturais.',
    suggestedColors: [
      { name: 'Cáqui / Tan', hex: '#D2B48C' },
      { name: 'Azul Serenity', hex: '#ADC3C8' },
      { name: 'Verde Menta', hex: '#98FF98' },
      { name: 'Mostarda Suave', hex: '#E1AD01' },
      { name: 'Lavanda / Lilás', hex: '#E6E6FA' },
    ],
    forbiddenColors: [
      { name: 'Branco (Exclusivo da Noiva)', hex: '#FFFFFF' },
      { name: 'Off-White', hex: '#FDFFFA' },
      { name: 'Preto Total (Muito pesado para a proposta casual/íntima)', hex: '#000000' },
      { name: 'Brilhos metálicos excessivos (Paetês pesados)', hex: '#FFD700' },
    ],
  },
  'praia-formal': {
    title: 'Praia / Costeiro',
    description: 'Leveza, frescor e conexão com a natureza. Tons tropicais, pastéis e cores que refletem o mar e o pôr do sol.',
    suggestedColors: [
      { name: 'Azul Piscina / Turquesa', hex: '#40E0D0' },
      { name: 'Coral / Pêssego', hex: '#FF7F50' },
      { name: 'Amarelo Manteiga', hex: '#FFFDD0' },
      { name: 'Verde Água', hex: '#66CDAA' },
      { name: 'Nude / Tons de Linho Natural', hex: '#E8D8C8' },
    ],
    forbiddenColors: [
      { name: 'Branco (Exclusivo da Noiva)', hex: '#FFFFFF' },
      { name: 'Off-White / Pérola', hex: '#FAEBD7' },
      { name: 'Preto (Absolutamente proibido pelo calor e conceito praiano)', hex: '#000000' },
      { name: 'Cores extremamente escuras/pesadas (Chumbo, Marinho fechado, Vinho)', hex: '#5b5b58' },
    ],
  },
  praia: {
    title: 'Praia / Costeiro',
    description: 'Leveza, frescor e conexão com a natureza. Tons tropicais, pastéis e cores que refletem o mar e o pôr do sol.',
    suggestedColors: [
      { name: 'Azul Piscina / Turquesa', hex: '#40E0D0' },
      { name: 'Coral / Pêssego', hex: '#FF7F50' },
      { name: 'Amarelo Manteiga', hex: '#FFFDD0' },
      { name: 'Verde Água', hex: '#66CDAA' },
      { name: 'Nude / Tons de Linho Natural', hex: '#E8D8C8' },
    ],
    forbiddenColors: [
      { name: 'Branco (Exclusivo da Noiva)', hex: '#FFFFFF' },
      { name: 'Off-White / Pérola', hex: '#FAEBD7' },
      { name: 'Preto (Absolutamente proibido pelo calor e conceito praiano)', hex: '#000000' },
      { name: 'Cores extremamente escuras/pesadas (Chumbo, Marinho fechado, Vinho)' },
    ],
  },
};

const DRESS_CODE_REFERENCE_IMAGES: Record<string, {
  noivo: string;
  noiva: string;
  padrinhos: string;
  madrinhas: string;
}> = {
  'black-tie': {
    noivo: 'https://res.cloudinary.com/freelancerinc/image/upload/v1779397275/blacktie-noivo_c2gutq.png',
    noiva: 'https://res.cloudinary.com/freelancerinc/image/upload/v1779397197/blacktie-noiva_blz7m2.png',
    padrinhos: 'https://res.cloudinary.com/freelancerinc/image/upload/v1779397196/blacktie-padrinhos_skc5jw.png',
    madrinhas: 'https://res.cloudinary.com/freelancerinc/image/upload/v1779397196/blacktie-madrinhas_pmi2f0.png',
  },
  social: {
    noivo: 'https://res.cloudinary.com/freelancerinc/image/upload/v1779397195/social-noivo_sjsx67.png',
    noiva: 'https://res.cloudinary.com/freelancerinc/image/upload/v1779397194/social-noiva_ecuhfi.png',
    padrinhos: 'https://res.cloudinary.com/freelancerinc/image/upload/v1779397194/social-padrinhos_xufbbb.png',
    madrinhas: 'https://res.cloudinary.com/freelancerinc/image/upload/v1779397193/social-madrinhas_mq0ro9.png',
  },
  'esporte-fino': {
    noivo: 'https://res.cloudinary.com/freelancerinc/image/upload/v1779397192/esportefino-noivo_spuhhi.png',
    noiva: 'https://res.cloudinary.com/freelancerinc/image/upload/v1779397192/esportefino-noiva_cxj2vp.png',
    padrinhos: 'https://res.cloudinary.com/freelancerinc/image/upload/v1779397191/esportefino-padrinhos_dthjt9.png',
    madrinhas: 'https://res.cloudinary.com/freelancerinc/image/upload/v1779397190/esportefino-madrinhas_aptj09.png',
  },
  'casual-chic': {
    noivo: 'https://res.cloudinary.com/freelancerinc/image/upload/v1779397190/casual-noivo_eymvhu.png',
    noiva: 'https://res.cloudinary.com/freelancerinc/image/upload/v1779397189/casual-noiva_hgpyfb.png',
    padrinhos: 'https://res.cloudinary.com/freelancerinc/image/upload/v1779397188/casual-padrinhos_dpc3gl.png',
    madrinhas: 'https://res.cloudinary.com/freelancerinc/image/upload/v1779397188/casual-madrinhas_wenrr9.png',
  },
  'praia-formal': {
    noivo: 'https://res.cloudinary.com/freelancerinc/image/upload/v1779397187/praia-noivo_wqflox.png',
    noiva: 'https://res.cloudinary.com/freelancerinc/image/upload/v1779397187/praia-noiva_kwyuj9.png',
    padrinhos: 'https://res.cloudinary.com/freelancerinc/image/upload/v1779397187/praia-padrinhos_guvji6.png',
    madrinhas: 'https://res.cloudinary.com/freelancerinc/image/upload/v1779397186/praia-madrinhas_rlldcl.png',
  },
  praia: {
    noivo: 'https://res.cloudinary.com/freelancerinc/image/upload/v1779397187/praia-noivo_wqflox.png',
    noiva: 'https://res.cloudinary.com/freelancerinc/image/upload/v1779397187/praia-noiva_kwyuj9.png',
    padrinhos: 'https://res.cloudinary.com/freelancerinc/image/upload/v1779397187/praia-padrinhos_guvji6.png',
    madrinhas: 'https://res.cloudinary.com/freelancerinc/image/upload/v1779397186/praia-madrinhas_rlldcl.png',
  },
};

interface DressCodePageProps {
  dressCode: string;
  setDressCode: (dressCodeId: string) => void;
}

const DressCodePage: React.FC<DressCodePageProps> = ({ dressCode, setDressCode }) => {
  const selected = DRESS_CODE_OPTIONS.find((d) => d.id === dressCode);
  const referenceImages = DRESS_CODE_REFERENCE_IMAGES[selected?.id ?? ''];
  const colorGuide = DRESS_CODE_COLOR_MAP[selected?.id ?? 'praia-formal'];

  return (
    <Stack p="md" gap="xl">
      <PageSectionHeader
        eyebrow="Identidade do Casamento"
        title="Dress Code"
        description="Defina o codigo de vestimenta para orientar seus convidados sobre a indumentaria esperada para a celebracao."
        
      />

      <Stack gap="sm">
        <Text fw={700} size="sm" tt="uppercase" c="dimmed" style={{ letterSpacing: 1.2 }}>Nivel de Formalidade</Text>
      </Stack>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md" mb="xl">
        {DRESS_CODE_OPTIONS.map((opt) => (
          <Card key={opt.id} className={`dress-code-card ${dressCode === opt.id ? 'selected' : ''}`} withBorder radius="lg" padding="lg" onClick={() => setDressCode(opt.id)} style={{ cursor: 'pointer' }}>
            <Group justify="space-between" align="flex-start" mb="sm">
              <div style={{ width: 36, height: 36, borderRadius: 10, background: opt.color, opacity: 0.7 }} />
              {dressCode === opt.id && <Badge color="pink" variant="light">✦</Badge>}
            </Group>
            <Text fw={700} size="md" mb={6}>{opt.label}</Text>
            <Text size="sm" c="dimmed" lh={1.5} mb="sm">{opt.desc}</Text>
            <Group gap={3} wrap="nowrap">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="dress-code-dot" style={{ background: i <= opt.formality ? opt.color : 'var(--marriplan-border)' }} />
              ))}
            </Group>
          </Card>
        ))}
      </SimpleGrid>

      {selected && (
        <div className="wi-grid-2" style={{ gap: 24 }}>
          <div className="marriplan-card" style={{ padding: 24 }}>
            <div className="wi-section-title">Cores Proibidas</div>
            <p style={{ fontSize: 12, color: 'var(--marriplan-muted)', marginBottom: 16 }}>{colorGuide.description}</p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {colorGuide.forbiddenColors.map((item, i) => (
                <div key={`${item.name}-${i}`} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--marriplan-surface-muted)', borderRadius: 8, padding: '8px 12px', border: '1px solid var(--marriplan-border)' }}>
                  {item.hex ? (
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: item.hex, border: '1px solid rgba(0,0,0,0.1)' }} />
                  ) : null}
                  <span style={{ fontSize: 12, fontFamily: 'monospace' }}>{item.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="marriplan-card" style={{ padding: 24 }}>
            <div className="wi-section-title">Cores Sugeridas</div>
            <p style={{ fontSize: 12, color: 'var(--marriplan-muted)', marginBottom: 16 }}>Cores que combinam com o visual do casamento</p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {colorGuide.suggestedColors.map((item, i) => (
                <div key={`${item.name}-${i}`} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--marriplan-surface-muted)', borderRadius: 8, padding: '8px 12px', border: '1px solid var(--marriplan-border)' }}>
                  {item.hex ? (
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: item.hex }} />
                  ) : null}
                  <span style={{ fontSize: 12, fontFamily: 'monospace' }}>{item.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="marriplan-card" style={{ padding: 24 }}>
            <div className="wi-section-title">Referencia Visual — Casal</div>
            <div style={{ display: 'flex', gap: 12 }}>
              <FakeImage emoji="🤵" imageUrl={referenceImages?.noivo} color="linear-gradient(135deg,#1a1a1a,#3a3a3a)" aspectRatio="9 / 16" label="Noivo" style={{ flex: 1, borderRadius: 12 }} />
              <FakeImage emoji="👰" imageUrl={referenceImages?.noiva} color={`linear-gradient(135deg,${selected.color}88,${selected.color}44)`} aspectRatio="9 / 16" label="Noiva" style={{ flex: 1, borderRadius: 12 }} />
            </div>
          </div>

          <div className="marriplan-card" style={{ padding: 24 }}>
            <div className="wi-section-title">Referencias — Convidados</div>
            <div style={{ display: 'flex', gap: 12 }}>
              <FakeImage emoji="💃" imageUrl={referenceImages?.madrinhas} color={`linear-gradient(135deg,${selected.color}55,${selected.color}22)`} aspectRatio="9 / 16" label="Madrinhas" style={{ flex: 1, borderRadius: 12 }} />
              <FakeImage emoji="🕺" imageUrl={referenceImages?.padrinhos} color="linear-gradient(135deg,#2a2a3a,#3a3a5a)" aspectRatio="9 / 16" label="Padrinhos" style={{ flex: 1, borderRadius: 12 }} />
            </div>
          </div>
        </div>
      )}

      {!selected && (
        <EmptyState icon="👗" title="Nenhum dress code selecionado" message="Escolha um nivel de formalidade acima para orientar seus convidados." />
      )}
    </Stack>
  );
};

export default DressCodePage;
