"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, XCircle, Mail } from "lucide-react";
import { useTranslations } from "next-intl";
import { AuthInfoSection } from "@/components/auth/auth-info-section";
import { AuthFooter } from "@/components/dashboard/auth-footer";
import { Button } from "@/components/ui/button";
import Cookies from "js-cookie";
import { useAuthStore } from "@/lib/store/auth-store";

export default function VerifyEmailPage() {
  const t = useTranslations("auth.verifyEmail");
  const tInfo = useTranslations("auth.info");
  const tSignin = useTranslations("auth.signin");
  const tFooter = useTranslations("auth.footer");

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage(t("missingToken"));
      return;
    }

    const verify = async () => {
      // Logic for verification
    };

    verify();
  }, [searchParams, router, t]);

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex">
        {/* Left Section - Informational */}
        <AuthInfoSection
          title={tInfo("title")}
          subtitle={tInfo("subtitle")}
          description={tInfo("description")}
          features={[tInfo("feature1"), tInfo("feature2")]}
        />

        {/* Right Section - Verify Email Content */}
        <div className="flex-1 flex flex-col justify-between bg-white">
          {/* Main Content */}
          <div className="flex-1 flex flex-col justify-center lg:justify-start lg:mt-48 2xl:mt-20 3xl:mt-48 px-6 sm:px-12">
            <div className="mx-auto w-full max-w-md">
              {/* Logo */}
              <div className="mb-8">
                <div className="flex items-center justify-center lg:justify-start mb-8">
                  <Image
                    src="/images/aqar-new-logo.png"
                    alt="Auto Glass Logo"
                    width={160}
                    height={40}
                    className="h-24 w-auto"
                  />
                </div>
              </div>

              {/* Verification Content */}
              <div className="space-y-6">
                {status === "loading" && (
                  <div className="flex flex-col items-center justify-center py-12 space-y-6">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-primary/20 border-t-blue-primary"></div>
                      <Mail className="absolute inset-0 m-auto h-6 w-6 text-blue-primary" />
                    </div>
                    <div className="text-center space-y-2">
                      <p className="text-lg font-semibold text-primary-body">
                        {t("title")}
                      </p>
                      <p className="text-sm text-primary-body/70">
                        {t("subTitle")}
                      </p>
                    </div>
                  </div>
                )}

                {status === "success" && (
                  <div className="flex flex-col items-center justify-center py-12 space-y-6">
                    <div className="relative">
                      <div className="h-20 w-20 rounded-full bg-green-50 flex items-center justify-center border-4 border-green-100">
                        <CheckCircle2 size={40} className="text-green-600" />
                      </div>
                    </div>
                    <div className="text-center space-y-2">
                      <p className="text-lg font-semibold text-primary-body">
                        {t("success")}
                      </p>
                      <p className="text-base font-normal text-primary-body">
                        {message}
                      </p>
                    </div>
                  </div>
                )}

                {status === "error" && (
                  <div className="bg-white  rounded-xl p-4">
                    <div className="flex flex-col items-center justify-center space-y-6">
                      {/* Error Icon */}
                      <div className="relative">
                        <div className="h-20 w-20 rounded-full bg-red-50 flex items-center justify-center border-4 border-red-100">
                          <XCircle size={40} className="text-red-600" />
                        </div>
                      </div>

                      {/* Error Message */}
                      <div className="text-center space-y-3">
                        <h2 className="text-xl font-semibold text-primary-body">
                          {t("error")}
                        </h2>
                        <p className="text-base font-normal text-primary-body/70 leading-relaxed max-w-sm">
                          {message}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="w-full space-y-3 pt-2">
                        <Button
                          onClick={() => router.push("/auth/signin")}
                          className="w-full bg-blue-primary hover:bg-blue-primary/90 h-12 text-base font-semibold"
                        >
                          {tSignin("title")}
                        </Button>
                      </div>

                      {/* Help Text */}
                      <p className="text-sm font-normal text-primary-body text-center">
                        Need help?{" "}
                        <Link
                          href="#"
                          className="text-blue-primary hover:underline"
                        >
                          Contact Support
                        </Link>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <AuthFooter />
    </div>
  );
}
