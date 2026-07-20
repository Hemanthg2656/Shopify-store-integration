"use client";

import { Search, ChevronDown } from "lucide-react";

const SORT_OPTIONS = [
  {
    value: "newest",
    label: "Newest",
  },
  {
    value: "oldest",
    label: "Oldest",
  },
];

const CustomerSearchContainer = ({
  search,
  onSearchChange,

  sort,
  onSortChange,
}) => {
  return (
    <section
      className="
      rounded-2xl
      border
      border-white/10
      bg-[#111827]/70
      p-5
      backdrop-blur-xl
      lg:p-6
      "
    >
      <div className="flex flex-col gap-5 xl:flex-row">

        <div className="relative flex-1">
          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
          />

          <input
            type="text"
            placeholder="Search customers..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="
            h-11
            w-full
            rounded-xl
            border
            border-white/10
            bg-[#0F172A]
            pl-12
            pr-4
            text-sm
            text-white
            placeholder:text-slate-500
            outline-none
            transition-all
            focus:border-orange-500
            focus:ring-2
            focus:ring-orange-500/20
            "
          />
        </div>

        <div className="relative min-w-[180px]">

          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            className="
            h-11
            w-full
            appearance-none
            rounded-xl
            border
            border-white/10
            bg-[#0F172A]
            px-4
            pr-10
            text-sm
            text-white
            outline-none
            focus:border-orange-500
            focus:ring-2
            focus:ring-orange-500/20
            "
          >
            {SORT_OPTIONS.map((item) => (
              <option
                key={item.value}
                value={item.value}
              >
                Sort : {item.label}
              </option>
            ))}
          </select>

          <ChevronDown
            size={18}
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
          />

        </div>

      </div>
    </section>
  );
};

export default CustomerSearchContainer;