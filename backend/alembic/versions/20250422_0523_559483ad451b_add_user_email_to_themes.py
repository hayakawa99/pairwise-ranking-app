"""add user_email to themes

Revision ID: 559483ad451b
Revises: 50c1faa4252f
Create Date: 2025‑04‑22 05:23:00
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "559483ad451b"
down_revision: Union[str, None] = "50c1faa4252f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # NULL 許容で追加
    op.add_column(
        "themes",
        sa.Column("user_email", sa.Text(), nullable=True)
    )


def downgrade() -> None:
    op.drop_column("themes", "user_email")