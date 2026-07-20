"use client";

import { useState } from "react";

import PublicRoute from "@/components/UI/auth/PublicRoute";
import Loader from "@/components/UI/Loader";

const ConnectStore = () => {
  const [shop, setShop] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleConnectStore = (e) => {
    e.preventDefault();

    setError("");

    const trimmedShop = shop.trim().toLowerCase();

    if (!trimmedShop) {
      setError("Please enter your Shopify store domain.");
      return;
    }

    if (!trimmedShop.endsWith(".myshopify.com")) {
      setError("Please enter a valid Shopify store domain.");
      return;
    }

    setLoading(true);

    window.location.href = `${
      process.env.NEXT_PUBLIC_API_URL
    }/auth/shopify/install?shop=${encodeURIComponent(trimmedShop)}`;
  };

  if (loading) {
    return <Loader label="Connecting to Shopify..." />;
  }

  return (
    <PublicRoute>
      <main className="min-h-screen overflow-hidden bg-[#0F172A] text-white">
        <div className="pointer-events-none fixed left-1/2 top-0 -z-10 h-[36rem] w-[56rem] -translate-x-1/2 rounded-full bg-orange-500/20 blur-3xl" />

        <section className="flex min-h-screen items-center justify-center px-6 pt-10">
          <div className="w-full max-w-xl rounded-3xl border border-white/5 bg-[#111827]/70 p-10 shadow-2xl backdrop-blur-xl">
            <div className="flex justify-center">
              <span className="inline-flex h-10 items-center justify-center rounded-full border border-orange-500/20 bg-orange-500/10 px-6 text-sm font-semibold text-orange-400">
                Shopify Integration
              </span>
            </div>

            <div className="mt-8 text-center">
              <h1 className="text-5xl font-extrabold tracking-tight">
                Connect Your <span className="text-orange-500">Store</span>
              </h1>

              <p className="mx-auto mt-5 max-w-md text-lg leading-8 text-slate-400">
                Enter your Shopify store domain to securely connect your Shopify
                store with Tryonix.
              </p>
            </div>

            <form onSubmit={handleConnectStore} className="mt-10 space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Shopify Store Domain
                </label>

                <input
                  type="text"
                  placeholder="example-store.myshopify.com"
                  value={shop}
                  onChange={(e) => setShop(e.target.value)}
                  className="h-14 w-full rounded-xl border border-slate-700 bg-slate-900 px-5 text-white placeholder:text-slate-500 outline-none transition-all duration-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              {error && (
                <p className="text-sm text-red-400">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex h-14 w-full items-center justify-center rounded-xl bg-orange-500 text-lg font-semibold text-white transition duration-300 hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Connect Store
              </button>
            </form>
          </div>
        </section>
      </main>
    </PublicRoute>
  );
};

export default ConnectStore;