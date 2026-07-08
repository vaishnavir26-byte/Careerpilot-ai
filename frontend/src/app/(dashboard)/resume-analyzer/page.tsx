"use client";

import { useEffect, useState } from "react";
import { 
  FileText, Upload, Sparkles, CheckCircle2, AlertCircle, 
  ArrowRight, Copy, Check, RotateCcw
} from "lucide-react";

export default function ResumeAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [parsedResume, setParsedResume] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  
  // Optimizer state
  const [optimizeSection, setOptimizeSection] = useState("summary");
  const [optimizing, setOptimizing] = useState(false);
  const [optimizedText, setOptimizedText] = useState("");
  const [originalText, setOriginalText] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Load latest uploaded resume if any
    const loadLatest = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/resume/latest?token=${token}`);
        const data = await res.json();
        if (data.has_resume) {
          setParsedResume(data.parsed_info);
          // Run analysis
          const analyzeRes = await fetch("http://127.0.0.1:8000/api/resume/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `token=${encodeURIComponent(token)}`
          });
          const analyzeData = await analyzeRes.json();
          setAnalysis(analyzeData);
        }
      } catch (e) {
        console.error("Error loading latest resume:", e);
      }
    };
    loadLatest();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    const token = localStorage.getItem("token") || "";

    const formData = new FormData();
    formData.append("file", file);
    formData.append("token", token);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/resume/upload", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Upload failed");

      setParsedResume(data.parsed_info);
      
      // Update global user info score in localStorage
      const userStr = localStorage.getItem("user_info");
      if (userStr) {
        const user = JSON.parse(userStr);
        user.readiness_score = data.readiness_score;
        localStorage.setItem("user_info", JSON.stringify(user));
      }

      // Analyze
      const analyzeRes = await fetch("http://127.0.0.1:8000/api/resume/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `token=${encodeURIComponent(token)}`
      });
      const analyzeData = await analyzeRes.json();
      setAnalysis(analyzeData);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleOptimize = async () => {
    setOptimizing(true);
    setOptimizedText("");
    const token = localStorage.getItem("token") || "";

    try {
      const res = await fetch("http://127.0.0.1:8000/api/resume/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `token=${encodeURIComponent(token)}&section=${encodeURIComponent(optimizeSection)}`
      });
      const data = await res.json();
      if (!res.ok) throw new Error("Could not optimize text");

      setOriginalText(data.original_text);
      setOptimizedText(data.optimized_text);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setOptimizing(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(optimizedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Resume Optimizer & Analyzer</h1>
        <p className="text-sm text-gray-400 mt-1">Audit your resume for structure, ATS indexing keywords, and bullet points.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Panel: Upload & Metrics Analysis */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="glass-card rounded-2xl p-6 border border-gray-800 space-y-4">
            <h3 className="font-bold text-white text-base">Resume Upload (.pdf, .docx)</h3>
            
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="border-2 border-dashed border-gray-800 hover:border-indigo-500/50 rounded-xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors relative">
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Upload className="w-10 h-10 text-gray-500" />
                <p className="text-sm text-gray-300 font-semibold mt-2">
                  {file ? file.name : "Drag & drop files or click to upload"}
                </p>
                <span className="text-[10px] text-gray-500">Supports PDF and Word formats up to 5MB</span>
              </div>

              {file && (
                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm py-2.5 rounded-lg shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {uploading ? "Analyzing & Extracting..." : "Scan & Analyze Resume"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </form>
          </div>

          {analysis && (
            <div className="glass-card rounded-2xl p-6 border border-gray-800 space-y-6">
              <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                <div>
                  <h3 className="font-extrabold text-white text-lg">Resume Scan Report</h3>
                  <span className="text-[10px] text-gray-500">ATS formatting audit checked</span>
                </div>
                <div className="text-right">
                  <span className={`text-3xl font-black ${analysis.ats_compatible ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {analysis.overall_score}%
                  </span>
                  <span className="block text-[9px] text-gray-500 uppercase tracking-widest font-semibold mt-0.5">Overall Score</span>
                </div>
              </div>

              {/* Breakdown details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-900/60 rounded-xl border border-gray-800">
                  <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Technical Skills</span>
                  <h4 className="text-base font-bold text-white mt-1">{analysis.breakdown.technical_skills}/100</h4>
                </div>
                <div className="p-3 bg-gray-900/60 rounded-xl border border-gray-800">
                  <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Formatting Layout</span>
                  <h4 className="text-base font-bold text-white mt-1">{analysis.breakdown.resume_formatting}/100</h4>
                </div>
                <div className="p-3 bg-gray-900/60 rounded-xl border border-gray-800">
                  <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Experience Bullets</span>
                  <h4 className="text-base font-bold text-white mt-1">{analysis.breakdown.work_experience}/100</h4>
                </div>
                <div className="p-3 bg-gray-900/60 rounded-xl border border-gray-800">
                  <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Project Depth</span>
                  <h4 className="text-base font-bold text-white mt-1">{analysis.breakdown.project_quality}/100</h4>
                </div>
              </div>

              {/* Suggestions Alerts */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Optimization Suggestions</h4>
                {analysis.suggestions.map((sug: string, idx: number) => (
                  <div key={idx} className="p-3.5 bg-amber-500/5 border border-amber-500/20 text-xs text-amber-300 rounded-xl flex items-start gap-3 leading-relaxed">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{sug}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Panel: AI Resume Optimizer */}
        <div className="lg:col-span-5">
          <div className="glass-card rounded-2xl p-6 border border-gray-800 space-y-6 h-full flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-white text-base">ATS Bullet Optimizer</h3>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Select a resume section, and CareerPilot AI will re-write draft sentences into high-impact, keyword-rich statements using action verbs and quantified achievements.
              </p>

              {/* Tab selector */}
              <div className="grid grid-cols-3 gap-2 p-1 bg-gray-950 rounded-lg">
                {["summary", "projects", "experience"].map((sec) => (
                  <button
                    key={sec}
                    onClick={() => setOptimizeSection(sec)}
                    className={`py-1.5 text-xs font-semibold rounded-md capitalize cursor-pointer transition-colors ${
                      optimizeSection === sec 
                        ? "bg-indigo-600 text-white shadow" 
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    {sec}
                  </button>
                ))}
              </div>

              <button
                onClick={handleOptimize}
                disabled={optimizing}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs py-2 rounded-lg shadow transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                {optimizing ? "Generating suggestions..." : `Optimize ${optimizeSection}`}
              </button>
            </div>

            {optimizedText && (
              <div className="space-y-4 pt-6 border-t border-gray-800 flex-grow flex flex-col justify-between">
                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Before</span>
                    <p className="text-xs text-gray-400 italic p-3 bg-gray-900/40 border border-gray-800/80 rounded-lg mt-1 leading-relaxed">
                      "{originalText}"
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> Optimized (Ready to Copy)
                    </span>
                    <div className="relative mt-1 group">
                      <div className="text-xs text-white p-3.5 bg-indigo-950/20 border border-indigo-500/20 rounded-lg leading-relaxed whitespace-pre-line">
                        {optimizedText}
                      </div>
                      <button
                        onClick={handleCopy}
                        className="absolute top-2 right-2 p-1.5 bg-gray-900 border border-gray-800 rounded-md text-gray-400 hover:text-white hover:border-gray-700 transition-all cursor-pointer opacity-80 group-hover:opacity-100"
                        title="Copy to clipboard"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl text-[10px] text-indigo-300 flex items-start gap-2 leading-relaxed">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-indigo-400" />
                  <span>This optimized text utilizes active verbs ("Spearheaded", "Engineered") and includes placeholder frameworks to maximize keyword match percentages.</span>
                </div>
              </div>
            )}

            {!optimizedText && !optimizing && (
              <div className="py-20 text-center text-xs text-gray-500 border border-dashed border-gray-800 rounded-2xl flex-grow flex items-center justify-center">
                Select a section above to preview optimization bullet points.
              </div>
            )}
          </div>
        </div>

      </div>
    </>
  );
}
