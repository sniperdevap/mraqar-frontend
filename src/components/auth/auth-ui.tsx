"use client";

/**
 * Shared pieces for the sign-in and sign-up cards: Kuwait phone field with a
 * +965 prefix, password field with a show/hide eye, the "or" divider and the
 * Google button (Google Identity Services, returns an ID token).
 */
import { forwardRef, useEffect, useRef, useState, type InputHTMLAttributes } from "react";
import Script from "next/script";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { googleSignin, type GoogleSigninRequest } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/store/auth-store";
import { normalizeKuwaitPhone } from "@/lib/utils/format";
import { getErrorMessage } from "@/lib/utils/api";
import type { User } from "@/types/auth";

export const fieldClass =
  "h-12 w-full rounded-xl border border-gray-300 bg-white px-3.5 text-[15px] font-semibold text-gray-900 outline-none transition placeholder:font-normal placeholder:text-gray-500 focus:border-primary focus:ring-4 focus:ring-primary/10 aria-[invalid=true]:border-red-400";

export const PhoneField = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }>(
  function PhoneField({ invalid, className = "", ...props }, ref) {
    return (
      <div className="flex gap-2" dir="ltr">
        <span className="flex h-12 shrink-0 items-center gap-1.5 rounded-xl border border-gray-300 bg-gray-50 px-3 text-[14px] font-bold text-gray-800">
          <span className="text-[11px] font-extrabold text-gray-500">KW</span>+965
        </span>
        <input
          ref={ref}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          maxLength={8}
          aria-invalid={invalid || undefined}
          className={`${fieldClass} text-start ${className}`}
          {...props}
          onChange={(e) => {
            e.target.value = e.target.value.replace(/\D/g, "").slice(0, 8);
            props.onChange?.(e);
          }}
        />
      </div>
    );
  },
);

export const PasswordField = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }>(
  function PasswordField({ invalid, ...props }, ref) {
    const [show, setShow] = useState(false);
    return (
      <div className="relative">
        <input ref={ref} type={show ? "text" : "password"} aria-invalid={invalid || undefined} className={`${fieldClass} pe-12`} {...props} />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute end-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-gray-500 hover:text-gray-800"
        >
          {show ? <EyeOff size={19} /> : <Eye size={19} />}
        </button>
      </div>
    );
  },
);

export function OrDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 text-[13px] font-semibold text-gray-500" role="separator">
      <span className="h-px flex-1 bg-gray-200" />
      {label}
      <span className="h-px flex-1 bg-gray-200" />
    </div>
  );
}

const GoogleMark = () => (
  <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.4-.4-3.5z" />
    <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
  </svg>
);

type GoogleId = {
  initialize: (o: { client_id: string; callback: (r: { credential: string }) => void; ux_mode?: string; use_fedcm_for_prompt?: boolean }) => void;
  renderButton: (el: HTMLElement, o: Record<string, unknown>) => void;
};
declare global {
  interface Window { google?: { accounts: { id: GoogleId } } }
}

/**
 * "Continue with Google". Google's own button is laid invisibly over ours so the
 * tap goes to Google (required for its sign-in popup), while the look matches the card.
 */
export function GoogleButton({ label, onCredential, locale }: { label: string; onCredential: (credential: string) => void; locale: string }) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const overlay = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const cb = useRef(onCredential);
  cb.current = onCredential;

  useEffect(() => {
    if (!clientId || !ready || !window.google || !overlay.current) return;
    window.google.accounts.id.initialize({ client_id: clientId, callback: (r) => cb.current(r.credential) });
    const width = Math.min(400, Math.round(box.current?.getBoundingClientRect().width || 320));
    window.google.accounts.id.renderButton(overlay.current, { type: "standard", theme: "outline", size: "large", shape: "pill", text: "continue_with", width, locale });
  }, [clientId, ready, locale]);

  return (
    <div ref={box} className="relative">
      {clientId && <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onReady={() => setReady(true)} />}
      <button
        type="button"
        onClick={() => { if (!clientId) toast.info(locale === "ar" ? "الدخول عبر Google سيتوفر قريبًا" : "Google sign-in is coming soon"); }}
        className="flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-gray-300 bg-white text-[14.5px] font-bold text-gray-900 transition hover:bg-gray-50 active:scale-[0.99]"
      >
        <GoogleMark />
        {label}
      </button>
      {clientId && <div ref={overlay} className="absolute inset-0 flex items-center justify-center overflow-hidden opacity-[0.011]" aria-hidden="true" />}
    </div>
  );
}

export const authCopy = (locale: string) =>
  locale === "ar"
    ? {
        or: "أو",
        google: "المتابعة بحساب Google",
        phone: "رقم الموبايل",
        password: "كلمة السر",
        needPhoneTitle: "خطوة أخيرة",
        needPhoneSub: "أدخل رقم موبايلك لإكمال إنشاء الحساب.",
        finish: "إكمال إنشاء الحساب",
      }
    : {
        or: "or",
        google: "Continue with Google",
        phone: "Mobile number",
        password: "Password",
        needPhoneTitle: "One last step",
        needPhoneSub: "Enter your mobile number to finish creating your account.",
        finish: "Finish creating account",
      };

/**
 * Google button plus the follow-up step for new accounts (Google doesn't give a
 * phone number, and every Mr Aqar account is keyed by one).
 */
export function GoogleAuth({ locale, extras }: { locale: string; extras?: () => Partial<GoogleSigninRequest> }) {
  const c = authCopy(locale);
  const setSession = useAuthStore((s) => s.setSession);
  const [pending, setPending] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);

  const finish = (token: string, user: User) => {
    setSession(token, user);
    window.location.href = user.role === "super_admin" ? "/admin" : "/";
  };
  const send = async (credential: string, phoneNumber?: string) => {
    setBusy(true);
    try {
      const r = await googleSignin({ credential, ...(extras?.() || {}), ...(phoneNumber ? { phoneNumber: normalizeKuwaitPhone(phoneNumber) } : {}) });
      if ("needsPhone" in r && r.needsPhone) { setPending(credential); return; }
      if ("token" in r) finish(r.token, r.user);
    } catch (e) {
      toast.error(getErrorMessage(e, locale === "ar" ? "تعذر الدخول عبر Google" : "Google sign-in failed"));
    } finally { setBusy(false); }
  };

  if (pending) {
    return (
      <div className="space-y-3 rounded-2xl border border-gray-200 bg-gray-50 p-4">
        <p className="text-[15px] font-extrabold text-gray-900">{c.needPhoneTitle}</p>
        <p className="text-[13.5px] text-gray-600">{c.needPhoneSub}</p>
        <PhoneField value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={c.phone} />
        <button
          type="button"
          disabled={busy || phone.length !== 8}
          onClick={() => send(pending, phone)}
          className="flex h-[52px] w-full items-center justify-center rounded-2xl bg-primary text-[15px] font-bold text-white disabled:opacity-50"
        >
          {c.finish}
        </button>
      </div>
    );
  }
  return <GoogleButton label={c.google} locale={locale} onCredential={(cred) => send(cred)} />;
}
