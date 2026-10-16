/**
 * Instant placeholder while search results load. Search URLs depend on the
 * chosen filters, so they can't be prefetched; this keeps the tap on "Search"
 * responsive instead of leaving the previous page frozen until the server answers.
 */
export default function SearchLoading() {
  return (
    <div className="w-full px-4 pt-4 pb-12" aria-busy="true">
      <div className="max-w-2xl mx-auto space-y-3">
        <div className="h-11 w-full rounded-xl bg-card-mint animate-pulse" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="w-full bg-card-mint rounded-2xl overflow-hidden p-2.5 animate-pulse">
            <div className="flex flex-row w-full items-start gap-2.5">
              <div className="w-[75px] h-[75px] shrink-0 rounded-lg bg-[#d7e6e8]" />
              <div className="flex-1 flex flex-col min-w-0 min-h-[96px] justify-center gap-2">
                <div className="h-5 w-3/4 rounded bg-[#d7e6e8]" />
                <div className="h-5 w-1/2 rounded bg-[#d7e6e8]" />
              </div>
            </div>
            <div className="mt-1 space-y-1.5">
              <div className="h-5 w-full rounded bg-[#d7e6e8]" />
              <div className="h-5 w-5/6 rounded bg-[#d7e6e8]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
