from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from app.db.base import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    clerk_id = Column(String, unique=True, index=True)
    display_name = Column(String)
    photo_url = Column(String, nullable=True)
    
    # Skill levels
    apa_skill = Column(Float, default=0)
    bca_skill = Column(Float, default=0)
    tap_skill = Column(Float, default=0)
    
    # Stats
    wins = Column(Integer, default=0)
    losses = Column(Integer, default=0)
    money_earned = Column(Float, default=0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())