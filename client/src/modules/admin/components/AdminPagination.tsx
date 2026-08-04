type AdminPaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

function getVisiblePages(page: number, totalPages: number) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const start = Math.max(1, page - 1);
  const end = Math.min(totalPages, start + 2);
  const adjustedStart = Math.max(1, end - 2);

  return Array.from({ length: end - adjustedStart + 1 }, (_, index) => adjustedStart + index);
}

export default function AdminPagination({ page, totalPages, onPageChange }: AdminPaginationProps) {
  if (totalPages <= 1) {
    return (
      <div className="flex flex-col gap-3 border-t border-admin-outline-variant/20 px-4 py-4 text-xs text-admin-on-surface-variant sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <span>Solo hay una página disponible.</span>
        <span className="rounded-full border border-admin-outline-variant/40 bg-admin-surface-high/60 px-3 py-1 font-bold text-admin-on-surface">
          Página 1 de 1
        </span>
      </div>
    );
  }

  const visiblePages = getVisiblePages(page, totalPages);

  return (
    <div className="flex flex-col gap-3 border-t border-admin-outline-variant/20 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <p className="text-xs text-admin-on-surface-variant">
        Página <span className="font-bold text-admin-on-surface">{page}</span> de {totalPages}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="min-h-[44px] rounded-xl border border-admin-outline-variant/40 bg-admin-surface-high/60 px-3 py-2 text-xs font-bold uppercase tracking-[0.2em] text-admin-on-surface transition hover:bg-admin-surface-highest/70 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Anterior
        </button>

        {visiblePages.map((visiblePage) => (
          <button
            key={visiblePage}
            type="button"
            onClick={() => onPageChange(visiblePage)}
            className={
              visiblePage === page
                ? "min-h-[44px] rounded-xl bg-admin-primary-container px-3 py-2 text-xs font-black uppercase tracking-[0.2em] text-admin-on-primary"
                : "min-h-[44px] rounded-xl border border-admin-outline-variant/40 bg-admin-surface-high/60 px-3 py-2 text-xs font-bold uppercase tracking-[0.2em] text-admin-on-surface transition hover:bg-admin-surface-highest/70"
            }
          >
            {visiblePage}
          </button>
        ))}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="min-h-[44px] rounded-xl border border-admin-outline-variant/40 bg-admin-surface-high/60 px-3 py-2 text-xs font-bold uppercase tracking-[0.2em] text-admin-on-surface transition hover:bg-admin-surface-highest/70 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
