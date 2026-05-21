import { PaletteColor } from '@/types/weddingIdentity';

export const MAX_PALETTE_COLORS = 5;

export function canAddPaletteColor(palette: PaletteColor[]): boolean {
  return palette.length < MAX_PALETTE_COLORS;
}

export function isDuplicatedPaletteColor(palette: PaletteColor[], hex: string): boolean {
  return palette.some((color) => color.hex === hex);
}
