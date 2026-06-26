"use client";

import { ChangeEvent, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Camera, Eye, EyeOff, Phone, Save, User } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createAdminUser, verifyAdminUser } from "@/lib/api/admin";
import { uploadMedia } from "@/lib/api/media";
import { signupValidationSchema } from "@/lib/schemas/auth";
import { getErrorCode, getErrorData, getErrorMessage } from "@/lib/utils/api";
import { normalizeKuwaitPhone } from "@/lib/utils/format";
import { useLocale, useTranslations } from "@/hooks/use-locale";

type CreateAdminUserValues = z.infer<typeof signupValidationSchema>;

interface DuplicateUnverifiedUserData {
  userId: string;
  name: string;
  phoneNumber: string;
}

export function CreateAdminUser() {
  const t = useTranslations("admin.users.create");
  const tUsers = useTranslations("admin.users");
  const { locale } = useLocale();
  const router = useRouter();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);

  const form = useForm<CreateAdminUserValues>({
    resolver: zodResolver(signupValidationSchema),
    defaultValues: {
      name: "",
      phoneNumber: "",
      password: "",
      avatar: "",
    },
  });

  const isRTL = locale === "ar";
  const isSubmitting = form.formState.isSubmitting || isAvatarUploading;
  const usersHref = `/${locale}/admin/users`;

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

  const handleVerifyExistingUser = async (userId: string) => {
    try {
      await verifyAdminUser(userId);
      await queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success(t("verifySuccess"));
      router.push(usersHref);
    } catch (error) {
      toast.error(getErrorMessage(error, t("verifyError")));
    }
  };

  const showUnverifiedDuplicateToast = (data?: DuplicateUnverifiedUserData) => {
    if (!data?.userId) {
      toast.error(t("duplicateUnverified"));
      return;
    }

    const toastId = toast.error(
      <span>
        {t("duplicateUnverified")}{" "}
        <button
          type="button"
          onClick={() => {
            toast.dismiss(toastId);
            void handleVerifyExistingUser(data.userId);
          }}
          className="font-semibold underline underline-offset-2"
        >
          {t("verifyAction")}
        </button>
      </span>,
    );
  };

  const handleSubmit = async (values: CreateAdminUserValues) => {
    try {
      if (!avatarFile) {
        form.setError("avatar", { type: "manual", message: t("profilePhotoRequired") });
        return;
      }

      setIsAvatarUploading(true);
      const uploadedAvatar = await uploadMedia(avatarFile);
      const formattedPhone = normalizeKuwaitPhone(values.phoneNumber);

      await createAdminUser({
        name: values.name,
        phoneNumber: formattedPhone,
        password: values.password,
        avatar: uploadedAvatar.url,
      });

      await queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      await queryClient.invalidateQueries({ queryKey: ["admin", "dashboard-stats"] });
      toast.success(t("success"));
      router.push(usersHref);
    } catch (error) {
      if (getErrorCode(error) === "USER_EXISTS_UNVERIFIED") {
        showUnverifiedDuplicateToast(getErrorData<DuplicateUnverifiedUserData>(error));
        return;
      }

      toast.error(getErrorMessage(error, t("error")));
    } finally {
      setIsAvatarUploading(false);
    }
  };

  return (
    <div className="space-y-6 py-4 lg:py-8" dir={isRTL ? "rtl" : "ltr"}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-start">
          <Link href={usersHref} className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary">
            <ArrowLeft size={16} className={isRTL ? "rotate-180" : ""} />
            {t("back")}
          </Link>
          <h1 className="mt-3 text-xl font-bold text-gray-900 lg:text-3xl">{t("title")}</h1>
          <p className="mt-1 text-sm text-gray-500 md:text-md">{t("description")}</p>
        </div>
      </div>

      <div className="max-w-2xl rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="avatar"
              render={() => (
                <FormItem>
                  <FormControl>
                    <div className="flex flex-col items-center gap-2">
                      <button
                        type="button"
                        onClick={() => !isSubmitting && fileInputRef.current?.click()}
                        disabled={isSubmitting}
                        className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-primary bg-gray-100 transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {avatarPreview ? (
                          <Image src={avatarPreview} alt={t("profilePhotoAlt")} fill className="object-cover" />
                        ) : (
                          <Camera size={36} className="text-primary" />
                        )}
                      </button>
                      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" disabled={isSubmitting} />
                      <button
                        type="button"
                        onClick={() => !isSubmitting && fileInputRef.current?.click()}
                        disabled={isSubmitting}
                        className="text-xs font-semibold text-gray-500 transition-colors hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {t("addProfilePhoto")}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-center text-[11px]" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-medium uppercase tracking-wider text-gray-700">{t("fullName")}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder={t("fullNamePlaceholder")}
                        className={`h-11 rounded-lg border-gray-100 bg-gray-50 text-sm transition-all focus:border-primary focus:ring-primary/20 ${isRTL ? "pl-10" : "pr-10"}`}
                        {...field}
                      />
                      <div className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-gray-400 ${isRTL ? "left-3" : "right-3"}`}>
                        <User size={18} />
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-medium uppercase tracking-wider text-gray-700">{t("phone")}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        dir="ltr"
                        type="text"
                        placeholder={t("phonePlaceholder")}
                        className={`h-11 rounded-lg border-gray-100 bg-gray-50 text-sm transition-all focus:border-primary focus:ring-primary/20 ${isRTL ? "pl-10" : "pr-10"}`}
                        {...field}
                      />
                      <div className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-gray-400 ${isRTL ? "left-3" : "right-3"}`}>
                        <Phone size={18} />
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-xs font-medium uppercase tracking-wider text-gray-700">{t("password")}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder={t("passwordPlaceholder")}
                        className={`h-11 rounded-lg border-gray-100 bg-gray-50 text-sm transition-all focus:border-primary focus:ring-primary/20 ${isRTL ? "pl-10" : "pr-10"}`}
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((value) => !value)}
                        className={`absolute top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600 ${isRTL ? "left-3" : "right-3"}`}
                      >
                        {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />

            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" asChild disabled={isSubmitting} className="hover:text-gray-600">
                <Link href={usersHref}>{tUsers("modals.cancel")}</Link>
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                <Save size={16} />
                {isSubmitting ? t("saving") : t("submit")}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
