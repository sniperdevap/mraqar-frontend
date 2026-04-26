'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { vinLookupSchema, ymmLookupSchema, type VinLookupInput, type YMMLookupInput } from '@/lib/schemas/lookup';
import { SegmentedTabs } from '@/components/ui/segmented-tabs';
import { VinLookupForm } from './vin-lookup-form';
import { YMMLookupForm } from './ymm-lookup-form';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import ROLES from '@/constants/roles';

type ActiveTab = 'vin' | 'ymm';

export function VehicleLookup() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('vin');
  const router = useRouter();
  const { user } = useAuthStore();

  // Determine basePath from user role
  const basePath = useMemo(() => {
    if (user?.role === ROLES.BUSINESS_OWNER) {
      return '/business';
    }
    if (user?.role === ROLES.STAFF) {
      return '/staff';
    }
    return '/business'; // Default fallback
  }, [user?.role]);

  const vinForm = useForm<VinLookupInput>({
    resolver: zodResolver(vinLookupSchema),
    defaultValues: { vin: '', part: 'Windshield' },
  });

  const ymmForm = useForm<YMMLookupInput>({
    resolver: zodResolver(ymmLookupSchema),
    defaultValues: { year: '', make: '', model: '', part: 'Windshield' },
  });

  const onVinSubmit = (values: VinLookupInput) => {
    console.log('VIN Lookup', values);
    router.push(`${basePath}/lookup/details`);
  };

  const onYmmSubmit = (values: YMMLookupInput) => {
    console.log('YMM Lookup', values);
    router.push(`${basePath}/lookup/details`);
  };

  return (
    <div className="md:px-6">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Vehicle Lookup</h1>

      <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
        {/* Tabs */}

        <SegmentedTabs
          items={[
            {
              key: 'vin',
              label: (
                <>
                  <span className="sm:hidden">VIN</span>
                  <span className="hidden sm:inline">VIN Decode</span>
                </>
              ),
            },
            {
              key: 'ymm',
              label: (
                <>
                  <span className="sm:hidden">YMM</span>
                  <span className="hidden sm:inline">Year/Make/Model</span>
                </>
              ),
            },
          ]}
          activeKey={activeTab}
          onChange={setActiveTab}
          className="!flex-row flex-nowrap"
        />

        {/* Forms */}
        {activeTab === 'vin' && <VinLookupForm form={vinForm} onSubmit={onVinSubmit} />}
        {activeTab === 'ymm' && <YMMLookupForm form={ymmForm} onSubmit={onYmmSubmit} />}
      </div>
    </div>
  );
}
