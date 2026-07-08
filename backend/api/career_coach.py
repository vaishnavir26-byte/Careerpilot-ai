from fastapi import APIRouter, Depends, HTTPException, Form
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database.connection import get_db
from .auth import get_current_user_helper

router = APIRouter(prefix="/coach", tags=["AI Career Mentor"])

class MentorMessage(BaseModel):
    token: str
    message: str

@router.post("/chat")
def chat_mentor(msg: MentorMessage, db: Session = Depends(get_db)):
    user = get_current_user_helper(msg.token, db)
    
    user_msg = msg.message.lower()
    reply = ""
    resources = []

    # Simple matching engine
    if "react" in user_msg or "angular" in user_msg or "vue" in user_msg:
        reply = "For modern web development placements, we highly recommend focusing on **React** paired with **TypeScript** and **Next.js**. Most high-growth product companies and startups value React because of its massive ecosystem, job market share, and modern routing systems. Angular is great for large enterprises, but React gives you maximum flexibility."
        resources = [
            {"title": "React Official Documentation", "url": "https://react.dev"},
            {"title": "Next.js Learning Course", "url": "https://nextjs.org/learn"}
        ]
    elif "resume" in user_msg or "cv" in user_msg:
        reply = "To improve your resume immediately:\n1. Ensure it is single-paged.\n2. Quantify achievements (e.g., 'Reduced api latency by 30% using Redis caching').\n3. Use standard PDF formatting (avoid multi-column graphical templates which mess up ATS systems).\n4. Highlight technical keywords like Python, Docker, or React matching target roles."
        resources = [
            {"title": "Google Resume Guidelines", "url": "https://www.google.com/search?q=google+resume+guide"},
            {"title": "Resume Worded - Scoring", "url": "https://resumeworded.com"}
        ]
    elif "project" in user_msg or "portfolio" in user_msg:
        reply = "A great project to showcase on a resume should be fully deployed and solve a real problem. We recommend building:\n1. A **real-time collaborative dashboard** (WebSockets, React, FastAPI).\n2. An **AI-driven analyzer** (using Gemini API, Python, Next.js).\n3. A **scalable ecommerce catalog** focusing on database optimizations and caching structures."
        resources = [
            {"title": "GitHub Developer Learning Path", "url": "https://github.com/readme/guides"}
        ]
    elif "company" in user_msg or "apply" in user_msg or "jobs" in user_msg:
        reply = "For job hunting, do not just click 'Apply' on job portals. Implement a structured plan:\n1. Optimize your LinkedIn profile with keyword-rich bios.\n2. Reach out directly to Engineering Managers or recruiters with a short, personalized pitch.\n3. Keep track of applications in a kanban board.\n4. Practice at least 2 coding problems daily on LeetCode."
        resources = [
            {"title": "Levels.fyi - Salary Scale & Job Posts", "url": "https://levels.fyi"},
            {"title": "LeetCode Interview Prep", "url": "https://leetcode.com"}
        ]
    else:
        reply = "Hello! I am your CareerPilot AI mentor. I can guide you with choosing web frameworks, restructuring your resume, detailing project architectures, or building learning roadmaps. Ask me any career or placement-related question!"
        resources = [
            {"title": "CareerPilot Dashboard Hub", "url": "/dashboard"}
        ]

    return {
        "reply": reply,
        "resources": resources
    }
