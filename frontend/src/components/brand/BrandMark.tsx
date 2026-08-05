import { Link } from 'react-router-dom';
import { useSchoolBrand } from '@hooks/usePublicBranding';
import { cn } from '@utils/cn';

type BrandMarkVariant = 'inline' | 'compact' | 'hero';

interface BrandMarkProps {
  variant?: BrandMarkVariant;
  to?: string;
  className?: string;
  /** Optional eyebrow above the name (inline / hero). */
  eyebrow?: string;
  /** Prefer small logo asset when available. */
  preferSmall?: boolean;
}

const markSize: Record<BrandMarkVariant, string> = {
  compact: 'h-9 w-9 text-sm',
  inline: 'h-9 w-9 text-sm',
  hero: 'h-14 w-14 text-xl',
};

export function BrandMark({
  variant = 'inline',
  to,
  className,
  eyebrow,
  preferSmall = false,
}: BrandMarkProps) {
  const { name, logoUrl, smallLogoUrl, mark } = useSchoolBrand();
  const src = preferSmall ? smallLogoUrl || logoUrl : logoUrl || smallLogoUrl;

  const markEl = src ? (
    <img src={src} alt="" className={cn('shrink-0 rounded-sm object-contain', markSize[variant])} />
  ) : (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center rounded-sm bg-primary font-display font-medium text-primary-foreground',
        markSize[variant],
      )}
      aria-hidden="true"
    >
      {mark}
    </span>
  );

  const nameEl =
    variant === 'compact' ? null : (
      <span className="min-w-0">
        {eyebrow ? <span className="text-label block text-muted-foreground">{eyebrow}</span> : null}
        <span
          className={cn(
            'block truncate font-display font-medium tracking-display text-foreground',
            variant === 'hero' ? 'text-4xl sm:text-5xl' : 'text-[0.9375rem]',
            eyebrow && 'mt-0.5',
          )}
        >
          {name}
        </span>
      </span>
    );

  const body = (
    <>
      {markEl}
      {nameEl}
    </>
  );

  const layoutClass = cn(
    'inline-flex min-w-0 items-center',
    variant === 'hero' ? 'flex-col gap-4 text-center' : 'gap-3',
    to && 'group',
    className,
  );

  if (!to) {
    return (
      <span className={layoutClass} aria-label={name}>
        {body}
      </span>
    );
  }

  return (
    <Link
      to={to}
      className={cn(layoutClass, 'text-foreground no-underline')}
      aria-label={name}
      title={name}
    >
      {body}
    </Link>
  );
}
