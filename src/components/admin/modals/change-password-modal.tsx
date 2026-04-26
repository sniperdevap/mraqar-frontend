'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { changeUserPassword } from '@/lib/api/admin';
import { toast } from 'sonner';
import { useTranslations, useLocale } from '@/hooks/use-locale';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: { id: string; name: string } | null;
}

export function ChangePasswordModal({ isOpen, onClose, user }: ChangePasswordModalProps) {
  const { locale } = useLocale();
  const t = useTranslations('admin.users');
  const [newPassword, setNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error(t('messages.passwordMinLength'));
      return;
    }
    if (!user) return;

    try {
      setIsChangingPassword(true);
      await changeUserPassword(user.id, newPassword);
      toast.success(t('messages.passwordSuccess', { name: user.name }));
      onClose();
      setNewPassword('');
    } catch (error) {
      toast.error(t('messages.passwordError'));
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (!isOpen || !user) return null;

  const isRTL = locale === 'ar';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl relative animate-in fade-in zoom-in duration-200">
        <h3 className="text-xl font-bold text-gray-900 mb-2 truncate text-start">{t('modals.passwordTitle')}</h3>
        <p className="text-gray-500 text-sm mb-6 text-start">{t('modals.passwordDescription', { name: user.name })}</p>

        <div className="space-y-4">
          <div className="text-start">
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('modals.passwordLabel')}</label>
            <input
              type="text"
              placeholder={t('modals.passwordPlaceholder')}
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          <div className={`flex items-center ${isRTL ? 'justify-start' : 'justify-end'} gap-3 mt-8`}>
            <Button variant="outline" className="h-10 hover:text-gray-500 hover:border-gray-500" onClick={onClose} disabled={isChangingPassword}>
              {t('modals.cancel')}
            </Button>
            <Button className="h-10" onClick={handleChangePassword} disabled={isChangingPassword || newPassword.length < 6}>
              {isChangingPassword ? t('modals.saving') : t('modals.save')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
