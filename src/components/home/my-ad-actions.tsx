"use client";

import {
  ArrowUpToLine,
  Pencil,
  Pin,
  Play,
  RotateCw,
  Trash,
} from "lucide-react";
import { Ad } from "@/types/ad";
import { useTranslations } from "@/hooks/use-locale";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { deleteAd, repostAd, updateAd } from "@/lib/api/ad";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRoutePrefetch } from "@/hooks/use-route-prefetch";

interface MyAdActionsProps {
  ad: Ad;
  onAction?: (action: "edit" | "refresh" | "view", ad: Ad) => void;
}

export function MyAdActions({ ad, onAction }: MyAdActionsProps) {
  const t = useTranslations("common.ads");
  const tButtons = useTranslations("common.buttons");
  const queryClient = useQueryClient();
  const { prefetchNow: prefetchEditAd } = useRoutePrefetch(
    `/ads/edit/${ad.id}`,
  );

  const handleDelete = async () => {
    try {
      await deleteAd(ad.id);
      queryClient.invalidateQueries({ queryKey: ["ads"] });
      toast.success(t("deletedSuccessfully"));
      onAction?.("refresh", ad);
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error(t("failedToDelete"));
    }
  };

  const handlePremium = async () => {
    try {
      await updateAd(ad.id, { isPremium: true });
      toast.success(t("premiumSuccessfully"));
      queryClient.invalidateQueries({ queryKey: ["ads"] });
      onAction?.("refresh", ad);
    } catch (error) {
      console.error("Premium upgrade failed:", error);
      toast.error(t("failedToPremium"));
    }
  };

  const handleRepost = async () => {
    try {
      await repostAd(ad.id);
      toast.success(t("repostedSuccessfully"));
      queryClient.invalidateQueries({ queryKey: ["ads"] });
      onAction?.("refresh", ad);
    } catch (error) {
      console.error("Repost failed:", error);
      toast.error(t("failedToRepost"));
    }
  };

  const handleToggleStatus = async () => {
    const newStatus = ad.status === "active" ? "inactive" : "active";
    try {
      await updateAd(ad.id, { status: newStatus });
      toast.success(newStatus === "active" ? t("activated") : t("stopped"));
      queryClient.invalidateQueries({ queryKey: ["ads"] });
      onAction?.("refresh", ad);
    } catch (error) {
      console.error("Status update failed:", error);
      toast.error(t("failedToUpdate"));
    }
  };

  const isPremiumAd = ad.isPremium ?? ad.premiumAd;

  return (
    <div
      className="flex items-center justify-end gap-1.5 border-t border-gray-200/80 px-2.5 py-2"
      onClick={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        title={ad.status === "active" ? t("stopAd") : t("activateAd")}
        className="w-7 h-7 rounded-full bg-white border border-gray-200 text-brand-teal hover:bg-gray-50 flex items-center justify-center transition-all active:scale-95"
        onClick={handleToggleStatus}
      >
        {ad.status === "active" ? <Play size={13} /> : <RotateCw size={13} />}
      </button>

      <ConfirmationDialog
        trigger={
          <button
            type="button"
            title={t("repostAd")}
            className="w-7 h-7 rounded-full bg-white border border-gray-200 text-brand-teal hover:bg-gray-50 flex items-center justify-center transition-all active:scale-95"
          >
            <ArrowUpToLine size={13} />
          </button>
        }
        icon={{
          src: "/images/icons/repost.svg",
          alt: "Repost",
          bgColor: "bg-primary-gold-bg",
        }}
        title={t("repostAd")}
        description={t("repostAdDescription")}
        confirmButtonText={tButtons("yes")}
        cancelButtonText={tButtons("no")}
        onConfirm={handleRepost}
      />

      {!isPremiumAd && (
        <ConfirmationDialog
          trigger={
            <button
              type="button"
              title={t("featureAdTitle")}
              className="w-7 h-7 rounded-full bg-white border border-gray-200 text-brand-teal hover:bg-gray-50 flex items-center justify-center transition-all active:scale-95"
            >
              <Pin size={13} />
            </button>
          }
          icon={{
            src: "/images/icons/star.svg",
            alt: "Premium",
            bgColor: "bg-yellow-100",
          }}
          title={t("featureAdTitle")}
          description={t("featureAdDescription")}
          confirmButtonText={t("featureConfirm")}
          onConfirm={handlePremium}
        />
      )}

      <button
        type="button"
        title={t("editAd")}
        className="w-7 h-7 rounded-full bg-white border border-gray-200 text-brand-teal hover:bg-gray-50 flex items-center justify-center transition-all active:scale-95"
        onClick={() => onAction?.("edit", ad)}
        onMouseEnter={prefetchEditAd}
        onFocus={prefetchEditAd}
        onTouchStart={prefetchEditAd}
      >
        <Pencil size={13} />
      </button>

      <ConfirmationDialog
        trigger={
          <button
            type="button"
            title={t("deleteAd")}
            className="w-7 h-7 rounded-full bg-white border border-gray-200 text-red-500 hover:bg-gray-50 flex items-center justify-center transition-all active:scale-95"
          >
            <Trash size={13} />
          </button>
        }
        icon={{
          src: "/images/icons/delete.svg",
          alt: "Delete",
          bgColor: "bg-red-100",
        }}
        title={t("deleteAd")}
        description={t("cancelNote")}
        confirmButtonText={t("deleteAd")}
        cancelButtonText={tButtons("cancel")}
        onConfirm={handleDelete}
      />
    </div>
  );
}
