import {
  DressCodeOption,
  InspirationItem,
  NavItem,
  PaletteColor,
  WeddingStyle,
} from '@/types/weddingIdentity';

export const WEDDING_STYLES: WeddingStyle[] = [
  { id: 'classico', label: 'Clássico', subtitle: 'Elegante & Atemporal', tags: ['Sofisticado', 'Formal', 'Grandioso'], color: '#C9A96E', bg: 'linear-gradient(135deg,#2c1a0e 0%,#5a3a1a 100%)', emoji: '🕍' },
  { id: 'boho', label: 'Boho', subtitle: 'Livre & Orgânico', tags: ['Natural', 'Flores', 'Rústico'], color: '#A67C52', bg: 'linear-gradient(135deg,#3d2b1f 0%,#7a5c3a 100%)', emoji: '🌿' },
  { id: 'minimalista', label: 'Minimalista', subtitle: 'Clean & Moderno', tags: ['Neutro', 'Simples', 'Elegante'], color: '#8B9EA8', bg: 'linear-gradient(135deg,#1a2a30 0%,#3a5060 100%)', emoji: '◻' },
  { id: 'luxo', label: 'Luxo', subtitle: 'Grand & Refinado', tags: ['Premium', 'Gold', 'Opulento'], color: '#D4AF37', bg: 'linear-gradient(135deg,#1a1200 0%,#4a3800 100%)', emoji: '👑' },
  { id: 'praia', label: 'Praia', subtitle: 'Relaxado & Costeiro', tags: ['Mar', 'Areia', 'Tropical'], color: '#5B9BD5', bg: 'linear-gradient(135deg,#0a2340 0%,#1a5080 100%)', emoji: '🌊' },
  { id: 'campo', label: 'Campo', subtitle: 'Charmoso & Natural', tags: ['Fazenda', 'Madeira', 'Bucólico'], color: '#7B9E6B', bg: 'linear-gradient(135deg,#1a2a10 0%,#3a5a20 100%)', emoji: '🌾' },
  { id: 'romantico', label: 'Romântico', subtitle: 'Íntimo & Encantador', tags: ['Rosas', 'Velas', 'Delicado'], color: '#C87B7B', bg: 'linear-gradient(135deg,#2a0a0a 0%,#5a2020 100%)', emoji: '🌹' },
  { id: 'vintage', label: 'Vintage', subtitle: 'Chique & Nostálgico', tags: ['Retrô', 'Clássico', 'Patina'], color: '#B8956A', bg: 'linear-gradient(135deg,#2a1a08 0%,#5a3c18 100%)', emoji: '📻' },
];

export const MOCK_PALETTE: PaletteColor[] = [
  { id: 1, hex: '#E3C1B5', name: 'Soft Rose Gold', isPrimary: true },
  { id: 2, hex: '#F7E7C8', name: 'Pale Champagne', isPrimary: true },
  { id: 3, hex: '#FFFDF5', name: 'Cream White', isPrimary: false },
  { id: 4, hex: '#E5E1D1', name: 'Pearl Dust', isPrimary: false },
  { id: 5, hex: '#BDA88D', name: 'Vintage Taupe', isPrimary: false },
];

export const PALETTE_PRESET_COLORS = [
  { hex: '#E3C1B5', name: 'Soft Rose Gold' },
  { hex: '#F7E7C8', name: 'Pale Champagne' },
  { hex: '#FFFDF5', name: 'Cream White' },
  { hex: '#E5E1D1', name: 'Pearl Dust' },
  { hex: '#BDA88D', name: 'Vintage Taupe' },
  { hex: '#D4B896', name: 'Warm Sand' },
  { hex: '#C4756A', name: 'Dusty Rose' },
  { hex: '#9B8E84', name: 'Warm Gray' },
  { hex: '#C9A96E', name: 'Antique Gold' },
  { hex: '#F2D4C8', name: 'Blush Pink' },
];

