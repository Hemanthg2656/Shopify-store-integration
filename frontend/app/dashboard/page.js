"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

import RevenueChart from "@/components/dashboard/RevenueChart";
import Loader from "@/components/UI/Loader";
import SummaryCards from "@/components/dashboard/SummaryCards";
import RecentOrdersTable from "@/components/dashboard/RecentOrdersTable";
import TopProductsTable from "@/components/dashboard/TopProductsTable";
import OrderSummary from "@/components/dashboard/OrderSummary";
import AnalyticsCards from "@/components/dashboard/AnalyticsCards";
import OrderSummaryCards from "@/components/dashboard/OrderSummaryCards";
import ProductStatusCards from "@/components/dashboard/ProductStatusCards";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import SyncStatusCard from "@/components/dashboard/SyncStatusCard";

import { fetchDashboard, fetchAnalytics } from "@/redux/slices/dashboardSlice";
import { fetchSyncStatus } from "@/redux/slices/syncSlice";
import EmptyState from "@/components/UI/EmptyState";
import { AlertTriangle } from "lucide-react";

const Dashboard = () => {
  const dispatch = useDispatch();

  const {
    summary,
    recentOrders,
    topProducts,
    analytics,
    loadingDashboard,
    loadingAnalytics,
    error,
    firstSyncRequired,
  } = useSelector((state) => state.dashboard);

  const { syncStatus } = useSelector((state) => state.sync);

  useEffect(() => {
    dispatch(fetchDashboard());
    dispatch(fetchAnalytics());
    dispatch(fetchSyncStatus());
  }, [dispatch]);

  const handleRefresh = async () => {
    try {
      await Promise.all([
        dispatch(fetchDashboard()).unwrap(),
        dispatch(fetchAnalytics()).unwrap(),
        dispatch(fetchSyncStatus()).unwrap(),
      ]);

      toast.success("Dashboard updated");
    } catch {
      toast.error("Failed to refresh dashboard");
    }
  };

  if (loadingDashboard || loadingAnalytics) {
    return <Loader />;
  }

  if (!summary && error) {
    return (
      <div className="flex h-[350px] items-center justify-center">
        <EmptyState
          icon={<AlertTriangle size={34} />}
          title="Couldn't load dashboard"
          description={error}
          action={
            <button
              onClick={handleRefresh}
              className="rounded-lg bg-orange-500 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-600"
            >
              Try Again
            </button>
          }
        />
      </div>
    );
  }

  if (!summary) {
    return <Loader />;
  }

  return (
    <section
      className="
        mt-8
        mb-10
        min-h-screen
        rounded-xl
        border
        border-white/10
        bg-[#111827]/35
        p-6
        shadow-[0_0_45px_rgba(0,0,0,.25)]
        backdrop-blur-xl
        lg:p-8
      "
    >
      <DashboardHeader
        onRefresh={handleRefresh}
        loading={loadingDashboard || loadingAnalytics}
      />
      {firstSyncRequired && (
        <div className="mb-6 rounded-xl border border-blue-500/20 bg-blue-500/10 p-5">
          <h3 className="text-lg font-semibold text-white">
            🎉 Store Connected Successfully
          </h3>

          <p className="mt-2 text-sm text-gray-300">
            Your Shopify store has been connected successfully.
          </p>

          <p className="mt-2 text-sm text-gray-300">
            No Shopify data has been imported yet.
          </p>

          <p className="mt-2 text-sm text-gray-300">
            Please run a manual sync to import your Products, Orders, and
            Customers.
          </p>

          <p className="mt-3 text-xs text-gray-400">
            This message will disappear automatically after your first
            successful sync.
          </p>
        </div>
      )}
      <SyncStatusCard syncStatus={syncStatus} />
      {summary && <SummaryCards summary={summary} />}
      <div
        className="
            mb-8
            grid
            gap-6
            lg:grid-cols-3
      "
      >
        <div className="lg:col-span-2">
          <RevenueChart data={analytics?.monthlyRevenue || []} />
        </div>

        <OrderSummary summary={analytics?.orderSummary} />
      </div>
      <AnalyticsCards analytics={analytics} />
      <OrderSummaryCards summary={analytics?.orderSummary} />
      <ProductStatusCards status={analytics?.productStatus} />
      <RecentOrdersTable orders={recentOrders} />

      <TopProductsTable products={topProducts} />
    </section>
  );
};

export default Dashboard;
