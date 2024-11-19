from sqlalchemy import Column, Integer, String, Float, DateTime, JSON, ForeignKey, Boolean
from sqlalchemy.sql import func
from app.db.base import Base

class Challenge(Base):
    __tablename__ = "challenges"
    
    id = Column(Integer, primary_key=True, index=True)
    challenger_id = Column(Integer, ForeignKey("users.id"))
    challengee_id = Column(Integer, ForeignKey("users.id"))
    
    type = Column(String)  # singles, doubles, team
    game_type = Column(String)  # 8ball, 9ball, straight
    race_type = Column(String)  # standard, handicap
    race_to = Column(JSON)  # {"challenger": 5, "challengee": 5}
    
    status = Column(String)  # pending, accepted, declined, completed
    result = Column(JSON, nullable=True)
    
    # Money match details
    is_money_match = Column(Boolean, default=False)
    stake_amount = Column(Float, default=0)
    side_bets = Column(JSON, default=[])
    
    scheduled_for = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())