import api from './api';

export async function uploadWeddingImage(file: File, folder = 'wedding-site') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);
  const response = await api.post('/api/upload-cloudinary/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    withCredentials: true,
  });
  return response.data; // WeddingImage
}

export async function deleteWeddingImage(public_id: string) {
  const response = await api.post('/api/delete-cloudinary-image/', { public_id });
  return response.data;
}
