"use client";
import { useSelector } from "react-redux";
import { formatCurrency } from "@/utils/formatCurrency";

const CustomersRow = ({ customer }) => {
  const currency = useSelector((state) => state.store?.store?.currency);
  const joined = new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(customer.createdAt));

  const spent = Number(customer.totalSpent || 0).toLocaleString("en-IN");

  return (
    <tr className="border-b border-white/10 transition-colors hover:bg-white/5">
      <td className="px-6 py-4">
        <a
          href={customer.shopifyLink}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-orange-400 hover:underline"
        >
          {customer.shopifyCustomerId}
        </a>
      </td>

      <td className="px-6 py-4 text-white">
        {`${customer.firstName ?? ""} ${customer.lastName ?? ""}`.trim() || "-"}
      </td>


      <td className="px-6 py-4 text-slate-300">{customer.email || "-"}</td>

     
      <td className="px-6 py-4 text-slate-300">{customer.phone || "-"}</td>

      
      <td className="px-6 py-4 text-center text-white">
        {customer.ordersCount}
      </td>

      <td
        className="py-4 text-right font-semibold text-white"
        style={{ paddingLeft: 24, paddingRight: 32 }}
      >
        {formatCurrency(customer.totalSpent, currency)}
      </td>

      <td
        className="py-4 text-slate-400"
        style={{ paddingLeft: 32, paddingRight: 24 }}
      >
        {joined}
      </td>
    </tr>
  );
};

export default CustomersRow;
