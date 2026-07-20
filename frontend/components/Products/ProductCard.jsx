"use client";

import Image from "next/image";
import { useSelector } from "react-redux";

const statusStyles = {
  ACTIVE: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
  DRAFT: "bg-amber-500/15 text-amber-400 border border-amber-500/20",
  ARCHIVED: "bg-red-500/15 text-red-400 border border-red-500/20",
};

const formatPrice = (amount, currency) => {
  if (amount === null || amount === undefined) return "-";

  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 2,
    }).format(Number(amount));
  } catch {
    return `${currency || ""} ${amount}`.trim();
  }
};

const ProductCard = ({ product, onClick }) => {
  const currency = useSelector((state) => state.store?.store?.currency);
  const image = product.images?.[0]?.image_url || "/placeholder-product.svg";

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <div
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      className="group flex w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#111827] transition-all duration-300 hover:-translate-y-1 hover:border-orange-500/40 hover:shadow-[0_12px_35px_rgba(0,0,0,.35)] focus-visible:-translate-y-1 focus-visible:border-orange-500/40"
    >
      {/* Product Image */}
      <div className="relative h-52 w-full overflow-hidden bg-white">
        <Image
          src={image}
          alt={product.title}
          fill
          className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div>
          <h2 className="min-h-[48px] text-base font-semibold leading-6 text-white line-clamp-2">
            {product.title}
          </h2>

          <p className="mt-2 text-sm capitalize text-slate-400">
            {product.productType || "General"}
          </p>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <span className="text-lg font-bold text-orange-500">
            {formatPrice(product.price, currency)}
          </span>

          <span
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold tracking-wide ${
              statusStyles[product.status] || statusStyles.ARCHIVED
            }`}
          >
            {product.status}
          </span>
        </div>

        <div className="mt-auto pt-6">
          <div className="h-px bg-white/10" />

          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-slate-400">Stock</span>
            <span className="text-base font-semibold text-white">
              {product.totalInventory}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;