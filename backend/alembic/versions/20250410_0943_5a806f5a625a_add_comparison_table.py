"""add comparison table

Revision ID: 5a806f5a625a
Revises: ed2456a72ff8
Create Date: 2025-04-10 09:43:24.259861

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '5a806f5a625a'
down_revision: Union[str, None] = 'ed2456a72ff8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    """Upgrade schema."""
    # テーブルは既に存在しているため作成しない
    pass

def downgrade() -> None:
    """Downgrade schema."""
    # テーブルが既に存在しているため削除もしない
    pass
