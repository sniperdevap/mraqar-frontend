'use client';

import { useState, useMemo, useEffect } from 'react';
import { QuotesTable, QuotesCards, type QuoteTableItem } from '@/components/common/quote';
import type { DateRange } from 'react-day-picker';
import { SearchInput } from '@/components/ui/search-input';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import Pagination from '@/components/ui/pagination';
import { toast } from 'sonner';

// Generate mock quotes with dates spanning the last 3 months for better testing
const generateMockQuotes = (): QuoteTableItem[] => {
  const now = new Date();
  const quotes: QuoteTableItem[] = [];

  // Generate quotes for the last 3 months
  for (let i = 0; i < 15; i++) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - Math.floor(i / 5));
    date.setDate(date.getDate() - (i % 5) * 2);

    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();
    const dateString = `${month}/${day}/${year}`;

    const customers = [
      'John Smith',
      'Sarah Johnson',
      'Michael Brown',
      'Emily Davis',
      'David Wilson',
      'Olivia Martinez',
      'James Anderson',
      'Sophia Thomas',
      'Liam Martinez',
      'Emma Garcia',
      'Noah Lee',
      'Ava Robinson',
      'William Scott',
      'Isabella Young',
      'Ethan Walker',
    ];
    const vehicles = [
      '2022 Toyota Camry',
      '2021 Honda Accord',
      '2020 Ford F-150',
      '2023 Chevrolet Silverado',
      '2019 Tesla Model 3',
      '2022 BMW X5',
      '2020 Nissan Altima',
      '2021 Hyundai Sonata',
      '2023 Ford Ranger',
      '2019 Chevrolet Malibu',
      '2020 Kia Sportage',
      '2021 Toyota Corolla',
      '2022 Jeep Grand Cherokee',
      '2023 Ford Fusion',
      '2021 Hyundai Elantra',
    ];
    const vins = [
      'VX12436RT678YU42W',
      '473839485739583759',
      '9HGCM82633A004352',
      '1HGBH41JXMN109186',
      '5YJSA1E11HF123456',
      '2C3KA43R08H123789',
      'JHMCM56557C404453',
      '3CZRE38539G700124',
      '1FTFW1ET7EKF51234',
      '1GCHK23D57F123456',
      '2HGFB2F50FH123789',
      '1HGCM82633A987654',
      '1C4RJFBG5HC654321',
      '3FA6P0LU4KR111223',
      '5NPE24AF0FH123321',
    ];
    const totals = ['$460.00', '$495.00', '$520.00', '$380.00', '$550.00', '$610.00', '$420.00', '$475.00', '$530.00', '$395.00', '$485.00', '$410.00', '$625.00', '$470.00', '$440.00'];
    const generatedBy = ['Robert John', 'John Kennedy'];

    quotes.push({
      id: `Q-${String(i + 1).padStart(3, '0')}`,
      vin: vins[i],
      customer: customers[i],
      generatedBy: generatedBy[i % 2],
      vehicle: vehicles[i],
      date: dateString,
      total: totals[i],
    });
  }

  return quotes;
};

const MOCK_QUOTES: QuoteTableItem[] = generateMockQuotes();

export function SavedQuotesView() {
  const [quotes, setQuotes] = useState<QuoteTableItem[]>(MOCK_QUOTES);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  // Parse date string (MM/DD/YYYY) to Date object
  const parseDate = (dateString: string): Date | null => {
    const parts = dateString.split('/');
    if (parts.length !== 3) return null;
    const month = parseInt(parts[0], 10) - 1;
    const day = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    const date = new Date(year, month, day);
    date.setHours(0, 0, 0, 0);
    return date;
  };

  // Filter quotes based on date range and search term
  const filteredQuotes = useMemo(() => {
    let filtered = [...quotes];

    // Apply date range filter
    if (dateRange?.from || dateRange?.to) {
      filtered = filtered.filter(quote => {
        const quoteDate = parseDate(quote.date);
        if (!quoteDate) return false;

        // If only 'from' is set, show quotes from that date onwards
        if (dateRange.from && !dateRange.to) {
          return quoteDate >= dateRange.from;
        }

        // If only 'to' is set, show quotes up to that date
        if (!dateRange.from && dateRange.to) {
          const toDate = new Date(dateRange.to);
          toDate.setHours(23, 59, 59, 999); // End of day
          return quoteDate <= toDate;
        }

        // If both 'from' and 'to' are set, show quotes within the range
        if (dateRange.from && dateRange.to) {
          const fromDate = new Date(dateRange.from);
          fromDate.setHours(0, 0, 0, 0);
          const toDate = new Date(dateRange.to);
          toDate.setHours(23, 59, 59, 999); // End of day
          return quoteDate >= fromDate && quoteDate <= toDate;
        }

        return true;
      });
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(quote => {
        return (
          quote.id.toLowerCase().includes(searchLower) ||
          quote.vin.toLowerCase().includes(searchLower) ||
          quote.customer.toLowerCase().includes(searchLower) ||
          quote.generatedBy.toLowerCase().includes(searchLower) ||
          quote.vehicle.toLowerCase().includes(searchLower) ||
          quote.date.toLowerCase().includes(searchLower) ||
          quote.total.toLowerCase().includes(searchLower)
        );
      });
    }

    return filtered;
  }, [quotes, dateRange, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [dateRange, searchTerm]);

  const handleDelete = (id: string) => {
    setQuotes(prev => prev.filter(q => q.id !== id));
    toast.success('Quote deleted successfully!');
  };

  const handleResend = (id: string) => {
    // TODO: Implement resend quote logic
  };

  // Pagination logic
  const pageSize = 10;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedQuotes = filteredQuotes.slice(startIndex, endIndex);

  useEffect(() => {
    if (startIndex >= filteredQuotes.length && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [startIndex, filteredQuotes.length, currentPage]);

  return (
    <div className="md:px-6">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Saved Quotes</h1>

      <div>
        <div className="bg-white rounded-md px-4 md:px-8 py-8 shadow-sm">
          <div className="flex flex-col xl:flex-row xl:space-x-6 space-y-4 xl:space-y-0 pb-4 mb-4">
            <SearchInput value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            <div className="w-full sm:w-auto">
              <DateRangePicker onChange={setDateRange} initialFrom={dateRange?.from} initialTo={dateRange?.to} />
            </div>
          </div>
          {/* Mobile/Tablet Cards View */}
          <div className="lg:hidden">
            <QuotesCards quotes={paginatedQuotes} onDelete={handleDelete} onResend={handleResend} source="saved-quotes" />
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <QuotesTable quotes={filteredQuotes} onDelete={handleDelete} onResend={handleResend} pageSize={pageSize} currentPage={currentPage} source="saved-quotes" />
          </div>
        </div>
        {filteredQuotes.length > pageSize && (
          <div className="flex justify-end mt-6">
            <Pagination totalItems={filteredQuotes.length} pageSize={pageSize} currentPage={currentPage} onPageChange={setCurrentPage} />
          </div>
        )}
      </div>
    </div>
  );
}
