import api from './api';

export interface WeddingSiteHistory {
  id: number;
  site: number;
  action: string;
  action_display: string;
  performed_by: number;
  performed_by_username: string;
  description: string;
  snapshot: any;
  created_at: string;
}

export interface WeddingSiteHistoryResponse {
  results: WeddingSiteHistory[];
  count: number;
  next: string | null;
  previous: string | null;
}


export async function fetchWeddingSiteHistory(params: {
  period?: 'today' | '7d' | '30d' | 'custom';
  start?: string;
  end?: string;
  search?: string;
} = {}): Promise<WeddingSiteHistoryResponse> {
  const { period, start, end, search } = params;
  const query = new URLSearchParams();
  if (period) query.append('period', period);
  if (start) query.append('start', start);
  if (end) query.append('end', end);
  if (search) query.append('search', search);
  const { data } = await api.get(`/api/wedding-site-history/?${query.toString()}`);
  return data;
}
