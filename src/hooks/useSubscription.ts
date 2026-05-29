import { useAuth } from "@/contexts/AuthContext";
import {
  BillingSubscriptionSummary,
  isPremiumAccess,
} from "@/constants/plans";

export type UseSubscriptionResult = {
  subscription: BillingSubscriptionSummary;
  planSlug: string;
  planLabel: string;
  status: string;
  isPremium: boolean;
  isFree: boolean;
  isTrialing: boolean;
  trialEndsAt: string | null;
};

export const useSubscription = (): UseSubscriptionResult => {
  const { user } = useAuth();
  const subscription = user?.billing_subscription as BillingSubscriptionSummary;
  const status = subscription?.status ?? "free";
  const isPremium = isPremiumAccess(subscription);
  const planSlug = subscription?.effective_plan_slug ?? (isPremium ? "premium" : "free");
  const planLabel = subscription?.effective_plan_name ?? (isPremium ? "Premium" : "Free");
  const isTrialing = status === "trialing";
  const isFree = !isPremium;

  return {
    subscription,
    planSlug,
    planLabel,
    status,
    isPremium,
    isFree,
    isTrialing,
    trialEndsAt: subscription?.trial_ends_at ?? null,
  };
};
