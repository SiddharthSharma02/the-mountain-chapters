import { CardGridSkeleton, PageHeaderSkeleton } from "@/components/site/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <PageHeaderSkeleton />
      <div className="mt-10">
        <CardGridSkeleton count={8} />
      </div>
    </div>
  );
}
