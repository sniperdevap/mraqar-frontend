'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { createCoupon, updateCoupon, Coupon } from '@/lib/api/coupon';
import { getErrorMessage } from '@/lib/utils/api';
import { useTranslations } from '@/hooks/use-locale';

interface CouponModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coupon?: Coupon | null;
  onSuccess: () => void;
}

export function CouponModal({ open, onOpenChange, coupon, onSuccess }: CouponModalProps) {
  const t = useTranslations('admin');
  const isEdit = !!coupon;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    discountValue: 0,
    userLimit: 0,
    expiryDate: '',
  });

  useEffect(() => {
    if (open) {
      if (coupon) {
        setFormData({
          code: coupon.code,
          discountValue: coupon.discountValue,
          userLimit: coupon.userLimit,
          expiryDate: coupon.expiryDate.split('T')[0],
        });
      } else {
        setFormData({
          code: '',
          discountValue: 0,
          userLimit: 0,
          expiryDate: '',
        });
      }
    }
  }, [open, coupon]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (new Date(formData.expiryDate) <= new Date()) {
        toast.error(t('coupons.messages.expiryError'));
        setIsSubmitting(false);
        return;
      }

      if (isEdit && coupon) {
        await updateCoupon(coupon._id, {
          userLimit: formData.userLimit,
          expiryDate: formData.expiryDate,
          isActive: coupon.isActive,
        });
        toast.success(t('coupons.messages.updateSuccess'));
      } else {
        await createCoupon(formData);
        toast.success(t('coupons.messages.createSuccess'));
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error(getErrorMessage(error) || t(`coupons.messages.${isEdit ? 'updateError' : 'createError'}`));
    } finally {
      setIsSubmitting(false);
    }
  };

  const minDate = new Date().toISOString().split('T')[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl">{isEdit ? t('coupons.modals.editTitle') : t('coupons.modals.createTitle')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 pt-4">
          <div className={`space-y-2 ${isEdit ? 'opacity-60' : ''}`}>
            <Label htmlFor="code" className="text-sm font-semibold">
              {t('coupons.modals.code')} {isEdit && t('coupons.modals.codeHint')}
            </Label>
            <Input
              id="code"
              placeholder={t('coupons.modals.codePlaceholder')}
              className="uppercase h-11"
              required
              disabled={isEdit}
              value={formData.code}
              onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            />
          </div>

          <div className={`space-y-2 ${isEdit ? 'opacity-60' : ''}`}>
            <Label htmlFor="discount" className="text-sm font-semibold">
              {t('coupons.modals.discount')} {isEdit && t('coupons.modals.codeHint')}
            </Label>
            <Input
              id="discount"
              type="number"
              min="1"
              max="100"
              className="h-11"
              required
              disabled={isEdit}
              value={formData.discountValue}
              onChange={e => setFormData({ ...formData, discountValue: parseInt(e.target.value) })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="limit" className="text-sm font-semibold">
              {t('coupons.modals.limit')}
            </Label>
            <Input id="limit" type="number" min="0" className="h-11" required value={formData.userLimit} onChange={e => setFormData({ ...formData, userLimit: parseInt(e.target.value) })} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiry" className="text-sm font-semibold">
              {t('coupons.modals.expiry')}
            </Label>
            <Input id="expiry" type="date" min={minDate} className="h-11 w-full" required value={formData.expiryDate} onChange={e => setFormData({ ...formData, expiryDate: e.target.value })} />
          </div>

          <DialogFooter className="pt-4 flex flex-col sm:flex-row gap-2">
            <Button type="button" variant="outline" className="hover:border-gray-500 hover:text-gray-500" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              {t('coupons.modals.cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
              {isSubmitting ? t('coupons.modals.loading') : isEdit ? t('coupons.modals.save') : t('coupons.modals.create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
