export interface Media {
  _id: string;
  url: string;
  key: string;
  type: 'image' | 'video';
  thumbnail?: string;
  thumbnailKey?: string;
  mimeType: string;
  size: number;
}

export interface Ad {
  id: number;
  _id: string;
  user: {
    /** Short id for the owner's office page — see officeHref(). */
    publicId?: number;
    _id: string;
    name: string;
    phoneNumber: string;
    avatar?: string;
  };
  purpose: 'sale' | 'rent' | 'exchange';
  propertyType: {
    id: number;
    _id: string;
    label: string;
    labelAr: string;
    value: string;
  };
  area: {
    id: number;
    _id: string;
    label: string;
    labelAr: string;
    value: string;
  };
  price: number;
  priceUnit?: 'kd' | 'thousand';
  phoneNumber: string;
  isPhoneHidden: boolean;
  alternativePhoneNumber?: string;
  premiumAd: boolean;
  isPremium?: boolean;
  premiumExpiresAt?: string;
  description: string;
  media: Media[];
  status: 'active' | 'inactive' | 'sold';
  views?: number;
  createdAt: string;
  updatedAt: string;
  isOffice?: boolean;
  isFav?: boolean;
}
export interface DetailAd extends Ad {
  isOffice: boolean;
  isFav?: boolean;
}
export interface GetAdsParams {
  page?: number;
  limit?: number;
  purpose?: string;
  propertyType?: string;
  area?: string | string[];
  minPrice?: number;
  maxPrice?: number;
  status?: string | string[];
}

export interface GetAdsResult {
  ads: Ad[];
  total: number;
  page: number;
  totalPages: number;
}
