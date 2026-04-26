'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useTranslations } from '@/hooks/use-locale';

interface ConfirmationDialogProps {
  trigger: React.ReactNode;
  icon: {
    src: string;
    alt: string;
    bgColor: string;
  };
  title: string;
  description: string;
  confirmButtonText: string;
  cancelButtonText?: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  buttonOrder?: 'default' | 'reversed'; // 'default': cancel left, confirm right | 'reversed': confirm left, cancel right
  isLoading?: boolean;
}

export function ConfirmationDialog({
  trigger,
  icon,
  title,
  description,
  confirmButtonText,
  cancelButtonText,
  onConfirm,
  onCancel,
  buttonOrder = 'default',
  isLoading = false,
}: ConfirmationDialogProps) {
  const t = useTranslations('common');
  const [open, setOpen] = useState(false);
  const [internalLoading, setInternalLoading] = useState(false);

  const isButtonDisabled = isLoading || internalLoading;

  const handleCancel = () => {
    if (isButtonDisabled) return;
    if (onCancel) {
      onCancel();
    }
    setOpen(false);
  };

  const handleConfirm = async () => {
    if (isButtonDisabled) return;
    setInternalLoading(true);
    try {
      await onConfirm();
      setOpen(false);
    } catch (error) {
      console.log(error);
    } finally {
      setInternalLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-xl px-6 bg-white" showCloseButton={false}>
        <DialogHeader className="text-center mb-6">
          <div className={`mx-auto mb-4 w-16 h-16 ${icon.bgColor} rounded-full flex items-center justify-center`}>
            <Image src={icon.src} alt={icon.alt} width={32} height={32} />
          </div>
          <DialogTitle className="text-xl font-semibold text-black text-center mb-2">{title}</DialogTitle>
          <DialogDescription className="text-black text-center text-md md:px-10">{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col md:flex-row gap-5 items-center !justify-center w-full">
          {buttonOrder === 'reversed' ? (
            <>
              <Button
                className="px-10 h-12 rounded-lg w-full md:w-[180px] bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleConfirm}
                disabled={isButtonDisabled}
              >
                {isButtonDisabled ? t('ads.processing') : confirmButtonText}
              </Button>
              <Button
                variant="outline"
                className="px-10 h-12 rounded-lg w-full md:w-[180px] hover:bg-gray-100 border-gray-light text-black disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleCancel}
                disabled={isButtonDisabled}
              >
                {cancelButtonText || t('buttons.cancel')}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                className="px-10 h-12 rounded-lg w-full md:w-[180px] hover:bg-gray-100 border-gray-light text-black disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleCancel}
                disabled={isButtonDisabled}
              >
                {cancelButtonText || t('buttons.cancel')}
              </Button>
              <Button
                className="px-10 h-12 rounded-lg w-full md:w-[180px] bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleConfirm}
                disabled={isButtonDisabled}
              >
                {isButtonDisabled ? t('ads.processing') : confirmButtonText}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
