from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.base import get_db
from app.core.config import settings
import stripe

router = APIRouter()
stripe.api_key = settings.STRIPE_SECRET_KEY

@router.post("/create-subscription")
async def create_subscription(user_id: str, db: AsyncSession = Depends(get_db)):
    try:
        # Create Stripe customer
        customer = stripe.Customer.create(
            metadata={
                "user_id": user_id
            }
        )
        
        # Create subscription
        subscription = stripe.Subscription.create(
            customer=customer.id,
            items=[{"price": settings.STRIPE_PRICE_ID}],
            payment_behavior="default_incomplete",
            expand=["latest_invoice.payment_intent"]
        )
        
        return {
            "subscriptionId": subscription.id,
            "clientSecret": subscription.latest_invoice.payment_intent.client_secret
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/webhook")
async def stripe_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    # Handle subscription events
    if event.type == "customer.subscription.created":
        subscription = event.data.object
        # Update user subscription status
        await update_user_subscription(
            subscription.metadata.user_id, 
            "active",
            db
        )
    
    return {"status": "success"}