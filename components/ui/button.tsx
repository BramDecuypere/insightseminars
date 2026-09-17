import { Button as ButtonPrimitive } from '@base-ui/react/button'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

/**
 * Restyled for Insight (brief §9.2, §9.4). Sentence-case labels, 6px radius,
 * generous tap targets. Primary = flat avondblauw (navy) fill with papier
 * text, matching the wordmark color for brand cohesion.
 */
const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-base font-semibold whitespace-nowrap transition-colors outline-none select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
  {
    variants: {
      variant: {
        // Primary CTA: flat navy fill, matches the wordmark. Only for use on
        // light (papier/mist) surfaces — on avondblauw bands it disappears,
        // use `onDarkPrimary` there instead.
        primary:
          'bg-avondblauw text-papier border border-transparent hover:bg-[color-mix(in_srgb,var(--avondblauw)_82%,white)]',
        // On the avondblauw bands: readable outline button with white text
        onDark:
          'bg-transparent text-papier border border-white/45 hover:bg-white/10',
        // High-emphasis CTA fill for use on avondblauw surfaces (mobile nav
        // sheet, newsletter band), where navy `primary` has no contrast
        onDarkPrimary:
          'bg-accent-2 text-inkt border border-transparent hover:bg-[#e5a516]',
        // Neutral outline on light surfaces
        outline:
          'bg-papier text-inkt border border-lijn hover:bg-mist',
        // Quiet secondary on light surfaces
        secondary: 'bg-mist text-inkt border border-transparent hover:bg-lijn',
        ghost: 'bg-transparent text-inkt hover:bg-mist',
        link: 'text-inkt underline underline-offset-4 hover:decoration-2 px-0 h-auto',
      },
      size: {
        default: 'h-12 px-5',
        sm: 'h-10 px-4 text-[0.95rem]',
        lg: 'h-14 px-7 text-lg',
        icon: 'size-12',
        'icon-sm': 'size-9',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant,
  size,
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
