import React from "react";
import { Mail, Phone, MapPin, Instagram } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";

export default async function CopyrightPage() {
  const t = await getTranslations("common.copyright");
  const locale = await getLocale();
  const direction = locale === "ar" ? "rtl" : "ltr";

  return (
    <div className="min-h-screen flex flex-col bg-[#f0f5f4]" dir={direction}>
      <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
              {t("title")}
            </h1>
            <p className="text-gray-600 text-base">{t("subtitle")}</p>
          </div>

          {/* Main Content Card */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
            {/* Card Header */}
            <div className="bg-primary text-white px-6 py-4">
              <h2 className="text-xl sm:text-2xl font-bold">
                {t("cardHeader")}
              </h2>
            </div>

            {/* Copyright Content */}
            <div className="p-6 sm:p-8 space-y-8">
              {/* Notice */}
              <div className="bg-gray-50 rounded-lg py-4 px-6 text-center">
                <p className="text-gray-800 font-semibold text-lg">
                  {t("sections.notice.content")}
                </p>
              </div>

              {/* Section 1 */}
              <div>
                <h3 className="text-xl font-bold text-primary mb-3">
                  {t("sections.ownership.title")}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {t("sections.ownership.content")}
                </p>
              </div>

              {/* Section 2 */}
              <div>
                <h3 className="text-xl font-bold text-primary mb-3">
                  {t("sections.restrictions.title")}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {t("sections.restrictions.content")}
                </p>
              </div>

              {/* Section 3 */}
              <div>
                <h3 className="text-xl font-bold text-primary mb-3">
                  {t("sections.permittedUse.title")}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {t("sections.permittedUse.content")}
                </p>
              </div>

              {/* Section 4 */}
              <div>
                <h3 className="text-xl font-bold text-primary mb-3">
                  {t("sections.rights.title")}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {t("sections.rights.content")}
                </p>
              </div>

              {/* Section 5 */}
              <div>
                <h3 className="text-xl font-bold text-primary mb-3">
                  {t("sections.acknowledgment.title")}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {t("sections.acknowledgment.content")}
                </p>
              </div>

              {/* Section 6 */}
              <div>
                <h3 className="text-xl font-bold text-primary mb-3">
                  {t("sections.contact.title")}
                </h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {t("sections.contact.description")}
                </p>
                <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Mail className="text-primary flex-shrink-0" size={20} />
                    <p>{t("sections.contact.email")}</p>
                  </div>
                  <a
                    href="https://wa.me/96590078005"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-gray-700 hover:text-primary transition-colors"
                  >
                    <Phone className="text-primary flex-shrink-0" size={20} />
                    <span dir="ltr">+965 90078005</span>
                  </a>
                  <a
                    href="https://www.instagram.com/mr_aqar"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-gray-700 hover:text-primary transition-colors"
                  >
                    <Instagram
                      className="text-primary flex-shrink-0"
                      size={20}
                    />
                    <p>@mr_aqar</p>
                  </a>
                  <div className="flex items-start gap-2 text-gray-700">
                    <MapPin
                      className="text-primary mt-0.5 flex-shrink-0"
                      size={20}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium mb-1">
                        {t("sections.contact.address")}:
                      </span>
                      <span>
                        {t("sections.contact.addressLine1")}
                        <br />
                        {t("sections.contact.addressLine2")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Last Updated */}
              <div className="text-center pt-6 border-t border-gray-200">
                <p className="text-gray-500 text-sm">{t("lastUpdated")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
