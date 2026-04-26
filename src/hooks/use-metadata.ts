import { useQuery } from '@tanstack/react-query';
import { getPropertyTypes, getAreas } from '@/lib/api/metadata';

export const usePropertyTypes = () => {
  return useQuery({
    queryKey: ['property-types'],
    queryFn: getPropertyTypes,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
};

export const useAreas = () => {
  return useQuery({
    queryKey: ['areas'],
    queryFn: getAreas,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
};
