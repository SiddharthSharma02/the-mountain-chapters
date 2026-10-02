export default function Loading() {
  return (
    <div className="animate-pulse motion-reduce:animate-none" aria-busy="true" aria-label="Loading stay">
      <div className="h-[68svh] min-h-[420px] max-h-[820px] w-full bg-cream-dark md:mx-auto md:mt-4 md:h-[74vh] md:max-w-7xl md:rounded-[32px]" />
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-5 pt-10">
        <div className="h-3 w-24 rounded-full bg-cream-dark" />
        <div className="h-9 w-3/4 rounded-full bg-cream-dark" />
        <div className="h-4 w-1/2 rounded-full bg-cream-dark" />
        <div className="mt-4 h-12 w-full rounded-full bg-cream-dark sm:w-56" />
      </div>
    </div>
  );
}
