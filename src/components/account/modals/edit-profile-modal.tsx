"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  updateProfile,
  Profile,
  UpdateProfileRequest,
} from "@/lib/api/account";
import { uploadMedia } from "@/lib/api/media";
import { toast } from "sonner";
import { Upload } from "lucide-react";

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: Profile;
  onSuccess: () => void;
}

import { useTranslations } from "next-intl";
import { getErrorMessage } from "@/lib/utils/api";

export function EditProfileModal({
  open,
  onOpenChange,
  profile,
  onSuccess,
}: EditProfileModalProps) {
  const t = useTranslations("common.account");
  const [formData, setFormData] = useState<UpdateProfileRequest>({
    name: profile.name,
    phoneNumber: profile.phoneNumber,
    avatar: profile.avatar,
    instagram: profile.instagram,
    tiktok: profile.tiktok,
    description: profile.description,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setFormData({
        name: profile.name,
        phoneNumber: profile.phoneNumber,
        avatar: profile.avatar,
        instagram: profile.instagram,
        tiktok: profile.tiktok,
        description: profile.description,
      });
      setAvatarPreview(null);
      setSelectedFile(null);
    }
  }, [open, profile]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Store file for later upload
    setSelectedFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let avatarUrl = formData.avatar;

      // Upload image if selected
      if (selectedFile) {
        try {
          const uploaded = await uploadMedia(selectedFile);
          avatarUrl = uploaded.url;
        } catch (error) {
          console.error("Failed to upload image:", error);
          toast.error("Failed to upload image");
          setIsLoading(false);
          return;
        }
      }

      // Update profile with new avatar URL (if changed) or existing data
      await updateProfile({
        ...formData,
        avatar: avatarUrl,
      });

      toast.success(t("profileUpdated"));
      onSuccess();
    } catch (error) {
      toast.error(getErrorMessage(error || "Failed to update profile"));
    } finally {
      setIsLoading(false);
    }
  };

  const displayAvatar =
    avatarPreview ||
    (formData.avatar
      ? formData.avatar.startsWith("http")
        ? formData.avatar
        : `${process.env.NEXT_PUBLIC_IMAGE_HOST || ""}/${formData.avatar}`
      : null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {t("editProfile")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200">
              {displayAvatar ? (
                <Image
                  src={displayAvatar}
                  alt="Avatar"
                  fill
                  className="object-cover"
                />
              ) : (
                <Image
                  src="/images/aqar-new-logo.png"
                  alt="Placeholder Avatar"
                  fill
                  className="object-cover"
                />
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
              disabled={isLoading}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 hover:!bg-gray-100 hover:!text-gray-700"
              disabled={isLoading}
            >
              <Upload size={18} />
              {t("uploadAvatar")}
            </Button>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              {t("fullName")}
            </label>
            <Input
              value={formData.name || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder={t("enterName")}
              required
              disabled={isLoading}
            />
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              {t("phoneNumber")}
            </label>
            <Input
              value={formData.phoneNumber || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  phoneNumber: e.target.value,
                }))
              }
              placeholder={t("enterPhoneNumber")}
              required
              disabled={isLoading}
            />
          </div>

          {/* Instagram */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              {t("instagram")}
            </label>
            <Input
              value={formData.instagram || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, instagram: e.target.value }))
              }
              placeholder={t("instagramPlaceholder")}
              disabled={isLoading}
            />
          </div>

          {/* TikTok */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              {t("tiktok")}
            </label>
            <Input
              value={formData.tiktok || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, tiktok: e.target.value }))
              }
              placeholder={t("tiktokPlaceholder")}
              disabled={isLoading}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              {t("about")}
            </label>
            <Textarea
              value={formData.description || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder={t("aboutPlaceholder")}
              rows={4}
              disabled={isLoading}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="hover:!bg-gray-100 hover:!text-gray-700"
            >
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-primary hover:bg-primary/90"
            >
              {isLoading ? t("saving") : t("saveChanges")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
