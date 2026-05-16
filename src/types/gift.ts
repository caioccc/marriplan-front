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
  reserved_by?: string;
  reserved_message?: string;
  reserved_at?: string | null;
  product_code?: string;
  created_at?: string;
  updated_at?: string;
}
