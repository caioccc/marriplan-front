import api from './api';

export type FirstStepsMenuState = {
  first_steps: boolean;
  items: {
    identity: boolean;
    wedding_details: boolean;
    checklist: boolean;
    guests: boolean;
    suppliers: boolean;
    gifts: boolean;
  };
  done_count: number;
  total_count: number;
  pending_count: number;
};

export async function getFirstStepsMenuState() {
  const { data } = await api.get<FirstStepsMenuState>('/api/first-steps/');
  return data;
}
