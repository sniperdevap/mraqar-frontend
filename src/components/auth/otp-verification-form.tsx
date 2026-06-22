"use client";

import { useState, useEffect, useContext } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import Cookies from "js-cookie";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { verifyOTP, resendOTP } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/store/auth-store";
import { InputOTP } from "@/components/ui/input-otp";
import { getErrorMessage } from "@/lib/utils/api";
import { OTPInputContext } from "input-otp";
import { cn } from "@/lib/utils";

const otpSchema = z.object({
  code: z.string().length(6, "Verification code must be 6 digits"),
});

type OTPFormValues = z.infer<typeof otpSchema>;

const Slot = (props: { index: number }) => {
  const inputOTPContext = useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext.slots[props.index];

  return (
    <div
      className={cn(
        "relative flex h-11 w-11 sm:h-14 sm:w-14 items-center justify-center rounded-lg border text-xl sm:text-2xl transition-all bg-white",
        isActive ? "border-primary z-10 ring-0 shadow-none" : "border-gray-200",
      )}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-6 w-px animate-caret-blink bg-primary duration-1000" />
        </div>
      )}
    </div>
  );
};

export function OTPVerificationForm() {
  const t = useTranslations("auth.verify");
  const router = useRouter();
  const searchParams = useSearchParams();
  const phoneNumber = searchParams.get("phoneNumber") || "";
  const type = searchParams.get("type") || "signup";
  const { isLoading, setLoading } = useAuthStore();
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const form = useForm<OTPFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      code: "",
    },
  });

  const handleSubmit = async (values: OTPFormValues) => {
    try {
      setLoading(true);
      const response = await verifyOTP({
        phoneNumber,
        code: values.code,
      });

      toast.success(t("success"));

      if (type === "password-reset") {
        router.push(`/auth/reset-password?token=${response.token}`);
      } else {
        const userWithSubs = response.user;

        Cookies.set("auth-token", response.token, { expires: 7 });
        Cookies.set("auth-user", JSON.stringify(userWithSubs), { expires: 7 });
        useAuthStore.setState({
          user: userWithSubs,
          isAuthenticated: true,
          isLoading: false,
        });

        router.refresh();

        if (userWithSubs.role === "super_admin") {
          window.location.href = "/admin";
        } else {
          window.location.href = "/";
        }
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Verification failed",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await resendOTP(phoneNumber);
      toast.success(t("codeSent"));
      setTimer(60);
    } catch (error) {
      toast.error(getErrorMessage(error || "Failed to resend code"));
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-start md:justify-center pt-4 md:pt-6 pb-6 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg md:space-y-8 space-y-3">
        <div className="flex flex-col items-center text-center">
          <Image
            src="/images/aqar-new-logo.png"
            alt="Mr aqar Logo"
            width={140}
            height={50}
            className="h-24 w-auto"
          />
          <h2 className="md:text-3xl text-2xl font-bold mt-4 text-primary">
            {t("title")}
          </h2>
          <p className="text-gray-500 mt-2 text-sm md:text-base">
            {t("subTitle")}
          </p>
        </div>

        <div className=" md:p-8 p-4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-center">
                    <FormControl>
                      <div dir="ltr" className="w-full flex justify-center">
                        <InputOTP maxLength={6} {...field}>
                          <div className="flex gap-2 sm:gap-4">
                            {[0, 1, 2, 3, 4, 5].map((index) => (
                              <Slot key={index} index={index} />
                            ))}
                          </div>
                        </InputOTP>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="text-center pt-2">
                <button
                  type="button"
                  disabled={timer > 0}
                  onClick={handleResend}
                  className={`text-base font-bold underline ${timer > 0 ? "text-gray-400 cursor-not-allowed no-underline" : "text-primary hover:text-primary/80"}`}
                >
                  {t("resend")}{" "}
                  {timer > 0 && (
                    <span className="font-normal text-gray-500 no-underline">
                      ({timer})
                    </span>
                  )}
                </button>
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting || isLoading}
                  className="w-full bg-primary hover:bg-primary/90 text-white h-12 rounded-xl text-lg font-bold shadow-lg shadow-primary/20"
                >
                  {form.formState.isSubmitting || isLoading
                    ? t("submitting")
                    : t("submit")}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
