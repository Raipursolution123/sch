import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@constants/query-keys';
import { env } from '@constants/env';
import { brandingService } from '@services/api/branding.service';

export function usePublicBranding() {
  return useQuery({
    queryKey: queryKeys.settings.branding(),
    queryFn: brandingService.get,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

/** Resolved display name + logo with env fallback for public/auth chrome. */
export function useSchoolBrand() {
  const query = usePublicBranding();
  const name = query.data?.name?.trim() || env.appName;
  const logoUrl = query.data?.logo_url || query.data?.small_logo_url || null;
  const smallLogoUrl = query.data?.small_logo_url || query.data?.logo_url || null;

  return {
    name,
    logoUrl,
    smallLogoUrl,
    mark: name.charAt(0).toUpperCase() || 'S',
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
