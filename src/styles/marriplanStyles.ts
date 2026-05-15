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
