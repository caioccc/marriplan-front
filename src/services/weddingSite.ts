import api from './api';

export const getWeddingSite = async () => {
  try {
    const response = await api.get('/api/wedding-site/');
    return response.data;
  } catch (error: any) {
    if (error?.response?.status === 404) {
      // Site não existe para o usuário
      return null;
    }
    throw error;
  }
};

export const createWeddingSite = async (data: any) => {
  const response = await api.post('/api/wedding-site/', data);
  return response.data;
};

export const updateWeddingSite = async (data: any) => {
  const site = await getWeddingSite();
  if (!site?.id) throw new Error('Site não encontrado para atualizar');
  // PATCH para atualização parcial, PUT para atualização completa
  const response = await api.put(`/api/wedding-site/${site.id}/`, data);
  return response.data;
};

export const publishWeddingSite = async () => {
  const response = await api.post('/api/wedding-site/publish/');
  return response.data;
};

export const unpublishWeddingSite = async () => {
  const response = await api.post('/api/wedding-site/unpublish/');
  return response.data;
};

export const getWeddingSiteMetrics = async () => {
  try {
    const response = await api.get('/api/wedding-site/metrics/');
    return response.data;
  } catch (error: any) {
    if (error?.response?.status === 404) {
      // Site não existe para o usuário
      return { visits: 0, rsvp_count: 0, rsvp_conversion: 0, last_visitor: null, last_visitor_at: null };
    }
    throw error;
  }
};

export const getWeddingSitePreview = async () => {
  const response = await api.get('/api/wedding-site/preview/');
  return response.data;
};

export const getWeddingSiteHistory = async () => {
  const response = await api.get('/api/wedding-site-history/');
  return response.data;
};

export const uploadWeddingSiteImage = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/api/wedding-site/upload-image/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const fetchWeddingSitePublic = async (slug: string) => {
  const response = await api.get(`/api/site/${slug}/`);
  return response.data;
};
