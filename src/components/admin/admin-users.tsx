'use client';

import { useState } from 'react';
import { Search, Users as UsersIcon, Eye, Trash2, Lock, Pencil } from 'lucide-react';
import { useAdminUsers } from '@/hooks/use-admin';
import { toggleUserStatus, deleteAdminUser, AdminUser } from '@/lib/api/admin';
import { ChangePasswordModal } from './modals/change-password-modal';
import { EditUserModal } from './modals/edit-user-modal';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import Link from 'next/link';
import { useTranslations, useLocale } from '@/hooks/use-locale';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { Pagination } from '@/components/ui/pagination';
import Image from 'next/image';

export function AdminUsers() {
  const { locale } = useLocale();
  const t = useTranslations('admin.users');
  const tCommon = useTranslations('common');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [statusFilter, setStatusFilter] = useState('all');
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedUserForPassword, setSelectedUserForPassword] = useState<{ id: string; name: string } | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<AdminUser | null>(null);

  const limit = 10;
  const queryClient = useQueryClient();

  const { data, isLoading } = useAdminUsers({
    page,
    limit,
    search: debouncedSearch || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  });

  const users = data?.data || [];
  const pagination = data?.pagination;

  const handleToggleStatus = async (userId: string, userName: string, currentStatus: boolean) => {
    try {
      await toggleUserStatus(userId);
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard-stats'] });
      toast.success(t('messages.statusSuccess', { name: userName, status: t(currentStatus ? 'actions.deactivate' : 'actions.activate').toLowerCase() }));
    } catch (error) {
      toast.error(t('messages.statusError'));
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    try {
      await deleteAdminUser(userId);
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard-stats'] });
      toast.success(t('messages.deleteSuccess', { name: userName }));
    } catch (error) {
      toast.error(t('messages.deleteError'));
    }
  };

  const getRoleBadge = (role: string) => {
    const styles: Record<string, string> = {
      super_admin: 'bg-red-100 text-red-700',
      staff: 'bg-blue-100 text-blue-700',
      business_owner: 'bg-amber-100 text-amber-700',
      user: 'bg-gray-100 text-gray-700',
    };
    const labels: Record<string, string> = {
      super_admin: t('roles.super_admin'),
      staff: t('roles.staff'),
      business_owner: t('roles.business_owner'),
      user: t('roles.user'),
    };
    return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${styles[role] || styles.user}`}>{labels[role] || role}</span>;
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const openPasswordModal = (user: AdminUser) => {
    setSelectedUserForPassword({ id: user._id, name: user.name });
    setIsPasswordModalOpen(true);
  };

  const openEditModal = (user: AdminUser) => {
    setSelectedUserForEdit(user);
    setIsEditModalOpen(true);
  };

  const isRTL = locale === 'ar';

  return (
    <div className="space-y-6 py-4 lg:py-8" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Page header */}
      <div className="text-start">
        <h1 className="text-xl lg:text-3xl font-bold text-gray-900">{t('title')}</h1>
        <p className="text-gray-500 text-sm md:text-md mt-1">{t('description')}</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={18} className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400`} />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={search}
              onChange={e => handleSearchChange(e.target.value)}
              className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all`}
            />
          </div>
          {/* Status filter */}
          <div className="flex bg-gray-100 rounded-xl p-1 shrink-0">
            {['all', 'active', 'inactive'].map(status => (
              <button
                key={status}
                onClick={() => {
                  setStatusFilter(status);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${statusFilter === status ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {status === 'all' ? t('filterAll') : status === 'active' ? t('filterActive') : t('filterInactive')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-50 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : users.length > 0 ? (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-start py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('table.user')}</th>
                    <th className="text-start py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('table.phone')}</th>
                    <th className="text-start py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('table.role')}</th>
                    <th className="text-start py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('table.status')}</th>
                    <th className="text-start py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('table.joined')}</th>
                    <th className={`${isRTL ? 'text-start' : 'text-end'} py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider`}>{t('table.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map(user => (
                    <tr key={user._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200">
                            {user.avatar ? (
                              <Image src={user.avatar.startsWith('http') ? user.avatar : `${process.env.NEXT_PUBLIC_IMAGE_HOST || ''}/${user.avatar}`} alt={user.name} fill className="object-cover" />
                            ) : (
                              <Image src="/images/card-placeholder-1.jpeg" alt="Placeholder Avatar" fill className="object-cover" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm text-start">{user.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600 font-mono text-start" dir="ltr">
                        {user.phoneNumber}
                      </td>
                      <td className="py-4 px-6 text-start">{getRoleBadge(user.role)}</td>
                      <td className="py-4 px-6 text-start">
                        <ConfirmationDialog
                          trigger={
                            <div className="flex items-center gap-3">
                              <Switch checked={user.isActive} onCheckedChange={() => {}} />
                              <span className={`text-sm font-medium ${user.isActive ? 'text-green-600' : 'text-gray-400'} whitespace-nowrap`}>
                                {user.isActive ? t('status.active') : t('status.inactive')}
                              </span>
                            </div>
                          }
                          icon={{
                            src: user.isActive ? '/images/icons/delete.svg' : '/images/icons/star.svg',
                            alt: user.isActive ? t('actions.deactivate') : t('actions.activate'),
                            bgColor: user.isActive ? 'bg-red-100' : 'bg-green-100',
                          }}
                          title={user.isActive ? t('modals.deactivateTitle') : t('modals.activateTitle')}
                          description={t(user.isActive ? 'modals.deactivateDescription' : 'modals.activateDescription', { name: user.name })}
                          confirmButtonText={user.isActive ? t('actions.deactivate') : t('actions.activate')}
                          onConfirm={() => handleToggleStatus(user._id, user.name, user.isActive)}
                        />
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-500 text-start">{new Date(user.createdAt).toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                      <td className="py-4 px-6 text-start">
                        <div className={`flex items-center ${isRTL ? 'justify-start' : 'justify-end'} gap-2`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openPasswordModal(user)}
                            className="h-8 w-8 text-amber-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg"
                            title={t('actions.changePassword')}
                          >
                            <Lock size={18} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditModal(user)}
                            className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                            title={tCommon('buttons.edit')}
                          >
                            <Pencil size={18} />
                          </Button>
                          <Link href={`/${locale}/admin/users/${user._id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg">
                              <Eye size={18} />
                            </Button>
                          </Link>
                          <ConfirmationDialog
                            trigger={
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg">
                                <Trash2 size={18} />
                              </Button>
                            }
                            icon={{
                              src: '/images/icons/delete.svg',
                              alt: tCommon('buttons.delete'),
                              bgColor: 'bg-red-100',
                            }}
                            title={t('modals.deleteTitle')}
                            description={t('modals.deleteDescription', { name: user.name })}
                            confirmButtonText={tCommon('buttons.delete')}
                            onConfirm={() => handleDeleteUser(user._id, user.name)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-gray-50">
              {users.map(user => (
                <div key={user._id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">{user.name?.charAt(0)?.toUpperCase() || '?'}</span>
                      </div>
                      <div className="text-start">
                        <p className="font-semibold text-gray-900 text-sm">{user.name}</p>
                        <p className="text-xs text-gray-500 font-mono" dir="ltr">
                          {user.phoneNumber}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <ConfirmationDialog
                        trigger={
                          <div className="flex items-center gap-2">
                            <Switch checked={user.isActive} onCheckedChange={() => {}} />
                          </div>
                        }
                        icon={{
                          src: user.isActive ? '/images/icons/delete.svg' : '/images/icons/star.svg',
                          alt: user.isActive ? t('actions.deactivate') : t('actions.activate'),
                          bgColor: user.isActive ? 'bg-red-100' : 'bg-green-100',
                        }}
                        title={user.isActive ? t('modals.deactivateTitle') : t('modals.activateTitle')}
                        description={t(user.isActive ? 'modals.deactivateDescription' : 'modals.activateDescription', { name: user.name })}
                        confirmButtonText={user.isActive ? t('actions.deactivate') : t('actions.activate')}
                        onConfirm={() => handleToggleStatus(user._id, user.name, user.isActive)}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-start">
                      {getRoleBadge(user.role)}
                      <span className="text-xs text-gray-400">{new Date(user.createdAt).toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openPasswordModal(user)}
                        className="h-8 w-8 p-0 text-amber-500 border-amber-100 hover:bg-amber-50 rounded-lg"
                        title={t('actions.changePassword')}
                      >
                        <Lock size={16} />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(user)}
                        className="h-8 w-8 p-0 text-blue-500 border-blue-100 hover:bg-blue-50 rounded-lg"
                        title={tCommon('buttons.edit')}
                      >
                        <Pencil size={16} />
                      </Button>
                      <Link href={`/${locale}/admin/users/${user._id}`}>
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0 text-blue-600 border-blue-100 hover:bg-blue-50 rounded-lg">
                          <Eye size={16} />
                        </Button>
                      </Link>
                      <ConfirmationDialog
                        trigger={
                          <Button variant="outline" size="sm" className="h-8 w-8 p-0 text-red-500 border-red-100 hover:bg-red-50 rounded-lg">
                            <Trash2 size={16} />
                          </Button>
                        }
                        icon={{
                          src: '/images/icons/delete.svg',
                          alt: tCommon('buttons.delete'),
                          bgColor: 'bg-red-100',
                        }}
                        title={t('modals.deleteTitle')}
                        description={t('modals.deleteDescription', { name: user.name })}
                        confirmButtonText={tCommon('buttons.delete')}
                        onConfirm={() => handleDeleteUser(user._id, user.name)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <UsersIcon size={48} className="mb-3 opacity-40" />
            <p className="text-sm font-medium">{t('messages.notFound')}</p>
            {debouncedSearch && <p className="text-xs mt-1">{t('messages.tryDifferentSearch')}</p>}
          </div>
        )}

        {/* Pagination */}
        {pagination && (
          <div className="flex justify-center px-6 py-4 border-t border-gray-100">
            <Pagination currentPage={page} totalItems={pagination.total} pageSize={limit} onPageChange={setPage} />
          </div>
        )}
      </div>

      <ChangePasswordModal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} user={selectedUserForPassword} />
      <EditUserModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} user={selectedUserForEdit} />
    </div>
  );
}
