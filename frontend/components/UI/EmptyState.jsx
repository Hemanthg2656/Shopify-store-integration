"use client";

const EmptyState = ({
  icon,
  title,
  description,
  action,
}) => {
  return (
    <div
      className="
        flex
        flex-col
        items-center
        justify-center
        rounded-xl
        border
        border-dashed
        border-white/10
        bg-[#111827]
        px-6
        py-16
        text-center
      "
    >
      <div className="mb-5 rounded-full bg-orange-500/10 p-5 text-orange-400">
        {icon}
      </div>

      <h2 className="text-2xl font-semibold text-white">
        {title}
      </h2>

      <p className="mt-3 max-w-md text-slate-400">
        {description}
      </p>

      {action && (
        <div className="mt-6">
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState;