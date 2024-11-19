from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import desc
from app.db.base import get_db
from app.models.user import User
from app.schemas.leaderboard import LeaderboardEntry
from typing import List

router = APIRouter()

@router.get("/", response_model=List[LeaderboardEntry])
async def get_leaderboard(
    skill_system: str = None,
    min_skill: float = None,
    max_skill: float = None,
    min_win_rate: float = None,
    sort_by: str = "win_rate",
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    query = db.query(User)
    
    # Apply skill level filters
    if skill_system and min_skill is not None:
        if skill_system == "apa":
            query = query.filter(User.apa_skill >= min_skill)
        elif skill_system == "bca":
            query = query.filter(User.bca_skill >= min_skill)
        elif skill_system == "tap":
            query = query.filter(User.tap_skill >= min_skill)
            
    if skill_system and max_skill is not None:
        if skill_system == "apa":
            query = query.filter(User.apa_skill <= max_skill)
        elif skill_system == "bca":
            query = query.filter(User.bca_skill <= max_skill)
        elif skill_system == "tap":
            query = query.filter(User.tap_skill <= max_skill)
    
    # Apply win rate filter
    if min_win_rate is not None:
        query = query.filter(
            (User.wins * 100.0 / (User.wins + User.losses)) >= min_win_rate
        )
    
    # Apply sorting
    if sort_by == "win_rate":
        query = query.order_by(desc(User.wins * 100.0 / (User.wins + User.losses)))
    elif sort_by == "wins":
        query = query.order_by(desc(User.wins))
    elif sort_by == "money_earned":
        query = query.order_by(desc(User.money_earned))
    elif sort_by == "skill_apa":
        query = query.order_by(desc(User.apa_skill))
    elif sort_by == "skill_bca":
        query = query.order_by(desc(User.bca_skill))
    elif sort_by == "skill_tap":
        query = query.order_by(desc(User.tap_skill))
    
    users = await query.offset(skip).limit(limit).all()
    
    # Convert to leaderboard entries
    leaderboard = []
    for rank, user in enumerate(users, start=1):
        total_matches = user.wins + user.losses
        win_rate = (user.wins / total_matches * 100) if total_matches > 0 else 0
        
        leaderboard.append(
            LeaderboardEntry(
                rank=rank,
                user_id=user.id,
                display_name=user.display_name,
                photo_url=user.photo_url,
                skill_levels={
                    "apa": user.apa_skill,
                    "bca": user.bca_skill,
                    "tap": user.tap_skill
                },
                stats={
                    "wins": user.wins,
                    "losses": user.losses,
                    "win_rate": round(win_rate, 1),
                    "money_earned": user.money_earned
                }
            )
        )
    
    return leaderboard