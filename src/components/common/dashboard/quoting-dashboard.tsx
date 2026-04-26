'use client';

import Image from 'next/image';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { QuotesTable, QuotesCards, type QuoteTableItem } from '@/components/common/quote';
import { useAuthStore } from '@/lib/store/auth-store';
import { Button } from '@/components/ui/button';
import ROLES from '@/constants/roles';

const MOCK_QUOTES: QuoteTableItem[] = [
  { id: 'Q-001', vin: '126372837373737277', customer: 'John Smith', generatedBy: 'Robert John', vehicle: '2022 Toyota Camry', date: '10/5/2025', total: '$460.00' },
  { id: 'Q-002', vin: '473839485739583759', customer: 'Sarah Johnson', generatedBy: 'John Kennedy', vehicle: '2021 Honda Accord', date: '10/6/2025', total: '$495.00' },
  { id: 'Q-003', vin: '9HGCM82633A004352', customer: 'Michael Brown', generatedBy: 'Robert John', vehicle: '2020 Ford F-150', date: '10/8/2025', total: '$520.00' },
];

export function QuotingDashboard() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [quotes, setQuotes] = useState<QuoteTableItem[]>(MOCK_QUOTES);

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

  const handleDelete = (id: string) => {
    setQuotes(prev => prev.filter(q => q.id !== id));
  };

  const handleView = (id: string) => {
    router.push(`${basePath}/quotes/${id}?source=dashboard`);
  };

  const handleResend = (id: string) => {
    // Hook your resend API here
    console.log('Resend quote:', id);
  };

  return (
    <div className="md:px-6">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Welcome 👋</h1>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-md px-6  py-8 border border-gray-200 cursor-pointer" onClick={() => router.push(`${basePath}/lookup`)}>
          <div className="flex items-center">
            <div className="p-1 bg-blue-100 rounded-sm">
              <Image src="/images/icons/vehicle.svg" alt="Create" width={48} height={48} />
            </div>
            <div className="ml-4">
              <p className="text-lg font-semibold text-gray-900 ">Vehicle Lookup</p>
              <p className="text-sm text-gray-500 mt-2">Start quote with vehicle details</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-md px-6 py-8 border border-gray-200 cursor-pointer" onClick={() => router.push(`${basePath}/saved-quotes`)}>
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-sm">
              <Image src="/images/icons/notes.svg" alt="View quotes" width={32} height={32} />
            </div>
            <div className="ml-4">
              <p className="text-lg font-semibold text-gray-900">View All Quotes</p>
              <p className="text-sm text-gray-500 mt-2">Manage your existing quotes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Quotes */}
      <div className="bg-white rounded-md px-4 md:px-8 py-8 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Quotes</h2>
          <Button className="h-10 rounded-lg" onClick={() => router.push(`${basePath}/saved-quotes`)}>
            View All
          </Button>
        </div>

        {/* Mobile/Tablet Cards View */}
        <div className="lg:hidden">
          <QuotesCards quotes={quotes} onDelete={handleDelete} onResend={handleResend} onView={handleView} source="dashboard" />
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block">
          <QuotesTable quotes={quotes} onDelete={handleDelete} onResend={handleResend} onView={handleView} pageSize={10} source="dashboard" />
        </div>
      </div>
    </div>
  );
}
