"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "./lib/supabaseClient";
import { motion } from "framer-motion";

export default function LandingPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function checkUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        setUser(session.user);
        router.push("/dashboard"); // Redirect to dashboard if already logged in
      }
    }

    checkUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/Login");
  };

  return (
    <main className="min-h-screen bg-[#0a0a23] text-white flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <header className="w-full flex justify-between items-center max-w-5xl mb-8 sm:mb-10">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-left sm:text-center flex-1"
        >
          ⚡ Welcome to Smart Task Evaluator
        </motion.h1>
        {user && (
          <button
            onClick={handleLogout}
            className="px-3 py-2 sm:px-4 sm:py-2 bg-red-500 hover:bg-red-600 rounded-md text-sm sm:text-base whitespace-nowrap ml-2"
          >
            Logout
          </button>
        )}
      </header>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-3xl mb-8 sm:mb-10 px-2"
      >
        <p className="text-base sm:text-lg text-gray-300 mb-6">
          Evaluate your tasks with AI-powered insights and improve your productivity.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <button
            onClick={() => router.push("/signup")}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-md font-semibold text-white shadow-lg transition-colors w-full sm:w-auto"
          >
            Sign Up
          </button>
          <button
            onClick={() => router.push("/Login")}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-md font-semibold text-white shadow-lg transition-all w-full sm:w-auto"
          >
            Login
          </button>
        </div>
      </motion.div>

      <motion.img
        src="/robot.png"
        alt="AI Robot"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-[200px] sm:w-[250px] md:w-[300px] h-auto mb-6 sm:mb-10"
      />
    </main>
  );
}