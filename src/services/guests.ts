import api from './api';

export async function guests_list() {
  const { data } = await api.get('/api/guests/');
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
