"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ShoppingCart, AlertTriangle } from "lucide-react";

import Loader from "@/components/UI/Loader";
import Pagination from "@/components/UI/Pagination";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

import OrderSearchContainer from "@/components/Orders/OrderSearchContainer";
import OrdersTable from "@/components/Orders/OrdersTable";
import { toast } from "sonner";

import {
  fetchOrders,
  setSearch,
  setFinancialStatus,
  setFulfillmentStatus,
  setDateFrom,
  setDateTo,
  setSort,
  syncOrdersData,
  setPage,
} from "@/redux/slices/orderSlice";
import EmptyState from "@/components/UI/EmptyState";

const Orders = () => {
  const dispatch = useDispatch();
  const {
    orders,
    pageInfo,
    loading,
    initialized,
    error,
    search,
    financialStatus,
    fulfillmentStatus,
    dateFrom,
    dateTo,
    sort,
    syncing,
    page,
  } = useSelector((state) => state.orders);
  const debouncedSearch = useDebouncedValue(search, 350);

  useEffect(() => {
    dispatch(
      fetchOrders({
        search: debouncedSearch,
        financialStatus,
        fulfillmentStatus,
        dateFrom,
        dateTo,
        sort,
        page,
      }),
    );
  }, [
    dispatch,
    debouncedSearch,
    financialStatus,
    fulfillmentStatus,
    dateFrom,
    dateTo,
    sort,
    page,
  ]);

  const handlePageChange = (newPage) => {
    dispatch(setPage(newPage));
  };
  const handleSync = async () => {
    try {
      await dispatch(syncOrdersData()).unwrap();

      dispatch(
        fetchOrders({
          search: debouncedSearch,
          financialStatus,
          fulfillmentStatus,
          dateFrom,
          dateTo,
          sort,
          page,
        }),
      );

      toast.success("Orders synced successfully");
    } catch (err) {
      toast.error(err || "Failed to sync orders");
    }
  };

  const handleRetry = () => {
    dispatch(
      fetchOrders({
        search: debouncedSearch,
        financialStatus,
        fulfillmentStatus,
        dateFrom,
        dateTo,
        sort,
        page,
      }),
    );
  };

  const isLoading = !initialized || loading;

  return (
    <div className="pb-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Orders
          </h1>

          <p className="text-sm text-slate-400">
            Every order synced from your Shopify store.
          </p>
        </div>

        <button
          onClick={handleSync}
          disabled={syncing}
          className="rounded-lg bg-orange-500 px-5 py-2 text-white hover:bg-orange-600 disabled:opacity-50"
        >
          {syncing ? "Syncing..." : "Sync Orders"}
        </button>
      </div>

      <OrderSearchContainer
        search={search}
        onSearchChange={(value) => dispatch(setSearch(value))}
        financialStatus={financialStatus}
        onFinancialStatusChange={(value) => dispatch(setFinancialStatus(value))}
        fulfillmentStatus={fulfillmentStatus}
        onFulfillmentStatusChange={(value) =>
          dispatch(setFulfillmentStatus(value))
        }
        dateFrom={dateFrom}
        onDateFromChange={(value) => dispatch(setDateFrom(value))}
        dateTo={dateTo}
        onDateToChange={(value) => dispatch(setDateTo(value))}
        sort={sort}
        onSortChange={(value) => dispatch(setSort(value))}
      />

      <div className="mt-8">
        {isLoading ? (
          <div className="rounded-2xl border border-white/10 bg-[#111827]/40 py-24">
            <Loader fullScreen={false} label="Loading orders..." />
          </div>
        ) : error && orders.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#111827]/40 p-6">
            <EmptyState
              icon={<AlertTriangle size={34} />}
              title="Couldn't load orders"
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
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#111827]/40 p-6">
            <EmptyState
              icon={<ShoppingCart size={34} />}
              title="No orders yet"
              description="Orders will appear here after customers purchase from your Shopify store."
            />
          </div>
        ) : (
          <>
            <OrdersTable orders={orders} />

            {(pageInfo?.hasNextPage || pageInfo?.hasPreviousPage) && (
              <Pagination
                page={pageInfo.page}
                totalPages={pageInfo.totalPages}
                onPageChange={handlePageChange}
                loading={loading}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Orders;
