"use client";

import React from "react";
import Image from "next/image";
import { Office } from "@/lib/api/office";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Instagram, MessageCircle } from "lucide-react";

interface OfficeCardProps {
  office: Office;
  onClick?: () => void;
}

export function OfficeCard({ office, onClick }: OfficeCardProps) {
  const t = useTranslations("office");
  const tCommon = useTranslations("plan");

  const getImageUrl = () => {
    if (office.avatar) {
      return `${process.env.NEXT_PUBLIC_IMAGE_HOST}/${office.avatar}`;
    }
    return "/images/aqar-new-logo.png";
  };

  return (
    <Card
      className="group overflow-hidden border border-gray-200 hover:border-primary/30 transition-all duration-300 hover:shadow-lg cursor-pointer bg-white p-3 sm:p-4 rounded-2xl"
      onClick={onClick}
    >
      <div className="flex flex-row-reverse gap-1 sm:gap-2 items-start">
        {/* logo Section */}
        <div className="relative w-24 h-24 sm:w-36 sm:h-36 grow-0 shrink-0 overflow-hidden  rounded-xl bg-white flex items-center justify-center">
          <Image
            src={getImageUrl()}
            alt={office.name}
            fill
            className="object-contain transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        {/* Content Section */}
        <div className="flex-1 flex flex-col text-right min-w-0 h-full justify-center">
          <div className="space-y-1 sm:space-y-2">
            {/* Office Name */}
            <h3 className="text-base sm:text-xl font-semibold text-primary-dark truncate leading-tight">
              {office.name || "اسم المكتب"}
            </h3>

            {/* Ads Count and Icons Row */}
            <div className="flex items-center justify-end gap-2 sm:gap-3 flex-wrap">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-sm sm:text-lg font-medium text-primary mr-1">
                  {office.adsCount || 0} {tCommon("ads")}
                </span>
                <span className="text-gray-300">|</span>
              </div>

              {/* Social Icons - Shown next to ads count */}
              <div className="flex items-center gap-2 sm:gap-3">
                {/* WhatsApp */}
                <a
                  href={
                    office.phoneNumber
                      ? `https://wa.me/${office.phoneNumber}`
                      : undefined
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!office.phoneNumber) {
                      e.preventDefault();
                      toast.error(
                        t("socialNotAvailable", { platform: "WhatsApp" }),
                      );
                    }
                  }}
                  className={`${office.phoneNumber ? "text-gray-500 hover:text-primary" : "text-gray-300 cursor-not-allowed"}`}
                >
                  <svg
                    stroke="currentColor"
                    fill="currentColor"
                    strokeWidth="0"
                    viewBox="0 0 448 512"
                    height="20"
                    width="20"
                    className="sm:h-7 sm:w-7"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"></path>
                  </svg>
                </a>

                {/* Instagram */}
                <a
                  href={office.instagram || undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!office.instagram) {
                      e.preventDefault();
                      toast.error(
                        t("socialNotAvailable", { platform: "Instagram" }),
                      );
                    }
                  }}
                  className={`${office.instagram ? "text-gray-500 hover:text-primary" : "text-gray-300 cursor-not-allowed"}`}
                >
                  <Instagram size={20} className="sm:h-7 sm:w-7 " />
                </a>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-base text-gray-500 line-clamp-2 sm:line-clamp-3 leading-relaxed mt-1 overflow-hidden">
              {office.description || "لا يوجد وصف متاح لهذا المكتب العقاري"}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
