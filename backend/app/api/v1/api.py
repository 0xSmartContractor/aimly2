from fastapi import APIRouter
from app.api.v1.endpoints import users, tournaments, challenges, shot_analysis

api_router = APIRouter()

api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(tournaments.router, prefix="/tournaments", tags=["tournaments"])
api_router.include_router(challenges.router, prefix="/challenges", tags=["challenges"])
api_router.include_router(shot_analysis.router, prefix="/shot-analysis", tags=["shot-analysis"])