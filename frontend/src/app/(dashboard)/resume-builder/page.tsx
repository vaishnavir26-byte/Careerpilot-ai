"use client";

import { useState } from "react";
import { 
  Milestone, ArrowRight, Printer, Copy, CheckCircle2, 
  HelpCircle, Trash, Plus, Sparkles
} from "lucide-react";

export default function ResumeBuilder() {
  const [template, setTemplate] = useState("Software Engineer");
  
  // Resume state
  const [personal, setPersonal] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    linkedin: "linkedin.com/in/johndoe",
    github: "github.com/johndoe"
  });

  const [skills, setSkills] = useState([
    "Python", "JavaScript", "React", "Node.js", "SQL", "Git"
  ]);
  const [newSkill, setNewSkill] = useState("");

  const [experience, setExperience] = useState([
    {
      company: "Tech Solutions Inc.",
      role: "Software Development Intern",
      date: "Jun 2025 - Present",
      bullets: [
        "Collaborated in a team of 4 to design and deploy FastAPI backend modules, improving query times by 20%.",
        "Engineered responsive React dashboard templates, increasing user interaction metrics by 15%."
      ]
    }
  ]);

  const [projects, setProjects] = useState([
    {
      title: "Real-time Chat App",
      tech: "React, WebSockets, Node.js",
      description: "Designed a lightweight websocket interface supporting live group chatting and profile presence trackers."
    }
  ]);

  const [education, setEducation] = useState({
    school: "State University",
    degree: "B.S. in Computer Science",
    date: "Sep 2022 - Jun 2026",
    gpa: "3.8 / 4.0"
  });

  // Handle skill adding/removing
  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  // Add bullet / experience helpers
  const handleAddBullet = (expIdx: number) => {
    const updated = [...experience];
    updated[expIdx].bullets.push("New achievement bullet point using action verbs...");
    setExperience(updated);
  };

  const handleBulletChange = (expIdx: number, bulletIdx: number, val: string) => {
    const updated = [...experience];
    updated[expIdx].bullets[bulletIdx] = val;
    setExperience(updated);
  };

  const handleRemoveBullet = (expIdx: number, bulletIdx: number) => {
    const updated = [...experience];
    updated[expIdx].bullets = updated[expIdx].bullets.filter((_, idx) => idx !== bulletIdx);
    setExperience(updated);
  };

  // Export triggers window.print
  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Interactive Resume Builder</h1>
          <p className="text-sm text-gray-400 mt-1">Configure professional resume templates and export to PDF instantly.</p>
        </div>
        <div>
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sm font-semibold text-white shadow shadow-emerald-600/20 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Print / Save to PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Column: Form Editor (hidden on print) */}
        <div className="lg:col-span-6 space-y-6 print:hidden">
          
          {/* Template Selector */}
          <div className="glass-card rounded-2xl p-6 border border-gray-800 space-y-3">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide">Select Template Pattern</label>
            <div className="grid grid-cols-3 gap-2">
              {["Software Engineer", "AI Engineer", "Data Scientist"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTemplate(t)}
                  className={`py-2 text-xs font-semibold rounded-lg border cursor-pointer transition-colors ${
                    template === t
                      ? "bg-indigo-600/10 border-indigo-500 text-indigo-400 font-bold"
                      : "border-gray-800 text-gray-400 hover:text-white"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Personal Info */}
          <div className="glass-card rounded-2xl p-6 border border-gray-800 space-y-4">
            <h3 className="font-bold text-white text-base">Personal Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-1">Full Name</label>
                <input
                  type="text"
                  value={personal.name}
                  onChange={(e) => setPersonal({ ...personal, name: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-1">Email Address</label>
                <input
                  type="email"
                  value={personal.email}
                  onChange={(e) => setPersonal({ ...personal, email: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-1">Phone Number</label>
                <input
                  type="text"
                  value={personal.phone}
                  onChange={(e) => setPersonal({ ...personal, phone: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-1">GitHub Username</label>
                <input
                  type="text"
                  value={personal.github}
                  onChange={(e) => setPersonal({ ...personal, github: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Education */}
          <div className="glass-card rounded-2xl p-6 border border-gray-800 space-y-4">
            <h3 className="font-bold text-white text-base">Education History</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-1">College/University</label>
                <input
                  type="text"
                  value={education.school}
                  onChange={(e) => setEducation({ ...education, school: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-1">Degree Title</label>
                <input
                  type="text"
                  value={education.degree}
                  onChange={(e) => setEducation({ ...education, degree: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-1">GPA Score</label>
                <input
                  type="text"
                  value={education.gpa}
                  onChange={(e) => setEducation({ ...education, gpa: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>
            </div>
          </div>

          {/* Skills tags */}
          <div className="glass-card rounded-2xl p-6 border border-gray-800 space-y-4">
            <h3 className="font-bold text-white text-base">Technical Skills</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add skill (e.g. AWS)"
                className="flex-grow bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-semibold text-white cursor-pointer"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 mt-2">
              {skills.map((skill) => (
                <span key={skill} className="px-2.5 py-1 bg-gray-900 border border-gray-800 rounded-md text-[10px] font-semibold text-gray-300 flex items-center gap-1.5 hover:border-red-500/30 transition-colors">
                  {skill}
                  <button onClick={() => handleRemoveSkill(skill)} className="text-gray-500 hover:text-red-400 cursor-pointer">×</button>
                </span>
              ))}
            </div>
          </div>

          {/* Experience Bullet Editor */}
          <div className="glass-card rounded-2xl p-6 border border-gray-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base">Work Experience</h3>
            </div>
            
            {experience.map((exp, expIdx) => (
              <div key={expIdx} className="space-y-3 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) => {
                      const updated = [...experience];
                      updated[expIdx].company = e.target.value;
                      setExperience(updated);
                    }}
                    placeholder="Company Name"
                    className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white"
                  />
                  <input
                    type="text"
                    value={exp.role}
                    onChange={(e) => {
                      const updated = [...experience];
                      updated[expIdx].role = e.target.value;
                      setExperience(updated);
                    }}
                    placeholder="Intern Role"
                    className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] text-gray-500 font-semibold uppercase tracking-wide">Impact Bullet Points</label>
                  {exp.bullets.map((b, bIdx) => (
                    <div key={bIdx} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={b}
                        onChange={(e) => handleBulletChange(expIdx, bIdx, e.target.value)}
                        className="flex-grow bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-white"
                      />
                      <button onClick={() => handleRemoveBullet(expIdx, bIdx)} className="p-1.5 bg-gray-800 hover:bg-red-500/10 border border-gray-700 hover:border-red-500/20 rounded text-gray-400 hover:text-red-400 cursor-pointer">
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleAddBullet(expIdx)}
                    className="text-[10px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer pt-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Bullet Point
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Right Column: Paper-Like Resume Preview */}
        <div className="lg:col-span-6 flex justify-center bg-gray-900/10 rounded-2xl border border-gray-800/50 p-6 print:bg-transparent print:border-none print:p-0">
          
          <div className="bg-white text-black w-full max-w-[620px] min-h-[800px] p-8 shadow-2xl rounded-xl border border-gray-200 flex flex-col justify-between print:shadow-none print:border-none print:rounded-none print:p-0">
            
            {/* Header info */}
            <div className="text-center space-y-1.5 border-b border-gray-200 pb-4">
              <h2 className="text-2xl font-bold tracking-tight uppercase">{personal.name}</h2>
              <div className="text-[10px] text-gray-600 flex justify-center gap-4">
                <span>{personal.email}</span>
                <span>{personal.phone}</span>
              </div>
              <div className="text-[9px] text-gray-500 flex justify-center gap-4">
                <span>{personal.linkedin}</span>
                <span>{personal.github}</span>
              </div>
            </div>

            {/* Content areas */}
            <div className="space-y-4 pt-4 flex-grow">
              
              {/* Education section */}
              <div className="space-y-1.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900 border-b border-gray-200 pb-0.5">Education</h3>
                <div className="flex justify-between items-start text-xs">
                  <div>
                    <h4 className="font-bold">{education.school}</h4>
                    <p className="text-[11px] text-gray-700 italic">{education.degree}</p>
                  </div>
                  <div className="text-right text-[11px]">
                    <span className="font-semibold">{education.date}</span>
                    <p className="text-gray-500">GPA: {education.gpa}</p>
                  </div>
                </div>
              </div>

              {/* Technical skills */}
              <div className="space-y-1.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900 border-b border-gray-200 pb-0.5">Technical Skills</h3>
                <p className="text-xs text-gray-800 leading-relaxed">
                  <span className="font-bold">Languages & Frameworks:</span> {skills.join(", ")}
                </p>
              </div>

              {/* Experience section */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900 border-b border-gray-200 pb-0.5">Experience</h3>
                {experience.map((exp, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-start text-xs">
                      <div>
                        <h4 className="font-bold">{exp.company}</h4>
                        <p className="text-[11px] text-gray-700 italic">{exp.role}</p>
                      </div>
                      <span className="text-[11px] font-semibold text-gray-600">{exp.date}</span>
                    </div>
                    <ul className="list-disc list-inside space-y-0.5 pl-2 text-[11px] text-gray-700 leading-relaxed">
                      {exp.bullets.map((b, bIdx) => (
                        <li key={bIdx}>{b}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Projects section */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900 border-b border-gray-200 pb-0.5">Projects</h3>
                {projects.map((proj, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="flex justify-between items-start text-xs">
                      <h4 className="font-bold">{proj.title}</h4>
                      <span className="text-[10px] font-semibold text-gray-600">{proj.tech}</span>
                    </div>
                    <p className="text-[11px] text-gray-700 leading-relaxed">{proj.description}</p>
                  </div>
                ))}
              </div>

            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 pt-4 text-center text-[9px] text-gray-400">
              Generated via CareerPilot AI. Print this view directly using the button above.
            </div>

          </div>

        </div>

      </div>
    </>
  );
}
