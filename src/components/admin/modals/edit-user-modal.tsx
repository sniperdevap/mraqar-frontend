'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { updateAdminUser, AdminUser } from '@/lib/api/admin';
import { uploadMedia } from '@/lib/api/media';
import { toast } from 'sonner';
import { useTranslations, useLocale } from '@/hooks/use-locale';
import { useQueryClient } from '@tanstack/react-query';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AdminUser | null;
}

export function EditUserModal({ isOpen, onClose, user }: EditUserModalProps) {
  const { locale } = useLocale();
  const t = useTranslations('admin.users');
  const tCommon = useTranslations('common');
  const queryClient = useQueryClient();

  const [editForm, setEditForm] = useState({
    name: '',
    instagram: '',
    tiktok: '',
    description: '',
    avatar: '',
  });
  const [isUpdatingUser, setIsUpdatingUser] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setEditForm({
        name: user.name || '',
        instagram: user.instagram || '',
        tiktok: user.tiktok || '',
        description: user.description || '',
        avatar: user.avatar || '',
      });
      setAvatarPreview(null);
      setSelectedFile(null);
    }
  }, [user]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Store file for later upload
    setSelectedFile(file);
  };

  const handleUpdateUser = async () => {
    if (!user) return;
    if (!editForm.name) {
      toast.error(t('messages.nameRequired'));
      return;
    }

    try {
      setIsUpdatingUser(true);

      let avatarUrl = editForm.avatar;

      // Upload image if selected
      if (selectedFile) {
        try {
          const uploaded = await uploadMedia(selectedFile);
          avatarUrl = uploaded.url;
        } catch (error) {
          console.error('Failed to upload image:', error);
          toast.error('Failed to upload image');
          setIsUpdatingUser(false);
          return;
        }
      }

      await updateAdminUser(user._id, { ...editForm, avatar: avatarUrl });
      toast.success(tCommon('messages.success'));
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      onClose();
    } catch (error) {
      toast.error(tCommon('messages.error'));
    } finally {
      setIsUpdatingUser(false);
    }
  };

  if (!isOpen || !user) return null;

  const isRTL = locale === 'ar';
  const displayAvatar = avatarPreview || (editForm.avatar ? (editForm.avatar.startsWith('http') ? editForm.avatar : `${process.env.NEXT_PUBLIC_IMAGE_HOST || ''}/${editForm.avatar}`) : null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="bg-white rounded-3xl w-full max-w-lg p-8 shadow-2xl relative animate-in fade-in zoom-in duration-200">
        <h3 className="text-2xl font-bold text-gray-900 mb-2 text-start">{t('modals.editTitle')}</h3>
        <p className="text-gray-500 text-sm mb-8 text-start">{t('modals.editDescription', { name: user.name })}</p>

        <div className="space-y-5">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200">
              {displayAvatar ? (
                <Image src={displayAvatar} alt="Avatar" fill className="object-cover" />
              ) : (
                <Image src="/images/card-placeholder-1.jpeg" alt="Placeholder Avatar" fill className="object-cover" />
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" disabled={isUpdatingUser} />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 hover:bg-gray-100 hover:text-gray-700 rounded-2xl"
              disabled={isUpdatingUser}
            >
              <Upload size={18} />
              {tCommon('account.uploadAvatar')}
            </Button>
          </div>

          <div className="text-start">
            <label className="block text-sm font-semibold text-gray-700 mb-2">{tCommon('account.fullName')}</label>
            <input
              type="text"
              value={editForm.name}
              onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-start">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{tCommon('account.instagram')}</label>
              <input
                type="text"
                value={editForm.instagram}
                onChange={e => setEditForm(prev => ({ ...prev, instagram: e.target.value }))}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm"
                placeholder="username"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{tCommon('account.tiktok')}</label>
              <input
                type="text"
                value={editForm.tiktok}
                onChange={e => setEditForm(prev => ({ ...prev, tiktok: e.target.value }))}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm"
                placeholder="username"
              />
            </div>
          </div>

          <div className="text-start">
            <label className="block text-sm font-semibold text-gray-700 mb-2">{tCommon('account.about')}</label>
            <textarea
              rows={4}
              value={editForm.description}
              onChange={e => setEditForm(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm resize-none"
            />
          </div>

          <div className={`flex items-center ${isRTL ? 'justify-start' : 'justify-end'} gap-3 mt-10`}>
            <Button variant="outline" onClick={onClose} disabled={isUpdatingUser} className="rounded-2xl px-6">
              {tCommon('buttons.cancel')}
            </Button>
            <Button onClick={handleUpdateUser} disabled={isUpdatingUser} className="rounded-2xl px-8 bg-primary hover:bg-primary/90">
              {isUpdatingUser ? tCommon('messages.loading') : tCommon('buttons.save')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
