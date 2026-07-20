"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";

import { useEffect, useRef, useState } from "react";
import { User, LogOut, Loader2 } from "lucide-react";

import { logoutUser } from "@/redux/slices/authSlice";
import { toast } from "sonner";

const ProfileMenu = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const { store } = useSelector((state) => state.store);
  const [loggingOut, setLoggingOut] = useState(false);
  const [open, setOpen] = useState(false);

  const containerRef = useRef(null);

  const ownerName =
    store?.owner || store?.email?.split("@")[0] || "Store Owner";

  const initials = ownerName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await dispatch(logoutUser()).unwrap();

      toast.success("Logged out successfully");

      router.replace("/");
    } catch (err) {
      toast.error(err || "Logout failed");
      setLoggingOut(false);
    }
  };

  return (
    <div className="relative shrink-0" ref={containerRef}>
      
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 bg-[#1E293B] text-sm font-bold text-white transition hover:border-orange-500"
      >
        {initials}
      </button>

      
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-3 w-72 origin-top-right rounded-xl border border-white/10 bg-[#111827] shadow-2xl"
        >
          
          <div className="flex gap-4 border-b border-white/10 p-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-500 text-lg font-bold text-white">
              {initials}
            </div>

            <div className="min-w-0">
              <p className="truncate font-semibold text-white">{ownerName}</p>
              <p className="truncate text-sm text-slate-400">{store?.storeName}</p>
            </div>
          </div>

         
          <div className="py-2">
            <Link
              href="/profile"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-5 py-3 text-slate-300 transition hover:bg-[#1E293B] hover:text-white"
            >
              <User size={18} />
              Profile
            </Link>
          </div>

          
          <div className="border-t border-white/10">
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex w-full items-center gap-3 px-5 py-3 text-left text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loggingOut ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <LogOut size={18} />
              )}
              {loggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;