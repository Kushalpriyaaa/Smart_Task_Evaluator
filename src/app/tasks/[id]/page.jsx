"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export default function TaskReportPage() {
  const { id } = useParams();
  const router = useRouter();
  const [task, setTask] = useState(null);

  useEffect(() => {
    async function fetchTask() {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("id", id)
        .single();

      if (!error) setTask(data);
    }

    fetchTask();
  }, []);

  if (!task) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading Report...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white px-8 py-10">

      <button className="mb-6 flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors" onClick={() => router.push("/dashboard")}>
        <span className="text-xl">←</span> Back to Dashboard
      </button>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold flex items-center gap-3">
          <span>📊</span> Task Evaluation Report
        </h1>
        <div className="flex items-center gap-2 bg-gradient-to-r from-gray-800 to-gray-900 px-5 py-3 rounded-full border border-gray-700 shadow-lg">
          <span className="text-sm text-gray-400">Score:</span>
          <span className={`text-2xl font-bold ${
            task.score >= 80 ? 'text-green-400' : 
            task.score >= 60 ? 'text-yellow-400' : 
            task.score >= 40 ? 'text-orange-400' : 
            'text-red-400'
          }`}>
            {task.score ?? "N/A"}/100
          </span>
        </div>
      </div>

      <section className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 p-8 rounded-2xl mb-6 border border-purple-700/50 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">📋</span>
          <h2 className="text-2xl font-semibold text-purple-300">Task Description</h2>
        </div>
        <p className="text-gray-200 leading-relaxed text-lg">{task.description}</p>
      </section>

      <section className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-2xl mb-6 border border-gray-700 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">🤖</span>
          <h2 className="text-2xl font-semibold text-blue-300">AI Feedback</h2>
        </div>

        <div className="mb-6 bg-gradient-to-r from-green-900/30 to-emerald-900/30 p-6 rounded-xl border border-green-700/40">
          <h3 className="font-semibold text-xl text-green-400 mb-3 flex items-center gap-2">
            <span>✨</span> Strengths
          </h3>
          <p className="text-gray-200 leading-relaxed">{task.strengths ?? "N/A"}</p>
        </div>

        <div className="mb-6 bg-gradient-to-r from-orange-900/30 to-red-900/30 p-6 rounded-xl border border-orange-700/40">
          <h3 className="font-semibold text-xl text-orange-400 mb-3 flex items-center gap-2">
            <span>⚡</span> Weaknesses
          </h3>
          <p className="text-gray-200 leading-relaxed">{task.weaknesses ?? "N/A"}</p>
        </div>

        <div className="bg-gradient-to-r from-blue-900/30 to-cyan-900/30 p-6 rounded-xl border border-blue-700/40">
          <h3 className="font-semibold text-xl text-cyan-400 mb-3 flex items-center gap-2">
            <span>💎</span> Improvements
          </h3>
          {task.is_paid ? (
            <p className="text-gray-200 leading-relaxed">{task.improvements}</p>
          ) : (
            <div className="relative">
              <p className="blur-sm text-gray-500 select-none leading-relaxed">
                Detailed improvement suggestions and optimization recommendations are available in the full report...
              </p>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-gray-900/80 px-4 py-2 rounded-lg border border-gray-700">
                  <span className="text-3xl">🔒</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="bg-gradient-to-br from-gray-900 to-slate-900 p-8 rounded-2xl mb-6 border border-gray-700 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">💻</span>
          <h2 className="text-2xl font-semibold text-slate-300">Submitted Code</h2>
        </div>
        <pre className="bg-gray-950 p-6 rounded-xl text-sm overflow-x-auto border border-gray-800 text-green-400 font-mono leading-relaxed shadow-inner">
{task.code}
        </pre>
      </section>

      {!task.is_paid && (
        <div className="flex justify-start">
          <button
            onClick={() => router.push(`/pay/${task.id}`)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-4 rounded-xl font-semibold text-lg shadow-lg transform hover:scale-105 transition-all flex items-center gap-3"
          >
            <span className="text-2xl">🔓</span> Unlock Full Report
          </button>
        </div>
      )}
    </main>
  );
}
