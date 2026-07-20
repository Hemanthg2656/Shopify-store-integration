"use client";

import OrdersRow from "./OrdersRow";

const OrdersTable = ({ orders }) => {
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#111827]">
      <table className="w-full" style={{ tableLayout: "fixed" }}>
        <colgroup>
          <col style={{ width: "20%" }} />
          <col style={{ width: "18%" }} />
          <col style={{ width: "22%" }} />
          <col style={{ width: "15%" }} />
          <col style={{ width: "8%" }} />
          <col style={{ width: "9%" }} />
          <col style={{ width: "8%" }} />
        </colgroup>

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
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
              Fulfillment
            </th>
            <th
              className="py-4 text-right text-sm font-semibold text-slate-300"
              style={{ paddingLeft: 24, paddingRight: 32 }}
            >
              Total
            </th>
            <th
              className="py-4 text-left text-sm font-semibold text-slate-300"
              style={{ paddingLeft: 32, paddingRight: 24 }}
            >
              Date
            </th>
          </tr>
        </thead>

        <tbody>
          {orders.length > 0 ? (
            orders.map((order) => <OrdersRow key={order.id} order={order} />)
          ) : (
            <tr>
              <td colSpan={6} className="py-12 text-center text-slate-400">
                No orders found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default OrdersTable;
