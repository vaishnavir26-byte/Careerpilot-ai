"use client";

import { useEffect, useState } from "react";
import { 
  Compass, Send, Sparkles, Milestone, Clock, 
  BookOpen, ChevronRight, HelpCircle, User, Award
} from "lucide-react";

export default function CareerMentor() {
  // Chat state
  const [messages, setMessages] = useState<any[]>([
    { sender: "mentor", text: "Hello! I am your CareerPilot AI mentor. I can guide you with choosing web frameworks, restructuring your resume, detailing project architectures, or building learning roadmaps. Ask me any career or placement-related question!" }
  ]);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);

  // Roadmap state
  const [targetRole, setTargetRole] = useState("Frontend Engineer");
  const [duration, setDuration] = useState(30);
  const [generating, setGenerating] = useState(false);
  const [roadmap, setRoadmap] = useState<any[] | null>(null);

  useEffect(() => {
    // Check if user already has an active roadmap
    const checkRoadmap = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/roadmap/latest?token=${token}`);
        const data = await res.json();
        if (data.has_roadmap) {
          setRoadmap(data.roadmap);
          setTargetRole(data.target_role);
          setDuration(data.duration_days);
        }
      } catch (e) {
        console.error("Error checking latest roadmap:", e);
      }
    };
    checkRoadmap();
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = inputText.trim();
    setMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    setInputText("");
    setSending(true);

    const token = localStorage.getItem("token") || "";

    try {
      const res = await fetch("http://127.0.0.1:8000/api/coach/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          message: userMsg
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error("Mentor connection error");

      setMessages((prev) => [...prev, { 
        sender: "mentor", 
        text: data.reply,
        resources: data.resources
      }]);
    } catch (e: any) {
      setMessages((prev) => [...prev, { sender: "mentor", text: "Sorry, I am experiencing server connectivity issues. Please try again." }]);
    } finally {
      setSending(false);
    }
  };

  const handleGenerateRoadmap = async () => {
    setGenerating(true);
    setRoadmap(null);
    const token = localStorage.getItem("token") || "";

    try {
      const res = await fetch("http://127.0.0.1:8000/api/roadmap/generate", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `token=${encodeURIComponent(token)}&target_role=${encodeURIComponent(targetRole)}&duration_days=${duration}`
      });
      const data = await res.json();
      if (!res.ok) throw new Error("Roadmap generation failed");

      setRoadmap(data.roadmap);

      // Update readiness score in local storage
      const userStr = localStorage.getItem("user_info");
      if (userStr) {
        const u = JSON.parse(userStr);
        u.readiness_score = data.readiness_score;
        localStorage.setItem("user_info", JSON.stringify(u));
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Column: AI Career Mentor Chat */}
        <div className="lg:col-span-5 flex flex-col justify-between glass-card rounded-2xl border border-gray-800 p-5 min-h-[480px]">
          
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-800 pb-3">
              <Compass className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-white text-base">AI Career Mentor</h3>
            </div>
            
            {/* Messages box */}
            <div className="space-y-4 overflow-y-auto max-h-[340px] pr-2 scrollbar-none flex flex-col">
              {messages.map((m, idx) => (
                <div 
                  key={idx} 
                  className={`max-w-[85%] rounded-xl p-3.5 text-xs leading-relaxed ${
                    m.sender === "user"
                      ? "bg-indigo-600 text-white self-end"
                      : "bg-gray-900 border border-gray-850 text-gray-300 self-start"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1 opacity-60">
                    {m.sender === "user" ? <User className="w-3.5 h-3.5" /> : <Compass className="w-3.5 h-3.5" />}
                    <span className="font-semibold uppercase tracking-wider text-[9px]">{m.sender === "user" ? "You" : "Career Mentor"}</span>
                  </div>
                  <p className="whitespace-pre-line">{m.text}</p>
                  
                  {m.resources && m.resources.length > 0 && (
                    <div className="mt-3.5 pt-2.5 border-t border-gray-800/80 space-y-1.5">
                      <span className="block text-[9px] font-bold text-indigo-400 uppercase tracking-widest">Recommended Links</span>
                      {m.resources.map((link: any, lIdx: number) => (
                        <a 
                          key={lIdx} 
                          href={link.url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="block text-[10px] text-emerald-400 hover:underline font-semibold"
                        >
                          {link.title} →
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {sending && (
                <div className="bg-gray-900 border border-gray-855 rounded-xl p-3.5 text-xs text-gray-500 self-start animate-pulse">
                  Mentor is writing suggestions...
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSendMessage} className="flex gap-2 border-t border-gray-800 pt-4 mt-4">
            <input
              type="text"
              required
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask framework advice, project tips, application strategies..."
              className="flex-grow bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={sending}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>

        {/* Right Column: Skill Gaps and Roadmaps */}
        <div className="lg:col-span-7 flex flex-col justify-between glass-card rounded-2xl p-5 border border-gray-800 min-h-[480px]">
          
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <Milestone className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-white text-base">Learning Roadmap Plan</h3>
              </div>
              <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Skill Gap analysis</span>
            </div>

            {/* Config workspace */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-[9px] text-gray-500 font-semibold uppercase tracking-wider mb-1">Target Professional Role</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg px-2.5 py-2 text-xs text-white cursor-pointer"
                >
                  <option value="Frontend Engineer">Frontend Engineer (React/TypeScript)</option>
                  <option value="Backend Developer">Backend Developer (FastAPI/Python)</option>
                  <option value="AI / ML Engineer">AI / ML Engineer (PyTorch/NLP)</option>
                </select>
              </div>

              <div>
                <label className="block text-[9px] text-gray-500 font-semibold uppercase tracking-wider mb-1">Timeline Days</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg px-2.5 py-2 text-xs text-white cursor-pointer"
                >
                  <option value={30}>30 Days</option>
                  <option value={60}>60 Days</option>
                  <option value={90}>90 Days</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleGenerateRoadmap}
              disabled={generating}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs py-2 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              {generating ? "Mapping learning path..." : "Generate 30/60/90 Days Roadmap"}
            </button>

            {/* Roadmap layout list */}
            {roadmap ? (
              <div className="space-y-4 pt-4 border-t border-gray-800 overflow-y-auto max-h-[300px] pr-1">
                {roadmap.map((week: any, idx: number) => (
                  <div key={idx} className="p-3 bg-gray-900/60 border border-gray-850 rounded-xl space-y-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-indigo-400" />
                      <h4 className="text-xs font-bold text-white">{week.timeframe}</h4>
                    </div>

                    <div className="space-y-2 text-xs pl-6">
                      <div>
                        <span className="block text-[9px] font-bold text-gray-500 uppercase tracking-wide">Key Topics</span>
                        <p className="text-gray-300 font-medium mt-0.5">{week.topics.join(" • ")}</p>
                      </div>

                      <div>
                        <span className="block text-[9px] font-bold text-gray-500 uppercase tracking-wide">Action Tasks</span>
                        <ul className="list-disc list-inside space-y-1 mt-1 text-[11px] text-gray-400 leading-relaxed">
                          {week.action_items.map((act: string, aIdx: number) => (
                            <li key={aIdx}>{act}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center text-xs text-gray-500 border border-dashed border-gray-800 rounded-2xl flex-grow flex items-center justify-center">
                Configure parameters above to build your curriculum pathway.
              </div>
            )}

          </div>

        </div>

      </div>
    </>
  );
}
