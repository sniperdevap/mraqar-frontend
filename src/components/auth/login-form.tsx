"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Phone } from "lucide-react";
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

  return (
    <div className="flex-1 flex flex-col items-center justify-start md:justify-center pt-4 md:pt-8 pb-6 px-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Compact Header */}
        <div className="flex flex-col items-center text-center">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">
            {t("title")}
          </h2>
          <p className="text-gray-500 text-xs mt-1">{t("subTitle")}</p>
        </div>

        {/* Clean Login Card */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 md:p-6">
          <div className="-mt-5 md:-mt-6 -mx-5 md:-mx-6 mb-4">
            <AuthTabs />
          </div>
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
                      <div className="relative">
                        <Input
                          dir="ltr"
                          type="text"
                          placeholder={tSignup("phonePlaceholder")}
                          className={`bg-gray-50 border-gray-100 rounded-lg h-10.5 text-sm focus:ring-primary/20 focus:border-primary transition-all ${locale === "ar" ? "pl-10" : "pr-10"}`}
                          {...field}
                        />
                        <div className={`absolute top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none ${locale === "ar" ? "left-3" : "right-3"}`}>
                          <Phone size={18} />
                        </div>
                      </div>
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
                    <FormLabel className="text-gray-700 font-medium text-xs uppercase tracking-wider">
                      {tSignup("password")}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder={tSignup("passwordPlaceholder")}
                          className={`bg-gray-50 border-gray-100 rounded-lg h-10.5 text-sm focus:ring-primary/20 focus:border-primary transition-all ${locale === "ar" ? "pl-10" : "pr-10"}`}
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
        </div>
      </div>
    </div>
  );
}
