"use client";

import { Package, ShoppingCart, Users } from "lucide-react";
import { Wallet } from "lucide-react";
import { useSelector } from "react-redux";
import StatCard from "./StatCard";
import { formatCurrency } from "@/utils/formatCurrency";

const SummaryCards = ({ summary }) => {
  const currency = useSelector((state) => state.store?.store?.currency);
  return (
    <div
      className="
        mb-8
        grid
        gap-8
        sm:grid-cols-2
        xl:grid-cols-4
      "
    >
      <StatCard
        title="Products"
        value={summary.totalProducts}
        icon={<Package size={24} />}
      />

      <StatCard
        title="Orders"
        value={summary.totalOrders}
        icon={<ShoppingCart size={24} />}
      />

      <StatCard
        title="Customers"
        value={summary.totalCustomers}
        icon={<Users size={24} />}
      />

      <StatCard
        title="Revenue"
        value={formatCurrency(summary.totalRevenue, currency)}
        icon={<Wallet size={24} />}
      />
    </div>
  );
};

export default SummaryCards;
