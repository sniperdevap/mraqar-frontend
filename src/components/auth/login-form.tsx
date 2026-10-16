"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserRound } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { useAuthStore } from "@/lib/store/auth-store";
import { resendOTP } from "@/lib/api/auth";
import { getErrorMessage, getErrorCode } from "@/lib/utils/api";
import { loginValidationSchema } from "@/lib/schemas/auth";
import { useLocale } from "@/hooks/use-locale";
import { normalizeKuwaitPhone } from "@/lib/utils/format";
import { PhoneField, PasswordField, OrDivider, GoogleAuth, authCopy } from "@/components/auth/auth-ui";

type LoginFormValues = z.infer<typeof loginValidationSchema>;

export function LoginForm() {
  const t = useTranslations("auth.signin");
  const { locale } = useLocale();
  const ar = locale === "ar";
  const c = authCopy(locale);
  const router = useRouter();
  const { login, isLoading } = useAuthStore();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginValidationSchema),
    defaultValues: { phoneNumber: "", password: "" },
  });
  const { errors, isSubmitting } = form.formState;

  const handleResendOTP = async (phoneNumber: string) => {
    try {
      const formattedPhone = normalizeKuwaitPhone(phoneNumber);
      await resendOTP(formattedPhone);
      toast.success(t("verificationCodeResent"));
      router.push(`/auth/verify?phoneNumber=${encodeURIComponent(formattedPhone)}&type=signup`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("error"));
    }
  };

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const success = await login(normalizeKuwaitPhone(values.phoneNumber), values.password);
      const user = useAuthStore.getState().user;
      if (!success || !user) {
        toast.error(t("invalidCredentials"));
        return;
      }
      toast.success(t("welcomeBack"));
      router.refresh();
      window.location.href = user.role === "super_admin" ? "/admin" : "/";
    } catch (error) {
      if (getErrorCode(error) === "PHONE_NOT_VERIFIED") {
        const id = toast.error(
          <span>
            {getErrorMessage(error, t("phoneNotVerified"))}{" "}
            <button className="underline" onClick={() => { toast.dismiss(id); handleResendOTP(values.phoneNumber); }}>{t("resendNow")}</button>
          </span>,
          { duration: Infinity },
        );
      } else {
        toast.error(getErrorMessage(error, t("loginFailed")));
      }
    }
  };

  const busy = isSubmitting || isLoading;

  return (
    <div className="flex flex-1 items-start justify-center bg-[#f5f6f8] px-4 pt-6 pb-12 md:items-center md:pt-10">
      <div className="w-full max-w-[460px] rounded-[28px] border border-gray-100 bg-white p-6 shadow-[0_18px_48px_rgba(16,24,40,0.08)] md:p-8">
        <h1 className="text-center text-[28px] font-extrabold text-gray-900">{ar ? "دخول" : "Sign in"}</h1>
        <p className="mt-1 text-center text-[14.5px] text-gray-500">{ar ? "أدخل رقم موبايلك وكلمة السر." : "Enter your mobile number and password."}</p>

        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
          <div>
            <PhoneField placeholder={c.phone} invalid={!!errors.phoneNumber} {...form.register("phoneNumber")} />
            {errors.phoneNumber && <p className="mt-1.5 text-[12.5px] text-red-500">{ar ? "أدخل رقم الموبايل من 8 أرقام" : errors.phoneNumber.message}</p>}
          </div>
          <div>
            <PasswordField placeholder={c.password} autoComplete="current-password" invalid={!!errors.password} {...form.register("password")} />
            {errors.password && <p className="mt-1.5 text-[12.5px] text-red-500">{ar ? "أدخل كلمة السر" : errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={busy}
            className="flex h-[56px] w-full items-center justify-center gap-2 rounded-2xl bg-primary text-[17px] font-extrabold text-white shadow-[0_10px_24px_rgba(225,29,29,0.22)] transition hover:brightness-95 active:scale-[0.99] disabled:opacity-60"
          >
            <UserRound size={20} />
            {busy ? t("submitting") : ar ? "دخول" : "Sign in"}
          </button>
        </form>

        <div className="mt-5 space-y-5">
          <OrDivider label={c.or} />
          <GoogleAuth locale={locale} />
        </div>

        <div className="mt-6 space-y-3 text-center">
          <Link href="/auth/forgot-password" className="block text-[15px] font-bold text-primary hover:underline">
            {ar ? "نسيت كلمة السر؟" : "Forgot your password?"}
          </Link>
          <p className="text-[15px] font-semibold text-gray-600">
            {ar ? "مستخدم جديد ولا تمتلك حساب؟" : "New here?"}{" "}
            <Link href="/auth/signup" className="font-extrabold text-primary hover:underline">{ar ? "سجّل مجانًا" : "Sign up free"}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
