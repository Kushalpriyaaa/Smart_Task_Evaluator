"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  // Store bubble data here to avoid hydration error
  const [bubbles, setBubbles] = useState([]);

  useEffect(() => {
    const generatedBubbles = Array.from({ length: 20 }).map(() => ({
      size: Math.floor(Math.random() * 100) + 50,
      left: Math.random() * 100,
      duration: Math.random() * 10 + 5, // Increased speed
      color: `rgba(${Math.floor(Math.random() * 200)}, ${Math.floor(Math.random() * 200)}, ${Math.floor(Math.random() * 255)}, 0.6)`
    }));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBubbles(generatedBubbles);
  }, []);

  const handleLogin = async () => {
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      if (error.message.toLowerCase().includes("email not confirmed")) {
        setMessage("⚠ Email not verified. Please check inbox.");
      } else {
        setMessage(error.message);
      }
    } else {
      setMessage("🎉 Login successful!");
      setTimeout(() => router.push("/dashboard"), 800); // Redirecting to dashboard after login
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-[#0a0a23] overflow-hidden">

      {/* Bubble layer (safe hydration) */}
      {bubbles.map((bubble, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full opacity-50"
          style={{
            width: bubble.size,
            height: bubble.size,
            left: `${bubble.left}%`,
            bottom: "-20%", // Increased height
            backgroundColor: bubble.color,
          }}
          animate={{ y: ["0%", "-150%"] }} // Increased height
          transition={{
            duration: bubble.duration,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-[500px] h-[600px] p-10 rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.2)] text-white"
      >
        {/* Robot Image */}
        <div className="flex justify-center mb-6">
          <img
            src="/robot.png" // Assuming the robot image is named "robot.png" in the public folder
            alt="AI Robot"
            className="w-[150px] h-auto" // Added robot image above "Welcome Back"
          />
        </div>

        <h2 className="text-center text-2xl font-bold mb-2">Welcome Back</h2>
        <p className="text-center text-sm text-white/70 tracking-wide mb-6">Login to continue</p>

        <input
          type="email"
          placeholder="Enter email address"
          className="w-full px-4 py-3 mb-4 rounded-md bg-white/20 border border-white/30 text-white placeholder-gray-200 focus:outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Enter password"
          className="w-full px-4 py-3 mb-6 rounded-md bg-white/20 border border-white/30 text-white placeholder-gray-200 focus:outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleLogin}
          className="w-full py-3 bg-linear-to-r from-purple-500 to-pink-500 text-white rounded-md font-semibold shadow-xl cursor-pointer"
        >
          Login
        </motion.button>

        {message && <p className="text-center mt-4 text-yellow-200 text-sm animate-pulse">{message}</p>}

        <p className="text-center mt-4 text-sm text-white/80">
          Don’t have an account?
          <button className="text-white underline ml-1 cursor-pointer" onClick={() => router.push("/signup")}>
            Sign Up
          </button>
        </p>
      </motion.div>
    </div>
  );
}
