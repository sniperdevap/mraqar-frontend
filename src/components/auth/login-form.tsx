"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { useAuthStore } from "@/lib/store/auth-store";
import { resendOTP } from "@/lib/api/auth";
import { getErrorMessage, getErrorCode } from "@/lib/utils/api";
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
        const errorMessage = getErrorMessage(
          error,
          "Your phone number is not verified. Please check your phone for verification code.",
        );
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
              Resend Now
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

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-8 px-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Compact Header */}
        <div className="flex flex-col items-center text-center">
          <Image
            src="/images/aqar-new-logo.png"
            alt="Mr aqar Logo"
            width={100}
            height={40}
            className="h-16 w-auto mb-4"
          />
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">
            {t("title")}
          </h2>
          <p className="text-gray-500 text-xs mt-1">{t("subTitle")}</p>
        </div>

        {/* Clean Login Card */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 md:p-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              {/* Phone Number Field */}
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-gray-700 font-medium text-xs uppercase tracking-wider">
                      {tSignup("phone")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        dir="ltr"
                        type="text"
                        placeholder={tSignup("phonePlaceholder")}
                        className="bg-gray-50 border-gray-100 rounded-lg h-10.5 text-sm focus:ring-primary/20 focus:border-primary transition-all"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />

              {/* Password Field */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-gray-700 font-medium text-xs uppercase tracking-wider">
                        {tSignup("password")}
                      </FormLabel>
                      <Link
                        href="/auth/forgot-password"
                        title={t("forgotPassword")}
                        className="text-primary hover:underline text-[11px] font-semibold"
                      >
                        {t("forgotPassword")}
                      </Link>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder={tSignup("passwordPlaceholder")}
                          className="bg-gray-50 border-gray-100 rounded-lg h-10.5 text-sm focus:ring-primary/20 focus:border-primary pr-10 transition-all"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className={`cursor-pointer absolute top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors ${locale === "ar" ? "left-3" : "right-3"}`}
                        >
                          {showPassword ? (
                            <Eye size={18} />
                          ) : (
                            <EyeOff size={18} />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting || isLoading}
                  className="w-full bg-primary hover:bg-primary/90 text-white h-10.5 rounded-lg text-sm font-bold shadow-md shadow-primary/10 transition-all active:scale-[0.98]"
                >
                  {form.formState.isSubmitting || isLoading
                    ? t("submitting")
                    : t("submit")}
                </Button>
              </div>
            </form>
          </Form>

          {/* Footer Link */}
          <div className="mt-6 text-center border-t border-gray-50 pt-4">
            <p className="text-gray-500 text-xs">
              {t("noAccount") || "Don't have an account?"}{" "}
              <Link
                href="/auth/signup"
                className="text-primary font-bold hover:underline"
              >
                {t("createAccount")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
