import { canAccessFeature, BillingFeatureKey } from "@/constants/plans";
import { useSubscription } from "./useSubscription";

export type FeatureAccessResult = {
  canAccess: boolean;
  isPremium: boolean;
  planLabel: string;
  planSlug: string;
};

export const useFeatureAccess = (
  feature: BillingFeatureKey,
  currentUsage: number | boolean,
): FeatureAccessResult => {
  const subscription = useSubscription();
  const canAccess = canAccessFeature(feature, currentUsage, {
    status: subscription.status,
    has_premium_access: subscription.isPremium,
    effective_plan_slug: subscription.planSlug,
    effective_plan_name: subscription.planLabel,
  });

  return {
    canAccess,
    isPremium: subscription.isPremium,
    planLabel: subscription.planLabel,
    planSlug: subscription.planSlug,
  };
};
