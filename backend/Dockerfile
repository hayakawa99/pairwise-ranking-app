FROM python:3.10

WORKDIR /app

ENV PYTHONPATH=/app

RUN apt-get update && apt-get install -y tree

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/alembic.ini .
COPY backend/alembic ./backend/alembic
COPY backend/app ./backend/app
COPY frontend ./frontend

RUN tree /app/backend /app/frontend -I 'node_modules|.next|__pycache__|*.pyc|.git' -a -L 4 > /app/directory_structure.txt

CMD ["./entrypoint.sh"]
