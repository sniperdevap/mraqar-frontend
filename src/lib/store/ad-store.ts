import { create } from 'zustand';
import { Ad, DetailAd } from '@/types/ad';

interface AdStore {
  ads: Record<string, Ad | DetailAd>;
  setAds: (adsToSet: (Ad | DetailAd)[]) => void;
  setAd: (ad: Ad | DetailAd) => void;
  getAd: (id: string) => Ad | DetailAd | undefined;
}

export const useAdStore = create<AdStore>((set, get) => ({
  ads: {},
  setAds: adsToSet => {
    set(state => {
      const newAds = { ...state.ads };
      adsToSet.forEach(ad => {
        // If we already have a DetailAd and the new one is just an Ad, don't overwrite
        // detail fields (like isOffice, isFav) unless we are specifically updating from detail page.
        // For simplicity, we just merge.
        if (newAds[String(ad.id)]) {
          newAds[String(ad.id)] = { ...newAds[String(ad.id)], ...ad };
        } else {
          newAds[String(ad.id)] = ad;
        }
      });
      return { ads: newAds };
    });
  },
  setAd: ad => {
    set(state => ({
      ads: {
        ...state.ads,
        [String(ad.id)]: { ...(state.ads[String(ad.id)] || {}), ...ad },
      },
    }));
  },
  getAd: id => get().ads[id],
}));
