from pydantic import BaseModel
import os

class Settings(BaseModel):
    mongodb_url: str = os.getenv("MONGODB_URL", "mongodb://root:example@mongodb:27017/?authSource=admin")
    database_name: str = os.getenv("DATABASE_NAME", "course_db")

    class Config:
        env_file = ".env"