from fastapi import FastAPI, HTTPException
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from .models import Course, CourseUpdate
from .config import Settings
from bson import ObjectId
import os
import logging
import traceback
from typing import List
import httpx

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Course Service")
settings = Settings()

# Configure CORS - make sure this comes before any routes
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://0.0.0.0:3000",
    "http://frontend:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Initialize MongoDB connection and HTTP client
mongodb_client: AsyncIOMotorClient = None
mongodb = None
http_client: httpx.AsyncClient = None

# Get student service URL from environment
STUDENT_SERVICE_URL = os.getenv("STUDENT_SERVICE_URL", "http://localhost:8000")

async def get_mongodb():
    """Get MongoDB database instance."""
    global mongodb_client, mongodb
    try:
        if mongodb_client is None:
            mongodb_url = os.getenv("MONGODB_URL", "mongodb://root:example@mongodb:27017/?authSource=admin")
            logger.info(f"Connecting to MongoDB at: {mongodb_url}")
            mongodb_client = AsyncIOMotorClient(mongodb_url)
            mongodb = mongodb_client[os.getenv("DATABASE_NAME", "course_db")]
            # Test the connection
            await mongodb_client.admin.command('ping')
            logger.info("Successfully connected to MongoDB!")
        return mongodb
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {str(e)}")
        logger.error(traceback.format_exc())
        if mongodb_client is not None:
            mongodb_client.close()
            mongodb_client = None
            mongodb = None
        raise e

@app.on_event("startup")
async def startup_db_client():
    """Initialize database connection and HTTP client on startup."""
    global http_client
    await get_mongodb()
    http_client = httpx.AsyncClient()

@app.on_event("shutdown")
async def shutdown_db_client():
    """Close database connection and HTTP client on shutdown."""
    global mongodb_client, http_client
    if mongodb_client is not None:
        mongodb_client.close()
        mongodb_client = None
        logger.info("Closed MongoDB connection")
    if http_client is not None:
        await http_client.aclose()
        http_client = None
        logger.info("Closed HTTP client")

@app.get("/health")
async def health_check():
    """Check service health including database connection."""
    try:
        db = await get_mongodb()
        await db.command("ping")
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        logger.error(traceback.format_exc())
        return JSONResponse(
            status_code=503,
            content={"status": "unhealthy", "database": "disconnected", "error": str(e)}
        )

@app.get("/courses/", response_model=List[Course])
async def list_courses():
    """List all courses."""
    try:
        db = await get_mongodb()
        logger.info("Fetching all courses")
        courses = await db["courses"].find().to_list(1000)
        
        # Convert courses to model instances
        course_list = []
        for course in courses:
            course_dict = dict(course)
            course_dict["_id"] = str(course_dict["_id"])  # Convert ObjectId to string
            course_list.append(Course(**course_dict))
        
        logger.info(f"Successfully fetched {len(courses)} courses")
        return course_list
    except Exception as e:
        logger.error(f"Error listing courses: {str(e)}")
        logger.error(traceback.format_exc())
        return JSONResponse(
            status_code=500,
            content={"detail": str(e)}
        )

@app.post("/courses/", response_model=Course)
async def create_course(course: Course):
    """Create a new course."""
    try:
        db = await get_mongodb()
        logger.info(f"Creating course: {course.dict()}")
        course_exists = await db["courses"].find_one({"code": course.code})
        if course_exists:
            raise HTTPException(400, "Course with this code already exists")
        
        course_dict = course.dict(exclude={"id"})
        new_course = await db["courses"].insert_one(course_dict)
        created_course = await db["courses"].find_one({"_id": new_course.inserted_id})
        
        if created_course:
            created_dict = dict(created_course)
            created_dict["_id"] = str(created_dict["_id"])  # Convert ObjectId to string
            logger.info(f"Successfully created course: {created_dict}")
            return Course(**created_dict)
        else:
            raise HTTPException(500, "Failed to create course")
    except Exception as e:
        logger.error(f"Error creating course: {str(e)}")
        logger.error(traceback.format_exc())
        return JSONResponse(
            status_code=500,
            content={"detail": str(e)}
        )

@app.get("/courses/{course_id}", response_model=Course)
async def get_course(course_id: str):
    """Get a specific course by ID."""
    try:
        db = await get_mongodb()
        logger.info(f"Fetching course with id: {course_id}")
        course = await db["courses"].find_one({"_id": ObjectId(course_id)})
        if not course:
            raise HTTPException(404, "Course not found")
        
        course_dict = dict(course)
        course_dict["_id"] = str(course_dict["_id"])  # Convert ObjectId to string
        return Course(**course_dict)
    except Exception as e:
        logger.error(f"Error getting course: {str(e)}")
        logger.error(traceback.format_exc())
        return JSONResponse(
            status_code=400,
            content={"detail": str(e)}
        )

