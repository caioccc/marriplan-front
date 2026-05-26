import {
  WeddingIdentityApiPayload,
  createWeddingIdentity,
  deleteWeddingIdentity,
  getWeddingIdentity,
  updateWeddingIdentity,
} from '@/services/weddingIdentity.service';
import { PaletteColor, WeddingIdentityPageId } from '@/types/weddingIdentity';
import { Dispatch, SetStateAction } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';

type WeddingIdentityState = {
  activePage: WeddingIdentityPageId;
  setActivePage: Dispatch<SetStateAction<WeddingIdentityPageId>>;
  palette: PaletteColor[];
  setPalette: Dispatch<SetStateAction<PaletteColor[]>>;
  selectedStyle: string;
  setSelectedStyle: Dispatch<SetStateAction<string>>;
  weddingSize: string;
  setWeddingSize: Dispatch<SetStateAction<string>>;
  dressCode: string;
  setDressCode: Dispatch<SetStateAction<string>>;
  hasIdentity: boolean;
  isLoading: boolean;
  saveWeddingIdentity: () => Promise<void>;
  refreshWeddingIdentity: () => Promise<void>;
};

type WeddingIdentityDraft = {
  activePage: WeddingIdentityPageId;
  palette: PaletteColor[];
  selectedStyle: string;
  weddingSize: string;
  dressCode: string;
};

const getEmptyDraft = (): WeddingIdentityDraft => ({
  activePage: 'moodboard',
  palette: [],
  selectedStyle: '',
  weddingSize: '',
  dressCode: '',
});

const normalizeApiState = (data: WeddingIdentityApiPayload | null): WeddingIdentityDraft => ({
  activePage: 'moodboard',
  palette: data?.palette ?? [],
  selectedStyle: data?.selected_style ?? '',
  weddingSize: data?.wedding_size ?? '',
  dressCode: data?.dress_code ?? '',
});

export function useWeddingIdentityState(): WeddingIdentityState {
  const [activePage, setActivePage] = useState<WeddingIdentityPageId>('moodboard');
  const [palette, setPalette] = useState<PaletteColor[]>([]);
  const [selectedStyle, setSelectedStyle] = useState('');
  const [weddingSize, setWeddingSize] = useState('');
  const [dressCode, setDressCode] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [identityExists, setIdentityExists] = useState(false);

  const hasIdentity = Boolean(selectedStyle || weddingSize || dressCode || palette.length);

  const applyDraft = useCallback((draft: WeddingIdentityDraft) => {
    setActivePage(draft.activePage);
    setPalette(draft.palette);
    setSelectedStyle(draft.selectedStyle);
    setWeddingSize(draft.weddingSize);
    setDressCode(draft.dressCode);
  }, []);

  const refreshWeddingIdentity = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await getWeddingIdentity();
      if (!response) {
        applyDraft(getEmptyDraft());
        setIdentityExists(false);
        return;
      }

      applyDraft(normalizeApiState(response));
      setIdentityExists(true);
    } finally {
      setIsLoading(false);
    }
  }, [applyDraft]);

  useEffect(() => {
    void refreshWeddingIdentity();
  }, [refreshWeddingIdentity]);

  const buildPayload = useCallback((): WeddingIdentityApiPayload => ({
    selected_style: selectedStyle,
    wedding_size: weddingSize,
    dress_code: dressCode,
    palette,
  }), [dressCode, palette, selectedStyle, weddingSize]);

  const saveWeddingIdentity = useCallback(async () => {
    if (!hasIdentity) {
      if (identityExists) {
        await deleteWeddingIdentity();
        setIdentityExists(false);
      }
      return;
    }

    const payload = buildPayload();

    if (identityExists) {
      await updateWeddingIdentity(payload);
      // Garantir que listeners locais (menu de primeiros passos) sejam notificados
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('marriplan:first-steps-refresh'))
      }
      return;
    }

    await createWeddingIdentity(payload);
    setIdentityExists(true);
    // Notifica listeners locais para atualização imediata do menu
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('marriplan:first-steps-refresh'))
    }
  }, [buildPayload, hasIdentity, identityExists]);

  return useMemo(
    () => ({
      activePage,
      setActivePage,
      palette,
      setPalette,
      selectedStyle,
      setSelectedStyle,
      weddingSize,
      setWeddingSize,
      dressCode,
      setDressCode,
      hasIdentity,
      isLoading,
      saveWeddingIdentity,
      refreshWeddingIdentity,
    }),
    [
      activePage,
      palette,
      selectedStyle,
      weddingSize,
      dressCode,
      hasIdentity,
      isLoading,
      saveWeddingIdentity,
      refreshWeddingIdentity,
    ],
  );
}
