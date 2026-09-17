import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1.5 rounded-full border border-transparent px-3 py-1 text-sm font-semibold whitespace-nowrap [&>svg]:pointer-events-none [&>svg]:size-3.5",
  {
    variants: {
      variant: {
        // Neutral pill on a mist tint behind inkt text (brief §9.2)
        default: "bg-mist text-inkt",
        outline: "border-lijn text-inkt",
        // A dot/text combination is always used with these so colour is never
        // the only signal (WCAG 2.2, §10).
        accent1: "bg-[color-mix(in_srgb,var(--accent-1)_14%,white)] text-inkt",
        accent2: "bg-[color-mix(in_srgb,var(--accent-2)_20%,white)] text-inkt",
        accent3: "bg-[color-mix(in_srgb,var(--accent-3)_16%,white)] text-inkt",
        accent4: "bg-[color-mix(in_srgb,var(--accent-4)_16%,white)] text-inkt",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
