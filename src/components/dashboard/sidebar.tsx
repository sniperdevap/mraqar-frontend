'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { X } from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth-store';
import { cn } from '@/lib/utils';
import { getNavForRole } from '@/constants/routes';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const filteredNavigationItems = getNavForRole(user?.role);

  // Check if we're on a quotes detail page and get the source
  const isQuotesDetailPage = pathname?.match(/\/quotes\/[^/]+$/);
  const source = isQuotesDetailPage ? searchParams?.get('source') : null;

  const handleLogout = () => {
    logout();
    window.location.href = '/auth/signin';
    onClose();
  };

  return (
    <>
      {/* Mobile sidebar overlay */}
      {isOpen && <div className="fixed inset-0 z-40 bg-black/50 bg-opacity-50 lg:hidden" onClick={onClose} />}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 bg-primary shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 sidebar-ios-fix',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full ">
          {/* Mobile/Tablet: Profile Info and Close Button */}
          <div className="lg:hidden border-b border-white/10">
            <div className="flex items-center justify-between px-4 py-6">
              {/* Profile Info */}
              <div className="flex-1">
                <div className="text-lg font-semibold text-white">{user?.name || 'User'}</div>
                <div className="text-sm text-white/70 capitalize">{user?.role?.replace('_', ' ') || 'Role'}</div>
              </div>
              {/* Close Button */}
              <button onClick={onClose} className="rounded-md hover:bg-white/10 p-2">
                <X size={20} className="text-white" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {filteredNavigationItems.map(item => {
              // For lookup items, check if pathname starts with the href to include sub-routes
              // For other items, use exact match
              let isActive = item.name === 'Lookup' ? pathname.startsWith(item.href) : pathname === item.href;

              // Special handling for quotes detail page: activate sidebar item based on source
              if (isQuotesDetailPage && source) {
                if (source === 'saved-quotes' && item.name === 'Saved Quotes') {
                  isActive = true;
                } else if (source === 'dashboard' && item.name === 'Dashboard') {
                  isActive = true;
                } else if (item.name === 'Saved Quotes' || item.name === 'Dashboard') {
                  isActive = false;
                }
              }
              const isSvgIcon = typeof item.icon === 'string';

              // Render icon helper
              const renderIcon = () => {
                if (isSvgIcon) {
                  // For SVG: white when inactive, primary color when active
                  return (
                    <div
                      className={cn('mr-3 flex items-center', isActive ? 'text-primary-blue' : 'text-white')}
                      style={
                        isActive
                          ? {
                              filter: 'brightness(0) saturate(100%) invert(11%) sepia(91%) saturate(5432%) hue-rotate(349deg) brightness(85%) contrast(98%)',
                            }
                          : {
                              filter: 'brightness(0) invert(1)',
                            }
                      }
                    >
                      <Image src={item.icon as string} alt={item.name} width={20} height={20} />
                    </div>
                  );
                } else {
                  // For Lucide icons: white when inactive, primary color when active
                  const Icon = item.icon as React.ComponentType<{ size?: number; className?: string }>;
                  return <Icon size={20} className={cn('mr-3', isActive ? 'text-primary-blue' : 'text-white')} />;
                }
              };

              // Special handling for Logout
              if (item.isLogout) {
                return (
                  <ConfirmationDialog
                    key={item.name}
                    trigger={
                      <button
                        className={cn('w-full flex items-center px-5 py-5 text-sm font-medium rounded-sm transition-colors cursor-pointer', 'text-white/80 hover:bg-white/10 hover:text-white')}
                      >
                        {renderIcon()}
                        {item.name}
                      </button>
                    }
                    icon={{
                      src: '/images/icons/logout.svg',
                      alt: 'Logout',
                      bgColor: 'bg-primary',
                    }}
                    title="Are you sure you want to Logout?"
                    description="You'll be logged out from your account and will need to log in again to continue."
                    confirmButtonText="Logout"
                    cancelButtonText="Cancel"
                    onConfirm={handleLogout}
                    onCancel={() => {}}
                  />
                );
              }

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center px-5 py-5 text-sm font-medium rounded-sm transition-colors',
                    isActive ? 'bg-white text-primary-blue font-semibold' : 'text-white/80 hover:bg-white/10 hover:text-white'
                  )}
                >
                  {renderIcon()}
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}
