import { useQuery } from '@tanstack/react-query';
import { entryTypesService } from '@/services/api';

export const useEntryTypes = () => {
  return useQuery({
    queryKey: ['entry-types'],
    queryFn: () => entryTypesService.getEntryTypes(),
  });
};
