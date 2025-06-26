import api from './api';
import { Gift } from '@/types/gift';

export const giftsService = {
  async listGifts({ page = 1, status = '', search = '', category = '' }) {
    const params: any = { page };
    if (status) params.status = status;
    if (search) params.search = search;
    if (category) params.category = category;
    const res = await api.get('/api/gifts/', { params });
    return res.data;
  },
  async getGift(id: string) {
    const res = await api.get(`/api/gifts/${id}/`);
    return res.data;
  },
  async createGift(data: Partial<Gift>) {
    const res = await api.post('/api/gifts/', data);
    return res.data;
  },
  async updateGift(id: string, data: Partial<Gift>) {
    const res = await api.patch(`/api/gifts/${id}/`, data);
    return res.data;
  },
  async deleteGift(id: string) {
    await api.delete(`/api/gifts/${id}/`);
  },
  async markAsPurchased(id: string, payload: any) {
    const res = await api.post(`/api/gifts/${id}/mark_as_purchased/`, payload);
    return res.data;
  },
  async unmarkAsPurchased(id: string) {
    const res = await api.post(`/api/gifts/${id}/unmark_as_purchased/`);
    return res.data;
  },
  async getShareToken() {
    const res = await api.post('/api/gifts/share-token/');
    return res.data;
  },
  async downloadTemplate() {
    const res = await api.get('/api/gifts/template/', { responseType: 'blob' });
    return res.data;
  },
  async importGifts(formData: FormData) {
    const res = await api.post('/api/gifts/import/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  async exportPDF(params: Record<string, string | number> = {}) {
    const res = await api.get('/api/gifts/export/pdf/', { params, responseType: 'blob' });
    return res.data;
  },
  async listPublicGifts(token: string, options: {
    categories?: string[];
    min_price?: number;
    max_price?: number;
    status?: string[];
    has_link?: boolean;
    search?: string;
    ordering?: 'recent' | 'oldest' | 'price_asc' | 'price_desc';
    page?: number;
    page_size?: number;
  } = {}) {
    const params: any = {};
    if (options.categories && options.categories.length)
      params.categories = options.categories.join(',');
    if (options.min_price !== undefined) params.min_price = options.min_price;
    if (options.max_price !== undefined) params.max_price = options.max_price;
    if (options.status && options.status.length)
      params.status = options.status.join(',');
    if (options.has_link !== undefined) params.has_link = options.has_link ? 'true' : 'false';
    if (options.search) params.search = options.search;
    if (options.ordering) params.ordering = options.ordering;
    if (options.page) params.page = options.page;
    if (options.page_size) params.page_size = options.page_size;
    const queryString = new URLSearchParams(params).toString();
    const url = `/api/gifts/public/${token}/` + (queryString ? `?${queryString}` : '');
    const res = await api.get(url);
    return res.data;
  },
};
