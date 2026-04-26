'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { VehicleInfo } from './vehicle-info';
import { Breadcrumb } from '../breadcrumb';
import { PricingCards } from './pricing-cards';
import { PricingTableView } from './pricing-table-view';
import { useAuthStore } from '@/lib/store/auth-store';
import ROLES from '@/constants/roles';

interface PricingOption {
  id: string;
  name: string;
  cost: string;
  listPrice: string;
}

const pricingOptions: PricingOption[] = [
  {
    id: '1s',
    name: 'Supplier Price',
    cost: '$100',
    listPrice: '$110',
  },
];

interface LookupDetailsProps {
  vin?: string;
  partName?: string;
  partNumber?: string;
  OEM?: string;
  calibrationType?: string;
}

export function LookupDetails({ vin = 'W1K5J4HB5MN245314', partName = '2022 Honda Civic', partNumber = 'DW2552', OEM = '1A2B3C', calibrationType = 'Static' }: LookupDetailsProps) {
  const [selectedPrices, setSelectedPrices] = useState<Set<string>>(new Set());
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

  const togglePriceSelection = (id: string) => {
    const newSelection = new Set(selectedPrices);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedPrices(newSelection);
  };

  const handleCreateQuote = () => {
    console.log('Create Quote with selected prices:', Array.from(selectedPrices));
    router.push(`${basePath}/lookup/details/view`);
    // TODO: Implement quote creation logic
  };

  return (
    <div className="space-y-6 md:px-6">
      {/* Breadcrumb */}
      <Breadcrumb items={[{ label: 'Vehicle Lookup', href: `${basePath}/lookup` }, { label: 'Details' }]} />

      {/* Main Content Card */}

      <div className="bg-white rounded-lg shadow-sm overflow-hidden p-6 md:p-8">
        {/* Vehicle Details Section */}
        <VehicleInfo vin={vin} partName={partName} partNumber={partNumber} OEM={OEM} calibrationType={calibrationType} />

        {/* Pricing Section */}
        <div className="mt-8">
          {/* Mobile/Tablet Cards View */}
          <div className="lg:hidden">
            <PricingCards pricingOptions={pricingOptions} selectedPrices={selectedPrices} onToggleSelection={togglePriceSelection} />
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <PricingTableView pricingOptions={pricingOptions} selectedPrices={selectedPrices} onToggleSelection={togglePriceSelection} />
          </div>
        </div>

        {/* Create Quote Button */}
        <div className="flex justify-end mt-8">
          <Button onClick={handleCreateQuote} className="h-12 lg:h-13 bg-blue-primary hover:bg-blue-primary/90 text-white px-8 py-6 rounded-lg font-semibold text-base">
            Create Quote
          </Button>
        </div>
      </div>
    </div>
  );
}
