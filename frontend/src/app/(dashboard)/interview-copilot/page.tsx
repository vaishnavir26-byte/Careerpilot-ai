"use client";

import { useEffect, useRef, useState } from "react";
import { 
  BrainCircuit, Video, Mic, MicOff, Play, Award, 
  HelpCircle, CheckCircle, RefreshCw, AlertCircle, Volume2
} from "lucide-react";

export default function InterviewCopilot() {
  const [interviewType, setInterviewType] = useState("HR");
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionId, setSessionId] = useState<number | null>(null);
  
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  
  const [userAnswer, setUserAnswer] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);

  // Webcam video elements
  const videoRef = useRef<HTMLVideoElement>(null);
  const [streamActive, setStreamActive] = useState(false);
  
  // Speech synthesis and recognition refs
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize Web Speech Recognition if available in window
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recObj = new SpeechRecognition();
        recObj.continuous = true;
        recObj.interimResults = true;
        recObj.lang = "en-US";
        
        recObj.onresult = (event: any) => {
          let interimTranscript = "";
          let finalTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }
          setUserAnswer(finalTranscript || interimTranscript);
        };

        recObj.onerror = (e: any) => {
          console.error("Speech Recognition Error:", e);
          setIsListening(false);
        };

        recognitionRef.current = recObj;
      }
    }
  }, []);

  // Speak function helper
  const speakQuestion = (txt: string) => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      // Cancel previous speak loops
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(txt);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Webcam setup
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStreamActive(true);
      }
    } catch (e) {
      console.warn("Webcam access denied or unavailable:", e);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      setStreamActive(false);
    }
  };

  // Start interview session handler
  const handleStartSession = async () => {
    setLoading(true);
    setEvaluation(null);
    const token = localStorage.getItem("token") || "";

    try {
      const res = await fetch("http://127.0.0.1:8000/api/interview/start", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `token=${encodeURIComponent(token)}&type=${encodeURIComponent(interviewType)}&mode=voice`
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Could not start session");

      setSessionId(data.session_id);
      setCurrentQuestion(data.first_question);
      setTotalQuestions(data.total_questions);
      setCurrentIndex(0);
      setUserAnswer("");
      setSessionActive(true);
      
      // Start camera feed for mock visual tracking
      await startCamera();

      // Voice synthesiser speak
      setTimeout(() => speakQuestion(data.first_question), 800);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Toggle Voice Recognition mic input
  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech Recognition API is not supported on this browser. Try Chrome or Microsoft Edge.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setUserAnswer("");
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // Submit Answer to Next Question
  const handleNextQuestion = async () => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    setSubmitting(true);
    const token = localStorage.getItem("token") || "";

    try {
      const res = await fetch("http://127.0.0.1:8000/api/interview/respond", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `token=${encodeURIComponent(token)}&session_id=${sessionId}&answer=${encodeURIComponent(userAnswer || "No direct spoken answer provided.")}`
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to submit response");

      if (data.status === "completed") {
        setSessionActive(false);
        setEvaluation(data.evaluation);
        stopCamera();
        
        // Update user readiness in local storage
        const userStr = localStorage.getItem("user_info");
        if (userStr) {
          const u = JSON.parse(userStr);
          u.readiness_score = data.readiness_score;
          localStorage.setItem("user_info", JSON.stringify(u));
        }
      } else {
        setCurrentQuestion(data.next_question);
        setCurrentIndex(data.current_index);
        setUserAnswer("");
        
        // Speak next question
        setTimeout(() => speakQuestion(data.next_question), 500);
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuit = () => {
    if (recognitionRef.current) recognitionRef.current.stop();
    stopCamera();
    setSessionActive(false);
    setSessionId(null);
    setEvaluation(null);
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">AI Interview Copilot</h1>
          <p className="text-sm text-gray-400 mt-1">Practice mock interviews with dynamic speech synthesis and real-time audio transcripts.</p>
        </div>
      </div>

      {!sessionActive && !evaluation && (
        <div className="max-w-xl mx-auto glass-card rounded-2xl p-8 border border-gray-800 space-y-6 text-center shadow-xl">
          <BrainCircuit className="w-12 h-12 text-indigo-500 mx-auto" />
          
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white">Select Mock Interview Category</h3>
            <p className="text-xs text-gray-400">Choose a focus area. The AI interviewer will ask 5 domain-specific questions.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {["HR", "Technical", "Behavioral", "Data Science"].map((t) => (
              <button
                key={t}
                onClick={() => setInterviewType(t)}
                className={`py-3 text-xs font-semibold rounded-xl border cursor-pointer transition-all ${
                  interviewType === t
                    ? "bg-indigo-600/15 border-indigo-500 text-indigo-400 shadow"
                    : "border-gray-800 text-gray-400 hover:text-white"
                }`}
              >
                {t} Interview
              </button>
            ))}
          </div>

          <button
            onClick={handleStartSession}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm py-3 rounded-lg shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {loading ? "Initializing..." : "Start Practice Session"}
            <Play className="w-4 h-4" />
          </button>
        </div>
      )}

      {sessionActive && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left Panel: Camera Stream Video */}
          <div className="lg:col-span-4 flex flex-col justify-between glass-card rounded-2xl border border-gray-800 overflow-hidden bg-black p-4 min-h-[300px]">
            <div className="relative flex-grow flex items-center justify-center rounded-xl bg-gray-950 border border-gray-900 overflow-hidden shadow-inner">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover rounded-xl"
              />
              {!streamActive && (
                <div className="absolute flex flex-col items-center gap-2 text-center p-4">
                  <Video className="w-8 h-8 text-gray-700 animate-pulse" />
                  <span className="text-[10px] text-gray-600 font-semibold uppercase tracking-wider">Webcam preview offline</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-3 text-xs">
              <span className="text-gray-500 font-medium">Session: {currentIndex + 1} / {totalQuestions}</span>
              <span className="text-indigo-400 font-bold tracking-wide uppercase text-[10px] flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-indigo-500 animate-ping" />
                Interviewer Active
              </span>
            </div>
          </div>

          {/* Right Panel: Conversation Q&A log */}
          <div className="lg:col-span-8 glass-card rounded-2xl p-6 border border-gray-800 flex flex-col justify-between min-h-[400px]">
            <div className="space-y-6">
              
              {/* Question bubble */}
              <div className="p-4 bg-indigo-950/20 border border-indigo-500/20 rounded-xl space-y-2 relative">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">AI Interviewer</span>
                  <button onClick={() => speakQuestion(currentQuestion)} className="p-1 text-indigo-400 hover:text-indigo-300 rounded cursor-pointer" title="Speak question out loud">
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm font-semibold text-white leading-relaxed">{currentQuestion}</p>
              </div>

              {/* Speech transcript */}
              <div className="space-y-2">
                <label className="block text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Your Spoken Answer</label>
                <textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Click the microphone to start transcribing, or type your answer directly..."
                  rows={5}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl p-4 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors resize-none leading-relaxed"
                />
              </div>

            </div>

            {/* Controller elements */}
            <div className="flex items-center justify-between gap-4 pt-4 border-t border-gray-800 mt-6">
              <button
                onClick={handleQuit}
                className="px-4 py-2 border border-gray-800 text-gray-400 hover:text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Quit Session
              </button>

              <div className="flex items-center gap-2">
                {/* Audio mic trigger */}
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`p-2.5 rounded-full border shadow transition-all cursor-pointer ${
                    isListening
                      ? "bg-red-600 border-red-500 text-white animate-pulse"
                      : "bg-gray-800 border-gray-700 text-gray-400 hover:text-white"
                  }`}
                  title={isListening ? "Mute Microphone" : "Unmute Microphone / Speak"}
                >
                  {isListening ? <MicOff className="w-4.5 h-4.5" /> : <Mic className="w-4.5 h-4.5" />}
                </button>

                <button
                  onClick={handleNextQuestion}
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : currentIndex === totalQuestions - 1 ? "Complete Interview" : "Next Question"}
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Evaluation Results Card */}
      {evaluation && (
        <div className="max-w-3xl mx-auto glass-card rounded-2xl p-8 border border-gray-800 space-y-6 shadow-2xl relative">
          
          <div className="flex items-center justify-between border-b border-gray-800 pb-4">
            <div>
              <div className="flex items-center gap-2 text-indigo-400">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-lg">Interview Complete</h3>
              </div>
              <span className="text-[10px] text-gray-500">Real-time transcripts performance audit completed</span>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black text-indigo-400">{evaluation.overall_score}%</span>
              <span className="block text-[9px] text-gray-500 uppercase tracking-widest font-semibold mt-0.5">Mock Score</span>
            </div>
          </div>

          {/* Breakdown parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-900/60 border border-gray-800 rounded-xl">
              <span className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider">Communication Depth</span>
              <h4 className="text-base font-bold text-white mt-1">{evaluation.communication_score}%</h4>
            </div>
            <div className="p-4 bg-gray-900/60 border border-gray-800 rounded-xl">
              <span className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider">Technical Content</span>
              <h4 className="text-base font-bold text-white mt-1">{evaluation.technical_score}%</h4>
            </div>
            <div className="p-4 bg-gray-900/60 border border-gray-800 rounded-xl">
              <span className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider">Speech Confidence</span>
              <h4 className="text-base font-bold text-white mt-1">{evaluation.confidence_score}%</h4>
            </div>
          </div>

          {/* Strength and Weakness lists */}
          <div className="space-y-4 pt-2">
            <div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Strengths & Positives</span>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs text-gray-400 mt-2 leading-relaxed">
                {evaluation.strengths.map((str: string, idx: number) => (
                  <li key={idx}>{str}</li>
                ))}
              </ul>
            </div>

            <div>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Areas for Improvement</span>
              <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs text-gray-400 mt-2 leading-relaxed">
                {evaluation.feedback.map((f: string, idx: number) => (
                  <li key={idx} className="text-amber-200/90">{f}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-6 border-t border-gray-800">
            <button
              onClick={handleStartSession}
              className="flex-grow py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-4 h-4" /> Practice Another Mock
            </button>
            <a
              href="/dashboard"
              className="px-6 py-3 rounded-lg bg-gray-800 hover:bg-gray-700/80 border border-gray-700 text-gray-300 font-semibold text-sm text-center transition-all"
            >
              Return to Dashboard
            </a>
          </div>

        </div>
      )}
    </>
  );
}
