import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-md font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:shadow-lg hover:scale-105 active:scale-95",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-blue-500 to-indigo-600 text-primary-foreground shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-indigo-700 dark:from-blue-600 dark:to-indigo-700 dark:hover:from-blue-700 dark:hover:to-indigo-800",
        destructive:
          "bg-gradient-to-r from-red-500 to-rose-600 text-destructive-foreground shadow-md hover:shadow-lg hover:from-red-600 hover:to-rose-700",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground hover:shadow-md",
        secondary:
          "bg-gradient-to-r from-slate-200 to-slate-300 text-secondary-foreground shadow-sm hover:shadow-md hover:from-slate-300 hover:to-slate-400 dark:from-slate-700 dark:to-slate-800 dark:hover:from-slate-600 dark:hover:to-slate-700",
        ghost: "hover:bg-accent hover:text-accent-foreground hover:shadow-sm",
        link: "text-primary underline-offset-4 hover:underline hover:text-blue-600",
      },
      size: {
        default: "h-10 px-6 py-2 sm:h-11 sm:px-8",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-lg px-8 text-lg sm:h-14 sm:px-10",
        icon: "h-9 w-9",
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
  "font-semibold transition-all duration-300 rounded-lg text-center px-4 py-2 hover:scale-105 active:scale-95 hover:shadow-md",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-blue-500 to-indigo-600 text-secondary hover:from-blue-600 hover:to-indigo-700",
        inverted:
          "bg-gradient-to-r from-slate-200 to-slate-300 text-primary hover:from-slate-300 hover:to-slate-400 dark:from-slate-700 dark:to-slate-800 dark:text-secondary dark:hover:from-slate-600 dark:hover:to-slate-700",
      },
      size: {
        default: "text-base sm:text-lg",
        sm: "text-sm",
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
