import { Button as ButtonPrimitive } from '@base-ui/react/button'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

/**
 * Restyled for Insight (brief §9.2, §9.4). Sentence-case labels, 6px radius,
 * generous tap targets. Primary = gold (accent-2) fill with inkt text and a
 * darker edge so the button reaches 3:1 contrast on white.
 */
const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-base font-semibold whitespace-nowrap transition-colors outline-none select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
  {
    variants: {
      variant: {
        // Primary CTA: gold fill, inkt text, darker gold border for edge contrast
        primary:
          'bg-accent-2 text-inkt border border-[#c98f12] hover:bg-[#e5a516]',
        // On the avondblauw bands: readable outline button with white text
        onDark:
          'bg-transparent text-papier border border-white/45 hover:bg-white/10',
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
