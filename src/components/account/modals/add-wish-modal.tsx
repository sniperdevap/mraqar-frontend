'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { createWishlist, CreateWishlistRequest } from '@/lib/api/account';
import { getPropertyTypes, getAreas, PropertyType, Area } from '@/lib/api/metadata';
import { toast } from 'sonner';

interface AddWishModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

import { useTranslations } from 'next-intl';
import { useLocale } from '@/hooks/use-locale';

export function AddWishModal({ open, onOpenChange, onSuccess }: AddWishModalProps) {
  const t = useTranslations('common.account');
  const { locale } = useLocale();
  const [formData, setFormData] = useState<CreateWishlistRequest>({
    purpose: undefined,
    propertyType: undefined,
    area: undefined,
    minPrice: undefined,
    maxPrice: undefined,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);

  useEffect(() => {
    if (open) {
      fetchOptions();
      // Reset form when modal opens
      setFormData({
        purpose: undefined,
        propertyType: undefined,
        area: undefined,
        minPrice: undefined,
        maxPrice: undefined,
      });
    }
  }, [open]);

  const fetchOptions = async () => {
    setIsLoadingOptions(true);
    try {
      const [types, areaList] = await Promise.all([getPropertyTypes(), getAreas()]);
      setPropertyTypes(types);
      setAreas(areaList);
    } catch (error) {
      console.error('Failed to fetch options:', error);
      toast.error(t('failedToLoadOptions'));
    } finally {
      setIsLoadingOptions(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate at least one field is filled
    if (!formData.purpose && !formData.propertyType && !formData.area && !formData.minPrice && !formData.maxPrice) {
      toast.error(t('fillOneField'));
      return;
    }

    // Validate price range
    if (formData.minPrice !== undefined && formData.maxPrice !== undefined) {
      if (formData.minPrice > formData.maxPrice) {
        toast.error(t('priceRangeError'));
        return;
      }
    }

    setIsLoading(true);
    try {
      await createWishlist(formData);
      toast.success(t('wishAdded'));
      onSuccess();
    } catch (error) {
      console.error('Failed to create wishlist:', error);
      toast.error(t('failedToAddWish'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{t('addWishTitle')}</DialogTitle>
          <p className="text-sm text-gray-600 mt-2">{t('addWishDescription')}</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Purpose */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">{t('purpose')}</label>
            <Select value={formData.purpose || 'all'} onValueChange={value => setFormData(prev => ({ ...prev, purpose: value === 'all' ? undefined : value }))} disabled={isLoadingOptions}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder={t('selectPurpose')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allPurposes')}</SelectItem>
                <SelectItem value="sale">{t('sale')}</SelectItem>
                <SelectItem value="rent">{t('rent')}</SelectItem>
                <SelectItem value="exchange">{t('exchange')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Property Type */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">{t('propertyType')}</label>
            <Select value={formData.propertyType || 'all'} onValueChange={value => setFormData(prev => ({ ...prev, propertyType: value === 'all' ? undefined : value }))} disabled={isLoadingOptions}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder={t('selectType')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allTypes')}</SelectItem>
                {propertyTypes.map(type => (
                  <SelectItem key={type.id} value={String(type.id)}>
                    {locale === 'ar' ? type.labelAr || type.label : type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Area */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">{t('area')}</label>
            <Select value={formData.area || 'all'} onValueChange={value => setFormData(prev => ({ ...prev, area: value === 'all' ? undefined : value }))} disabled={isLoadingOptions}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder={t('selectArea')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allAreas')}</SelectItem>
                {areas.map(area => (
                  <SelectItem key={area.id} value={String(area.id)}>
                    {locale === 'ar' ? area.labelAr || area.label : area.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Price Range */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">{t('priceRange')}</label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-gray-600">{t('from')}</label>
                <Input
                  type="number"
                  placeholder={t('minPrice')}
                  value={formData.minPrice?.toString() || ''}
                  onChange={e => setFormData(prev => ({ ...prev, minPrice: e.target.value ? parseFloat(e.target.value) : undefined }))}
                  min="0"
                  step="100"
                  className="h-12"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-gray-600">{t('to')}</label>
                <Input
                  type="number"
                  placeholder={t('maxPrice')}
                  value={formData.maxPrice?.toString() || ''}
                  onChange={e => setFormData(prev => ({ ...prev, maxPrice: e.target.value ? parseFloat(e.target.value) : undefined }))}
                  min="0"
                  step="100"
                  className="h-12"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading} className="hover:border-black/80 hover:text-black">
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={isLoading || isLoadingOptions} className="bg-primary hover:bg-primary/90">
              {isLoading ? t('adding') : t('add')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
