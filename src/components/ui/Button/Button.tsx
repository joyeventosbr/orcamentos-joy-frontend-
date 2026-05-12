import { cn } from "@/src/lib/utils";
import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "secondary" | "danger";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-brand-primary text-white shadow-sm": variant === "default",
            "bg-white border border-gray-200 text-gray-900 hover:bg-gray-50 hover:text-gray-900 shadow-sm":
              variant === "outline",
            "hover:bg-gray-100 hover:text-gray-900 text-gray-600": variant === "ghost",
            "bg-gray-100 text-gray-900 hover:bg-gray-200": variant === "secondary",
            "bg-red-50 text-red-600 hover:bg-red-100": variant === "danger",
            "h-9 px-4 py-2": size === "default",
            "h-8 rounded-md px-3 text-xs": size === "sm",
            "h-10 rounded-lg px-8": size === "lg",
            "h-9 w-9": size === "icon",
          },
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button };
