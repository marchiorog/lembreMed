from fastapi import FastAPI
from routers import bula_router


app = FastAPI()
app.include_router(bula_router.router)