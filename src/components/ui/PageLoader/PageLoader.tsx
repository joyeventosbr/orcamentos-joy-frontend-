import { cn } from "@/src/lib/utils";
import { Loader2 } from "lucide-react";

interface PageLoaderProps {
  className?: string;
}

export function PageLoader({ className }: PageLoaderProps) {
  return (
    <div className={cn("flex h-full flex-1 items-center justify-center bg-gray-50/50", className)}>
      <Loader2 size={32} className="animate-spin text-slate-400" />
    </div>
  );
}
