from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class UserBase(BaseModel):
    email: EmailStr
    display_name: str
    photo_url: Optional[str] = None

class UserCreate(UserBase):
    clerk_id: str

class UserUpdate(BaseModel):
    display_name: Optional[str] = None
    photo_url: Optional[str] = None
    apa_skill: Optional[float] = None
    bca_skill: Optional[float] = None
    tap_skill: Optional[float] = None

class UserInDB(UserBase):
    id: int
    clerk_id: str
    apa_skill: float
    bca_skill: float
    tap_skill: float
    wins: int
    losses: int
    money_earned: float
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True