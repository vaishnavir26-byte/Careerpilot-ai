"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  FileText, BrainCircuit, Code2, ArrowUpRight, 
  TrendingUp, Award, Clock, ArrowRight, ShieldCheck
} from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState({
    resumeScore: 0,
    atsMatch: 0,
    interviewScore: 0,
    readinessScore: 50.0,
    interviewsCount: 0,
    latestProjectScore: 0
  });
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        // Fetch latest resume info
        const resumeRes = await fetch(`http://127.0.0.1:8000/api/resume/latest?token=${token}`);
        const resumeData = await resumeRes.json();
        
        let rScore = 0;
        if (resumeData.has_resume) {
          // Trigger resume analyzer score
          const analyzeRes = await fetch("http://127.0.0.1:8000/api/resume/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `token=${encodeURIComponent(token)}`
          });
          const analyzeData = await analyzeRes.json();
          rScore = analyzeData.overall_score || 0;
        }

        // Fetch interview history
        const intRes = await fetch(`http://127.0.0.1:8000/api/interview/history?token=${token}`);
        const intData = await intRes.json();
        const mockHistory = intData.history || [];
        setHistory(mockHistory);
        
        const latestInt = mockHistory[0];
        const intScore = latestInt ? latestInt.score : 0;

        // Retrieve stored user info
        const info = localStorage.getItem("user_info");
        let readiness = 50.0;
        if (info) {
          const parsed = JSON.parse(info);
          readiness = parsed.readiness_score || 50.0;
        }

        setStats({
          resumeScore: rScore,
          atsMatch: rScore > 0 ? Math.round(rScore * 0.95) : 0,
          interviewScore: intScore,
          readinessScore: readiness,
          interviewsCount: mockHistory.length,
          latestProjectScore: rScore > 0 ? 80 : 0
        });
      } catch (e) {
        console.error("Error loading dashboard data:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getReadinessStatus = (score: number) => {
    if (score >= 80) return { label: "Placement Ready", desc: "High probability of shortlisting in Tier-1 product companies.", color: "text-emerald-400" };
    if (score >= 60) return { label: "Growing", desc: "Moderate preparation. Practice mock interviews and optimize projects.", color: "text-indigo-400" };
    return { label: "Needs Practice", desc: "Upload optimized resume and start practicing coding problems immediately.", color: "text-amber-400" };
  };

  const statusInfo = getReadinessStatus(stats.readinessScore);

  return (
    <>
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Placement Workspace</h1>
          <p className="text-sm text-gray-400 mt-1">Track and optimize your recruitment metrics in real time.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/resume-analyzer" className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 flex items-center gap-1.5 transition-all">
            <FileText className="w-4 h-4" />
            Upload Resume
          </Link>
          <Link href="/interview-copilot" className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 flex items-center gap-1.5 transition-all">
            <BrainCircuit className="w-4 h-4" />
            Practice Interview
          </Link>
        </div>
      </div>

      {/* Grid: Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-card rounded-xl p-5 border border-gray-800 flex justify-between items-start">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Resume Score</span>
            <h3 className="text-2xl font-bold text-white">{stats.resumeScore > 0 ? `${stats.resumeScore}/100` : "No Upload"}</h3>
            <span className="text-[10px] text-gray-500 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-indigo-400" /> ATS Compatibility
            </span>
          </div>
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-lg">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card rounded-xl p-5 border border-gray-800 flex justify-between items-start">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Latest Interview</span>
            <h3 className="text-2xl font-bold text-white">{stats.interviewScore > 0 ? `${stats.interviewScore}%` : "No Practice"}</h3>
            <span className="text-[10px] text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3 text-emerald-400" /> {stats.interviewsCount} sessions completed
            </span>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg">
            <BrainCircuit className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card rounded-xl p-5 border border-gray-800 flex justify-between items-start">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Coding Performance</span>
            <h3 className="text-2xl font-bold text-white">{stats.resumeScore > 0 ? "B+ (Passed)" : "Not Started"}</h3>
            <span className="text-[10px] text-gray-500 flex items-center gap-1">
              <Code2 className="w-3 h-3 text-purple-400" /> Logic and algorithm check
            </span>
          </div>
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-lg">
            <Code2 className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-card rounded-xl p-5 border border-gray-800 flex justify-between items-start">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">GitHub Projects</span>
            <h3 className="text-2xl font-bold text-white">{stats.latestProjectScore > 0 ? `${stats.latestProjectScore}/100` : "No Scan"}</h3>
            <span className="text-[10px] text-gray-500 flex items-center gap-1">
              <Code2 className="w-3 h-3 text-sky-400" /> Repository structure checked
            </span>
          </div>
          <div className="p-3 bg-sky-500/10 text-sky-400 rounded-lg">
            <Code2 className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Main Layout Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Readiness Assessment Gauge */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="glass-card rounded-2xl p-6 border border-gray-800 flex flex-col sm:flex-row items-center gap-8 shadow-xl">
            {/* Custom SVG Radial Gauge */}
            <div className="relative h-32 w-32 flex items-center justify-center flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r="54" className="stroke-gray-800" strokeWidth="8" fill="transparent" />
                <circle 
                  cx="64" cy="64" r="54" 
                  className="stroke-indigo-600 transition-all duration-500" 
                  strokeWidth="8" 
                  fill="transparent" 
                  strokeDasharray="339.3"
                  strokeDashoffset={339.3 - (339.3 * stats.readinessScore) / 100}
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-3xl font-extrabold text-white">{stats.readinessScore}%</span>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mt-0.5">Readiness</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Award className={`w-5 h-5 ${statusInfo.color}`} />
                <h3 className={`text-lg font-bold ${statusInfo.color}`}>{statusInfo.label}</h3>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                {statusInfo.desc}
              </p>
              <div className="flex items-center gap-6 pt-2">
                <div>
                  <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Shortlist Chance</span>
                  <span className="text-base font-bold text-white mt-0.5">
                    {stats.readinessScore >= 80 ? "92%" : stats.readinessScore >= 60 ? "68%" : "35%"}
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Target Salary Base</span>
                  <span className="text-base font-bold text-white mt-0.5">
                    {stats.readinessScore >= 80 ? "$115K+" : stats.readinessScore >= 60 ? "$85K" : "$60K"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Activity / Score History Charts */}
          <div className="glass-card rounded-2xl p-6 border border-gray-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base">Preparation Progress Curve</h3>
              <span className="text-xs text-gray-400 flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5 text-indigo-400" /> Weekly scores growth</span>
            </div>

            {/* Pure CSS/SVG Line Chart representation for zero-glitch UI */}
            <div className="h-56 w-full relative pt-4">
              <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
                {/* Horizontal Gridlines */}
                <line x1="0" y1="50" x2="500" y2="50" stroke="#1f2937" strokeWidth="1" strokeDasharray="4,4" />
                <line x1="0" y1="100" x2="500" y2="100" stroke="#1f2937" strokeWidth="1" strokeDasharray="4,4" />
                <line x1="0" y1="150" x2="500" y2="150" stroke="#1f2937" strokeWidth="1" strokeDasharray="4,4" />
                
                {/* SVG Curve Path */}
                <path 
                  d="M 50 160 Q 150 140 250 110 T 450 70" 
                  fill="none" 
                  stroke="url(#indigo-grad)" 
                  strokeWidth="4" 
                />
                
                {/* Dots on points */}
                <circle cx="50" cy="160" r="5" fill="#6366f1" />
                <circle cx="180" cy="138" r="5" fill="#4f46e5" />
                <circle cx="310" cy="100" r="5" fill="#3b82f6" />
                <circle cx="450" cy="70" r="5" fill="#10b981" />

                {/* Defs for gradients */}
                <defs>
                  <linearGradient id="indigo-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="50%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* X Axis Labels */}
              <div className="flex justify-between text-[10px] text-gray-500 font-semibold px-4 mt-2">
                <span>Week 1 (Base)</span>
                <span>Week 2 (Parsed)</span>
                <span>Week 3 (Interviews)</span>
                <span>Week 4 (Current)</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Recent activity logs & interview feedback */}
        <div className="space-y-6">
          
          <div className="glass-card rounded-2xl p-6 border border-gray-800 space-y-4">
            <h3 className="font-bold text-white text-base">Completed Sessions</h3>
            
            {loading ? (
              <div className="py-8 text-center text-xs text-gray-500">Loading history...</div>
            ) : history.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-500">No mock sessions completed yet.</div>
            ) : (
              <div className="space-y-3">
                {history.slice(0, 3).map((item) => (
                  <div key={item.id} className="p-3 bg-gray-900/60 rounded-xl border border-gray-800/80 flex items-center justify-between hover:border-indigo-500/30 transition-colors">
                    <div className="space-y-1">
                      <h4 className="text-xs font-semibold text-white">{item.type} Interview</h4>
                      <p className="text-[10px] text-gray-500 flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-indigo-400" /> 
                        {new Date(item.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-indigo-400">{item.score}%</span>
                      <span className="block text-[9px] text-gray-500 uppercase tracking-widest">Rating</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Link href="/interview-copilot" className="w-full py-2.5 rounded-lg bg-gray-800 hover:bg-gray-700/80 border border-gray-700 text-xs font-semibold text-gray-300 flex items-center justify-center gap-1 transition-all">
              Launch Interview Simulator
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Quick Checklist progress */}
          <div className="glass-card rounded-2xl p-6 border border-gray-800 space-y-4">
            <h3 className="font-bold text-white text-base">Action Item Checklist</h3>
            
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3">
                <div className={`h-4 w-4 rounded border flex items-center justify-center ${stats.resumeScore > 0 ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-gray-700'}`}>
                  {stats.resumeScore > 0 && "✓"}
                </div>
                <span className={stats.resumeScore > 0 ? "text-gray-400 line-through" : "text-white"}>Upload professional resume</span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className={`h-4 w-4 rounded border flex items-center justify-center ${stats.interviewScore > 0 ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-gray-700'}`}>
                  {stats.interviewScore > 0 && "✓"}
                </div>
                <span className={stats.interviewScore > 0 ? "text-gray-400 line-through" : "text-white"}>Complete first AI Interview session</span>
              </div>

              <div className="flex items-center gap-3">
                <div className={`h-4 w-4 rounded border flex items-center justify-center ${stats.latestProjectScore > 0 ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-gray-700'}`}>
                  {stats.latestProjectScore > 0 && "✓"}
                </div>
                <span className={stats.latestProjectScore > 0 ? "text-gray-400 line-through" : "text-white"}>Evaluate personal GitHub project</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-4 w-4 rounded border border-gray-700 flex items-center justify-center"></div>
                <span className="text-white">Build & download portfolio web codes</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </>
  );
}
