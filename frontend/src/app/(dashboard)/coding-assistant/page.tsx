"use client";

import { useEffect, useState } from "react";
import { 
  Code2, Play, Terminal, HelpCircle, BookOpen, 
  CheckCircle2, XCircle, AlertCircle, Award
} from "lucide-react";

export default function CodingAssistant() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [activeQuestion, setActiveQuestion] = useState<any>(null);
  
  const [userCode, setUserCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  // Hint controls
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/coding/questions");
        const data = await res.json();
        setQuestions(data.questions || []);
        if (data.questions && data.questions.length > 0) {
          setActiveQuestion(data.questions[0]);
          setUserCode(data.questions[0].starter_code);
        }
      } catch (e) {
        console.error("Error fetching coding questions:", e);
      }
    };
    fetchQuestions();
  }, []);

  // Update starter code when question changes
  const handleSelectQuestion = (q: any) => {
    setActiveQuestion(q);
    setUserCode(q.starter_code);
    setResult(null);
    setShowHint(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeQuestion) return;

    setLoading(true);
    setResult(null);
    const token = localStorage.getItem("token") || "";

    try {
      const res = await fetch("http://127.0.0.1:8000/api/coding/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          question_id: activeQuestion.id,
          code: userCode,
          language: language
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Submission failed");

      setResult(data);

      // Update readiness score in local storage
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Coding Practice Assistant</h1>
          <p className="text-sm text-gray-400 mt-1">Practice DSA algorithms and SQL query challenges with instant feedback checks.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Panel: Questions Navigator + active question description */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Question List Navigator */}
          <div className="glass-card rounded-2xl p-5 border border-gray-800 space-y-3">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider">Select Challenge</h3>
            <div className="space-y-1.5">
              {questions.map((q) => (
                <button
                  key={q.id}
                  onClick={() => handleSelectQuestion(q)}
                  className={`w-full text-left p-2.5 rounded-lg text-xs font-semibold border flex items-center justify-between transition-all cursor-pointer ${
                    activeQuestion?.id === q.id
                      ? "bg-indigo-600/10 border-indigo-500 text-indigo-400"
                      : "border-gray-850 text-gray-400 hover:text-white"
                  }`}
                >
                  <span>{q.title}</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                    q.difficulty === "Easy" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                  }`}>
                    {q.difficulty}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {activeQuestion && (
            <div className="glass-card rounded-2xl p-5 border border-gray-800 space-y-4">
              <div className="flex justify-between items-start">
                <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">{activeQuestion.category}</span>
              </div>
              <h3 className="text-lg font-bold text-white">{activeQuestion.title}</h3>
              
              <div className="text-xs text-gray-400 leading-relaxed whitespace-pre-line border-t border-gray-800/80 pt-3">
                {activeQuestion.description}
              </div>

              {/* Sample test cases */}
              <div className="space-y-2 pt-2">
                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Sample Test Cases</h4>
                {activeQuestion.test_cases.map((tc: any, idx: number) => (
                  <div key={idx} className="p-2.5 bg-gray-950 rounded-lg text-[10px] space-y-1">
                    <p className="text-gray-500">Input: <span className="text-gray-300 font-mono">{tc.input}</span></p>
                    <p className="text-gray-500">Expected: <span className="text-emerald-400 font-mono">{tc.expected}</span></p>
                  </div>
                ))}
              </div>

              {/* Hint button */}
              <div>
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  {showHint ? "Hide Strategy Hint" : "Reveal Solution Hint"}
                </button>
                {showHint && (
                  <p className="text-[10px] text-indigo-300 bg-indigo-950/20 border border-indigo-500/15 p-3 rounded-lg mt-2 leading-relaxed">
                    {activeQuestion.id === 1 
                      ? "Use a hashmap (dict) to store seen elements and their indices. For each element, look up (target - element) in O(1) time."
                      : activeQuestion.id === 2
                      ? "Write a subquery selecting maximum salary, then select maximum salary where it is strictly less than the subquery's output."
                      : "Utilize a stack array. Iterate character brackets; push opens, pop and check matches on closes."}
                  </p>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Right Panel: Split code console and compiler output */}
        <div className="lg:col-span-8 flex flex-col justify-between glass-card rounded-2xl p-6 border border-gray-800">
          
          <div className="space-y-4">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-indigo-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">Console Editor</span>
              </div>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-gray-900 border border-gray-800 rounded px-2.5 py-1 text-xs text-white cursor-pointer"
              >
                <option value="python">Python 3</option>
                <option value="sql">SQL / Postgres</option>
                <option value="javascript">JavaScript</option>
              </select>
            </div>

            {/* Codearea */}
            <div className="relative">
              <textarea
                value={userCode}
                onChange={(e) => setUserCode(e.target.value)}
                className="w-full h-80 bg-gray-950 border border-gray-850 rounded-xl p-4 text-xs font-mono text-indigo-300 focus:outline-none focus:border-indigo-500 transition-colors leading-relaxed"
                rows={14}
              />
            </div>

          </div>

          <div className="flex items-center justify-between border-t border-gray-800 pt-4 mt-6">
            <span className="text-[10px] text-gray-500">Shortcut: Press run to compile test suite</span>
            <button
              onClick={handleSubmit}
              disabled={loading || !userCode.trim()}
              className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Play className="w-4 h-4" />
              {loading ? "Running tests..." : "Run Test Code"}
            </button>
          </div>

          {/* Test results console logger */}
          {result && (
            <div className="mt-6 p-4 bg-gray-950 rounded-xl border border-gray-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {result.passed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400" />
                  )}
                  <span className={`text-xs font-bold uppercase tracking-wider ${result.passed ? 'text-emerald-400' : 'text-red-400'}`}>
                    {result.passed ? "All tests passed" : "Evaluation Error"}
                  </span>
                </div>
              </div>

              <p className="text-xs text-gray-400 leading-relaxed font-mono">
                {result.details}
              </p>

              {result.error_log && (
                <div className="p-3 bg-red-950/20 border border-red-500/20 rounded-lg text-xs font-mono text-red-300">
                  {result.error_log}
                </div>
              )}

              {result.passed && (
                <div className="space-y-3 pt-3 border-t border-gray-800">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" /> Optimal Solution Code
                    </span>
                    <pre className="text-[10px] text-gray-300 bg-gray-900 border border-gray-850 p-3.5 rounded-lg mt-1 overflow-x-auto font-mono leading-relaxed whitespace-pre">
                      {result.solution}
                    </pre>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Complexity Assessment</span>
                    <p className="text-[10px] text-gray-400 mt-1 font-mono">{result.complexity}</p>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </>
  );
}
