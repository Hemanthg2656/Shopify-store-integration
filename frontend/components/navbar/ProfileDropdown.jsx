"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { User, LogOut, ChevronDown } from "lucide-react";

import { useDispatch } from "react-redux";
import { logoutUser } from "@/redux/slices/authSlice";
import { toast } from "sonner";

const ProfileDropdown = ({ store }) => {
  const dispatch = useDispatch();
  const router = useRouter();

  const ownerName =
    store?.owner || store?.email?.split("@")[0] || "Store Owner";

  const initials = ownerName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();

      toast.success("Logged out successfully");

      router.replace("/");
    } catch (err) {
      toast.error(err || "Logout failed");
    }
  };

  return (
    <Menu as="div" className="relative">
      

      <MenuButton
        className="
          flex
          items-center
          gap-2
          rounded-full
          border
          border-white/10
          bg-[#1F2937]
          px-2
          py-1.5
          hover:border-orange-500
          transition
        "
      >
        <div
          className="
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-full
            bg-orange-500
            font-semibold
            text-white
          "
        >
          {initials}
        </div>

        <ChevronDown size={16} className="text-slate-400" />
      </MenuButton>

     

      <MenuItems
        anchor="bottom end"
        className="
          mt-3
          w-72
          rounded-xl
          border
          border-white/10
          bg-[#111827]
          p-2
          shadow-xl
          focus:outline-none
        "
      >
       

        <div className="border-b border-white/10 p-3">
          <div className="flex items-center gap-3">
            <div
              className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-full
                bg-orange-500
                text-white
                font-semibold
              "
            >
              {initials}
            </div>

            <div>
              <p className="font-semibold text-white">
                {store?.owner || "Store Owner"}
              </p>

              <p className="text-sm text-slate-400">{store?.storeName}</p>
            </div>
          </div>
        </div>

        

        <MenuItem>
          <Link
            href="/profile"
            className="flex items-center gap-3 rounded-lg px-3 py-3 text-slate-200 hover:bg-white/5"
          >
            <User size={18} />
            Profile
          </Link>
        </MenuItem>
        <div className="my-2 border-t border-white/10" />

       

        <MenuItem>
          <button
            onClick={handleLogout}
            className="
              flex
              w-full
              items-center
              gap-3
              rounded-lg
              px-3
              py-3
              text-left
              text-red-400
              hover:bg-red-500/10
            "
          >
            <LogOut size={18} />
            Logout
          </button>
        </MenuItem>
      </MenuItems>
    </Menu>
  );
};

export default ProfileDropdown;
