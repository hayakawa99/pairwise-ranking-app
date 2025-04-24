"""merge heads

Revision ID: 7984ace229c2
Revises: 559483ad451b, 23fedc8164e2
Create Date: 2025-04-24 14:58:14.585503

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7984ace229c2'
down_revision: Union[str, None] = ('559483ad451b', '23fedc8164e2')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
