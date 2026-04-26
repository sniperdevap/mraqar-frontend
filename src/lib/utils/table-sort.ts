import { SortDirection } from '@/components/ui/sortable-table-head';

export function sortData<T>(data: T[], sortKey: string | null, sortDirection: SortDirection, getValue: (item: T, key: string) => unknown): T[] {
  if (!sortKey || !sortDirection) {
    return data;
  }

  return [...data].sort((a, b) => {
    const aValue = getValue(a, sortKey);
    const bValue = getValue(b, sortKey);

    // Handle null/undefined values
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return 1;
    if (bValue == null) return -1;

    // Handle string comparison
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      const comparison = aValue.localeCompare(bValue, undefined, { numeric: true, sensitivity: 'base' });
      return sortDirection === 'asc' ? comparison : -comparison;
    }

    // Handle number comparison
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }

    // Handle date comparison (if strings are date-like)
    if ((typeof aValue === 'string' || typeof aValue === 'number') && (typeof bValue === 'string' || typeof bValue === 'number')) {
      const aDate = new Date(aValue);
      const bDate = new Date(bValue);
      if (!isNaN(aDate.getTime()) && !isNaN(bDate.getTime())) {
        return sortDirection === 'asc' ? aDate.getTime() - bDate.getTime() : bDate.getTime() - aDate.getTime();
      }
    }

    // Fallback to string comparison
    const aStr = String(aValue);
    const bStr = String(bValue);
    const comparison = aStr.localeCompare(bStr, undefined, { numeric: true, sensitivity: 'base' });
    return sortDirection === 'asc' ? comparison : -comparison;
  });
}

// Helper function to get nested property value
export function getNestedValue(obj: unknown, path: string): unknown {
  return path.split('.').reduce((current, prop) => (current as Record<string, unknown>)?.[prop], obj);
}
