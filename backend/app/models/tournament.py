from sqlalchemy import Column, Integer, String, Float, DateTime, JSON, ForeignKey, Boolean
from sqlalchemy.sql import func
from app.db.base import Base

class Tournament(Base):
    __tablename__ = "tournaments"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    description = Column(String, nullable=True)
    location = Column(String)
    director_id = Column(Integer, ForeignKey("users.id"))
    
    format = Column(String)  # singles, doubles, team
    race_type = Column(String)  # standard, handicap
    race_to = Column(Integer)
    
    entry_fee = Column(Float)
    max_players = Column(Integer)
    current_players = Column(Integer, default=0)
    
    status = Column(String)  # pending, active, completed
    bracket_data = Column(JSON)
    
    # Money management
    total_prize_pool = Column(Float, default=0)
    added_money = Column(Float, default=0)
    house_fee = Column(Float, default=0)
    director_fee = Column(Float, default=0)
    payout_structure = Column(JSON)
    
    # Calcutta
    has_calcutta = Column(Boolean, default=False)
    calcutta_data = Column(JSON, nullable=True)
    
    start_date = Column(DateTime(timezone=True))
    end_date = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())