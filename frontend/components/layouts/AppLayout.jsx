"use client";

import { usePathname } from "next/navigation";

import Header from "./Header";
import Navbar from "./Navbar";
import ProtectedRoute from "../UI/auth/ProtectedRoute";

const AppLayout = ({ children }) => {
  const pathname = usePathname();

  const isPublic = pathname === "/" || pathname === "/connect-store";

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      {isPublic ? <Header /> : <Navbar />}

      {!isPublic && <div className="h-16" aria-hidden="true" />}

      <main>
        <div className="mx-auto max-w-[1600px] px-6 pb-16 pt-8 sm:px-8 lg:px-10 lg:pt-10 xl:px-12">
          {isPublic ? children : <ProtectedRoute>{children}</ProtectedRoute>}
        </div>
      </main>
    </div>
  );
};

export default AppLayout;