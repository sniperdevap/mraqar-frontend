"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChevronLeft } from "lucide-react";
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
import { useRouter } from "next/navigation";
import { forgotPasswordValidationSchema } from "@/lib/schemas/auth";
import { forgotPassword } from "@/lib/api/auth";
import { normalizeKuwaitPhone } from "@/lib/utils/format";

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordValidationSchema>;

export function ForgotPasswordForm() {
  const t = useTranslations("auth.forgotPassword");
  const tSignup = useTranslations("auth.signup"); // for phone label
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
    <div className="flex-1 flex flex-col items-center justify-center  py-6 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg md:space-y-8 space-y-3">
        {/* Logo and Header */}
        <div className="flex flex-col items-center text-center mt-2">
          <Image
            src="/images/aqar-logo.png"
            alt="Mr aqar Logo"
            width={140}
            height={50}
            className="h-28 w-auto"
          />
          <h2 className="md:text-3xl text-2xl font-bold text-gray-900 mt-4">
            {t("title")}
          </h2>
          <p className="text-gray-500 mt-2 text-center">{t("subTitle")}</p>
        </div>

        {/* Forgot Password Card */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden md:p-8 p-4">
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
                      <Input
                        dir="ltr"
                        type="text"
                        placeholder={tSignup("phonePlaceholder")}
                        className="bg-white border-gray-200 rounded-xl h-11 md:h-12 focus:ring-primary/20 focus:border-primary"
                        {...field}
                      />
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
          <div className="mt-6 text-center">
            <Link
              href="/auth/signin"
              className="text-sm text-gray-500 hover:text-primary transition-colors flex items-center justify-center gap-2"
            >
              <ChevronLeft size={16} />
              {t("backToLogin")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
