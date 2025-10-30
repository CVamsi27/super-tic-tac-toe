"""
Simple script to add ai_difficulty column to games table
"""
import sys
sys.path.insert(0, '/Users/vamsikrishnachandaluri/repos/super-tic-tac-toe/api')

from sqlalchemy import text
from db.database import engine

def add_ai_difficulty_column():
    with engine.connect() as conn:
        # Check if column exists
        result = conn.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='games' AND column_name='ai_difficulty'
        """))
        
        if result.fetchone() is None:
            # Column doesn't exist, add it
            conn.execute(text("ALTER TABLE games ADD COLUMN ai_difficulty VARCHAR"))
            conn.commit()
            print("✅ Added ai_difficulty column to games table")
        else:
            print("✅ ai_difficulty column already exists")

if __name__ == "__main__":
    add_ai_difficulty_column()
