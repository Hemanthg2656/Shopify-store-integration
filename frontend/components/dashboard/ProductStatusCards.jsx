"use client";

import {
  CheckCircle,
  FileText,
  Archive,
} from "lucide-react";

const Card = ({ title, value, icon, color }) => {
  return (
    <div
      className="
        rounded-xl
        border
        border-white/10
        bg-[#111827]
        p-5
      "
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400">
            {title}
          </p>

          <h2 className="mt-2 text-2xl font-bold text-white">
            {value}
          </h2>
        </div>

        <div className={color}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default function ProductStatusCards({ status }) {
  if (!status) return null;

  return (
    <section className="mb-8">
      <h2 className="mb-4 text-xl font-semibold text-white">
        Product Status
      </h2>

      <div className="grid gap-6 md:grid-cols-3">
        <Card
          title="Active"
          value={status.active}
          color="text-green-400"
          icon={<CheckCircle size={28} />}
        />

        <Card
          title="Draft"
          value={status.draft}
          color="text-yellow-400"
          icon={<FileText size={28} />}
        />

        <Card
          title="Archived"
          value={status.archived}
          color="text-red-400"
          icon={<Archive size={28} />}
        />
      </div>
    </section>
  );
}