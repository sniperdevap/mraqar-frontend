"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Crown, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations, useLocale } from "@/hooks/use-locale";
import { useSubscriptionPlans } from "@/hooks/use-plans";
import { CreditStepper } from "./credit-stepper";
import { PlanType } from "@/lib/utils/constant";

export function PlansPage() {
  const router = useRouter();
  const t = useTranslations("common");
  const { locale } = useLocale();
  const { data: plans = [], isLoading } = useSubscriptionPlans();

  const [tab, setTab] = useState<"all" | PlanType>("all");
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const openPlan = (planId: string) => {
    const qty = quantities[planId];
    router.push(qty > 1 ? `/plans/${planId}?qty=${qty}` : `/plans/${planId}`);
  };

  const visiblePlans = plans.filter(
    (plan) => tab === "all" || plan.planType === tab,
  );
  const tabs = [
    { value: "all" as const, label: t("plan.all") },
    { value: PlanType.DAILY, label: t("plan.premiumAdPlan") },
    { value: PlanType.OFFICE, label: t("plan.officesPlan") },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            <div className="h-40 bg-gray-100 rounded-2xl w-full"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-gray-200 p-8 h-80"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-10">
      {/* Hero Section */}
      <div className="bg-primary pt-4 pb-12 sm:pt-6 sm:pb-20 px-4 relative overflow-hidden">
        {/* Subtle Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
          <div className="absolute top-10 left-10 w-48 h-48 border-[20px] border-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-10 right-10 w-64 h-64 border-[30px] border-white rounded-full translate-x-1/2 translate-y-1/2"></div>
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="text-xl sm:text-3xl font-bold text-white mb-2 tracking-tight">
            {t("plan.plans")}
          </h1>
          <p className="text-white/80 text-xs sm:text-sm max-w-xl mx-auto font-medium">
            {t("plan.officesLandingCopy", { highlight: "" })}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-8 sm:-mt-12 relative z-20">
        {/* Support & Balance Bar */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-3 sm:p-4 mb-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <Link
            href="https://wa.me/96590078005"
            target="_blank"
            className="flex items-center gap-3 hover:bg-gray-50 p-1.5 rounded-lg transition-colors w-full sm:w-auto"
          >
            <div className="p-2 bg-green-50 rounded-full shrink-0">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="#25D366">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-primary-dark font-bold text-[11px] sm:text-sm whitespace-nowrap">
                {t("plan.forHelpContactUs")}
              </span>
              <span className="text-gray-400 text-[11px] sm:text-sm">
                96590078005
              </span>
            </div>
          </Link>
          <Button
            onClick={() => router.push("/account?tab=ad-balance")}
            className="w-full sm:w-auto bg-primary-dark hover:bg-primary-dark/90 text-white font-bold h-9 px-6 rounded-lg shadow-sm transition-all active:scale-[0.98] text-xs"
          >
            {t("plan.checkAdBalance")}
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-1 bg-gray-100 rounded-xl p-1 mb-4">
          {tabs.map((item) => (
            <button
              key={item.value}
              onClick={() => setTab(item.value)}
              className={`h-10 rounded-lg text-xs sm:text-sm font-bold transition-colors cursor-pointer ${tab === item.value ? "bg-primary text-white shadow-sm" : "text-gray-500 hover:text-primary-dark"}`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {visiblePlans.map((plan) => {
            const name = locale === "ar" ? plan.nameAr : plan.name;
            const isDaily = plan.planType === PlanType.DAILY;
            const qty = quantities[plan._id] || 1;

            return (
              <div
                key={plan._id}
                onClick={() => openPlan(plan._id)}
                className="group relative bg-white rounded-xl p-4 sm:p-5 border border-gray-100 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300 cursor-pointer flex flex-col h-full overflow-hidden"
              >
                {plan.discount > 0 && (
                  <div className="absolute top-0 end-0 bg-[#ffae1a] text-white px-3 py-1 rounded-bl-xl font-bold text-[9px] sm:text-[11px] shadow-sm z-10">
                    {t("plan.discountLabel", { percent: plan.discount })}
                  </div>
                )}

                <div className="mb-3 flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0 pt-1">
                    <div className="w-1 h-4 bg-primary rounded-full shrink-0"></div>
                    <h3 className="text-sm sm:text-base font-bold text-primary-dark truncate">
                      {name}
                    </h3>
                  </div>
                  <div className="text-end shrink-0">
                    <span className="text-xl sm:text-2xl font-bold text-primary-dark tracking-tighter">
                      {plan.price}
                    </span>
                    <span className="text-[10px] sm:text-xs font-semibold text-gray-400 ms-0.5">
                      {t("currency")}
                    </span>
                    {isDaily && (
                      <p className="text-[10px] sm:text-xs text-gray-400">
                        {t("plan.perCredit")}
                      </p>
                    )}
                  </div>
                </div>

                {isDaily ? (
                  <div className="flex-1 mb-4">
                    <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-gray-50 border border-gray-100 mb-3">
                      <div className="p-1.5 bg-white rounded-md shadow-sm text-primary shrink-0">
                        <Zap size={14} className="fill-current" />
                      </div>
                      <div>
                        <p className="text-primary-dark font-semibold text-xs">
                          {t("plan.buyCreditsTitle")}
                        </p>
                        <p className="text-gray-400 text-[10px] sm:text-[11px]">
                          {t("plan.buyCreditsSub")}
                        </p>
                      </div>
                    </div>
                    <p className="text-[11px] font-semibold text-gray-500 mb-1.5">
                      {t("plan.numberOfCredits")}
                    </p>
                    <div className="flex items-end justify-between gap-2">
                      <CreditStepper
                        value={qty}
                        onChange={(value) =>
                          setQuantities((prev) => ({
                            ...prev,
                            [plan._id]: value,
                          }))
                        }
                      />
                      <div className="text-end">
                        <p className="text-[10px] sm:text-xs text-gray-400">
                          {t("plan.totalPrice")}
                        </p>
                        <span className="text-lg font-bold text-primary">
                          {Number((plan.price * qty).toFixed(3))}
                        </span>
                        <span className="text-[10px] font-bold text-primary ms-0.5">
                          {t("currency")}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 space-y-2 mb-4">
                    <div className="flex items-center gap-2.5 p-2 rounded-lg bg-gray-50 border border-gray-100 transition-colors group-hover:bg-primary/5 group-hover:border-primary/10">
                      <div className="p-1 bg-white rounded-md shadow-sm text-primary shrink-0">
                        <Crown size={14} className="fill-current" />
                      </div>
                      <p className="text-primary-dark font-semibold text-[11px] sm:text-xs leading-snug">
                        {t("plan.featureCredits", { count: plan.adCredits })}
                      </p>
                    </div>
                    <div className="flex items-start gap-2.5 px-0.5">
                      <div className="mt-0.5 p-0.5 bg-primary/10 rounded-full text-primary shrink-0">
                        <svg
                          viewBox="0 0 24 24"
                          width="10"
                          height="10"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <p className="text-gray-600 text-[10px] sm:text-[11px] font-medium">
                        {t("plan.premiumVisibility")}
                      </p>
                    </div>
                  </div>
                )}

                <Button className="w-full mt-auto bg-primary hover:bg-primary/90 text-white font-bold text-sm h-10 rounded-lg shadow-sm">
                  {isDaily ? t("plan.buyCredits") : t("plan.subscribeNow")}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
