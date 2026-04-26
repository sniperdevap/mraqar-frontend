'use client';

import React from 'react';
import { useTranslations, useLocale } from '@/hooks/use-locale';
import { FileText, Award, Users, Zap, ShieldCheck, CheckCircle2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function EvaluationPage() {
  const t = useTranslations('common.evaluation');
  const { direction, locale } = useLocale();

  const indicativeFeatures = t.raw('indicative.features') as string[];
  const certifiedFeatures = t.raw('certified.features') as string[];

  const handleWhatsAppRequest = (type: string) => {
    const phoneNumber = '96590078005';
    const isAr = locale === 'ar';
    const message =
      type === 'indicative'
        ? isAr
          ? 'مرحباً، أود طلب تقييم استرشادي لعقاري.'
          : 'Hello, I would like to request an Indicative Evaluation for my property.'
        : isAr
          ? 'مرحباً، أود طلب تقييم معتمد لعقاري.'
          : 'Hello, I would like to request a Certified Evaluation for my property.';

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]/50 py-12 px-4 sm:px-6 lg:px-8" dir={direction}>
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#1a1c1e] mb-4 tracking-tight">{t('title')}</h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto font-medium">{t('subtitle')}</p>
        </div>

        {/* Evaluation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
          {/* Indicative Evaluation */}
          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-blue-500/5 overflow-hidden border border-gray-100 flex flex-col transition-all hover:shadow-2xl hover:shadow-blue-500/10 group">
            <div className="bg-gradient-to-br from-[#3b82f6] to-[#2563eb] p-10 text-white text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <FileText size={120} />
              </div>
              <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500 shadow-inner">
                <FileText size={36} className="text-white" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">{t('indicative.title')}</h2>
            </div>

            <div className="p-5 lg:p-10 flex-1 flex flex-col">
              <ul className="space-y-6 mb-10 flex-1">
                {indicativeFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-4">
                    <div className="mt-1 bg-blue-50 rounded-full p-1 shrink-0">
                      <CheckCircle2 size={18} className="text-[#3b82f6]" />
                    </div>
                    <span className="text-gray-600 font-medium text-[16px] leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => handleWhatsAppRequest('indicative')}
                className="w-full h-16 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg shadow-blue-500/20"
              >
                <Image src="/images/icons/whatsapp-white-icon.svg" alt="WhatsApp" width={24} height={24} className="text-white w-5 h-5 md:w-6 md:h-6" />
                {t('indicative.button')}
              </Button>
            </div>
          </div>

          {/* Certified Evaluation */}
          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-green-500/5 overflow-hidden border border-gray-100 flex flex-col transition-all hover:shadow-2xl hover:shadow-green-500/10 relative group">
            {/* Recommended Badge */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10">
              <span className="bg-[#facc15] text-[#854d0e] text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-md border-2 border-white">
                {t('certified.recommended')}
              </span>
            </div>

            <div className="bg-gradient-to-br from-[#10b981] to-[#059669] p-10 text-white text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Award size={120} />
              </div>
              <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500 shadow-inner mt-4">
                <Award size={36} className="text-white" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">{t('certified.title')}</h2>
            </div>

            <div className="p-5 lg:p-10 flex-1 flex flex-col">
              <ul className="space-y-6 mb-10 flex-1">
                {certifiedFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-4">
                    <div className="mt-1 bg-green-50 rounded-full p-1 shrink-0">
                      <CheckCircle2 size={18} className="text-[#10b981]" />
                    </div>
                    <span className="text-gray-600 font-medium text-[16px] leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => handleWhatsAppRequest('certified')}
                className="w-full h-16 bg-[#10b981] hover:bg-[#059669] text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg shadow-green-500/20"
              >
                <Image src="/images/icons/whatsapp-white-icon.svg" alt="WhatsApp" width={24} height={24} className="text-white w-5 h-5 md:w-6 md:h-6" />

                {t('certified.button')}
              </Button>
            </div>
          </div>
        </div>

        {/* Why Choose Section */}
        <div className="bg-white rounded-[3rem] p-12 md:p-20 shadow-sm border border-gray-100 mb-12">
          <h2 className="text-3xl font-extrabold text-center text-[#1a1c1e] mb-16">{t('whyChoose.title')}</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <div className="text-center group">
              <div className="w-24 h-24 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:bg-primary transition-colors duration-300">
                <Users size={40} className="text-primary group-hover:text-white transition-colors duration-300" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{t('whyChoose.experts.title')}</h3>
              <p className="text-gray-500 font-medium leading-relaxed">{t('whyChoose.experts.description')}</p>
            </div>

            <div className="text-center group">
              <div className="w-24 h-24 bg-green-50 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:bg-[#10b981] transition-colors duration-300">
                <Zap size={40} className="text-[#10b981] group-hover:text-white transition-colors duration-300" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{t('whyChoose.execution.title')}</h3>
              <p className="text-gray-500 font-medium leading-relaxed">{t('whyChoose.execution.description')}</p>
            </div>

            <div className="text-center group">
              <div className="w-24 h-24 bg-teal-50 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:bg-[#0d9488] transition-colors duration-300">
                <ShieldCheck size={40} className="text-[#0d9488] group-hover:text-white transition-colors duration-300" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{t('whyChoose.accuracy.title')}</h3>
              <p className="text-gray-500 font-medium leading-relaxed">{t('whyChoose.accuracy.description')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
