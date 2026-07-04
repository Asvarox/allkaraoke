import { Skeleton } from '~/modules/elements/akui/skeleton';

function HistoryEntrySkeleton() {
  return (
    <div className="rounded-md bg-black/45">
      <div className="flex items-start">
        <div className="flex flex-1 flex-col gap-2 px-4 py-3">
          <Skeleton className="h-5 w-44" />
          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
        <Skeleton className="mt-1 mr-1 aspect-video w-32 shrink-0 self-start rounded-r-md" />
      </div>
    </div>
  );
}

export function HistoryPageSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-6 w-32" />
      {Array.from({ length: 4 }).map((_, index) => (
        <HistoryEntrySkeleton key={index} />
      ))}
    </div>
  );
}
