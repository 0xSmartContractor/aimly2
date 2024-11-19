from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.base import get_db
from app.models.shot_analysis import ShotAnalysis
from app.core.config import settings
from openai import OpenAI
import base64

router = APIRouter()
client = OpenAI(api_key=settings.OPENAI_API_KEY)

@router.post("/analyze")
async def analyze_shot(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    # Read and encode image
    contents = await file.read()
    base64_image = base64.b64encode(contents).decode('utf-8')
    
    # Call GPT-4 Vision
    response = await client.chat.completions.create(
        model="gpt-4-vision-preview",
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "Analyze this pool shot image and provide feedback on: 1) Stance and alignment 2) Bridge hand position 3) Stroke mechanics 4) Follow-through"
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{base64_image}"
                        }
                    }
                ]
            }
        ],
        max_tokens=500
    )
    
    # Store analysis in database
    analysis = ShotAnalysis(
        feedback=response.choices[0].message.content,
        video_url=file.filename,  # In production, store in cloud storage
    )
    db.add(analysis)
    await db.commit()
    
    return {
        "feedback": response.choices[0].message.content,
        "success": True
    }