"use client";

import { useEffect, useState } from "react";
import { User, Award } from "lucide-react";

export default function Navbar() {
  const [userName, setUserName] = useState("Guest User");
  const [score, setScore] = useState(50.0);

  useEffect(() => {
    const info = localStorage.getItem("user_info");
    if (info) {
      try {
        const user = JSON.parse(info);
        setUserName(user.full_name || "Candidate");
        setScore(user.readiness_score || 50.0);
      } catch (e) {
        console.error("Error parsing user info:", e);
      }
    }
  }, []);

  // Format score color
  const getScoreColor = (val: number) => {
    if (val >= 80) return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
    if (val >= 60) return "text-indigo-400 border-indigo-500/30 bg-indigo-500/10";
    return "text-amber-400 border-amber-500/30 bg-amber-500/10";
  };

  return (
    <header className="fixed top-0 right-0 left-64 z-30 h-16 border-b border-gray-800 bg-[#060913]/70 backdrop-blur-md px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h2 className="text-gray-300 font-medium text-sm">Welcome back, <span className="text-white font-semibold">{userName}</span></h2>
      </div>

      <div className="flex items-center gap-6">
        {/* Placement Readiness Badge */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${getScoreColor(score)}`}>
          <Award className="h-4 w-4" />
          <span>Placement Readiness: {score}%</span>
        </div>

        {/* Profile Circle */}
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center">
            <User className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>
    </header>
  );
}
