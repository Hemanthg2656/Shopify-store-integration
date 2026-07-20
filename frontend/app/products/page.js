"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import EmptyState from "@/components/UI/EmptyState";
import { Package, AlertTriangle } from "lucide-react";

import Loader from "@/components/UI/Loader";
import SearchContainer from "@/components/Products/SearchContainer";
import ProductCard from "@/components/Products/ProductCard";
import ProductDetailsModal from "@/components/Products/ProductDetailsModal";
import Pagination from "@/components/UI/Pagination";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { toast } from "sonner";

import {
  fetchProducts,
  fetchProductTypes,
  syncProductsData,
  setSearch,
  setSort,
  setStatus,
  setProductType,
  setPage,
} from "@/redux/slices/productSlice";

const Products = () => {
  const dispatch = useDispatch();
  const {
    products,
    productTypes,
    pageInfo,
    loading,
    loadingProductTypes,
    initialized,
    error,
    search,
    sort,
    status,
    productType,
    syncing,
    page,
  } = useSelector((state) => state.products);
  const debouncedSearch = useDebouncedValue(search, 350);

  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    dispatch(fetchProductTypes());
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      fetchProducts({
        search: debouncedSearch,
        page,
        sort,
        status,
        productType,
      }),
    );
  }, [dispatch, debouncedSearch, sort, status, productType, page]);

  const handlePageChange = (newPage) => {
    dispatch(setPage(newPage));
  };
  const handleSync = async () => {
    try {
      await dispatch(syncProductsData()).unwrap();

      dispatch(
        fetchProducts({
          search: debouncedSearch,
          sort,
          page,
          status,
          productType,
        }),
      );

      toast.success("Products synced successfully");
    } catch (err) {
      toast.error(err || "Failed to sync products");
    }
  };

  const handleRetry = () => {
    dispatch(
      fetchProducts({
        search: debouncedSearch,
        sort,
        page,
        status,
        productType,
      }),
    );
  };

  const isLoading = !initialized || loading || loadingProductTypes;

  return (
    <div className="pb-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Products
          </h1>

          <p className="text-sm text-slate-400">
            Everything synced from your Shopify catalog.
          </p>
        </div>

        <button
          onClick={handleSync}
          disabled={syncing}
          className="rounded-lg bg-orange-500 px-5 py-2 text-white hover:bg-orange-600 disabled:opacity-50"
        >
          {syncing ? "Syncing..." : "Sync Products"}
        </button>
      </div>

      <SearchContainer
        search={search}
        onSearchChange={(value) => dispatch(setSearch(value))}
        sort={sort}
        onSortChange={(value) => dispatch(setSort(value))}
        status={status}
        onStatusChange={(value) => dispatch(setStatus(value))}
        productType={productType}
        onProductTypeChange={(value) => dispatch(setProductType(value))}
        productTypes={productTypes}
      />

      {/* Clear, explicit gap between the search card and the content below it */}
      <div className="mt-8">
        {isLoading ? (
          <div className="rounded-2xl border border-white/10 bg-[#111827]/40 py-24">
            <Loader fullScreen={false} label="Loading products..." />
          </div>
        ) : error && products.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#111827]/40 p-6">
            <EmptyState
              icon={<AlertTriangle size={34} />}
              title="Couldn't load products"
              description={error}
              action={
                <button
                  onClick={handleRetry}
                  className="rounded-lg bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
                >
                  Try Again
                </button>
              }
            />
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={() => setSelectedProduct(product)}
                />
              ))}
            </div>

            {selectedProduct && (
              <ProductDetailsModal
                product={selectedProduct}
                onClose={() => setSelectedProduct(null)}
              />
            )}

            {(pageInfo?.hasNextPage || pageInfo?.hasPreviousPage) && (
              <Pagination
                page={pageInfo.page}
                totalPages={pageInfo.totalPages}
                onPageChange={handlePageChange}
                loading={loading}
              />
            )}
          </>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-[#111827]/40 p-6">
            <EmptyState
              icon={<Package size={34} />}
              title="No products yet"
              description="Connect your Shopify store to start importing products."
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
