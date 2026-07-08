"use client";

import { useState } from "react";
import { 
  Globe, Sparkles, Download, ArrowRight, Eye, 
  HelpCircle, Trash, Plus, Terminal
} from "lucide-react";

export default function PortfolioGenerator() {
  const [template, setTemplate] = useState("Software Engineer");
  
  // Custom portfolio details
  const [fullName, setFullName] = useState("John Doe");
  const [tagline, setTagline] = useState("Aspiring Full Stack Web Developer");
  const [about, setAbout] = useState("I design and optimize clean, high-performance web applications using modern javascript and python backends.");
  const [github, setGithub] = useState("https://github.com/johndoe");
  const [linkedin, setLinkedin] = useState("https://linkedin.com/in/johndoe");

  const [skills, setSkills] = useState("React, Next.js, Python, FastAPI, PostgreSQL");
  
  const [projects, setProjects] = useState([
    {
      title: "Placement Preparation Hub",
      description: "An AI-powered preparation dashboard linking resume audits with mock speech synthesis.",
      tech: "Next.js, FastAPI, SQLite"
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [portfolioData, setPortfolioData] = useState<any>(null);

  const handleAddProject = () => {
    setProjects([...projects, { title: "New Project", description: "Brief details...", tech: "React / Python" }]);
  };

  const handleRemoveProject = (idx: number) => {
    setProjects(projects.filter((_, i) => i !== idx));
  };

  const handleProjectChange = (idx: number, key: string, val: string) => {
    const updated = [...projects];
    updated[idx] = { ...updated[idx], [key]: val };
    setProjects(updated);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setPortfolioData(null);

    const token = localStorage.getItem("token") || "";
    const skillsList = skills.split(",").map((s) => s.trim()).filter((s) => s);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/portfolio/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          template_name: template,
          full_name: fullName,
          tagline,
          about,
          github,
          linkedin,
          skills: skillsList,
          projects
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Generation failed");

      setPortfolioData(data);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Portfolio Website Generator</h1>
        <p className="text-sm text-gray-400 mt-1">Construct responsive personal portfolio landing codes and export static files instantly.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Column: Editor Forms */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card rounded-2xl p-6 border border-gray-800 space-y-5">
            <h3 className="font-bold text-white text-base">Configure Portfolio</h3>
            
            <form onSubmit={handleGenerate} className="space-y-4">
              
              <div>
                <label className="block text-[9px] text-gray-500 font-semibold uppercase tracking-wider mb-1">Layout Template</label>
                <select
                  value={template}
                  onChange={(e) => setTemplate(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg px-2.5 py-2 text-xs text-white cursor-pointer"
                >
                  <option value="Software Engineer">Software Engineer (Indigo dark)</option>
                  <option value="AI Engineer">AI / ML Engineer (Purple tech)</option>
                  <option value="Data Scientist">Data Scientist (Emerald numeric)</option>
                </select>
              </div>

              <div>
                <label className="block text-[9px] text-gray-500 font-semibold uppercase tracking-wider mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[9px] text-gray-500 font-semibold uppercase tracking-wider mb-1">Professional Tagline</label>
                <input
                  type="text"
                  required
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[9px] text-gray-500 font-semibold uppercase tracking-wider mb-1">Bio Summary</label>
                <textarea
                  required
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  rows={3}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 resize-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] text-gray-500 font-semibold uppercase tracking-wider mb-1">GitHub Link</label>
                  <input
                    type="url"
                    required
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[9px] text-gray-500 font-semibold uppercase tracking-wider mb-1">LinkedIn Link</label>
                  <input
                    type="url"
                    required
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] text-gray-500 font-semibold uppercase tracking-wider mb-1">Core Skills (comma separated)</label>
                <input
                  type="text"
                  required
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              {/* Projects List Editor */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="block text-[9px] text-gray-500 font-semibold uppercase tracking-wider">Featured Projects</label>
                  <button
                    type="button"
                    onClick={handleAddProject}
                    className="text-[9px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Project
                  </button>
                </div>

                {projects.map((proj, idx) => (
                  <div key={idx} className="p-3 bg-gray-950 rounded-xl border border-gray-850 space-y-2 relative">
                    <button
                      type="button"
                      onClick={() => handleRemoveProject(idx)}
                      className="absolute top-2 right-2 p-1 text-gray-600 hover:text-red-400 cursor-pointer"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                    
                    <input
                      type="text"
                      required
                      value={proj.title}
                      onChange={(e) => handleProjectChange(idx, "title", e.target.value)}
                      placeholder="Title"
                      className="w-[85%] bg-transparent border-b border-gray-800 focus:border-indigo-500 focus:outline-none text-xs font-semibold text-white pb-1"
                    />
                    <input
                      type="text"
                      required
                      value={proj.description}
                      onChange={(e) => handleProjectChange(idx, "description", e.target.value)}
                      placeholder="Description"
                      className="w-full bg-transparent border-b border-gray-800 focus:border-indigo-500 focus:outline-none text-[11px] text-gray-400 pb-1"
                    />
                    <input
                      type="text"
                      required
                      value={proj.tech}
                      onChange={(e) => handleProjectChange(idx, "tech", e.target.value)}
                      placeholder="Stack tags"
                      className="w-full bg-transparent text-[10px] text-emerald-400 focus:outline-none font-semibold"
                    />
                  </div>
                ))}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm py-2.5 rounded-lg shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                {loading ? "Generating site files..." : "Compile & Build Portfolio"}
              </button>

            </form>
          </div>
        </div>

        {/* Right Column: Live Iframe Preview */}
        <div className="lg:col-span-7 flex flex-col justify-between glass-card rounded-2xl p-5 border border-gray-800 items-stretch">
          
          {portfolioData ? (
            <div className="space-y-4 h-full flex flex-col justify-between">
              
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <div className="flex items-center gap-2">
                  <Eye className="w-4.5 h-4.5 text-indigo-400 animate-pulse" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Live Preview Simulator</span>
                </div>
                
                {/* Download Zip */}
                <a
                  href={`http://127.0.0.1:8000${portfolioData.download_url}`}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow shadow-emerald-600/10 flex items-center gap-1 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download ZIP Packages
                </a>
              </div>

              {/* Render Iframe of HTML */}
              <div className="flex-grow rounded-xl border border-gray-850 bg-black overflow-hidden relative shadow-inner min-h-[360px]">
                <iframe
                  title="Portfolio Live Preview"
                  srcDoc={portfolioData.html_content}
                  className="w-full h-full border-none"
                />
              </div>

            </div>
          ) : (
            <div className="py-20 text-center text-xs text-gray-500 border border-dashed border-gray-800 rounded-2xl h-full flex flex-col justify-center gap-2">
              <Globe className="w-8 h-8 text-gray-700 mx-auto animate-pulse" />
              <p>Configure layouts above and click generate to audit interactive site previews.</p>
            </div>
          )}

        </div>

      </div>
    </>
  );
}
