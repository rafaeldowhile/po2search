import { Loader2 } from "lucide-react";
import { cn } from "~/lib/utils";

interface LoadingStateProps {
    className?: string;
    message?: string;
    size?: "sm" | "md" | "lg";
}

const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
} as const;

export function LoadingState({
    className,
    message = "Loading...",
    size = "md"
}: LoadingStateProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center p-4", className)}>
            <Loader2 className={cn("animate-spin", sizeClasses[size])} />
            {message && (
                <p className="mt-2 text-sm text-muted-foreground">{message}</p>
            )}
        </div>
    );
} 