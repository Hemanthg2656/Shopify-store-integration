"use client";

import { formatCurrency } from "@/utils/formatCurrency";
import {
  BadgeCheck,
  Clock3,
  Truck,
  PackageCheck,
  DollarSign,
} from "lucide-react";
import { useSelector } from "react-redux";

const cards = [
  {
    key: "paidOrders",
    title: "Paid Orders",
    icon: BadgeCheck,
    color: "text-emerald-400",
  },
  {
    key: "pendingOrders",
    title: "Pending",
    icon: Clock3,
    color: "text-yellow-400",
  },
  {
    key: "fulfilledOrders",
    title: "Fulfilled",
    icon: Truck,
    color: "text-blue-400",
  },
  {
    key: "unfulfilledOrders",
    title: "Unfulfilled",
    icon: PackageCheck,
    color: "text-red-400",
  },
];

const OrderSummary = ({ summary }) => {
  if (!summary) return null;
  const currency = useSelector((state) => state.store?.store?.currency);

  return (
    <div
      className="
        rounded-xl
        border
        border-white/10
        bg-[#111827]
        p-6
      "
    >
      <h2 className="mb-6 text-xl font-semibold text-white">Order Summary</h2>

      <div className="space-y-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.key}
              className="
                  flex
                  items-center
                  justify-between
                  border
                  border-white/5
                  bg-white/5
                  px-4
                  py-3
                "
            >
              <div className="flex items-center gap-3">
                <Icon className={card.color} size={22} />

                <span className="text-slate-300">{card.title}</span>
              </div>

              <span className="font-bold text-white">{summary[card.key]}</span>
            </div>
          );
        })}

        <div className="mt-8 border-t border-white/10 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DollarSign size={22} className="text-orange-400" />

              <span className="text-slate-300">Avg Order Value</span>
            </div>

            <span className="font-bold text-orange-400">
              {formatCurrency(summary.averageOrderValue, currency)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
