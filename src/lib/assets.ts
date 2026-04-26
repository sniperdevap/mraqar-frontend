export const ASSETS = {
  images: {
    mainLogo: "/images/main-Mr aqar-logo.png",
    logoIcon: "/images/icons/logo-icon.svg",
    default: "/images/avatars.png",
    notifications: {
      aiGeneratedRoadmap: "/images/notifications/ai-generated-roadmap.svg",
      businessWallet: "/images/notifications/business-wallet.svg",
      planReview: "/images/notifications/plan-review.svg",
    },
    listingImg: {
      mainImg: "/images/listing-img.svg",
      otherImgFirst: "/images/other-image.svg",
      otherImgSecond: "/images/other-image-second.svg",
      otherImgThird: "/images/other-image-third.svg",
      otherImgFourth: "/images/other-image-fourth.svg",
    },
    icons: {
      bell: "/images/icons/bell.svg",
      coinDollar: "/images/icons/coin-dollar.svg",
      polygon: "/images/icons/Polygon.svg",
      grayDollar: "/images/icons/gray-dollar.svg",
      greenDollar: "/images/icons/green-dollar.svg",
      downward: "/images/icons/downward.svg",
      blueTick: "/images/icons/blue-tick.svg",
      person: "/images/icons/person.svg",
      search: "/images/icons/search.svg",
      tableCalendar: "/images/icons/date-calandar.svg",
      event: "/images/icons/event.svg",
      download: "/images/icons/svg-download.svg",
      checkCircleYellow: "/images/icons/check-circle-yellow.svg",
      heart: "/images/icons/heart-icon.svg",
      shield: "/images/icons/shield.svg",
      location: "/images/icons/location.svg",
      hourglass: "/images/icons/hourglass.svg",
      wallet: "/images/icons/wallet.svg",
      visibilityGreen: "/images/icons/visibility-green.svg",
      visibilityBlack: "/images/icons/visibility-black.svg",
      edit: "/images/icons/edit.svg",
      upload: "/images/icons/upload.svg",
      yellowStar: "/images/icons/star-yellow.svg",
      box: "/images/icons/box.svg",
      timeline: "/images/icons/timeline.svg",
      paused: "/images/icons/pause.svg",
      visibilityGray: "/images/icons/visibility-gray.svg",
      dashboard: "/images/icons/dashboard-item-icon.svg",
      dashboardActive: "/images/icons/dashboard-item-icon-active.svg",
      visibilityDashboard: "/images/icons/visibility-dashboard.svg",
      bookings: "/images/icons/booking-icon.svg",
      blackDollar: "/images/icons/dollar-sign.svg",
      calendar: "/images/icons/calendar.svg",
      apartment: "/images/icons/apartment.svg",
      totalBookings: "/images/icons/total-booking-icon.svg",
      dashboardMoney: "/images/icons/dashboard-money.svg",
      circleCheck: "/images/icons/circle-check.svg",
      cancel: "/images/icons/cancel.svg",
      addIcon: "/images/icons/add.svg",
      verifiedIcon: "/images/icons/verified.svg",
      watchIcon: "/images/icons/watch-icon.svg",
      dashboardListing: "/images/icons/dashboard-listing.svg",
      bookingsActive: "/images/icons/booking-icon-active.svg",
      revenue: "/images/icons/money.svg",
      creditCard: "/images/icons/credit-card.svg",
      blackTick: "/images/icons/black-tick.svg",
      revenueActive: "/images/icons/money-active.svg",
      instagram: "/images/icons/instagram.svg",
      linkedIn: "/images/icons/linked-in.svg",
      proPartners: "/images/icons/pro-partners.svg",
      proPartnersActive: "/images/icons/pro-partners-active.svg",
      product: "/images/icons/product-icon.svg",
      productActive: "/images/icons/product-icon-active.svg",
      settings: "/images/icons/settings-item-icon.svg",
      settingsActive: "/images/icons/settings-item-icon-active.svg",
      star: "/images/icons/star.svg",
      twitter: "/images/icons/twitter.svg",
      users01: "/images/icons/users 01-1.svg",
      users01Active: "/images/icons/users01-active.svg",
      profile: "/images/icons/profile.svg",
      logout: "/images/icons/logout.svg",
    },
    backgrounds: {
      auth: "/images/auth/auth-bg.png",
    },
  },

  videos: {},
  documents: {},
  audio: {},
} as const;

// Type-safe asset paths
export type AssetPath = typeof ASSETS;

// Helper function to get asset path with fallback
export function getAssetPath(
  path: string | undefined,
  fallback?: string,
): string {
  return path || fallback || "/images/placeholder.png";
}

// Asset validation helper
export function isValidAssetPath(path: string): boolean {
  return (
    path.startsWith("/") &&
    (path.includes("/images/") ||
      path.includes("/videos/") ||
      path.includes("/documents/") ||
      path.includes("/audio/"))
  );
}
