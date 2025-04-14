FROM python:3.10

WORKDIR /app

ENV PYTHONPATH=/app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY alembic.ini .
COPY ./alembic ./alembic
COPY ./app /app

CMD ["./entrypoint.sh"]
