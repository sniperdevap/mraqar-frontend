import React from 'react';
import Link from 'next/link';
import { Shield, Info, ScrollText, Copyright } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { MenuAuthItems, LanguageToggleItem, LogoutButton, MenuGroup, RowChevron, ROW, ICON_TILE } from './menu-client-items';
import { WhatsAppIcon } from '@/components/icons/whatsapp-icon';

const SUPPORT_WHATSAPP =
  'https://wa.me/96590078005?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D8%8C%20%D8%A3%D8%AD%D8%AA%D8%A7%D8%AC%20%D8%A5%D9%84%D9%89%20%D9%85%D8%B3%D8%A7%D8%B9%D8%AF%D8%A9';
const APP_STORE = 'https://apps.apple.com/kw/app/mr-aqar-%D9%85%D8%B3%D8%AA%D8%B1-%D8%B9%D9%82%D8%A7%D8%B1/id6786697649';
const PLAY_STORE = 'https://play.google.com/store/apps/details?id=com.mraqar.app';

export default async function MenuPage() {
  const t = await getTranslations('common.menu');
  const tFooter = await getTranslations('common.footer');

  const aboutItems = [
    { id: 'about', label: t('aboutUs'), icon: Info, href: '/about' },
    { id: 'privacy', label: t('privacyPolicy'), icon: Shield, href: '/privacy' },
    { id: 'terms', label: t('termsAndConditions'), icon: ScrollText, href: '/terms' },
    { id: 'copyright', label: t('copyrightNotice'), icon: Copyright, href: '/copyright' },
  ];

  return (
    <div className="min-h-[calc(100vh-150px)] bg-[#f8f9fa] pb-28 lg:pb-8">
      <div className="mx-auto max-w-xl px-4 pt-5 space-y-6">
        <MenuAuthItems />

        <MenuGroup title={t('sectionSettings')}>
          <LanguageToggleItem />
        </MenuGroup>

        <MenuGroup title={t('sectionHelp')}>
          <a href={SUPPORT_WHATSAPP} target="_blank" rel="noopener noreferrer" className={ROW}>
            <span className={`${ICON_TILE} bg-[#16A34A]/10 text-[#16A34A]`}>
              <WhatsAppIcon className="size-5" />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-[15px] font-medium text-gray-800">{t('contactSupport')}</span>
              <span className="block text-[13px] text-gray-500">{t('supportHint')}</span>
            </span>
            <RowChevron />
          </a>
        </MenuGroup>

        <MenuGroup title={t('sectionAbout')}>
          {aboutItems.map(item => (
            <Link key={item.id} href={item.href} prefetch className={ROW}>
              <span className={`${ICON_TILE} bg-primary/[0.07] text-primary`}>
                <item.icon size={20} />
              </span>
              <span className="flex-1 text-[15px] font-medium text-gray-800">{item.label}</span>
              <RowChevron />
            </Link>
          ))}
        </MenuGroup>

        <LogoutButton />

        <section className="space-y-3 pt-1 text-center">
          <h2 className="text-[13px] font-semibold text-gray-500">{t('appTitle')}</h2>
          <div className="grid grid-cols-2 gap-3">
            <a href={APP_STORE} target="_blank" rel="noopener noreferrer" className="flex h-14 flex-col items-center justify-center rounded-xl bg-[#1f2937] text-white">
              <span className="text-[11px] opacity-80">{tFooter('downloadOn')}</span>
              <span className="text-[15px] font-semibold leading-5">{tFooter('appStore')}</span>
            </a>
            <a href={PLAY_STORE} target="_blank" rel="noopener noreferrer" className="flex h-14 flex-col items-center justify-center rounded-xl bg-[#1f2937] text-white">
              <span className="text-[11px] opacity-80">{tFooter('downloadOn')}</span>
              <span className="text-[15px] font-semibold leading-5">{tFooter('playStore')}</span>
            </a>
          </div>
          <p className="text-[12px] text-gray-400">{tFooter('allRightsReserved')}</p>
        </section>
      </div>
    </div>
  );
}
