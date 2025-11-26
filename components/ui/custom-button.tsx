import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm sm:text-base font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 hover:shadow-lg active:scale-[0.98] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:from-blue-700 hover:via-blue-600 hover:to-indigo-700 dark:from-blue-500 dark:via-blue-400 dark:to-indigo-500 dark:shadow-blue-500/20",
        destructive:
          "bg-gradient-to-r from-red-500 via-red-600 to-rose-600 text-white shadow-lg shadow-red-500/25 hover:shadow-xl hover:from-red-600 hover:to-rose-700",
        outline:
          "border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-blue-300 dark:hover:border-blue-600",
        secondary:
          "bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 text-slate-700 dark:text-slate-200 shadow-sm hover:shadow-md",
        ghost: "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:shadow-sm",
        link: "text-blue-600 dark:text-blue-400 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5 py-2.5 sm:h-12 sm:px-6",
        sm: "h-9 rounded-lg px-3 text-sm",
        lg: "h-12 sm:h-14 rounded-xl px-6 sm:px-8 text-base sm:text-lg",
        icon: "h-10 w-10 sm:h-11 sm:w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const CustomButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
CustomButton.displayName = "Button";

export { CustomButton, buttonVariants };

const linkVariants = cva(
  "font-semibold transition-all duration-300 rounded-xl text-center px-4 py-2.5 hover:shadow-md active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/20",
        inverted:
          "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700",
      },
      size: {
        default: "text-sm sm:text-base",
        sm: "text-xs sm:text-sm",
        lg: "text-base sm:text-lg py-3",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);
