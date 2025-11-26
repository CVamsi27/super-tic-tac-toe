import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-8 h-8",
};

export const Loading = ({ size = "md", className }: LoadingProps) => {
  return (
    <div className="flex items-center justify-center">
      <Loader2 className={cn("animate-spin text-current", sizeClasses[size], className)} />
    </div>
  );
};
