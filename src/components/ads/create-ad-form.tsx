"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Eye, EyeOff, Loader2, Upload, Check } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "@/hooks/use-locale";

import { useAuthStore } from "@/lib/store/auth-store";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MultiSelect } from "@/components/ui/multi-select";

import { createAd, updateAd } from "@/lib/api/ad";
import { uploadMediaMultipart } from "@/lib/api/media";
import { usePropertyTypes, useAreas } from "@/hooks/use-metadata";
import { ErrorSlot } from "../common/error";
import { Ad, Media } from "@/types/ad";
import { getErrorMessage, getErrorCode } from "@/lib/utils/api";
import { formatFileSize, normalizeKuwaitPhone } from "@/lib/utils/format";
import { formatDisplayPhone } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import imageCompression from "browser-image-compression";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { getRemainingAdCredits } from "@/lib/api/subscription-plan";

interface MediaItem {
  id: string;
  url: string;
  file?: File;
  type: "image" | "video";
  thumbnail?: string;
}

interface SortableMediaItemProps {
  item: MediaItem;
  isUploading: boolean;
  uploadProgress: number;
  onRemove: (id: string) => void;
  formatFileSize: (size: number) => string;
}

function SortableMediaItem({
  item,
  isUploading,
  uploadProgress,
  onRemove,
  formatFileSize,
}: SortableMediaItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });
  const isFileCompleted = Boolean(item.file) && uploadProgress >= 100;
  const isFileUploading = Boolean(item.file) && isUploading && !isFileCompleted;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-black group touch-none"
    >
      <div
        {...attributes}
        {...listeners}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        {isFileUploading && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
            <div className="flex flex-col items-center">
              <div className="md:w-12 md:h-12 w-6 h-6 rounded-full border-4 border-gray-600 border-t-white animate-spin mb-2"></div>
              <span className="text-white font-bold text-xs md:text-sm">
                {uploadProgress || 0}%
              </span>
            </div>
          </div>
        )}
        {isUploading && isFileCompleted && (
          <>
            <div
              aria-hidden
              className="absolute left-0 top-0 z-20 h-0 w-0 border-r-[28px] border-t-[28px] border-r-transparent border-t-emerald-500"
            />
            <div
              aria-label="Upload completed"
              className="absolute left-0.5 top-0.5 z-30 text-white"
            >
              <Check className="h-3.5 w-3.5" />
            </div>
          </>
        )}
        {item.type === "video" ? (
          item.thumbnail ? (
            <img
              src={item.thumbnail}
              alt="Video thumbnail"
              className="w-full h-full object-cover"
            />
          ) : (
            <video src={item.url} className="w-full h-full object-cover" />
          )
        ) : (
          <img
            src={item.url}
            alt="Listing"
            className="w-full h-full object-cover"
          />
        )}

        {/* File Size Overlay */}
        {item.file && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] py-0.5 px-1 text-center opacity-0 group-hover:opacity-100 transition-opacity">
            {formatFileSize(item.file.size)}
          </div>
        )}
      </div>

      <button
        type="button"
        disabled={isUploading}
        onClick={() => onRemove(item.id)}
        className="cursor-pointer absolute md:top-1 md:right-1 top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors z-30 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <Plus className="md:w-4 md:h-4 w-3 h-3 rotate-45" />
      </button>

      {/* Drag indicator */}
      <div className="absolute top-1 left-1 bg-black/30 rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
          <path d="M7 7h10v2H7zm0 4h10v2H7zm0 4h10v2H7z" />
        </svg>
      </div>
    </div>
  );
}

interface CreateAdFormProps {
  initialData?: Ad;
  mode?: "create" | "edit";
  onSuccess?: () => void;
}

