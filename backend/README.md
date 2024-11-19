# Aimly Backend

FastAPI backend for the Aimly pool analytics application.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
- Copy `.env.example` to `.env`
- Update the variables with your actual values

4. Initialize the database:
```bash
alembic upgrade head
```

5. Run the development server:
```bash
uvicorn app.main:app --reload
```

## Project Structure

```
backend/
├── alembic/              # Database migrations
├── app/
│   ├── api/             # API endpoints
│   │   └── v1/
│   ├── core/            # Core configurations
│   ├── db/              # Database setup
│   ├── models/          # SQLAlchemy models
│   └── schemas/         # Pydantic schemas
├── tests/               # Test files
├── .env                 # Environment variables
├── alembic.ini          # Alembic configuration
└── requirements.txt     # Project dependencies
```