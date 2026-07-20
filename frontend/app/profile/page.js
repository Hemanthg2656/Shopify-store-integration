"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

import Loader from "@/components/UI/Loader";
import EmptyState from "@/components/UI/EmptyState";
import { AlertTriangle } from "lucide-react";

import StoreProfileCard from "@/components/profile/StoreProfileCard";

import { fetchStore } from "@/redux/slices/storeSlice";

export default function ProfilePage() {
  const dispatch = useDispatch();

  const { store, loading, error } = useSelector((state) => state.store);

  useEffect(() => {
    if (store === null) {
      dispatch(fetchStore())
        .unwrap()
        .catch(() => {
          toast.error("Failed to load store");
        });
    }
  }, [dispatch]);

  if (loading) {
    return (
      <div className="py-32">
        <Loader />
      </div>
    );
  }

  if (!store && error) {
    return (
      <div className="py-32">
        <EmptyState
          icon={<AlertTriangle size={34} />}
          title="Couldn't load store"
          description={error}
          action={
            <button
              onClick={() => dispatch(fetchStore())}
              className="rounded-lg bg-orange-500 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-600"
            >
              Try Again
            </button>
          }
        />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="py-32">
        <Loader />
      </div>
    );
  }

  const ownerName = store.owner || store.email?.split("@")[0] || "Store Owner";

  const initials = ownerName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <section
      className="
        mx-auto
        max-w-7xl
        px-6
        pt-24
        pb-10
      "
    >
      {/* Profile Header */}

      <div
        className="
          mb-8
          rounded-xl
          border
          border-white/10
          bg-[#111827]
          p-8
        "
      >
        <div className="flex flex-col items-center">
          <div
            className="
              flex
              h-24
              w-24
              items-center
              justify-center
              rounded-full
              bg-orange-500
              text-4xl
              font-bold
              text-white
            "
          >
            {initials}
          </div>

          <h1 className="mt-5 text-3xl font-bold text-white">{ownerName}</h1>

          <p className="mt-2 text-lg text-slate-300">{store.storeName}</p>

          <p className="text-slate-500">{store.domain}</p>

          <div className="mt-5 flex gap-3">
            <span className="rounded-full bg-orange-500/10 px-4 py-2 text-sm text-orange-400">
              {store.plan}
            </span>

            <span
              className={`rounded-full px-4 py-2 text-sm ${
                store.isDevelopmentStore
                  ? "bg-green-500/10 text-green-400"
                  : "bg-blue-500/10 text-blue-400"
              }`}
            >
              {store.isDevelopmentStore ? "Development Store" : "Live Store"}
            </span>
          </div>
        </div>
      </div>

      <StoreProfileCard store={store} />
    </section>
  );
}
