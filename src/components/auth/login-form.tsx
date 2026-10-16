"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, KeyRound, Phone } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { useAuthStore } from "@/lib/store/auth-store";
import { resendOTP } from "@/lib/api/auth";
import { getErrorMessage, getErrorCode } from "@/lib/utils/api";
import { AuthTabs } from "@/components/auth/auth-tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { loginValidationSchema } from "@/lib/schemas/auth";
import { useLocale } from "@/hooks/use-locale";
import { normalizeKuwaitPhone } from "@/lib/utils/format";

// Using centralized schema from auth.ts
type LoginFormValues = z.infer<typeof loginValidationSchema>;

export function LoginForm() {
  const t = useTranslations("auth.signin");
  const tSignup = useTranslations("auth.signup");
  const { locale } = useLocale();

  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { login, isLoading } = useAuthStore();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginValidationSchema),
    defaultValues: {
      phoneNumber: "",
      password: "",
    },
  });

  const handleResendOTP = async (phoneNumber: string) => {
    try {
      const formattedPhone = normalizeKuwaitPhone(phoneNumber);
      await resendOTP(formattedPhone);
      toast.success(t("verificationCodeResent"));
      router.push(
        `/auth/verify?phoneNumber=${encodeURIComponent(formattedPhone)}&type=signup`,
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("error"));
    }
  };

  const handleSubmit = async (values: LoginFormValues) => {
    try {
      const formattedPhone = normalizeKuwaitPhone(values.phoneNumber);
      const success = await login(formattedPhone, values.password);
      if (success) {
        const user = useAuthStore.getState().user;
        if (!user) {
          toast.error(t("loginFailed"));
          return;
        }

        toast.success(t("welcomeBack"));
        router.refresh(); // Invalidate Next.js client-side router cache so protected routes (e.g. /account) are not served from stale pre-login cache

        // Redirect admin to admin dashboard, regular users to home
        if (user.role === "super_admin") {
          window.location.href = "/admin";
        } else {
          window.location.href = "/";
        }
      } else {
        toast.error(t("invalidCredentials"));
      }
    } catch (error) {
      // Check if error code is EMAIL_NOT_VERIFIED
      const errorCode = getErrorCode(error);
      if (errorCode === "PHONE_NOT_VERIFIED") {
        const errorMessage = getErrorMessage(error, t("phoneNotVerified"));
        const toastId = toast.error(
          <span>
            {errorMessage}{" "}
            <button
              onClick={() => {
                toast.dismiss(toastId);
                handleResendOTP(values.phoneNumber);
              }}
              style={{
                textDecoration: "underline",
                cursor: "pointer",
                background: "none",
                border: "none",
                padding: 0,
                color: "inherit",
                font: "inherit",
                textAlign: "left",
              }}
            >
              {t("resendNow")}
            </button>
          </span>,
          {
            duration: Infinity,
          },
        );
      } else {
        toast.error(getErrorMessage(error, t("loginFailed")));
      }
    }
  };

  const inputClass = `h-13 rounded-xl border-gray-200 bg-gray-50 text-base placeholder:text-gray-400 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all ${locale === "ar" ? "pl-11" : "pr-11"}`;
  const iconSide = locale === "ar" ? "left-3.5" : "right-3.5";

  return (
    <div className="flex-1 flex flex-col items-center justify-start md:justify-center px-4 pt-6 pb-10 md:pt-10">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <span className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/[0.08] text-primary">
            <KeyRound size={26} />
          </span>
          <h1 className="text-[26px] font-bold tracking-tight text-gray-900">{t("title")}</h1>
          <p className="mt-1.5 text-[15px] text-gray-500">{t("subTitle")}</p>
        </div>

        {/* Card */}
        <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-[0_8px_30px_rgba(16,24,40,0.06)]">
          <AuthTabs />
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5 p-5 pt-6 md:p-6 md:pt-7">
              {/* Phone */}
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-[14px] font-medium text-gray-700">{tSignup("phone")}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          dir="ltr"
                          type="tel"
                          inputMode="tel"
                          autoComplete="tel"
                          placeholder={tSignup("phonePlaceholder")}
                          className={inputClass}
                          {...field}
                        />
                        <div className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-gray-400 ${iconSide}`}>
                          <Phone size={19} />
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage className="text-[13px]" />
                  </FormItem>
                )}
              />

              {/* Password */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-[14px] font-medium text-gray-700">{tSignup("password")}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          autoComplete="current-password"
                          placeholder={tSignup("passwordPlaceholder")}
                          className={inputClass}
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                          className={`absolute top-1/2 -translate-y-1/2 rounded-lg p-1 text-gray-400 transition-colors hover:text-gray-600 ${iconSide}`}
                        >
                          {showPassword ? <Eye size={19} /> : <EyeOff size={19} />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-[13px]" />
                    <div className="flex justify-end pt-0.5">
                      <Link href="/auth/forgot-password" className="text-[14px] font-medium text-primary hover:underline">
                        {t("forgotPassword")}
                      </Link>
                    </div>
                  </FormItem>
                )}
              />

              {/* Submit */}
              <Button
                type="submit"
                disabled={form.formState.isSubmitting || isLoading}
                className="h-13 w-full rounded-xl bg-[#e11d1d] text-base font-bold text-white shadow-[0_6px_18px_rgba(225,29,29,0.22)] transition-all hover:bg-[#b91616] active:scale-[0.98]"
              >
                {form.formState.isSubmitting || isLoading ? t("submitting") : t("submit")}
              </Button>

              <p className="text-center text-[14.5px] text-gray-500">
                {t("noAccount")}{" "}
                <Link href="/auth/signup" className="font-semibold text-primary hover:underline">
                  {t("createAccount")}
                </Link>
              </p>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
