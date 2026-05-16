import api from './api';

export async function guests_list({ page = 1, page_size = 10, search = '', ordering = '' } = {}) {
  const params = {};
  if (page) params.page = page;
  if (page_size) params.page_size = page_size;
  if (search) params.search = search;
  if (ordering) params.ordering = ordering;
  const { data } = await api.get('/api/guests/', { params });
  return data;
}

export async function guests_create(payload) {
  const { data } = await api.post('/api/guests/', payload);
  return data;
}

export async function guests_read(id) {
  const { data } = await api.get(`/api/guests/${id}/`);
  return data;
}

export async function guests_update(id, payload) {
  const { data } = await api.put(`/api/guests/${id}/`, payload);
  return data;
}

export async function guests_partial_update(id, payload) {
  const { data } = await api.patch(`/api/guests/${id}/`, payload);
  return data;
}

export async function guests_delete(id) {
  await api.delete(`/api/guests/${id}/`);
}

export async function guests_download_model() {
  return api.get('/api/guests/download-model/', { responseType: 'blob' });
}

export async function guests_import(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/api/guests/import/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export async function guests_export(format: 'csv' | 'xlsx' | 'pdf' = 'csv', { search = '', ordering = '' } = {}) {
  const params: any = { format };
  // if (search) params.search = search;
  // if (ordering) params.ordering = ordering;
  // return api.get('/api/guests/export/?&' + new URLSearchParams(params).toString(), {
  //   responseType: 'blob',
  // });
  return api.get('/api/guests/export/', {
    responseType: 'blob',
  });
}

export async function guests_generate_confirmation_link(id: number) {
  const { data } = await api.post(`/api/guests/${id}/generate-confirmation-link/`);
  return data;
}

export async function guests_confirm_verify(token: string) {
  const { data } = await api.get(`/api/guests/confirm/${token}/verify/`);
  return data;
}

export async function guests_confirm_token(token: string, status: 'Confirmed' | 'Refused') {
  const { data } = await api.post(`/api/guests/confirm/${token}/`, { status });
  return data;
}
