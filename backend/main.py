from fastapi import FastAPI, Depends, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
import uvicorn
from database.connection import engine, Base, get_db
from database.models import Settings
from api.auth import get_current_user_helper

# Import routers
from api.auth import router as auth_router
from api.resume import router as resume_router
from api.interview import router as interview_router
from api.coding import router as coding_router
from api.projects import router as projects_router
from api.career_coach import router as coach_router
from api.roadmap import router as roadmap_router
from api.portfolio import router as portfolio_router

# Create tables in SQLite database
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="CareerPilot AI API",
    description="Backend API for CareerPilot AI – Resume & Interview Copilot",
    version="1.0.0"
)

# Set CORS origins
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "*"  # Allow all during local pair programming
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers under /api
app.include_router(auth_router, prefix="/api")
app.include_router(resume_router, prefix="/api")
app.include_router(interview_router, prefix="/api")
app.include_router(coding_router, prefix="/api")
app.include_router(projects_router, prefix="/api")
app.include_router(coach_router, prefix="/api")
app.include_router(roadmap_router, prefix="/api")
app.include_router(portfolio_router, prefix="/api")

class SettingsUpdateRequest(BaseModel):
    token: str
    provider: str  # simulated, openai, gemini, anthropic
    api_key: str

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "CareerPilot AI API Engine",
        "version": "1.0.0"
    }

@app.get("/api/settings")
def get_user_settings(token: str, db: Session = Depends(get_db)):
    user = get_current_user_helper(token, db)
    setting = db.query(Settings).filter(Settings.user_id == user.id).first()
    if not setting:
        return {"provider": "simulated", "api_key": ""}
    
    # Do not return full api key for security, mask it
    masked_key = ""
    if setting.api_key:
        masked_key = setting.api_key[:4] + "*" * (len(setting.api_key) - 8) + setting.api_key[-4:] if len(setting.api_key) > 8 else "****"

    return {
        "provider": setting.provider,
        "api_key": masked_key
    }

@app.post("/api/settings")
def update_user_settings(req: SettingsUpdateRequest, db: Session = Depends(get_db)):
    user = get_current_user_helper(req.token, db)
    setting = db.query(Settings).filter(Settings.user_id == user.id).first()
    
    if not setting:
        setting = Settings(user_id=user.id, provider=req.provider, api_key=req.api_key)
        db.add(setting)
    else:
        setting.provider = req.provider
        if req.api_key and not req.api_key.startswith("****"):  # If not masked placeholder, update
            setting.api_key = req.api_key
            
    db.commit()
    return {"status": "success", "provider": setting.provider}

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
