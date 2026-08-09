from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.database import Base, engine

from app.models.member import Member
from app.models.task import Task
from app.models.team import Team
from app.models.user import User

import app.routers.team as team
from app.routers.tasks import router as tasks_router


app = FastAPI(title="HackFlow API")


# Create database tables
Base.metadata.create_all(bind=engine)


# Routers
app.include_router(team.router)
app.include_router(tasks_router)


# Project paths
BASE_DIR = Path(__file__).resolve().parents[2]

FRONTEND_DIR = BASE_DIR / "frontend"


# Static files
app.mount(
    "/assets",
    StaticFiles(directory=FRONTEND_DIR / "assets"),
    name="assets"
)


# Home page
@app.get("/")
def home():
    return FileResponse(
        FRONTEND_DIR / "assets" / "pages" / "team.html"
    )


