# Karticle

Karticle is an MVP platform for single-article unlock payments on publisher websites.

## Monorepo layout

- `frontend/`: React + TypeScript + Vite widget app.
- `backend/`: FastAPI service for payment intent, webhook processing, and unlock verification.
- `docs/`: integration and architecture notes.

## Quick start

### Frontend

```bash
npm install
npm run dev:frontend
```

### Backend

```bash
cd backend
python -m venv .venv
# Windows (PowerShell): .venv\\Scripts\\Activate.ps1
# Bash: source .venv/Scripts/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Next milestone

Implement payment provider integration in `backend/app/services/payment_provider.py` and connect widget checkout flow.
