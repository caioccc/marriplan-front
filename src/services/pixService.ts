import api from './api';

export type PixKeyType = 'cpf' | 'email' | 'phone' | 'random';

export type PixSettingsPayload = {
  enabled: boolean;
  pix_key_type: PixKeyType;
  pix_key: string;
  recipient_name: string;
  city: string;
};

export type PixSettingsRecord = PixSettingsPayload & {
  id: number;
  wedding_profile: number;
  share_hash: string;
  qr_code_payload: string;
  pix_copy_paste_code: string;
  share_url: string;
  created_at: string;
  updated_at: string;
};

export type PublicPixSettingsRecord = {
  enabled: boolean;
  recipient_name: string;
  city: string;
  qr_code_payload: string;
  pix_copy_paste_code: string;
  share_url: string;
};

type PixDraft = Pick<PixSettingsPayload, 'pix_key_type' | 'pix_key' | 'recipient_name' | 'city'> & {
  share_hash?: string;
};

function normalizeText(value: string) {
  return value.trim();
}

function stripAccents(value: string) {
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
}

function validateCpf(cpf: string) {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return false;
  if (/^(\d)\1+$/.test(digits)) return false;

  const checkDigit = (base: string, weights: number[]) => {
    const total = base
      .split('')
      .reduce((sum, digit, index) => sum + Number(digit) * weights[index], 0);
    const remainder = (total * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };

  const firstDigit = checkDigit(digits.slice(0, 9), [10, 9, 8, 7, 6, 5, 4, 3, 2]);
  const secondDigit = checkDigit(digits.slice(0, 10), [11, 10, 9, 8, 7, 6, 5, 4, 3, 2]);
  return digits.endsWith(`${firstDigit}${secondDigit}`);
}

export function normalizePixKeyValue(pixKeyType: PixKeyType, pixKey: string) {
  const rawValue = normalizeText(pixKey);

  if (pixKeyType === 'cpf') {
    return rawValue.replace(/\D/g, '');
  }

  if (pixKeyType === 'email') {
    return rawValue.toLowerCase();
  }

  if (pixKeyType === 'phone') {
    const digits = rawValue.replace(/\D/g, '');
    if (digits.startsWith('55') && (digits.length === 12 || digits.length === 13)) {
      return `+${digits}`;
    }
    if (digits.length === 10 || digits.length === 11) {
      return `+55${digits}`;
    }
    return rawValue;
  }

  return rawValue;
}

function normalizePixText(value: string, maxLength: number) {
  return stripAccents(normalizeText(value)).replace(/\s+/g, ' ').slice(0, maxLength).toUpperCase();
}

function emv(tag: string, value: string) {
  return `${tag}${value.length.toString().padStart(2, '0')}${value}`;
}

function crc16(payload: string) {
  const polynomial = 0x1021;
  let crc = 0xffff;

  for (let index = 0; index < payload.length; index += 1) {
    crc ^= payload.charCodeAt(index) << 8;
    for (let bit = 0; bit < 8; bit += 1) {
      if (crc & 0x8000) {
        crc = ((crc << 1) ^ polynomial) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, '0');
}

export function buildPixPayload(draft: PixDraft) {
  const pixKey = normalizePixKeyValue(draft.pix_key_type, draft.pix_key);
  const recipientName = normalizePixText(draft.recipient_name, 25);
  const city = normalizePixText(draft.city, 15);
  const txid = '***';

  const merchantAccountInfo = [
    emv('00', 'BR.GOV.BCB.PIX'),
    emv('01', pixKey),
  ].join('');

  const payloadWithoutCrc = [
    emv('00', '01'),
    emv('01', '11'),
    emv('26', merchantAccountInfo),
    emv('52', '0000'),
    emv('53', '986'),
    emv('58', 'BR'),
    emv('59', recipientName),
    emv('60', city),
    emv('62', emv('05', txid)),
    '6304',
  ].join('');

  return `${payloadWithoutCrc}${crc16(payloadWithoutCrc)}`;
}

export function buildPixCopyPasteCode(draft: PixDraft) {
  return buildPixPayload(draft);
}

export function buildPixShareUrl(shareHash: string) {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/gifts/pix/${shareHash}`;
  }

  return `/gifts/pix/${shareHash}`;
}

export function validatePixDraft(draft: PixDraft & { enabled?: boolean }) {
  const errors: Partial<Record<keyof PixDraft | 'enabled', string>> = {};

  if (!draft.recipient_name.trim()) {
    errors.recipient_name = 'Nome exibido é obrigatório.';
  }

  if (!draft.city.trim()) {
    errors.city = 'Cidade é obrigatória.';
  }

  if (!draft.pix_key_type) {
    errors.pix_key_type = 'Selecione o tipo da chave PIX.';
    return errors;
  }

  const normalizedKey = normalizeText(draft.pix_key);
  if (!normalizedKey) {
    errors.pix_key = 'Chave PIX é obrigatória.';
  } else if (draft.pix_key_type === 'cpf' && !validateCpf(normalizedKey)) {
    errors.pix_key = 'CPF inválido.';
  } else if (draft.pix_key_type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedKey)) {
    errors.pix_key = 'E-mail inválido.';
  } else if (draft.pix_key_type === 'phone') {
    const digits = normalizedKey.replace(/\D/g, '');
    if (!(digits.length === 10 || digits.length === 11 || digits.length === 12 || digits.length === 13)) {
      errors.pix_key = 'Telefone inválido.';
    }
  }

  if (draft.enabled && errors.pix_key) {
    errors.enabled = 'Ative o PIX somente com uma chave válida.';
  }

  return errors;
}

export async function getMyPixSettings() {
  try {
    const response = await api.get('/api/pix-settings/me/');
    return response.data as PixSettingsRecord;
  } catch (error: any) {
    if (error?.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function savePixSettings(payload: PixSettingsPayload) {
  const { enabled, pix_key_type, pix_key, recipient_name, city } = payload;
  const response = await api.patch('/api/pix-settings/', {
    enabled,
    pix_key_type,
    pix_key,
    recipient_name,
    city,
  });
  return response.data as PixSettingsRecord;
}

export async function getPublicPixSettings(shareHash: string, amount?: number | string | null) {
  const params = amount ? { amount: String(amount) } : undefined;
  const response = await api.get(`/api/pix-settings/public/${shareHash}/`, { params });
  return response.data as PublicPixSettingsRecord;
}