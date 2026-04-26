'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface SendQuoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSend: (method: 'email' | 'sms') => void;
  hasEmail?: boolean;
  hasPhone?: boolean;
}

export function SendQuoteModal({ open, onOpenChange, onSend, hasEmail = false, hasPhone = false }: SendQuoteModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<'email' | 'sms'>('email');

  useEffect(() => {
    if (open) {
      if (hasEmail && hasPhone) {
        setSelectedMethod('email');
      } else if (hasEmail) {
        setSelectedMethod('email');
      } else if (hasPhone) {
        setSelectedMethod('sms');
      } else {
        setSelectedMethod('email');
      }
    }
  }, [open, hasEmail, hasPhone]);

  const handleSend = () => {
    onSend(selectedMethod);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] sm:max-w-4xl p-6  md:p-8 lg:p-12 bg-white" showCloseButton={false}>
        <DialogHeader className="text-left mb-3 sm:mb-4 md:mb-8">
          <DialogTitle className="text-xl sm:text-2xl md:text-3xl font-bold text-primary leading-tight mb-0">Send Quote</DialogTitle>
          <DialogDescription className="text-sm sm:text-base font-normal text-secondary/60">Choose how to send the quote to the customer.</DialogDescription>
        </DialogHeader>

        <div className="space-y-2 sm:space-y-3 md:space-y-4 mb-4 sm:mb-5 ">
          {/* Send via Email Option */}
          <button
            type="button"
            onClick={() => hasEmail && setSelectedMethod('email')}
            disabled={!hasEmail}
            className={cn(
              'w-full text-left p-3 sm:p-4 md:p-5 rounded-lg border-2 transition-all h-[102px]',
              !hasEmail && 'opacity-50 cursor-not-allowed',
              hasEmail && 'cursor-pointer',
              selectedMethod === 'email' && hasEmail ? 'bg-[#DBEAFEB2] border-1 border-primary-blue' : hasEmail ? 'bg-white border-[#E2E2E2] hover:border-gray-300' : 'bg-gray-100 border-[#E2E2E2]'
            )}
          >
            <div className="flex flex-col items-start gap-1.5 sm:gap-2">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex-shrink-0">
                  <Image src="/images/icons/mail.svg" alt="Email" width={24} height={24} className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h4 className="text-sm sm:text-base font-semibold text-primary">Send via Email</h4>
              </div>
              <p className="text-xs sm:text-sm font-normal text-secondary leading-relaxed">Send this information directly to the recipient&apos;s email address.</p>
            </div>
          </button>

          {/* Send via SMS Option */}
          <button
            type="button"
            onClick={() => hasPhone && setSelectedMethod('sms')}
            disabled={!hasPhone}
            className={cn(
              'w-full text-left p-3 sm:p-4 md:p-5 rounded-lg border-2 transition-all h-[102px]',
              !hasPhone && 'opacity-50 cursor-not-allowed',
              hasPhone && 'cursor-pointer',
              selectedMethod === 'sms' && hasPhone
                ? 'bg-[#DBEAFEB2] border-1 border-primary-blue'
                : hasPhone
                  ? 'bg-white border-1 border-[#E2E2E2] hover:border-gray-300'
                  : 'bg-gray-100 border-[#E2E2E2]'
            )}
          >
            <div className="flex flex-col items-start gap-1.5 sm:gap-2">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex-shrink-0">
                  <Image src="/images/icons/chat.svg" alt="SMS" width={24} height={24} className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h4 className="text-sm sm:text-base font-semibold text-primary">Send via SMS</h4>
              </div>
              <p className="text-xs sm:text-sm font-normal text-secondary leading-relaxed">Send this message instantly to the recipient&apos;s phone via SMS.</p>
            </div>
          </button>
        </div>

        <DialogFooter className="flex-row justify-end gap-2 sm:gap-3 md:gap-4 -mx-4 sm:-mx-6 md:-mx-8 lg:-mx-12 px-4 sm:px-6 md:px-8 lg:px-12">
          <Button
            type="button"
            onClick={handleCancel}
            variant="outline"
            className="border-[#E2E2E2] text-secondary flex-1 sm:flex-none hover:bg-gray-50 px-3 sm:px-4 md:px-6 rounded-lg font-normal text-sm sm:text-base h-10 sm:h-11 sm:w-36"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSend}
            className="bg-blue-primary hover:bg-blue-primary/90 text-white flex-1 sm:flex-none sm:w-36 px-3 sm:px-4 md:px-6 rounded-lg font-semibold text-sm sm:text-base h-10 sm:h-11"
          >
            Send Quote
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
