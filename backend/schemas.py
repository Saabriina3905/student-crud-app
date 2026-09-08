from pydantic import BaseModel


class StudentCreate(BaseModel):
    full_name: str
    email: str
    phone: str | None = None
    age: int | None = None