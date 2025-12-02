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
    <div className="relative flex items-center justify-center min-h-screen bg-[#0a0a23] overflow-hidden px-4">

      {/* Robot Image */}
      <motion.div
        initial={{ scale: 0.8, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="hidden md:block absolute left-8 top-1/2 transform -translate-y-1/2"
      >
        <img src="/robot.png" alt="AI Robot" className="w-64 md:w-[600px] h-auto" />
      </motion.div>

      {/* CHANGE HERE ➤ Added wrapper div for correct alignment */}
      <div className="flex justify-center md:justify-end w-full md:pr-20">
      {/* ------------------------------------------------------------------ */}

        {/* Signup Card */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8 }}

          // CHANGE HERE ➤ Removed md:ml-20 which caused layout issues
          className="relative z-10 w-full max-w-md p-6 sm:p-10 rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 shadow-lg text-white mx-4"
          // ------------------------------------------------------------------
        >
          {/* Small robot for narrow screens */}
          <div className="md:hidden flex justify-center mb-4">
            <img src="/robot.png" alt="robot" className="w-32 h-auto" />
          </div>

          {/* Neon Title */}
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl sm:text-3xl font-bold text-center mb-9 text-white drop-shadow-[0_0_12px_rgba(0,102,255,0.7)]"
          >
            Create Account 🤖
          </motion.h1>

          {/* Username */}
          <label className="text-sm text-blue-300">Username</label>
          <input
            type="text"
            placeholder="your_username"
            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-blue-500/40 mb-4 text-white outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-500/70"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          {/* Email */}
          <label className="text-sm text-blue-300">Email</label>
          <input
            type="email"
            placeholder="email@domain.com"
            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-blue-500/40 mb-4 text-white outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-500/70"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* Password */}
          <label className="text-sm text-blue-300">Password</label>
         <input
  type="text"
  placeholder="your_username"
  autoComplete="off"
  name="new-username"   // prevents autofill
  inputMode="text"
  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-blue-500/40 mb-4 text-white outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-500/70"
  value={username}
  onChange={(e) => setUsername(e.target.value)}
/>


          {/* Button */}
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 20px #3b82f6" }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSignup}
            className="w-full py-3 bg-linear-to-r from-purple-500 to-pink-500 text-white rounded-md font-semibold shadow-xl cursor-pointer"
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
          <p className="text-center mt-3 text-sm text-blue-300">
            Already have an account?
            <button
              className="text-blue-400 underline pl-1 cursor-pointer"
              onClick={() => router.push("/Login")}
            >
              Login
            </button>
          </p>
        </motion.div>
      </div> {/* change wrapper close */}
    </div>
  );
}
