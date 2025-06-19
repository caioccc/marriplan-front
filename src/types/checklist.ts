export type ChecklistTaskStatus = 'pending' | 'in_progress' | 'done';
export type ChecklistTaskPriority = 'high' | 'medium' | 'low';


export interface ChecklistTask {
  id: number;
  month: number;
  description: string;
  start_date: string;
  due_date: string;
  priority: ChecklistTaskPriority;
  status: ChecklistTaskStatus;
  is_template: boolean;
  attachments: ChecklistTaskAttachment[];
  created_at: string;
  updated_at: string;
}

export interface ChecklistTaskResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ChecklistTask[];
}

export interface ChecklistTaskAttachment {
  id: number;
  file: string;
  uploaded_at: string;
}

export const MONTHS = [
  '12 meses antes', '11 meses antes', '10 meses antes', '9 meses antes', '8 meses antes', '7 meses antes',
  '6 meses antes', '5 meses antes', '4 meses antes', '3 meses antes', '2 meses antes', '1 mês antes',
  '15 dias antes', '10 dias antes', '1 semana antes', '5 dias antes', '2 dias antes', '1 dia antes', 'Após o casamento'
];
