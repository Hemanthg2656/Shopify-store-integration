"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X, Loader2 } from "lucide-react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { getProductShopifyLink } from "@/services/product.services";

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

const ProductDetailsModal = ({ product, onClose }) => {
  const currency = useSelector((state) => state.store?.store?.currency);

  const images =
    product.images?.map((img) => ({
      id: img.id,
      src: img.image_url,
      alt: img.alt_text,
    })) ?? [];

  if (images.length === 0) {
    images.push({
      id: "placeholder",
      src: "/placeholder-product.svg",
      alt: product.title,
    });
  }

  const [activeImage, setActiveImage] = useState(0);
  const [viewingInShopify, setViewingInShopify] = useState(false);

  const variants = product.variants || [];
  const hasMultipleVariants = variants.length > 1;

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const handleViewInShopify = async () => {
    if (viewingInShopify) return;

    setViewingInShopify(true);

    try {
      if (!product.shopifyProductId) {
        toast.error("Shopify product id not found");
        return;
      }
      const url = await getProductShopifyLink(product.shopifyProductId);

      window.open(url, "_blank");
    } catch (err) {
      toast.error("Couldn't open this product in Shopify. Please try again.");
    } finally {
      setViewingInShopify(false);
    }
  };

  return (
    <div
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={product.title}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="relative max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-[#111827] p-6 sm:p-8"
      >
        <button
          onClick={onClose}
          aria-label="Close product details"
          className="absolute right-5 top-5 z-10 rounded-full p-1 text-slate-400 transition hover:text-white"
        >
          <X size={24} />
        </button>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div>
            <div className="relative h-[320px] rounded-2xl bg-white sm:h-[420px]">
              <Image
                src={images[activeImage].src}
                alt={images[activeImage].alt}
                fill
                className="object-contain p-8"
              />
            </div>

            {images.length > 1 && (
              <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                {images.map((img, index) => (
                  <button key={img.id} onClick={() => setActiveImage(index)}>
                    <Image
                      src={img.src}
                      alt={img.alt}
                      fill
                      className="object-contain p-1"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              {product.title}
            </h2>

            <p className="mt-3 text-slate-400">{product.productType}</p>

            <div className="mt-6 flex items-baseline gap-3">
              <h3 className="text-3xl font-bold text-orange-500 sm:text-4xl">
                {formatPrice(product.price, currency)}
              </h3>
              {product.variants?.[0]?.compareAtPrice && (
                <span className="text-lg text-slate-500 line-through">
                  {formatPrice(product.variants[0].compareAtPrice, currency)}
                </span>
              )}
            </div>

            <div className="mt-6 space-y-3 text-slate-300">
              <div className="flex justify-between">
                <span>Status</span>
                <span
                  className={`rounded-full px-3 py-0.5 text-xs font-semibold ${
                    statusStyles[product.status] || statusStyles.ARCHIVED
                  }`}
                >
                  {product.status}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Inventory</span>
                <span>{product.totalInventory}</span>
              </div>

              <div className="flex justify-between">
                <span>Vendor</span>
                <span>{product.vendor || "-"}</span>
              </div>

              {!hasMultipleVariants && (
                <div className="flex justify-between">
                  <span>SKU</span>
                  <span>{variants?.[0]?.sku || "-"}</span>
                </div>
              )}
            </div>

            {product.description && (
              <div className="mt-6 border-t border-white/10 pt-6">
                <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
                  Description
                </h4>
                <div
                  className="prose prose-invert prose-sm max-w-none text-slate-300"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </div>
            )}

            {hasMultipleVariants && (
              <div className="mt-6 border-t border-white/10 pt-6">
                <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
                  Variants ({variants.length})
                </h4>
                <div className="overflow-hidden rounded-xl border border-white/10">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-white/5 text-left text-slate-400">
                        <th className="px-4 py-2 font-medium">Variant</th>
                        <th className="px-4 py-2 font-medium">SKU</th>
                        <th className="px-4 py-2 font-medium">Price</th>
                        <th className="px-4 py-2 font-medium">Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {variants.map((variant) => (
                        <tr
                          key={variant.id}
                          className="border-t border-white/10 text-slate-300"
                        >
                          <td className="px-4 py-2">{variant.title}</td>
                          <td className="px-4 py-2">{variant.sku || "-"}</td>
                          <td className="px-4 py-2">
                            {formatPrice(variant.price, currency)}
                            {variant.compareAtPrice && (
                              <span className="ml-1 text-xs text-slate-500 line-through">
                                {formatPrice(variant.compareAtPrice, currency)}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-2">
                            {variant.inventoryQuantity ?? "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <button
              onClick={handleViewInShopify}
              disabled={viewingInShopify}
              className="mt-10 flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {viewingInShopify && (
                <Loader2 size={18} className="animate-spin" />
              )}
              {viewingInShopify ? "Opening..." : "View in Shopify"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsModal;
