# Register your models here.

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ("email", "username", "first_name", "last_name", "is_staff", "company")
    list_filter = ("is_staff", "is_superuser", "is_active", "company")
    search_fields = ("email", "username", "first_name", "last_name")
    ordering = ("email",)
    filter_horizontal = (
        "groups",
        "user_permissions",
    )
