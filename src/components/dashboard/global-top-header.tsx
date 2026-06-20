"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";
import { useAuthStore } from "@/lib/store/auth-store";
import ROLES from "@/constants/roles";

interface GlobalTopHeaderProps {
  onMenuClick?: () => void;
}

const getDashboardRoute = (role?: string) => {
  switch (role) {
    case ROLES.SUPER_ADMIN:
      return "/admin/dashboard";
    case ROLES.STAFF:
      return "/staff/dashboard";
    case ROLES.BUSINESS_OWNER:
      return "/business/dashboard";
    default:
      return "/admin/dashboard";
  }
};

export function GlobalTopHeader({ onMenuClick }: GlobalTopHeaderProps) {
  const { user } = useAuthStore();
  const dashboardRoute = getDashboardRoute(user?.role);

  return (
    <header className="sticky top-0 z-50 w-full bg-black text-white py-6 lg:px-12 px-6 flex justify-between items-center sticky-header-ios">
      {/* Left side - Menu button (mobile/tablet) or Logo (desktop) */}
      <div className="flex items-center touch-manipulation">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-md hover:bg-gray-800 touch-manipulation"
        >
          <Menu size={20} className="text-white" />
        </button>

        {/* Logo - visible on desktop only */}
        <Link
          href={dashboardRoute}
          className="hidden lg:block touch-manipulation"
        >
          <Image
            src="/images/aqar-new-logo.png"
            alt="Auto Glass Logo"
            width={100}
            height={30}
            className="h-auto cursor-pointer"
          />
        </Link>
      </div>

      {/* Right side - Logo (mobile/tablet) or User Info (desktop) */}
      <div className="flex items-center pe-2 touch-manipulation">
        {/* Logo - visible on mobile/tablet only, positioned on right */}
        <Link href={dashboardRoute} className="lg:hidden touch-manipulation">
          <Image
            src="/images/aqar-new-logo.png"
            alt="Auto Glass Logo"
            width={100}
            height={30}
            className="h-auto cursor-pointer"
          />
        </Link>

        {/* User Info - hidden on mobile/tablet, visible on desktop */}
        <div className="text-left hidden lg:block ml-4">
          <div className="text-lg font-semibold">{user?.name || "User"}</div>
          <div className="text-sm text-gray-300 capitalize">
            {user?.role?.replace("_", " ") || "Role"}
          </div>
        </div>
      </div>
    </header>
  );
}
