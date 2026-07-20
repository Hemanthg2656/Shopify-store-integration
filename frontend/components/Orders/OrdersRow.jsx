"use client";

import { useSelector } from "react-redux";
import OrderStatusBadge from "./OrderStatusBadge";

const formatAmount = (amount, currency) => {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 2,
    }).format(Number(amount || 0));
  } catch {
    return `${currency || ""} ${amount || 0}`.trim();
  }
};

const OrdersRow = ({ order }) => {
  const currency = useSelector((state) => state.store?.store?.currency);
  const customer = order.customerName || "Guest";

  const orderDate = new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(order.createdAt));

  return (
    <tr className="border-b border-white/10 transition-colors hover:bg-white/5">
      <td className="px-6 py-4">
        <a
          href={order.shopifyLink}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-orange-400 hover:underline"
        >
          {order.orderNumber}
        </a>
      </td>

      <td className="px-6 py-5 text-white">{customer}</td>

      <td className="px-6 py-5">
        <OrderStatusBadge status={order.financialStatus} />
      </td>

      <td className="px-6 py-5">
        <OrderStatusBadge status={order.fulfillmentStatus} />
      </td>

      <td
        className="py-5 text-right font-semibold text-white"
        style={{ paddingLeft: 24, paddingRight: 32, whiteSpace: "nowrap" }}
      >
        {formatAmount(order.totalAmount, order.currency || currency)}
      </td>

      <td
        className="py-5 text-slate-400"
        style={{ paddingLeft: 32, paddingRight: 24, whiteSpace: "nowrap" }}
      >
        {orderDate}
      </td>
    </tr>
  );
};

export default OrdersRow;
