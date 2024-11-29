import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const linkVariants = cva(
  "font-semibold transition-colors rounded-lg text-center px-4 py-2",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-secondary hover:bg-secondary hover:text-primary",
        inverted:
          "bg-secondary text-primary hover:text-secondary hover:bg-primary",
      },
      size: {
        default: "text-xl",
        sm: "text-md",
        lg: "text-2xl",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface LinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof linkVariants> {
  asChild?: boolean;
}

const CustomLink = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "a";
    return (
      <Comp
        className={cn(linkVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    );
  },
);

CustomLink.displayName = "CustomLink";

export { CustomLink, linkVariants };
