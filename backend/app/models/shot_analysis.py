from sqlalchemy import Column, Integer, String, Float, DateTime, JSON, ForeignKey
from sqlalchemy.sql import func
from app.db.base import Base

class ShotAnalysis(Base):
    __tablename__ = "shot_analyses"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    video_url = Column(String)
    pose_data = Column(JSON)
    analysis_results = Column(JSON)
    
    # Tempo analysis
    backswing_duration = Column(Float)
    pause_duration = Column(Float)
    forward_stroke_duration = Column(Float)
    follow_through_duration = Column(Float)
    consistency_score = Column(Float)
    
    feedback = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())