"use client";

import { ChangeEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, Camera, User, Phone } from "lucide-react";
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
import { AuthTabs } from "@/components/auth/auth-tabs";
import { useAuthStore } from "@/lib/store/auth-store";
import { useLocale } from "@/hooks/use-locale";
import { normalizeKuwaitPhone } from "@/lib/utils/format";
import { uploadMedia } from "@/lib/api/media";

type SignupFormValues = z.infer<typeof signupValidationSchema>;

export function SignupForm() {
  const t = useTranslations("auth.signup");
  const [showPassword, setShowPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { signup, isLoading } = useAuthStore();
  const { locale } = useLocale();

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupValidationSchema),
    defaultValues: {
      name: "",
      phoneNumber: "",
      password: "",
      avatar: "",
    },
  });

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error(t("profilePhotoTypeError"));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t("profilePhotoSizeError"));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setAvatarFile(file);
    form.setValue("avatar", file.name, { shouldValidate: true });
    form.clearErrors("avatar");
    event.target.value = "";
  };

  const handleSubmit = async (values: SignupFormValues) => {
    try {
      if (!avatarFile) {
        form.setError("avatar", { type: "manual", message: t("profilePhotoRequired") });
        return;
      }

      setIsAvatarUploading(true);
      const uploadedAvatar = await uploadMedia(avatarFile);

      const formattedPhone = normalizeKuwaitPhone(values.phoneNumber);
      const success = await signup({
        name: values.name,
        phoneNumber: formattedPhone,
        password: values.password,
        avatar: uploadedAvatar.url,
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
    } finally {
      setIsAvatarUploading(false);
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

        {/* Clean Signup Card */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 md:p-6">
          <div className="-mt-5 md:-mt-6 -mx-5 md:-mx-6 mb-4">
            <AuthTabs />
          </div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="avatar"
                render={() => (
                  <FormItem className="space-y-2">
                    <FormControl>
                      <div className="flex flex-col items-center gap-2">
                        <div
                          onClick={() => !isLoading && !isAvatarUploading && fileInputRef.current?.click()}
                          className={`relative w-24 h-24 rounded-full overflow-hidden border-2 border-primary cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center ${avatarPreview ? "bg-gray-100" : "bg-gray-100"
                            }`}
                        >
                          {avatarPreview ? (
                            <Image src={avatarPreview} alt={t("profilePhotoAlt")} fill className="object-cover" />
                          ) : (
                            <Camera size={36} className="!text-primary" />
                          )}
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                          disabled={isLoading || isAvatarUploading}
                        />
                        <p
                          onClick={() => !isLoading && !isAvatarUploading && fileInputRef.current?.click()}
                          className="mt-1 text-xs font-semibold text-gray-500 cursor-pointer hover:text-primary transition-colors"
                        >
                          {t("addProfilePhoto")}
                        </p>
                      </div>
                    </FormControl>
                    <FormMessage className="text-center text-[11px]" />
                  </FormItem>
                )}
              />

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
                      <div className="relative">
                        <Input
                          type="text"
                          placeholder={t("fullNamePlaceholder")}
                          className={`bg-gray-50 border-gray-100 rounded-lg h-10.5 text-sm focus:ring-primary/20 focus:border-primary transition-all ${locale === "ar" ? "pl-10" : "pr-10"}`}
                          {...field}
                        />
                        <div className={`absolute top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none ${locale === "ar" ? "left-3" : "right-3"}`}>
                          <User size={18} />
                        </div>
                      </div>
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
                      <div className="relative">
                        <Input
                          dir="ltr"
                          type="text"
                          placeholder={t("phonePlaceholder")}
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
                      {t("password")}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder={t("passwordPlaceholder")}
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
                  disabled={form.formState.isSubmitting || isLoading || isAvatarUploading}
                  className="w-full bg-primary hover:bg-primary/90 text-white h-10.5 rounded-lg text-sm font-bold shadow-md shadow-primary/10 transition-all active:scale-[0.98]"
                >
                  {form.formState.isSubmitting || isLoading || isAvatarUploading
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
