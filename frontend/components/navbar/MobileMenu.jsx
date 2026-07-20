"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  User,
  LogOut,
} from "lucide-react";
import { useState } from "react";

const links = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Products",
    href: "/products",
    icon: Package,
  },
  {
    title: "Orders",
    href: "/orders",
    icon: ShoppingCart,
  },
  {
    title: "Customers",
    href: "/customers",
    icon: Users,
  },
];

export default function MobileMenu() {
  const pathname = usePathname();

  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg p-2 text-white md:hidden"
      >
        <Menu size={24} />
      </button>

      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 bg-black/60"
          />

          <aside
            className="
              fixed
              left-0
              top-0
              z-50
              h-screen
              w-72
              border-r
              border-white/10
              bg-[#111827]
              p-6
            "
          >
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                Menu
              </h2>

              <button onClick={() => setOpen(false)}>
                <X className="text-white" />
              </button>
            </div>

            <nav className="space-y-2">
              {links.map((link) => {
                const Icon = link.icon;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-4 py-3 transition
                      ${
                        pathname === link.href
                          ? "bg-orange-500 text-white"
                          : "text-slate-300 hover:bg-white/5"
                      }`}
                  >
                    <Icon size={20} />
                    {link.title}
                  </Link>
                );
              })}
            </nav>

            <div className="my-6 border-t border-white/10" />

            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="mb-2 flex items-center gap-3 rounded-lg px-4 py-3 text-slate-300 hover:bg-white/5"
            >
              <User size={20} />
              Profile
            </Link>

            <button
              className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-red-400 hover:bg-red-500/10"
            >
              <LogOut size={20} />
              Logout
            </button>
          </aside>
        </>
      )}
    </>
  );
}