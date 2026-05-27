/* eslint-disable @typescript-eslint/no-explicit-any */

export interface WeddingProfile {
  id: number;
  created_at: string;
  updated_at: string;
  nome_noivo: string;
  telefone_noivo: string;
  descricao_noivo: string;
  facebook_noivo: string;
  instagram_noivo: string;
  email_noivo: string;
  nome_noiva: string;
  telefone_noiva: string;
  descricao_noiva: string;
  facebook_noiva: string;
  instagram_noiva: string;
  email_noiva: string;
  data_casamento: string;
  hora_casamento: string;
  local: string;
  endereco: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  latitude: number | null;
  longitude: number | null;
  cor_principal: string;
  frase_casal: string;
  fotos_amigos: any[];
  fotos_familia: any[];
  fotos_diversas: any[];
  historia: string;
  padrinhos: any[];
  user: number;
}

export interface UserFullData {
  id: number;
  username: string;
  email: string;
  is_email_confirmed: boolean;
  is_2fa_enabled: boolean;
  login_method: "LOGIN_GOOGLE" | "LOGIN_MARRIPLAN";
  has_usable_password: boolean;
  first_steps: boolean;
  settings: number;
  role: string;
  wedding_partner_role?: "noivo" | "noiva" | null;
  wedding_profile: WeddingProfile | null;
  wedding_site: number;
}
/* eslint-disable @typescript-eslint/no-explicit-any */
export type PaginationResponse = {
  pages: number;
  total: number;
  current_page: number;
};

export type RequestProgressStatus = "loading" | "default" | "error" | "success";

export type ApiRequestHandlerStatus = {
  requestState: RequestProgressStatus;
  statusCode?: number;
  errorMessage?: string;
};

export enum DateFormat {
  DATETIME = "DATETIME",
  FULL_DATE = "FULL_DATE",
  MONTH_YEAR = "MONTH_YEAR",
  DAY_MONTH = "DAY_MONTH",
  TIME = "TIME",
  ISO_DATE = "ISO_DATE",
}

export type Language = "pt" | "en";

export type APIError = {
  label: string;
  description: string;
  code: string;
};

export type ErrorResponse = {
  errors: APIError[];
  request_id?: string;
};

export type CustomErrorResponse = {
  response: {
    data: ErrorResponse;
  };
};

export type UserData = {
  username: string;
  name: string;
  email: string;
  id: number;
  is_2fa_enabled: boolean;
  is_email_confirmed: boolean;
  login_method: "LOGIN_GOOGLE" | "LOGIN_MARRIPLAN";
  has_usable_password: boolean;
  first_steps: boolean;
  wedding_partner_role?: "noivo" | "noiva" | null;
  wedding_profile?: any;
};

export type LoginResponse = {
  user: UserData;
  token: string;
  local_user: any;
};

export interface LoginFormData {
  email: string;
  password: string;
}

export interface PasswordFormData {
  password: string;
  confirm_password: string;
}

export interface EmailValidationFormData {
  email: string;
}

export type RegisterFormData = {
  name: string;
  email: string;
  password: string;
  accepted_terms: boolean;
};

export type OptionsPage = {
  [key: string]: string | number | boolean | null;
};

export type NotificationType = "info" | "success" | "warning" | "error";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}
