"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [pastReports, setPastReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchUser() {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) {
        router.push("/Login");
      } else {
        setUser(data.user);
        
        // Fetch username from user_metadata or use email prefix as fallback
        const displayName = 
          data.user.user_metadata?.username || 
          data.user.user_metadata?.full_name ||
          data.user.email?.split('@')[0] || 
          "User";
        
        setUsername(displayName);
      }
    }

    async function loadReports() {
      const { data } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });

      setPastReports(data || []);
    }

    fetchUser();
    loadReports();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/Login");
  };

  // Language detection function
  const detectLanguage = (code) => {
    const patterns = {
      javascript: [/\bfunction\b/, /\bconst\b/, /\blet\b/, /\bvar\b/, /=>/, /console\.log/, /\bimport\b.*\bfrom\b/],
      python: [/\bdef\b/, /\bprint\(/, /\bimport\b/, /\bfrom\b.*\bimport\b/, /:\s*$/, /\bif\b.*:/, /\bfor\b.*:/, /\bwhile\b.*:/],
      java: [/\bpublic\s+class\b/, /\bprivate\b/, /\bprotected\b/, /\bstatic\b/, /\bvoid\b/, /System\.out\.println/, /\bextends\b/, /\bimplements\b/],
      cpp: [/#include/, /\bstd::/, /\bcout\b/, /\bcin\b/, /\bnamespace\b/, /\bclass\b.*{/, /\bpublic:/, /\bprivate:/],
      csharp: [/\busing\s+System/, /\bnamespace\b/, /\bpublic\s+class\b/, /\bprivate\b/, /\bprotected\b/, /Console\.WriteLine/],
      ruby: [/\bdef\b/, /\bend\b/, /\bputs\b/, /\brequire\b/, /@\w+/, /\bclass\b.*\bend\b/],
      go: [/\bfunc\b/, /\bpackage\b/, /\bimport\b/, /fmt\.Print/, /:=/, /\bgo\b/],
      rust: [/\bfn\b/, /\blet\b/, /\bmut\b/, /println!/, /\buse\b/, /\bimpl\b/],
      php: [/<\?php/, /\bfunction\b/, /\becho\b/, /\$\w+/, /->/, /\bclass\b/],
      swift: [/\bfunc\b/, /\bvar\b/, /\blet\b/, /\bimport\b/, /print\(/, /\bstruct\b/],
      kotlin: [/\bfun\b/, /\bval\b/, /\bvar\b/, /println\(/, /\bclass\b/],
      typescript: [/\binterface\b/, /\btype\b/, /:\s*(string|number|boolean)/, /\bfunction\b/, /\bconst\b/, /\blet\b/]
    };

    const scores = {};
    for (const [lang, langPatterns] of Object.entries(patterns)) {
      scores[lang] = langPatterns.filter(pattern => pattern.test(code)).length;
    }

    const detectedLang = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
    return scores[detectedLang] > 0 ? detectedLang : null;
  };

  const submitTask = async () => {
    if (!taskDescription || !code) {
      alert("⚠️ Please provide both task description and code.");
      return;
    }

    if (taskDescription.length < 10) {
      alert("⚠️ Task description is too short. Please provide more details.");
      return;
    }

    if (code.length < 20) {
      alert("⚠️ Code is too short. Please provide a complete code snippet.");
      return;
    }

    // Validate language match
    const detectedLang = detectLanguage(code);
    if (detectedLang && detectedLang !== language) {
      const proceed = confirm(
        `⚠️ Language Mismatch Detected!\n\n` +
        `Selected: ${language.toUpperCase()}\n` +
        `Detected: ${detectedLang.toUpperCase()}\n\n` +
        `The code appears to be written in ${detectedLang}, but you selected ${language}.\n\n` +
        `Do you want to continue anyway?`
      );
      
      if (!proceed) {
        return;
      }
    }

    setLoading(true);

    try {
      const response = await fetch("/api/groq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskDescription, code, language }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "AI Evaluation Failed");
      }

      if (!data.feedback) {
        throw new Error("Invalid response from AI service");
      }

      const { score, strengths, weaknesses, improvements } = data.feedback;

      // Validate feedback data
      if (typeof score !== 'number' || !strengths || !weaknesses || !improvements) {
        throw new Error("Incomplete evaluation data received");
      }

      const { error } = await supabase.from("tasks").insert([
        {
          user_id: user.id,
          description: taskDescription,
          code,
          language,
          score,
          strengths,
          weaknesses,
          improvements,
          is_paid: false,
        },
      ]);

      if (error) throw error;

      alert("✅ AI Evaluation Completed Successfully! 🎉");
      setTaskDescription("");
      setCode("");
      
      // Reload reports
      const { data: reports } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });
      setPastReports(reports || []);
      
    } catch (err) {
      console.error("Submission error:", err);
      alert("❌ Error: " + (err.message || "Something went wrong. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white flex flex-col items-center px-6 py-10">
      <header className="w-full flex justify-between max-w-5xl mb-6">
        <div className="absolute top-6 left-6 flex flex-col items-start gap-2">
          <h1 className="text-3xl font-bold tracking-tight">⚡ Smart Task Evaluator</h1>
          
        </div>
        <button
          onClick={handleLogout}
          className="absolute top-6 right-6 px-5 py-2 bg-red-500/90 hover:bg-red-600 rounded-lg font-medium transition-all shadow-lg hover:shadow-red-500/50"
        >
          Logout
        </button>
      </header>

      {user && (
        <p className="text-gray-300 mb-8 flex items-center gap-2 text-lg">
          Welcome: <b className="text-white">{username}</b>
          <span className="text-2xl animate-bounce">👋</span>
        </p>
      )}

      {/* Adjusted grid container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl w-full mt-18">

        {/* Submit Task */}
        <section className="relative bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700/50 backdrop-blur-sm">
          <img 
            src="/robot.png" 
            alt="Robot" 
            className="absolute -top-8 -left-8 w-20 h-20 animate-bounce drop-shadow-2xl"
          />
          <h2 className="text-2xl font-semibold mb-5 flex items-center gap-2">
            📝 <span>Submit a Task</span>
          </h2>

          <div className="mb-3">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm text-gray-400">Task Description</label>
              <span className={`text-xs ${taskDescription.length < 10 ? 'text-red-400' : 'text-gray-500'}`}>
                {taskDescription.length} / min 10 chars
              </span>
            </div>
            <textarea
              placeholder="Describe what your code does (e.g., 'Implement merge sort algorithm')..."
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              className="w-full p-4 rounded-lg bg-gray-800/80 border border-gray-600/50 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder-gray-500"
              rows="3"
            />
          </div>

          <div className="mb-3">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm text-gray-400">Programming Language</label>
              <span className="text-xs text-blue-400">Auto-validation enabled</span>
            </div>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-800/80 border border-gray-600/50 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-white"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="csharp">C#</option>
              <option value="typescript">TypeScript</option>
              <option value="go">Go</option>
              <option value="rust">Rust</option>
              <option value="php">PHP</option>
              <option value="ruby">Ruby</option>
              <option value="swift">Swift</option>
              <option value="kotlin">Kotlin</option>
            </select>
          </div>

          <div className="mb-5">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm text-gray-400">Your Code</label>
              <span className={`text-xs ${code.length < 20 ? 'text-red-400' : 'text-gray-500'}`}>
                {code.length} / min 20 chars
              </span>
            </div>
            <textarea
              placeholder="Paste your code here..."
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full p-4 rounded-lg bg-gray-800/80 border border-gray-600/50 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder-gray-500 font-mono text-sm"
              rows="7"
            />
          </div>

          <button
            onClick={submitTask}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-all shadow-lg hover:shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Evaluating with AI...
              </span>
            ) : (
              "Upload & Run AI Evaluation 🚀"
            )}
          </button>
        </section>

        {/* Past Reports */}
        <section className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700/50 backdrop-blur-sm">
          <h2 className="text-2xl font-semibold mb-5 flex items-center gap-2">
            📁 <span>Past Reports</span>
          </h2>

          {pastReports.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No tasks submitted yet.</p>
              <p className="text-gray-500 text-sm mt-2">Start by submitting your first task!</p>
            </div>
          ) : (
            <ul className="space-y-3 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
              {pastReports.map((report) => (
                <li key={report.id} className="p-4 bg-gray-800/60 rounded-lg flex justify-between items-center hover:bg-gray-800 transition-all border border-gray-700/30">
                  <span className="truncate w-2/3 text-gray-200">{report.description}</span>
                  <button
                    onClick={() => router.push(`/tasks/${report.id}`)}
                    className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-medium transition-all shadow-md hover:shadow-green-500/50"
                  >
                    View Report
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}