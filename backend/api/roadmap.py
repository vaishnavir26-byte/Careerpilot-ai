from fastapi import APIRouter, Depends, HTTPException, Form
from sqlalchemy.orm import Session
import json
from database.connection import get_db
from database.models import User, LearningRoadmap
from .auth import get_current_user_helper

router = APIRouter(prefix="/roadmap", tags=["Learning Roadmap & Skill Gaps"])

@router.post("/generate")
def generate_roadmap(
    token: str = Form(...),
    target_role: str = Form(...),  # Frontend, Backend, AI, Data Science
    duration_days: int = Form(30),  # 30, 60, 90
    db: Session = Depends(get_db)
):
    user = get_current_user_helper(token, db)
    
    # Generate roadmap content
    roadmap_items = []
    
    if "Frontend" in target_role:
        roadmap_items = [
            {
                "timeframe": "Weeks 1-2: Core UI Foundation",
                "topics": ["Advanced JavaScript ES6+", "HTML5 Semantic Tags & SEO", "CSS Grid & Flexbox layouts"],
                "action_items": [
                    "Build a fully responsive personal landing page without frameworks.",
                    "Understand JavaScript closure, promise pipelines, and event delegation."
                ],
                "resources": ["MDN JS Web Docs", "CSS-Tricks Flexbox Guide"]
            },
            {
                "timeframe": "Weeks 3-4: Modern Frameworks & Routing",
                "topics": ["React.js component lifecycles", "Next.js App Router syntax", "Tailwind CSS UI design"],
                "action_items": [
                    "Create a modular dashboard with routing, theme togglers, and dynamic search.",
                    "Optimize rendering speeds using React.memo, useCallback, and useMemo hooks."
                ],
                "resources": ["React.dev Quick Start", "Tailwind docs"]
            }
        ]
        if duration_days >= 60:
            roadmap_items.append({
                "timeframe": "Weeks 5-8: State Management & APIs",
                "topics": ["Zustand / Redux Toolkit state stores", "REST API integration using Axios", "Client side validation structures"],
                "action_items": [
                    "Integrate dashboard state with backend endpoints.",
                    "Implement secure JWT access authorization headers."
                ],
                "resources": ["Zustand documentation", "Next.js Authentication patterns"]
            })
        if duration_days >= 90:
            roadmap_items.append({
                "timeframe": "Weeks 9-12: System Design & Deployments",
                "topics": ["Frontend caching strategies", "Edge runtime rendering", "Vercel / Netlify serverless pipelines"],
                "action_items": [
                    "Configure automated testing with Jest and testing-library.",
                    "Deploy app and achieve 95+ Lighthouse optimization scores."
                ],
                "resources": ["Lighthouse speed auditing", "Vercel deployment guides"]
            })

    elif "Backend" in target_role:
        roadmap_items = [
            {
                "timeframe": "Weeks 1-2: API Frameworks & Routing",
                "topics": ["Python type hinting", "FastAPI path and query validation parameters", "Pydantic parsing schemas"],
                "action_items": [
                    "Scaffold a FastAPI backend with structured routes and custom exception handlers.",
                    "Write automated router test fixtures using HTTPX and pytest."
                ],
                "resources": ["FastAPI Official Tutorials", "Real Python guides"]
            },
            {
                "timeframe": "Weeks 3-4: Database ORMs & Systems",
                "topics": ["SQLAlchemy models declaration", "SQLite & PostgreSQL transactions", "Database indexing logic"],
                "action_items": [
                    "Design user-relations database schemas and manage migrations.",
                    "Optimize database query times using SQLAlchemy prefetch joins."
                ],
                "resources": ["SQLAlchemy documentation", "PostgreSQL tuning guides"]
            }
        ]
        if duration_days >= 60:
            roadmap_items.append({
                "timeframe": "Weeks 5-8: Caching, Tasks & Containers",
                "topics": ["Redis server caching structures", "Celery async background tasks queue", "Docker containerization"],
                "action_items": [
                    "Integrate API speed cache layers and dockerize backend services.",
                    "Write a compose structure linking FastAPI database and Redis containers."
                ],
                "resources": ["Redis cache patterns", "Docker handbook guides"]
            })
        if duration_days >= 90:
            roadmap_items.append({
                "timeframe": "Weeks 9-12: Backend Architectures & Clouds",
                "topics": ["Microservices structures", "Cloud storage buckets (AWS S3 / Supabase Storage)", "API security specs"],
                "action_items": [
                    "Implement full JWT verification guards and file upload endpoints.",
                    "Configure security headers and rate limits."
                ],
                "resources": ["AWS S3 SDK tutorials", "OWASP API Security Top 10"]
            })

    else:  # AI or Data Science fallback
        roadmap_items = [
            {
                "timeframe": "Weeks 1-2: Data Wrangling Basics",
                "topics": ["Python core programming", "Pandas dataframe transformations", "Data cleansing structures"],
                "action_items": [
                    "Load dataset files, handle missing parameters, and plot distributions.",
                    "Build statistical hypothesis tests using NumPy and SciPy libraries."
                ],
                "resources": ["Kaggle Pandas tutorial", "Python Data Science Handbook"]
            },
            {
                "timeframe": "Weeks 3-4: Machine Learning Foundations",
                "topics": ["Scikit-learn model selection (Regressions, Classifications)", "Cross-validation configurations", "Metrics evaluation (F1-score, ROC AUC)"],
                "action_items": [
                    "Construct feature pipelines and train forest models.",
                    "Perform model parameter hyper-tuning."
                ],
                "resources": ["Scikit-learn guides", "Kaggle ML courses"]
            }
        ]
        if duration_days >= 60:
            roadmap_items.append({
                "timeframe": "Weeks 5-8: Deep Learning & Frameworks",
                "topics": ["Neural Networks architectures", "PyTorch tensors manipulation", "Forward & Backward prop loops"],
                "action_items": [
                    "Build a PyTorch network classifier for image patterns.",
                    "Optimize networks using standard dropout and ADAM optimizers."
                ],
                "resources": ["PyTorch Tutorials", "DeepLearning.ai courses"]
            })
        if duration_days >= 90:
            roadmap_items.append({
                "timeframe": "Weeks 9-12: NLP, LLMs & Vectors",
                "topics": ["Transformer layers attention architectures", "Hugging Face model fine-tuning", "ChromaDB vector integrations"],
                "action_items": [
                    "Fine-tune a language model on custom transcripts.",
                    "Build a local RAG model using LlamaIndex or LangChain."
                ],
                "resources": ["Hugging Face tutorials", "LlamaIndex guides"]
            })

    # Save to database
    db_roadmap = LearningRoadmap(
        user_id=user.id,
        target_role=target_role,
        duration_days=duration_days,
        roadmap_json=json.dumps(roadmap_items)
    )
    db.add(db_roadmap)
    db.commit()
    db.refresh(db_roadmap)

    # Increment placement score slightly
    user.readiness_score = min(user.readiness_score + 3.0, 99.0)
    db.commit()

    return {
        "id": db_roadmap.id,
        "target_role": db_roadmap.target_role,
        "duration_days": db_roadmap.duration_days,
        "roadmap": roadmap_items,
        "readiness_score": user.readiness_score
    }

@router.get("/latest")
def get_latest_roadmap(token: str, db: Session = Depends(get_db)):
    user = get_current_user_helper(token, db)
    roadmap = db.query(LearningRoadmap).filter(LearningRoadmap.user_id == user.id).order_by(LearningRoadmap.id.desc()).first()
    if not roadmap:
        return {"has_roadmap": False}
    
    return {
        "has_roadmap": True,
        "id": roadmap.id,
        "target_role": roadmap.target_role,
        "duration_days": roadmap.duration_days,
        "roadmap": json.loads(roadmap.roadmap_json),
        "created_at": roadmap.created_at
    }
