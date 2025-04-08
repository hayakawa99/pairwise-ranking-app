FROM python:3.10

WORKDIR /app

COPY ./app /app

RUN pip install fastapi uvicorn sqlalchemy psycopg2-binary python-dotenv

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
