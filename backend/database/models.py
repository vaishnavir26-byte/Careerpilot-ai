from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
import datetime
from .connection import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    role = Column(String, default="candidate")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    readiness_score = Column(Float, default=0.0)

    resumes = relationship("Resume", back_populates="user", cascade="all, delete-orphan")
    interviews = relationship("InterviewSession", back_populates="user", cascade="all, delete-orphan")
    roadmaps = relationship("LearningRoadmap", back_populates="user", cascade="all, delete-orphan")
    portfolios = relationship("Portfolio", back_populates="user", cascade="all, delete-orphan")
    settings = relationship("Settings", back_populates="user", cascade="all, delete-orphan")


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    filename = Column(String, nullable=False)
    filepath = Column(String, nullable=False)
    raw_text = Column(Text, nullable=True)
    parsed_json = Column(Text, nullable=True)  # Store JSON representation of parsed data
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="resumes")


class JobDescription(Base):
    __tablename__ = "job_descriptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    company = Column(String, nullable=True)
    description_text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(String, nullable=False)  # HR, Technical, Coding, Behavioral, etc.
    mode = Column(String, default="text")  # text, voice, video
    status = Column(String, default="active")  # active, completed
    transcript_json = Column(Text, default="[]")  # Store QA history list
    score = Column(Float, default=0.0)
    evaluation_json = Column(Text, nullable=True)  # Detailed feedback on communication, confidence, technical, speed, etc.
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="interviews")


class LearningRoadmap(Base):
    __tablename__ = "learning_roadmaps"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    target_role = Column(String, nullable=False)
    duration_days = Column(Integer, default=30)  # 30, 60, 90
    roadmap_json = Column(Text, nullable=False)  # Store JSON representation of roadmap steps
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="roadmaps")


class Portfolio(Base):
    __tablename__ = "portfolios"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    template_name = Column(String, nullable=False)
    custom_data_json = Column(Text, nullable=False)  # Bio, links, highlights
    generated_html = Column(Text, nullable=True)
    generated_zip_path = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="portfolios")


class Settings(Base):
    __tablename__ = "settings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    provider = Column(String, default="simulated")  # simulated, openai, gemini, anthropic
    api_key = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="settings")
