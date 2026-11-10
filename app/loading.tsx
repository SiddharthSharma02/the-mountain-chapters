import { Skeleton } from "@/components/site/skeleton";

export default function Loading() {
  return (
    <main className="flex-1">
      {/* Matches the home hero so the page doesn't jump when it loads. */}
      <div className="h-svh min-h-[600px] w-full bg-navy" />
      <div className="mx-auto max-w-7xl space-y-6 px-5 py-24 sm:px-6 lg:px-8">
        <Skeleton className="h-10 w-3/4 max-w-3xl" />
        <Skeleton className="h-10 w-1/2 max-w-xl" />
      </div>
    </main>
  );
}
