// API Endpoints Constants
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    SIGNIN: '/users/signin',
    SIGNUP: '/users/signup',
    FORGOT_PASSWORD: '/users/forgot-password',
    RESET_PASSWORD: '/users/reset-password',
    VERIFY_OTP: '/users/verify-otp',
    RESEND_OTP: '/users/resend-otp',
    VERIFY_RESET_TOKEN: '/users/verify-reset-token',
  },
  // Metadata endpoints
  METADATA: {
    PROPERTY_TYPES: '/metadata/property-types',
    AREAS: '/metadata/areas',
  },
  // Ad endpoints
  AD: {
    CREATE: '/ads',
    GET_ALL: '/ads',
    GET_BY_ID: (id: string) => `/ads/${id}`,
    MY_ADS: '/ads/my-ads',
    UPDATE: (id: number) => `/ads/${id}`,
    DELETE: (id: number) => `/ads/${id}`,
    VIEW: (id: string) => `/ads/${id}/view`,
    REPOST: (id: number) => `/ads/${id}/repost`,
  },
  // User/Business endpoints
  USER: {
    GET_ALL_BUSINESSES: '/users/businesses',
    GET_BUSINESS_STATS: '/users/businesses/stats',
    TOGGLE_USER_STATUS: '/users/toggle-status',
  },
  // Invoice endpoints
  INVOICE: {
    GET_USER_INVOICES: '/invoices',
  },
  // Payment endpoints
  PAYMENT: {
    CHECKOUT: '/payments/checkout',
    MY_PAYMENTS: '/payments/my-payments',
  },
  // Coupon endpoints
  COUPON: {
    GET_ALL: '/coupons',
    GET_STATS: '/coupons/stats',
    VALIDATE: '/coupons/validate',
  },
  // Dashboard endpoints
  DASHBOARD: {
    GET_STATS: '/dashboard/stats',
  },
  // Settings endpoints
  SETTINGS: {
    UPDATE_PASSWORD: '/settings/update-password',
  },
  // Subscription plan endpoints
  SUBSCRIPTION_PLAN: {
    GET_ALL: '/subscription-plans',
    GET_BY_ID: (id: string) => `/subscription-plans/${id}`,
    SUBSCRIBE: '/subscriptions/subscribe',
    MY_SUBSCRIPTIONS: '/subscriptions/my-subscriptions',
    REMAINING_CREDITS: '/subscriptions/remaining-credits',
  },
  // Office endpoints
  OFFICE: {
    GET_ALL: '/offices',
    GET_BY_ID: (id: string) => `/offices/${id}`,
  },
  // App settings endpoints
  APP_SETTINGS: {
    GET: '/app-settings',
    UPDATE: '/app-settings',
  },
  // Team member endpoints
  TEAM_MEMBER: {
    GET_ALL: '/team-members',
    GET_STATS: '/team-members/stats',
  },
  // Profile/Business Info endpoints
  PROFILE: {
    GET_BUSINESS_INFO: '/profile/business-info',
    UPDATE_BUSINESS_INFO: '/profile/business-info',
  },
  // Customization endpoints
  CUSTOMIZATION: {
    GET: '/customization',
    UPDATE: '/customization',
  },
  // Service Line endpoints
  SERVICE_LINE: {
    GET_ALL: '/service-lines',
  },
  // Media endpoints
  MEDIA: {
    UPLOAD: '/media/upload',
    MULTIPART_INIT: '/media/multipart/init',
    MULTIPART_PART_URL: '/media/multipart/part-url',
    MULTIPART_THUMBNAIL_URL: '/media/multipart/thumbnail-url',
    MULTIPART_COMPLETE: '/media/multipart/complete',
    MULTIPART_ABORT: '/media/multipart/abort',
  },
  // Account endpoints
  ACCOUNT: {
    PROFILE: '/account/profile',
    MY_ADS: '/account/my-ads',
    WISHLIST: {
      CREATE: '/account/wishlist',
      GET_ALL: '/account/wishlist',
      UPDATE: (id: string) => `/account/wishlist/${id}`,
      DELETE: (id: string) => `/account/wishlist/${id}`,
    },
    FAVORITES: {
      ADD: '/account/favorites',
      REMOVE: (adId: number) => `/account/favorites/${adId}`,
      GET_ALL: '/account/favorites',
      CHECK: (adId: number) => `/account/favorites/check/${adId}`,
    },
    DELETE_ACCOUNT: '/account/delete-account',
    NOTIFICATIONS: {
      GET_ALL: '/account/notifications',
      MARK_READ: (id: string) => `/account/notifications/${id}/read`,
      MARK_ALL_READ: '/account/notifications/read-all',
      DELETE: (id: string) => `/account/notifications/${id}`,
      DELETE_ALL: '/account/notifications',
      UNREAD_COUNT: '/account/notifications/unread-count',
    },
  },
  // Contact endpoint
  CONTACT: '/contact',
  // Admin endpoints
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    ADS_OVER_TIME: '/admin/ads-over-time',
    USERS: '/admin/users',
    CREATE_USER: '/admin/users',
    USER_DETAILS: (id: string) => `/admin/users/${id}`,
    DELETE_USER: (id: string) => `/admin/users/${id}`,
    TOGGLE_USER_STATUS: (id: string) => `/admin/users/${id}/toggle-status`,
    TOGGLE_USER_VERIFIED: (id: string) => `/admin/users/${id}/toggle-verified`,
    VERIFY_USER: (id: string) => `/admin/users/${id}/verify`,
    CHANGE_USER_PASSWORD: (id: string) => `/admin/users/${id}/password`,
    ADS: '/admin/ads',
    FAILED_ADS: '/admin/failed-ads',
    FAILED_AD_DETAILS: (id: string) => `/admin/failed-ads/${id}`,
    SUBSCRIPTIONS: '/admin/subscriptions',
    CANCEL_SUBSCRIPTION: (id: string) => `/admin/subscriptions/${id}/cancel`,
    PLANS: '/admin/plans',
    UPDATE_PLAN: (id: string) => `/admin/plans/${id}`,
    TOGGLE_PLAN_STATUS: (id: string) => `/admin/plans/${id}/toggle-status`,
  },
} as const;
