"use client";

import { useEffect, useState } from "react";
import { 
  Settings, Key, Sparkles, CheckCircle2, 
  HelpCircle, RefreshCw, AlertTriangle
} from "lucide-react";

export default function SettingsPage() {
  const [provider, setProvider] = useState("simulated");
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    // Load current API key settings
    const loadSettings = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/settings?token=${token}`);
        const data = await res.json();
        setProvider(data.provider || "simulated");
        setApiKey(data.api_key || "");
      } catch (e) {
        console.error("Error loading settings:", e);
      }
    };
    loadSettings();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage("");

    const token = localStorage.getItem("token") || "";

    try {
      const res = await fetch("http://127.0.0.1:8000/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          provider: provider,
          api_key: apiKey
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error("Could not update settings");

      setStatusMessage("API configurations saved successfully!");
      if (data.provider) setProvider(data.provider);
      // Retrieve masked key check
      const loadRes = await fetch(`http://127.0.0.1:8000/api/settings?token=${token}`);
      const loadData = await loadRes.json();
      setApiKey(loadData.api_key || "");
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">System Settings</h1>
        <p className="text-sm text-gray-400 mt-1">Configure AI LLM providers and database connection keys.</p>
      </div>

      <div className="max-w-2xl mx-auto glass-card rounded-2xl p-6 border border-gray-800 space-y-6 shadow-xl">
        <div className="flex items-center gap-2 border-b border-gray-800 pb-3">
          <Settings className="w-5 h-5 text-indigo-400" />
          <h3 className="font-bold text-white text-base">API Configurations</h3>
        </div>

        {statusMessage && (
          <div className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
            statusMessage.startsWith("Error")
              ? "bg-red-500/10 border-red-500/20 text-red-400"
              : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
          }`}>
            {statusMessage}
          </div>
        )}

        <form onSubmit={handleSaveSettings} className="space-y-6">
          
          <div className="space-y-2">
            <label className="block text-[10px] text-gray-500 font-semibold uppercase tracking-wider">AI Language Model Provider</label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-3 py-2.5 text-xs text-white cursor-pointer"
            >
              <option value="simulated">Simulated Local AI Mode (Offline & Fast)</option>
              <option value="gemini">Google Gemini API (Live Models)</option>
              <option value="openai">OpenAI GPT-4o API (Live Models)</option>
              <option value="anthropic">Anthropic Claude API (Live Models)</option>
            </select>
            <p className="text-[10px] text-gray-500 leading-relaxed">
              When using Simulated Local AI Mode, all features (resume parsing, ATS comparisons, voice mock evaluations) operate locally using fast deterministic engines. Disables costs and internet requirements.
            </p>
          </div>

          {provider !== "simulated" && (
            <div className="space-y-2">
              <label className="block text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Provider API Key</label>
              <div className="relative">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Paste your API Key here (e.g. sk-...)"
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-700 focus:outline-none focus:border-indigo-500"
                />
                <Key className="w-4 h-4 text-gray-500 absolute left-3 top-3.5" />
              </div>
            </div>
          )}

          <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-xl text-[10px] text-indigo-300 flex items-start gap-2 leading-relaxed">
            <Sparkles className="w-4 h-4 flex-shrink-0 text-indigo-400" />
            <span>Note: Local keys are encrypted and stored in your private SQLite table (`careerpilot.db`) on your machine. We never upload keys to external database buckets.</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm py-2.5 rounded-lg shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Save API Configuration"}
          </button>

        </form>
      </div>
    </>
  );
}
