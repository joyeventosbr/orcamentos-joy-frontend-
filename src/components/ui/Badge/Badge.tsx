import * as React from "react"
import { cn } from "@/src/lib/utils"

export interface BadgeProps extends React.ComponentProps<"div"> {
  variant?: "default" | "success" | "warning" | "neutral" | "danger";
  className?: string;
  children?: React.ReactNode;
}

function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
        {
          "bg-brand-primary/10 text-brand-primary": variant === "default",
          "bg-green-100 text-green-800": variant === "success",
          "bg-yellow-100 text-yellow-800": variant === "warning",
          "bg-gray-100 text-gray-800": variant === "neutral",
          "bg-red-100 text-red-800": variant === "danger",
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export { Badge }
