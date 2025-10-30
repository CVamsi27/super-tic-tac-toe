import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const linkVariants = cva(
  "font-semibold transition-all duration-300 rounded-lg text-center px-4 py-2 hover:scale-105 active:scale-95 hover:shadow-md inline-block",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-blue-500 to-indigo-600 text-secondary hover:from-blue-600 hover:to-indigo-700 shadow-md",
        inverted:
          "bg-gradient-to-r from-slate-200 to-slate-300 text-primary hover:from-slate-300 hover:to-slate-400 dark:from-slate-700 dark:to-slate-800 dark:text-secondary dark:hover:from-slate-600 dark:hover:to-slate-700 shadow-sm hover:shadow-md",
      },
      size: {
        default: "text-base sm:text-lg",
        sm: "text-sm",
        lg: "text-xl sm:text-2xl",
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
