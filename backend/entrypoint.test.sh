#!/bin/bash
set -e

export DATABASE_URL=$(grep TEST_DATABASE_URL .env.test | cut -d '=' -f2-)
alembic upgrade head

exec bash
