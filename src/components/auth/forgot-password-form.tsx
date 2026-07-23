"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useLocale } from "@/hooks/use-locale";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthTabs } from "@/components/auth/auth-tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useRouter } from "next/navigation";
import { forgotPasswordValidationSchema } from "@/lib/schemas/auth";
import { forgotPassword } from "@/lib/api/auth";
import { normalizeKuwaitPhone } from "@/lib/utils/format";

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordValidationSchema>;

export function ForgotPasswordForm() {
  const t = useTranslations("auth.forgotPassword");
  const tSignup = useTranslations("auth.signup"); // for phone label
  const { locale } = useLocale();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordValidationSchema),
    defaultValues: {
      phoneNumber: "",
    },
  });

  const handleSubmit = async (values: ForgotPasswordFormValues) => {
    setIsLoading(true);

    try {
      const formattedPhone = normalizeKuwaitPhone(values.phoneNumber);
      await forgotPassword({ phoneNumber: formattedPhone });
      toast.success(t("success"));
      form.reset();
      router.push(
        `/auth/verify?phoneNumber=${encodeURIComponent(formattedPhone)}&type=password-reset`,
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("failed"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-start md:justify-center pt-4 md:pt-6 pb-6 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg md:space-y-8 space-y-3">
        {/* Logo and Header */}
        <div className="flex flex-col items-center text-center mt-2">
          <h2 className="md:text-2xl text-xl font-bold text-gray-900 mt-4">
            {t("title")}
          </h2>
          <p className="text-gray-500 mt-2 text-center text-sm md:text-base">{t("subTitle")}</p>
        </div>

        {/* Forgot Password Card */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden md:p-8 p-4">
          <div className="-mt-4 md:-mt-8 -mx-4 md:-mx-8 mb-4">
            <AuthTabs />
          </div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-3 md:space-y-4"
            >
              {/* Phone Number Field */}
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-semibold text-sm md:text-base">
                      {tSignup("phone")}
                    </FormLabel>
                    <FormControl>
                      <div className="flex items-stretch gap-2" dir="ltr">
                        <div className="flex items-center gap-1.5 shrink-0 px-3 h-11 md:h-12 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 text-sm font-medium">
                          <span className="text-lg leading-none" aria-hidden="true">🇰🇼</span>
                          <span>+965</span>
                        </div>
                        <Input
                          dir="ltr"
                          type="text"
                          inputMode="numeric"
                          placeholder={tSignup("phonePlaceholder")}
                          className="flex-1 bg-white border-gray-200 rounded-xl h-11 md:h-12 focus:ring-primary/20 focus:border-primary transition-all"
                          {...field}
                        />
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

          {/* Back to login */}
          <div className="mt-6 text-center" >
            <Link
              href="/auth/signin"
              className="text-sm text-gray-500 hover:text-primary transition-colors flex items-center justify-center gap-2"
            >
              {locale === "ar" ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
              {t("backToLogin")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