export function CreateAdForm({
  initialData,
  mode = "create",
  onSuccess,
}: CreateAdFormProps) {
  const t = useTranslations("common");
  const queryClient = useQueryClient();
  const tAds = useTranslations("common.ads");
  const { locale } = useLocale();
  const router = useRouter();
  const { refreshSubscriptions, user } = useAuthStore();
  const { data: propertyTypesData, isLoading: propertyTypesLoading } =
    usePropertyTypes();
  const { data: areasData, isLoading: areasLoading } = useAreas();
  const propertyTypes = propertyTypesData || [];
  const areas = areasData || [];
  const isLoadingMetadata = propertyTypesLoading || areasLoading;
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<number, number>>(
    {},
  );
  const [remainingCredits, setRemainingCredits] = useState<number | null>(null);

  const createAdSchema = z.object({
    purpose: z.enum(["sale", "rent", "exchange"]),
    propertyType: z.string().min(1, t("ads.propertyTypeRequired")),
    area: z.string().min(1, t("ads.areaRequired")),
    price: z.coerce.number().optional(),
    phoneNumber: z.string().min(1, t("ads.phoneNumberMin")),
    isPhoneHidden: z.boolean().default(false),
    alternativePhoneNumber: z
      .string()
      .optional()
      .refine((val) => !val || /^[0-9]{8}$/.test(val), {
        message: t("ads.phoneNumberMin"), // Or a more specific "Must be 8 digits" translation if available
      }),
    premiumAd: z.boolean().default(false),
    description: z.string().min(1, t("ads.descriptionRequired")),
    media: z.array(z.string()),
  });

  type CreateAdValues = z.infer<typeof createAdSchema>;

  // Initialize media items from initialData or empty
  const imageHost = (process.env.NEXT_PUBLIC_IMAGE_HOST || "").replace(
    /\/+$/,
    "",
  );

  const getFullUrl = (path?: string) => {
    if (!path) return "";
    if (path.startsWith("http") || path.startsWith("blob:")) return path;
    return `${imageHost}/${path}`;
  };

  const [mediaItems, setMediaItems] = useState<MediaItem[]>(() => {
    if (initialData?.media) {
      return initialData.media.map((m) => ({
        id:
          m._id ||
          (m as Media & { id?: string }).id ||
          Math.random().toString(36).substr(2, 9),
        url: getFullUrl(m.url),
        type: m.type,
        thumbnail: getFullUrl(m.thumbnail),
      }));
    }
    return [];
  });
  const mediaItemsRef = useRef(mediaItems);

  useEffect(() => {
    mediaItemsRef.current = mediaItems;
  }, [mediaItems]);

  const setFileProgress = (index: number, progress: number) => {
    const normalized = Math.max(0, Math.min(100, Math.round(progress)));
    setUploadProgress((prev) => ({
      ...prev,
      [index]: Math.max(prev[index] ?? 0, normalized),
    }));
  };

  const overallUploadProgress = useMemo(() => {
    const uploadableItems = mediaItems.filter((item) => item.file);
    if (uploadableItems.length === 0) return 0;

    const totalSize = uploadableItems.reduce(
      (sum, item) => sum + (item.file?.size || 0),
      0,
    );
    if (totalSize === 0) return 0;

    const uploadedBytes = mediaItems.reduce((sum, item, index) => {
      if (!item.file) return sum;
      const progress = uploadProgress[index] ?? 0;
      return sum + (item.file.size * progress) / 100;
    }, 0);

    return Math.min(100, Math.round((uploadedBytes / totalSize) * 100));
  }, [mediaItems, uploadProgress]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setMediaItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newArr = arrayMove(items, oldIndex, newIndex);

        // Update form value
        form.setValue(
          "media",
          newArr.map((item) => (item.file ? item.id : item.id)),
        );

        return newArr;
      });
    }
  };

  const form = useForm({
    resolver: zodResolver(createAdSchema),
    defaultValues: {
      purpose: initialData?.purpose || "rent",
      isPhoneHidden: initialData?.isPhoneHidden || false,
      premiumAd: initialData?.premiumAd || initialData?.isPremium || false,
      media: initialData?.media?.map((m) => m._id) || [],
      propertyType: initialData?.propertyType?._id || "",
      area: initialData?.area?._id || "",
      phoneNumber:
        formatDisplayPhone(initialData?.phoneNumber) ||
        formatDisplayPhone(user?.phoneNumber) ||
        "",
      price: initialData?.price || 0,
      description: initialData?.description || "",
      alternativePhoneNumber: initialData?.alternativePhoneNumber
        ? formatDisplayPhone(initialData.alternativePhoneNumber)
        : "",
    },
  });

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      mediaItemsRef.current.forEach((item) => {
        if (item.url.startsWith("blob:")) {
          URL.revokeObjectURL(item.url);
        }
      });
    };
  }, []);

  useEffect(() => {
    if (mode !== "create") return;

    let isMounted = true;
    getRemainingAdCredits()
      .then((data) => {
        if (isMounted) setRemainingCredits(data.totalCredits);
      })
      .catch(() => {
        if (isMounted) setRemainingCredits(null);
      });

    return () => {
      isMounted = false;
    };
  }, [mode]);

  // Generate a thumbnail from a video file by capturing the first frame
  const generateVideoThumbnail = (videoUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.muted = true;
      video.playsInline = true;
      video.preload = "auto";
      // Do NOT set crossOrigin for blob: URLs — it breaks Safari

      // Timeout fallback in case events never fire (e.g. unsupported codec)
      const timeout = setTimeout(() => {
        cleanup();
        resolve("");
      }, 5000);

      const cleanup = () => {
        clearTimeout(timeout);
        video.pause();
        video.removeAttribute("src");
        video.load();
      };

      const captureFrame = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth || 320;
          canvas.height = video.videoHeight || 240;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const thumbnailUrl = canvas.toDataURL("image/jpeg", 0.7);
            cleanup();
            resolve(thumbnailUrl);
          } else {
            cleanup();
            resolve("");
          }
        } catch {
          cleanup();
          resolve("");
        }
      };

      video.onloadedmetadata = () => {
        // Seek to a small offset to avoid black first frames
        video.currentTime = 0.1;
      };

      video.onseeked = () => {
        // Use rAF to ensure Safari has actually rendered the frame
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            captureFrame();
          });
        });
      };

      // Safari fallback: if onseeked doesn't fire, try capturing on play
      video.onplaying = () => {
        if (video.currentTime > 0) {
          requestAnimationFrame(() => {
            captureFrame();
          });
        }
      };

      video.onerror = () => {
        cleanup();
        resolve("");
      };

      video.src = videoUrl;
      // Force Safari to load the video by briefly playing it
      const playPromise = video.play();
      if (playPromise) {
        playPromise.catch(() => {
          // Autoplay blocked — rely on loadedmetadata + seek path instead
        });
      }
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files);

    const allowedItems: MediaItem[] = [];

    const MAX_IMAGE_SIZE = 100 * 1024 * 1024; // 100MB
    const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500MB

    for (const file of newFiles) {
      const type = file.type || "";
      const name = file.name?.toLowerCase() || "";

      const isImage =
        type.startsWith("image/") ||
        /\.(jpg|jpeg|png|gif|webp|heic|heif)$/i.test(name);
      const isVideo =
        type.startsWith("video/") ||
        /\.(mp4|webm|ogg|mov|hevc|m4v)$/i.test(name);

      if (isImage) {
        if (file.size > MAX_IMAGE_SIZE) {
          toast.error(t("ads.imageSizeError"));
          continue;
        }
        allowedItems.push({
          id: Math.random().toString(36).substr(2, 9),
          url: URL.createObjectURL(file),
          file,
          type: "image",
        });
      } else if (isVideo) {
        if (file.size > MAX_VIDEO_SIZE) {
          toast.error(t("ads.videoSizeError"));
          continue;
        }

        const videoUrl = URL.createObjectURL(file);
        try {
          const thumbnail = await generateVideoThumbnail(videoUrl);
          allowedItems.push({
            id: Math.random().toString(36).substr(2, 9),
            url: videoUrl,
            file,
            type: "video",
            thumbnail: thumbnail || undefined,
          });
        } catch (err) {
          console.error("Thumbnail generation failed:", err);
          allowedItems.push({
            id: Math.random().toString(36).substr(2, 9),
            url: videoUrl,
            file,
            type: "video",
          });
        }
      } else {
        toast.error(t("ads.invalidFileType"));
      }
    }

    if (allowedItems.length > 0) {
      const updatedMediaItems = [...mediaItems, ...allowedItems];
      setMediaItems(updatedMediaItems);

      // Trigger validation
      form.setValue(
        "media",
        updatedMediaItems.map((item) => item.id || item.url),
      );
      form.trigger("media");
    }

    e.target.value = "";
  };

  const removeImage = (id: string) => {
    const itemToRemove = mediaItems.find((item) => item.id === id);
    if (itemToRemove?.url.startsWith("blob:")) {
      URL.revokeObjectURL(itemToRemove.url);
    }

    const updatedMediaItems = mediaItems.filter((item) => item.id !== id);
    setMediaItems(updatedMediaItems);

    form.setValue(
      "media",
      updatedMediaItems.map((item) => item.id || item.url),
    );
    form.trigger("media");
  };

  const onSubmit = async (values: CreateAdValues) => {
    setIsUploading(true);
    setUploadProgress({});

    try {
      // 1. Upload new files (items with file property) and keep existing IDs
      const uploadPromises = mediaItems.map(async (item, index) => {
        if (item.file) {
          try {
            setFileProgress(index, 5);
            let fileToUpload = item.file;

            // Compress image before uploading
            if (item.type === "image") {
              const options = {
                maxSizeMB: 1,
                maxWidthOrHeight: 1920,
                useWebWorker: true,
              };
              try {
                fileToUpload = await imageCompression(item.file, options);
                setFileProgress(index, 20);
              } catch (error) {
                console.error("Error compressing image:", error);
                // Fallback to original file if compression fails
                setFileProgress(index, 10);
              }
            }

            const mediaDoc = await uploadMediaMultipart(fileToUpload, {
              mediaType: item.type,
              thumbnailDataUrl:
                item.type === "video" && item.thumbnail?.startsWith("data:")
                  ? item.thumbnail
                  : undefined,
              onProgress: (progress) => {
                const baseProgress = item.type === "image" ? 20 : 5;
                const scaledProgress =
                  baseProgress + (progress * (100 - baseProgress)) / 100;
                setFileProgress(index, scaledProgress);
              },
            });

            // The backend returns a Media document inside an ApiResponse wrapper
            const response = mediaDoc as unknown as Record<string, unknown>;
            const data = (response.data as Record<string, unknown>) || response;
            const mediaId =
              (data._id as string) ||
              (data.id as string) ||
              (response._id as string) ||
              (response.id as string);

            if (!mediaId) {
              console.error(
                "Upload succeeded but no media ID was found in response:",
                mediaDoc,
              );
              throw new Error("Failed to get media ID from server");
            }

            setFileProgress(index, 100);
            return mediaId;
          } catch (err) {
            console.log(err);
            console.error(`Failed to upload file ${index}`, err);
            throw err;
          }
        }
        return item.id; // Use existing media ID from database
      });

      const finalMediaIds = await Promise.all(uploadPromises);

      // Destructure to explicitly remove 'images' if it exists in values
      // and ensure we only send what's defined in the schema
      const { ...restValues } = values;
      // If 'images' exists in values (somehow), it will be removed by not spreading it or explicitly deleting it.
      const cleanedValues = { ...restValues };
      if ("images" in cleanedValues) {
        delete (cleanedValues as Record<string, unknown>).images;
      }

      const adData = {
        ...cleanedValues,
        phoneNumber: normalizeKuwaitPhone(values.phoneNumber),
        alternativePhoneNumber: values.alternativePhoneNumber
          ? normalizeKuwaitPhone(values.alternativePhoneNumber)
          : "",
        media: finalMediaIds.filter((id): id is string => Boolean(id)),
      };

      if (mode === "edit" && initialData) {
        await updateAd(
          initialData._id,
          adData,
          user?.role === "super_admin" ? initialData.user?._id : undefined,
        );
        await refreshSubscriptions();
        queryClient.invalidateQueries({ queryKey: ["ads"] });
        queryClient.invalidateQueries({ queryKey: ["ad"] });
        queryClient.invalidateQueries({ queryKey: ["my-ads"] });
        queryClient.invalidateQueries({ queryKey: ["my-subscriptions"] });
        queryClient.invalidateQueries({ queryKey: ["office"] });
        toast.success(t("ads.adUpdatedSuccessfully"));
        if (onSuccess) onSuccess();
        else router.push("/account?tab=my-ads");
      } else {
        await createAd(
          adData,
          user?.role === "super_admin" ? initialData?.user?._id : undefined,
        );
        await refreshSubscriptions();
        queryClient.invalidateQueries({ queryKey: ["ads"] });
        queryClient.invalidateQueries({ queryKey: ["ad"] });
        queryClient.invalidateQueries({ queryKey: ["my-ads"] });
        queryClient.invalidateQueries({ queryKey: ["my-subscriptions"] });
        queryClient.invalidateQueries({ queryKey: ["office"] });
        toast.success(t("ads.adCreatedSuccessfully"));
        if (onSuccess) onSuccess();
        else router.push("/account?tab=my-ads");
      }
    } catch (error) {
      const errorCode = getErrorCode(error);

      if (
        errorCode === "INSUFFICIENT_CREDITS" ||
        errorCode === "NO_SUBSCRIPTION"
      ) {
        toast.error(tAds("noSubscription"));
      } else {
        toast.error(
          getErrorMessage(
            error ||
              t(`ads.failedTo${mode === "edit" ? "Update" : "Create"}Ad`),
          ),
        );
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4 sm:p-6">
      <h1 className="text-xl md:text-2xl font-bold mb-3 md:mb-6 text-gray-900">
        {mode === "edit" ? t("ads.editListing") : t("ads.createListing")}
      </h1>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-5 md:space-y-8"
        >
          <fieldset
            disabled={isUploading}
            className="space-y-5 md:space-y-8 disabled:opacity-90"
          >
            {/* Media */}
            <div className="space-y-2">
              <FormLabel className="text-sm md:text-base font-semibold">
                {t("ads.listingMedia")}
              </FormLabel>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-3 sm:p-8 text-center bg-gray-50/50 hover:bg-gray-50 transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  className="hidden"
                  id="media-upload"
                  onChange={handleImageUpload}
                />
                <label
                  htmlFor="media-upload"
                  className="cursor-pointer flex flex-col items-center justify-center "
                >
                  <div className="flex flex-col items-center justify-center pb-2">
                    <Upload
                      size={40}
                      className="text-[#197aca]"
                      strokeWidth={1.5}
                    />
                  </div>
                  <span className="text-xs md:text-sm text-gray-500">
                    {t("ads.uploadConstraints")}
                  </span>
                </label>
              </div>
              {isUploading && (
                <div className="flex items-center justify-center gap-2 text-primary text-sm pt-2">
                  <Loader2 className="h-4 w-4 animate-spin" />{" "}
                  {mode === "edit" ? t("ads.updating") : t("ads.uploading")}
                </div>
              )}

              {mediaItems.length > 0 && (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={mediaItems.map((item) => item.id)}
                    strategy={rectSortingStrategy}
                  >
                    <div
                      className={`grid grid-cols-4 gap-4 mt-4 ${isUploading ? "pointer-events-none" : ""}`}
                    >
                      {mediaItems.map((item, idx) => (
                        <SortableMediaItem
                          key={item.id}
                          item={item}
                          isUploading={isUploading}
                          uploadProgress={uploadProgress[idx] || 0}
                          onRemove={removeImage}
                          formatFileSize={formatFileSize}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
              <FormMessage>{form.formState.errors.media?.message}</FormMessage>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel className="font-semibold">
                        {t("ads.phoneNumber")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("ads.phoneNumberPlaceholder")}
                          {...field}
                          disabled
                          className="bg-gray-100 border-gray-200 h-12 cursor-not-allowed w-full rounded-xl"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isPhoneHidden"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel className="font-semibold text-gray-700">
                        {t("ads.visibility")}
                      </FormLabel>
                      <FormControl>
                        <Tabs
                          value={field.value ? "hidden" : "visible"}
                          onValueChange={(val) =>
                            field.onChange(val === "hidden")
                          }
                          className="w-full"
                        >
                          <TabsList className="grid w-full grid-cols-2 h-12 bg-gray-100 p-1 rounded-xl">
                            <TabsTrigger
                              value="visible"
                              className="h-full rounded-lg text-[10px] sm:text-xs whitespace-nowrap px-1 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
                            >
                              <Eye className="w-4 h-4  " />
                              {t("ads.showPhone")}
                            </TabsTrigger>
                            <TabsTrigger
                              value="hidden"
                              className="h-full rounded-lg text-[10px] sm:text-xs whitespace-nowrap px-1 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
                            >
                              <EyeOff className="w-4 h-4  " />
                              {t("ads.hidePhone")}
                            </TabsTrigger>
                          </TabsList>
                        </Tabs>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="alternativePhoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-gray-700 text-sm">
                      {t("ads.altPhone")}
                    </FormLabel>
                    <FormControl>
                      <div
                        dir="ltr"
                        className="flex h-12 overflow-hidden rounded-xl border border-gray-200 bg-gray-50 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all"
                      >
                        <div className="flex items-center justify-center px-4 bg-gray-100 border-r border-gray-200 text-gray-500 font-semibold text-sm select-none">
                          +965
                        </div>
                        <Input
                          placeholder={t("ads.altPhonePlaceholder")}
                          {...field}
                          className="border-0 bg-transparent h-full px-4 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-400"
                          maxLength={8}
                          onChange={(e) => {
                            const val = e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 8);
                            field.onChange(val);
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {mode === "create" && (
              <p className="text-xs font-semibold text-red-500 text-right">
                {t("ads.creditsLeft", {
                  remaining: remainingCredits ?? "--",
                })}
              </p>
            )}

            {/* Purpose */}
            <FormField
              control={form.control}
              name="purpose"
              render={({ field }) => (
                <FormItem className="space-y-2 md:space-y-3">
                  <FormLabel className="font-semibold">
                    {t("ads.purpose")}
                  </FormLabel>
                  <FormControl>
                    <Tabs
                      value={field.value}
                      onValueChange={field.onChange}
                      className="w-full"
                    >
                      <TabsList className="grid w-full grid-cols-3 h-10 sm:h-11 bg-gray-100/50 p-1">
                        <TabsTrigger
                          value="rent"
                          className="text-xs sm:text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-white"
                        >
                          {t("ads.rent")}
                        </TabsTrigger>
                        <TabsTrigger
                          value="sale"
                          className="text-xs sm:text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-white"
                        >
                          {t("ads.sale")}
                        </TabsTrigger>
                        <TabsTrigger
                          value="exchange"
                          className="text-xs sm:text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-white"
                        >
                          {t("ads.exchange")}
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Type & Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <FormField
                control={form.control}
                name="propertyType"
                render={({ field, fieldState }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="font-semibold">
                      {t("ads.propertyType")}
                    </FormLabel>

                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isLoadingMetadata}
                    >
                      <FormControl>
                        <SelectTrigger
                          className="bg-white border-gray-200 !h-10 sm:!h-11"
                          size="sm"
                        >
                          <SelectValue placeholder={t("ads.selectType")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {propertyTypes.map((type) => (
                          <SelectItem
                            key={type._id}
                            value={type._id}
                            className="text-base"
                            dir={locale === "ar" ? "rtl" : "ltr"}
                          >
                            {locale === "ar"
                              ? type.labelAr || type.label
                              : type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.error?.message && (
                      <ErrorSlot message={fieldState.error?.message} />
                    )}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="area"
                render={({ field, fieldState }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="font-semibold">
                      {t("ads.area")}
                    </FormLabel>

                    <MultiSelect
                      options={areas.map((a) => ({
                        label: locale === "ar" ? a.labelAr || a.label : a.label,
                        value: a._id,
                        governorate:
                          locale === "ar"
                            ? a.governorateAr || a.governorate
                            : a.governorate,
                      }))}
                      value={field.value ? [field.value] : []}
                      onChange={(val) => field.onChange(val[0] || "")}
                      placeholder={t("ads.selectArea")}
                      className="!h-10 sm:!h-11"
                      disabled={isLoadingMetadata}
                      enableGrouping={true}
                      maxCount={1}
                      dir={locale === "ar" ? "rtl" : "ltr"}
                    />

                    {fieldState.error?.message && (
                      <ErrorSlot message={fieldState.error?.message} />
                    )}
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">
                    {t("ads.price")}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder={t("ads.pricePlaceholder")}
                      {...field}
                      value={field.value as number}
                      className="bg-white border-gray-200 h-10 md:h-12"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Details */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">
                    {t("ads.listingDetails")}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("ads.detailsPlaceholder")}
                      className="min-h-[150px] bg-white border-gray-200 resize-none p-4"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </fieldset>

          <div className="pt-4 md:pt-6 flex justify-center items-center">
            <Button
              type="submit"
              className="px-6 w-auto bg-primary hover:bg-primary/90 text-white h-10 sm:h-11 text-md md:text-lg rounded-xl font-medium shadow-lg shadow-primary/20"
              disabled={form.formState.isSubmitting || isUploading}
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {mode === "edit" ? t("ads.updating") : t("ads.uploading")}
                  {isUploading ? ` ${overallUploadProgress}%` : ""}
                </>
              ) : mode === "edit" ? (
                t("ads.updateListing")
              ) : (
                t("ads.createListing")
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
