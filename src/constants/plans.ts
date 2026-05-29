export type BillingFeatureKey =
  | "checklist"
  | "guests"
  | "gifts"
  | "suppliers"
  | "inspirations"
  | "exports"
  | "ai";

export type BillingPlanSlug = "free" | "premium" | string;
export type BillingSubscriptionStatus =
  | "free"
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "expired"
  | "incomplete"
  | string;

export type BillingPlanDefinition = {
  slug: BillingPlanSlug;
  name: string;
  description: string;
  price: number;
  recurringLabel: string;
  ctaLabel: string;
  highlight?: boolean;
  features: Record<BillingFeatureKey, number | boolean | null>;
};

export type BillingPlanPayload = {
  slug: BillingPlanSlug;
  name?: string;
  status?: BillingSubscriptionStatus;
  plan_type?: string;
  has_premium_access?: boolean;
};

export type BillingSubscriptionSummary = {
  status?: BillingSubscriptionStatus;
  has_premium_access?: boolean;
  effective_plan_slug?: string;
  effective_plan_name?: string;
  trial_ends_at?: string | null;
  plan?: BillingPlanPayload | null;
} | null | undefined;

export const FREE_PLAN_FEATURES: BillingPlanDefinition["features"] = {
  checklist: 5,
  guests: 10,
  gifts: 5,
  suppliers: 3,
  inspirations: 5,
  exports: false,
  ai: false,
};

export const PREMIUM_PLAN_FEATURES: BillingPlanDefinition["features"] = {
  checklist: null,
  guests: null,
  gifts: null,
  suppliers: null,
  inspirations: null,
  exports: true,
  ai: true,
};

export const FREE_PLAN_TEXT =
  "até 10 convidados, 5 tarefas, 5 presentes, 3 fornecedores e 5 inspirações";

export const PREMIUM_PLAN_TEXT =
  "Tudo liberado para organizar sem limites.";

export const FEATURE_LABELS: Record<BillingFeatureKey, string> = {
  checklist: "Checklist",
  guests: "Convidados",
  gifts: "Presentes",
  suppliers: "Fornecedores",
  inspirations: "Inspirações",
  exports: "Exportações",
  ai: "IA",
};

export const PLAN_DEFINITIONS: BillingPlanDefinition[] = [
  {
    slug: "free",
    name: "FREE",
    description: "Comece sem pagar e organize o essencial do casamento.",
    price: 0,
    recurringLabel: "Gratuito",
    ctaLabel: "Plano atual",
    features: FREE_PLAN_FEATURES,
  },
  {
    slug: "premium",
    name: "PREMIUM",
    description: "Acesse todos os recursos e organize seu casamento sem limites.",
    price: 29.9,
    recurringLabel: "pagamento único",
    ctaLabel: "Assinar Premium",
    highlight: true,
    features: PREMIUM_PLAN_FEATURES,
  },
];

export const getPlanDefinition = (slug: BillingPlanSlug) => {
  return PLAN_DEFINITIONS.find((plan) => plan.slug === slug) ?? PLAN_DEFINITIONS[0];
};

export const getFeatureLimit = (
  feature: BillingFeatureKey,
  planSlug: BillingPlanSlug = "free",
) => {
  const plan = getPlanDefinition(planSlug);
  return plan.features[feature];
};

export const isPremiumAccess = (
  subscription?: BillingSubscriptionSummary,
): boolean => {
  if (!subscription) return false;
  if (subscription.has_premium_access) return true;

  if (subscription.status === "trialing" && subscription.trial_ends_at) {
    return new Date(subscription.trial_ends_at).getTime() > Date.now();
  }

  const status = subscription.status ?? "free";
  return status === "trialing" || status === "active";
};

export const canAccessFeature = (
  feature: BillingFeatureKey,
  currentUsage: number | boolean,
  plan: BillingPlanPayload | BillingSubscriptionSummary = null,
): boolean => {
  const hasPremiumAccess = isPremiumAccess(
    plan as BillingSubscriptionSummary,
  );

  if (feature === "exports" || feature === "ai") {
    return hasPremiumAccess;
  }

  if (hasPremiumAccess) {
    return true;
  }

  const limit = FREE_PLAN_FEATURES[feature];
  if (typeof limit !== "number") {
    return false;
  }

  if (typeof currentUsage === "boolean") {
    return currentUsage;
  }

  return currentUsage < limit;
};

export const isFeatureLimitReached = (
  feature: BillingFeatureKey,
  currentUsage: number | boolean,
  hasPremiumAccess = false,
): boolean => {
  if (hasPremiumAccess) {
    return false;
  }

  const limit = FREE_PLAN_FEATURES[feature];
  if (typeof limit !== "number") {
    return false;
  }

  if (typeof currentUsage === "boolean") {
    return !currentUsage;
  }

  return currentUsage >= limit;
};

export const getFeatureUsageCopy = (
  feature: BillingFeatureKey,
  usage: number,
) => {
  const limit = FREE_PLAN_FEATURES[feature];
  if (typeof limit !== "number") {
    return "Ilimitado no Premium";
  }

  return `${usage}/${limit}`;
};
