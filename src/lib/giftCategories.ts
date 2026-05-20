export const ALL_CATEGORY_OPTION = { value: "", label: "Todas" };

// Centralizar mapa de categorias: chave (slug) -> label em português
export const CATEGORY_LABELS: Record<string, string> = {
  home: "Casa",
  travel: "Viagem",
  money: "Dinheiro",
  other: "Outros",
  experience: "Experiência",
  charity: "Caridade",
  electronics: "Eletrônicos",
  furniture: "Móveis",
  kitchen: "Cozinha",
  clothing: "Roupas",
  books: "Livros",
  toys: "Brinquedos",
  jewelry: "Joias",
  decor: "Decoração",
  gift_card: "Cartão Presente",
};

export function getCategoryLabel(slug?: string) {
  if (!slug) return "";
  return CATEGORY_LABELS[slug] || slug.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function getCategoryOptionsFromSlugs(slugs: string[]) {
  const unique = Array.from(new Set(slugs.filter(Boolean)));
  return [ALL_CATEGORY_OPTION, ...unique.map((s) => ({ value: s, label: getCategoryLabel(s) }))];
}

export const HARD_CODED_CATEGORIES = [
  ...Object.keys(CATEGORY_LABELS),
];

export function getAllCategoryOptions() {
  return [ALL_CATEGORY_OPTION, ...HARD_CODED_CATEGORIES.map((s) => ({ value: s, label: getCategoryLabel(s) }))];
}
