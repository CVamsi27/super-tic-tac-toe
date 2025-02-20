from api.db.models import Base
from sqlalchemy import create_engine
import os
from dotenv import load_dotenv

load_dotenv()

path = os.getenv("DATABASE_URL")
engine = create_engine(path, echo=True)
Base.metadata.create_all(engine)