"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const RevenueChart = ({ data }) => {
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
      <h2 className="mb-6 text-lg font-semibold text-white">
        Monthly Revenue
      </h2>

      <div className="h-80">

        <ResponsiveContainer width="100%" height="100%">

          <AreaChart data={data}>

            <CartesianGrid
              stroke="#334155"
              strokeDasharray="3 3"
            />

            <XAxis
              dataKey="month"
              stroke="#94A3B8"
            />

            <YAxis stroke="#94A3B8" />

            <Tooltip />

            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#F97316"
              fill="#F97316"
              fillOpacity={0.25}
            />

          </AreaChart>

        </ResponsiveContainer>

      </div>
    </section>
  );
};

export default RevenueChart;