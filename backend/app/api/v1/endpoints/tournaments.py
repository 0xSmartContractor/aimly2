from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.base import get_db
from app.models.tournament import Tournament
from app.schemas.tournament import TournamentCreate, TournamentUpdate, TournamentInDB
from typing import List

router = APIRouter()

@router.post("/", response_model=TournamentInDB)
async def create_tournament(tournament: TournamentCreate, db: AsyncSession = Depends(get_db)):
    db_tournament = Tournament(**tournament.model_dump())
    db.add(db_tournament)
    await db.commit()
    await db.refresh(db_tournament)
    return db_tournament

@router.get("/", response_model=List[TournamentInDB])
async def read_tournaments(
    skip: int = 0,
    limit: int = 100,
    status: str = None,
    db: AsyncSession = Depends(get_db)
):
    query = db.query(Tournament)
    if status:
        query = query.filter(Tournament.status == status)
    tournaments = await query.offset(skip).limit(limit).all()
    return tournaments

@router.get("/{tournament_id}", response_model=TournamentInDB)
async def read_tournament(tournament_id: int, db: AsyncSession = Depends(get_db)):
    tournament = await db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if tournament is None:
        raise HTTPException(status_code=404, detail="Tournament not found")
    return tournament

@router.patch("/{tournament_id}", response_model=TournamentInDB)
async def update_tournament(
    tournament_id: int,
    tournament_update: TournamentUpdate,
    db: AsyncSession = Depends(get_db)
):
    db_tournament = await db.query(Tournament).filter(Tournament.id == tournament_id).first()
    if db_tournament is None:
        raise HTTPException(status_code=404, detail="Tournament not found")
        
    for field, value in tournament_update.model_dump(exclude_unset=True).items():
        setattr(db_tournament, field, value)
    
    await db.commit()
    await db.refresh(db_tournament)
    return db_tournament