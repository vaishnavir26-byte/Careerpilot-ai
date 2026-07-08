from fastapi import APIRouter, Depends, HTTPException, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
import os
import zipfile
import json
from database.connection import get_db
from database.models import User, Portfolio
from .auth import get_current_user_helper

router = APIRouter(prefix="/portfolio", tags=["Portfolio Generator"])

# Folder for exports
EXPORTS_DIR = "./exports"
os.makedirs(EXPORTS_DIR, exist_ok=True)

class PortfolioRequest(BaseModel):
    token: str
    template_name: str  # Software Engineer, AI Engineer, Data Scientist
    full_name: str
    tagline: str
    about: str
    github: str
    linkedin: str
    skills: list[str]
    projects: list[dict]  # List of {"title": str, "description": str, "tech": str}

@router.post("/generate")
def generate_portfolio(req: PortfolioRequest, db: Session = Depends(get_db)):
    user = get_current_user_helper(req.token, db)

    # Stylesheet (Vanilla CSS with a premium dark theme)
    css_content = """
body {
    margin: 0;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    background-color: #0B0F19;
    color: #F3F4F6;
    line-height: 1.6;
}
header {
    background: linear-gradient(135deg, #1E1B4B 0%, #0F172A 100%);
    padding: 80px 20px;
    text-align: center;
    border-bottom: 1px solid #1E293B;
}
header h1 {
    font-size: 3.5rem;
    margin: 0 0 10px 0;
    color: #FFFFFF;
    background: linear-gradient(to right, #818CF8, #34D399);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}
header p {
    font-size: 1.25rem;
    color: #9CA3AF;
    margin: 0 auto;
    max-width: 600px;
}
.container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 40px 20px;
}
section {
    margin-bottom: 60px;
}
h2 {
    font-size: 2rem;
    color: #818CF8;
    border-bottom: 2px solid #1E293B;
    padding-bottom: 10px;
    margin-top: 0;
}
.skills-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 20px;
}
.skill-tag {
    background-color: #1E293B;
    color: #E5E7EB;
    padding: 8px 16px;
    border-radius: 9999px;
    font-size: 0.9rem;
    border: 1px solid #334155;
    transition: all 0.2s ease;
}
.skill-tag:hover {
    border-color: #818CF8;
    transform: translateY(-2px);
}
.projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
    margin-top: 20px;
}
.project-card {
    background-color: #111827;
    border: 1px solid #1E293B;
    border-radius: 12px;
    padding: 24px;
    transition: all 0.3s ease;
}
.project-card:hover {
    transform: translateY(-5px);
    border-color: #818CF8;
    box-shadow: 0 10px 25px -5px rgba(129, 140, 248, 0.1);
}
.project-card h3 {
    margin: 0 0 10px 0;
    color: #FFFFFF;
}
.project-card p {
    color: #9CA3AF;
    font-size: 0.95rem;
    margin-bottom: 15px;
}
.project-tech {
    display: inline-block;
    color: #34D399;
    font-size: 0.85rem;
    font-weight: 600;
}
.links-section {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 30px;
}
.social-btn {
    display: inline-block;
    background-color: #818CF8;
    color: #FFFFFF;
    text-decoration: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-weight: 600;
    transition: background-color 0.2s ease;
}
.social-btn:hover {
    background-color: #6366F1;
}
.social-btn.secondary {
    background-color: #374151;
}
.social-btn.secondary:hover {
    background-color: #4B5563;
}
footer {
    text-align: center;
    padding: 40px 20px;
    color: #6B7280;
    border-top: 1px solid #1E293B;
    font-size: 0.9rem;
}
"""

    # Assemble HTML document
    skills_html = "".join([f'<span class="skill-tag">{skill}</span>' for skill in req.skills])
    
    projects_html = ""
    for proj in req.projects:
        projects_html += f"""
        <div class="project-card">
            <h3>{proj.get("title", "Project Title")}</h3>
            <p>{proj.get("description", "Project Description")}</p>
            <span class="project-tech">{proj.get("tech", "React / Python")}</span>
        </div>
        """

    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{req.full_name} | Portfolio</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <style>{css_content}</style>
</head>
<body>
    <header>
        <h1>{req.full_name}</h1>
        <p>{req.tagline}</p>
    </header>

    <div class="container">
        <section id="about">
            <h2>About Me</h2>
            <p>{req.about}</p>
        </section>

        <section id="skills">
            <h2>Core Skills</h2>
            <div class="skills-grid">
                {skills_html}
            </div>
        </section>

        <section id="projects">
            <h2>Featured Projects</h2>
            <div class="projects-grid">
                {projects_html}
            </div>
        </section>

        <section id="contact" style="text-align: center;">
            <h2>Get In Touch</h2>
            <p>Feel free to reach out to view my credentials or discuss potential roles.</p>
            <div class="links-section">
                <a href="{req.github}" target="_blank" class="social-btn">GitHub Profile</a>
                <a href="{req.linkedin}" target="_blank" class="social-btn secondary">LinkedIn Profile</a>
            </div>
        </section>
    </div>

    <footer>
        <p>&copy; 2026 {req.full_name}. Powered by CareerPilot AI.</p>
    </footer>
</body>
</html>
"""

    # Generate ZIP files structure
    zip_filename = f"portfolio_user_{user.id}.zip"
    zip_filepath = os.path.join(EXPORTS_DIR, zip_filename)
    
    # Write local zip
    with zipfile.ZipFile(zip_filepath, 'w') as zip_file:
        # Separate files in package structure
        zip_file.writestr("index.html", html_content)
        zip_file.writestr("style.css", css_content)
        zip_file.writestr("README.txt", f"Portfolio site for {req.full_name}.\nGenerated by CareerPilot AI.")

    # Save to database
    db_portfolio = Portfolio(
        user_id=user.id,
        template_name=req.template_name,
        custom_data_json=json.dumps({
            "full_name": req.full_name,
            "tagline": req.tagline,
            "about": req.about,
            "github": req.github,
            "linkedin": req.linkedin,
            "skills": req.skills,
            "projects": req.projects
        }),
        generated_html=html_content,
        generated_zip_path=zip_filepath
    )
    db.add(db_portfolio)
    db.commit()
    db.refresh(db_portfolio)

    return {
        "id": db_portfolio.id,
        "html_content": html_content,
        "download_url": f"/api/portfolio/download/{db_portfolio.id}"
    }

@router.get("/download/{portfolio_id}")
def download_portfolio_zip(portfolio_id: int, db: Session = Depends(get_db)):
    portfolio = db.query(Portfolio).filter(Portfolio.id == portfolio_id).first()
    if not portfolio or not portfolio.generated_zip_path:
        raise HTTPException(status_code=404, detail="Portfolio zip package not found.")
    
    if not os.path.exists(portfolio.generated_zip_path):
        # Rebuild if deleted
        data = json.loads(portfolio.custom_data_json)
        # Create standard file structure zip
        with zipfile.ZipFile(portfolio.generated_zip_path, 'w') as zip_file:
            zip_file.writestr("index.html", portfolio.generated_html)
            zip_file.writestr("style.css", "body { background-color: #0B0F19; color: #F3F4F6; }")
            zip_file.writestr("README.txt", "Portfolio generated by CareerPilot AI.")
            
    return FileResponse(
        path=portfolio.generated_zip_path,
        media_type="application/zip",
        filename=f"portfolio_careerpilot_{portfolio_id}.zip"
    )
