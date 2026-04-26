import { LayoutDashboard, CircleDollarSign, Settings, Search, Bookmark, Users, type LucideIcon } from 'lucide-react';
import ROLES from './roles';

export type AppRole = (typeof ROLES)[keyof typeof ROLES];

// Route constants
export const ROUTES = {
  SIGNIN: '/auth/signin',
  BUSINESS_SETTINGS: '/business/settings',
} as const;

export type NavItem = {
  name: string;
  href: string;
  icon: LucideIcon | string; // lucide-react icon component or SVG image path
  roles: AppRole[];
  isLogout?: boolean; // Special flag for logout items
};

export const NAV_ITEMS: NavItem[] = [
  // super admin routes
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, roles: [ROLES.SUPER_ADMIN] },
  { name: 'Subscriptions', href: '/admin/subscriptions', icon: CircleDollarSign, roles: [ROLES.SUPER_ADMIN] },
  { name: 'Business Management', href: '/admin/business-management', icon: '/images/icons/business.svg', roles: [ROLES.SUPER_ADMIN] },
  { name: 'Coupon Management', href: '/admin/coupon-management', icon: '/images/icons/coupon.svg', roles: [ROLES.SUPER_ADMIN] },
  { name: 'Settings', href: '/admin/settings', icon: Settings, roles: [ROLES.SUPER_ADMIN] },

  // business owner routes
  { name: 'Dashboard', href: '/business/dashboard', icon: LayoutDashboard, roles: [ROLES.BUSINESS_OWNER] },
  { name: 'Lookup', href: '/business/lookup', icon: Search, roles: [ROLES.BUSINESS_OWNER] },
  { name: 'Saved Quotes', href: '/business/saved-quotes', icon: '/images/icons/save.svg', roles: [ROLES.BUSINESS_OWNER] },
  { name: 'Team Management', href: '/business/team-management', icon: Users, roles: [ROLES.BUSINESS_OWNER] },
  { name: 'Settings', href: '/business/settings', icon: Settings, roles: [ROLES.BUSINESS_OWNER] },

  // staff routes
  { name: 'Dashboard', href: '/staff/dashboard', icon: LayoutDashboard, roles: [ROLES.STAFF] },
  { name: 'Lookup', href: '/staff/lookup', icon: Search, roles: [ROLES.STAFF] },
  { name: 'Saved Quotes', href: '/staff/saved-quotes', icon: '/images/icons/save.svg', roles: [ROLES.STAFF] },
  { name: 'Settings', href: '/staff/settings', icon: Settings, roles: [ROLES.STAFF] },

  //common routes
  { name: 'Logout', href: '#', icon: '/images/icons/logout.svg', roles: [ROLES.SUPER_ADMIN, ROLES.STAFF, ROLES.BUSINESS_OWNER], isLogout: true },
];

export const getNavForRole = (role?: AppRole) => {
  if (!role) return [] as NavItem[];
  return NAV_ITEMS.filter(item => item.roles.includes(role));
};

// Grouped view for easier imports per role
export const NAV_ITEMS_BY_ROLE: Record<AppRole, NavItem[]> = {
  [ROLES.SUPER_ADMIN]: getNavForRole(ROLES.SUPER_ADMIN),
  [ROLES.STAFF]: getNavForRole(ROLES.STAFF),
  [ROLES.BUSINESS_OWNER]: getNavForRole(ROLES.BUSINESS_OWNER),
};
