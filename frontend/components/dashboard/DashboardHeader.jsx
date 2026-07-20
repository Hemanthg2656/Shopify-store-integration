"use client";

import { RefreshCw } from "lucide-react";

const DashboardHeader = ({ onRefresh, loading }) => {
  return (
    <div className="mb-8 flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-white">
          Dashboard
        </h1>

        <p className="mt-1 text-slate-400">
          Overview of your Shopify store
        </p>
      </div>

      <button
        onClick={onRefresh}
        disabled={loading}
        className="
          flex
          items-center
          gap-2
          rounded-lg
          border
          border-orange-500/30
          bg-orange-500/10
          px-4
          py-2
          text-sm
          font-medium
          text-orange-400
          transition
          hover:bg-orange-500/20
          disabled:cursor-not-allowed
          disabled:opacity-60
        "
      >
        <RefreshCw
          size={18}
          className={loading ? "animate-spin" : ""}
        />

        Refresh
      </button>
    </div>
  );
};

export default DashboardHeader;