import React from 'react';
import Link from 'next/link';
import { Shield, Info, ScrollText, Headset } from 'lucide-react';
import Image from 'next/image';
import { getLocale, getTranslations } from 'next-intl/server';
import { MenuAuthItems, LanguageToggleItem, LogoutButton } from './menu-client-items';

export default async function MenuPage() {
  const locale = await getLocale();
  const t = await getTranslations('common.menu');

  const staticItems = [
    { id: 'privacy', label: t('privacyPolicy'), icon: Shield, href: '/privacy', color: 'text-primary' },
    { id: 'about', label: t('aboutUs'), icon: Info, href: '/about', color: 'text-primary' },
    { id: 'terms', label: t('termsAndConditions'), icon: ScrollText, href: '/terms', color: 'text-primary' },
    {
      id: 'whatsapp',
      label: t('contactSupport'),
      icon: Headset,
      href: 'https://wa.me/96590078005?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D8%8C%20%D8%A3%D8%AD%D8%AA%D8%A7%D8%AC%20%D8%A5%D9%84%D9%89%20%D9%85%D8%B3%D8%A7%D8%B9%D8%AF%D8%A9',
      color: 'text-primary',
    },
  ];

  return (
    <div className="min-h-[calc(100vh-150px)] bg-[#f8f9fa] pb-24 lg:pb-0">
      <div className="px-4 py-6 space-y-4">
        {/* Evaluation Banner */}
        {/* <Link href="/evaluation" prefetch={true} className="block">
          <div className="bg-white rounded-2xl p-4 border border-gray-200 flex items-center gap-4 relative overflow-hidden active:scale-[0.98] transition-all hover:border-primary/50 cursor-pointer shadow-sm hover:shadow-md">
            <div className="w-16 h-16 bg-[#e6f7f7] rounded-xl flex items-center justify-center shrink-0">
              <Image src="/images/property_evaluation.c6efd28f985c120438a4.png" alt="Evaluation" width={48} height={48} className="object-contain" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-[17px] leading-tight flex items-center gap-2">
                {t('evaluateProperty')}
                <span className="bg-primary text-white text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">New</span>
              </h3>
              <p className="text-gray-500 text-[13px] mt-1">{t('evaluatePropertyDescription')}</p>
            </div>
          </div>
        </Link> */}

        {/* Menu List */}
        <div className="grid grid-cols-2 gap-3">
          <MenuAuthItems />
          <LanguageToggleItem />

          {staticItems.map(item => {
            const isExternal = item.href.startsWith('http');
            return (
              <Link
                key={item.id}
                href={item.href}
                prefetch={isExternal ? undefined : true}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col items-center justify-center gap-3 hover:shadow-md transition-all active:scale-[0.98]"
              >
                <div className={`bg-primary/5 p-3 rounded-full ${item.color}`}>
                  <item.icon size={24} />
                </div>
                <span className="font-medium text-gray-700 text-[14px] text-center">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Logout Section */}
        <LogoutButton />
      </div>
    </div>
  );
}
