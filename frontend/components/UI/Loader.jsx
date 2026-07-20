"use client";

const Loader = ({ fullScreen = true, label = "Loading..." }) => {
  return (
    <div
      className={
        fullScreen
          ? "flex min-h-screen items-center justify-center bg-[#0F172A]"
          : "flex items-center justify-center py-16"
      }
    >
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-4 border-orange-500/20" />
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-orange-500" />
        </div>

        <span className="text-sm font-medium tracking-wide text-slate-400">
          {label}
        </span>
      </div>
    </div>
  );
};

export default Loader;