import {
  DRESS_CODE_OPTIONS,
  MOCK_INSPIRATIONS,
  MOCK_PALETTE,
  NAV_ITEMS,
  WEDDING_STYLES,
} from '@/constants/weddingIdentityData';
import api from './api';

export type WeddingIdentityApiPayload = {
  selected_style?: string;
  wedding_size?: string;
  dress_code?: string;
  palette?: Array<{
    id: number;
    hex: string;
    name: string;
    isPrimary: boolean;
  }>;
};

export type WeddingIdentityApiRecord = WeddingIdentityApiPayload & {
  id: number;
  wedding_profile: number;
  created_at: string;
  updated_at: string;
};

export const weddingIdentityService = {
  getWeddingStyles: () => WEDDING_STYLES,
  getDefaultPalette: () => MOCK_PALETTE,
  getDressCodeOptions: () => DRESS_CODE_OPTIONS,
  getInspirations: () => MOCK_INSPIRATIONS,
  getNavItems: () => NAV_ITEMS,
};

export const getWeddingIdentity = async (): Promise<WeddingIdentityApiRecord | null> => {
  try {
    const response = await api.get('/api/wedding-identity/');
    return response.data as WeddingIdentityApiRecord;
  } catch (error: any) {
    if (error?.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

export const createWeddingIdentity = async (data: WeddingIdentityApiPayload) => {
  const response = await api.post('/api/wedding-identity/', data);
  return response.data as WeddingIdentityApiRecord;
};

export const updateWeddingIdentity = async (data: WeddingIdentityApiPayload) => {
  const response = await api.patch('/api/wedding-identity/', data);
  return response.data as WeddingIdentityApiRecord;
};

export const deleteWeddingIdentity = async () => {
  await api.delete('/api/wedding-identity/');
};
