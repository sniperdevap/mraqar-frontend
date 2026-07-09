"use client";

import React from "react";
import Image from "next/image";
import { Office } from "@/lib/api/office";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Instagram, Phone } from "lucide-react";

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
      className="group relative overflow-hidden border border-gray-200 hover:border-primary/30 transition-all duration-300 hover:shadow-lg cursor-pointer bg-white p-4 sm:p-6 rounded-2xl flex flex-col items-center text-center gap-1"
      onClick={onClick}
    >
      {/* Social Icons - always on the physical right, vertically centered on the logo */}
      <div className="absolute right-3 top-14 sm:top-20 -translate-y-1/2 flex flex-col items-center gap-2 sm:gap-3">
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
            height="22"
            width="22"
            className="sm:h-6 sm:w-6"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"></path>
          </svg>
        </a>

        {/* Phone call */}
        <a
          href={office.phoneNumber ? `tel:${office.phoneNumber}` : undefined}
          onClick={(e) => {
            e.stopPropagation();
            if (!office.phoneNumber) {
              e.preventDefault();
              toast.error(
                t("socialNotAvailable", { platform: "Phone" }),
              );
            }
          }}
          className={`${office.phoneNumber ? "text-gray-500 hover:text-primary" : "text-gray-300 cursor-not-allowed"}`}
        >
          <Phone size={22} className="sm:h-6 sm:w-6" />
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
          <Instagram size={22} className="sm:h-6 sm:w-6" />
        </a>
      </div>

      {/* Logo */}
      <div className="w-20 h-20 sm:w-28 sm:h-28 overflow-hidden rounded-md bg-white border border-gray-100 shadow-sm">
        <div className="relative w-full h-full">
          <Image
            src={getImageUrl()}
            alt={office.name}
            fill
            className="object-contain transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </div>

      {/* Office Name */}
      <h3 className="text-base sm:text-xl font-bold text-primary-dark leading-tight mt-3">
        {office.name || "اسم المكتب"}
      </h3>

      {/* Ads Count */}
      <span className="text-xs sm:text-sm font-medium text-primary">
        {office.adsCount || 0} {tCommon("ads")}
      </span>

      {office.description && (
        <>
          <div className="w-12 border-t border-gray-300 my-1" />

          {/* Description */}
          <p className="text-xs sm:text-sm text-gray-500 line-clamp-3 sm:line-clamp-4 leading-relaxed">
            {office.description}
          </p>
        </>
      )}
    </Card>
  );
}
