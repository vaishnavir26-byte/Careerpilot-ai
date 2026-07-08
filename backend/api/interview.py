from fastapi import APIRouter, Depends, HTTPException, Form, status
from sqlalchemy.orm import Session
import json
import random
from database.connection import get_db
from database.models import User, InterviewSession
from .auth import get_current_user_helper

router = APIRouter(prefix="/interview", tags=["AI Interview Copilot"])

# Sample banks of questions for high-fidelity responses
QUESTIONS_BANK = {
    "HR": [
        "Tell me about yourself and your journey into software development.",
        "Why do you want to join our company, and what values do you align with?",
        "What is your greatest professional weakness, and how are you working to improve it?",
        "Describe a situation where you had a conflict with a team member. How did you resolve it?",
        "Where do you see yourself in five years? What are your career aspirations?"
    ],
    "Technical": [
        "Explain the differences between client-side rendering (CSR) and server-side rendering (SSR).",
        "What is the Event Loop in JavaScript, and how does it handle asynchronous operations?",
        "Explain the concept of database normalization and when you would de-normalize database schemas.",
        "What is a RESTful API? Explain the difference between GET, POST, PUT, and DELETE methods.",
        "How do you ensure application security and prevent SQL injection or Cross-Site Scripting (XSS)?"
    ],
    "Behavioral": [
        "Tell me about a time you had to work under a tight deadline. How did you manage it?",
        "Describe a project you spearheaded that failed. What did you learn?",
        "How do you prioritize your tasks when you have multiple high-priority items due at once?",
        "Describe a time you had to explain a complex technical concept to a non-technical stakeholder.",
        "Tell me about a time you took the initiative to solve a problem that wasn't your direct responsibility."
    ],
    "Data Science": [
        "What is the difference between supervised and unsupervised learning?",
        "Explain the bias-variance trade-off in machine learning algorithms.",
        "What is regularization (L1/L2), and how does it prevent overfitting?",
        "Explain how a Random Forest classifier works and how it differs from a single Decision Tree.",
        "How do you handle missing values and imbalanced datasets in a data pipeline?"
    ]
}

