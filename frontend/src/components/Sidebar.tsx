"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, FileText, CheckSquare, BrainCircuit, Code2, 
  Compass, Globe, Settings, RotateCw, Milestone
} from "lucide-react";

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className} style={{ width: '18px', height: '18px' }} {...props}>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

const NAV_ITEMS = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Resume Analyzer", href: "/resume-analyzer", icon: FileText },
  { name: "ATS Checker", href: "/ats-checker", icon: CheckSquare },
  { name: "Resume Builder", href: "/resume-builder", icon: Milestone },
  { name: "Interview Copilot", href: "/interview-copilot", icon: BrainCircuit },
  { name: "Coding Assistant", href: "/coding-assistant", icon: Code2 },
  { name: "Project Evaluator", href: "/project-evaluator", icon: GithubIcon },
  { name: "Career Mentor", href: "/career-mentor", icon: Compass },
  { name: "Portfolio Generator", href: "/portfolio-generator", icon: Globe },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  const handleResetWorkspace = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_info");
    window.location.href = "/";
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-gray-800 bg-[#090D1A]/85 backdrop-blur-md p-4 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 px-3 py-4 mb-6">
          <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
            CP
          </div>
          <span className="font-bold text-lg bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">
            CareerPilot AI
          </span>
        </div>

        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-indigo-600/20 text-indigo-400 border-l-2 border-indigo-500"
                    : "text-gray-400 hover:bg-gray-800/50 hover:text-white"
                }`}
              >
                <Icon className={`h-4.5 w-4.5 ${isActive ? "text-indigo-400" : "text-gray-400"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-gray-800">
        <button
          onClick={handleResetWorkspace}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-amber-400 hover:bg-amber-500/10 hover:text-amber-300 transition-all cursor-pointer"
        >
          <RotateCw className="h-4.5 w-4.5" />
          Reset Workspace
        </button>
      </div>
    </aside>
  );
}
