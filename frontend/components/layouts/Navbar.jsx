"use client";

import Link from "next/link";
import NavLinks from "../navbar/NavLinks";
import ProfileMenu from "../navbar/ProfileMenu";
import MobileMenu from "../navbar/MobileMenu";

const Navbar = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-white/10 bg-[#111827]/95 backdrop-blur-xl shadow-lg shadow-black/20">
      <div className="mx-auto flex h-full max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/dashboard"
          className="flex shrink-0 items-center gap-3 rounded-md text-white"
        >
          <img
            src="https://www.tryonixstudio.com/tryonix_logo.png"
            alt="Tryonix Logo"
            className="h-7 w-7 rounded-full object-contain"
          />
          <h2 className="hidden text-xl font-bold tracking-tight sm:block">
            Tryonix
          </h2>
        </Link>

        <div className="flex items-center gap-3 sm:gap-5">
          <div className="hidden md:block">
            <NavLinks />
          </div>

          <div className="hidden h-6 w-px bg-white/10 md:block" aria-hidden="true" />

          <ProfileMenu />

          <div className="md:hidden">
            <MobileMenu />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;