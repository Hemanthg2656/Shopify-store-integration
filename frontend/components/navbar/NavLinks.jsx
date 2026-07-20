"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  {
    name: "Dashboard",
    href: "/dashboard",
  },
  {
    name: "Products",
    href: "/products",
  },
  {
    name: "Orders",
    href: "/orders",
  },
  {
    name: "Customers",
    href: "/customers",
  }
];

const NavLinks = () => {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-6">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`whitespace-nowrap text-sm font-medium transition-colors duration-200 ${
            pathname === link.href
              ? "text-orange-500"
              : "text-slate-300 hover:text-white"
          }`}
        >
          {link.name}
        </Link>
      ))}
    </nav>
  );
};

export default NavLinks;
