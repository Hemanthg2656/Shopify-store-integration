import Link from "next/link";
import PublicRoute from "@/components/UI/auth/PublicRoute";

const Home =()=>{
  return (
    <PublicRoute>
      <main className="min-h-screen overflow-hidden bg-[#0F172A] text-white">
        <div className="pointer-events-none fixed left-1/2 top-0 -z-10 h-[36rem] w-[56rem] -translate-x-1/2 rounded-full bg-orange-500/20 blur-3xl" />

        <section className="flex min-h-screen items-center justify-center px-8">
          <div className="mx-auto flex max-w-6xl flex-col items-center text-center">

            <span className="inline-flex h-10 items-center justify-center rounded-full border border-orange-500/20 bg-orange-500/10 px-6 text-sm font-semibold text-orange-400">
              Now syncing orders in real time
            </span>

            <h1 className="mt-8 text-5xl font-extrabold tracking-tight md:text-7xl">
              Connect your{" "}
              <span className="text-orange-500">
                Shopify Store
              </span>
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-400">
              Securely connect your Shopify store to sync products,
              orders, customers and analytics from one dashboard —
              without manual exports.
            </p>

            <Link
              href="/connect-store"
              className="mt-10 inline-flex w-[180px] h-[35px] items-center justify-center gap-2 rounded-xl bg-orange-500 px-8 text-lg font-semibold text-white transition duration-300 hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/30"
            >
              Connect Store

              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </section>
      </main>
    </PublicRoute>
  );
}
export default Home;