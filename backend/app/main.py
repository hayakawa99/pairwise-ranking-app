from fastapi import FastAPI
from pydantic import BaseModel
from typing import List

app = FastAPI()

class Option(BaseModel):
    id: int
    label: str
    rating: float

class Theme(BaseModel):
    id: int
    title: str
    options: List[Option]

themes_db: List[Theme] = []

@app.post("/api/themes")
def create_theme(theme: Theme):
    themes_db.append(theme)
    return {"status": "ok"}

@app.get("/api/themes")
def list_themes():
    return themes_db

