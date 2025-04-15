FROM python:3.10

WORKDIR /app

ENV PYTHONPATH=/app

RUN apt-get update && apt-get install -y tree

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY alembic.ini .
COPY ./alembic ./alembic
COPY ./app /app

RUN tree -I 'node_modules|__pycache__|*.pyc|.git' -a -L 3 > /app/directory_structure.txt

CMD ["./entrypoint.sh"]
