import {
  ColorGuide,
  DressCodeOption,
  InspirationItem,
  NavItem,
  PaletteColor,
  WeddingStyle,
} from "@/types/weddingIdentity";

export const WEDDING_STYLES: WeddingStyle[] = [
  {
    id: "classico",
    label: "Clássico",
    subtitle: "Elegante & Atemporal",
    tags: ["Sofisticado", "Formal", "Grandioso"],
    color: "#C9A96E",
    bg: "linear-gradient(135deg,#2c1a0e 0%,#5a3a1a 100%)",
    emoji: "🕍",
  },
  {
    id: "boho",
    label: "Boho",
    subtitle: "Livre & Orgânico",
    tags: ["Natural", "Flores", "Rústico"],
    color: "#A67C52",
    bg: "linear-gradient(135deg,#3d2b1f 0%,#7a5c3a 100%)",
    emoji: "🌿",
  },
  {
    id: "minimalista",
    label: "Minimalista",
    subtitle: "Clean & Moderno",
    tags: ["Neutro", "Simples", "Elegante"],
    color: "#8B9EA8",
    bg: "linear-gradient(135deg,#1a2a30 0%,#3a5060 100%)",
    emoji: "◻",
  },
  {
    id: "luxo",
    label: "Luxo",
    subtitle: "Grand & Refinado",
    tags: ["Premium", "Gold", "Opulento"],
    color: "#D4AF37",
    bg: "linear-gradient(135deg,#1a1200 0%,#4a3800 100%)",
    emoji: "👑",
  },
  {
    id: "praia",
    label: "Praia",
    subtitle: "Relaxado & Costeiro",
    tags: ["Mar", "Areia", "Tropical"],
    color: "#5B9BD5",
    bg: "linear-gradient(135deg,#0a2340 0%,#1a5080 100%)",
    emoji: "🌊",
  },
  {
    id: "campo",
    label: "Campo",
    subtitle: "Charmoso & Natural",
    tags: ["Fazenda", "Madeira", "Bucólico"],
    color: "#7B9E6B",
    bg: "linear-gradient(135deg,#1a2a10 0%,#3a5a20 100%)",
    emoji: "🌾",
  },
  {
    id: "romantico",
    label: "Romântico",
    subtitle: "Íntimo & Encantador",
    tags: ["Rosas", "Velas", "Delicado"],
    color: "#C87B7B",
    bg: "linear-gradient(135deg,#2a0a0a 0%,#5a2020 100%)",
    emoji: "🌹",
  },
  {
    id: "vintage",
    label: "Vintage",
    subtitle: "Chique & Nostálgico",
    tags: ["Retrô", "Clássico", "Patina"],
    color: "#B8956A",
    bg: "linear-gradient(135deg,#2a1a08 0%,#5a3c18 100%)",
    emoji: "📻",
  },
];

export const MOCK_PALETTE: PaletteColor[] = [
  { id: 1, hex: "#E3C1B5", name: "Soft Rose Gold", isPrimary: true },
  { id: 2, hex: "#F7E7C8", name: "Pale Champagne", isPrimary: true },
  { id: 3, hex: "#FFFDF5", name: "Cream White", isPrimary: false },
  { id: 4, hex: "#E5E1D1", name: "Pearl Dust", isPrimary: false },
  { id: 5, hex: "#BDA88D", name: "Vintage Taupe", isPrimary: false },
];

export const PALETTE_PRESET_COLORS = [
  { hex: "#E3C1B5", name: "Soft Rose Gold" },
  { hex: "#F7E7C8", name: "Pale Champagne" },
  { hex: "#FFFDF5", name: "Cream White" },
  { hex: "#E5E1D1", name: "Pearl Dust" },
  { hex: "#BDA88D", name: "Vintage Taupe" },
  { hex: "#D4B896", name: "Warm Sand" },
  { hex: "#C4756A", name: "Dusty Rose" },
  { hex: "#9B8E84", name: "Warm Gray" },
  { hex: "#C9A96E", name: "Antique Gold" },
  { hex: "#F2D4C8", name: "Blush Pink" },
];