@app.put("/courses/{course_id}", response_model=Course)
async def update_course(course_id: str, course_update: CourseUpdate):
    """Update a specific course by ID."""
    try:
        db = await get_mongodb()
        logger.info(f"Updating course {course_id} with data: {course_update.dict()}")
        course = await db["courses"].find_one({"_id": ObjectId(course_id)})
        if not course:
            raise HTTPException(404, "Course not found")
        
        update_result = await db["courses"].update_one(
            {"_id": ObjectId(course_id)}, 
            {"$set": course_update.dict(exclude_unset=True)}
        )
        
        if update_result.modified_count == 1:
            updated_course = await db["courses"].find_one({"_id": ObjectId(course_id)})
            updated_dict = dict(updated_course)
            updated_dict["_id"] = str(updated_dict["_id"])  # Convert ObjectId to string
            logger.info(f"Successfully updated course: {updated_dict}")
            return Course(**updated_dict)
        
        raise HTTPException(404, "Course update failed")
    except Exception as e:
        logger.error(f"Error updating course: {str(e)}")
        logger.error(traceback.format_exc())
        return JSONResponse(
            status_code=400,
            content={"detail": str(e)}
        )

@app.post("/courses/{course_id}/enroll/{student_id}")
async def enroll_student(course_id: str, student_id: str):
    """Enroll a student in a course."""
    try:
        db = await get_mongodb()
        logger.info(f"Enrolling student {student_id} in course {course_id}")
        
        # Check if course exists and has space
        course = await db["courses"].find_one({"_id": ObjectId(course_id)})
        if not course:
            raise HTTPException(404, "Course not found")
        
        # Convert to Course model
        course_model = Course.from_mongo(course)
        
        # Check if student is already enrolled
        if student_id in course_model.enrolled_students:
            raise HTTPException(400, "Student already enrolled in this course")
        
        # Check if course has space
        if len(course_model.enrolled_students) >= course_model.max_students:
            raise HTTPException(400, "Course is full")
        
        # Verify student exists by calling student service
        try:
            response = await http_client.get(f"{STUDENT_SERVICE_URL}/students/{student_id}")
            if response.status_code == 404:
                raise HTTPException(404, "Student not found")
            elif response.status_code != 200:
                raise HTTPException(500, "Error verifying student")
        except httpx.RequestError as e:
            logger.error(f"Error communicating with student service: {str(e)}")
            raise HTTPException(503, "Student service unavailable")
        
        # Add student to course
        update_result = await db["courses"].update_one(
            {"_id": ObjectId(course_id)},
            {"$addToSet": {"enrolled_students": student_id}}
        )
        
        if update_result.modified_count == 1:
            updated_course = await db["courses"].find_one({"_id": ObjectId(course_id)})
            updated_dict = dict(updated_course)
            updated_dict["_id"] = str(updated_dict["_id"])
            logger.info(f"Successfully enrolled student {student_id} in course {course_id}")
            return Course(**updated_dict)
        
        raise HTTPException(500, "Failed to enroll student")
    except Exception as e:
        logger.error(f"Error enrolling student: {str(e)}")
        logger.error(traceback.format_exc())
        return JSONResponse(
            status_code=400,
            content={"detail": str(e)}
        )

@app.get("/courses/{course_id}/validate-enrollment/{student_id}")
async def validate_enrollment(course_id: str, student_id: str):
    """Validate if a student is enrolled in a course."""
    try:
        db = await get_mongodb()
        logger.info(f"Validating enrollment for student {student_id} in course {course_id}")
        
        # Check if course exists
        course = await db["courses"].find_one({"_id": ObjectId(course_id)})
        if not course:
            raise HTTPException(404, "Course not found")
        
        # Convert to Course model
        course_model = Course.from_mongo(course)
        
        # Check if student is enrolled
        is_enrolled = student_id in course_model.enrolled_students
        
        # Verify student exists by calling student service
        try:
            response = await http_client.get(f"{STUDENT_SERVICE_URL}/students/{student_id}")
            if response.status_code == 404:
                return {"enrolled": False, "valid": False, "error": "Student not found"}
            elif response.status_code != 200:
                raise HTTPException(500, "Error verifying student")
            
            student_data = response.json()
            student_has_course = course_id in student_data.get("courses", [])
            
            return {
                "enrolled": is_enrolled,
                "student_has_course": student_has_course,
                "valid": is_enrolled == student_has_course
            }
            
        except httpx.RequestError as e:
            logger.error(f"Error communicating with student service: {str(e)}")
            raise HTTPException(503, "Student service unavailable")
            
    except Exception as e:
        logger.error(f"Error validating enrollment: {str(e)}")
        logger.error(traceback.format_exc())
        return JSONResponse(
            status_code=400,
            content={"detail": str(e)}
        )

@app.delete("/courses/{course_id}")
async def delete_course(course_id: str):
    """Delete a specific course by ID."""
    try:
        db = await get_mongodb()
        logger.info(f"Deleting course with id: {course_id}")
        delete_result = await db["courses"].delete_one({"_id": ObjectId(course_id)})
        if delete_result.deleted_count == 1:
            logger.info("Successfully deleted course")
            return {"status": "success"}
        
        raise HTTPException(404, "Course not found")
    except Exception as e:
        logger.error(f"Error deleting course: {str(e)}")
        logger.error(traceback.format_exc())
        return JSONResponse(
            status_code=400,
            content={"detail": str(e)}
        )