'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';

type EvaluationWhatsAppButtonProps = {
  type: 'indicative' | 'certified';
  locale: string;
  label: string;
  className: string;
};

export function EvaluationWhatsAppButton({
  type,
  locale,
  label,
  className,
}: EvaluationWhatsAppButtonProps) {
  const handleClick = () => {
    const phoneNumber = '96590078005';
    const isAr = locale === 'ar';
    const message =
      type === 'indicative'
        ? isAr
          ? 'مرحبا، أود طلب تقييم استرشادي لعقاري.'
          : 'Hello, I would like to request an Indicative Evaluation for my property.'
        : isAr
          ? 'مرحبا، أود طلب تقييم معتمد لعقاري.'
          : 'Hello, I would like to request a Certified Evaluation for my property.';

    window.open(
      `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`,
      '_blank',
    );
  };

  return (
    <Button onClick={handleClick} className={className}>
      <Image
        src="/images/icons/whatsapp-white-icon.svg"
        alt="WhatsApp"
        width={24}
        height={24}
        className="text-white w-5 h-5 md:w-6 md:h-6"
      />
      {label}
    </Button>
  );
}
