import pytest
from httpx import AsyncClient
from app.main import app
from app.models.user import User

@pytest.mark.asyncio
async def test_create_user(test_db):
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/users/",
            json={
                "email": "test@example.com",
                "display_name": "Test User",
                "clerk_id": "test_clerk_id"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "test@example.com"
        assert data["display_name"] == "Test User"
        
        # Verify user was created in database
        user = await test_db.query(User).filter(User.email == "test@example.com").first()
        assert user is not None
        assert user.clerk_id == "test_clerk_id"

@pytest.mark.asyncio
async def test_get_user(test_db):
    # Create test user
    user = User(
        email="get@example.com",
        display_name="Get User",
        clerk_id="get_clerk_id"
    )
    test_db.add(user)
    await test_db.commit()
    
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get(f"/api/v1/users/{user.id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "get@example.com"
        assert data["display_name"] == "Get User"

@pytest.mark.asyncio
async def test_update_user(test_db):
    # Create test user
    user = User(
        email="update@example.com",
        display_name="Update User",
        clerk_id="update_clerk_id"
    )
    test_db.add(user)
    await test_db.commit()
    
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.patch(
            f"/api/v1/users/{user.id}",
            json={
                "display_name": "Updated Name",
                "apa_skill": 5
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["display_name"] == "Updated Name"
        assert data["apa_skill"] == 5