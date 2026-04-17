# Karticle

Karticle is an MVP platform for single-article unlock payments on publisher websites.

## Monorepo layout

- `frontend/`: React + TypeScript + Vite widget app.
- `backend/`: FastAPI service for payment intent, webhook processing, and unlock verification.
- `client_exemple/`: static example publisher site with an article paywall and embedded widget iframe.
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

## Example publisher site

The `client_exemple/` folder contains a realistic article page that embeds the Karticle widget in an iframe and listens for unlock events from the widget.

To use it locally:

1. Run `npm run build:widget` to generate the iframe bundle.
2. Open `client_exemple/index.html` through a static web server.
3. The article page will reveal premium content after the iframe posts a `karticle:unlocked` message.
