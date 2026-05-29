import api from './api';
import { TimelineMoment, TimelineMomentPayload } from '@/types/timeline';

export const timelineService = {
  async listTimelineMoments() {
    const res = await api.get('/api/timeline/');
    return res.data as TimelineMoment[];
  },
  async createTimelineMoment(data: TimelineMomentPayload) {
    const res = await api.post('/api/timeline/', data);
    return res.data as TimelineMoment;
  },
  async updateTimelineMoment(id: string, data: Partial<TimelineMomentPayload>) {
    const res = await api.patch(`/api/timeline/${id}/`, data);
    return res.data as TimelineMoment;
  },
  async deleteTimelineMoment(id: string) {
    await api.delete(`/api/timeline/${id}/`);
  },
  async generateDefaultTimeline() {
    const res = await api.post('/api/timeline/generate-default/');
    return res.data;
  },
  async exportTimelinePDF() {
    const res = await api.get('/api/timeline/export-pdf/', { responseType: 'blob' });
    return res.data;
  },
};
