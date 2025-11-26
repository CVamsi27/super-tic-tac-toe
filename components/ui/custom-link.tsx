import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const linkVariants = cva(
  "font-semibold transition-all duration-200 rounded-xl text-center px-4 py-2.5 hover:scale-[1.02] active:scale-[0.98] inline-flex items-center justify-center gap-2",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30",
        inverted:
          "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 shadow-sm",
        ghost:
          "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800",
      },
      size: {
        default: "text-sm sm:text-base h-10 sm:h-11 px-4 sm:px-5",
        sm: "text-xs sm:text-sm h-8 sm:h-9 px-3 sm:px-4",
        lg: "text-base sm:text-lg h-11 sm:h-12 px-5 sm:px-6",
        icon: "h-9 w-9 sm:h-10 sm:w-10 p-0",
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
