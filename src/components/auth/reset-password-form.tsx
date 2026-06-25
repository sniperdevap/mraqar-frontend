"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, ChevronLeft, XCircle, Lock } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

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
import { resetPasswordValidationSchema } from "@/lib/schemas/auth";
import { verifyResetToken, resetPassword } from "@/lib/api/auth";
import { useLocale } from "@/hooks/use-locale";

type ResetPasswordFormValues = z.infer<typeof resetPasswordValidationSchema>;

export function ResetPasswordForm() {
  const t = useTranslations("auth.resetPassword");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { locale } = useLocale();
  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordValidationSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (!tokenParam) {
      setIsVerifying(false);
      setIsTokenValid(false);
      setErrorMessage(t("missingToken"));
      return;
    }

    setToken(tokenParam);

    const verifyToken = async () => {
      try {
        const response = await verifyResetToken(tokenParam);
        if (response.valid) {
          setIsTokenValid(true);
        } else {
          setIsTokenValid(false);
          setErrorMessage(t("expiredToken"));
        }
      } catch {
        setIsTokenValid(false);
        setErrorMessage(t("expiredToken"));
      } finally {
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, [searchParams]);

  const handleSubmit = async (values: ResetPasswordFormValues) => {
    if (!token) {
      toast.error(t("missingToken"));
      return;
    }

    setIsLoading(true);

    try {
      await resetPassword({
        token,
        newPassword: values.password,
      });

      toast.success(t("success"));
      form.reset();
      router.push("/auth/signin");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("failed"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center md:py-12 py-6 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg md:space-y-8 space-y-4">
        {/* Logo and Header */}
        <div className="flex flex-col items-center text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-4">
            {t("title")}
          </h2>
          <p className="text-gray-500 mt-2">{t("subTitle")}</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden md:p-8 p-4">
          {isVerifying ? (
            <div className="flex flex-col items-center justify-center md:py-8 py-4 space-y-6">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary"></div>
                <Lock className="absolute inset-0 m-auto h-6 w-6 text-primary" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-lg font-semibold text-gray-900">
                  Verifying reset link
                </p>
                <p className="text-sm text-gray-500">
                  Please wait while we verify your reset link...
                </p>
              </div>
            </div>
          ) : isTokenValid ? (
            <>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleSubmit)}
                  className="md:space-y-6 space-y-4"
                >
                  {/* New Password Field */}
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-semibold text-sm md:text-base">
                          {t("newPassword")}
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder={t("newPassword")}
                              className="bg-white border-gray-200 rounded-xl h-11 md:h-12 focus:ring-primary/20 focus:border-primary pr-12"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className={`cursor-pointer absolute top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 ${locale === "ar" ? "left-3" : "right-3"}`}
                            >
                              {showPassword ? (
                                <Eye size={20} />
                              ) : (
                                <EyeOff size={20} />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Confirm Password Field */}
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-semibold text-sm md:text-base">
                          {t("confirmPassword")}
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder={t("confirmPassword")}
                              className="bg-white border-gray-200 rounded-xl h-11 md:h-12 focus:ring-primary/20 focus:border-primary pr-12"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                              }
                              className={`cursor-pointer absolute top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 ${locale === "ar" ? "left-3" : "right-3"}`}
                            >
                              {showConfirmPassword ? (
                                <Eye size={20} />
                              ) : (
                                <EyeOff size={20} />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Submit Button */}
                  <div className="pt-2">
                    <Button
                      type="submit"
                      disabled={form.formState.isSubmitting || isLoading}
                      className="w-full bg-primary hover:bg-primary/90 text-white h-11 rounded-xl text-sm md:text-base font-medium"
                    >
                      {form.formState.isSubmitting || isLoading
                        ? t("submitting")
                        : t("submit")}
                    </Button>
                  </div>
                </form>
              </Form>

              <div className="mt-6 text-center">
                <Link
                  href="/auth/signin"
                  className="text-sm text-gray-500 hover:text-primary transition-colors flex items-center justify-center gap-2"
                >
                  <ChevronLeft size={16} />
                  {t("backToLogin")}
                </Link>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-6">
              <div className="h-20 w-20 rounded-full bg-red-50 flex items-center justify-center border-4 border-red-100">
                <XCircle size={40} className="text-red-600" />
              </div>
              <div className="text-center space-y-3">
                <h2 className="text-xl font-semibold text-gray-900">
                  Reset Link Invalid
                </h2>
                <p className="text-base text-gray-500 leading-relaxed">
                  {errorMessage}
                </p>
              </div>
              <Button
                onClick={() => router.push("/auth/signin")}
                className="w-full bg-primary hover:bg-primary/90 h-12 text-base font-semibold text-white rounded-xl"
              >
                Back to Login
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
