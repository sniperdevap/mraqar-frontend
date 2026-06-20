"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Play } from "lucide-react";
import { cn } from "@/lib/utils";

import { Media } from "@/types/ad";

interface MediaViewerProps {
  media: Media[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
}

export function MediaViewer({
  media,
  initialIndex = 0,
  isOpen,
  onClose,
}: MediaViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, initialIndex]);

  const handleNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1));
  }, [media.length]);

  const handlePrev = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1));
  }, [media.length]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "Escape") onClose();
    },
    [isOpen, handleNext, handlePrev, onClose],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  const getMediaUrl = (m: Media) => {
    if (!m) return "/images/aqar-new-logo.png";
    if (m.url.startsWith("http")) return m.url;
    return `${process.env.NEXT_PUBLIC_IMAGE_HOST || ""}/${m.url}`;
  };

  const getThumbnailUrl = (m: Media) => {
    if (!m.thumbnail) return getMediaUrl(m);
    if (m.thumbnail.startsWith("http")) return m.thumbnail;
    return `${process.env.NEXT_PUBLIC_IMAGE_HOST || ""}/${m.thumbnail}`;
  };

  if (!isOpen) return null;

  const currentMedia = media[currentIndex];
  const currentMediaUrl = getMediaUrl(currentMedia);
  const isVideo = currentMedia.type === "video";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[100] bg-black/95 flex flex-col justify-center items-center backdrop-blur-sm"
    >
      {/* Close Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="absolute top-4 right-4 md:top-6 md:right-6 z-50 p-2 bg-black/50 hover:bg-white/20 rounded-full text-white transition-colors"
        aria-label="Close"
      >
        <X size={24} />
      </button>

      {/* Counter */}
      <div className="absolute top-4 md:top-6 left-1/2 -translate-x-1/2 z-50 px-4 py-1 bg-black/50 rounded-full text-white text-sm font-medium">
        {currentIndex + 1} / {media.length}
      </div>

      {/* Main Content Area */}
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = offset.x; // +ve is right, -ve is left

              if (swipe < -100) {
                handleNext();
              } else if (swipe > 100) {
                handlePrev();
              }
            }}
            className="absolute w-full h-full flex items-center justify-center p-4 max-w-5xl mx-auto"
          >
            {isVideo ? (
              <video
                src={currentMediaUrl}
                controls
                autoPlay
                className="max-h-full max-w-full object-contain rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <img
                src={currentMediaUrl}
                alt={`Media ${currentIndex + 1}`}
                className="max-h-full max-w-full object-contain select-none rounded-lg shadow-2xl"
                draggable={false}
                onClick={(e) => e.stopPropagation()}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Buttons (Desktop) */}
      {media.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 bg-black/50 hover:bg-white/20 rounded-full text-white transition-colors"
          >
            <ChevronLeft size={32} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 bg-black/50 hover:bg-white/20 rounded-full text-white transition-colors"
          >
            <ChevronRight size={32} />
          </button>
        </>
      )}

      {/* Thumbnail Strip (Optional, can be added if needed later) */}
      <div
        className="absolute bottom-4 left-0 right-0 p-4 overflow-x-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center gap-2 min-w-max px-4">
          {media.map((item, index) => {
            const isVid = item.type === "video";
            const url = isVid ? getThumbnailUrl(item) : getMediaUrl(item);
            return (
              <button
                key={index}
                onClick={() => {
                  setDirection(index > currentIndex ? 1 : -1);
                  setCurrentIndex(index);
                }}
                className={cn(
                  "relative w-12 h-12 md:w-16 md:h-16 rounded-md overflow-hidden border-2 transition-all flex-shrink-0",
                  index === currentIndex
                    ? "border-primary ring-2 ring-primary/30"
                    : "border-transparent opacity-50 hover:opacity-100",
                )}
              >
                {isVid ? (
                  <div className="relative w-full h-full">
                    <img
                      src={url}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <Play size={16} fill="white" className="text-white" />
                    </div>
                  </div>
                ) : (
                  <img
                    src={url}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
