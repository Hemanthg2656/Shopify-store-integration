"use client";

const badgeStyles = {
  PAID: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
  PENDING: "bg-amber-500/15 text-amber-400 border border-amber-500/20",
  AUTHORIZED: "bg-sky-500/15 text-sky-400 border border-sky-500/20",
  REFUNDED: "bg-red-500/15 text-red-400 border border-red-500/20",
  VOIDED: "bg-slate-500/15 text-slate-400 border border-slate-500/20",

  FULFILLED: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
  UNFULFILLED: "bg-red-500/15 text-red-400 border border-red-500/20",
  PARTIAL: "bg-orange-500/15 text-orange-400 border border-orange-500/20",

  OPEN: "bg-blue-500/15 text-blue-400 border border-blue-500/20",
  CLOSED: "bg-slate-500/15 text-slate-400 border border-slate-500/20",
  CANCELLED: "bg-red-500/15 text-red-400 border border-red-500/20",
};

const OrderStatusBadge = ({ status }) => {
  if (!status) {
    return (
      <span
        className="
          rounded-full
          border
          border-slate-600
          bg-slate-500/10
          px-3
          py-1
          text-xs
          font-semibold
          text-slate-400
        "
      >
        -
      </span>
    );
  }

  const badgeClass =
    badgeStyles[status.toUpperCase()] ||
    "bg-slate-500/10 text-slate-300 border border-slate-600";

  return (
    <span
      className={`
        rounded-full
        px-3
        py-1
        text-xs
        font-semibold
        tracking-wide
        ${badgeClass}
      `}
    >
      {status}
    </span>
  );
};

export default OrderStatusBadge;
