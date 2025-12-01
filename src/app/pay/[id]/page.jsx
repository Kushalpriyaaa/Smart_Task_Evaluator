"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export default function PaymentPage() {
  const { id } = useParams();           // task id from URL
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  // 1️⃣ Load user + task details
  useEffect(() => {
    async function init() {
      // current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        router.push("/Login");
        return;
      }
      setUser(userData.user);

      // task details
      const { data: taskData, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error(error);
      } else {
        // if already paid, no need to be on this page
        if (taskData.is_paid) {
          router.push(`/tasks/${id}`);
          return;
        }
        setTask(taskData);
      }

      setLoading(false);
    }

    init();
  }, [id, router]);

  // 2️⃣ Fake payment handler
  const handleDemoPayment = async () => {
    if (!user || !task) return;

    setPaying(true);

    try {
      // a) create payment row
      const { data: payment, error: payError } = await supabase
        .from("payments")
        .insert([
          {
            user_id: user.id,
            task_id: task.id,
            amount: 99,
            status: "success",
            provider: "demo",
          },
        ])
        .select()
        .single();

      if (payError) throw payError;

      // b) update task as paid
      const { error: taskError } = await supabase
        .from("tasks")
        .update({
          is_paid: true,
          payment_id: payment.id,
        })
        .eq("id", task.id);

      if (taskError) throw taskError;

      // c) redirect back to report
      router.push(`/tasks/${task.id}`);
    } catch (err) {
      console.error("Payment error:", err);
      alert("Payment failed (demo) – check console.");
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950/20 to-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-300">Loading payment details...</p>
        </div>
      </main>
    );
  }

  if (!task) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950/20 to-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl mb-4 block">❌</span>
          <p className="text-xl text-gray-300">Task not found.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950/20 to-slate-950 text-white flex flex-col items-center px-6 py-10 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="w-full max-w-xl relative z-10">
        <button
          className="mb-6 flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
          onClick={() => router.push(`/tasks/${task.id}`)}
        >
          <span className="text-xl">←</span> Back to Task Report
        </button>

        <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 rounded-2xl p-6 border border-gray-700/50 backdrop-blur-xl shadow-2xl">
          {/* Header with icon */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">🔓</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Unlock Full Report
              </h1>
              <p className="text-gray-400 text-xs mt-0.5">Get complete AI insights</p>
            </div>
          </div>

          {/* Task details card */}
          <div className="bg-gradient-to-r from-gray-800/80 to-gray-800/60 p-4 rounded-xl mb-4 border border-gray-700/40">
            <h3 className="text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Task Description</h3>
            <p className="text-gray-200 leading-relaxed">{task.description}</p>
          </div>

          {/* What you'll get section */}
          <div className="mb-5">
            <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              <span>✨</span> What You&apos;ll Get:
            </h3>
            <div className="space-y-2">
              <div className="flex items-start gap-2 bg-gray-800/40 p-3 rounded-lg border border-gray-700/30">
                <span className="flex-shrink-0">💡</span>
                <div>
                  <p className="font-medium text-gray-200 text-sm">Detailed Improvement Suggestions</p>
                  <p className="text-xs text-gray-400">Specific recommendations to enhance your code quality</p>
                </div>
              </div>
              <div className="flex items-start gap-2 bg-gray-800/40 p-3 rounded-lg border border-gray-700/30">
                <span className="flex-shrink-0">🎯</span>
                <div>
                  <p className="font-medium text-gray-200 text-sm">Best Practices & Optimization Tips</p>
                  <p className="text-xs text-gray-400">Learn industry-standard coding patterns</p>
                </div>
              </div>
              <div className="flex items-start gap-2 bg-gray-800/40 p-3 rounded-lg border border-gray-700/30">
                <span className="flex-shrink-0">🚀</span>
                <div>
                  <p className="font-medium text-gray-200 text-sm">Performance Enhancement Ideas</p>
                  <p className="text-xs text-gray-400">Make your code faster and more efficient</p>
                </div>
              </div>
            </div>
          </div>

          {/* Price section */}
          <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 p-4 rounded-xl mb-5 border border-green-700/40">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs mb-0.5">One-time payment</p>
                <p className="text-lg font-bold text-white">Unlock Price</p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  ₹99
                </p>
                <p className="text-gray-400 text-xs mt-0.5">Lifetime access</p>
              </div>
            </div>
          </div>

          {/* Payment button */}
          <button
            onClick={handleDemoPayment}
            disabled={paying}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-700 disabled:to-gray-800 px-6 py-3 rounded-xl font-semibold shadow-xl hover:shadow-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            {paying ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span>💳</span> Pay Now & Unlock Report
              </span>
            )}
          </button>

          {/* Security note */}
          <div className="mt-4 flex items-center justify-center gap-2 text-gray-500 text-xs">
            <span>🔒</span>
            <p>Demo payment - Secure & instant unlock</p>
          </div>
        </div>
      </div>
    </main>
  );
}