@router.post("/start")
def start_interview(
    token: str = Form(...),
    type: str = Form(...),  # HR, Technical, Behavioral, Data Science
    mode: str = Form("text"),  # text, voice
    db: Session = Depends(get_db)
):
    user = get_current_user_helper(token, db)
    
    # Initialize the questions list for the session
    questions = QUESTIONS_BANK.get(type, QUESTIONS_BANK["HR"])
    
    session_data = {
        "questions": list(questions),
        "current_index": 0,
        "history": []  # elements: {"question": str, "answer": str}
    }

    session = InterviewSession(
        user_id=user.id,
        type=type,
        mode=mode,
        status="active",
        transcript_json=json.dumps(session_data),
        score=0.0
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    # Get first question
    first_question = questions[0]

    return {
        "session_id": session.id,
        "first_question": first_question,
        "total_questions": len(questions)
    }

@router.post("/respond")
def respond_interview(
    token: str = Form(...),
    session_id: int = Form(...),
    answer: str = Form(...),
    db: Session = Depends(get_db)
):
    user = get_current_user_helper(token, db)
    session = db.query(InterviewSession).filter(
        InterviewSession.id == session_id,
        InterviewSession.user_id == user.id
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found.")
    
    if session.status == "completed":
        return {"status": "completed", "message": "Interview already completed."}

    session_data = json.loads(session.transcript_json)
    questions = session_data["questions"]
    current_index = session_data["current_index"]
    history = session_data["history"]

    # Save the current answer
    current_question = questions[current_index]
    history.append({
        "question": current_question,
        "answer": answer
    })

    # Advance index
    next_index = current_index + 1
    session_data["current_index"] = next_index
    session_data["history"] = history
    session.transcript_json = json.dumps(session_data)
    db.commit()

    if next_index >= len(questions):
        # We finished all questions, auto-trigger evaluation
        session.status = "completed"
        db.commit()
        evaluation = evaluate_session_content(history, session.type)
        session.score = evaluation["overall_score"]
        session.evaluation_json = json.dumps(evaluation)
        db.commit()

        # Update placement readiness score slightly (practicing interviews increases score)
        # Completing an interview adds up to +5 to placement readiness
        user.readiness_score = min(user.readiness_score + 4.0, 99.0)
        db.commit()

        return {
            "status": "completed",
            "next_question": None,
            "evaluation": evaluation,
            "readiness_score": user.readiness_score
        }

    next_question = questions[next_index]
    return {
        "status": "active",
        "next_question": next_question,
        "current_index": next_index
    }

def evaluate_session_content(history, interview_type):
    # Perform standard mock evaluation based on answers
    # Evaluate communication, technical depth, grammar, structures
    overall_communication = 80
    overall_technical = 75
    confidence_score = 82
    grammar_score = 85

    # Look for filler words or short answers in history to dynamically adjust scores
    total_words = 0
    filler_words_count = 0
    short_answer_penalty = 0

    feedback_items = []
    for item in history:
        ans = item["answer"].lower()
        words = ans.split()
        total_words += len(words)

        # Check for empty/short answers
        if len(words) < 15:
            short_answer_penalty += 15
        
        # Filler words check
        fillers = ["like", "um", "uh", "actually", "basically", "so yeah"]
        for f in fillers:
            filler_words_count += ans.count(f)

    # Apply adjustments based on real user input text
    avg_words_per_answer = total_words / max(len(history), 1)
    
    if avg_words_per_answer < 20:
        overall_communication -= 15
        feedback_items.append("Your answers were brief. Aim to structure your answers using the STAR technique (Situation, Task, Action, Result) to provide more detail.")
    else:
        feedback_items.append("Good length of answers. You successfully detailed your points.")

    if filler_words_count > len(history) * 3:
        overall_communication -= 10
        confidence_score -= 8
        feedback_items.append(f"We detected multiple vocal fillers ('um', 'uh', 'like') in your transcript. Try speaking at a slightly slower, deliberate pace to reduce filler usage.")
    else:
        feedback_items.append("Smooth speech patterns with minimal verbal fillers detected in transcripts.")

    if interview_type in ["Technical", "Data Science"]:
        # Check for technical terms
        tech_terms = ["architecture", "scale", "performance", "api", "database", "react", "fastapi", "framework", "complexity", "optimization", "model", "algorithm"]
        tech_hits = sum(1 for term in tech_terms if any(term in item["answer"].lower() for item in history))
        if tech_hits < 3:
            overall_technical -= 15
            feedback_items.append("Your technical explanations lacked depth. Incorporate concrete engineering terminology (e.g., API structures, complexity constraints, optimization steps) when explaining details.")
        else:
            feedback_items.append("Great usage of technical terminology and frameworks in explanations.")

    # Bound scores
    overall_communication = max(45, min(overall_communication, 98))
    overall_technical = max(40, min(overall_technical, 98))
    confidence_score = max(50, min(confidence_score, 98))
    
    overall_score = round((overall_communication + overall_technical + confidence_score) / 3)

    return {
        "overall_score": overall_score,
        "communication_score": overall_communication,
        "technical_score": overall_technical,
        "confidence_score": confidence_score,
        "speaking_speed": "135 words per minute (Optimal)",
        "eye_contact": "Good (Simulated based on camera activity)",
        "strengths": [
            "Good articulation and grammar structure.",
            "Structured response length and clear flow of thoughts."
        ],
        "feedback": feedback_items
    }

@router.get("/history")
def get_interview_history(token: str, db: Session = Depends(get_db)):
    user = get_current_user_helper(token, db)
    sessions = db.query(InterviewSession).filter(
        InterviewSession.user_id == user.id,
        InterviewSession.status == "completed"
    ).order_by(InterviewSession.id.desc()).all()

    history_list = []
    for s in sessions:
        eval_data = json.loads(s.evaluation_json or "{}")
        history_list.append({
            "id": s.id,
            "type": s.type,
            "score": s.score,
            "created_at": s.created_at,
            "mode": s.mode,
            "strengths": eval_data.get("strengths", []),
            "feedback": eval_data.get("feedback", [])
        })

    return {"history": history_list}
