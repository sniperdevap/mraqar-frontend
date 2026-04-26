'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, CheckCheck, Trash2, ChevronRight } from 'lucide-react';
import { formatDistanceToNowStrict } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { toast } from 'sonner';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification, deleteAllNotifications, Notification, GetNotificationsResult } from '@/lib/api/account';
import { getErrorMessage } from '@/lib/utils/api';
import { Loader } from '@/components/common/loader';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import Pagination from '@/components/ui/pagination';
import { useLocale, useTranslations } from '@/hooks/use-locale';
import { cn } from '@/lib/utils';

const NOTIFICATIONS_PER_PAGE = 15;

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'subscription_activated':
      return (
        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
      );
    case 'premium_ad_expired':
      return (
        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
      );
    case 'wish_matched':
      return (
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </div>
      );
    default:
      return (
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
          <Bell className="w-5 h-5 text-gray-600" />
        </div>
      );
  }
};

export function NotificationsPage() {
  const router = useRouter();
  const { locale, direction } = useLocale();
  const t = useTranslations('common');
  const [data, setData] = useState<GetNotificationsResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchNotifications = useCallback(async (page: number) => {
    setIsLoading(true);
    try {
      const result = await getNotifications(page, NOTIFICATIONS_PER_PAGE);
      setData(result);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications(currentPage);
  }, [currentPage, fetchNotifications]);

  const getTimeAgo = (date: string) => {
    try {
      const localeObj = locale === 'ar' ? ar : enUS;
      return formatDistanceToNowStrict(new Date(date), {
        addSuffix: true,
        locale: localeObj,
      });
    } catch {
      return '';
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    try {
      if (!notification.isRead) {
        await markNotificationAsRead(notification._id);
        // Update local state
        setData(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            notifications: prev.notifications.map(n => (n._id === notification._id ? { ...n, isRead: true } : n)),
          };
        });
      }

      // Redirect to the appropriate page
      if (notification.redirectUrl) {
        router.push(notification.redirectUrl);
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          notifications: prev.notifications.map(n => ({ ...n, isRead: true })),
        };
      });
      toast.success(t('notifications.markAllReadSuccess'));
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleDeleteNotification = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    try {
      await deleteNotification(notificationId);
      setData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          notifications: prev.notifications.filter(n => n._id !== notificationId),
          total: prev.total - 1,
        };
      });
      toast.success(t('notifications.deleteSuccess'));
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleDeleteAll = async () => {
    try {
      await deleteAllNotifications();
      setData({ notifications: [], total: 0, page: 1, totalPages: 0 });
      toast.success(t('notifications.deleteAllSuccess'));
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const unreadCount = data?.notifications.filter(n => !n.isRead).length ?? 0;

  return (
    <div className="min-h-[calc(100vh-150px)] pb-24 lg:pb-8">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{t('notifications.title')}</h1>
            {unreadCount > 0 && <span className="bg-primary text-white text-xs font-bold px-2.5 py-1 rounded-full">{unreadCount}</span>}
          </div>

          <div className="flex items-center gap-2">
            {data && data.notifications.length > 0 && (
              <>
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-primary transition-colors px-3 py-2 rounded-lg hover:bg-white cursor-pointer"
                  title={t('notifications.readAll')}
                >
                  <CheckCheck size={16} />
                  <span className="hidden sm:inline">{t('notifications.readAll')}</span>
                </button>

                <ConfirmationDialog
                  trigger={
                    <button
                      className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-red-500 transition-colors px-3 py-2 rounded-lg hover:bg-white cursor-pointer"
                      title={t('notifications.clearAll')}
                    >
                      <Trash2 size={16} />
                      <span className="hidden sm:inline">{t('notifications.clearAll')}</span>
                    </button>
                  }
                  title={t('notifications.deleteAllTitle')}
                  description={t('notifications.deleteAllDescription')}
                  confirmButtonText={t('notifications.deleteAllConfirm')}
                  cancelButtonText={t('buttons.cancel')}
                  onConfirm={handleDeleteAll}
                  icon={{ src: '/images/icons/delete.svg', alt: t('buttons.delete'), bgColor: 'bg-red-100' }}
                />
              </>
            )}
          </div>
        </div>

        {/* Notifications List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader />
          </div>
        ) : data && data.notifications.length > 0 ? (
          <>
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              {data.notifications.map((notification, index) => (
                <button
                  key={notification._id}
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    'w-full flex items-start gap-3 p-4 text-left transition-colors hover:bg-gray-50 active:bg-gray-100 cursor-pointer',
                    index !== data.notifications.length - 1 && 'border-b border-gray-50',
                    !notification.isRead && 'bg-primary/[0.03]'
                  )}
                >
                  {/* Icon */}
                  {getNotificationIcon(notification.type)}

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className={cn('text-sm leading-tight', !notification.isRead ? 'font-bold text-gray-900' : 'font-medium text-gray-700')}>
                        {notification.title[locale as 'en' | 'ar'] || notification.title['en']}
                      </h3>
                    </div>
                    <p className="text-[13px] text-gray-500 mt-1 line-clamp-2 leading-relaxed">{notification.message[locale as 'en' | 'ar'] || notification.message['en']}</p>
                    <span className="text-[11px] text-gray-400 mt-1.5 block">{getTimeAgo(notification.createdAt)}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={e => handleDeleteNotification(e, notification._id)}
                      className="p-1.5 text-gray-300 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 cursor-pointer"
                      title={t('notifications.delete')}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </button>
              ))}
            </div>

            {/* Pagination */}
            {data.totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <Pagination totalItems={data.total} pageSize={NOTIFICATIONS_PER_PAGE} currentPage={currentPage} onPageChange={setCurrentPage} />
              </div>
            )}
          </>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Bell size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{t('notifications.noNotifications')}</h3>
            <p className="text-sm text-gray-500 text-center max-w-xs">{t('notifications.noNotificationsDesc')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
