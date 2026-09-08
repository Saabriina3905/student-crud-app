from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session

from database import engine, SessionLocal
import models
import schemas

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/")
def home():
    return {"message": "Student CRUD API is working"}


@app.post("/students")
def create_student(student: schemas.StudentCreate, db: Session = Depends(get_db)):
    new_student = models.Student(
        full_name=student.full_name,
        email=student.email,
        phone=student.phone,
        age=student.age
    )

    db.add(new_student)
    db.commit()
    db.refresh(new_student)

    return new_student
@app.get("/students")
def get_students(db: Session = Depends(get_db)):
    students = db.query(models.Student).all()
    return students
@app.put("/students/{student_id}")
def update_student(
    student_id: int,
    student: schemas.StudentCreate,
    db: Session = Depends(get_db)
):
    db_student = db.query(models.Student).filter(
        models.Student.id == student_id
    ).first()

    if not db_student:
        return {"message": "Student not found"}

    db_student.full_name = student.full_name
    db_student.email = student.email
    db_student.phone = student.phone
    db_student.age = student.age

    db.commit()
    db.refresh(db_student)

    return db_student
@app.delete("/students/{student_id}")
def delete_student(
    student_id: int,
    db: Session = Depends(get_db)
):
    db_student = db.query(models.Student).filter(
        models.Student.id == student_id
    ).first()

    if not db_student:
        return {"message": "Student not found"}

    db.delete(db_student)
    db.commit()

    return {"message": "Student deleted successfully"}