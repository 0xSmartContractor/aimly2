# Aimly - Advanced Pool Analytics Platform

A comprehensive pool analytics and tournament management platform with AI-powered shot analysis.

## Project Structure

- `/mobile` - NativeScript mobile app with shot analysis features
- `/landing` - Next.js landing page and web dashboard
- `/backend` - FastAPI backend service

## Getting Started

### Mobile App (NativeScript)
```bash
cd mobile
npm install
ns run android # or ns run ios
```

### Landing Page (Next.js)
```bash
cd landing
npm install
npm run dev
```

### Backend (FastAPI)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Environment Variables

Create `.env` files in each directory:

### Backend
```env
DATABASE_URL=postgresql+asyncpg://user:password@your-neon-db-host/dbname
JWT_SECRET=your-secret-key
OPENAI_API_KEY=your-openai-key
```

### Landing Page
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
CLERK_PUBLISHABLE_KEY=your-clerk-key
CLERK_SECRET_KEY=your-clerk-secret
```

### Mobile App
```env
API_URL=http://localhost:8000
CLERK_PUBLISHABLE_KEY=your-clerk-key
```

## Features

- AI-powered shot analysis with pose detection
- Tournament management with Calcutta auctions
- Challenge system with money match tracking
- Leaderboard with multiple ranking systems
- Pool hall finder
- Comprehensive player statistics