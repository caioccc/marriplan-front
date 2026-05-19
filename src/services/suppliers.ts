import api from './api';

export type SupplierCategory = {
  id: number;
  name: string;
  slug: string;
};

export type Supplier = {
  id: number;
  category_detail?: SupplierCategory;
  category?: SupplierCategory | number;
  category_id?: number;
  name: string;
  company_name?: string;
  description?: string;
  phone?: string;
  cnpj?: string;
  whatsapp?: string;
  email?: string;
  instagram?: string;
  website?: string;
  city?: string;
  state?: string;
  cover_image_url?: string;
  cover_image_public_id?: string;
  status?: 'APPROVED' | 'PENDING';
  visibility?: 'GLOBAL' | 'SOLO';
  is_featured?: boolean;
  created_by_user?: number | null;
  created_at?: string;
  updated_at?: string;
};

export type WeddingSupplier = {
  id: number;
  wedding?: number;
  supplier_detail?: Supplier;
  supplier?: Supplier | number;
  supplier_id?: number;
  is_hired?: boolean;
  is_favorite?: boolean;
  estimated_price?: string | number | null;
  negotiated_price?: string | number | null;
  paid_amount?: string | number | null;
  contract_date?: string | null;
  wedding_delivery_date?: string | null;
  contract_file_url?: string;
  contract_file_public_id?: string;
  notes?: string;
  status?: 'QUOTING' | 'NEGOTIATING' | 'HIRED' | 'PAID' | 'CANCELED';
  created_at?: string;
  updated_at?: string;
};

export async function listSupplierCategories() {
  const { data } = await api.get('/api/supplier-categories/');
  return data;
}

export async function listSuppliers(params: Record<string, string | number> = {}) {
  const { data } = await api.get('/api/suppliers/', { params });
  return data;
}

export async function listWeddingSuppliersDashboard(params: Record<string, string | number> = {}) {
  const { data } = await api.get('/api/wedding-suppliers/dashboard/', { params });
  return data;
}

export async function getSupplier(id: number) {
  const { data } = await api.get(`/api/suppliers/${id}/`);
  return data;
}

export async function createSupplier(payload: Record<string, unknown>) {
  const { data } = await api.post('/api/suppliers/', payload);
  return data;
}

export async function updateSupplier(id: number, payload: Record<string, unknown>) {
  const { data } = await api.patch(`/api/suppliers/${id}/`, payload);
  return data;
}

export async function deleteSupplier(id: number) {
  await api.delete(`/api/suppliers/${id}/`);
}

export async function listWeddingSuppliers(params: Record<string, string | number> = {}) {
  const { data } = await api.get('/api/wedding-suppliers/', { params });
  return data;
}

export async function getWeddingSupplier(id: number) {
  const { data } = await api.get(`/api/wedding-suppliers/${id}/`);
  return data;
}

export async function updateWeddingSupplier(id: number, payload: Record<string, unknown>) {
  const { data } = await api.patch(`/api/wedding-suppliers/${id}/`, payload);
  return data;
}

export async function deleteWeddingSupplier(id: number) {
  await api.delete(`/api/wedding-suppliers/${id}/`);
}

export async function selectSupplierForWedding(payload: Record<string, unknown>) {
  const { data } = await api.post('/api/wedding-suppliers/select/', payload);
  return data;
}

export async function uploadSupplierContract(file: File, folder = 'supplier-contracts') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);
  const { data } = await api.post('/api/upload-cloudinary-file/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data as { url: string; public_id: string; resource_type?: string };
}
