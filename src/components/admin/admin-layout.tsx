"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  LogOut,
  Menu,
  X,
  Newspaper,
  Ticket,
  CreditCard,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/auth-store";
import { useTranslations, useLocale } from "@/hooks/use-locale";
import { LanguageSwitcher } from "@/components/common/language-switcher";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");
  const { locale } = useLocale();
  const { logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const NAV_ITEMS = [
    {
      label: t("layout.sidebar.dashboard"),
      href: "/admin",
      icon: LayoutDashboard,
    },
    { label: t("layout.sidebar.users"), href: "/admin/users", icon: Users },
    { label: t("layout.sidebar.ads"), href: "/admin/ads", icon: Newspaper },
    {
      label: t("layout.sidebar.subscriptions"),
      href: "/admin/subscriptions",
      icon: CreditCard,
    },
    { label: t("layout.sidebar.plans"), href: "/admin/plans", icon: Newspaper },
    {
      label: t("layout.sidebar.coupons"),
      href: "/admin/coupons",
      icon: Ticket,
    },
  ];

  const pathnameWithoutLocale = pathname.replace(/^\/(en|ar)/, "") || "/";

  const handleLogout = () => {
    logout();
    window.location.href = "/auth/signin";
  };

  const isRTL = locale === "ar";

  return (
    <div
      className="flex h-screen bg-gray-50 overflow-hidden"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 ${isRTL ? "right-0" : "left-0"} z-50 w-72 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen
          ? "translate-x-0"
          : isRTL
            ? "translate-x-full"
            : "-translate-x-full"
          }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-24 px-6 border-b border-gray-800">
            <Link href="/admin" className="flex items-center">
              <Image
                src="/images/aqar-new-logo.png"
                alt="Mr aqar Logo"
                width={80}
                height={30}
                className=""
              />
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive =
                pathnameWithoutLocale === item.href ||
                (item.href !== "/admin" &&
                  pathnameWithoutLocale.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                    ? "bg-primary text-white shadow-lg shadow-primary/30"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                    }`}
                >
                  <item.icon size={20} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Bottom section */}
          <div className="px-4 py-4 border-t border-gray-800 space-y-2">
            <ConfirmationDialog
              trigger={
                <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 w-full text-start cursor-pointer">
                  <LogOut size={20} />
                  {t("layout.sidebar.logout")}
                </button>
              }
              title={t("layout.sidebar.logoutConfirmTitle")}
              description={t("layout.sidebar.logoutConfirmDescription")}
              confirmButtonText={t("layout.sidebar.logout")}
              onConfirm={handleLogout}
              icon={{
                src: "/images/icons/logout.svg",
                alt: "Logout",
                bgColor: "bg-red-100",
              }}
            />
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-0 lg:px-8 shrink-0">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden  rounded-lg text-gray-500 hover:bg-gray-100 mx-4"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-gray-600">
                {t("layout.role")}
              </span>
            </div>
          </div>
          <div className="flex items-center">
            <LanguageSwitcher />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto px-4 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
