'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { useLocale } from '@/hooks/use-locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MultiSelect } from '@/components/ui/multi-select';
import { Input } from '@/components/ui/input';
import { usePropertyTypes, useAreas } from '@/hooks/use-metadata';
import { toast } from 'sonner';

interface FilterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (filters: { purpose?: string; propertyType?: string; area?: string[]; minPrice?: number; maxPrice?: number }) => void;
  initialFilters?: {
    purpose?: string;
    propertyType?: string;
    area?: string[];
    minPrice?: number;
    maxPrice?: number;
  };
}

export function FilterModal({ open, onOpenChange, onApply, initialFilters }: FilterModalProps) {
  const [purpose, setPurpose] = useState<string>(initialFilters?.purpose || '');
  const [propertyType, setPropertyType] = useState<string>(initialFilters?.propertyType || '');
  const [selectedAreas, setSelectedAreas] = useState<string[]>(initialFilters?.area || []);
  const [minPrice, setMinPrice] = useState<string>(initialFilters?.minPrice?.toString() || '');
  const [maxPrice, setMaxPrice] = useState<string>(initialFilters?.maxPrice?.toString() || '');
  const t = useTranslations('common');
  const { locale } = useLocale();

  const { data: propertyTypesData, isLoading: propertyTypesLoading } = usePropertyTypes();
  const { data: areasData, isLoading: areasLoading } = useAreas();
  const propertyTypes = propertyTypesData || [];
  const areas = areasData || [];
  const isLoading = propertyTypesLoading || areasLoading;

  // Reset to initial filters when modal opens
  useEffect(() => {
    if (open && initialFilters) {
      setPurpose(initialFilters.purpose || '');
      setPropertyType(initialFilters.propertyType || '');
      setSelectedAreas(initialFilters.area || []);
      setMinPrice(initialFilters.minPrice?.toString() || '');
      setMaxPrice(initialFilters.maxPrice?.toString() || '');
    }
  }, [open, initialFilters]);

  const handleApply = () => {
    const filters: {
      purpose?: string;
      propertyType?: string;
      area?: string[];
      minPrice?: number;
      maxPrice?: number;
    } = {};

    if (purpose) {
      filters.purpose = purpose;
    }

    if (propertyType) {
      filters.propertyType = propertyType;
    }

    if (selectedAreas.length > 0) {
      filters.area = selectedAreas;
    }

    if (minPrice) {
      const min = parseFloat(minPrice);
      if (!isNaN(min) && min > 0) {
        filters.minPrice = min;
      }
    }

    if (maxPrice) {
      const max = parseFloat(maxPrice);
      if (!isNaN(max) && max > 0) {
        filters.maxPrice = max;
      }
    }

    // Validate price range
    if (filters.minPrice !== undefined && filters.maxPrice !== undefined) {
      if (filters.minPrice > filters.maxPrice) {
        toast.error(t('ads.priceRangeError'));
        return;
      }
    }

    onApply(filters);
  };

  const handleClear = () => {
    setPurpose('');
    setPropertyType('');
    setSelectedAreas([]);
    setMinPrice('');
    setMaxPrice('');
  };

  const handleReset = () => {
    handleClear();
    onApply({});
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{t('search.filterTitle')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Purpose Tabs */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700">{t('search.listingType')}</label>
            <Tabs value={purpose} onValueChange={setPurpose} className="w-full">
              <TabsList className="grid w-full grid-cols-3 !h-10 sm:!h-12 bg-gray-100 p-1">
                <TabsTrigger value="rent" className="text-base font-medium data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all">
                  {t('ads.rent')}
                </TabsTrigger>
                <TabsTrigger value="sale" className="text-base font-medium data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all">
                  {t('ads.sale')}
                </TabsTrigger>

                <TabsTrigger value="exchange" className="text-base font-medium data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all">
                  {t('ads.exchange')}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Property Type */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">{t('ads.propertyType')}</label>
            <Select value={propertyType} onValueChange={setPropertyType} disabled={isLoading} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
              <SelectTrigger className="!h-10 sm:!h-12 bg-white border-gray-200 hover:border-primary/50 transition-colors">
                <SelectValue placeholder={isLoading ? t('messages.loading') : t('account.allTypes')} />
              </SelectTrigger>
              <SelectContent>
                {propertyTypes.map(type => (
                  <SelectItem key={type._id} value={type._id} className={`cursor-pointer text-base ${locale === 'ar' ? 'text-right pr-2 pl-8 [&>span]:left-2 [&>span]:right-auto' : ''}`}>
                    {locale === 'ar' ? type.labelAr || type.label : type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Area */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">{t('ads.area')}</label>
            <MultiSelect
              options={areas.map(a => ({
                label: locale === 'ar' ? a.labelAr || a.label : a.label,
                value: a._id,
                governorate: locale === 'ar' ? a.governorateAr || a.governorate : a.governorate,
              }))}
              value={selectedAreas}
              onChange={val => setSelectedAreas(val.length > 1 ? val.slice(-1) : val)}
              placeholder={isLoading ? t('messages.loading') : t('search.selectAreas')}
              className="!h-10 sm:!h-12 bg-white border-gray-200 hover:border-primary/50 transition-colors"
              disabled={isLoading}
              enableGrouping={true}
              maxCount={1}
              dir={locale === 'ar' ? 'rtl' : 'ltr'}
            />
          </div>

          {/* Price Range */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">{t('search.priceRange')}</label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-gray-600">{t('search.from')}</label>
                <Input type="number" placeholder={t('search.minPrice')} value={minPrice} onChange={e => setMinPrice(e.target.value)} min="0" step="100" className="h-12" />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-gray-600">{t('search.to')}</label>
                <Input type="number" placeholder={t('search.maxPrice')} value={maxPrice} onChange={e => setMaxPrice(e.target.value)} min="0" step="100" className="h-12" />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-3 sm:gap-2">
          <Button variant="outline" onClick={handleReset} className="w-full sm:w-auto order-2 sm:order-1 hover:border-gray-700 hover:text-gray-700">
            {t('search.clearAll')}
          </Button>
          <div className="flex gap-2 w-full sm:w-auto order-1 sm:order-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1 sm:flex-none hover:border-gray-700 hover:text-gray-700">
              {t('buttons.cancel')}
            </Button>
            <Button onClick={handleApply} className="flex-1 sm:flex-none bg-primary hover:bg-primary/90">
              {t('search.applyFilters')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
