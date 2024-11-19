from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.base import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate, UserInDB
from typing import List

router = APIRouter()

@router.post("/", response_model=UserInDB)
async def create_user(user: UserCreate, db: AsyncSession = Depends(get_db)):
    db_user = User(**user.model_dump())
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user

@router.get("/", response_model=List[UserInDB])
async def read_users(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    users = await db.query(User).offset(skip).limit(limit).all()
    return users

@router.get("/{user_id}", response_model=UserInDB)
async def read_user(user_id: int, db: AsyncSession = Depends(get_db)):
    user = await db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.patch("/{user_id}", response_model=UserInDB)
async def update_user(
    user_id: int, 
    user_update: UserUpdate, 
    db: AsyncSession = Depends(get_db)
):
    db_user = await db.query(User).filter(User.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
        
    for field, value in user_update.model_dump(exclude_unset=True).items():
        setattr(db_user, field, value)
    
    await db.commit()
    await db.refresh(db_user)
    return db_user