export const DRESS_CODE_OPTIONS: DressCodeOption[] = [
  { id: 'black-tie', label: 'Black Tie', desc: 'Elegância absoluta. Traje longo para damas, smoking para cavalheiros.', formality: 5, color: '#1a1a1a' },
  { id: 'social', label: 'Social', desc: 'Traje passeio completo ou cocktail. Sofisticado e versátil.', formality: 4, color: '#3a3a3a' },
  { id: 'esporte-fino', label: 'Esporte Fino', desc: 'Equilíbrio entre casual e formal. Conforto com estilo.', formality: 3, color: '#6B5B47' },
  { id: 'casual-chic', label: 'Casual Chic', desc: 'Despojado com toque de sofisticação. Para celebrações íntimas.', formality: 2, color: '#8B7B6B' },
  { id: 'praia-formal', label: 'Praia Formal', desc: 'Leveza e frescor sem abrir mão da elegância.', formality: 1, color: '#5B8DB8' },
];

export const DECORATION_CATEGORIES = ['Altar', 'Flores', 'Iluminação', 'Mesas', 'Lounges', 'Velas', 'Arranjos'];

export const MOCK_INSPIRATIONS: InspirationItem[] = [
  { id: 1, title: 'Cerimônia no jardim encantado', category: 'Cerimônia', tags: ['Flores', 'Natural'], favorited: true, height: 280 },
  { id: 2, title: 'Buquê romântico boho', category: 'Flores', tags: ['Boho', 'Rosa'], favorited: false, height: 200 },
  { id: 3, title: 'Mesa de recepção dourada', category: 'Decoração', tags: ['Luxo', 'Gold'], favorited: true, height: 240 },
  { id: 4, title: 'Convite em papel texturizado', category: 'Papelaria', tags: ['Clássico', 'Creme'], favorited: false, height: 180 },
  { id: 5, title: 'Vestido com renda delicada', category: 'Moda', tags: ['Vestido', 'Vintage'], favorited: true, height: 320 },
  { id: 6, title: 'Iluminação suspensa com velas', category: 'Iluminação', tags: ['Romântico', 'Velas'], favorited: false, height: 220 },
  { id: 7, title: 'Arranjos de peônia e eucalipto', category: 'Flores', tags: ['Peônia', 'Verde'], favorited: true, height: 260 },
  { id: 8, title: 'Lounge de veludo champanhe', category: 'Lounges', tags: ['Veludo', 'Champanhe'], favorited: false, height: 190 },
];

export const SWEETS_OPTIONS = {
  embalagem: ['Acetato', 'Kraft', 'Linho', 'Organza', 'Veludo'],
  laco: ['Fita de Cetim', 'Juta', 'Organza', 'Sem Laço', 'Twine'],
  textura: ['Lisa', 'Texturizada', 'Marmorizada', 'Rendada', 'Floral'],
  forma: ['Redondo', 'Coração', 'Retângulo', 'Oval', 'Quadrado'],
};

export const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Visão Geral', icon: 'home' },
  { id: 'palette', label: 'Paleta de Cores', icon: 'palette' },
  { id: 'style', label: 'Estilo do Casamento', icon: 'star' },
  { id: 'dresscode', label: 'Dress Code', icon: 'shirt' },
  { id: 'sweets', label: 'Doces & Bem-casados', icon: 'cake' },
  { id: 'decoration', label: 'Decoração', icon: 'flower' },
  { id: 'inspirations', label: 'Referências Visuais', icon: 'image' },
  { id: 'moodboard', label: 'Moodboard Final', icon: 'layout' },
];

export const WEDDING_STYLE_FILTERS = ['Todos', 'Clássico', 'Natural', 'Moderno', 'Praia'];

export const INSPIRATION_CATEGORIES = ['Todas', 'Cerimônia', 'Flores', 'Decoração', 'Papelaria', 'Moda', 'Iluminação'];

export const INITIAL_SWEETS_CONFIG = {
  embalagem: 'Acetato',
  laco: 'Fita de Cetim',
  textura: 'Lisa',
  forma: 'Redondo',
  cor: '#F7E7C8',
  tagText: 'A & R',
};
