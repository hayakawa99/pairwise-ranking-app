import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

from app.main import app
from app.db.base import Base
from app.db.session import get_db

load_dotenv(dotenv_path=".env.test")
TEST_DATABASE_URL = os.getenv("TEST_DATABASE_URL")

engine = create_engine(TEST_DATABASE_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function", autouse=True)
def setup_and_teardown_db():
    with engine.begin() as conn:
        for table in reversed(Base.metadata.sorted_tables):
            conn.execute(table.delete())
    yield
    with engine.begin() as conn:
        for table in reversed(Base.metadata.sorted_tables):
            conn.execute(table.delete())

@pytest.fixture
def client():
    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)

@pytest.fixture
def fruit_theme(client):
    res = client.post("/api/themes", json={
        "title": "果物",
        "options": [
            {"label": "りんご", "rating": 1500.0},
            {"label": "バナナ", "rating": 1500.0}
        ]
    })
    assert res.status_code == 200
    return res.json()
