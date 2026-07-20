"use client";

import {
  Store,
  Globe,
  Mail,
  BadgeDollarSign,
  Clock3,
  Calendar,
  MapPin,
  ShieldCheck,
} from "lucide-react";

const Item = ({ icon, label, value }) => (
  <div
    className="
      rounded-xl
      border
      border-white/10
      bg-[#111827]
      p-5
      transition
      hover:border-orange-500/40
    "
  >
    <div className="flex items-center gap-4">
      <div
        className="
          rounded-lg
          bg-orange-500/10
          p-3
          text-orange-400
        "
      >
        {icon}
      </div>

      <div>
        <p className="text-xs uppercase tracking-wider text-slate-500">
          {label}
        </p>

        <p className="mt-1 break-all text-lg font-medium text-white">
          {value || "-"}
        </p>
      </div>
    </div>
  </div>
);

export default function StoreProfileCard({ store }) {
  const createdDate = new Date(store.createdAt).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-white">Store Information</h2>

      <div className="grid gap-6 md:grid-cols-2">
        <Item
          icon={<Store size={20} />}
          label="Store Name"
          value={store.storeName}
        />

        <Item
          icon={<Globe size={20} />}
          label="Primary Domain"
          value={store.primaryDomain}
        />

        <Item icon={<Mail size={20} />} label="Email" value={store.email} />

        <Item
          icon={<BadgeDollarSign size={20} />}
          label="Plan"
          value={store.plan}
        />

        <Item
          icon={<ShieldCheck size={20} />}
          label="Currency"
          value={store.currency}
        />

        <Item
          icon={<Clock3 size={20} />}
          label="Timezone"
          value={`${store.timezoneShort} (${store.timezone})`}
        />

        <Item
          icon={<Calendar size={20} />}
          label="Connected Since"
          value={createdDate}
        />

        <Item
          icon={<MapPin size={20} />}
          label="Country"
          value={store.address?.country}
        />
      </div>
    </div>
  );
}
