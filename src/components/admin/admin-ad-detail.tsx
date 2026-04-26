'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Share2, Phone, Heart, ChevronLeft, ChevronRight, Play, ArrowLeft } from 'lucide-react';
import { updateAd, deleteAd } from '@/lib/api/ad';
import { Media } from '@/types/ad';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { formatDistanceToNowStrict } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { addFavorite, removeFavorite } from '@/lib/api/account';
import { useAuthStore } from '@/lib/store/auth-store';
import { Loader } from '../common/loader';
import { getErrorMessage } from '@/lib/utils/api';
import { useLocale } from '@/hooks/use-locale';
import dynamic from 'next/dynamic';

const ConfirmationDialog = dynamic(() => import('@/components/ui/confirmation-dialog').then(mod => mod.ConfirmationDialog));
const MediaViewer = dynamic(() => import('../ui/media-viewer').then(mod => mod.MediaViewer));
const ShareDialog = dynamic(() => import('@/components/common/share-dialog').then(mod => mod.ShareDialog));
import { formatDisplayPhone } from '@/lib/utils';
import { useAdById } from '@/hooks/use-ads';
import { useQueryClient } from '@tanstack/react-query';
import { useAdStore } from '@/lib/store/ad-store';
import { DetailAd } from '@/types/ad';

interface AdminAdDetailProps {
  adId: string;
}

