"use client";

import { Search, ChevronDown } from "lucide-react";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "title", label: "Title A-Z" },
];

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "draft", label: "Draft" },
  { value: "archived", label: "Archived" },
];

const selectClasses =
  "h-11 w-full appearance-none rounded-xl border border-white/10 bg-[#0F172A] px-4 pr-10 text-sm text-white outline-none transition-all duration-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20";

const SearchContainer = ({
  search,
  onSearchChange,
  sort,
  onSortChange,
  status,
  onStatusChange,
  productType,
  onProductTypeChange,
  productTypes = [],
}) => {
  return (
    <section className="mb-6 rounded-2xl border border-white/10 bg-[#111827]/70 p-5 backdrop-blur-xl lg:p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
        
        <div className="relative flex-1">
          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
          />

          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search products..."
            className="h-11 w-full rounded-xl border border-white/10 bg-[#0F172A] pl-12 pr-4 text-sm text-white outline-none transition-all duration-200 placeholder:text-slate-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          <div className="relative">
            <select
              value={status}
              onChange={(e) => onStatusChange(e.target.value)}
              className={selectClasses}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={18}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
            />
          </div>

          <div className="relative">
            <select
              value={productType}
              onChange={(e) => onProductTypeChange(e.target.value)}
              className={selectClasses}
            >
              <option value="">All Types</option>
              {productTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <ChevronDown
              size={18}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
            />
          </div>

          <div className="relative">
            <select
              value={sort}
              onChange={(e) => onSortChange(e.target.value)}
              className={selectClasses}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  Sort: {option.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={18}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default SearchContainer;