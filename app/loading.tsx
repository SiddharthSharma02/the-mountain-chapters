import { Skeleton } from "@/components/site/skeleton";

export default function Loading() {
  return (
    <main className="flex-1">
      {/* Hero skeleton */}
      <Skeleton className="h-dvh min-h-[560px] w-full rounded-none" />
      {/* Trust bar skeleton */}
      <Skeleton className="h-20 w-full rounded-none" />
      {/* Content skeletons */}
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-14 sm:px-6 lg:px-8">
        <div className="space-y-3">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-navy/5">
                <Skeleton className="aspect-4/5 w-full rounded-none" />
                <div className="space-y-2 p-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
