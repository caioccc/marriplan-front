import {
  DRESS_CODE_OPTIONS,
  WEDDING_STYLES,
} from '@/constants/weddingIdentityData';
import { CompletionItem, PaletteColor } from '@/types/weddingIdentity';

export function buildCompletionItems(
  selectedStyle: string,
  palette: PaletteColor[],
  dressCode: string,
): CompletionItem[] {
  return [
    { label: 'Paleta de Cores', done: palette.length > 0, icon: '🎨' },
    { label: 'Estilo do Casamento', done: Boolean(selectedStyle), icon: '✦' },
    { label: 'Dress Code', done: Boolean(dressCode), icon: '👗' },
    { label: 'Doces & Bem-casados', done: false, icon: '🍬' },
    { label: 'Decoracao', done: false, icon: '🌸' },
    { label: 'Referencias Visuais', done: true, icon: '📌' },
    { label: 'Moodboard Final', done: false, icon: '✦' },
  ];
}

export function completionPercent(items: CompletionItem[]): number {
  const done = items.filter((item) => item.done).length;
  return Math.round((done / items.length) * 100);
}

export function getSelectedStyleLabel(selectedStyle: string): string {
  return WEDDING_STYLES.find((style) => style.id === selectedStyle)?.label ?? '—';
}

export function getSelectedDressCodeLabel(dressCode: string): string {
  return DRESS_CODE_OPTIONS.find((item) => item.id === dressCode)?.label ?? '—';
}
