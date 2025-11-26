"""Merge migration heads

Revision ID: 1d24b0078809
Revises: 60d28e8d9073, c1d2e3f4g5h6
Create Date: 2025-11-26 23:33:11.623479

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1d24b0078809'
down_revision: Union[str, None] = ('60d28e8d9073', 'c1d2e3f4g5h6')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
