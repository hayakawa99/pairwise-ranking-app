FROM python:3.10

WORKDIR /app

COPY ./app /app

RUN pip install --no-cache-dir \
    fastapi \
    uvicorn \
    sqlalchemy \
    psycopg2-binary \
    python-dotenv \
    alembic

CMD ["bash", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
