export type WeddingIdentityPageId =
  | 'overview'
  | 'palette'
  | 'style'
  | 'dresscode'
  | 'sweets'
  | 'decoration'
  | 'inspirations'
  | 'moodboard';

export interface WeddingStyle {
  id: string;
  label: string;
  subtitle: string;
  tags: string[];
  color: string;
  bg: string;
  emoji: string;
}

export interface PaletteColor {
  id: number;
  hex: string;
  name: string;
  isPrimary: boolean;
}

export interface DressCodeOption {
  id: string;
  label: string;
  desc: string;
  formality: number;
  color: string;
}

export interface InspirationItem {
  id: number;
  title: string;
  category: string;
  tags: string[];
  favorited: boolean;
  height: number;
}

export interface NavItem {
  id: WeddingIdentityPageId;
  label: string;
  icon: string;
}

export interface SweetsConfig {
  embalagem: string;
  laco: string;
  textura: string;
  forma: string;
  cor: string;
  tagText: string;
}

export interface CompletionItem {
  label: string;
  done: boolean;
  icon: string;
}
