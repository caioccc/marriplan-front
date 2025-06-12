import api from './api';

export const getWeddingProfile = async () => {
  const response = await api.get('/api/wedding-profile/me/');
  return response.data;
};

export const updateWeddingProfile = async (data: any) => {
  const response = await api.patch('/api/wedding-profile/me/', data);
  return response.data;
};
