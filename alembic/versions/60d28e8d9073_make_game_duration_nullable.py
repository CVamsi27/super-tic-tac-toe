"""make_game_duration_nullable

Revision ID: 60d28e8d9073
Revises: b8e3f4a12345
Create Date: 2025-11-21 19:22:09.636184

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '60d28e8d9073'
down_revision: Union[str, None] = 'b8e3f4a12345'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Make game_duration and points_earned nullable with default values
    op.alter_column('game_history', 'game_duration',
                    existing_type=sa.Integer(),
                    nullable=True,
                    server_default='0')
    op.alter_column('game_history', 'points_earned',
                    existing_type=sa.Integer(),
                    nullable=True,
                    server_default='0')


def downgrade() -> None:
    # Revert the changes
    op.alter_column('game_history', 'game_duration',
                    existing_type=sa.Integer(),
                    nullable=False,
                    server_default=None)
    op.alter_column('game_history', 'points_earned',
                    existing_type=sa.Integer(),
                    nullable=False,
                    server_default=None)
