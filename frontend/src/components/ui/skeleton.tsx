import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-muted relative overflow-hidden rounded-md", className)}
      {...props}
    >
      <span
        aria-hidden
        className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent dark:via-white/10"
      />
    </div>
  );
}

export { Skeleton };
