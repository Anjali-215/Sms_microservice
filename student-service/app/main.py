from fastapi import FastAPI, HTTPException
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from .models import Student, StudentUpdate
from .config import Settings
from bson import ObjectId
import os
import logging
import traceback
import httpx

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Student Service")
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

# Get course service URL from environment
COURSE_SERVICE_URL = os.getenv("COURSE_SERVICE_URL", "http://localhost:8001")

async def get_mongodb():
    """Get MongoDB database instance."""
    global mongodb_client, mongodb
    try:
        if mongodb_client is None:
            mongodb_url = os.getenv("MONGODB_URL", "mongodb://root:example@mongodb:27017/?authSource=admin")
            logger.info(f"Connecting to MongoDB at: {mongodb_url}")
            mongodb_client = AsyncIOMotorClient(mongodb_url)
            mongodb = mongodb_client[os.getenv("DATABASE_NAME", "student_db")]
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

@app.get("/students/", response_model=list[Student])
async def list_students():
    """List all students."""
    try:
        db = await get_mongodb()
        logger.info("Fetching all students")
        students = await db["students"].find().to_list(1000)
        
        # Convert ObjectId to string for each student
        for student in students:
            student["id"] = str(student["_id"])
        
        logger.info(f"Successfully fetched {len(students)} students")
        return students
    except Exception as e:
        logger.error(f"Error listing students: {str(e)}")
        logger.error(traceback.format_exc())
        return JSONResponse(
            status_code=500,
            content={"detail": str(e)}
        )

@app.post("/students/", response_model=Student)
async def create_student(student: Student):
    """Create a new student."""
    try:
        db = await get_mongodb()
        logger.info(f"Creating student: {student.dict()}")
        student_exists = await db["students"].find_one({"email": student.email})
        if student_exists:
            raise HTTPException(400, "Student with this email already exists")
        
        student_dict = student.dict(exclude_unset=True)
        if "_id" in student_dict:
            del student_dict["_id"]
        
        new_student = await db["students"].insert_one(student_dict)
        created_student = await db["students"].find_one({"_id": new_student.inserted_id})
        
        if created_student:
            created_student["id"] = str(created_student["_id"])
            logger.info(f"Successfully created student: {created_student}")
            return created_student
        else:
            raise HTTPException(500, "Failed to create student")
    except Exception as e:
        logger.error(f"Error creating student: {str(e)}")
        logger.error(traceback.format_exc())
        return JSONResponse(
            status_code=500,
            content={"detail": str(e)}
        )

@app.get("/students/{student_id}", response_model=Student)
async def get_student(student_id: str):
    """Get a specific student by ID."""
    try:
        db = await get_mongodb()
        logger.info(f"Fetching student with id: {student_id}")
        student = await db["students"].find_one({"_id": ObjectId(student_id)})
        if not student:
            raise HTTPException(404, "Student not found")
        student["id"] = str(student["_id"])
        return student
    except Exception as e:
        logger.error(f"Error getting student: {str(e)}")
        logger.error(traceback.format_exc())
        return JSONResponse(
            status_code=400,
            content={"detail": str(e)}
        )

@app.put("/students/{student_id}", response_model=Student)
async def update_student(student_id: str, student_update: StudentUpdate):
    """Update a specific student by ID."""
    try:
        db = await get_mongodb()
        logger.info(f"Updating student {student_id} with data: {student_update.dict()}")
        student = await db["students"].find_one({"_id": ObjectId(student_id)})
        if not student:
            raise HTTPException(404, "Student not found")
        
        update_result = await db["students"].update_one(
            {"_id": ObjectId(student_id)}, 
            {"$set": student_update.dict(exclude_unset=True)}
        )
        
        if update_result.modified_count == 1:
            updated_student = await db["students"].find_one({"_id": ObjectId(student_id)})
            updated_student["id"] = str(updated_student["_id"])
            logger.info(f"Successfully updated student: {updated_student}")
            return updated_student
        
        raise HTTPException(404, "Student update failed")
    except Exception as e:
        logger.error(f"Error updating student: {str(e)}")
        logger.error(traceback.format_exc())
        return JSONResponse(
            status_code=400,
            content={"detail": str(e)}
        )

