import api from './api';
import { ChecklistTask } from '@/types/checklist';

export async function fetchChecklistTasks(): Promise<ChecklistTask[]> {
  const { data } = await api.get('/api/checklist-tasks/');
  return data;
}

export async function createChecklistTask(task: Partial<ChecklistTask>) {
  const { data } = await api.post('/api/checklist-tasks/', task);
  return data;
}

export async function updateChecklistTask(id: number, task: Partial<ChecklistTask>) {
  const { data } = await api.patch(`/api/checklist-tasks/${id}/`, task);
  return data;
}

export async function deleteChecklistTask(id: number) {
  await api.delete(`/api/checklist-tasks/${id}/`);
}
