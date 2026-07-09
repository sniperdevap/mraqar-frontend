'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Building2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Loader } from '../common/loader';
import dynamic from 'next/dynamic';
import { useInView } from 'react-intersection-observer';

const OfficeCard = dynamic(() => import('./office-card').then(mod => mod.OfficeCard));
const OfficeSearchModal = dynamic(() => import('./office-search-modal').then(mod => mod.OfficeSearchModal));
import { useTranslations } from 'next-intl';
import { useInfiniteOffices } from '@/hooks/use-offices';

export function OfficesPage() {
  const t = useTranslations('office');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const searchQuery = searchParams.get('search') || '';
  const [search, setSearch] = useState(searchQuery);
  const officesPerPage = 12;

  const filters = useMemo(() => {
    return {
      search: searchParams.get('search') || undefined,
    };
  }, [searchParams.get('search')]);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteOffices({
    limit: officesPerPage,
    search: filters.search,
  });

  const { ref, inView } = useInView({
    threshold: 0,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const offices = useMemo(() => {
    return data?.pages.flatMap(page => page.offices) || [];
  }, [data]);

  const totalOffices = data?.pages[0]?.total || 0;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div>
        <div className="max-w-7xl mx-auto px-8 sm:px-8 lg:px-8 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-medium text-gray-900">{t('officesList')}</h1>
              {totalOffices > 0 && <p className="text-gray-600">( {totalOffices} ) </p>}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="h-11 w-11 hover:bg-gray-50 bg-primary" onClick={() => setIsSearchModalOpen(true)}>
                <Search className="h-5 w-5 text-white" />
              </Button>

              <OfficeSearchModal
                open={isSearchModalOpen}
                onOpenChange={setIsSearchModalOpen}
                initialValue={search}
                onSearch={term => {
                  setSearch(term);
                  const params = new URLSearchParams(searchParams.toString());
                  if (term.trim()) {
                    params.set('search', term.trim());
                  } else {
                    params.delete('search');
                  }
                  router.push(`/offices?${params.toString()}`);
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className=" flex items-center justify-center ">
              <Loader />
            </div>
          </div>
        ) : offices.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {offices.map(office => (
                <OfficeCard key={office._id} office={office} onClick={() => router.push(`/offices/${office._id}`)} />
              ))}
            </div>

            {/* Load more trigger */}
            <div ref={ref} className="flex justify-center py-4">
              {isFetchingNextPage ? (
                <Loader />
              ) : hasNextPage ? (
                <div className="h-10" /> // Spacer to trigger intersection
              ) : null}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <Building2 className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500 text-lg">{t('noOfficesFound')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
