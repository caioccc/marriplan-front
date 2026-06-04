export const primaryButtonStyles = {
  root: {
    backgroundColor: 'var(--marriplan-rose)',
    color: '#fff',
    borderRadius: 12,
    transition: 'all 160ms ease',
    '&:hover': {
      backgroundColor: '#a57b6c',
    },
    '&:focus-visible': {
      outline: '2px solid rgba(181, 139, 122, 0.45)',
      outlineOffset: 2,
    },
  },
} as const;

export const PALETTE = {
  champagne: "#F7F1E8",
  roseGold: "#E6B8A2",
  beige: "#EFE6DA",
  warmGray: "#6F6660",
  ink: "#2D2622",
  line: "#EEE3D8",
  softWhite: "#FFFCF8",
  marriplanRose: "var(--marriplan-rose)",
  imageOverlay: "var(--marriplan-image-overlay)",
};

export const primaryButtonStylesWithDisabled = {
  root: {
    ...primaryButtonStyles.root,
    '&:disabled': {
      backgroundColor: '#e4d6cf',
      color: 'rgba(45, 38, 34, 0.6)',
    },
  },
} as const;

export const softButtonStyles = {
  root: {
    backgroundColor: 'var(--marriplan-champagne)',
    color: 'var(--marriplan-text)',
    borderRadius: 12,
    border: '1px solid var(--marriplan-border)',
    transition: 'all 160ms ease',
    '&:hover': {
      backgroundColor: '#eadfd3',
    },
    '&:focus-visible': {
      outline: '2px solid rgba(200, 176, 138, 0.45)',
      outlineOffset: 2,
    },
  },
} as const;

export const authInputStyles = {
  input: {
    borderRadius: 12,
    backgroundColor: 'var(--marriplan-surface)',
    borderColor: 'var(--marriplan-border)',
    color: 'var(--marriplan-text)',
    transition: 'border-color 160ms ease, box-shadow 160ms ease, background-color 160ms ease',
  },
  label: {
    color: 'var(--marriplan-text)',
    fontWeight: 600,
  },
  description: {
    color: 'var(--marriplan-muted)',
  },
  error: {
    color: 'var(--marriplan-rose)',
  },
} as const;

export const actionIconStyles = {
  root: {
    backgroundColor: 'transparent',
    color: 'var(--marriplan-text)',
    borderRadius: 10,
    transition: 'all 160ms ease',
    '&:hover': {
      backgroundColor: 'var(--marriplan-surface-muted)',
      color: 'var(--marriplan-text)',
    },
    '&:focus-visible': {
      outline: '2px solid rgba(142, 126, 111, 0.35)',
      outlineOffset: 2,
    },
  },
} as const;

export const actionIconEditStyles = {
  root: {
    backgroundColor: 'transparent',
    color: 'var(--marriplan-rose)',
    borderRadius: 10,
    transition: 'all 160ms ease',
    '&:hover': {
      backgroundColor: 'rgba(181, 139, 122, 0.12)',
    },
    '&:focus-visible': {
      outline: '2px solid rgba(181, 139, 122, 0.35)',
      outlineOffset: 2,
    },
  },
} as const;

export const actionIconDangerStyles = {
  root: {
    backgroundColor: 'transparent',
    color: 'var(--marriplan-rose)',
    borderRadius: 10,
    transition: 'all 160ms ease',
    '&:hover': {
      backgroundColor: 'rgba(181, 139, 122, 0.16)',
    },
    '&:focus-visible': {
      outline: '2px solid rgba(181, 139, 122, 0.35)',
      outlineOffset: 2,
    },
  },
} as const;

export const inputStyles = { input: { borderRadius: 12 } } as const;

