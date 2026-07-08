import re
import os
from pypdf import PdfReader
from docx import Document

def extract_text_from_pdf(filepath):
    try:
        reader = PdfReader(filepath)
        text = ""
        for page in reader.pages:
            text += page.extract_text() or ""
        return text
    except Exception as e:
        print(f"Error reading PDF: {e}")
        return ""

def extract_text_from_docx(filepath):
    try:
        doc = Document(filepath)
        text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
        return text
    except Exception as e:
        print(f"Error reading DOCX: {e}")
        return ""

def parse_resume_text(text):
    # Setup fallbacks
    parsed = {
        "name": "Candidate Name",
        "email": "candidate@example.com",
        "phone": "+1-123-456-7890",
        "education": [],
        "skills": [],
        "experience": [],
        "projects": [],
        "certifications": [],
        "achievements": []
    }

    if not text:
        return parsed

    # Simple regex for email and phone
    email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text)
    if email_match:
        parsed["email"] = email_match.group(0)

    phone_match = re.search(r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', text)
    if phone_match:
        parsed["phone"] = phone_match.group(0)

    # Simple name extraction (heuristics based on first line)
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    if lines:
        for line in lines[:3]:
            # A name is typically 2-3 words, no numbers, not containing email or common headers
            words = line.split()
            if 2 <= len(words) <= 3 and not any(char.isdigit() for char in line) and "@" not in line:
                parsed["name"] = line
                break

    # Skill lists (checking for popular technical skills)
    common_skills = [
        "python", "javascript", "typescript", "react", "next.js", "angular", "vue", "node.js", 
        "express", "fastapi", "django", "flask", "postgresql", "mysql", "mongodb", "sqlite", 
        "docker", "kubernetes", "aws", "azure", "gcp", "git", "github", "html", "css", "tailwind", 
        "java", "c++", "c#", "go", "rust", "machine learning", "deep learning", "nlp", "computer vision", 
        "data science", "pytorch", "tensorflow", "pandas", "numpy", "scikit-learn"
    ]
    found_skills = []
    text_lower = text.lower()
    for skill in common_skills:
        # Match word boundaries or custom matching
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, text_lower):
            # Format nicely
            found_skills.append(skill.upper() if len(skill) <= 3 else skill.title())
    parsed["skills"] = list(set(found_skills))

    # Basic sections extractor
    current_section = None
    education_keywords = ["education", "academic", "university", "college", "degree"]
    experience_keywords = ["experience", "employment", "work history", "professional history"]
    project_keywords = ["projects", "personal projects", "academic projects", "key projects"]
    certification_keywords = ["certifications", "licenses", "courses", "certificates"]
    achievement_keywords = ["achievements", "awards", "honors", "accomplishments"]

    section_content = {
        "education": [],
        "experience": [],
        "projects": [],
        "certifications": [],
        "achievements": []
    }

    for line in lines:
        line_lower = line.lower()
        
        # Check if line is a header
        is_header = False
        if any(keyword in line_lower and len(line_lower) < 25 for keyword in education_keywords):
            current_section = "education"
            is_header = True
        elif any(keyword in line_lower and len(line_lower) < 25 for keyword in experience_keywords):
            current_section = "experience"
            is_header = True
        elif any(keyword in line_lower and len(line_lower) < 25 for keyword in project_keywords):
            current_section = "projects"
            is_header = True
        elif any(keyword in line_lower and len(line_lower) < 25 for keyword in certification_keywords):
            current_section = "certifications"
            is_header = True
        elif any(keyword in line_lower and len(line_lower) < 25 for keyword in achievement_keywords):
            current_section = "achievements"
            is_header = True

        if is_header:
            continue

        if current_section and line.strip():
            section_content[current_section].append(line.strip())

    # Map sections content back with basic structure
    # For education, group by bullet points or simple string lists
    parsed["education"] = section_content["education"][:4]
    parsed["experience"] = section_content["experience"][:6]
    parsed["projects"] = section_content["projects"][:6]
    parsed["certifications"] = section_content["certifications"][:4]
    parsed["achievements"] = section_content["achievements"][:4]

    return parsed
