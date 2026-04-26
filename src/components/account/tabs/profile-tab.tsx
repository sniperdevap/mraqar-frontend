'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Edit2, Phone, Instagram, Music2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import dynamic from 'next/dynamic';

const EditProfileModal = dynamic(() => import('../modals/edit-profile-modal').then(mod => mod.EditProfileModal));
const Loader = dynamic(() => import('@/components/common/loader').then(mod => mod.Loader));
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useProfile } from '@/hooks/use-account';

export function ProfileTab() {
  const router = useRouter();
  const t = useTranslations('common.account');
  const queryClient = useQueryClient();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { data: profile, isLoading } = useProfile();

  const handleProfileUpdated = () => {
    queryClient.invalidateQueries({ queryKey: ['profile'] });
    queryClient.invalidateQueries({ queryKey: ['office'] });
    queryClient.invalidateQueries({ queryKey: ['offices'] });
    setIsEditModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center ">
        <Loader />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <p className="text-gray-500">{t('failedToLoadProfile')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 lg:px-0 py-4">
      {/* Compact Header */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <h2 className="text-lg font-bold text-gray-900 tracking-tight">{t('profileInfo')}</h2>
        <div className="flex items-center gap-2 justify-between w-full">
          <Button onClick={() => router.push('/plans')} size="sm" className="bg-primary hover:bg-primary/90 h-9 px-4 text-xs font-bold">
            {t('adBalance')}
          </Button>
          <Button onClick={() => setIsEditModalOpen(true)} size="sm" variant="outline" className="h-9 border-gray-200 text-gray-700 hover:bg-gray-50 gap-2 font-semibold text-xs">
            <Edit2 size={14} />
            {t('editProfile')}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Profile Card */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Top Section: Avatar & Info */}
          <div className="p-4 sm:p-5 flex items-center gap-4 border-b border-gray-50">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-gray-50 border border-gray-100 ring-4 ring-gray-50/50 flex-shrink-0">
              {profile.avatar ? (
                <Image src={profile.avatar.startsWith('http') ? profile.avatar : `${process.env.NEXT_PUBLIC_IMAGE_HOST || ''}/${profile.avatar}`} alt={profile.name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                  <User size={32} />
                </div>
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 leading-tight break-words">{profile.name}</h3>
              <p className="text-gray-400 text-xs mt-1" dir="ltr">
                {profile.phoneNumber}
              </p>
            </div>
          </div>

          {/* Details Section */}
          <div className="p-4 sm:p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500">{t('fullName')}</label>
                <div className="flex items-center gap-2 text-gray-800">
                  <User size={16} className="text-primary-blue opacity-70" />
                  <span className="text-sm font-medium">{profile.name}</span>
                </div>
              </div>

              {/* Phone Num */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500">{t('phoneNumber')}</label>
                <div className="flex items-center gap-2 text-gray-800">
                  <Phone size={16} className="text-primary-blue opacity-70" />
                  <span className="text-sm font-medium" dir="ltr">
                    {profile.phoneNumber}
                  </span>
                </div>
              </div>

              {/* Instagram */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500">{t('instagram')}</label>
                <div className="flex items-center gap-2">
                  <Instagram size={16} className="text-pink-500" />
                  {profile.instagram ? (
                    <a
                      href={profile?.instagram?.startsWith('http') ? profile.instagram : `https://instagram.com/${profile.instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      {profile.instagram}
                    </a>
                  ) : (
                    <span className="text-sm font-medium text-gray-300">——</span>
                  )}
                </div>
              </div>

              {/* TikTok */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-500">{t('tiktok')}</label>
                <div className="flex items-center gap-2">
                  <Music2 size={16} className="text-gray-900" />
                  {profile.tiktok ? (
                    <a
                      href={profile?.tiktok?.startsWith('http') ? profile.tiktok : `https://tiktok.com/@${profile.tiktok}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      {profile.tiktok}
                    </a>
                  ) : (
                    <span className="text-sm font-medium text-gray-300">——</span>
                  )}
                </div>
              </div>
            </div>

            {/* About */}
            <div className="pt-4 border-t border-gray-50">
              <label className="text-sm font-medium text-gray-500 block mb-1.5">{t('about')}</label>
              <p className="text-sm text-gray-600 leading-relaxed bg-gray-50/50 p-3 rounded-lg border border-gray-50">{profile.description ? profile.description : '——'}</p>
            </div>
          </div>
        </div>

        {/* Account Controls */}
        <div className="flex justify-center pt-2">
          <button onClick={() => router.push('/contact?action=delete')} className="text-red-400 hover:text-red-500 text-xs font-semibold px-4 py-2 hover:bg-red-50 rounded-lg transition-colors">
            {t('deleteAccount')}
          </button>
        </div>
      </div>

      <EditProfileModal open={isEditModalOpen} onOpenChange={setIsEditModalOpen} profile={profile} onSuccess={handleProfileUpdated} />
    </div>
  );
}
