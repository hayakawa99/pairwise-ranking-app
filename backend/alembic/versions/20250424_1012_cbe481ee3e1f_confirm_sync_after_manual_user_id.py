"""confirm sync after manual user_id

Revision ID: cbe481ee3e1f
Revises: b6dfaca0c28a
Create Date: 2025-04-24 10:12:54.422089
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'cbe481ee3e1f'
down_revision: Union[str, None] = 'b6dfaca0c28a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column("themes", sa.Column("user_id", sa.Integer(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("themes", "user_id")
