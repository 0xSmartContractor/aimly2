import pytest
from httpx import AsyncClient
from app.main import app
import base64

@pytest.mark.asyncio
async def test_analyze_shot(test_db):
    # Create a test image
    test_image = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
    image_bytes = base64.b64decode(test_image)
    
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/shot-analysis/analyze",
            files={"file": ("test.jpg", image_bytes, "image/jpeg")}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "feedback" in data
        assert data["success"] is True