export const DRESS_CODE_OPTIONS: DressCodeOption[] = [
  {
    id: "black-tie",
    label: "Black Tie",
    desc: "Elegância absoluta. Traje longo para damas, smoking para cavalheiros.",
    formality: 5,
    color: "#1a1a1a",
  },
  {
    id: "social",
    label: "Social",
    desc: "Traje passeio completo ou cocktail. Sofisticado e versátil.",
    formality: 4,
    color: "#3a3a3a",
  },
  {
    id: "esporte-fino",
    label: "Esporte Fino",
    desc: "Equilíbrio entre casual e formal. Conforto com estilo.",
    formality: 3,
    color: "#6B5B47",
  },
  {
    id: "casual-chic",
    label: "Casual Chic",
    desc: "Despojado com toque de sofisticação. Para celebrações íntimas.",
    formality: 2,
    color: "#8B7B6B",
  },
  {
    id: "praia-formal",
    label: "Praia Formal",
    desc: "Leveza e frescor sem abrir mão da elegância.",
    formality: 1,
    color: "#5B8DB8",
  },
];

export const DECORATION_CATEGORIES = [
  "Altar",
  "Flores",
  "Iluminação",
  "Mesas",
  "Lounges",
  "Velas",
  "Arranjos",
];

export const MOCK_INSPIRATIONS: InspirationItem[] = [
  {
    id: 1,
    title: "Cerimônia no jardim encantado",
    category: "Cerimônia",
    tags: ["Flores", "Natural"],
    favorited: true,
    height: 280,
  },
  {
    id: 2,
    title: "Buquê romântico boho",
    category: "Flores",
    tags: ["Boho", "Rosa"],
    favorited: false,
    height: 200,
  },
  {
    id: 3,
    title: "Mesa de recepção dourada",
    category: "Decoração",
    tags: ["Luxo", "Gold"],
    favorited: true,
    height: 240,
  },
  {
    id: 4,
    title: "Convite em papel texturizado",
    category: "Papelaria",
    tags: ["Clássico", "Creme"],
    favorited: false,
    height: 180,
  },
  {
    id: 5,
    title: "Vestido com renda delicada",
    category: "Moda",
    tags: ["Vestido", "Vintage"],
    favorited: true,
    height: 320,
  },
  {
    id: 6,
    title: "Iluminação suspensa com velas",
    category: "Iluminação",
    tags: ["Romântico", "Velas"],
    favorited: false,
    height: 220,
  },
  {
    id: 7,
    title: "Arranjos de peônia e eucalipto",
    category: "Flores",
    tags: ["Peônia", "Verde"],
    favorited: true,
    height: 260,
  },
  {
    id: 8,
    title: "Lounge de veludo champanhe",
    category: "Lounges",
    tags: ["Veludo", "Champanhe"],
    favorited: false,
    height: 190,
  },
];

export const SWEETS_OPTIONS = {
  embalagem: ["Acetato", "Kraft", "Linho", "Organza", "Veludo"],
  laco: ["Fita de Cetim", "Juta", "Organza", "Sem Laço", "Twine"],
  textura: ["Lisa", "Texturizada", "Marmorizada", "Rendada", "Floral"],
  forma: ["Redondo", "Coração", "Retângulo", "Oval", "Quadrado"],
};

export const NAV_ITEMS: NavItem[] = [
  { id: "moodboard", label: "Identidade do Casamento", icon: "layout" },
  { id: "palette", label: "Paleta de Cores", icon: "palette" },
  { id: "style", label: "Estilo do Casamento", icon: "star" },
  { id: "dresscode", label: "Dress Code", icon: "shirt" },
  { id: "sweets", label: "Doces & Bem-casados", icon: "cake" },
  { id: "decoration", label: "Decoração", icon: "flower" },
  { id: "inspirations", label: "Referências Visuais", icon: "image" },
];

