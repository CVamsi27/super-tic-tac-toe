"""Add performance indexes

Revision ID: c1d2e3f4g5h6
Revises: b8e3f4a12345
Create Date: 2025-11-26 22:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c1d2e3f4g5h6'
down_revision: Union[str, None] = 'b8e3f4a12345'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add index on users.points for leaderboard queries
    op.create_index('ix_users_points', 'users', ['points'], unique=False)
    
    # Add index on game_history.result for filtering
    op.create_index('ix_game_history_result', 'game_history', ['result'], unique=False)
    
    # Add index on game_history.created_at for sorting
    op.create_index('ix_game_history_created_at', 'game_history', ['created_at'], unique=False)
    
    # Add composite index for user history queries
    op.create_index('ix_game_history_user_created', 'game_history', ['user_id', 'created_at'], unique=False)


def downgrade() -> None:
    op.drop_index('ix_game_history_user_created', table_name='game_history')
    op.drop_index('ix_game_history_created_at', table_name='game_history')
    op.drop_index('ix_game_history_result', table_name='game_history')
    op.drop_index('ix_users_points', table_name='users')
