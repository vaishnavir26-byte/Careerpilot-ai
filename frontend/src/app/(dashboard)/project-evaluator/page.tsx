"use client";

import { useState } from "react";
import { 
  ArrowRight, ShieldCheck, Star, 
  Settings, Terminal, HelpCircle
} from "lucide-react";

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

export default function ProjectEvaluator() {
  const [githubUrl, setGithubUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubUrl.trim()) return;

    setLoading(true);
    setResult(null);
    const token = localStorage.getItem("token") || "";

    try {
      const res = await fetch("http://127.0.0.1:8000/api/projects/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `token=${encodeURIComponent(token)}&github_url=${encodeURIComponent(githubUrl)}`
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Evaluation failed");

      setResult(data);

      // Update user readiness score in localStorage
      const userStr = localStorage.getItem("user_info");
      if (userStr) {
        const u = JSON.parse(userStr);
        u.readiness_score = data.readiness_score;
        localStorage.setItem("user_info", JSON.stringify(u));
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">GitHub Project Evaluator</h1>
        <p className="text-sm text-gray-400 mt-1">Audit your GitHub repositories for code quality, configuration security, and resume worthiness.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Column: Repo link form */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card rounded-2xl p-6 border border-gray-800 space-y-4">
            <h3 className="font-bold text-white text-base">Enter Repository URL</h3>
            
            <form onSubmit={handleEvaluate} className="space-y-4">
              <div>
                <label className="block text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-2">Public GitHub URL</label>
                <div className="relative">
                  <input
                    type="url"
                    required
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/username/repository"
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-650 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                  <GithubIcon className="w-4 h-4 text-gray-500 absolute left-3 top-3.5" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !githubUrl.trim()}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm py-2.5 rounded-lg shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? "Scanning project structure..." : "Evaluate GitHub Project"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Scan results */}
        <div className="lg:col-span-7">
          {result ? (
            <div className="glass-card rounded-2xl p-6 border border-gray-800 space-y-6 h-full flex flex-col justify-between">
              
              <div className="space-y-6">
                
                <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-white text-lg">{result.repo_name}</h3>
                    <p className="text-[10px] text-gray-500">Repository Owner: <span className="text-gray-300 font-mono">@{result.owner}</span></p>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-black text-indigo-400">{result.score}/100</span>
                    <span className="block text-[9px] text-gray-500 uppercase tracking-widest font-semibold mt-0.5">Repo Score</span>
                  </div>
                </div>

                {/* Grid details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-900/60 rounded-xl border border-gray-800">
                    <span className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider">Project Category</span>
                    <h4 className="text-xs font-bold text-white mt-1 leading-relaxed">{result.category}</h4>
                  </div>
                  <div className="p-3 bg-gray-900/60 rounded-xl border border-gray-800">
                    <span className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider">Resume Worthiness</span>
                    <h4 className="text-xs font-bold text-indigo-400 mt-1 leading-relaxed">{result.resume_worthiness}</h4>
                  </div>
                </div>

                {/* Technologies detected */}
                <div className="space-y-2">
                  <span className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider">Identified Tech Stack</span>
                  <div className="flex flex-wrap gap-1.5">
                    {result.technologies_used.map((tech: string, idx: number) => (
                      <span key={idx} className="px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-md text-[10px] font-semibold text-indigo-400">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Code structure suggestions */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Improvement Strategy Actions</h4>
                  {result.suggestions.map((sug: string, idx: number) => (
                    <div key={idx} className="p-3 bg-gray-900/60 border border-gray-850 rounded-xl text-xs text-gray-400 leading-relaxed">
                      {sug}
                    </div>
                  ))}
                </div>

              </div>

              <div className="p-3.5 bg-indigo-500/5 border border-indigo-500/10 rounded-xl text-[10px] text-indigo-300 flex items-start gap-2 leading-relaxed mt-4">
                <ShieldCheck className="w-4 h-4 flex-shrink-0 text-indigo-400" />
                <span>Verification scan successful. Adding clean readme setups and automated unit test actions significantly increases scoring weightings for recruiter audits.</span>
              </div>

            </div>
          ) : (
            <div className="py-20 text-center text-xs text-gray-500 border border-dashed border-gray-800 rounded-2xl h-full flex flex-col justify-center gap-2">
              <HelpCircle className="w-8 h-8 text-gray-700 mx-auto" />
              <p>Enter a public repository URL and scan to analyze folder structuring and setups.</p>
            </div>
          )}
        </div>

      </div>
    </>
  );
}
