"use client";

const StatCard = ({ title, value, icon }) => {
  return (
    <div
      className="
        rounded-xl
        border
        border-white/10
        bg-[#111827]
        p-6
        transition-all
        hover:border-orange-500/30
      "
    >
      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm text-slate-400">
            {title}
          </p>

          <h2 className="mt-2 text-3xl font-bold text-white">
            {value}
          </h2>

        </div>

        <div
          className="
            flex
            h-12
            w-12
            items-center
            justify-center
            rounded-lg
            bg-orange-500/10
            text-orange-400
          "
        >
          {icon}
        </div>

      </div>
    </div>
  );
};

export default StatCard;