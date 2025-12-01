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
    <main className="min-h-screen bg-[#0a0a23] text-white flex flex-col items-center justify-center px-6 py-10">
      <header className="w-full flex justify-between items-center max-w-5xl mb-10">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl font-bold text-center translate-x-40"
        >
          ⚡ Welcome to Smart Task Evaluator
        </motion.h1>
        {user && (
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-md"
          >
            Logout
          </button>
        )}
      </header>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-3xl mb-10"
      >
        <p className="text-lg text-gray-300 mb-6">
          Evaluate your tasks with AI-powered insights and improve your productivity.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => router.push("/signup")}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-md font-semibold text-white shadow-lg"
          >
            Sign Up
          </button>
       
        </div>
      </motion.div>

      <motion.img
        src="/robot.png"
        alt="AI Robot"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-[300px] h-auto mb-10"
      />
    </main>
  );
}