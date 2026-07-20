"use client";

import { formatCurrency } from "@/utils/formatCurrency";
import {
  CreditCard,
  CheckCircle,
  Clock,
  Truck,
  PackageCheck,
} from "lucide-react";
import { useSelector } from "react-redux";

const Card = ({ title, value, icon }) => (
  <div
    className="
      rounded-xl
      border
      border-white/10
      bg-[#111827]
      p-5
      transition
      hover:border-orange-500/30
    "
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-slate-400">{title}</p>

        <h2 className="mt-2 text-2xl font-bold text-white">
          {value}
        </h2>
      </div>

      <div className="rounded-lg bg-orange-500/10 p-3 text-orange-400">
        {icon}
      </div>
    </div>
  </div>
);

export default function AnalyticsCards({ analytics }) {
  const currency = useSelector((state) => state.store?.store?.currency);

  if (!analytics) return null;

  const {
    averageOrderValue,
    paidOrders,
    pendingOrders,
    fulfilledOrders,
    unfulfilledOrders,
  } = analytics.orderSummary;

  return (
    <section className="mb-8">
      <h2 className="mb-4 text-xl font-semibold text-white">
        Analytics Overview
      </h2>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
        <Card
          title="Average Order"
          value={formatCurrency(averageOrderValue, currency)}
          icon={<CreditCard size={22} />}
        />

        <Card
          title="Paid Orders"
          value={paidOrders}
          icon={<CheckCircle size={22} />}
        />

        <Card
          title="Pending Orders"
          value={pendingOrders}
          icon={<Clock size={22} />}
        />

        <Card
          title="Fulfilled"
          value={fulfilledOrders}
          icon={<Truck size={22} />}
        />

        <Card
          title="Unfulfilled"
          value={unfulfilledOrders}
          icon={<PackageCheck size={22} />}
        />
      </div>
    </section>
  );
}