import api from './api';

export interface MarketplaceProduct {
  title: string;
  description?: string;
  price?: string;
  image_url?: string;
  product_url: string;
  category?: string;
  store?: string;
}

type SearchResponse = {
  query: string;
  count: number;
  results: MarketplaceProduct[];
};

export const productsMarketplaceService = {
  async searchProducts(query: string, maxResults = 12): Promise<SearchResponse> {
    const params = new URLSearchParams({ q: query, max_results: String(maxResults) });
    const { data } = await api.get(`/api/products/search/?${params.toString()}`);
    return data;
  },

  async listFeaturedProducts(maxPerCategory = 3): Promise<SearchResponse> {
    const params = new URLSearchParams({ max_per_category: String(maxPerCategory) });
    const { data } = await api.get(`/api/products/featured/?${params.toString()}`);
    return data;
  },
};