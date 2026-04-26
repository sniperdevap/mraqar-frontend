import React from 'react';

type PaginationProps = {
  totalItems: number;
  pageSize: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  className?: string;
  maxPagesToShow?: number; // including ends and ellipsis representation
};

function getPages(totalPages: number, currentPage: number, maxPagesToShow: number): (number | 'ellipsis')[] {
  if (totalPages <= maxPagesToShow) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | 'ellipsis')[] = [];
  const sideCount = 1; // show one page on each side of current
  const start = Math.max(2, currentPage - sideCount);
  const end = Math.min(totalPages - 1, currentPage + sideCount);

  pages.push(1);
  if (start > 2) pages.push('ellipsis');

  for (let p = start; p <= end; p++) pages.push(p);

  if (end < totalPages - 1) pages.push('ellipsis');
  pages.push(totalPages);

  return pages;
}

export const Pagination: React.FC<PaginationProps> = ({ totalItems, pageSize, currentPage, onPageChange, className, maxPagesToShow = 7 }) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const clampedCurrent = Math.min(Math.max(1, currentPage), totalPages);
  const canPrev = clampedCurrent > 1;
  const canNext = clampedCurrent < totalPages;
  const pages = getPages(totalPages, clampedCurrent, maxPagesToShow);

  const baseBtn =
    'inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer text-sm md:text-base disabled:cursor-not-allowed disabled:opacity-60';
  const activeBtn = 'bg-primary font-bold text-white border-0 hover:!bg-primary/80 ';

  const goTo = (p: number) => {
    if (p < 1 || p > totalPages || p === clampedCurrent) return;
    onPageChange(p);
  };

  return (
    <nav className={className} aria-label="Pagination" dir="ltr">
      <ul className="flex items-center gap-1 md:gap-2">
        <li>
          <button type="button" className={`${baseBtn} text-base md:text-xl bg-white`} aria-label="First page" disabled={!canPrev} onClick={() => goTo(1)}>
            «
          </button>
        </li>
        <li>
          <button type="button" className={`${baseBtn} text-base md:text-xl bg-white`} aria-label="Previous page" disabled={!canPrev} onClick={() => goTo(clampedCurrent - 1)}>
            ‹
          </button>
        </li>

        {pages.map((p, idx) => (
          <li key={`${p}-${idx}`}>
            {p === 'ellipsis' ? (
              <span className={`${baseBtn} cursor-default select-none`}>…</span>
            ) : (
              <button type="button" className={`${baseBtn} ${p === clampedCurrent ? activeBtn : 'bg-white'}`} aria-current={p === clampedCurrent ? 'page' : undefined} onClick={() => goTo(p)}>
                {p}
              </button>
            )}
          </li>
        ))}

        <li>
          <button type="button" className={`${baseBtn} text-base md:text-xl bg-white`} aria-label="Next page" disabled={!canNext} onClick={() => goTo(clampedCurrent + 1)}>
            ›
          </button>
        </li>
        <li>
          <button type="button" className={`${baseBtn} text-base md:text-xl bg-white`} aria-label="Last page" disabled={!canNext} onClick={() => goTo(totalPages)}>
            »
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
