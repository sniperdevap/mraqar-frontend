"use client";

import { ChangeEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import Image from "next/image";
import { Building2, Camera, Info, Plus, UserRound } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { signupValidationSchema } from "@/lib/schemas/auth";
import { useAuthStore } from "@/lib/store/auth-store";
import { useLocale } from "@/hooks/use-locale";
import { normalizeKuwaitPhone } from "@/lib/utils/format";
import { uploadMedia } from "@/lib/api/media";
import { getErrorMessage } from "@/lib/utils/api";
import { PhoneField, PasswordField, OrDivider, GoogleAuth, authCopy, fieldClass } from "@/components/auth/auth-ui";

type SignupFormValues = z.infer<typeof signupValidationSchema>;

export function SignupForm() {
  const t = useTranslations("auth.signup");
  const { locale } = useLocale();
  const ar = locale === "ar";
  const c = authCopy(locale);
  const router = useRouter();
  const { signup, login, isLoading } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupValidationSchema),
    defaultValues: { accountType: "individual", userType: "personal", licenseNumber: "", name: "", phoneNumber: "", email: "", password: "", avatar: "" },
  });
  const { errors, isSubmitting } = form.formState;
  const accountType = form.watch("accountType");
  const userType = form.watch("userType");

  const L = ar
    ? {
        title: "إنشاء حساب جديد", accountType: "اختر نوع الحساب", individual: "فرد", office: "مكتب أو شركة عقارية", needsLicense: "يتطلب رقم ترخيص",
        accountInfo: "الفرد ينشر إعلاناته باسمه. المكتب أو الشركة يحصل على صفحة مكتب في دليل المكاتب.",
        role: "ما صفتك الأساسية؟", roleInfo: "تساعدنا على عرض إعلاناتك للمهتمين بالشكل الصحيح.",
        personal: "شخصي", owner: "مالك عقار", marketer: "مسوق لمكتب أو شركة",
        license: "رقم ترخيص المكتب", name: accountType === "office" ? "اسم المكتب أو الشركة" : "الاسم", email: "البريد الإلكتروني (اختياري)",
        photo: accountType === "office" ? "شعار المكتب (اختياري)" : "صورة الحساب (اختياري)", submit: "إنشاء الحساب", have: "لديك حساب بالفعل؟", signin: "سجّل الدخول",
        phoneErr: "أدخل رقم الموبايل من 8 أرقام", passErr: "6 أحرف على الأقل", req: "مطلوب",
      }
    : {
        title: "Create a new account", accountType: "Choose account type", individual: "Individual", office: "Real estate office or company", needsLicense: "Licence number required",
        accountInfo: "Individuals post ads in their own name. Offices and companies get an office page in the directory.",
        role: "What describes you best?", roleInfo: "This helps us show your ads the right way.",
        personal: "Personal", owner: "Property owner", marketer: "Marketer for an office or company",
        license: "Office licence number", name: accountType === "office" ? "Office or company name" : "Name", email: "Email (optional)",
        photo: accountType === "office" ? "Office logo (optional)" : "Profile photo (optional)", submit: "Create account", have: "Already have an account?", signin: "Sign in",
        phoneErr: "Enter the 8-digit number", passErr: "At least 6 characters", req: "Required",
      };

  const onAvatar = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return void toast.error(t("profilePhotoTypeError"));
    if (file.size > 5 * 1024 * 1024) return void toast.error(t("profilePhotoSizeError"));
    const r = new FileReader();
    r.onloadend = () => setAvatarPreview(r.result as string);
    r.readAsDataURL(file);
    setAvatarFile(file);
  };

  const onSubmit = async (v: SignupFormValues) => {
    try {
      setUploading(true);
      const avatar = avatarFile ? (await uploadMedia(avatarFile)).url : undefined;
      const phoneNumber = normalizeKuwaitPhone(v.phoneNumber);
      const ok = await signup({
        name: v.name, phoneNumber, password: v.password, avatar,
        email: v.email || undefined, accountType: v.accountType,
        userType: v.accountType === "individual" ? v.userType : undefined,
        licenseNumber: v.accountType === "office" ? v.licenseNumber : undefined,
      });
      if (!ok) return void toast.error(t("error"));
      toast.success(t("success"));
      await login(phoneNumber, v.password);
      const user = useAuthStore.getState().user;
      router.refresh();
      window.location.href = user?.role === "super_admin" ? "/admin" : "/";
    } catch (error) {
      toast.error(getErrorMessage(error, t("error")));
    } finally {
      setUploading(false);
    }
  };

  const busy = isSubmitting || isLoading || uploading;
  const typeCard = (value: "individual" | "office", label: string, icon: React.ReactNode, note?: string) => {
    const on = accountType === value;
    return (
      <button
        type="button"
        onClick={() => form.setValue("accountType", value, { shouldValidate: false })}
        aria-pressed={on}
        className={`flex min-h-[96px] flex-col items-start gap-2.5 rounded-2xl border p-3.5 text-start transition sm:flex-row sm:items-center sm:gap-3 sm:p-4 ${on ? "border-primary bg-primary/[0.05] ring-1 ring-primary" : "border-gray-200 bg-white hover:border-gray-300"}`}
      >
        <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${on ? "bg-primary text-white" : "bg-gray-100 text-gray-600"}`}>{icon}</span>
        <span className="min-w-0">
          <span className="block text-[15.5px] font-extrabold leading-6 text-gray-900">{label}</span>
          {note && <span className="mt-1 inline-block whitespace-nowrap rounded-md bg-amber-50 px-2 py-0.5 text-[11.5px] font-bold text-amber-700">{note}</span>}
        </span>
      </button>
    );
  };

  return (
    <div className="flex flex-1 items-start justify-center bg-[#f5f6f8] px-4 pt-6 pb-12 md:pt-10">
      <div className="w-full max-w-[520px] rounded-[28px] border border-gray-100 bg-white p-5 shadow-[0_18px_48px_rgba(16,24,40,0.08)] md:p-8">
        <h1 className="text-center text-[26px] font-extrabold text-gray-900 md:text-[28px]">{L.title}</h1>

        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
          <div>
            <p className="mb-2.5 flex items-center gap-1.5 text-[14.5px] font-extrabold text-gray-900">
              {L.accountType} <span className="text-primary">*</span>
              <span title={L.accountInfo} className="text-gray-400"><Info size={16} /></span>
            </p>
            <div className="grid grid-cols-2 gap-3">
              {typeCard("individual", L.individual, <UserRound size={20} />)}
              {typeCard("office", L.office, <Building2 size={20} />, L.needsLicense)}
            </div>
          </div>

          {accountType === "individual" ? (
            <fieldset className="rounded-2xl border border-gray-200 p-3">
              <legend className="flex items-center gap-1.5 px-1.5 text-[14px] font-extrabold text-gray-900">
                {L.role} <span className="text-primary">*</span>
                <span title={L.roleInfo} className="text-gray-400"><Info size={15} /></span>
              </legend>
              <div className="space-y-2">
                {(["personal", "owner", "marketer"] as const).map((k) => (
                  <label key={k} className={`flex h-12 cursor-pointer items-center gap-3 rounded-xl border px-3.5 text-[14.5px] font-bold transition ${userType === k ? "border-primary bg-primary/[0.05] text-gray-900" : "border-gray-200 text-gray-700 hover:border-gray-300"}`}>
                    <input type="radio" value={k} {...form.register("userType")} className="size-4 accent-[var(--color-primary-main,#e11d1d)]" />
                    {L[k]}
                  </label>
                ))}
              </div>
              {errors.userType && <p className="mt-1.5 text-[12.5px] text-red-500">{L.req}</p>}
            </fieldset>
          ) : (
            <div>
              <input placeholder={L.license} className={fieldClass} aria-invalid={!!errors.licenseNumber || undefined} {...form.register("licenseNumber")} />
              {errors.licenseNumber && <p className="mt-1.5 text-[12.5px] text-red-500">{L.req}</p>}
            </div>
          )}

          <div>
            <input placeholder={L.name} autoComplete="name" className={fieldClass} aria-invalid={!!errors.name || undefined} {...form.register("name")} />
            {errors.name && <p className="mt-1.5 text-[12.5px] text-red-500">{L.req}</p>}
          </div>
          <div>
            <PhoneField placeholder={c.phone} invalid={!!errors.phoneNumber} {...form.register("phoneNumber")} />
            {errors.phoneNumber && <p className="mt-1.5 text-[12.5px] text-red-500">{L.phoneErr}</p>}
          </div>
          <div>
            <input type="email" dir="ltr" placeholder={L.email} autoComplete="email" className={`${fieldClass} text-start`} aria-invalid={!!errors.email || undefined} {...form.register("email")} />
            {errors.email && <p className="mt-1.5 text-[12.5px] text-red-500">{errors.email.message}</p>}
          </div>
          <div>
            <PasswordField placeholder={c.password} autoComplete="new-password" invalid={!!errors.password} {...form.register("password")} />
            {errors.password && <p className="mt-1.5 text-[12.5px] text-red-500">{L.passErr}</p>}
          </div>

          <button type="button" onClick={() => fileInputRef.current?.click()} className="flex w-full items-center gap-3 rounded-2xl border border-dashed border-gray-300 p-2.5 text-start hover:border-primary">
            <span className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100 text-gray-500">
              {avatarPreview ? <Image src={avatarPreview} alt="" fill className="object-cover" /> : <Camera size={19} />}
            </span>
            <span className="text-[14px] font-semibold text-gray-600">{L.photo}</span>
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={onAvatar} className="hidden" />

          <button
            type="submit"
            disabled={busy}
            className="flex h-[56px] w-full items-center justify-center gap-2 rounded-2xl bg-primary text-[17px] font-extrabold text-white shadow-[0_10px_24px_rgba(225,29,29,0.22)] transition hover:brightness-95 active:scale-[0.99] disabled:opacity-60"
          >
            <Plus size={20} strokeWidth={2.6} />
            {busy ? t("submitting") : L.submit}
          </button>
        </form>

        <div className="mt-5 space-y-5">
          <OrDivider label={c.or} />
          <GoogleAuth
            locale={locale}
            extras={() => {
              const v = form.getValues();
              return {
                name: v.name || undefined,
                accountType: v.accountType,
                userType: v.accountType === "individual" ? v.userType : undefined,
                licenseNumber: v.accountType === "office" ? v.licenseNumber : undefined,
              };
            }}
          />
        </div>

        <p className="mt-6 text-center text-[15px] font-semibold text-gray-600">
          {L.have} <Link href="/auth/signin" className="font-extrabold text-primary hover:underline">{L.signin}</Link>
        </p>
      </div>
    </div>
  );
}
