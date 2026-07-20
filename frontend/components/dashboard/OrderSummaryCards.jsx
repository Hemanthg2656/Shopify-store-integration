"use client";

import { formatCurrency } from "@/utils/formatCurrency";
import { useSelector } from "react-redux";

const Card = ({ title, value }) => {
  return (
    <div
      className="
        rounded-xl
        border
        border-white/10
        bg-[#111827]
        p-5
      "
    >
      <p className="text-sm text-slate-400">
        {title}
      </p>

      <h3 className="mt-2 text-2xl font-bold text-white">
        {value}
      </h3>
    </div>
  );
};

const OrderSummaryCards = ({ summary }) => {
  const currency = useSelector((state) => state.store?.store?.currency);

  if (!summary) return null;

  return (
    <section className="mb-8">
      <h2
        className="
          mb-4
          text-xl
          font-semibold
          text-white
        "
      >
        Order Analytics
      </h2>

      <div
        className="
          grid
          gap-6
          md:grid-cols-3
          xl:grid-cols-6
        "
      >
        <Card
          title="Average Order"
          value={formatCurrency(summary.averageOrderValue, currency)}
        />

        <Card
          title="Paid"
          value={summary.paidOrders}
        />

        <Card
          title="Pending"
          value={summary.pendingOrders}
        />

        <Card
          title="Fulfilled"
          value={summary.fulfilledOrders}
        />

        <Card
          title="Unfulfilled"
          value={summary.unfulfilledOrders}
        />

        <Card
          title="Revenue"
          value={`₹${summary.totalRevenue.toLocaleString("en-IN")}`}
        />
      </div>
    </section>
  );
};

export default OrderSummaryCards;