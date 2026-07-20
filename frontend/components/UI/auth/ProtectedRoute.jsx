"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Loader from "../Loader";

const ProtectedRoute = ({ children }) => {
  const router = useRouter();

  const { isInitialized, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!isInitialized) return;

    if (!isAuthenticated) {
      router.replace("/");
    }
  }, [isInitialized, isAuthenticated, router]);

  if (!isInitialized) {
    return <Loader label="Checking your session..." />;
  }

  if (!isAuthenticated) {
    return null;
  }
  return children;
};

export default ProtectedRoute;
