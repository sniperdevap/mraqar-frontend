"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  X,
  CheckCircle,
  Check,
  Tag,
  Calendar,
  Crown,
  Coins,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createCheckout, submitToGateway } from "@/lib/api/payment";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/utils/api";
import { PlanType } from "@/lib/utils/constant";
import { useAuthStore } from "@/lib/store/auth-store";
import { useLocale } from "@/hooks/use-locale";
import { useTranslations } from "next-intl";
import { useSubscriptionPlanById } from "@/hooks/use-plans";
import { useQueryClient } from "@tanstack/react-query";
import { validateCoupon } from "@/lib/api/coupon";
import { CreditStepper, MAX_CREDITS } from "./credit-stepper";

interface PlanViewPageProps {
  planId: string;
  initialQty?: number;
}

export function PlanViewPage({ planId, initialQty = 1 }: PlanViewPageProps) {
  const router = useRouter();
  const { locale } = useLocale();
  const t = useTranslations("common");
  const { refreshSubscriptions } = useAuthStore();
  const queryClient = useQueryClient();
  const { data: plan, isLoading } = useSubscriptionPlanById(planId);
  const [modalOpen, setModalOpen] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [discount, setDiscount] = useState<number | null>(null);
  const [qty, setQty] = useState(
    Math.min(MAX_CREDITS, Math.max(1, Math.floor(initialQty) || 1)),
  );

  const isDaily = plan?.planType === PlanType.DAILY;
  const quantity = isDaily ? qty : 1;
  const subtotal = Number(((plan?.price || 0) * quantity).toFixed(3));
  const amountDue = Number((subtotal * (1 - (discount || 0) / 100)).toFixed(3));

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return;

    try {
      const response = await validateCoupon(discountCode);
      if (response.success && response.data) {
        setDiscount(response.data.discountValue);
        toast.success(t("plan.discountApplied"));
      }
    } catch (error) {
      toast.error(getErrorMessage(error) || t("plan.invalidDiscountCode"));
      setDiscount(null);
    }
  };

  const handlePay = async () => {
    if (!plan) return;
    setIsPaying(true);

    try {
      const checkout = await createCheckout(
        plan._id,
        discount !== null ? discountCode : undefined,
        quantity,
      );
      if (!checkout.free) {
        submitToGateway(checkout);
        return;
      }
      if (plan.planType === PlanType.OFFICE && plan.price === 0) {
        toast.success(t("plan.officePlanActivated"));
      } else {
        toast.success(t("plan.successfullySubscribed", { name: plan.name }));
      }
      refreshSubscriptions();
      queryClient.invalidateQueries({ queryKey: ["my-subscriptions"] });
      setModalOpen(false);
      router.push("/account?tab=ad-balance");
    } catch (error) {
      toast.error(getErrorMessage(error, t("plan.subscriptionFailed")));
    }
    setIsPaying(false);
  };

  if (isLoading || !plan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
        <div className="animate-pulse bg-white p-8 rounded-2xl w-full max-w-lg h-60"></div>
      </div>
    );
  }

  const officeRows = [
    {
      Icon: Calendar,
      title: t("plan.numberOfMonths"),
      sub: t("plan.planDuration"),
      value: plan.numberOfMonths,
    },
    {
      Icon: Crown,
      title: t("plan.premiumAds"),
      sub: t("plan.premiumAdsSub"),
      value: plan.adCredits,
    },
    {
      Icon: Coins,
      title: t("plan.planPrice"),
      sub: t("plan.totalAmount"),
      value: plan.price,
      unit: t("currency"),
    },
  ];
  const features = [
    isDaily
      ? t("plan.featureCreditRate", { price: plan.price })
      : t("plan.featureCredits", { count: plan.adCredits }),
    t("plan.featurePinned"),
    t("plan.featureVisibility"),
    t("plan.featureCalls"),
  ];

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-xl mx-auto px-4 sm:px-6 pt-4 pb-28 sm:pb-10">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-gray-400 hover:text-primary transition-colors cursor-pointer"
        >
          <ArrowLeft
            size={16}
            className={locale === "ar" ? "rotate-180" : ""}
          />
          <span className="text-[11px] font-bold uppercase tracking-widest">
            {t("plan.back")}
          </span>
        </button>

        <h1 className="text-xl sm:text-2xl font-bold text-primary-dark text-center mt-2 mb-4">
          {locale === "ar" ? plan.nameAr : plan.name}
        </h1>

        {isDaily ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3.5 sm:p-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/5 text-primary flex items-center justify-center shrink-0">
                <Zap size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] sm:text-sm font-semibold text-primary-dark">
                  {t("plan.numberOfCredits")}
                </p>
                <p className="text-[11px] sm:text-xs text-gray-400 mb-2.5">
                  {t("plan.numberOfCreditsSub")}
                </p>
                <CreditStepper value={qty} onChange={setQty} />
                <div className="mt-2.5 rounded-lg bg-gray-50 py-2 text-center text-xs text-gray-500">
                  {t("plan.eachCreditCosts")}{" "}
                  <span className="font-bold text-primary">
                    {plan.price} {t("currency")}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 border-t border-gray-100 mt-3 pt-3">
              <div className="w-9 h-9 rounded-full bg-primary/5 text-primary flex items-center justify-center shrink-0">
                <Coins size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] sm:text-sm font-semibold text-primary-dark">
                  {t("plan.totalPrice")}
                </p>
                <p className="text-[11px] sm:text-xs text-gray-400">
                  {t("plan.amountToPay")}
                </p>
              </div>
              <p className="text-base sm:text-lg font-bold text-primary shrink-0">
                {subtotal}
                <span className="text-[10px] font-bold ms-1">{t("currency")}</span>
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-3.5 sm:px-4 divide-y divide-gray-100">
            {officeRows.map(({ Icon, title, sub, value, unit }) => (
              <div
                key={title}
                className="flex items-center gap-3 py-3"
              >
                <div className="w-9 h-9 rounded-full bg-primary/5 text-primary flex items-center justify-center shrink-0">
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] sm:text-sm font-semibold text-primary-dark">
                    {title}
                  </p>
                  <p className="text-[11px] sm:text-xs text-gray-400">{sub}</p>
                </div>
                <p className="text-base sm:text-lg font-bold text-primary shrink-0">
                  {value}
                  {unit && (
                    <span className="text-[10px] font-bold ms-1">{unit}</span>
                  )}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3.5 sm:p-4 mt-3">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-9 h-9 rounded-full bg-primary/5 text-primary flex items-center justify-center shrink-0">
              <Tag size={15} />
            </div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              {t("plan.planDescription")}
            </span>
          </div>
          <ul className="space-y-2">
            {features.map((feature) => (
              <li
                key={feature}
                className="flex items-start gap-2.5 text-[13px] text-gray-600"
              >
                <span className="w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Check size={10} strokeWidth={3} />
                </span>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <Button
          onClick={() => setModalOpen(true)}
          className="w-full mt-4 bg-primary hover:bg-primary/90 text-white font-bold h-11 rounded-lg text-sm shadow-sm active:scale-[0.99]"
        >
          {isDaily ? t("plan.buyCredits") : t("plan.subscribeNow")}
        </Button>
      </div>

      {/* ================= PAYMENT MODAL ================= */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-primary-dark">
                {t("plan.payInvoice")}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Summary Items */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-medium">
                    {t("plan.credits")}
                  </span>
                  <span className="text-primary-dark font-bold">
                    {plan.adCredits * quantity}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-medium">
                    {t("plan.amount")}
                  </span>
                  <span className="text-primary-dark font-bold">
                    {subtotal} {t("currency")}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-medium">
                    {t("plan.paymentMethod")}
                  </span>
                  <span className="text-primary-dark font-bold">
                    {t("plan.knet")}
                  </span>
                </div>
              </div>

              {/* Coupon Section */}
              <div className="pt-5 border-t border-gray-100">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  {t("plan.discountCode")}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    placeholder={t("plan.enterDiscountCode")}
                    disabled={discount !== null}
                    className="flex-1 min-w-0 text-sm border border-gray-200 rounded-xl px-4 h-12 focus:outline-none focus:border-primary bg-white text-gray-600 disabled:bg-gray-50 disabled:text-gray-400"
                  />
                  <Button
                    onClick={handleApplyDiscount}
                    disabled={discount !== null || !discountCode}
                    className="shrink-0 h-12 px-5 bg-primary rounded-xl text-sm font-bold"
                  >
                    {t("plan.apply")}
                  </Button>
                </div>
                {discount !== null && (
                  <div className="flex items-center gap-1.5 mt-2 text-[11px] font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-lg w-fit">
                    <CheckCircle size={14} />
                    <span>{t("plan.discountApplied")}</span>
                  </div>
                )}
              </div>

              {/* Total Row */}
              <div className="pt-5 border-t border-gray-100 flex justify-between items-center">
                <span className="text-base font-bold text-primary-dark">
                  {t("plan.total")}
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-primary tracking-tight">
                    {amountDue}
                  </span>
                  <span className="text-xs font-bold text-primary/60">
                    {t("currency")}
                  </span>
                </div>
              </div>
            </div>

            {/* Pay Button */}
            <div className="p-6 pt-0">
              <Button
                onClick={handlePay}
                disabled={isPaying}
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-12 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
              >
                {isPaying ? t("plan.processing") : t("plan.pay")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
