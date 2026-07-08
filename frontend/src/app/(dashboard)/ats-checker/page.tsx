"use client";

import { useEffect, useState } from "react";
import { 
  CheckSquare, FileText, CheckCircle2, AlertTriangle, 
  Sparkles, HelpCircle, ArrowRight
} from "lucide-react";

export default function ATSChecker() {
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [hasResume, setHasResume] = useState(false);

  useEffect(() => {
    // Check if user has uploaded a resume
    const checkResume = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/resume/latest?token=${token}`);
        const data = await res.json();
        setHasResume(data.has_resume);
      } catch (e) {
        console.error("Error checking resume:", e);
      }
    };
    checkResume();
  }, []);

  const handleATSCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobDescription.trim()) return;

    setLoading(true);
    const token = localStorage.getItem("token") || "";

    try {
      const res = await fetch("http://127.0.0.1:8000/api/ats-check", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `token=${encodeURIComponent(token)}&job_description=${encodeURIComponent(jobDescription)}`
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "ATS check failed");

      setResult(data);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">ATS Alignment Checker</h1>
        <p className="text-sm text-gray-400 mt-1">Audit your resume keywords alignment against a target job posting description.</p>
      </div>

      {!hasResume && (
        <div className="glass-card rounded-2xl p-8 border border-gray-800 text-center space-y-4">
          <FileText className="w-12 h-12 text-indigo-400 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Resume Uploaded Yet</h3>
          <p className="text-sm text-gray-400 max-w-sm mx-auto">
            You need to upload your resume first before we can compare it to a job description.
          </p>
          <a href="/resume-analyzer" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors">
            Go to Upload Panel
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {hasResume && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Job Description Input */}
          <div className="lg:col-span-6 space-y-6">
            <div className="glass-card rounded-2xl p-6 border border-gray-800 space-y-4">
              <h3 className="font-bold text-white text-base">Paste Target Job Description</h3>
              
              <form onSubmit={handleATSCheck} className="space-y-4">
                <div>
                  <textarea
                    required
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the target job description text here (including roles, responsibilities, required technical skills)..."
                    rows={12}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl p-4 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors resize-none leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !jobDescription.trim()}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm py-2.5 rounded-lg shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? "Matching Keywords..." : "Run Keywords Alignment Audit"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: ATS Match Output Results */}
          <div className="lg:col-span-6">
            {result ? (
              <div className="glass-card rounded-2xl p-6 border border-gray-800 space-y-6 h-full flex flex-col justify-between">
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                    <div>
                      <h3 className="font-extrabold text-white text-lg">ATS Alignment Report</h3>
                      <span className="text-[10px] text-gray-500">Keywords frequency match score</span>
                    </div>
                    <div className="text-right">
                      <span className={`text-3xl font-black ${result.match_percentage >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {result.match_percentage}%
                      </span>
                      <span className="block text-[9px] text-gray-500 uppercase tracking-widest font-semibold mt-0.5">Keywords Match</span>
                    </div>
                  </div>

                  {/* Matching vs Missing Keywords */}
                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wide flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Matching Keywords ({result.matching_keywords.length})
                      </span>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {result.matching_keywords.length === 0 ? (
                          <span className="text-xs text-gray-500 italic">None matched yet.</span>
                        ) : (
                          result.matching_keywords.map((kw: string, idx: number) => (
                            <span key={idx} className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-md text-[10px] font-bold text-emerald-400 uppercase">
                              {kw}
                            </span>
                          ))
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wide flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Missing Keywords ({result.missing_keywords.length})
                      </span>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {result.missing_keywords.length === 0 ? (
                          <span className="text-xs text-gray-500 italic">No major technical keywords missing!</span>
                        ) : (
                          result.missing_keywords.map((kw: string, idx: number) => (
                            <span key={idx} className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-md text-[10px] font-bold text-amber-400 uppercase">
                              {kw}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Suggestions checklist */}
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Alignment Strategy Checklist</h4>
                    {result.suggestions.map((sug: string, idx: number) => (
                      <div key={idx} className="p-3.5 bg-indigo-500/5 border border-indigo-500/10 text-xs text-indigo-300 rounded-xl leading-relaxed">
                        {sug}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl text-[10px] text-indigo-300 flex items-start gap-2 leading-relaxed mt-4">
                  <Sparkles className="w-4 h-4 flex-shrink-0 text-indigo-400" />
                  <span>Tip: Standard parser checks headers like "Skills", "Education", and "Experience". Avoid adding icons or charts to ensure ATS parsers process all words correctly.</span>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center text-xs text-gray-500 border border-dashed border-gray-800 rounded-2xl h-full flex flex-col justify-center gap-2">
                <HelpCircle className="w-8 h-8 text-gray-700 mx-auto" />
                <p>Paste a job description and run the check to inspect keywords match percentages.</p>
              </div>
            )}
          </div>

        </div>
      )}
    </>
  );
}
