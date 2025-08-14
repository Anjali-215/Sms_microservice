from pydantic import BaseModel, EmailStr
from typing import Optional, List
from bson import ObjectId

class PyObjectId(str):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not isinstance(v, (str, ObjectId)):
            raise ValueError("Invalid ObjectId")
        return str(v)

class Student(BaseModel):
    id: Optional[PyObjectId] = None
    first_name: str
    last_name: str
    email: EmailStr
    age: int
    grade: float
    courses: List[str] = []

    class Config:
        json_encoders = {ObjectId: str}
        allow_population_by_field_name = True

    @property
    def _id(self) -> str:
        return str(self.id) if self.id else None

class StudentUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    age: Optional[int] = None
    grade: Optional[float] = None
    courses: Optional[List[str]] = None