"use client";
import Button from "@/components/ui/button/Button";
import { auth } from "@/firebase/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";

const AppHeader: React.FC = () => {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(auth.currentUser !== null);
  }, []);

  const handleLogout = () => {
    if (isLoggedIn) {
      signOut(auth)
    }
  }

  return (
    <header className="sticky top-0 flex w-full bg-white border-gray-200 z-99999 dark:border-gray-800 dark:bg-gray-900 lg:border-b">
      <div className="flex flex-row gap-1 items-center justify-end grow lg:flex-row lg:px-6 py-2">
        <Button
          className="flex text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
          onClick={() => router.push("/form-elements")}
        >
          Inputs
        </Button>
        <Button
          className="flex text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
          onClick={handleLogout}
        >
          Log out
        </Button>
      </div>
    </header>
  );
};

export default AppHeader;
