'use client';

import React, { useState } from 'react';
import { Pencil, DollarSign, Calendar, Hash, Zap, Percent } from 'lucide-react';
import { useTranslations, useLocale } from '@/hooks/use-locale';
import { SubscriptionPlan, updateSubscriptionPlan } from '@/lib/api/admin';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

interface AdminPlanEditModalProps {
  plan: SubscriptionPlan | null;
  onClose: () => void;
}

export function AdminPlanEditModal({ plan, onClose }: AdminPlanEditModalProps) {
  const queryClient = useQueryClient();
  const t = useTranslations('admin');
  const { direction } = useLocale();
  const isRTL = direction === 'rtl';
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdatePlan = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!plan) return;

    setIsUpdating(true);
    try {
      const formData = new FormData(e.currentTarget);
      const data = {
        name: formData.get('name') as string,
        nameAr: formData.get('nameAr') as string,
        description: formData.get('description') as string,
        price: Number(formData.get('price')),
        numberOfMonths: Number(formData.get('numberOfMonths')),
        normalAds: Number(formData.get('normalAds')),
        premiumAds: Number(formData.get('premiumAds')),
        discount: Number(formData.get('discount')),
      };

      await updateSubscriptionPlan(plan._id, data);
      queryClient.invalidateQueries({ queryKey: ['admin', 'plans'] });
      toast.success(t('plans.messages.updateSuccess'));
      onClose();
    } catch (error) {
      console.error('Update plan failed:', error);
      toast.error(t('plans.messages.updateError'));
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={!!plan} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] w-[95vw] max-h-[90vh] p-0 border-none overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        <form onSubmit={handleUpdatePlan} className="flex flex-col overflow-hidden max-h-[90vh]">
          {/* Header - Fixed */}
          <DialogHeader className="bg-gray-50/80 backdrop-blur-md px-6 py-4 md:px-8 md:py-5 border-b border-gray-100 shrink-0">
            <div className="flex items-center gap-4">
              <div className="min-w-0">
                <DialogTitle className="text-lg md:text-2xl font-black text-gray-900 uppercase tracking-tight truncate">{t('plans.modals.editTitle')}</DialogTitle>
                <DialogDescription className="text-gray-500 font-medium mt-0.5 md:mt-1 text-xs md:text-sm">{t('plans.modals.editDescription')}</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Body - Scrollable */}
          <div className="flex-1 overflow-y-auto min-h-0 px-6 py-6 md:px-8 md:py-6 space-y-5 md:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
              {/* Name EN */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-400">
                  {t('plans.modals.nameEn')}
                </Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={plan?.name}
                  required
                  className="h-10 md:h-12 bg-gray-50/30 focus:bg-white focus:ring-primary/20 transition-all font-medium text-sm md:text-base"
                />
              </div>

              {/* Name AR */}
              <div className="space-y-2">
                <Label htmlFor="nameAr" className="text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-400">
                  {t('plans.modals.nameAr')}
                </Label>
                <Input
                  id="nameAr"
                  name="nameAr"
                  defaultValue={plan?.nameAr}
                  required
                  className="h-10 md:h-12  bg-gray-50/30 focus:bg-white focus:ring-primary/20 transition-all font-medium text-sm md:text-base text-end"
                  dir="rtl"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-400">
                {t('plans.modals.description')}
              </Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={plan?.description}
                required
                className=" bg-gray-50/30 focus:bg-white focus:ring-primary/20 transition-all font-medium min-h-[100px] text-sm md:text-base leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {/* Price */}
              <div className="space-y-2 col-span-1 min-w-0">
                <Label htmlFor="price" className="text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-400 min-h-[32px] flex items-end pb-1">
                  {t('plans.modals.price')}
                </Label>
                <div className="relative">
                  <DollarSign className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400`} size={14} />
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.001"
                    defaultValue={plan?.price}
                    required
                    className={`h-10 md:h-12 ${isRTL ? 'pr-10' : 'pl-10'}  bg-gray-50/30 focus:bg-white focus:ring-primary/20 transition-all font-bold text-sm md:text-base`}
                  />
                </div>
              </div>

              {/* Duration */}
              <div className="space-y-2 col-span-1 min-w-0">
                <Label htmlFor="numberOfMonths" className="text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-400 min-h-[32px] flex items-end pb-1">
                  {t('plans.modals.months')}
                </Label>
                <div className="relative">
                  <Calendar className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400`} size={14} />
                  <Input
                    id="numberOfMonths"
                    name="numberOfMonths"
                    type="number"
                    defaultValue={plan?.numberOfMonths}
                    required
                    className={`h-10 md:h-12 ${isRTL ? 'pr-10' : 'pl-10'}  bg-gray-50/30 focus:bg-white focus:ring-primary/20 transition-all font-bold text-sm md:text-base`}
                  />
                </div>
              </div>

              {/* Normal Ads */}
              <div className="space-y-2 col-span-1 min-w-0">
                <Label htmlFor="normalAds" className="text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-400 min-h-[32px] flex items-end pb-1">
                  {t('plans.modals.normalLimit')}
                </Label>
                <div className="relative">
                  <Hash className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400`} size={14} />
                  <Input
                    id="normalAds"
                    name="normalAds"
                    type="number"
                    defaultValue={plan?.normalAds}
                    required
                    className={`h-10 md:h-12 ${isRTL ? 'pr-10' : 'pl-10'}  bg-gray-50/30 focus:bg-white focus:ring-primary/20 transition-all font-bold text-sm md:text-base`}
                  />
                </div>
              </div>

              {/* Premium Ads */}
              <div className="space-y-2 col-span-1 min-w-0">
                <Label htmlFor="premiumAds" className="text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-400 min-h-[32px] flex items-end pb-1">
                  {t('plans.modals.premiumLimit')}
                </Label>
                <div className="relative">
                  <Zap className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-primary`} size={14} />
                  <Input
                    id="premiumAds"
                    name="premiumAds"
                    type="number"
                    defaultValue={plan?.premiumAds}
                    required
                    className={`h-10 md:h-12 ${isRTL ? 'pr-10' : 'pl-10'}  bg-gray-50/30 focus:bg-white focus:ring-primary/20 transition-all font-bold text-sm md:text-base text-primary`}
                  />
                </div>
              </div>
            </div>

            {/* Discount */}
            <div className="space-y-2">
              <Label htmlFor="discount" className="text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-400">
                {t('plans.modals.discount')}
              </Label>
              <div className="relative">
                <Percent className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400`} size={14} />
                <Input
                  id="discount"
                  name="discount"
                  type="number"
                  min="0"
                  max="100"
                  defaultValue={plan?.discount || 0}
                  required
                  className={`h-10 md:h-12 ${isRTL ? 'pr-10' : 'pl-10'}  bg-gray-50/30 focus:bg-white focus:ring-primary/20 transition-all font-bold text-sm md:text-base`}
                />
              </div>
            </div>
          </div>

          {/* Footer - Fixed */}
          <DialogFooter className="bg-gray-50/80 backdrop-blur-md px-6 py-4 md:px-8 md:pt-4 border-t border-gray-100 shrink-0 flex flex-row items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 md:flex-none rounded-xl h-10 md:h-12 px-4 md:px-8 font-bold hover:bg-white hover:text-primary hover:border-primary/30 transition-all text-xs md:text-sm"
            >
              {t('plans.modals.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isUpdating}
              className="flex-1 md:flex-none rounded-xl h-10 md:h-12 px-6 md:px-12 font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-xs md:text-sm"
            >
              {isUpdating ? t('plans.modals.saving') : t('plans.modals.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
