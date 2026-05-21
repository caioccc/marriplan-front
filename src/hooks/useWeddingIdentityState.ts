import { MOCK_PALETTE } from '@/constants/weddingIdentityData';
import { PaletteColor, WeddingIdentityPageId } from '@/types/weddingIdentity';
import { useEffect, useMemo, useState } from 'react';

type WeddingIdentityStoredState = {
  activePage?: WeddingIdentityPageId;
  palette?: PaletteColor[];
  selectedStyle?: string;
  dressCode?: string;
};

const STORAGE_KEY = 'marriplan:wedding-identity';

const getInitialState = (): WeddingIdentityStoredState => {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const rawState = window.localStorage.getItem(STORAGE_KEY);
    if (!rawState) {
      return {};
    }

    return JSON.parse(rawState) as WeddingIdentityStoredState;
  } catch {
    return {};
  }
};

export function useWeddingIdentityState() {
  const initialState = getInitialState();
  const [activePage, setActivePage] = useState<WeddingIdentityPageId>(initialState.activePage ?? 'overview');
  const [palette, setPalette] = useState<PaletteColor[]>(initialState.palette ?? MOCK_PALETTE);
  const [selectedStyle, setSelectedStyle] = useState(initialState.selectedStyle ?? 'romantico');
  const [dressCode, setDressCode] = useState(initialState.dressCode ?? 'social');

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        activePage,
        palette,
        selectedStyle,
        dressCode,
      }),
    );
  }, [activePage, palette, selectedStyle, dressCode]);

  return useMemo(
    () => ({
      activePage,
      setActivePage,
      palette,
      setPalette,
      selectedStyle,
      setSelectedStyle,
      dressCode,
      setDressCode,
    }),
    [activePage, palette, selectedStyle, dressCode],
  );
}
