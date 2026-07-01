import React from "react";
import { Mail, Phone, MapPin, Instagram } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";

export default async function AboutPage() {
  const t = await getTranslations("common.about");
  const locale = await getLocale();
  const direction = locale === "ar" ? "rtl" : "ltr";

  return (
    <div className="min-h-screen flex flex-col bg-[#f0f5f4]" dir={direction}>
      <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-2">
              {t("title")}
            </h1>
            <p className="text-gray-600 text-base sm:text-lg">
              {t("subtitle")}
            </p>
          </div>

          {/* Mr aqar Platform Section */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
            <div className="bg-primary text-white px-6 py-4">
              <h2 className="text-xl sm:text-2xl font-bold">
                {t("cardHeader")}
              </h2>
            </div>
            <div className="p-6 sm:p-8 space-y-6">
              {/* Who We Are */}
              <div>
                <h3 className="text-xl font-bold text-primary mb-3">
                  {t("whoWeAre.title")}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {t("whoWeAre.content")}
                </p>
              </div>

              {/* Our Vision */}
              <div>
                <h3 className="text-xl font-bold text-primary mb-3">
                  {t("vision.title")}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {t("vision.content")}
                </p>
              </div>

              {/* Our Mission */}
              <div>
                <h3 className="text-xl font-bold text-primary mb-3">
                  {t("mission.title")}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {t("mission.content")}
                </p>
              </div>
            </div>
          </div>

          {/* How Mr aqar Works */}
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary text-center mb-6">
              {t("howItWorks.title")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* For Property Owners */}
              <div className="bg-white rounded-lg border-2 border-gray-200 p-6 sm:p-8">
                <h3 className="text-xl font-bold text-primary text-center mb-4">
                  {t("howItWorks.owners.title")}
                </h3>
                <p className="text-gray-700 leading-relaxed text-center">
                  {t("howItWorks.owners.content")}
                </p>
              </div>

              {/* For Property Seekers */}
              <div className="bg-white rounded-lg border-2 border-gray-200 p-6 sm:p-8">
                <h3 className="text-xl font-bold text-primary text-center mb-4">
                  {t("howItWorks.seekers.title")}
                </h3>
                <p className="text-gray-700 leading-relaxed text-center">
                  {t("howItWorks.seekers.content")}
                </p>
              </div>
            </div>
          </div>

          {/* Our Services */}
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary text-center mb-6">
              {t("services.title")}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Service 1 */}
              <div className="bg-gray-100 rounded-lg p-6 text-center">
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  {t("services.sell.title")}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t("services.sell.description")}
                </p>
              </div>

              {/* Service 2 */}
              <div className="bg-gray-100 rounded-lg p-6 text-center">
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  {t("services.rent.title")}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t("services.rent.description")}
                </p>
              </div>

              {/* Service 3 */}
              <div className="bg-gray-100 rounded-lg p-6 text-center">
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  {t("services.support.title")}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t("services.support.description")}
                </p>
              </div>

              {/* Service 4 */}
              <div className="bg-gray-100 rounded-lg p-6 text-center">
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  {t("services.app.title")}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t("services.app.description")}
                </p>
              </div>
            </div>
          </div>

          {/* Contact Us Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-4">
              {t("contact.title")}
            </h2>
            <p className="text-gray-700 mb-6">{t("contact.description")}</p>
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 text-gray-700">
                <Mail className="text-primary" size={20} />
                <span className="font-medium">{t("contact.email")}:</span>
                <a
                  href="mailto:support@aqar.com"
                  className="text-primary hover:underline"
                >
                  support@aqar.com
                </a>
              </div>
              <a
                href="https://wa.me/96590078005"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-start md:justify-center gap-2 text-gray-700 hover:text-primary transition-colors"
              >
                <Phone className="text-primary" size={20} />
                <span className="font-medium">{t("contact.phone")}:</span>
                <span dir="ltr" className="hover:underline">
                  +965 90078005
                </span>
              </a>
              <a
                href="https://www.instagram.com/mr_aqar"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-start md:justify-center gap-2 text-gray-700 hover:text-primary transition-colors"
              >
                <Instagram className="text-primary" size={20} />
                <span className="font-medium">Instagram:</span>
                <span className="hover:underline">@mr_aqar</span>
              </a>
              <div className="flex items-start justify-center gap-2 text-gray-700">
                <MapPin
                  className="text-primary mt-0.5 flex-shrink-0"
                  size={20}
                />
                <div className="text-start flex flex-col md:flex-row  gap-2  ">
                  <span className="font-medium">{t("contact.address")}: </span>
                  <div>
                    <span>
                      {t("contact.addressLine1")}
                      <br />
                      {t("contact.addressLine2")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
