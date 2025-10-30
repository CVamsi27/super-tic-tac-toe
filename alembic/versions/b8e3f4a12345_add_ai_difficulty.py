"""Add ai_difficulty to games

Revision ID: b8e3f4a12345
Revises: afd4c7319df4
Create Date: 2025-10-30 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b8e3f4a12345'
down_revision: Union[str, None] = 'afd4c7319df4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add ai_difficulty column to games table if it doesn't exist
    from sqlalchemy import inspect
    from alembic import op
    
    bind = op.get_bind()
    inspector = inspect(bind)
    columns = [col['name'] for col in inspector.get_columns('games')]
    
    if 'ai_difficulty' not in columns:
        op.add_column('games', sa.Column('ai_difficulty', sa.String(), nullable=True))


def downgrade() -> None:
    # Remove ai_difficulty column from games table
    from sqlalchemy import inspect
    from alembic import op
    
    bind = op.get_bind()
    inspector = inspect(bind)
    columns = [col['name'] for col in inspector.get_columns('games')]
    
    if 'ai_difficulty' in columns:
        op.drop_column('games', 'ai_difficulty')
