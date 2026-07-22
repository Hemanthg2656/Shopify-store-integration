"use client";

import { useSelector } from "react-redux";
import OrderStatusBadge from "../Orders/OrderStatusBadge";
import { formatCurrency } from "@/utils/formatCurrency";

const RecentOrdersTable = ({ orders }) => {
  const currency = useSelector((state) => state.store?.store?.currency);
  return (
    <section
      className="
        mb-8
      "
    >
      <h2
        className="
          mb-4
          text-xl
          font-semibold
          text-white
        "
      >
        Recent Orders
      </h2>

      <div
        className="
          overflow-x-auto
          rounded-xl
          border
          border-white/10
          bg-[#111827]
        "
      >
        <table className="min-w-full">
          <thead className="border-b border-white/10 bg-[#1E293B]">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                Order
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                Customer
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                Payment
              </th>

              <th className="px-6 py-4 text-right text-sm font-semibold text-slate-300">
                Amount
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                Date
              </th>
            </tr>
          </thead>

          <tbody>
            {orders.length > 0 ? (
              orders.slice(0, 5).map((order) => {
              
                const orderDate = new Intl.DateTimeFormat("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  timeZone: "UTC",
                }).format(new Date(order.createdAt));

                return (
                  <tr
                    key={order.id}
                    className="border-b border-white/10 hover:bg-white/5"
                  >
                    <td className="px-6 py-4 font-medium text-orange-400">
                      {order.orderNumber}
                    </td>

                    <td className="px-6 py-4 text-white">
                      {order.customerName}
                    </td>

                    <td className="px-6 py-4">
                      <OrderStatusBadge status={order.financialStatus} />
                    </td>

                    <td className="px-6 py-4 text-right font-semibold text-white">
                      {formatCurrency(order.totalAmount, currency)}
                    </td>

                    <td className="px-6 py-4 text-slate-400">{orderDate}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400">
                  No recent orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default RecentOrdersTable;