export const WEDDING_STYLE_FILTERS = [
  "Todos",
  "Clássico",
  "Natural",
  "Moderno",
  "Praia",
];

export const INSPIRATION_CATEGORIES = [
  "Todas",
  "Cerimônia",
  "Flores",
  "Decoração",
  "Papelaria",
  "Moda",
  "Iluminação",
];

export const INITIAL_SWEETS_CONFIG = {
  embalagem: "Acetato",
  laco: "Fita de Cetim",
  textura: "Lisa",
  forma: "Redondo",
  cor: "#F7E7C8",
  tagText: "A & R",
};

export const STYLE_IMAGE_MAP: Record<string, string> = {
  vintage:
    "https://res.cloudinary.com/freelancerinc/image/upload/v1779395440/retro_azgihb_fvm6hu.png",
  romantico:
    "https://res.cloudinary.com/freelancerinc/image/upload/v1779395441/romantico_oilj44_zuer7w.png",
  praia:
    "https://res.cloudinary.com/freelancerinc/image/upload/v1779395440/praia_bdn3jh_tjbvas.png",
  luxo: "https://res.cloudinary.com/freelancerinc/image/upload/v1779395439/Luxo_dwyk0d_autfqx.png",
  minimalista:
    "https://res.cloudinary.com/freelancerinc/image/upload/v1779395439/minimalist_v8snx8_cb5v33.png",
  campo:
    "https://res.cloudinary.com/freelancerinc/image/upload/v1779395438/campo_zet9bn_slxmft.png",
  classico:
    "https://res.cloudinary.com/freelancerinc/image/upload/v1779395439/classico_xeai3l_a0s43e.png",
  boho: "https://res.cloudinary.com/freelancerinc/image/upload/v1779395438/Boho_viwmxq_pmcsj8.png",
};

export const DRESS_CODE_COLOR_MAP: Record<
  string,
  {
    title: string;
    description: string;
    suggestedColors: ColorGuide[];
    forbiddenColors: ColorGuide[];
  }
