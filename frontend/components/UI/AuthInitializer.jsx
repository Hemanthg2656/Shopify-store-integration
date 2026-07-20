"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchMe } from "@/redux/slices/authSlice";
import { fetchStore } from "@/redux/slices/storeSlice";

const AuthInitializer = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchMe());
    dispatch(fetchStore());
  }, [dispatch]);

  return children;
};

export default AuthInitializer;