"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Loader from "../Loader";

const PublicRoute = ({ children }) => {
  const router = useRouter();

  const { isInitialized, isAuthenticated } = useSelector((state) => state.auth);
  useEffect(() => {
    if (!isInitialized) return;

    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isInitialized, isAuthenticated, router]);

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader/>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return children;
};

export default PublicRoute;
