import {
  DRESS_CODE_OPTIONS,
  MOCK_INSPIRATIONS,
  MOCK_PALETTE,
  NAV_ITEMS,
  WEDDING_STYLES,
} from '@/constants/weddingIdentityData';
import {
  WeddingIdentityInspirationApiItem,
  WeddingIdentityInspirationSearchResponse,
} from '@/types/weddingIdentity';
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

export type WeddingIdentityShareTokenResponse = {
  token: string;
  created_at: string;
};

export type WeddingIdentityInspirationPayload = {
  source_id?: string;
  title?: string;
  description?: string;
  image_url: string;
  thumbnail_url?: string;
  source_url?: string;
  query?: string;
  selected_style?: string;
  dress_code?: string;
  is_favorite?: boolean;
  is_liked?: boolean;
  metadata?: Record<string, unknown>;
};

export type WeddingIdentityInspirationRecord = WeddingIdentityInspirationPayload & {
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

export const createWeddingIdentityShareToken = async (): Promise<WeddingIdentityShareTokenResponse> => {
  const response = await api.post('/api/wedding-identity/share-token/');
  return response.data as WeddingIdentityShareTokenResponse;
};

export const searchWeddingInspirations = async (params: {
  selectedStyle: string;
  dressCode: string;
  query?: string;
  numImages?: number;
}): Promise<WeddingIdentityInspirationSearchResponse> => {
  const response = await api.get('/api/wedding-identity/inspirations/search/', {
    params: {
      selected_style: params.selectedStyle,
      dress_code: params.dressCode,
      query: params.query,
      num_images: params.numImages,
    },
  });
  return response.data as WeddingIdentityInspirationSearchResponse;
};

export const listWeddingInspirations = async (): Promise<WeddingIdentityInspirationRecord[]> => {
  const response = await api.get('/api/wedding-identity/inspirations/');
  return response.data as WeddingIdentityInspirationRecord[];
};

export const saveWeddingInspiration = async (
  payload: WeddingIdentityInspirationPayload,
): Promise<WeddingIdentityInspirationRecord> => {
  const response = await api.post('/api/wedding-identity/inspirations/', payload);
  return response.data as WeddingIdentityInspirationRecord;
};

export const updateWeddingInspiration = async (
  inspirationId: number,
  payload: Partial<WeddingIdentityInspirationPayload>,
): Promise<WeddingIdentityInspirationRecord> => {
  const response = await api.patch(`/api/wedding-identity/inspirations/${inspirationId}/`, payload);
  return response.data as WeddingIdentityInspirationRecord;
};

export const deleteWeddingInspiration = async (inspirationId: number): Promise<void> => {
  await api.delete(`/api/wedding-identity/inspirations/${inspirationId}/`);
};
