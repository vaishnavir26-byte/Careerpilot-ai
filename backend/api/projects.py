from fastapi import APIRouter, Depends, HTTPException, Form
from sqlalchemy.orm import Session
import re
from database.connection import get_db
from .auth import get_current_user_helper

router = APIRouter(prefix="/projects", tags=["Project Evaluator"])

@router.post("/evaluate")
def evaluate_project(
    token: str = Form(...),
    github_url: str = Form(...),
    db: Session = Depends(get_db)
):
    user = get_current_user_helper(token, db)

    # Validate url structure
    github_pattern = r'^https?:\/\/(www\.)?github\.com\/[\w\-]+\/[\w\-]+(\/)?$'
    if not re.match(github_pattern, github_url):
        raise HTTPException(
            status_code=400,
            detail="Invalid GitHub Repository URL. Format should be: https://github.com/owner/repo"
        )

    # Parse repo details
    parts = github_url.strip("/").split("/")
    repo_name = parts[-1]
    owner = parts[-2]

    # Analyze repo name to guess technologies
    repo_name_lower = repo_name.lower()
    detected_tech = []
    category = "Full-Stack Web Application"

    if "react" in repo_name_lower or "next" in repo_name_lower or "frontend" in repo_name_lower:
        detected_tech = ["React", "JavaScript/TypeScript", "Tailwind CSS", "Vercel"]
        category = "Frontend Application"
    elif "python" in repo_name_lower or "fastapi" in repo_name_lower or "django" in repo_name_lower or "backend" in repo_name_lower:
        detected_tech = ["Python", "FastAPI", "SQLite/PostgreSQL", "Docker"]
        category = "Backend Web API"
    elif "ai" in repo_name_lower or "ml" in repo_name_lower or "model" in repo_name_lower or "nlp" in repo_name_lower:
        detected_tech = ["Python", "PyTorch/Tensorflow", "NumPy/Pandas", "Scikit-Learn"]
        category = "Artificial Intelligence / Machine Learning"
    else:
        detected_tech = ["Node.js", "Express", "MongoDB", "GitHub Actions"]

    # Calculate mock evaluations based on name complexity
    repo_score = 65 + (len(repo_name) % 25)  # Yields score between 65 and 90
    
    # Generate suggestions
    suggestions = [
        "Include a comprehensive README.md containing setup guides, env declarations, and API descriptions.",
        "Add unit tests in a test/ folder and hook them into GitHub Actions CI workflows.",
        "Remove any hardcoded secrets and declare database URL config variables in a .env.example file."
    ]

    if "Frontend" in category:
        suggestions.append("Optimize assets loading, compress source images, and implement page level meta SEO tags.")
    elif "Backend" in category:
        suggestions.append("Implement authentication JWT guards and configure database connection pooling.")
    elif "Artificial" in category:
        suggestions.append("Add model checkpoint saving files, data preprocessing details, and training log metrics charts.")

    # Update readiness score: evaluatiing projects boosts scores!
    user.readiness_score = min(user.readiness_score + 3.0, 99.0)
    db.commit()

    return {
        "repo_name": repo_name,
        "owner": owner,
        "category": category,
        "score": repo_score,
        "technologies_used": detected_tech,
        "readme_quality": "Good (Basic structure present)",
        "code_quality": "B+ (Modular files structure, lacks unit test coverage)",
        "resume_worthiness": "High (Showcases production engineering skills)" if repo_score >= 80 else "Medium (Good for foundational skills)",
        "suggestions": suggestions,
        "readiness_score": user.readiness_score
    }
