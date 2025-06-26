export interface Gift {
  id: string;
  wedding_profile: string;
  name: string;
  value: number;
  link?: string;
  description?: string;
  category: string;
  image?: string;
  icon?: string;
  status: 'available' | 'purchased' | 'reserved';
  purchased_by?: string;
  purchase_date?: string;
  product_code?: string;
  created_at?: string;
  updated_at?: string;
}
