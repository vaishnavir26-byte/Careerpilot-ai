"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BrainCircuit, Star, ArrowRight, Shield, Terminal, Zap } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // If token exists, direct to dashboard
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/dashboard");
    }
  }, [router]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";
    const body = isRegister 
      ? { email, password, full_name: fullName } 
      : { email, password };

    try {
      const res = await fetch(`http://127.0.0.1:8000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Authentication failed");

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user_info", JSON.stringify({
        id: data.user_id,
        email: data.email,
        full_name: data.full_name,
        readiness_score: data.readiness_score
      }));
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestMode = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://127.0.0.1:8000/api/auth/guest", {
        method: "POST"
      });
      const data = await res.json();
      if (!res.ok) throw new Error("Could not initialize guest session");

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user_info", JSON.stringify({
        id: data.user_id,
        email: data.email,
        full_name: data.full_name,
        readiness_score: data.readiness_score
      }));
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#030712] relative flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/10 blur-[120px]" />

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        
        {/* Left Side: Product Showcase */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-xs font-semibold text-indigo-400">
            <BrainCircuit className="h-4 w-4" />
            Next-Gen Placement Preparation Platform
          </div>

          <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-none">
            Master Your Career Path with{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
              CareerPilot AI
            </span>
          </h1>

          <p className="text-gray-400 text-lg max-w-xl">
            Optimize your resume for ATS algorithms, practice mock interviews with real-time browser voice synthesis, evaluate GitHub repositories, and build structured 30/60/90-day learning roadmaps.
          </p>

          {/* Core Feature bullet grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <div className="flex items-start gap-3">
              <div className="p-1 rounded bg-indigo-500/20 text-indigo-400 mt-1">
                <Zap className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm">ATS Scorer & Optimizer</h4>
                <p className="text-xs text-gray-400">Scan resumes against job postings and auto-improve bullets.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-1 rounded bg-emerald-500/20 text-emerald-400 mt-1">
                <Star className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm">Voice Mock Interviews</h4>
                <p className="text-xs text-gray-400">Conduct interactive webcam sessions with audio transcript evaluations.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-1 rounded bg-purple-500/20 text-purple-400 mt-1">
                <Terminal className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm">Coding & Projects Scanner</h4>
                <p className="text-xs text-gray-400">Solve DSA tasks and scan GitHub repository documentation structures.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-1 rounded bg-sky-500/20 text-sky-400 mt-1">
                <Shield className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm">Portfolio Generator</h4>
                <p className="text-xs text-gray-400">Build single-page web portfolios and export source codes instantly.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Card */}
        <div className="lg:col-span-5">
          <div className="glass-card rounded-2xl p-8 border border-gray-800 shadow-2xl relative">
            <h2 className="text-2xl font-bold text-white mb-2">
              {isRegister ? "Create Account" : "Welcome Back"}
            </h2>
            <p className="text-sm text-gray-400 mb-6">
              {isRegister ? "Join CareerPilot AI today to start prepping" : "Sign in to access your placement dashboard"}
            </p>

            {error && (
              <div className="p-3 mb-4 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-4">
              {isRegister && (
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm py-3 rounded-lg shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? "Authenticating..." : isRegister ? "Sign Up" : "Sign In"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <div className="relative flex py-4 items-center">
              <div className="flex-grow border-t border-gray-800"></div>
              <span className="flex-shrink mx-4 text-gray-500 text-xs uppercase tracking-wider">or</span>
              <div className="flex-grow border-t border-gray-800"></div>
            </div>

            {/* Guest Session Button */}
            <button
              onClick={handleGuestMode}
              disabled={loading}
              className="w-full bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 font-semibold text-sm py-3 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              Enter Guest Mode (Quick Access)
              <ArrowRight className="h-4 w-4" />
            </button>

            <p className="text-center text-xs text-gray-500 mt-6">
              {isRegister ? "Already have an account?" : "Don't have an account yet?"}{" "}
              <button 
                onClick={() => setIsRegister(!isRegister)} 
                className="text-indigo-400 hover:underline font-semibold"
              >
                {isRegister ? "Sign In" : "Sign Up"}
              </button>
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}
