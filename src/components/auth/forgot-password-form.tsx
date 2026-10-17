"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Mail, Smartphone } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { useLocale } from "@/hooks/use-locale";
import { forgotPassword } from "@/lib/api/auth";
import { normalizeKuwaitPhone } from "@/lib/utils/format";
import { getErrorMessage } from "@/lib/utils/api";
import { PhoneField, fieldClass } from "@/components/auth/auth-ui";

type Method = "phone" | "email";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Forgot password: the user picks how to get the reset code, by SMS to the
 * mobile number on the account or by email to the address on the account.
 */
export function ForgotPasswordForm() {
  const t = useTranslations("auth.forgotPassword");
  const { locale } = useLocale();
  const ar = locale === "ar";
  const router = useRouter();
  const [method, setMethod] = useState<Method>("phone");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const L = ar
    ? {
        title: "نسيت كلمة السر؟",
        sub: "اختر طريقة استلام رمز إعادة التعيين.",
        phone: "رقم الموبايل", email: "البريد الإلكتروني",
        phoneHint: "نرسل الرمز برسالة نصية إلى رقمك.",
        emailHint: "نرسل الرمز إلى بريدك المسجّل في الحساب.",
        phoneErr: "أدخل رقم الموبايل من 8 أرقام", emailErr: "أدخل بريدًا إلكترونيًا صحيحًا",
        send: "إرسال الرمز", sending: "جارٍ الإرسال…",
        sentPhone: "أرسلنا الرمز إلى رقمك", sentEmail: "أرسلنا الرمز إلى بريدك",
        noEmail: "لا يوجد حساب بهذا البريد. جرّب رقم الموبايل.",
      }
    : {
        title: "Forgot your password?",
        sub: "Choose how to get your reset code.",
        phone: "Mobile number", email: "Email",
        phoneHint: "We'll text the code to your number.",
        emailHint: "We'll email the code to the address on your account.",
        phoneErr: "Enter the 8-digit number", emailErr: "Enter a valid email address",
        send: "Send code", sending: "Sending…",
        sentPhone: "Code sent to your phone", sentEmail: "Code sent to your email",
        noEmail: "No account uses this email. Try your mobile number.",
      };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (method === "phone" && phone.length !== 8) return setError(L.phoneErr);
    const mail = email.trim().toLowerCase();
    if (method === "email" && !EMAIL_RE.test(mail)) return setError(L.emailErr);

    setBusy(true);
    try {
      if (method === "phone") {
        const phoneNumber = normalizeKuwaitPhone(phone);
        await forgotPassword({ phoneNumber });
        toast.success(L.sentPhone);
        router.push(`/auth/verify?phoneNumber=${encodeURIComponent(phoneNumber)}&type=password-reset`);
      } else {
        await forgotPassword({ email: mail });
        toast.success(L.sentEmail);
        router.push(`/auth/verify?email=${encodeURIComponent(mail)}&type=password-reset`);
      }
    } catch (err) {
      const msg = getErrorMessage(err, t("failed"));
      setError(method === "email" && /not found/i.test(msg) ? L.noEmail : msg);
    } finally {
      setBusy(false);
    }
  };

  const tab = (m: Method, label: string, icon: React.ReactNode) => (
    <button
      type="button"
      role="tab"
      aria-selected={method === m}
      onClick={() => { setMethod(m); setError(""); }}
      className={`flex h-10 items-center justify-center gap-2 rounded-lg text-[14px] font-bold transition ${method === m ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-800"}`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div className="flex flex-1 items-start justify-center bg-[#f5f6f8] px-4 pt-6 pb-12 md:items-center md:pt-10">
      <div className="w-full max-w-[460px] rounded-[28px] border border-gray-100 bg-white p-6 shadow-[0_18px_48px_rgba(16,24,40,0.08)] md:p-8">
        <h1 className="text-center text-[26px] font-extrabold text-gray-900">{L.title}</h1>
        <p className="mt-1 text-center text-[14.5px] text-gray-500">{L.sub}</p>

        <div role="tablist" className="mt-6 grid grid-cols-2 gap-1 rounded-xl bg-gray-100 p-1">
          {tab("phone", L.phone, <Smartphone size={16} />)}
          {tab("email", L.email, <Mail size={16} />)}
        </div>

        <form onSubmit={submit} className="mt-5 space-y-4" noValidate>
          <div>
            <label className="mb-1.5 block text-[13.5px] font-bold text-gray-800">{method === "phone" ? L.phone : L.email}</label>
            {method === "phone" ? (
              <PhoneField placeholder="9xxxxxxx" value={phone} onChange={(e) => setPhone(e.target.value)} invalid={!!error} autoFocus />
            ) : (
              <input
                type="email"
                dir="ltr"
                inputMode="email"
                autoComplete="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!error || undefined}
                className={`${fieldClass} text-start`}
                autoFocus
              />
            )}
            <p className={`mt-1.5 text-[12.5px] ${error ? "text-red-500" : "text-gray-500"}`}>{error || (method === "phone" ? L.phoneHint : L.emailHint)}</p>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="flex h-11 w-full items-center justify-center rounded-xl bg-primary text-[15px] font-bold text-white transition hover:brightness-95 active:scale-[0.99] disabled:opacity-60"
          >
            {busy ? L.sending : L.send}
          </button>
        </form>

        <Link href="/auth/signin" className="mt-6 flex items-center justify-center gap-1.5 text-[14.5px] font-bold text-gray-600 hover:text-primary">
          {ar ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          {t("backToLogin")}
        </Link>
      </div>
    </div>
  );
}