export const checklistTabsStyles = {
  list: {
    padding: 6,
    borderRadius: 16,
    background: 'var(--marriplan-surface-muted)',
    border: '1px solid var(--marriplan-border)',
    gap: 6,
  },
  tab: {
    borderRadius: 12,
    padding: '8px 14px',
    fontWeight: 600,
    color: 'var(--marriplan-muted)',
    transition: 'all 160ms ease',
    '&:hover': {
      backgroundColor: 'rgba(242, 230, 216, 0.6)',
      color: 'var(--marriplan-text)',
    },
    '&[data-active]': {
      backgroundColor: '#fffaf6',
      color: 'var(--marriplan-text)',
      boxShadow: 'inset 0 0 0 1px var(--marriplan-border)',
    },
  },
  tabLabel: {
    color: 'inherit',
    '&[data-active]': {
      color: 'var(--marriplan-text)',
    },
  },
} as const;

export const segmentedTabsStyles = {
  root: {
    background: 'var(--marriplan-surface-muted)',
    border: '1px solid var(--marriplan-border)',
    borderRadius: 16,
    padding: 6,
  },
  indicator: {
    backgroundColor: '#fffaf6',
    borderRadius: 12,
    border: '1px solid var(--marriplan-border)',
  },
  label: {
    color: 'var(--marriplan-muted)',
    fontWeight: 600,
  },
  control: {
    borderRadius: 12,
    transition: 'all 160ms ease',
    '&:hover': {
      backgroundColor: 'rgba(242, 230, 216, 0.6)',
      color: 'var(--marriplan-text)',
    },
  },
} as const;


// Adicione à sua PALETTE
export const STATUS_COLORS = {
  success: {
    soft: 'var(--marriplan-success-soft)',
    text: 'var(--marriplan-success-text)',
  },
  warning: {
    soft: 'var(--marriplan-warning-soft)',
    text: 'var(--marriplan-warning-text)',
  },
  danger: {
    soft: 'var(--marriplan-danger-soft)',
    text: 'var(--marriplan-danger-text)',
  },
  neutral: {
    soft: 'var(--marriplan-neutral-soft)',
    text: 'var(--marriplan-neutral-text)',
  },
};

// Estilos Base para Badges
const badgeBaseStyles = {
  borderRadius: 12, // Mantendo a consistência suave
  padding: '6px 12px',
  fontWeight: 600,
  fontSize: '0.75rem', // Um pouco menor que o texto principal
  textTransform: 'uppercase', // Como os exemplos fornecidos
  transition: 'all 160ms ease',
};

// Estilos de Badge Padronizados
export const badgeStyles = {
  success: {
    root: {
      ...badgeBaseStyles,
      backgroundColor: STATUS_COLORS.success.soft,
      color: STATUS_COLORS.success.text,
    },
  },
  warning: {
    root: {
      ...badgeBaseStyles,
      backgroundColor: STATUS_COLORS.warning.soft,
      color: STATUS_COLORS.warning.text,
    },
  },
  danger: {
    root: {
      ...badgeBaseStyles,
      backgroundColor: STATUS_COLORS.danger.soft,
      color: STATUS_COLORS.danger.text,
    },
  },
  neutral: {
    root: {
      ...badgeBaseStyles,
      backgroundColor: STATUS_COLORS.neutral.soft,
      color: STATUS_COLORS.neutral.text,
    },
  },
} as const;

// Estilos de Ações de Modal Padronizados (usando os botões existentes)
export const modalActionStyles = {
  // CONFIRMAR, SALVAR (Ação Principal)
  primary: {
    ...primaryButtonStyles.root,
  },
  // CANCELAR, RECUSAR (Ação Secundária)
  secondary: {
    ...softButtonStyles.root,
  },
} as const;


export const supplierCardStyles = {
  card: {
    padding: 0, // Remova o padding padrão do card para a imagem ocupar tudo
    overflow: 'hidden', // Importante para as bordas arredondadas da imagem
  },
  imageContainer: {
    position: 'relative',
    width: 140, // Largura fixa da imagem lateral (ajuste se necessário)
    height: '100%', // Ocupa toda a altura do card
    backgroundColor: '#eee', // Cor de fundo temporária (skeleton)
  },
  image: {
    objectFit: 'cover', // Preenche o contêiner mantendo a proporção
    width: '100%',
    height: '100%',
  },
  textContainer: {
    padding: '16px 20px', // O padding que o card costumava ter
    flex: 1, // Ocupa o restante do espaço
  },
  actionsContainer: {
    padding: '16px 20px',
  },
} as const;