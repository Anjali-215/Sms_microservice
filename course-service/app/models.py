from pydantic import BaseModel, Field
from typing import Optional, List
from bson import ObjectId

class PyObjectId(str):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v, info=None):
        try:
            if isinstance(v, ObjectId):
                return str(v)
            elif isinstance(v, str):
                return v
            elif isinstance(v, dict) and "_id" in v:
                return str(v["_id"])
        except Exception:
            raise ValueError("Invalid ObjectId")
        raise ValueError("Invalid ObjectId")

class Course(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    code: str
    name: str
    description: str
    credits: int
    instructor: str
    max_students: int
    enrolled_students: List[str] = []

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {
            ObjectId: str
        }

    @classmethod
    def from_mongo(cls, data):
        """Convert MongoDB result to Course model."""
        if not data:
            return None
        
        data_dict = dict(data)
        if "_id" in data_dict:
            data_dict["_id"] = str(data_dict["_id"])  # Use _id instead of id
        return cls(**data_dict)

class CourseUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    credits: Optional[int] = None
    instructor: Optional[str] = None
    max_students: Optional[int] = None
    enrolled_students: Optional[List[str]] = None