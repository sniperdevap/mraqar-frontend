"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Filter,
  Newspaper,
  Eye,
  Pencil,
  Trash,
  Play,
  RotateCw,
} from "lucide-react";
import { useTranslations, useLocale } from "@/hooks/use-locale";
import { useAdminAds } from "@/hooks/use-admin";
import { AdminFailedAds } from "./admin-failed-ads";
import { usePropertyTypes, useAreas } from "@/hooks/use-metadata";
import { AdCard } from "@/components/ads/ad-card";
import { MultiSelect } from "@/components/ui/multi-select";
import { Pagination } from "@/components/ui/pagination";
import { Loader } from "@/components/common/loader";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { updateAd, deleteAd } from "@/lib/api/ad";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Ad } from "@/types/ad";

export function AdminAds() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");
  const { locale } = useLocale();
  const isRTL = locale === "ar";

  // Filters state from URL
  const activeTab = searchParams.get("tab") || "ads";
  const page = parseInt(searchParams.get("page") || "1");
  const purpose = searchParams.get("purpose") || "all";
  const propertyType = searchParams.getAll("propertyType");
  const status = searchParams.get("status") || "all";
  const isPremium = searchParams.get("isPremium") || "all";
  const area = searchParams.getAll("area");

  const { data, isLoading } = useAdminAds({
    page,
    limit: 12,
    purpose: purpose !== "all" ? purpose : undefined,
    propertyType: propertyType.length > 0 ? propertyType.join(",") : undefined,
    status: status !== "all" ? status : undefined,
    isPremium:
      isPremium !== "all"
        ? isPremium === "premium"
          ? "true"
          : "false"
        : undefined,
    area: area.length > 0 ? area : undefined,
  });

  const { data: propertyTypes = [] } = usePropertyTypes();
  const { data: areas = [] } = useAreas();

  // Update URL params
  const updateParams = (
    newParams: Record<string, string | string[] | undefined>,
  ) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      if (
        value === undefined ||
        value === "all" ||
        (Array.isArray(value) && value.length === 0)
      ) {
        params.delete(key);
      } else if (Array.isArray(value)) {
        params.delete(key);
        value.forEach((v) => params.append(key, v));
      } else {
        params.set(key, value);
      }
    });
    // Reset to page 1 on filter change
    if (!newParams.page) params.set("page", "1");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleAction = (action: "edit" | "refresh" | "view", ad: Ad) => {
    if (action === "view") {
      router.push(`/admin/user-ad-detail/${ad._id}`);
    } else if (action === "edit") {
      router.push(`/admin/ads/edit/${ad._id}`);
    } else if (action === "refresh") {
      queryClient.invalidateQueries({ queryKey: ["admin", "ads"] });
    }
  };

  const handleToggleStatus = async (adId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "active" ? "inactive" : "active";
      await updateAd(adId, { status: newStatus });
      queryClient.invalidateQueries({ queryKey: ["admin", "ads"] });
      toast.success(
        tCommon(`ads.${newStatus === "active" ? "activated" : "stopped"}`),
      );
    } catch (error) {
      toast.error(tCommon("ads.failedToUpdate"));
    }
  };

  const handleDeleteAd = async (adId: string) => {
    try {
      await deleteAd(adId);
      queryClient.invalidateQueries({ queryKey: ["admin", "ads"] });
      toast.success(tCommon("ads.deletedSuccessfully"));
    } catch (error) {
      toast.error(tCommon("ads.failedToDelete"));
    }
  };

  const propertyTypeOptions = propertyTypes.map((pt) => ({
    label: isRTL ? pt.labelAr : pt.label,
    value: pt._id,
  }));

  const areaOptions = areas.map((a) => ({
    label: isRTL ? a.labelAr : a.label,
    value: a._id,
    governorate: isRTL ? a.governorateAr : a.governorate,
  }));

  return (
    <div className="space-y-8 py-6 lg:py-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="md:text-3xl text-xl font-bold text-gray-900 tracking-tight">
            {t("manageAds.title")}
          </h1>
          <p className="text-gray-500 text-sm md:text-md mt-1">
            {t("manageAds.description")}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex p-1 bg-gray-100/80 rounded-xl border border-gray-200/50 backdrop-blur-sm">
          <button
            onClick={() => updateParams({ tab: "ads", page: "1" })}
            className={`w-1/2 md:w-auto px-6 py-2.5 text-xs font-black uppercase tracking-widest rounded-lg transition-all duration-200 ${
              activeTab === "ads"
                ? "bg-white text-primary shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t("manageAds.tabs.ads")}
          </button>
          <button
            onClick={() => updateParams({ tab: "failed", page: "1" })}
            className={`w-1/2 md:w-auto px-6 py-2.5 text-xs font-black uppercase tracking-widest rounded-lg transition-all duration-200 ${
              activeTab === "failed"
                ? "bg-white text-primary shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t("manageAds.tabs.failed")}
          </button>
        </div>
      </div>

      {activeTab === "ads" ? (
        <>
          {/* Filters Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Filter size={18} className="text-primary" />
              <h2 className="font-semibold text-gray-900">
                {t("manageAds.filters.title")}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {/* Purpose Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {t("manageAds.filters.purpose")}
                </label>
                <Select
                  value={purpose}
                  onValueChange={(val) => updateParams({ purpose: val })}
                >
                  <SelectTrigger className="rounded-md border-gray-200 !h-11 md:!h-12">
                    <SelectValue placeholder={t("manageAds.filters.all")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {t("manageAds.filters.all")}
                    </SelectItem>
                    <SelectItem value="sale">{tCommon("ads.sale")}</SelectItem>
                    <SelectItem value="rent">{tCommon("ads.rent")}</SelectItem>
                    <SelectItem value="exchange">
                      {tCommon("ads.exchange")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Property Type Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {t("manageAds.filters.propertyType")}
                </label>
                <MultiSelect
                  options={propertyTypeOptions}
                  value={propertyType}
                  onChange={(val) => updateParams({ propertyType: val })}
                  placeholder={t("manageAds.filters.all")}
                  dir={isRTL ? "rtl" : "ltr"}
                  className="rounded-md border-gray-200 !min-h-11 md:!min-h-12"
                />
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {t("manageAds.filters.status")}
                </label>
                <Select
                  value={status}
                  onValueChange={(val) => updateParams({ status: val })}
                >
                  <SelectTrigger className="rounded-md border-gray-200 !h-11! md:!h-12">
                    <SelectValue placeholder={t("manageAds.filters.all")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {t("manageAds.filters.all")}
                    </SelectItem>
                    <SelectItem value="active">
                      {t("manageAds.filters.active")}
                    </SelectItem>
                    <SelectItem value="inactive">
                      {t("manageAds.filters.inactive")}
                    </SelectItem>
                    <SelectItem value="sold">
                      {t("manageAds.filters.sold")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Ad Type Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {t("manageAds.filters.type")}
                </label>
                <Select
                  value={isPremium}
                  onValueChange={(val) => updateParams({ isPremium: val })}
                >
                  <SelectTrigger className="rounded-md border-gray-200 !h-11! md:!h-12">
                    <SelectValue placeholder={t("manageAds.filters.all")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {t("manageAds.filters.all")}
                    </SelectItem>
                    <SelectItem value="premium">
                      {t("manageAds.filters.premium")}
                    </SelectItem>
                    <SelectItem value="normal">
                      {t("manageAds.filters.normal")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Area Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {t("manageAds.filters.area")}
                </label>
                <MultiSelect
                  options={areaOptions}
                  value={area}
                  onChange={(val) => updateParams({ area: val })}
                  placeholder={t("manageAds.filters.all")}
                  enableGrouping
                  dir={isRTL ? "rtl" : "ltr"}
                  className="rounded-md border-gray-200 !min-h-11 md:!min-h-12"
                />
              </div>
            </div>
          </div>

          {/* Ads List */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader />
              <p className="text-gray-500 animate-pulse">
                {t("manageAds.messages.loading")}
              </p>
            </div>
          ) : data?.ads && data.ads.length > 0 ? (
            <div className="space-y-8">
              {/* Desktop Table View */}
              <div className="hidden md:block bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/50">
                        <th className="text-start py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider w-20">
                          {tCommon("ads.media")}
                        </th>
                        <th className="text-start py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          {t("manageAds.filters.purpose")}
                        </th>
                        <th className="text-start py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          {t("manageAds.filters.propertyType")}
                        </th>
                        <th className="text-start py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          {t("manageAds.filters.area")}
                        </th>
                        <th className="text-start py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          {t("users.table.user")}
                        </th>
                        <th className="text-start py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          {tCommon("ads.price")}
                        </th>
                        <th className="text-start py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          {t("manageAds.filters.status")}
                        </th>
                        <th
                          className={`${isRTL ? "text-start" : "text-end"} py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider`}
                        >
                          {t("users.table.actions")}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {data.ads.map((ad) => (
                        <tr
                          key={ad._id}
                          className="hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="py-4 px-6">
                            <div className="w-16 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                              <img
                                src={
                                  ad.media && ad.media[0]
                                    ? ad.media[0].thumbnail?.startsWith("http")
                                      ? ad.media[0].thumbnail
                                      : `${process.env.NEXT_PUBLIC_IMAGE_HOST}/${ad.media[0].thumbnail || ad.media[0].url}`
                                    : "/images/aqar-logo.png"
                                }
                                alt=""
                                className="w-full h-full object-cover"
                                onError={(
                                  e: React.SyntheticEvent<
                                    HTMLImageElement,
                                    Event
                                  >,
                                ) => {
                                  e.currentTarget.src = "/images/aqar-logo.png";
                                }}
                              />
                              {ad.isPremium && (
                                <div className="absolute top-0 end-0 bg-primary text-white text-[10px] px-1 rounded-bl-md font-bold">
                                  P
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-sm text-gray-600 capitalize">
                              {tCommon(`ads.${ad.purpose}`)}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-sm text-gray-600">
                              {isRTL
                                ? ad.propertyType?.labelAr ||
                                  ad.propertyType?.label
                                : ad.propertyType?.label}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-sm text-gray-600">
                              {isRTL
                                ? ad.area?.labelAr || ad.area?.label
                                : ad.area?.label}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-sm text-gray-600">
                              {ad.user?.name || "Unknown"}
                            </span>
                          </td>
                          <td className="py-4 px-6 font-mono text-sm text-gray-600 whitespace-nowrap">
                            {ad.price?.toLocaleString()}{" "}
                            <span className="text-[10px] font-normal text-gray-500">
                              د.ك
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold
                          ${ad.status === "active" ? "bg-green-100 text-green-700" : ad.status === "inactive" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-700"}`}
                            >
                              {t(`manageAds.filters.${ad.status}`)}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div
                              className={`flex items-center ${isRTL ? "justify-start" : "justify-end"}`}
                            >
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleAction("view", ad)}
                                className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                                title={tCommon("buttons.viewMore")}
                              >
                                <Eye size={18} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleAction("edit", ad)}
                                className="h-8 w-8 text-amber-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg"
                                title={tCommon("buttons.edit")}
                              >
                                <Pencil size={18} />
                              </Button>
                              <ConfirmationDialog
                                trigger={
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className={`h-8 w-8 rounded-lg ${ad.status === "active" ? "text-cyan-500 hover:bg-cyan-50 hover:text-cyan-500" : "text-green-500 hover:bg-green-50 hover:text-green-500"}`}
                                    title={
                                      ad.status === "active"
                                        ? tCommon("ads.stopAd")
                                        : tCommon("ads.activateAd")
                                    }
                                  >
                                    {ad.status === "active" ? (
                                      <Play size={18} />
                                    ) : (
                                      <RotateCw size={18} />
                                    )}
                                  </Button>
                                }
                                icon={{
                                  src:
                                    ad.status === "active"
                                      ? "/images/icons/delete.svg"
                                      : "/images/icons/star.svg",
                                  alt:
                                    ad.status === "active"
                                      ? t("manageAds.modals.stopConfirm")
                                      : t("manageAds.modals.activateConfirm"),
                                  bgColor:
                                    ad.status === "active"
                                      ? "bg-red-100"
                                      : "bg-green-100",
                                }}
                                title={
                                  ad.status === "active"
                                    ? t("manageAds.modals.stopTitle")
                                    : t("manageAds.modals.activateTitle")
                                }
                                description={
                                  ad.status === "active"
                                    ? t("manageAds.modals.stopDescription")
                                    : t("manageAds.modals.activateDescription")
                                }
                                confirmButtonText={
                                  ad.status === "active"
                                    ? t("manageAds.modals.stopConfirm")
                                    : t("manageAds.modals.activateConfirm")
                                }
                                onConfirm={() =>
                                  handleToggleStatus(ad._id, ad.status)
                                }
                              />
                              <ConfirmationDialog
                                trigger={
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                    title={tCommon("ads.deleteAd")}
                                  >
                                    <Trash size={18} />
                                  </Button>
                                }
                                icon={{
                                  src: "/images/icons/delete.svg",
                                  alt: "Delete",
                                  bgColor: "bg-red-100",
                                }}
                                title={tCommon("ads.deleteAd")}
                                description={tCommon("ads.deleteAdConfirm")}
                                confirmButtonText={tCommon("ads.deleteAd")}
                                onConfirm={() => handleDeleteAd(ad._id)}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Card View */}
              <div className="grid grid-cols-1 gap-6 md:hidden">
                {data.ads.map((ad) => (
                  <AdCard
                    key={ad._id}
                    ad={ad}
                    variant="admin"
                    onAction={handleAction}
                  />
                ))}
              </div>

              {/* Pagination */}
              {data.totalPages > 1 && (
                <div className="flex flex-col items-center justify-center pt-8 border-t border-gray-100">
                  <Pagination
                    currentPage={page}
                    pageSize={12}
                    totalItems={data.total}
                    onPageChange={(p) => updateParams({ page: p.toString() })}
                  />
                  <p className="text-sm text-gray-500 mt-4">
                    {t("users.pagination.showing", {
                      start: (page - 1) * 12 + 1,
                      end: Math.min(page * 12, data.total),
                      total: data.total,
                    })}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-20 text-center space-y-4">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto">
                <Newspaper size={32} className="text-gray-300" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {t("manageAds.messages.notFound")}
                </h3>
                <p className="text-gray-500">
                  {t("users.messages.tryDifferentSearch")}
                </p>
              </div>
              <button
                onClick={() => router.push(window.location.pathname)}
                className="text-primary font-medium hover:underline transition-all"
              >
                {t("manageAds.filters.all")}
              </button>
            </div>
          )}
        </>
      ) : (
        <AdminFailedAds />
      )}
    </div>
  );
}
