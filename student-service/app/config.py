from pydantic import BaseSettings
import os

class Settings(BaseSettings):
    mongodb_url: str = os.getenv("MONGODB_URL", "mongodb://root:example@mongodb:27017/?authSource=admin")
    database_name: str = os.getenv("DATABASE_NAME", "student_db")

    class Config:
        env_file = ".env"