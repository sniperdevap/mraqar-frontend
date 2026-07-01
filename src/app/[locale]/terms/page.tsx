import React from "react";
import { Mail, Phone, MapPin, Instagram } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";

export default async function TermsPage() {
  const t = await getTranslations("common.terms");
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

            {/* Terms Content */}
            <div className="p-6 sm:p-8 space-y-8">
              {/* Section 1 */}
              <div>
                <h3 className="text-xl font-bold text-primary mb-3">
                  {t("sections.acceptance.title")}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {t("sections.acceptance.content")}
                </p>
              </div>

              {/* Section 2 */}
              <div>
                <h3 className="text-xl font-bold text-primary mb-3">
                  {t("sections.definitions.title")}
                </h3>
                <div className="text-gray-700 leading-relaxed space-y-2">
                  <p>{t("sections.definitions.service")}</p>
                  <p>{t("sections.definitions.user")}</p>
                  <p>{t("sections.definitions.content")}</p>
                  <p>{t("sections.definitions.account")}</p>
                </div>
              </div>

              {/* Section 3 */}
              <div>
                <h3 className="text-xl font-bold text-primary mb-3">
                  {t("sections.eligibility.title")}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {t("sections.eligibility.description")}
                </p>
                <ul className="list-disc list-inside text-gray-700 leading-relaxed mt-2 space-y-1">
                  {(t.raw("sections.eligibility.items") as string[]).map(
                    (item, idx) => (
                      <li key={idx}>{item}</li>
                    ),
                  )}
                </ul>
              </div>

              {/* Section 4 */}
              <div>
                <h3 className="text-xl font-bold text-primary mb-3">
                  {t("sections.registration.title")}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {t("sections.registration.description")}
                </p>
                <ul className="list-disc list-inside text-gray-700 leading-relaxed mt-2 space-y-1">
                  {(t.raw("sections.registration.items") as string[]).map(
                    (item, idx) => (
                      <li key={idx}>{item}</li>
                    ),
                  )}
                </ul>
              </div>

              {/* Section 5 */}
              <div>
                <h3 className="text-xl font-bold text-primary mb-3">
                  {t("sections.use.title")}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {t("sections.use.description")}
                </p>
                <ul className="list-disc list-inside text-gray-700 leading-relaxed mt-2 space-y-1">
                  {(t.raw("sections.use.items") as string[]).map(
                    (item, idx) => (
                      <li key={idx}>{item}</li>
                    ),
                  )}
                </ul>
              </div>

              {/* Section 6 */}
              <div>
                <h3 className="text-xl font-bold text-primary mb-3">
                  {t("sections.property.title")}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {t("sections.property.content")}
                </p>
              </div>

              {/* Section 7 */}
              <div>
                <h3 className="text-xl font-bold text-primary mb-3">
                  {t("sections.user_content.title")}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {t("sections.user_content.description")}
                </p>
                <ul className="list-disc list-inside text-gray-700 leading-relaxed mt-2 space-y-1">
                  {(t.raw("sections.user_content.items") as string[]).map(
                    (item, idx) => (
                      <li key={idx}>{item}</li>
                    ),
                  )}
                </ul>
              </div>

              {/* Section 8 */}
              <div>
                <h3 className="text-xl font-bold text-primary mb-3">
                  {t("sections.transactions.title")}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {t("sections.transactions.content")}
                </p>
              </div>

              {/* Section 9 */}
              <div>
                <h3 className="text-xl font-bold text-primary mb-3">
                  {t("sections.paid_services.title")}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {t("sections.paid_services.description")}
                </p>
                <ul className="list-disc list-inside text-gray-700 leading-relaxed mt-2 space-y-1">
                  {(t.raw("sections.paid_services.items") as string[]).map(
                    (item, idx) => (
                      <li key={idx}>{item}</li>
                    ),
                  )}
                </ul>
              </div>

              {/* Section 10 */}
              <div>
                <h3 className="text-xl font-bold text-primary mb-3">
                  {t("sections.termination.title")}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {t("sections.termination.content")}
                </p>
              </div>

              {/* Section 11 */}
              <div>
                <h3 className="text-xl font-bold text-primary mb-3">
                  {t("sections.disclaimer.title")}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {t("sections.disclaimer.content")}
                </p>
              </div>

              {/* Section 12 */}
              <div>
                <h3 className="text-xl font-bold text-primary mb-3">
                  {t("sections.limitation.title")}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {t("sections.limitation.content")}
                </p>
              </div>

              {/* Section 13 */}
              <div>
                <h3 className="text-xl font-bold text-primary mb-3">
                  {t("sections.compensation.title")}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {t("sections.compensation.content")}
                </p>
              </div>

              {/* Section 14 */}
              <div>
                <h3 className="text-xl font-bold text-primary mb-3">
                  {t("sections.law.title")}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {t("sections.law.content")}
                </p>
              </div>

              {/* Section 15 */}
              <div>
                <h3 className="text-xl font-bold text-primary mb-3">
                  {t("sections.amendments.title")}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {t("sections.amendments.content")}
                </p>
              </div>

              {/* Section 16 */}
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
