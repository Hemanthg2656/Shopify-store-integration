"use client";
import { formatCurrency } from "@/utils/formatCurrency";
import EmptyState from "../UI/EmptyState";
import { Package } from "lucide-react";
import { useSelector } from "react-redux";

const TopProductsTable = ({ products }) => {
  const currency = useSelector((state) => state.store?.store?.currency);
  return (
    <section>
      <h2
        className="
          mb-4
          text-xl
          font-semibold
          text-white
        "
      >
        Top Selling Products
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
                Product
              </th>

              <th className="px-6 py-4 text-center text-sm font-semibold text-slate-300">
                Units Sold
              </th>

              <th className="px-6 py-4 text-right text-sm font-semibold text-slate-300">
                Revenue
              </th>
            </tr>
          </thead>

          <tbody>
            {products.length > 0 ? (
              products.slice(0, 5).map((product) => (
                <tr
                  key={product.id}
                  className="
                    border-b
                    border-white/10
                    transition-colors
                    hover:bg-white/5
                  "
                >
                  <td className="px-6 py-4 font-medium text-white">
                    {product.title}
                  </td>

                  <td className="px-6 py-4 text-center text-slate-300">
                    {product.unitsSold}
                  </td>

                  <td className="px-6 py-4 text-right font-semibold text-orange-400">
                    {formatCurrency(product.revenue, currency)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="py-10">
                  <EmptyState
                    icon={<Package size={34} />}
                    title="No Products"
                    description="Run a manual sync to import products."
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default TopProductsTable;
