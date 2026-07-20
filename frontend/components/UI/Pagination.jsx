"use client";

const Pagination = ({ page, totalPages, onPageChange, loading = false }) => {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="mt-10 flex items-center justify-center gap-5">
      <button
        disabled={page === 1 || loading}
        onClick={() => onPageChange(page - 1)}
        className={`h-12 w-28 rounded-lg text-sm font-semibold transition
          ${
            page === 1 || loading
              ? "cursor-not-allowed bg-slate-700 text-slate-500"
              : "bg-slate-800 text-white hover:bg-slate-700"
          }`}
      >
        Previous
      </button>

      <span className="text-white">
        Page <strong>{page}</strong> of <strong>{totalPages}</strong>
      </span>

      <button
        disabled={page === totalPages || loading}
        onClick={() => onPageChange(page + 1)}
        className={`h-12 w-28 rounded-lg text-sm font-semibold transition
          ${
            page === totalPages || loading
              ? "cursor-not-allowed bg-orange-500/40 text-orange-200"
              : "bg-orange-500 text-white hover:bg-orange-600"
          }`}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;