@app.post("/students/{student_id}/register/{course_id}")
async def register_course(student_id: str, course_id: str):
    """Register a student for a course."""
    try:
        db = await get_mongodb()
        logger.info(f"Registering student {student_id} for course {course_id}")
        
        # Check if student exists
        student = await db["students"].find_one({"_id": ObjectId(student_id)})
        if not student:
            return JSONResponse(
                status_code=404,
                content={"detail": "Student not found"},
                headers={
                    "Access-Control-Allow-Origin": "http://localhost:3000",
                    "Access-Control-Allow-Credentials": "true"
                }
            )
        
        # Check if student is already registered for this course
        if course_id in student.get("courses", []):
            return JSONResponse(
                status_code=400,
                content={"detail": "Student already registered for this course"},
                headers={
                    "Access-Control-Allow-Origin": "http://localhost:3000",
                    "Access-Control-Allow-Credentials": "true"
                }
            )
        
        # Call course service to enroll student
        try:
            response = await http_client.post(f"{COURSE_SERVICE_URL}/courses/{course_id}/enroll/{student_id}")
            if response.status_code == 404:
                return JSONResponse(
                    status_code=404,
                    content={"detail": "Course not found"},
                    headers={
                        "Access-Control-Allow-Origin": "http://localhost:3000",
                        "Access-Control-Allow-Credentials": "true"
                    }
                )
            elif response.status_code == 400:
                return JSONResponse(
                    status_code=400,
                    content={"detail": response.json().get("detail", "Error enrolling in course")},
                    headers={
                        "Access-Control-Allow-Origin": "http://localhost:3000",
                        "Access-Control-Allow-Credentials": "true"
                    }
                )
            elif response.status_code != 200:
                return JSONResponse(
                    status_code=500,
                    content={"detail": "Error enrolling in course"},
                    headers={
                        "Access-Control-Allow-Origin": "http://localhost:3000",
                        "Access-Control-Allow-Credentials": "true"
                    }
                )
        except httpx.RequestError as e:
            logger.error(f"Error communicating with course service: {str(e)}")
            return JSONResponse(
                status_code=503,
                content={"detail": "Course service unavailable"},
                headers={
                    "Access-Control-Allow-Origin": "http://localhost:3000",
                    "Access-Control-Allow-Credentials": "true"
                }
            )
        
        # Add course to student's courses list
        update_result = await db["students"].update_one(
            {"_id": ObjectId(student_id)},
            {"$addToSet": {"courses": course_id}}
        )
        
        if update_result.modified_count == 1:
            updated_student = await db["students"].find_one({"_id": ObjectId(student_id)})
            # Convert ObjectId to string for JSON serialization
            updated_student_dict = dict(updated_student)
            updated_student_dict["id"] = str(updated_student_dict["_id"])
            del updated_student_dict["_id"]  # Remove the ObjectId field
            logger.info(f"Successfully registered student {student_id} for course {course_id}")
            return JSONResponse(
                status_code=200,
                content=updated_student_dict,
                headers={
                    "Access-Control-Allow-Origin": "http://localhost:3000",
                    "Access-Control-Allow-Credentials": "true"
                }
            )
        
        return JSONResponse(
            status_code=500,
            content={"detail": "Failed to register for course"},
            headers={
                "Access-Control-Allow-Origin": "http://localhost:3000",
                "Access-Control-Allow-Credentials": "true"
            }
        )
    except Exception as e:
        logger.error(f"Error registering for course: {str(e)}")
        logger.error(traceback.format_exc())
        # Convert error message to string and handle ObjectId if present
        error_msg = str(e)
        if "ObjectId" in error_msg:
            error_msg = "Internal server error"
        return JSONResponse(
            status_code=500,
            content={"detail": error_msg},
            headers={
                "Access-Control-Allow-Origin": "http://localhost:3000",
                "Access-Control-Allow-Credentials": "true"
            }
        )

@app.get("/students/{student_id}/validate-courses")
async def validate_courses(student_id: str):
    """Validate all course registrations for a student."""
    try:
        db = await get_mongodb()
        logger.info(f"Validating course registrations for student {student_id}")
        
        # Check if student exists
        student = await db["students"].find_one({"_id": ObjectId(student_id)})
        if not student:
            raise HTTPException(404, "Student not found")
        
        student_courses = student.get("courses", [])
        validation_results = []
        
        # Check each course
        for course_id in student_courses:
            try:
                response = await http_client.get(
                    f"{COURSE_SERVICE_URL}/courses/{course_id}/validate-enrollment/{student_id}"
                )
                if response.status_code == 200:
                    validation_data = response.json()
                    validation_results.append({
                        "course_id": course_id,
                        "status": "valid" if validation_data.get("valid", False) else "invalid",
                        "details": validation_data
                    })
                else:
                    validation_results.append({
                        "course_id": course_id,
                        "status": "error",
                        "error": f"Course service returned status {response.status_code}"
                    })
            except httpx.RequestError as e:
                validation_results.append({
                    "course_id": course_id,
                    "status": "error",
                    "error": str(e)
                })
        
        return {
            "student_id": student_id,
            "registered_courses": student_courses,
            "validation_results": validation_results
        }
            
    except Exception as e:
        logger.error(f"Error validating courses: {str(e)}")
        logger.error(traceback.format_exc())
        return JSONResponse(
            status_code=400,
            content={"detail": str(e)}
        )

@app.delete("/students/{student_id}")
async def delete_student(student_id: str):
    """Delete a specific student by ID."""
    try:
        db = await get_mongodb()
        logger.info(f"Deleting student with id: {student_id}")
        delete_result = await db["students"].delete_one({"_id": ObjectId(student_id)})
        if delete_result.deleted_count == 1:
            logger.info("Successfully deleted student")
            return {"status": "success"}
        
        raise HTTPException(404, "Student not found")
    except Exception as e:
        logger.error(f"Error deleting student: {str(e)}")
        logger.error(traceback.format_exc())
        return JSONResponse(
            status_code=400,
            content={"detail": str(e)}
        )