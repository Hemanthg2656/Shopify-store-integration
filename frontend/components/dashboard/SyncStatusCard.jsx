"use client";

import { CheckCircle2, XCircle, RefreshCw } from "lucide-react";

const SyncItem = ({ title, data }) => {
  if (!data) {
    return (
      <div className="flex items-center justify-between py-3">
        <div>
          <p className="font-medium text-white">{title}</p>
          <p className="text-sm text-slate-500">Never synced</p>
        </div>

        <span className="text-sm text-slate-500">--</span>
      </div>
    );
  }

  const success = data.status === "SUCCESS";

  const completedAt = new Date(data.completed_at).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <div className="flex items-center gap-2">
          {success ? (
            <CheckCircle2 size={18} className="text-green-400" />
          ) : (
            <XCircle size={18} className="text-red-400" />
          )}

          <span className="font-medium text-white">{title}</span>
        </div>

        <p className="mt-1 text-xs text-slate-400">
          {data.sync_type} • {completedAt}
        </p>
      </div>

      <span
        className={`text-xs font-semibold ${
          success ? "text-green-400" : "text-red-400"
        }`}
      >
        {data.status}
      </span>
    </div>
  );
};

const SyncStatusCard = ({ syncStatus }) => {
  if (!syncStatus) return null;

  return (
    <section
      className="
        rounded-xl
        border
        border-white/10
        bg-[#111827]
        p-6
      "
    >
      <div className="mb-6 flex items-center gap-3">
        <RefreshCw size={22} className="text-orange-400" />

        <div>
          <h2 className="text-lg font-semibold text-white">Sync Status</h2>

          <p className="text-sm text-slate-400">Auto Sync • Every 3 Hours</p>
        </div>
      </div>

      <div className="divide-y divide-white/10">
        <SyncItem title="Products" data={syncStatus.products} />

        <SyncItem title="Orders" data={syncStatus.orders} />

        <SyncItem title="Customers" data={syncStatus.customers} />
      </div>
    </section>
  );
};

export default SyncStatusCard;
