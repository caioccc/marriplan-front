export interface TimelineMoment {
  id: string;
  wedding_profile: string;
  time: string;
  title: string;
  description?: string;
  order: number;
  created_at?: string;
  updated_at?: string;
}

export interface TimelineMomentPayload {
  time: string;
  title: string;
  description?: string;
}
