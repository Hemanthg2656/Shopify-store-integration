
"use client";

import Link from "next/link";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-white/10 bg-[#111827] backdrop-blur-xl shadow-lg shadow-black/20">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 text-white">
          <img
            src="https://www.tryonixstudio.com/tryonix_logo.png"
            alt="Tryonix Logo"
            className="h-7 w-7 rounded-full object-contain"
          />
          <h2 className="text-xl font-bold tracking-tight">Tryonix</h2>
        </Link>
      </div>
    </header>
  );
};

export default Header;
