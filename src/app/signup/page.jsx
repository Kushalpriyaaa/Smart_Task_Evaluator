"use client";

import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSignup = async () => {
    if (!username.trim()) {
      setMessage("⚠ Please enter a username");
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("🎉 Account created! Please check your email to verify.");
      setTimeout(() => router.push("/Login"), 2000);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-[#0a0a23] overflow-hidden px-4 sm:px-6 lg:px-8">
      {/* Robot Image - Desktop only (left side) */}
      <motion.div
        initial={{ scale: 0.8, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="absolute left-10 top-1/2 transform -translate-y-1/2 hidden lg:block"
      >
        <img
          src="/robot.png"
          alt="AI Robot"
          className="w-[500px] xl:w-[600px] h-auto"
        />
      </motion.div>

      {/* Signup Card */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-[400px] lg:max-w-[500px] mx-auto p-6 sm:p-8 lg:p-10 rounded-2xl bg-[#1a1a3e] lg:backdrop-blur-xl lg:bg-white/10 border border-white/10 lg:border-white/20 shadow-xl lg:shadow-[0_0_30px_rgba(255,255,255,0.2)] text-white lg:translate-x-90"
      >
        {/* Robot Image - Mobile/Tablet only (inside card) */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex justify-center mb-6 lg:hidden"
        >
          <img
            src="/robot.png"
            alt="AI Robot"
            className="w-[120px] h-auto"
          />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-2xl sm:text-3xl font-bold text-center mb-6 text-white lg:drop-shadow-[0_0_12px_rgba(0,102,255,0.7)]"
        >
          Create Account 🤖
        </motion.h1>

        {/* Username */}
        <label className="text-sm text-gray-300 lg:text-blue-300 block mb-2">Username</label>
        <input
          type="text"
          placeholder="your_username"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck="false"
          className="w-full px-4 py-3 rounded-lg bg-[#2a2a4e] lg:bg-white/10 border border-gray-600 lg:border-blue-500/40 mb-4 text-white placeholder-gray-400 outline-none focus:border-blue-400 lg:focus:border-blue-300 focus:ring-1 lg:focus:ring-2 focus:ring-blue-400 lg:focus:ring-blue-500/70"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        {/* Email */}
        <label className="text-sm text-gray-300 lg:text-blue-300 block mb-2">Email</label>
        <input
          type="email"
          placeholder="email@domain.com"
          autoComplete="new-email"
          autoCorrect="off"
          autoCapitalize="none"
          className="w-full px-4 py-3 rounded-lg bg-[#2a2a4e] lg:bg-white/10 border border-gray-600 lg:border-blue-500/40 mb-4 text-white placeholder-gray-400 outline-none focus:border-blue-400 lg:focus:border-blue-300 focus:ring-1 lg:focus:ring-2 focus:ring-blue-400 lg:focus:ring-blue-500/70"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Password */}
        <label className="text-sm text-gray-300 lg:text-blue-300 block mb-2">Password</label>
        <input
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          autoCorrect="off"
          autoCapitalize="none"
          className="w-full px-4 py-3 rounded-lg bg-[#2a2a4e] lg:bg-white/10 border border-gray-600 lg:border-blue-500/40 mb-6 text-white placeholder-gray-400 outline-none focus:border-blue-400 lg:focus:border-blue-300 focus:ring-1 lg:focus:ring-2 focus:ring-blue-400 lg:focus:ring-blue-500/70"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* Button */}
        <motion.button
          whileHover={{ scale: 1.02, boxShadow: "0 0 20px #3b82f6" }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSignup}
          className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-semibold shadow-lg transition-all"
        >
          Sign Up 🚀
        </motion.button>

        {/* Message */}
        {message && (
          <p className="text-center text-green-400 mt-4 text-sm animate-pulse">
            {message}
          </p>
        )}

        {/* Footer */}
        <p className="text-center mt-4 lg:mt-3 text-sm text-gray-400 lg:text-blue-300">
          Already have an account?{" "}
          <button
            className="text-blue-400 hover:text-blue-300 font-medium lg:font-normal lg:underline cursor-pointer"
            onClick={() => router.push("/Login")}
          >
            Login
          </button>
        </p>
      </motion.div>
    </div>
  );
}