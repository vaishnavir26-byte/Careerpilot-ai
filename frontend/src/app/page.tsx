"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BrainCircuit, Star, Zap, AlertCircle, RotateCw } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const initializeGuestSession = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://127.0.0.1:8000/api/auth/guest", {
        method: "POST"
      });
      if (!res.ok) {
        throw new Error("Could not initialize guest session");
      }
      const data = await res.json();

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user_info", JSON.stringify({
        id: data.user_id,
        email: data.email,
        full_name: data.full_name,
        readiness_score: data.readiness_score
      }));
      router.push("/dashboard");
    } catch (err: any) {
      setError("Unable to connect to the backend API server. Please ensure the FastAPI backend is running on http://127.0.0.1:8000.");
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/dashboard");
    } else {
      initializeGuestSession();
    }
  }, [router]);

  return (
    <main className="min-h-screen bg-[#030712] relative flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/10 blur-[120px]" />

      <div className="max-w-4xl w-full flex flex-col items-center text-center relative z-10 space-y-8">
        
        {/* Logo and Header */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-xs font-semibold text-indigo-400">
            <BrainCircuit className="h-4 w-4" />
            Next-Gen Placement Preparation Platform
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-none text-white">
            CareerPilot{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
              AI
            </span>
          </h1>
        </div>

        {/* Dynamic Card Container */}
        <div className="w-full max-w-md">
          {loading ? (
            <div className="glass-card rounded-2xl p-8 border border-gray-800 shadow-2xl flex flex-col items-center justify-center space-y-6">
              <div className="relative flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-500 border-r-2 border-indigo-500/30" />
                <BrainCircuit className="absolute h-5 w-5 text-indigo-400 animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white">Initializing Workspace</h3>
                <p className="text-sm text-gray-400">Setting up secure guest session & preparing dashboard...</p>
              </div>
            </div>
          ) : error ? (
            <div className="glass-card rounded-2xl p-8 border border-red-950/30 bg-red-950/10 shadow-2xl space-y-6 text-left">
              <div className="flex items-center gap-3 text-red-400 border-b border-red-950/20 pb-4">
                <AlertCircle className="h-6 w-6 shrink-0" />
                <h3 className="text-lg font-bold">Backend Connection Failed</h3>
              </div>
              
              <p className="text-sm text-gray-400 leading-relaxed">
                We couldn&apos;t connect to the backend server. To launch the application, please make sure the FastAPI backend is running locally.
              </p>

              <div className="space-y-3">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block">Startup Commands:</span>
                <div className="bg-gray-950 border border-gray-900 rounded-lg p-4 font-mono text-xs text-gray-300 space-y-2 relative group select-all">
                  <div className="text-indigo-400"># Navigate to the backend folder & run</div>
                  <div>cd backend</div>
                  <div>python main.py</div>
                </div>
              </div>

              <button
                onClick={initializeGuestSession}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm py-3 rounded-lg shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCw className="h-4 w-4" />
                Retry Connection
              </button>
            </div>
          ) : null}
        </div>

        {/* Feature Highlights Grid */}
        {!error && !loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl pt-6">
            <div className="flex items-start gap-3 text-left p-3 rounded-lg bg-gray-900/40 border border-gray-800/40">
              <div className="p-1.5 rounded bg-indigo-500/20 text-indigo-400 mt-0.5">
                <Zap className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm">ATS Scorer & Optimizer</h4>
                <p className="text-xs text-gray-400">Scan resumes against job descriptions and auto-optimize bullet points.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-left p-3 rounded-lg bg-gray-900/40 border border-gray-800/40">
              <div className="p-1.5 rounded bg-emerald-500/20 text-emerald-400 mt-0.5">
                <Star className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm">Voice Mock Interviews</h4>
                <p className="text-xs text-gray-400">Conduct interactive sessions with real-time speech synthesis and analysis.</p>
              </div>
            </div>
          </div>
        )}
        
      </div>
    </main>
  );
}
