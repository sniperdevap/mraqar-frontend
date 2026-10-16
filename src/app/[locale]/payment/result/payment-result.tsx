"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { useAuthStore } from "@/lib/store/auth-store";
import { useLocale } from "@/hooks/use-locale";

type Status = "success" | "pending" | "failed" | "cancelled";

export function PaymentResult() {
  const params = useSearchParams();
  const raw = params.get("status");
  const status: Status = raw === "success" || raw === "pending" || raw === "cancelled" ? raw : "failed";
  const track = params.get("track");
  const { locale } = useLocale();
  const ar = locale === "ar";
  const refreshSubscriptions = useAuthStore((s) => s.refreshSubscriptions);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (status === "success" || status === "pending") {
      refreshSubscriptions();
      queryClient.invalidateQueries({ queryKey: ["my-subscriptions"] });
    }
  }, [status, refreshSubscriptions, queryClient]);

  const copy = {
    success: { icon: <CheckCircle2 size={34} />, tone: "bg-green-50 text-green-600", title: ar ? "تم الدفع بنجاح" : "Payment successful", body: ar ? "تم تفعيل باقتك وإضافة الرصيد إلى حسابك. يمكنك نشر إعلانك الآن." : "Your plan is active and the credits are in your account. You can post your ad now." },
    pending: { icon: <Clock size={34} />, tone: "bg-amber-50 text-amber-600", title: ar ? "الدفع قيد التأكيد" : "Payment being confirmed", body: ar ? "لم يصلنا تأكيد البنك بعد. سيُفعّل الرصيد تلقائيًا خلال دقائق عند اكتمال الدفع." : "We haven't had the bank's confirmation yet. Your credits will be added automatically within minutes." },
    cancelled: { icon: <XCircle size={34} />, tone: "bg-gray-100 text-gray-600", title: ar ? "تم إلغاء الدفع" : "Payment cancelled", body: ar ? "لم يتم خصم أي مبلغ. يمكنك المحاولة مرة أخرى متى شئت." : "Nothing was charged. You can try again any time." },
    failed: { icon: <XCircle size={34} />, tone: "bg-red-50 text-red-600", title: ar ? "لم يتم الدفع" : "Payment didn't go through", body: ar ? "لم تكتمل عملية الدفع ولم يتم تفعيل الباقة. تأكد من بيانات البطاقة أو جرّب KNET مرة أخرى." : "The payment wasn't completed and the plan isn't active. Check your card details or try KNET again." },
  }[status];

  return (
    <div className="flex flex-1 items-start justify-center bg-[#f5f6f8] px-4 pt-10 pb-16">
      <div className="w-full max-w-[460px] rounded-[28px] border border-gray-100 bg-white p-7 text-center shadow-[0_18px_48px_rgba(16,24,40,0.08)]" role="status">
        <span className={`mx-auto flex size-16 items-center justify-center rounded-full ${copy.tone}`}>{copy.icon}</span>
        <h1 className="mt-4 text-[22px] font-extrabold text-gray-900">{copy.title}</h1>
        <p className="mt-2 text-[15px] leading-7 text-gray-600">{copy.body}</p>
        {track && <p className="mt-3 text-[13px] text-gray-500" dir="ltr">{ar ? "رقم العملية" : "Reference"}: <span className="font-bold">{track}</span></p>}
        <div className="mt-6 flex flex-col gap-2.5">
          {status === "success" || status === "pending" ? (
            <>
              <Link href="/ads/create" className="flex h-12 items-center justify-center rounded-2xl bg-primary text-[15px] font-bold text-white">{ar ? "أضف إعلانك" : "Post your ad"}</Link>
              <Link href="/account?tab=ad-balance" className="flex h-12 items-center justify-center rounded-2xl bg-gray-100 text-[15px] font-bold text-gray-800">{ar ? "رصيد الإعلانات" : "Ad balance"}</Link>
            </>
          ) : (
            <>
              <Link href="/plans" className="flex h-12 items-center justify-center rounded-2xl bg-primary text-[15px] font-bold text-white">{ar ? "حاول مرة أخرى" : "Try again"}</Link>
              <Link href="/" className="flex h-12 items-center justify-center rounded-2xl bg-gray-100 text-[15px] font-bold text-gray-800">{ar ? "الرئيسية" : "Home"}</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
