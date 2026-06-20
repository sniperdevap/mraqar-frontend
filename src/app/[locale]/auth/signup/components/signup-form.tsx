"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
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
import { signupValidationSchema } from "@/lib/schemas/auth";
import { useAuthStore } from "@/lib/store/auth-store";
import { useLocale } from "@/hooks/use-locale";
import { normalizeKuwaitPhone } from "@/lib/utils/format";

type SignupFormValues = z.infer<typeof signupValidationSchema>;

export function SignupForm() {
  const t = useTranslations("auth.signup");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { signup, isLoading } = useAuthStore();
  const { locale } = useLocale();

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupValidationSchema),
    defaultValues: {
      name: "",
      phoneNumber: "",
      password: "",
    },
  });

  const handleSubmit = async (values: SignupFormValues) => {
    try {
      const formattedPhone = normalizeKuwaitPhone(values.phoneNumber);
      const success = await signup({
        name: values.name,
        phoneNumber: formattedPhone,
        password: values.password,
      });

      if (success) {
        toast.success(t("success"));
        router.push(
          `/auth/verify?phoneNumber=${encodeURIComponent(formattedPhone)}&type=signup`,
        );
      } else {
        toast.error(t("error"));
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("error"));
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

        {/* Clean Signup Card */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 md:p-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              {/* Full Name Field */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-gray-700 font-medium text-xs uppercase tracking-wider">
                      {t("fullName")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder={t("fullNamePlaceholder")}
                        className="bg-gray-50 border-gray-100 rounded-lg h-10.5 text-sm focus:ring-primary/20 focus:border-primary transition-all"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />

              {/* Phone Number Field */}
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-gray-700 font-medium text-xs uppercase tracking-wider">
                      {t("phone")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        dir="ltr"
                        type="text"
                        placeholder={t("phonePlaceholder")}
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
                    <FormLabel className="text-gray-700 font-medium text-xs uppercase tracking-wider">
                      {t("password")}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder={t("passwordPlaceholder")}
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
              {t("alreadyHaveAccount") || "Already have an account?"}{" "}
              <Link
                href="/auth/signin"
                className="text-primary font-bold hover:underline"
              >
                {t("login")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