> = {
  "black-tie": {
    title: "Black Tie / Gala",
    description:
      "O ápice do formalismo. Cores sóbrias, profundas e extremamente elegantes.",
    suggestedColors: [
      { name: "Preto", hex: "#000000" },
      { name: "Azul Meia-Noite / Midnight Blue", hex: "#191970" },
      { name: "Verde Esmeralda Escuro", hex: "#0A5C36" },
      { name: "Borgonha / Vinho Profundo", hex: "#4A0E17" },
      { name: "Chumbo / Grafite", hex: "#3A3A3A" },
    ],
    forbiddenColors: [
      { name: "Branco (Exclusivo da Noiva)", hex: "#FFFFFF" },
      { name: "Off-White / Marfim", hex: "#FDFFFA" },
      { name: "Cores Neon / Fluorescentes", hex: "#2CFF05" },
      {
        name: "Estampas chamativas ou excessivamente coloridas",
        hex: "#8A00C4",
      },
    ],
  },
  social: {
    title: "Social / Passeio Completo",
    description:
      "Formal e tradicional, permitindo uma variedade maior de tons elegantes, mas ainda discretos.",
    suggestedColors: [
      { name: "Azul Marinho", hex: "#002060" },
      { name: "Cinza Escuro / Charcoal", hex: "#4F4F4F" },
      { name: "Tons de Rosé / Marsala", hex: "#B76E79" },
      { name: "Verde Oliva / Musgo", hex: "#556B2F" },
      { name: "Azul Petróleo", hex: "#004953" },
    ],
    forbiddenColors: [
      { name: "Branco (Exclusivo da Noiva)", hex: "#FFFFFF" },
      { name: "Off-White", hex: "#FDFFFA" },
      {
        name: "Cores excessivamente berrantes (Laranja/Amarelo marca-texto)",
        hex: "#FF5C00",
      },
      {
        name: "Preto (Para madrinhas/padrinhos, a menos que explicitamente solicitado pelos noivos)",
        hex: "#000000",
      },
    ],
  },
  "esporte-fino": {
    title: "Esporte Fino / Passeio",
    description:
      "Equilíbrio entre o formal e o casual. Cores mais vivas e tons médios são muito bem-vindos.",
    suggestedColors: [
      { name: "Azul Indigo / Royal", hex: "#4169E1" },
      { name: "Tons de Areia / Bege", hex: "#F5F5DC" },
      { name: "Terracota / Tijolo", hex: "#C46210" },
      { name: "Verde Sálvia", hex: "#87A96B" },
      { name: "Rosa Chá / Tons Pastéis", hex: "#FFF0F5" },
    ],
    forbiddenColors: [
      { name: "Branco (Exclusivo da Noiva)", hex: "#FFFFFF" },
      { name: "Off-White", hex: "#FDFFFA" },
      {
        name: "Preto total em trajes diurnos (passa uma impressão muito pesada)",
        hex: "#000000",
      },
    ],
  },
  "casual-chic": {
    title: "Casual Chic",
    description:
      "Despojado com sofisticação para casamentos íntimos. Liberdade para tons claros e texturas naturais.",
    suggestedColors: [
      { name: "Cáqui / Tan", hex: "#D2B48C" },
      { name: "Azul Serenity", hex: "#ADC3C8" },
      { name: "Verde Menta", hex: "#98FF98" },
      { name: "Mostarda Suave", hex: "#E1AD01" },
      { name: "Lavanda / Lilás", hex: "#E6E6FA" },
    ],
    forbiddenColors: [
      { name: "Branco (Exclusivo da Noiva)", hex: "#FFFFFF" },
      { name: "Off-White", hex: "#FDFFFA" },
      {
        name: "Preto Total (Muito pesado para a proposta casual/íntima)",
        hex: "#000000",
      },
      { name: "Brilhos metálicos excessivos (Paetês pesados)", hex: "#FFD700" },
    ],
  },
  "praia-formal": {
    title: "Praia / Costeiro",
    description:
      "Leveza, frescor e conexão com a natureza. Tons tropicais, pastéis e cores que refletem o mar e o pôr do sol.",
    suggestedColors: [
      { name: "Azul Piscina / Turquesa", hex: "#40E0D0" },
      { name: "Coral / Pêssego", hex: "#FF7F50" },
      { name: "Amarelo Manteiga", hex: "#FFFDD0" },
      { name: "Verde Água", hex: "#66CDAA" },
      { name: "Nude / Tons de Linho Natural", hex: "#E8D8C8" },
    ],
    forbiddenColors: [
      { name: "Branco (Exclusivo da Noiva)", hex: "#FFFFFF" },
      { name: "Off-White / Pérola", hex: "#FAEBD7" },
      {
        name: "Preto (Absolutamente proibido pelo calor e conceito praiano)",
        hex: "#000000",
      },
      {
        name: "Cores extremamente escuras/pesadas (Chumbo, Marinho fechado, Vinho)",
        hex: "#5b5b58",
      },
    ],
  },
  praia: {
    title: "Praia / Costeiro",
    description:
      "Leveza, frescor e conexão com a natureza. Tons tropicais, pastéis e cores que refletem o mar e o pôr do sol.",
    suggestedColors: [
      { name: "Azul Piscina / Turquesa", hex: "#40E0D0" },
      { name: "Coral / Pêssego", hex: "#FF7F50" },
      { name: "Amarelo Manteiga", hex: "#FFFDD0" },
      { name: "Verde Água", hex: "#66CDAA" },
      { name: "Nude / Tons de Linho Natural", hex: "#E8D8C8" },
    ],
    forbiddenColors: [
      { name: "Branco (Exclusivo da Noiva)", hex: "#FFFFFF" },
      { name: "Off-White / Pérola", hex: "#FAEBD7" },
      {
        name: "Preto (Absolutamente proibido pelo calor e conceito praiano)",
        hex: "#000000",
      },
      {
        name: "Cores extremamente escuras/pesadas (Chumbo, Marinho fechado, Vinho)",
      },
    ],
  },
};

