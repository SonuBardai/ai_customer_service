from ninja import Router, File
from ninja.files import UploadedFile
from ninja.schema import Schema
from typing import Optional
from django.contrib.auth import authenticate, login, logout
from django.http import HttpRequest
from ..models import User
from company.models import Company
import uuid

router = Router()


class UserCreateSchema(Schema):
    email: str
    password: str
    username: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    company_id: Optional[str] = None


class UserLoginSchema(Schema):
    email: str
    password: str


class UserResponseSchema(Schema):
    id: str
    email: str
    username: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    company_id: Optional[str] = None
    profile_picture_url: Optional[str] = None


@router.post("/register", response={201: UserResponseSchema, 400: dict})
def register_user(request, data: UserCreateSchema, profile_picture: Optional[UploadedFile] = File(None)):
    # Check if user with this email already exists
    if User.objects.filter(email=data.email).exists():
        return 400, {"detail": "User with this email already exists"}
    
    # Create new user
    user = User.objects.create_user(
        username=data.username,
        email=data.email,
        password=data.password,
        first_name=data.first_name or "",
        last_name=data.last_name or "",
    )
    
    # Associate with company if provided
    if data.company_id:
        try:
            company = Company.objects.get(id=uuid.UUID(data.company_id))
            user.company = company
            user.save()
        except Company.DoesNotExist:
            return 400, {"detail": "Company not found"}
        except ValueError:
            return 400, {"detail": "Invalid company ID format"}
    
    # Add profile picture if provided
    if profile_picture:
        user.profile_picture = profile_picture
        user.save()
    
    # Log the user in
    login(request, user)
    
    return 201, {
        "id": str(user.id),
        "email": user.email,
        "username": user.username,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "company_id": str(user.company.id) if user.company else None,
        "profile_picture_url": user.profile_picture.url if user.profile_picture else None,
    }


@router.post("/login", response={200: UserResponseSchema, 401: dict})
def login_user(request, data: UserLoginSchema):
    user = authenticate(request, email=data.email, password=data.password)
    
    if user is None:
        return 401, {"detail": "Invalid credentials"}
    
    login(request, user)
    
    return 200, {
        "id": str(user.id),
        "email": user.email,
        "username": user.username,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "company_id": str(user.company.id) if user.company else None,
        "profile_picture_url": user.profile_picture.url if user.profile_picture else None,
    }


@router.post("/logout", response={204: None})
def logout_user(request):
    logout(request)
    return 204, None


@router.get("/me", response={200: UserResponseSchema, 401: dict})
def get_current_user(request: HttpRequest):
    if not request.user.is_authenticated:
        return 401, {"detail": "Not authenticated"}
    
    user = request.user
    
    return 200, {
        "id": str(user.id),
        "email": user.email,
        "username": user.username,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "company_id": str(user.company.id) if user.company else None,
        "profile_picture_url": user.profile_picture.url if user.profile_picture else None,
    }