export function AdminAdDetail({ adId }: AdminAdDetailProps) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { locale } = useLocale();
  const t = useTranslations('common.ads');
  const tButtons = useTranslations('common.buttons');
  const queryClient = useQueryClient();
  const { getAd, setAd } = useAdStore();

  // Try to load initial data from Zustand store
  const cachedAd = getAd(adId) as DetailAd | undefined;

  const { data: ad, isLoading: queryLoading } = useAdById(adId, cachedAd);

  // We only show loader if we have NO cached ad and query is still loading
  const isLoading = queryLoading && !cachedAd;

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isMediaViewerOpen, setIsMediaViewerOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(ad?.isFav || false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const [showArrows, setShowArrows] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Update store when full ad detail is fetched
  useEffect(() => {
    // Only update if the store doesn't already have this exact ad reference
    if (ad && (!cachedAd || cachedAd.updatedAt !== ad.updatedAt)) {
      setAd(ad);
    }
  }, [ad, cachedAd, setAd]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const checkScrollable = () => {
      if (scrollContainerRef.current) {
        const { scrollWidth, clientWidth } = scrollContainerRef.current;
        setShowArrows(scrollWidth > clientWidth);
      }
    };

    checkScrollable();

    const observer = new ResizeObserver(checkScrollable);
    if (scrollContainerRef.current) {
      observer.observe(scrollContainerRef.current);
    }

    window.addEventListener('resize', checkScrollable);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', checkScrollable);
    };
  }, [ad?.media]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // Initialize favorite status from ad data
  useEffect(() => {
    if (ad && isAuthenticated) {
      setIsFavorite(ad.isFav || false);
    } else {
      setIsFavorite(false);
    }
  }, [ad, isAuthenticated]);

  // For Admin page, we allow controls even if not owner
  const isOwnerOrAdmin = true;

  const handleToggleFavorite = async () => {
    if (!ad) return;

    if (!isAuthenticated) {
      toast.error(t('pleaseLoginToAddFavorites'));
      router.push('/auth/signin');
      return;
    }

    setIsFavoriteLoading(true);
    try {
      if (isFavorite) {
        await removeFavorite(ad._id);
        setIsFavorite(false);
        toast.success(t('removedFromFavorites'));
      } else {
        await addFavorite(ad._id);
        setIsFavorite(true);
        toast.success(t('addedToFavorites'));
      }
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      toast.error(getErrorMessage(error || 'Failed to update favorite'));
    } finally {
      setIsFavoriteLoading(false);
    }
  };

  // Dispatch favorite state to navbar via custom events
  useEffect(() => {
    const detail = { isFavorite, isFavoriteLoading, isOwner: isOwnerOrAdmin, isLoading };
    window.dispatchEvent(new CustomEvent('ad-favorite-state', { detail }));
  }, [isFavorite, isFavoriteLoading, isLoading]);

  useEffect(() => {
    const handler = () => handleToggleFavorite();
    window.addEventListener('ad-toggle-favorite', handler);
    return () => window.removeEventListener('ad-toggle-favorite', handler);
  }, [ad, isAuthenticated, isFavorite]);

  const getTimeAgo = (date: string) => {
    try {
      const locale_obj = locale === 'ar' ? ar : enUS;
      return formatDistanceToNowStrict(new Date(date), {
        addSuffix: true,
        locale: locale_obj,
      });
    } catch {
      return 'Recently';
    }
  };

  const getMediaUrl = (m: Media) => {
    if (!m) return '/images/card-placeholder-1.jpeg';
    if (m.url?.startsWith('http')) return m.url;
    return `${process.env.NEXT_PUBLIC_IMAGE_HOST || ''}/${m.url}`;
  };

  const getThumbnailUrl = (m: Media) => {
    if (!m.thumbnail) return getMediaUrl(m);
    if (m.thumbnail.startsWith('http')) return m.thumbnail;
    return `${process.env.NEXT_PUBLIC_IMAGE_HOST || ''}/${m.thumbnail}`;
  };

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return '/images/card-placeholder-1.jpeg';
    if (imagePath.startsWith('http')) return imagePath;
    return `${process.env.NEXT_PUBLIC_IMAGE_HOST || ''}/${imagePath}`;
  };

  const handleEdit = () => {
    if (!ad) return;
    router.push(`/admin/ads/edit/${ad._id}`);
  };

  const handleToggleStatus = async () => {
    if (!ad) return;
    try {
      const newStatus = ad.status === 'active' ? 'inactive' : 'active';
      await updateAd(ad._id, { status: newStatus });
      queryClient.invalidateQueries({ queryKey: ['ad', adId] });
      queryClient.invalidateQueries({ queryKey: ['ads'] });
      queryClient.invalidateQueries({ queryKey: ['my-ads'] });
      toast.success(newStatus === 'active' ? t('activated') : t('stopped'));
    } catch (error) {
      toast.error(t('failedToUpdate'));
    }
  };

  const handleDelete = async () => {
    if (!ad) return;
    try {
      await deleteAd(ad._id);
      queryClient.invalidateQueries({ queryKey: ['ads'] });
      queryClient.invalidateQueries({ queryKey: ['my-ads'] });
      toast.success(t('deletedSuccessfully'));
      router.back();
    } catch (error) {
      toast.error(t('failedToDelete'));
    }
  };

  const handleShare = () => {
    if (!ad) return;
    setIsShareOpen(true);
  };

  const handleWhatsApp = () => {
    if (!ad) return;
    const phoneNumber = ad.isPhoneHidden && ad.alternativePhoneNumber ? ad.alternativePhoneNumber : ad.phoneNumber;

    const propertyInfo =
      locale === 'ar'
        ? `${ad.propertyType?.labelAr || ad.propertyType?.label || 'عقار'} - ${ad.area?.labelAr || ad.area?.label || 'المنطقة'}`
        : `${ad.propertyType?.label || 'Property'} - ${ad.area?.label || 'Area'}`;

    const message = encodeURIComponent(`السلام عليكم
أنا مهتم بهذا الإعلان:
${propertyInfo}
${window.location.origin}/${locale}/ads/${ad._id}`);

    let phoneParam = phoneNumber.replace(/[^0-9]/g, '');
    // If it doesn't start with 965, add it
    if (!phoneParam.startsWith('965')) {
      phoneParam = '965' + phoneParam;
    }

    const whatsappUrl = `https://wa.me/${phoneParam}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const handlePhoneCall = () => {
    if (!ad) return;
    const phoneNumber = ad.isPhoneHidden && ad.alternativePhoneNumber ? ad.alternativePhoneNumber : ad.phoneNumber;
    window.location.href = `tel:${phoneNumber}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center ">
        <Loader />
      </div>
    );
  }

  if (!ad) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('adNotFound')}</h2>
          <Button onClick={() => router.push('/')} className="mt-4">
            {t('goToHome')}
          </Button>
        </div>
      </div>
    );
  }

  const currentMedia = ad.media && ad.media.length > 0 ? ad.media[currentImageIndex] : null;
  const currentImageUrl = currentMedia ? (currentMedia.type === 'video' ? getThumbnailUrl(currentMedia) : getMediaUrl(currentMedia)) : '/images/card-placeholder-1.jpeg';

  const isRTL = locale === 'ar';

  return (
    <div className="min-h-full flex flex-col" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Back Button for Admin */}
      <div className=" flex justify-start items-start w-full px-4 py-4">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary transition-colors">
          <ArrowLeft size={18} className={isRTL ? 'rotate-180' : ''} />
          {tButtons('back')}
        </button>
      </div>

      {/* Centered Teal Header */}
      <div className="max-w-5xl mx-auto w-full bg-primary text-white py-6 px-4 rounded-3xl">
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center gap-4">
          <h1 className="text-xl md:text-2xl font-bold">
            {locale === 'ar'
              ? `${ad.purpose === 'sale' ? 'للبيع' : ad.purpose === 'rent' ? 'للايجار' : 'للبدل'} ${ad.propertyType?.labelAr || ad.propertyType?.label || 'عقار'} في ${ad.area?.labelAr || ad.area?.label || 'المنطقة'}`
              : `${ad.purpose === 'sale' ? 'Sale' : ad.purpose === 'rent' ? 'Rent' : 'Exchange'} ${ad.propertyType?.label || 'Property'} in ${ad.area?.label || 'Area'}`}
          </h1>

          {ad.price ? <div className="text-2xl md:text-3xl font-bold">{Number(ad.price).toLocaleString('en-US')} د.ك</div> : null}
          <div className="flex items-center justify-center gap-3 mt-2">
            <div className="flex items-center gap-2 bg-white backdrop-blur-sm px-4 py-2 rounded-full text-sm">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-black" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span className="text-black text-xs md:text-sm">{getTimeAgo(ad.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2 bg-white backdrop-blur-sm px-4 py-2 rounded-full text-sm">
              <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" className="w-4 h-4 text-black" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"></path>
                <path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"></path>
              </svg>
              <span className="text-black text-xs md:text-sm">{ad.views || 0}</span>
            </div>
            <button onClick={handleShare} className="cursor-pointer bg-white backdrop-blur-sm p-2 rounded-full hover:bg-white/80 transition-colors">
              <Share2 size={16} className="text-black " />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-4 md:py-8 space-y-5 md:space-y-10">
        {/* Badges Section */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-start gap-2">
            {ad.isOffice && (
              <div className="bg-primary rounded-md px-2 py-1 flex items-center gap-2 shadow-lg max-w-full w-auto min-w-0">
                <div className="rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center shrink-0">
                  <img src={getImageUrl(ad.user.avatar || '')} alt={ad.user.name || 'Office'} className="w-full h-full object-cover rounded-full" />
                </div>
                <span className="text-white text-sm md:text-lg font-bold flex-1 truncate pr-1">{ad.user.name}</span>
              </div>
            )}

            <div className="flex flex-col gap-2 justify-end">
              {!ad.isPhoneHidden && (
                <button
                  onClick={handleWhatsApp}
                  className="cursor-pointer bg-[#4CAF50] hover:bg-[#43A047] transition-colors p-2 flex items-center gap-3 shadow-lg max-w-full w-auto min-w-0 rounded-md"
                >
                  <Phone size={20} fill="currentColor" className="text-white" />
                  <span className="text-white text-sm md:text-lg font-bold flex-1 truncate" dir="ltr">
                    {formatDisplayPhone(ad.phoneNumber)}
                  </span>
                </button>
              )}
              {ad.alternativePhoneNumber && (
                <button
                  onClick={handleWhatsApp}
                  className="cursor-pointer bg-[#4CAF50] hover:bg-[#43A047] transition-colors p-2 flex items-center gap-3 shadow-lg max-w-full w-auto min-w-0 rounded-md"
                >
                  <Phone size={20} fill="currentColor" className="text-white" />
                  <span className="text-white text-sm md:text-lg font-bold flex-1 truncate" dir="ltr">
                    {formatDisplayPhone(ad.alternativePhoneNumber)}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
        {/* Description Section */}
        <div className="text-center">
          <p className="text-gray-800 text-sm sm:text-lg leading-relaxed whitespace-pre-wrap break-words w-full">{ad.description}</p>
        </div>

        {/* Media Section */}
        <div className="space-y-4">
          <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-white shadow-xl border border-gray-100">
            <div className={`w-full h-full ${ad.media && ad.media.length > 0 ? 'cursor-pointer' : ''}`} onClick={() => (ad.media && ad.media.length > 0 ? setIsMediaViewerOpen(true) : undefined)}>
              {currentMedia?.type === 'video' ? (
                <div className="relative w-full h-full flex items-center justify-center bg-black">
                  <img src={getThumbnailUrl(currentMedia)} alt="Video thumbnail" className="w-full h-full object-contain" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10 transition-colors hover:bg-black/20">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 shadow-lg transition-transform hover:scale-105">
                      <Play className="w-8 h-8 md:w-10 md:h-10 text-white fill-white ml-1" />
                    </div>
                  </div>
                </div>
              ) : (
                <img
                  src={currentImageUrl}
                  alt={locale === 'ar' ? ad.propertyType?.labelAr || ad.propertyType?.label || 'عقار' : ad.propertyType?.label || 'Property'}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </div>

          {/* Thumbnails Carousel */}
          {ad.media && ad.media.length > 1 && (
            <div className="relative group">
              {showArrows && (
                <button
                  onClick={() => scroll('left')}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg p-1 rounded-full transition-all border border-gray-100 flex items-center justify-center hover:bg-gray-50 active:scale-95"
                  aria-label="Scroll left"
                >
                  <ChevronLeft size={16} className="text-gray-700" />
                </button>
              )}

              <div
                ref={scrollContainerRef}
                className={`flex overflow-x-auto scrollbar-hide snap-x snap-mandatory gap-3 py-2 scroll-smooth ${showArrows ? 'px-10' : 'justify-center'}`}
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {ad.media.map((m, index) => {
                  const isVideo = m.type === 'video';
                  const thumbnailUrl = isVideo ? getThumbnailUrl(m) : getMediaUrl(m);

                  return (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`relative flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden border-2 transition-all cursor-pointer snap-start ${
                        currentImageIndex === index ? 'border-primary ring-4 ring-primary/10' : 'border-transparent hover:border-gray-200'
                      }`}
                    >
                      {isVideo ? (
                        <div className="relative w-full h-full">
                          <img src={thumbnailUrl} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <Play size={16} fill="white" className="text-white" />
                          </div>
                        </div>
                      ) : (
                        <img src={thumbnailUrl} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                      )}
                    </button>
                  );
                })}
              </div>

              {showArrows && (
                <button
                  onClick={() => scroll('right')}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg p-1 rounded-full transition-all border border-gray-100 flex items-center justify-center hover:bg-gray-50 active:scale-95"
                  aria-label="Scroll right"
                >
                  <ChevronRight size={16} className="text-gray-700" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Admin Controls (Show always in admin page) */}
      <div className="mb-8 max-w-4xl mx-auto flex flex-row flex-wrap items-center justify-center gap-4 mt-8 pt-8 border-t border-gray-100">
        <button
          onClick={handleEdit}
          className="cursor-pointer w-auto sm:min-w-[140px] px-4 md:px-2 py-2 bg-transparent border hover:!text-white border-primary hover:!bg-primary text-primary rounded-xl font-bold transition-colors text-lg"
        >
          {t('edit')}
        </button>

        <button
          onClick={handleToggleStatus}
          className="cursor-pointer w-auto sm:min-w-[180px] px-4 md:px-2 py-2 bg-transparent border hover:!text-white border-primary hover:!bg-primary text-primary rounded-xl font-bold transition-colors text-lg"
        >
          {ad.status === 'active' ? t('stopAd') : t('activateAd')}
        </button>

        <ConfirmationDialog
          trigger={
            <button className="cursor-pointer w-auto sm:min-w-[140px] px-4 md:px-2 py-2 bg-primary hover:!bg-primary/80 text-white rounded-xl font-bold transition-colors text-lg">
              {t('deleteAd')}
            </button>
          }
          title={t('deleteAd')}
          description={t('deleteAdConfirm')}
          confirmButtonText={t('deleteAd')}
          cancelButtonText={tButtons('cancel')}
          onConfirm={handleDelete}
          icon={{ src: '/images/icons/delete.svg', alt: 'Delete', bgColor: 'bg-red-100' }}
        />
      </div>

      {/* Media Viewer */}
      {ad && ad.media && <MediaViewer media={ad.media} initialIndex={currentImageIndex} isOpen={isMediaViewerOpen} onClose={() => setIsMediaViewerOpen(false)} />}
      {/* Sticky Footer */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 p-3 z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] -mx-4 lg:-mx-8 mt-auto">
        <div className="mx-auto flex items-center gap-3 max-w-4xl">
          <button onClick={handlePhoneCall} className="cursor-pointer flex items-center justify-center bg-gray-900 text-white w-12 h-12 rounded-xl hover:bg-black transition-colors shrink-0">
            <Phone size={20} fill="currentColor" />
          </button>
          <button
            onClick={handleWhatsApp}
            className="cursor-pointer flex-1 bg-[#4CAF50] hover:bg-[#43A047] text-white h-12 rounded-xl flex items-center justify-center gap-3 text-lg font-bold transition-all active:scale-[0.98]"
          >
            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="20" width="20" xmlns="http://www.w3.org/2000/svg">
              <path d="M260.062 32C138.605 32 40.134 129.701 40.134 250.232c0 41.23 11.532 79.79 31.559 112.687L32 480l121.764-38.682c31.508 17.285 67.745 27.146 106.298 27.146C381.535 468.464 480 370.749 480 250.232 480 129.701 381.535 32 260.062 32zm109.362 301.11c-5.174 12.827-28.574 24.533-38.899 25.072-10.314.547-10.608 7.994-66.84-16.434-56.225-24.434-90.052-83.844-92.719-87.67-2.669-3.812-21.78-31.047-20.749-58.455 1.038-27.413 16.047-40.346 21.404-45.725 5.351-5.387 11.486-6.352 15.232-6.413 4.428-.072 7.296-.132 10.573-.011 3.274.124 8.192-.685 12.45 10.639 4.256 11.323 14.443 39.153 15.746 41.989 1.302 2.839 2.108 6.126.102 9.771-2.012 3.653-3.042 5.935-5.961 9.083-2.935 3.148-6.174 7.042-8.792 9.449-2.92 2.665-5.97 5.572-2.9 11.269 3.068 5.693 13.653 24.356 29.779 39.736 20.725 19.771 38.598 26.329 44.098 29.317 5.515 3.004 8.806 2.67 12.226-.929 3.404-3.599 14.639-15.746 18.596-21.169 3.955-5.438 7.661-4.373 12.742-2.329 5.078 2.052 32.157 16.556 37.673 19.551 5.51 2.989 9.193 4.529 10.51 6.9 1.317 2.38.901 13.531-4.271 26.359z"></path>
            </svg>
            <span>{t('whatsapp')}</span>
          </button>
        </div>
      </div>

      {/* Share Dialog */}
      {ad && (
        <ShareDialog
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
          url={typeof window !== 'undefined' ? `${window.location.origin}/${locale}/ads/${ad._id}` : ''}
          title={
            locale === 'ar'
              ? `السلام عليكم\nأنا مهتم بهذا الإعلان:\n${ad.propertyType?.labelAr || ad.propertyType?.label || 'عقار'} - ${ad.area?.labelAr || ad.area?.label || 'المنطقة'}`
              : `Hello\nI am interested in this ad:\n${ad.propertyType?.label || 'Property'} - ${ad.area?.label || 'Area'}`
          }
        />
      )}
    </div>
  );
}
