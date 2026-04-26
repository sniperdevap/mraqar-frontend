'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface OfficeSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSearch: (searchTerm: string) => void;
  initialValue?: string;
}

export function OfficeSearchModal({ open, onOpenChange, onSearch, initialValue = '' }: OfficeSearchModalProps) {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const t = useTranslations('common.ads');

  // Update local state when initialValue changes or modal opens
  useEffect(() => {
    if (open) {
      setSearchTerm(initialValue);
    }
  }, [open, initialValue]);

  const handleSearch = () => {
    onSearch(searchTerm);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-6 rounded-2xl border-none">
        <DialogHeader className="relative flex flex-row items-center justify-center pt-2 pb-6">
          <DialogTitle className="text-2xl font-bold text-primary text-center">{t('searchForOffice')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-lg font-semibold text-primary">{t('officeName')}</label>
            <Input
              placeholder={t('enterOfficeName')}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="h-12 bg-white border-gray-200 rounded-lg placeholder:text-gray-300 focus:ring-0 focus:border-gray-300"
            />
          </div>

          <Button onClick={handleSearch} className="w-full h-14 bg-primary hover:bg-primary/80 text-white text-lg font-semibold rounded-xl mt-4 transition-colors">
            {t('search')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
