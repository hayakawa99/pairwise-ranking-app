from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = 'b6dfaca0c28a'
down_revision: Union[str, None] = '5e0500673eaa'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # すでに手動または別マイグレーションで追加済みなので空
    pass

def downgrade() -> None:
    # downgrade時に drop_column すると壊れるので空
    pass
