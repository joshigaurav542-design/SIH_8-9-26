from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import router as api_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=(
        "Backend ecosystem for SIH 2026 Problem Statement SIH26090: "
        "AI-Driven Market Linkage and Smart Cataloguing Mobile Application for Marginalized Artisans. "
        "Developed by Team Bro Code."
    ),
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS for Vite Frontend and Mobile Web clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permits local dev and mobile simulators
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount primary routes
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "message": "Welcome to Smart Artisan Companion API (SIH 2026)",
        "problem_statement": settings.SIH_PROBLEM_ID,
        "team": settings.TEAM_NAME,
        "docs": "/docs",
        "api_v1": settings.API_V1_STR
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
