import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.routers import admin, auth, users, itineraries, activities, communities, reviews

logger = logging.getLogger("locavio")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Locavio API started")
    yield


app = FastAPI(
    title="Locavio API",
    version="1.0.0",
    description="AI-powered location planner",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={"detail": "Resource not found"},
    )


@app.exception_handler(422)
async def validation_error_handler(request: Request, exc):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": exc.errors() if hasattr(exc, "errors") else str(exc)},
    )


app.include_router(auth.router)
app.include_router(users.router)
app.include_router(itineraries.router)
app.include_router(activities.router)
app.include_router(communities.router)
app.include_router(reviews.router)
app.include_router(admin.router)


@app.get("/")
async def root():
    return {"message": "Welcome to Locavio API", "docs": "/docs"}
