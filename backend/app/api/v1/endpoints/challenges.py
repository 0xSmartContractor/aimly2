from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.base import get_db
from app.models.challenge import Challenge
from app.schemas.challenge import ChallengeCreate, ChallengeUpdate, ChallengeInDB
from typing import List

router = APIRouter()

@router.post("/", response_model=ChallengeInDB)
async def create_challenge(challenge: ChallengeCreate, db: AsyncSession = Depends(get_db)):
    db_challenge = Challenge(**challenge.model_dump())
    db.add(db_challenge)
    await db.commit()
    await db.refresh(db_challenge)
    return db_challenge

@router.get("/", response_model=List[ChallengeInDB])
async def read_challenges(
    skip: int = 0,
    limit: int = 100,
    user_id: int = None,
    status: str = None,
    db: AsyncSession = Depends(get_db)
):
    query = db.query(Challenge)
    if user_id:
        query = query.filter(
            (Challenge.challenger_id == user_id) | 
            (Challenge.challengee_id == user_id)
        )
    if status:
        query = query.filter(Challenge.status == status)
    challenges = await query.offset(skip).limit(limit).all()
    return challenges

@router.get("/{challenge_id}", response_model=ChallengeInDB)
async def read_challenge(challenge_id: int, db: AsyncSession = Depends(get_db)):
    challenge = await db.query(Challenge).filter(Challenge.id == challenge_id).first()
    if challenge is None:
        raise HTTPException(status_code=404, detail="Challenge not found")
    return challenge

@router.patch("/{challenge_id}", response_model=ChallengeInDB)
async def update_challenge(
    challenge_id: int,
    challenge_update: ChallengeUpdate,
    db: AsyncSession = Depends(get_db)
):
    db_challenge = await db.query(Challenge).filter(Challenge.id == challenge_id).first()
    if db_challenge is None:
        raise HTTPException(status_code=404, detail="Challenge not found")
        
    for field, value in challenge_update.model_dump(exclude_unset=True).items():
        setattr(db_challenge, field, value)
    
    await db.commit()
    await db.refresh(db_challenge)
    return db_challenge