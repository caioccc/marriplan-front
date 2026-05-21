import {
  DRESS_CODE_OPTIONS,
  MOCK_INSPIRATIONS,
  MOCK_PALETTE,
  NAV_ITEMS,
  WEDDING_STYLES,
} from '@/constants/weddingIdentityData';

export const weddingIdentityService = {
  getWeddingStyles: () => WEDDING_STYLES,
  getDefaultPalette: () => MOCK_PALETTE,
  getDressCodeOptions: () => DRESS_CODE_OPTIONS,
  getInspirations: () => MOCK_INSPIRATIONS,
  getNavItems: () => NAV_ITEMS,
};
