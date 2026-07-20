"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

import Loader from "@/components/UI/Loader";
import Pagination from "@/components/UI/Pagination";
import CustomerSearchContainer from "@/components/customers/CustomerSearchContainer";
import CustomersTable from "@/components/customers/CustomersTable";

import {
  fetchCustomers,
  setSearch,
  setSort,
  syncCustomersData,
} from "@/redux/slices/customerSlice";
import EmptyState from "@/components/UI/EmptyState";
import { Users, AlertTriangle } from "lucide-react";

const Customers = () => {
  const dispatch = useDispatch();

  const {
    customers,
    pageInfo,
    loading,
    initialized,
    search,
    error,
    sort,
    syncing,
    page,
  } = useSelector((state) => state.customers);

  useEffect(() => {
    dispatch(
      fetchCustomers({
        search,
        sort,
        page,
      }),
    );
  }, [dispatch, search, sort, page]);

  const handleRetry = () => {
    dispatch(
      fetchCustomers({
        search,
        sort,
        page,
      }),
    );
  };

  const handleSync = async () => {
    try {
      await dispatch(syncCustomersData()).unwrap();

      dispatch(
        fetchCustomers({
          search,
          sort,
          page,
        }),
      );

      toast.success("Customers synced successfully");
    } catch (err) {
      toast.error(err || "Failed to sync customers");
    }
  };
  return (
    <div className="pb-10">
      {/* Page header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Customers
          </h1>

          <p className="text-sm text-slate-400">
            Customers synced from your Shopify store.
          </p>
        </div>

        <button
          onClick={handleSync}
          disabled={syncing}
          className="rounded-lg bg-orange-500 px-5 py-2 text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {syncing ? "Syncing..." : "Sync Customers"}
        </button>
      </div>

      <CustomerSearchContainer
        search={search}
        onSearchChange={(value) => dispatch(setSearch(value))}
        sort={sort}
        onSortChange={(value) => dispatch(setSort(value))}
      />

      <div className="mt-8">
        {!initialized || loading ? (
          <div className="rounded-2xl border border-white/10 bg-[#111827]/40 py-24">
            <Loader fullScreen={false} label="Loading customers..." />
          </div>
        ) : error && customers.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#111827]/40 p-6">
            <EmptyState
              icon={<AlertTriangle size={34} />}
              title="Couldn't load customers"
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
        ) : customers.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#111827]/40 p-6">
            <EmptyState
              icon={<Users size={34} />}
              title="No customers yet"
              description="Customers will appear here after syncing from Shopify."
            />
          </div>
        ) : (
          <>
            <CustomersTable customers={customers} />

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

export default Customers;
