'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

import { Media } from '@/types/ad';

interface MediaViewerProps {
  media: Media[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
}

export function MediaViewer({ media, initialIndex = 0, isOpen, onClose }: MediaViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isMounted, setIsMounted] = useState(false);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    setCurrentIndex(initialIndex);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.body.setAttribute('data-media-viewer-open', 'true');

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.removeAttribute('data-media-viewer-open');
    };
  }, [isOpen, initialIndex]);

  const handleNext = useCallback(() => {
    setCurrentIndex(prev => (prev === media.length - 1 ? 0 : prev + 1));
  }, [media.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex(prev => (prev === 0 ? media.length - 1 : prev - 1));
  }, [media.length]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') onClose();
    },
    [isOpen, handleNext, handlePrev, onClose]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const getMediaUrl = (m: Media) => {
    if (!m) return '/images/aqar-new-logo.png';
    if (m.url.startsWith('http')) return m.url;
    return `${process.env.NEXT_PUBLIC_IMAGE_HOST || ''}/${m.url}`;
  };

  const getVideoThumbnailOnly = (m: Media) => {
    if (!m?.thumbnail) return '/images/aqar-new-logo.png';
    if (m.thumbnail.startsWith('http')) return m.thumbnail;
    return `${process.env.NEXT_PUBLIC_IMAGE_HOST || ''}/${m.thumbnail}`;
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    const endX = e.changedTouches[0]?.clientX ?? touchStartX.current;
    const delta = endX - touchStartX.current;
    touchStartX.current = null;
    if (delta < -100) handleNext();
    else if (delta > 100) handlePrev();
  };

  if (!isOpen || !isMounted) return null;

  const currentMedia = media[currentIndex];
  const currentMediaUrl = getMediaUrl(currentMedia);
  const isVideo = currentMedia.type === 'video';

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[200] h-[100dvh] bg-black/95 flex flex-col justify-center items-center backdrop-blur-sm animate-in fade-in duration-200"
    >
      <button
        onClick={e => {
          e.stopPropagation();
          onClose();
        }}
        className="absolute top-4 right-4 md:top-6 md:right-6 z-50 p-2 bg-black/50 hover:bg-white/20 rounded-full text-white transition-colors touch-manipulation"
        aria-label="Close"
      >
        <X size={24} />
      </button>

      <div className="absolute top-4 md:top-6 left-1/2 -translate-x-1/2 z-50 px-4 py-1 bg-black/50 rounded-full text-white text-sm font-medium">
        {currentIndex + 1} / {media.length}
      </div>

      <div
        className="relative w-full h-full flex items-center justify-center overflow-hidden pb-24 pt-14"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div
          key={currentIndex}
          className="absolute w-full h-full flex items-center justify-center p-4 max-w-5xl mx-auto animate-in fade-in duration-200"
        >
          {isVideo ? (
            <video src={currentMediaUrl} controls autoPlay className="max-h-full max-w-full object-contain rounded-lg shadow-2xl" onClick={e => e.stopPropagation()} />
          ) : (
            <img
              src={currentMediaUrl}
              alt={`Media ${currentIndex + 1}`}
              className="max-h-full max-w-full object-contain select-none rounded-lg shadow-2xl"
              draggable={false}
              onClick={e => e.stopPropagation()}
            />
          )}
        </div>
      </div>

      {media.length > 1 && (
        <>
          <button
            onClick={e => {
              e.stopPropagation();
              handlePrev();
            }}
            className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 bg-black/50 hover:bg-white/20 rounded-full text-white transition-colors"
          >
            <ChevronLeft size={32} />
          </button>
          <button
            onClick={e => {
              e.stopPropagation();
              handleNext();
            }}
            className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 bg-black/50 hover:bg-white/20 rounded-full text-white transition-colors"
          >
            <ChevronRight size={32} />
          </button>
        </>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] overflow-x-auto overscroll-contain" onClick={e => e.stopPropagation()}>
        <div className="flex justify-center gap-2 min-w-max px-4">
          {media.map((item, index) => {
            const isVid = item.type === 'video';
            const url = isVid ? getVideoThumbnailOnly(item) : getMediaUrl(item);
            return (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  'relative w-12 h-12 md:w-16 md:h-16 rounded-md overflow-hidden border-2 transition-all flex-shrink-0',
                  index === currentIndex ? 'border-primary ring-2 ring-primary/30' : 'border-transparent opacity-50 hover:opacity-100'
                )}
              >
                {isVid ? (
                  <div className="relative w-full h-full">
                    <img src={url} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <Play size={16} fill="white" className="text-white" />
                    </div>
                  </div>
                ) : (
                  <img src={url} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>,
    document.body
  );
}
