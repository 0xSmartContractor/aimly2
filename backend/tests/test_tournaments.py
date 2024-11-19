import pytest
from httpx import AsyncClient
from app.main import app
from app.models.tournament import Tournament
from datetime import datetime, timedelta

@pytest.mark.asyncio
async def test_create_tournament(test_db):
    tournament_data = {
        "name": "Test Tournament",
        "description": "Test Description",
        "location": "Test Location",
        "director_id": 1,
        "format": "singles",
        "race_type": "standard",
        "race_to": 5,
        "entry_fee": 20.0,
        "max_players": 32,
        "start_date": (datetime.now() + timedelta(days=7)).isoformat()
    }
    
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/tournaments/",
            json=tournament_data
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == tournament_data["name"]
        assert data["format"] == tournament_data["format"]
        
        # Verify tournament was created in database
        tournament = await test_db.query(Tournament).filter(
            Tournament.name == tournament_data["name"]
        ).first()
        assert tournament is not None

@pytest.mark.asyncio
async def test_get_tournaments(test_db):
    # Create test tournaments
    tournaments = [
        Tournament(
            name=f"Tournament {i}",
            director_id=1,
            format="singles",
            race_type="standard",
            race_to=5,
            entry_fee=20.0,
            max_players=32,
            start_date=datetime.now() + timedelta(days=i)
        )
        for i in range(3)
    ]
    
    for t in tournaments:
        test_db.add(t)
    await test_db.commit()
    
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/api/v1/tournaments/")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 3