export const DRESS_CODE_REFERENCE_IMAGES: Record<
  string,
  {
    noivo: string;
    noiva: string;
    padrinhos: string;
    madrinhas: string;
  }
> = {
  "black-tie": {
    noivo:
      "https://res.cloudinary.com/freelancerinc/image/upload/v1779397275/blacktie-noivo_c2gutq.png",
    noiva:
      "https://res.cloudinary.com/freelancerinc/image/upload/v1779397197/blacktie-noiva_blz7m2.png",
    padrinhos:
      "https://res.cloudinary.com/freelancerinc/image/upload/v1779397196/blacktie-padrinhos_skc5jw.png",
    madrinhas:
      "https://res.cloudinary.com/freelancerinc/image/upload/v1779397196/blacktie-madrinhas_pmi2f0.png",
  },
  social: {
    noivo:
      "https://res.cloudinary.com/freelancerinc/image/upload/v1779397195/social-noivo_sjsx67.png",
    noiva:
      "https://res.cloudinary.com/freelancerinc/image/upload/v1779397194/social-noiva_ecuhfi.png",
    padrinhos:
      "https://res.cloudinary.com/freelancerinc/image/upload/v1779397194/social-padrinhos_xufbbb.png",
    madrinhas:
      "https://res.cloudinary.com/freelancerinc/image/upload/v1779397193/social-madrinhas_mq0ro9.png",
  },
  "esporte-fino": {
    noivo:
      "https://res.cloudinary.com/freelancerinc/image/upload/v1779397192/esportefino-noivo_spuhhi.png",
    noiva:
      "https://res.cloudinary.com/freelancerinc/image/upload/v1779397192/esportefino-noiva_cxj2vp.png",
    padrinhos:
      "https://res.cloudinary.com/freelancerinc/image/upload/v1779397191/esportefino-padrinhos_dthjt9.png",
    madrinhas:
      "https://res.cloudinary.com/freelancerinc/image/upload/v1779397190/esportefino-madrinhas_aptj09.png",
  },
  "casual-chic": {
    noivo:
      "https://res.cloudinary.com/freelancerinc/image/upload/v1779397190/casual-noivo_eymvhu.png",
    noiva:
      "https://res.cloudinary.com/freelancerinc/image/upload/v1779397189/casual-noiva_hgpyfb.png",
    padrinhos:
      "https://res.cloudinary.com/freelancerinc/image/upload/v1779397188/casual-padrinhos_dpc3gl.png",
    madrinhas:
      "https://res.cloudinary.com/freelancerinc/image/upload/v1779397188/casual-madrinhas_wenrr9.png",
  },
  "praia-formal": {
    noivo:
      "https://res.cloudinary.com/freelancerinc/image/upload/v1779397187/praia-noivo_wqflox.png",
    noiva:
      "https://res.cloudinary.com/freelancerinc/image/upload/v1779397187/praia-noiva_kwyuj9.png",
    padrinhos:
      "https://res.cloudinary.com/freelancerinc/image/upload/v1779397187/praia-padrinhos_guvji6.png",
    madrinhas:
      "https://res.cloudinary.com/freelancerinc/image/upload/v1779397186/praia-madrinhas_rlldcl.png",
  },
  praia: {
    noivo:
      "https://res.cloudinary.com/freelancerinc/image/upload/v1779397187/praia-noivo_wqflox.png",
    noiva:
      "https://res.cloudinary.com/freelancerinc/image/upload/v1779397187/praia-noiva_kwyuj9.png",
    padrinhos:
      "https://res.cloudinary.com/freelancerinc/image/upload/v1779397187/praia-padrinhos_guvji6.png",
    madrinhas:
      "https://res.cloudinary.com/freelancerinc/image/upload/v1779397186/praia-madrinhas_rlldcl.png",
  },
};
